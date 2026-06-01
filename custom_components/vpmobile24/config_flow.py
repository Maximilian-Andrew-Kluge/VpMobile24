"""Config flow for vpmobile24 integration."""
from __future__ import annotations

import asyncio
import logging
from typing import Any
from datetime import date, timedelta

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.data_entry_flow import FlowResult

from .api_new import Stundenplan24API
from .const import (
    CONF_SCHOOL_ID,
    CONF_CLASS_NAME,
    CONF_EXCLUDED_SUBJECTS,
    DEFAULT_BASE_URL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for vpmobile24."""

    VERSION = 1

    @staticmethod
    def async_get_options_flow(config_entry):
        """Return the options flow handler."""
        return OptionsFlowHandler(config_entry)

    def __init__(self):
        """Initialize config flow."""
        self._api = None
        self._config_data = {}
        self._available_subjects = []
        self._available_classes = []

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> FlowResult:
        """Step 1 — credentials + school ID (no class yet)."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
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
                    self._config_data.update(user_input)
                    # Try to load class list from XML
                    try:
                        self._available_classes = await self._api.async_get_classes()
                    except Exception:
                        self._available_classes = []
                    return await self.async_step_class()
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            finally:
                if self._api and errors:
                    await self._api.async_close()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_SCHOOL_ID): str,
                vol.Required(CONF_USERNAME): str,
                vol.Required(CONF_PASSWORD): str,
            }),
            errors=errors,
        )

    async def async_step_class(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> FlowResult:
        """Step 2 — select class (dropdown if available, text input as fallback)."""
        errors: dict[str, str] = {}

        if user_input is not None:
            class_name = user_input.get(CONF_CLASS_NAME, "").strip()
            if not class_name:
                errors[CONF_CLASS_NAME] = "cannot_connect"
            else:
                self._config_data[CONF_CLASS_NAME] = class_name
                try:
                    all_subjects: set[str] = set()
                    today = date.today()
                    dates_to_check = [today + timedelta(days=i) for i in range(-7, 21)]

                    async def _fetch_subjects_for_date(check_date: date) -> set[str]:
                        found: set[str] = set()
                        try:
                            schedule_data = await self._api.async_get_schedule(
                                target_date=check_date,
                                class_name=class_name,
                            )
                            for entry in schedule_data.get("lessons", []) + schedule_data.get("changes", []):
                                subject = (entry.get("subject") or "").strip()
                                if (
                                    subject
                                    and not subject.startswith("KPL")
                                    and not subject.startswith("---")
                                    and not subject.startswith("Pause")
                                    and not subject.startswith("Mittagspause")
                                    and not subject.lower().startswith("frei")
                                    and 2 <= len(subject) <= 10
                                ):
                                    found.add(subject)
                        except Exception as err:
                            _LOGGER.debug("Could not fetch schedule for %s: %s", check_date, err)
                        return found

                    results = await asyncio.gather(*[_fetch_subjects_for_date(d) for d in dates_to_check])
                    for s in results:
                        all_subjects.update(s)
                    self._available_subjects = sorted(list(all_subjects))
                    await self._api.async_close()
                    return await self.async_step_subjects()
                except Exception as err:
                    _LOGGER.error("Error fetching subjects: %s", err)
                    await self._api.async_close()
                    school_id = self._config_data.get(CONF_SCHOOL_ID, "")
                    entry_title = f"VpMobile24 \u2013 {class_name} ({school_id})"
                    await self.async_set_unique_id(f"{school_id}_{class_name}")
                    self._abort_if_unique_id_configured()
                    return self.async_create_entry(title=entry_title, data=self._config_data)

        # Build schema: dropdown if classes available, text input otherwise
        if self._available_classes:
            class_schema = vol.Schema({
                vol.Required(CONF_CLASS_NAME): vol.In(self._available_classes),
            })
        else:
            class_schema = vol.Schema({
                vol.Required(CONF_CLASS_NAME): str,
            })

        return self.async_show_form(
            step_id="class",
            data_schema=class_schema,
            errors=errors,
        )

    async def async_step_subjects(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> FlowResult:
        """Handle subject selection."""

        if user_input is not None:
            excluded_subjects = []

            for subject in self._available_subjects:
                if not user_input.get(subject, True):
                    excluded_subjects.append(subject)

            if excluded_subjects:
                self._config_data[
                    CONF_EXCLUDED_SUBJECTS
                ] = excluded_subjects

            class_name = self._config_data.get(CONF_CLASS_NAME, "")
            school_id = self._config_data.get(CONF_SCHOOL_ID, "")
            entry_title = f"VpMobile24 – {class_name} ({school_id})"

            # Prevent duplicate entries for same school+class combination
            await self.async_set_unique_id(f"{school_id}_{class_name}")
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=entry_title,
                data=self._config_data,
            )

        if not self._available_subjects:
            return self.async_show_form(
                step_id="subjects",
                data_schema=vol.Schema(
                    {
                        vol.Optional(
                            "continue",
                            default=True,
                        ): bool
                    }
                ),
                description_placeholders={
                    "subject_count": "0",
                },
            )

        schema_dict = {}

        for subject in self._available_subjects:
            schema_dict[
                vol.Optional(
                    subject,
                    default=True,
                )
            ] = bool

        return self.async_show_form(
            step_id="subjects",
            data_schema=vol.Schema(schema_dict),
            description_placeholders={
                "subject_count": str(
                    len(self._available_subjects)
                ),
            },
        )


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Options flow — change class and/or excluded subjects after initial setup."""

    def __init__(self, config_entry) -> None:
        """Initialize."""
        self._config_entry = config_entry
        self._available_subjects: list[str] = []
        self._new_class_name: str = ""
        self._change_subjects: bool = False

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Step 1 — choose: change subjects and/or change class."""
        if user_input is not None:
            change_class = user_input.get("change_class", False)
            change_subjects = user_input.get("change_subjects", False)

            if not change_class and not change_subjects:
                # Nothing selected — close the flow without changes
                return self.async_create_entry(title="", data={})

            if change_class:
                # Need to enter new class name first
                self._change_subjects = change_subjects
                return await self.async_step_change_class()

            # Only change subjects, keep current class
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
            data_schema=vol.Schema({
                vol.Optional("change_subjects", default=False): bool,
                vol.Optional("change_class", default=False): bool,
            }),
            description_placeholders={"current_class": current_class},
        )
    async def async_step_change_class(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Step 1b — enter a new class name."""
        if user_input is not None:
            self._new_class_name = user_input.get(CONF_CLASS_NAME, "").strip()
            if self._change_subjects:
                # Also changing subjects — load subject list
                return await self._load_subjects_and_show()
            # Only class change — save immediately, keep existing excluded subjects
            school_id = self._config_entry.data.get(CONF_SCHOOL_ID, "")
            new_title = (
                f"VpMobile24 \u2013 {self._new_class_name} ({school_id})"
                if self._new_class_name
                else f"VpMobile24 ({school_id})"
            )
            current_excluded = self._config_entry.options.get(
                CONF_EXCLUDED_SUBJECTS,
                self._config_entry.data.get(CONF_EXCLUDED_SUBJECTS, []),
            )
            return self.async_create_entry(
                title=new_title,
                data={
                    CONF_CLASS_NAME: self._new_class_name,
                    CONF_EXCLUDED_SUBJECTS: current_excluded,
                },
            )

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

    async def _load_subjects_and_show(self) -> FlowResult:
        """Fetch subjects for the selected class, then show subject step."""
        api = None
        try:
            api = Stundenplan24API(
                school_id=self._config_entry.data[CONF_SCHOOL_ID],
                username=self._config_entry.data[CONF_USERNAME],
                password=self._config_entry.data[CONF_PASSWORD],
                base_url=DEFAULT_BASE_URL,
            )
            all_subjects: set[str] = set()
            today = date.today()
            dates_to_check = [today + timedelta(days=i) for i in range(-7, 21)]

            async def _fetch(check_date: date) -> set[str]:
                found: set[str] = set()
                try:
                    schedule_data = await api.async_get_schedule(
                        target_date=check_date,
                        class_name=self._new_class_name,
                    )
                    for entry in (
                        schedule_data.get("lessons", []) + schedule_data.get("changes", [])
                    ):
                        subject = (entry.get("subject") or "").strip()
                        if (
                            subject
                            and not subject.startswith("KPL")
                            and not subject.startswith("---")
                            and not subject.startswith("Pause")
                            and not subject.startswith("Mittagspause")
                            and not subject.lower().startswith("frei")
                            and 2 <= len(subject) <= 10
                        ):
                            found.add(subject)
                except Exception:
                    pass
                return found

            results = await asyncio.gather(*[_fetch(d) for d in dates_to_check])
            for s in results:
                all_subjects.update(s)

            self._available_subjects = sorted(list(all_subjects))
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
    ) -> FlowResult:
        """Step 2 — choose which subjects to include (uncheck = exclude)."""
        if user_input is not None:
            excluded = [
                s for s in self._available_subjects
                if not user_input.get(s, True)
            ]
            # Build new title if class changed
            old_class = (
                self._config_entry.options.get(CONF_CLASS_NAME)
                or self._config_entry.data.get(CONF_CLASS_NAME, "")
            )
            school_id = self._config_entry.data.get(CONF_SCHOOL_ID, "")
            new_title = (
                f"VpMobile24 \u2013 {self._new_class_name} ({school_id})"
                if self._new_class_name != old_class and self._new_class_name
                else ""
            )
            return self.async_create_entry(
                title=new_title,
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
