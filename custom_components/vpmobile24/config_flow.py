"""Config flow for vpmobile24 integration."""
from __future__ import annotations

import logging
from typing import Any
from datetime import date, timedelta

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback

from .api_new import Stundenplan24API
from .const import (
    CONF_SCHOOL_ID,
    CONF_CLASS_NAME,
    CONF_EXCLUDED_SUBJECTS,
    CONF_USERNAME,
    CONF_PASSWORD,
    DEFAULT_BASE_URL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

# Compatibility: ConfigFlowResult was added in HA 2024.x
try:
    from homeassistant.config_entries import ConfigFlowResult
except ImportError:
    from homeassistant.data_entry_flow import FlowResult as ConfigFlowResult  # type: ignore[assignment]

# Subjects that should never appear in the selection list
_SUBJECT_BLOCKLIST = {"KPL", "---", "Pause", "Mittagspause"}


def _is_valid_subject(subject: str) -> bool:
    """Return True if the subject string is worth showing to the user."""
    s = subject.strip()
    if not s or len(s) < 2 or len(s) > 10:
        return False
    if s.lower().startswith("frei"):
        return False
    for blocked in _SUBJECT_BLOCKLIST:
        if s.startswith(blocked):
            return False
    return True


async def _fetch_subjects(api: Stundenplan24API, class_name: str) -> list[str]:
    """Fetch all subjects for *class_name* from the past 7 and next 21 days."""
    all_subjects: set[str] = set()
    today = date.today()
    for i in range(-7, 22):
        try:
            check_date = today + timedelta(days=i)
            schedule_data = await api.async_get_schedule(
                target_date=check_date,
                class_name=class_name,
            )
            for entry in schedule_data.get("lessons", []) + schedule_data.get("changes", []):
                subject = (entry.get("subject") or "").strip()
                if _is_valid_subject(subject):
                    all_subjects.add(subject)
        except Exception:
            continue
    return sorted(all_subjects)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for vpmobile24."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> OptionsFlowHandler:
        """Return the options flow handler."""
        return OptionsFlowHandler(config_entry)

    def __init__(self) -> None:
        """Initialize config flow."""
        self._api: Stundenplan24API | None = None
        self._config_data: dict[str, Any] = {}
        self._available_subjects: list[str] = []

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 1 - credentials + class name."""
        errors: dict[str, str] = {}

        if user_input is not None:
            api = None
            try:
                api = Stundenplan24API(
                    school_id=user_input[CONF_SCHOOL_ID],
                    username=user_input[CONF_USERNAME],
                    password=user_input[CONF_PASSWORD],
                    base_url=DEFAULT_BASE_URL,
                )

                if not await api.async_test_connection():
                    errors["base"] = "cannot_connect"
                else:
                    self._config_data.update(user_input)
                    try:
                        self._available_subjects = await _fetch_subjects(
                            api, user_input[CONF_CLASS_NAME]
                        )
                        await api.async_close()
                        return await self.async_step_subjects()
                    except Exception as err:
                        _LOGGER.error("Error fetching subjects: %s", err)
                        await api.async_close()
                        class_name = user_input[CONF_CLASS_NAME]
                        school_id = user_input[CONF_SCHOOL_ID]
                        await self.async_set_unique_id(f"{school_id}_{class_name}")
                        self._abort_if_unique_id_configured()
                        return self.async_create_entry(
                            title=f"VpMobile24 \u2013 {class_name} ({school_id})",
                            data=self._config_data,
                        )
            except Exception:
                _LOGGER.exception("Unexpected exception in config flow")
                errors["base"] = "unknown"
                if api:
                    await api.async_close()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_SCHOOL_ID): str,
                    vol.Required(CONF_USERNAME): str,
                    vol.Required(CONF_PASSWORD): str,
                    vol.Required(CONF_CLASS_NAME): str,
                }
            ),
            errors=errors,
        )

    async def async_step_subjects(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 2 - choose which subjects to include."""
        if user_input is not None:
            excluded = [
                s for s in self._available_subjects if not user_input.get(s, True)
            ]
            if excluded:
                self._config_data[CONF_EXCLUDED_SUBJECTS] = excluded

            class_name = self._config_data.get(CONF_CLASS_NAME, "")
            school_id = self._config_data.get(CONF_SCHOOL_ID, "")
            await self.async_set_unique_id(f"{school_id}_{class_name}")
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=f"VpMobile24 \u2013 {class_name} ({school_id})",
                data=self._config_data,
            )

        if not self._available_subjects:
            return self.async_show_form(
                step_id="subjects",
                data_schema=vol.Schema(
                    {vol.Optional("continue", default=True): bool}
                ),
                description_placeholders={"subject_count": "0"},
            )

        schema_dict = {
            vol.Optional(s, default=True): bool for s in self._available_subjects
        }
        return self.async_show_form(
            step_id="subjects",
            data_schema=vol.Schema(schema_dict),
            description_placeholders={
                "subject_count": str(len(self._available_subjects))
            },
        )


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Options flow - change class and/or excluded subjects after initial setup."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize."""
        self._config_entry = config_entry
        self._available_subjects: list[str] = []
        self._new_class_name: str = ""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 1 - choose: adjust subjects only, or also change the class."""
        if user_input is not None:
            if user_input.get("change_class", False):
                return await self.async_step_change_class()
            # Keep current class, reload subjects
            self._new_class_name = (
                self._config_entry.options.get(CONF_CLASS_NAME)
                or self._config_entry.data.get(CONF_CLASS_NAME, "")
            )
            return await self._load_subjects_and_show()

        current_class = (
            self._config_entry.options.get(CONF_CLASS_NAME)
            or self._config_entry.data.get(CONF_CLASS_NAME, "")
        )
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {vol.Optional("change_class", default=False): bool}
            ),
            description_placeholders={"current_class": current_class},
        )

    async def async_step_change_class(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 1b - enter a new class name."""
        if user_input is not None:
            self._new_class_name = user_input.get(CONF_CLASS_NAME, "").strip()
            return await self._load_subjects_and_show()

        current_class = (
            self._config_entry.options.get(CONF_CLASS_NAME)
            or self._config_entry.data.get(CONF_CLASS_NAME, "")
        )
        return self.async_show_form(
            step_id="change_class",
            data_schema=vol.Schema(
                {vol.Required(CONF_CLASS_NAME, default=current_class): str}
            ),
            errors={},
        )

    async def _load_subjects_and_show(self) -> ConfigFlowResult:
        """Fetch subjects for self._new_class_name, then show subject step."""
        api = None
        try:
            api = Stundenplan24API(
                school_id=self._config_entry.data[CONF_SCHOOL_ID],
                username=self._config_entry.data[CONF_USERNAME],
                password=self._config_entry.data[CONF_PASSWORD],
                base_url=DEFAULT_BASE_URL,
            )
            self._available_subjects = await _fetch_subjects(api, self._new_class_name)
            await api.async_close()
        except Exception as err:
            _LOGGER.error("Options flow: error fetching subjects: %s", err)
            if api:
                await api.async_close()
            current_class = (
                self._config_entry.options.get(CONF_CLASS_NAME)
                or self._config_entry.data.get(CONF_CLASS_NAME, "")
            )
            return self.async_show_form(
                step_id="change_class",
                data_schema=vol.Schema(
                    {vol.Required(CONF_CLASS_NAME, default=current_class): str}
                ),
                errors={"base": "cannot_connect"},
            )

        return await self.async_step_subjects()

    async def async_step_subjects(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 2 - choose which subjects to include (uncheck = exclude)."""
        if user_input is not None:
            excluded = [
                s for s in self._available_subjects if not user_input.get(s, True)
            ]
            return self.async_create_entry(
                title="",
                data={
                    CONF_CLASS_NAME: self._new_class_name,
                    CONF_EXCLUDED_SUBJECTS: excluded,
                },
            )

        if not self._available_subjects:
            return self.async_show_form(
                step_id="subjects",
                data_schema=vol.Schema(
                    {vol.Optional("continue", default=True): bool}
                ),
                description_placeholders={"subject_count": "0"},
            )

        current_excluded = self._config_entry.options.get(
            CONF_EXCLUDED_SUBJECTS,
            self._config_entry.data.get(CONF_EXCLUDED_SUBJECTS, []),
        )
        schema_dict = {
            vol.Optional(s, default=(s not in current_excluded)): bool
            for s in self._available_subjects
        }
        return self.async_show_form(
            step_id="subjects",
            data_schema=vol.Schema(schema_dict),
            description_placeholders={
                "subject_count": str(len(self._available_subjects))
            },
        )
