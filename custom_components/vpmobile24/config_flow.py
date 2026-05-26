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

    def __init__(self):
        """Initialize config flow."""
        self._api = None
        self._config_data = {}
        self._available_subjects = []

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> FlowResult:
        """Handle credentials step."""

        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                self._api = Stundenplan24API(
                    school_id=user_input[CONF_SCHOOL_ID],
                    username=user_input[CONF_USERNAME],
                    password=user_input[CONF_PASSWORD],
                    base_url=DEFAULT_BASE_URL,
                )

                connection_ok = (
                    await self._api.async_test_connection()
                )

                if not connection_ok:
                    errors["base"] = "cannot_connect"

                else:
                    self._config_data.update(user_input)

                    try:
                        all_subjects = set()
                        today = date.today()

                        for i in range(-7, 21):
                            try:
                                check_date = (
                                    today + timedelta(days=i)
                                )

                                schedule_data = (
                                    await self._api.async_get_schedule(
                                        target_date=check_date,
                                        class_name=user_input[
                                            CONF_CLASS_NAME
                                        ],
                                    )
                                )

                                for lesson in schedule_data.get(
                                    "lessons",
                                    [],
                                ):
                                    if (
                                        lesson.get("subject")
                                        and lesson["subject"].strip()
                                    ):
                                        subject = (
                                            lesson["subject"].strip()
                                        )

                                        if (
                                            subject
                                            and not subject.startswith(
                                                "KPL"
                                            )
                                            and not subject.startswith(
                                                "---"
                                            )
                                            and not subject.startswith(
                                                "Pause"
                                            )
                                            and not subject.startswith(
                                                "Mittagspause"
                                            )
                                            and not subject.lower().startswith(
                                                "frei"
                                            )
                                            and len(subject) >= 2
                                            and len(subject) <= 10
                                        ):
                                            all_subjects.add(subject)

                                for change in schedule_data.get(
                                    "changes",
                                    [],
                                ):
                                    if (
                                        change.get("subject")
                                        and change["subject"].strip()
                                    ):
                                        subject = (
                                            change["subject"].strip()
                                        )

                                        if (
                                            subject
                                            and not subject.startswith(
                                                "KPL"
                                            )
                                            and not subject.startswith(
                                                "---"
                                            )
                                            and not subject.startswith(
                                                "Pause"
                                            )
                                            and not subject.startswith(
                                                "Mittagspause"
                                            )
                                            and not subject.lower().startswith(
                                                "frei"
                                            )
                                            and len(subject) >= 2
                                            and len(subject) <= 10
                                        ):
                                            all_subjects.add(subject)

                            except Exception as err:
                                _LOGGER.debug(
                                    "Could not fetch schedule "
                                    "for %s: %s",
                                    check_date,
                                    err,
                                )
                                continue

                        self._available_subjects = sorted(
                            list(all_subjects)
                        )

                        await self._api.async_close()

                        return await self.async_step_subjects()

                    except Exception as err:
                        _LOGGER.error(
                            "Error fetching subjects: %s",
                            err,
                        )

                        await self._api.async_close()

                        class_name = user_input[CONF_CLASS_NAME]
                        school_id = user_input[CONF_SCHOOL_ID]
                        entry_title = f"VpMobile24 – {class_name} ({school_id})"
                        await self.async_set_unique_id(
                            f"{school_id}_{class_name}"
                        )
                        self._abort_if_unique_id_configured()

                        return self.async_create_entry(
                            title=entry_title,
                            data=self._config_data,
                        )

            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

            finally:
                if self._api:
                    await self._api.async_close()

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