"""Binary sensor platform für VpMobile24."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity, BinarySensorDeviceClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .sensor import _device_info

_LOGGER = logging.getLogger(__name__)

BINARY_SENSOR_NAMES = {
    "de": "VpMobile24 Ausfall heute",
    "en": "VpMobile24 Cancellation Today",
    "fr": "VpMobile24 Annulation aujourd'hui",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up VpMobile24 binary sensors."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    ha_lang = getattr(hass.config, "language", "en") or "en"
    lang_short = ha_lang.split("-")[0].lower()
    language = lang_short if lang_short in ("de", "en", "fr") else "en"

    async_add_entities([
        VpMobile24AusfallHeuteSensor(coordinator, config_entry, language),
    ])


class VpMobile24AusfallHeuteSensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor: True wenn heute mindestens eine Stunde ausfällt."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_icon = "mdi:cancel"

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = BINARY_SENSOR_NAMES.get(language, BINARY_SENSOR_NAMES["en"])
        self._attr_unique_id = f"{config_entry.entry_id}_ausfall_heute"

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    @property
    def is_on(self) -> bool:
        """True wenn heute mindestens eine Stunde ausfällt."""
        if not self.coordinator.data:
            return False
        today = datetime.now().date().isoformat()
        today_lessons = [
            l for l in self.coordinator.data.get("lessons", [])
            if l.get("date") == today
        ]
        cancelled = [
            l for l in today_lessons
            if not l.get("subject") or l.get("subject", "").strip() in ["\u2014", "---", "", "-", " "]
        ]
        return len(cancelled) > 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        today = datetime.now().date().isoformat()
        today_lessons = [
            l for l in self.coordinator.data.get("lessons", [])
            if l.get("date") == today
        ]
        cancelled = [
            l for l in today_lessons
            if not l.get("subject") or l.get("subject", "").strip() in ["\u2014", "---", "", "-", " "]
        ]
        return {
            "anzahl_ausfaelle": len(cancelled),
            "ausgefallene_stunden": [
                {
                    "stunde": l.get("period", ""),
                    "zeit": l.get("time", ""),
                    "info": l.get("info", ""),
                }
                for l in cancelled
            ],
            "datum": today,
        }
