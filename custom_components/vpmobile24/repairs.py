"""Repairs flow for VpMobile24 — migration hints after major updates."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant import data_entry_flow
from homeassistant.components.repairs import ConfirmRepairFlow, RepairsFlow
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# Versions that require a re-setup (integration delete + re-add)
VERSIONS_REQUIRING_RECONFIG = {"2.5.0", "2.5.1", "2.5.2"}


async def async_create_fix_flow(
    hass: HomeAssistant,
    issue_id: str,
    data: dict[str, str | int | float | None] | None,
) -> RepairsFlow:
    """Create the repair flow."""
    if issue_id == "reconfig_required":
        return ReconfigRequiredRepairFlow()
    return ConfirmRepairFlow()


class ReconfigRequiredRepairFlow(RepairsFlow):
    """Repair flow that informs the user to re-add the integration."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> data_entry_flow.FlowResult:
        """Show the repair info."""
        if user_input is not None:
            return self.async_create_entry(data={})

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({}),
            description_placeholders={},
        )
