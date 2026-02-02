"""Config flow for vpmobile24 integration."""
from __future__ import annotations

import logging
from typing import Any
from datetime import date, timedelta

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.data_entry_flow import FlowResult

from .api_new import Stundenplan24API
from .const import CONF_SCHOOL_ID, CONF_CLASS_NAME, CONF_EXCLUDED_SUBJECTS, DEFAULT_BASE_URL, DOMAIN

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_SCHOOL_ID): str,
        vol.Required(CONF_USERNAME): str,
        vol.Required(CONF_PASSWORD): str,
        vol.Required(CONF_CLASS_NAME): str,
    }
)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for vpmobile24."""

    VERSION = 1

    def __init__(self):
        """Initialize the config flow."""
        self._api = None
        self._config_data = {}
        self._available_subjects = []

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                # Test the connection
                self._api = Stundenplan24API(
                    school_id=user_input[CONF_SCHOOL_ID],
                    username=user_input[CONF_USERNAME],
                    password=user_input[CONF_PASSWORD],
                    base_url=DEFAULT_BASE_URL,
                )
                
                connection_ok = await self._api.async_test_connection()
                
                if not connection_ok:
                    errors["base"] = "cannot_connect"
                else:
                    # Store config data for next step
                    self._config_data = user_input.copy()
                    
                    # Always try to get subjects for the specified class
                    try:
                        # Get subjects from multiple days to get all available subjects
                        all_subjects = set()
                        today = date.today()
                        
                        _LOGGER.info(f"Fetching subjects for class {user_input[CONF_CLASS_NAME]}")
                        
                        # Check multiple weeks (21 days forward + 7 days back) to find all subjects
                        for i in range(-7, 21):
                            try:
                                check_date = today + timedelta(days=i)
                                _LOGGER.debug(f"Checking date {check_date}")
                                
                                schedule_data = await self._api.async_get_schedule(
                                    target_date=check_date, 
                                    class_name=user_input[CONF_CLASS_NAME]
                                )
                                
                                for lesson in schedule_data.get("lessons", []):
                                    if lesson.get("subject") and lesson["subject"].strip():
                                        # Filter out non-subject entries
                                        subject = lesson["subject"].strip()
                                        # More inclusive filtering - exclude obvious non-subjects
                                        if (subject and 
                                            not subject.startswith("KPL") and 
                                            not subject.startswith("---") and
                                            not subject.startswith("Pause") and
                                            not subject.startswith("Mittagspause") and
                                            not subject.lower().startswith("frei") and
                                            len(subject) >= 2 and
                                            len(subject) <= 10):  # Allow longer subject names
                                            all_subjects.add(subject)
                                            _LOGGER.debug(f"Found subject: {subject}")
                                
                                for change in schedule_data.get("changes", []):
                                    if change.get("subject") and change["subject"].strip():
                                        subject = change["subject"].strip()
                                        # Same inclusive filtering for changes
                                        if (subject and 
                                            not subject.startswith("KPL") and 
                                            not subject.startswith("---") and
                                            not subject.startswith("Pause") and
                                            not subject.startswith("Mittagspause") and
                                            not subject.lower().startswith("frei") and
                                            len(subject) >= 2 and
                                            len(subject) <= 10):  # Allow longer subject names
                                            all_subjects.add(subject)
                                            _LOGGER.debug(f"Found subject in changes: {subject}")
                                            
                            except Exception as e:
                                _LOGGER.debug(f"Could not fetch schedule for {check_date}: {e}")
                                # Don't log weekend errors as warnings
                                if check_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                                    _LOGGER.debug(f"Weekend date {check_date} - no schedule expected")
                                continue
                        
                        self._available_subjects = sorted(list(all_subjects))
                        _LOGGER.info(f"Found subjects for class {user_input[CONF_CLASS_NAME]}: {self._available_subjects}")
                        
                        # Always go to subject selection step if we have a class, even if no subjects found
                        if self._available_subjects:
                            # Close API before going to next step
                            await self._api.async_close()
                            return await self.async_step_subjects()
                        else:
                            # No subjects found, but still show the step with a message
                            _LOGGER.warning(f"No subjects found for class {user_input[CONF_CLASS_NAME]}")
                            await self._api.async_close()
                            return await self.async_step_subjects()
                            
                    except Exception as e:
                        _LOGGER.error("Error fetching subjects: %s", e)
                        # Even if there's an error, continue without subject filtering
                        await self._api.async_close()
                        return self.async_create_entry(
                            title=f"VpMobile24 ({user_input[CONF_SCHOOL_ID]})",
                            data=self._config_data,
                        )
                    
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            finally:
                if self._api:
                    await self._api.async_close()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_SCHOOL_ID, description={"suggested_value": user_input.get(CONF_SCHOOL_ID, "") if user_input else ""}): str,
                vol.Required(CONF_USERNAME, description={"suggested_value": user_input.get(CONF_USERNAME, "") if user_input else ""}): str,
                vol.Required(CONF_PASSWORD): str,
                vol.Required(CONF_CLASS_NAME, description={"suggested_value": user_input.get(CONF_CLASS_NAME, "") if user_input else ""}): str,
            }),
            errors=errors,
            description_placeholders={
                CONF_SCHOOL_ID: "Schulnummer",
                CONF_USERNAME: "Nutzername",
                CONF_PASSWORD: "Passwort",
                CONF_CLASS_NAME: "Klasse (z.B. 5a)",
            }
        )

    async def async_step_subjects(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the subject selection step."""
        _LOGGER.info(f"Subject selection step called with {len(self._available_subjects)} subjects")
        
        if user_input is not None:
            _LOGGER.info(f"User submitted subject selection: {user_input}")
            # Add excluded subjects to config
            excluded_subjects = []
            for subject in self._available_subjects:
                if not user_input.get(subject, True):  # Use subject name directly as key
                    excluded_subjects.append(subject)
            
            _LOGGER.info(f"Excluded subjects: {excluded_subjects}")
            
            if excluded_subjects:
                self._config_data[CONF_EXCLUDED_SUBJECTS] = excluded_subjects
            
            # Go to language selection step
            return await self.async_step_language()

        # If no subjects found, show message and allow to continue
        if not self._available_subjects:
            _LOGGER.warning("No subjects available, showing empty form")
            return self.async_show_form(
                step_id="subjects",
                data_schema=vol.Schema({
                    vol.Optional("continue", default=True): bool
                }),
                description_placeholders={
                    "class_name": self._config_data.get(CONF_CLASS_NAME, ''),
                    "subject_count": "0",
                }
            )

        # Create schema for subject selection - use subject names directly
        _LOGGER.info(f"Creating form with subjects: {self._available_subjects}")
        schema_dict = {}
        for subject in self._available_subjects:
            schema_dict[vol.Optional(subject, default=True)] = bool

        return self.async_show_form(
            step_id="subjects",
            data_schema=vol.Schema(schema_dict),
            description_placeholders={
                "class_name": self._config_data.get(CONF_CLASS_NAME, ''),
                "subject_count": str(len(self._available_subjects)),
            }
        )

    async def async_step_language(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the language selection step."""
        if user_input is not None:
            # Store language preference
            self._config_data["language"] = user_input.get("language", "en")
            
            # Create entry
            return self.async_create_entry(
                title=f"VpMobile24 ({self._config_data[CONF_SCHOOL_ID]})",
                data=self._config_data,
            )

        # Language selection form
        return self.async_show_form(
            step_id="language",
            data_schema=vol.Schema({
                vol.Optional("language", default="en"): vol.In({
                    "en": "English",
                    "de": "Deutsch", 
                    "fr": "Français"
                })
            }),
            description_placeholders={
                "class_name": self._config_data.get(CONF_CLASS_NAME, ''),
            }
        )