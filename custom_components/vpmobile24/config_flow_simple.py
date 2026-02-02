"""Simplified config flow for vpmobile24 integration - for debugging."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME
from homeassistant.data_entry_flow import FlowResult

from .api_new import Stundenplan24API
from .const import CONF_SCHOOL_ID, CONF_CLASS_NAME, CONF_EXCLUDED_SUBJECTS, DEFAULT_BASE_URL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class SimpleConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a simple config flow for vpmobile24."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                # Test the connection
                api = Stundenplan24API(
                    school_id=user_input[CONF_SCHOOL_ID],
                    username=user_input[CONF_USERNAME],
                    password=user_input[CONF_PASSWORD],
                    base_url=DEFAULT_BASE_URL,
                )
                
                connection_ok = await api.async_test_connection()
                await api.async_close()
                
                if not connection_ok:
                    errors["base"] = "cannot_connect"
                else:
                    # Create entry directly without subject selection
                    return self.async_create_entry(
                        title=f"VpMobile24 ({user_input[CONF_SCHOOL_ID]})",
                        data=user_input,
                    )
                    
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_SCHOOL_ID): str,
                vol.Required(CONF_USERNAME): str,
                vol.Required(CONF_PASSWORD): str,
                vol.Required(CONF_CLASS_NAME): str,
            }),
            errors=errors,
            title="VpMobile24 einrichten (Einfach)",
            description="Geben Sie Ihre stundenplan24.de Zugangsdaten ein. Fächerauswahl wird übersprungen.",
        )