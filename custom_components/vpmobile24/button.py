"""Button platform for VpMobile24."""
from __future__ import annotations

import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

BUTTON_NAMES: dict[str, str] = {
    "de": "VpMobile24 Daten neu laden",
    "en": "VpMobile24 Reload Data",
    "fr": "VpMobile24 Actualiser les donn\u00e9es",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up VpMobile24 button."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    ha_lang = getattr(hass.config, "language", "en") or "en"
    lang = ha_lang.split("-")[0].lower()
    if lang not in ("de", "en", "fr"):
        lang = "en"

    async_add_entities([VpMobile24ReloadButton(coordinator, config_entry, lang)])


class VpMobile24ReloadButton(CoordinatorEntity, ButtonEntity):
    """Button to manually trigger a data refresh."""

    def __init__(self, coordinator, config_entry: ConfigEntry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = BUTTON_NAMES.get(language, BUTTON_NAMES["en"])
        self._attr_unique_id = f"{config_entry.entry_id}_reload"
        self._attr_icon = "mdi:refresh"

    @property
    def device_info(self) -> dict:
        school_id  = self._config_entry.data["school_id"]
        class_name = self._config_entry.data.get("class_name", "")
        return {
            "identifiers": {(DOMAIN, f"{school_id}_{class_name}")},
            "name": (
                f"VpMobile24 \u2013 {class_name} ({school_id})"
                if class_name
                else f"VpMobile24 ({school_id})"
            ),
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "2.4.8",
        }

    async def async_press(self) -> None:
        """Handle button press — trigger coordinator refresh."""
        _LOGGER.info("VpMobile24 manual reload triggered")
        await self.coordinator.async_request_refresh()
