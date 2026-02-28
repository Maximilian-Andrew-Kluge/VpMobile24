"""Button platform für VpMobile24."""
from __future__ import annotations

import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Richte VpMobile24 Button ein."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    
    buttons = [
        VpMobile24ReloadButton(coordinator, config_entry),
    ]
    
    async_add_entities(buttons)


class VpMobile24ReloadButton(CoordinatorEntity, ButtonEntity):
    """Button zum manuellen Neuladen der Daten."""

    def __init__(self, coordinator, config_entry) -> None:
        """Initialisiere den Button."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Daten neu laden"
        self._attr_unique_id = f"{config_entry.entry_id}_reload"
        self._attr_icon = "mdi:refresh"

    @property
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.data["school_id"])},
            "name": f"VpMobile24 ({self._config_entry.data['school_id']})",
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "2.2.0",
        }

    async def async_press(self) -> None:
        """Handle the button press."""
        _LOGGER.info("Manual reload button pressed")
        await self.coordinator.async_request_refresh()
