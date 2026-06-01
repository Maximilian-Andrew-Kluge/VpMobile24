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
        VpMobile24ICalExportButton(coordinator, config_entry, language),
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


ICAL_BUTTON_NAMES = {
    "de": "VpMobile24 iCal exportieren",
    "en": "VpMobile24 Export iCal",
    "fr": "VpMobile24 Exporter iCal",
}


class VpMobile24ICalExportButton(CoordinatorEntity, ButtonEntity):
    """Button zum Exportieren des Stundenplans als iCal-Datei."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = ICAL_BUTTON_NAMES.get(language, ICAL_BUTTON_NAMES["en"])
        self._attr_unique_id = f"{config_entry.entry_id}_ical_export"
        self._attr_icon = "mdi:calendar-export"

    @property
    def device_info(self):
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
        """Generate iCal file and save to /config/www/vpmobile24/stundenplan.ics"""
        import asyncio
        from pathlib import Path

        def _generate_ical() -> str:
            data = self.coordinator.data or {}
            class_name = getattr(self.coordinator, "class_name", "")
            lessons = data.get("week_lessons", []) + data.get("week_changes", [])

            lines = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                f"PRODID:-//VpMobile24//{class_name}//DE",
                "CALSCALE:GREGORIAN",
                "METHOD:PUBLISH",
                f"X-WR-CALNAME:Stundenplan {class_name}",
            ]

            from datetime import datetime as dt
            for lesson in lessons:
                date_str = lesson.get("date", "")
                ts = lesson.get("time_start", "")
                te = lesson.get("time_end", "")
                subj = lesson.get("subject", "Unbekannt")
                teacher = lesson.get("teacher", "")
                room = lesson.get("room", "")
                info = lesson.get("info", "")
                is_change = lesson.get("is_change", False)

                if not date_str or not ts or not te:
                    continue
                try:
                    d = dt.fromisoformat(date_str)
                    sh, sm = map(int, ts.split(":"))
                    eh, em = map(int, te.split(":"))
                    dtstart = d.replace(hour=sh, minute=sm).strftime("%Y%m%dT%H%M%S")
                    dtend   = d.replace(hour=eh, minute=em).strftime("%Y%m%dT%H%M%S")
                    uid = f"{date_str}-{ts}-{subj}@vpmobile24"
                    summary = f"{'[V] ' if is_change else ''}{subj}"
                    desc_parts = []
                    if teacher: desc_parts.append(f"Lehrer: {teacher}")
                    if room:    desc_parts.append(f"Raum: {room}")
                    if info:    desc_parts.append(f"Info: {info}")
                    desc = "\\n".join(desc_parts)
                    lines += [
                        "BEGIN:VEVENT",
                        f"UID:{uid}",
                        f"DTSTART:{dtstart}",
                        f"DTEND:{dtend}",
                        f"SUMMARY:{summary}",
                        f"DESCRIPTION:{desc}",
                        f"LOCATION:{room}",
                        "END:VEVENT",
                    ]
                except (ValueError, TypeError):
                    continue

            lines.append("END:VCALENDAR")
            return "\r\n".join(lines)

        try:
            ical_content = await self.hass.async_add_executor_job(_generate_ical)
            www_dir = Path(self.hass.config.path("www")) / "vpmobile24"

            def _write(content: str) -> None:
                www_dir.mkdir(parents=True, exist_ok=True)
                (www_dir / "stundenplan.ics").write_text(content, encoding="utf-8")

            await self.hass.async_add_executor_job(_write, ical_content)
            _LOGGER.info(
                "VpMobile24: iCal exported to /config/www/vpmobile24/stundenplan.ics "
                "— download at /local/vpmobile24/stundenplan.ics"
            )
            self.hass.components.persistent_notification.async_create(
                message=(
                    "iCal-Datei erstellt!\n\n"
                    "Download: [/local/vpmobile24/stundenplan.ics](/local/vpmobile24/stundenplan.ics)"
                ),
                title="VpMobile24 iCal Export",
                notification_id="vpmobile24_ical",
            )
        except Exception as err:
            _LOGGER.error("VpMobile24: iCal export failed: %s", err)
