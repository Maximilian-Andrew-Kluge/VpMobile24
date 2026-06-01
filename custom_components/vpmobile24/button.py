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

BUTTON_NAMES = {
    "de": "VpMobile24 Daten neu laden",
    "en": "VpMobile24 Reload Data",
    "fr": "VpMobile24 Actualiser les données",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Richte VpMobile24 Button ein."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    ha_lang = getattr(hass.config, "language", "en") or "en"
    lang_short = ha_lang.split("-")[0].lower()
    language = lang_short if lang_short in ("de", "en", "fr") else "en"

    buttons = [
        VpMobile24ReloadButton(coordinator, config_entry, language),
    ]

    async_add_entities(buttons)


class VpMobile24ReloadButton(CoordinatorEntity, ButtonEntity):
    """Button zum manuellen Neuladen der Daten."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        """Initialisiere den Button."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = BUTTON_NAMES.get(language, BUTTON_NAMES["en"])
        self._attr_unique_id = f"{config_entry.entry_id}_reload"
        self._attr_icon = "mdi:refresh"

    @property
    def device_info(self):
        """Return device information."""
        school_id = self._config_entry.data["school_id"]
        class_name = self._config_entry.options.get("class_name") or self._config_entry.data.get("class_name", "")
        device_id = f"{school_id}_{class_name}" if class_name else school_id
        name = (
            f"VpMobile24 \u2013 {class_name} ({school_id})"
            if class_name
            else f"VpMobile24 ({school_id})"
        )
        return {
            "identifiers": {(DOMAIN, device_id)},
            "name": name,
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "2.4.8",
        }

    async def async_press(self) -> None:
        """Handle the button press."""
        _LOGGER.info("Manual reload button pressed")
        await self.coordinator.async_request_refresh()


