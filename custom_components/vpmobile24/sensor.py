"""Sensor platform für VpMobile24."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.components.sensor import SensorEntity
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
    """Richte VpMobile24 Sensoren ein."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    
    sensors = [
        VpMobile24NextLessonSensor(coordinator, config_entry),
        VpMobile24WeekScheduleSensor(coordinator, config_entry),
        VpMobile24AdditionalInfoSensor(coordinator, config_entry),
        VpMobile24ChangesSensor(coordinator, config_entry),
    ]
    
    async_add_entities(sensors)


class VpMobile24NextLessonSensor(CoordinatorEntity, SensorEntity):
    """Sensor für die nächste Unterrichtsstunde."""

    def __init__(self, coordinator, config_entry) -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Nächste Stunde"
        self._attr_unique_id = f"{config_entry.entry_id}_naechste_stunde"
        self._attr_icon = "mdi:clock-outline"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return "Keine Daten"
        
        next_lesson = self._get_next_lesson()
        if not next_lesson:
            return "Keine weitere Stunde heute"
        
        subject = next_lesson.get('subject', 'Unbekannt')
        time = next_lesson.get('time', '')
        return f"{subject} - {time}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Gib zusätzliche Attribute zurück."""
        if not self.coordinator.data:
            return {}
        
        next_lesson = self._get_next_lesson()
        if not next_lesson:
            return {"status": "Keine weitere Stunde heute"}
        
        return {
            "fach": next_lesson.get("subject", "Unbekannt"),
            "zeit": next_lesson.get("time", ""),
            "lehrer": next_lesson.get("teacher", ""),
            "raum": next_lesson.get("room", ""),
            "stunde": next_lesson.get("period", ""),
            "zusatzinfo": next_lesson.get("info", ""),
            "ist_vertretung": next_lesson.get("is_change", False),
        }

    def _get_next_lesson(self) -> dict[str, Any] | None:
        """Finde die nächste Stunde."""
        if not self.coordinator.data:
            return None
            
        lessons = self.coordinator.data.get("lessons", [])
        if not lessons:
            return None
            
        current_time = datetime.now().time()
        for lesson in lessons:
            time_start = lesson.get("time_start", "")
            if time_start and ":" in time_start:
                try:
                    lesson_hour, lesson_minute = map(int, time_start.split(":"))
                    lesson_time = datetime.now().replace(hour=lesson_hour, minute=lesson_minute).time()
                    if lesson_time > current_time:
                        return lesson
                except (ValueError, TypeError):
                    continue
        
        return None


class VpMobile24WeekScheduleSensor(CoordinatorEntity, SensorEntity):
    """Sensor für den kompletten Wochenstundenplan."""

    def __init__(self, coordinator, config_entry) -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Wochenstundenplan"
        self._attr_unique_id = f"{config_entry.entry_id}_wochenstundenplan"
        self._attr_icon = "mdi:calendar-week"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return "Keine Daten"
        
        lessons = self.coordinator.data.get("lessons", [])
        lesson_count = len(lessons)
        
        if lesson_count == 0:
            return "Keine Stunden heute"
        elif lesson_count == 1:
            return "1 Stunde heute"
        else:
            return f"{lesson_count} Stunden heute"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Gib den kompletten Wochenstundenplan zurück."""
        if not self.coordinator.data:
            return {}
        
        lessons = self.coordinator.data.get("lessons", [])
        
        # Gruppiere Stunden nach Fächern
        subjects_count = {}
        detailed_lessons = []
        
        for lesson in lessons:
            subject = lesson.get("subject", "Unbekannt")
            if subject in subjects_count:
                subjects_count[subject] += 1
            else:
                subjects_count[subject] = 1
            
            lesson_info = {
                "zeit": lesson.get("time", ""),
                "fach": lesson.get("subject", ""),
                "lehrer": lesson.get("teacher", ""),
                "raum": lesson.get("room", ""),
                "stunde": lesson.get("period", ""),
            }
            if lesson.get("info"):
                lesson_info["zusatzinfo"] = lesson["info"]
            if lesson.get("is_change"):
                lesson_info["ist_vertretung"] = True
            
            detailed_lessons.append(lesson_info)
        
        return {
            "stunden_heute": detailed_lessons,
            "faecher_anzahl": subjects_count,
            "gesamt_stunden": len(lessons),
            "datum": self.coordinator.data.get("date", ""),
            "klasse": getattr(self.coordinator, 'class_name', ''),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }


class VpMobile24AdditionalInfoSensor(CoordinatorEntity, SensorEntity):
    """Sensor für zusätzliche Informationen."""

    def __init__(self, coordinator, config_entry) -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Zusatzinfos"
        self._attr_unique_id = f"{config_entry.entry_id}_zusatzinfos"
        self._attr_icon = "mdi:information-outline"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return "Keine Daten"
        
        lessons = self.coordinator.data.get("lessons", [])
        info_count = 0
        
        for lesson in lessons:
            if lesson.get("info"):
                info_count += 1
        
        if info_count == 0:
            return "Keine Zusatzinfos"
        elif info_count == 1:
            return "1 Zusatzinfo"
        else:
            return f"{info_count} Zusatzinfos"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Gib alle zusätzlichen Informationen zurück."""
        if not self.coordinator.data:
            return {}
        
        lessons = self.coordinator.data.get("lessons", [])
        infos = []
        
        for lesson in lessons:
            if lesson.get("info"):
                info_entry = {
                    "zeit": lesson.get("time", ""),
                    "fach": lesson.get("subject", ""),
                    "zusatzinfo": lesson["info"],
                }
                if lesson.get("teacher"):
                    info_entry["lehrer"] = lesson["teacher"]
                if lesson.get("room"):
                    info_entry["raum"] = lesson["room"]
                if lesson.get("period"):
                    info_entry["stunde"] = lesson["period"]
                
                infos.append(info_entry)
        
        return {
            "alle_zusatzinfos": infos,
            "anzahl_infos": len(infos),
            "datum": self.coordinator.data.get("date", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }


class VpMobile24ChangesSensor(CoordinatorEntity, SensorEntity):
    """Sensor für Stundenplanänderungen und Vertretungen."""

    def __init__(self, coordinator, config_entry) -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Änderungen"
        self._attr_unique_id = f"{config_entry.entry_id}_aenderungen"
        self._attr_icon = "mdi:swap-horizontal"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return "Keine Daten"
        
        changes = self.coordinator.data.get("changes", [])
        lessons = self.coordinator.data.get("lessons", [])
        
        # Zähle Vertretungen in den Stunden
        substitution_count = 0
        for lesson in lessons:
            if lesson.get("is_change"):
                substitution_count += 1
        
        total_changes = len(changes) + substitution_count
        
        if total_changes == 0:
            return "Keine Änderungen"
        elif total_changes == 1:
            return "1 Änderung"
        else:
            return f"{total_changes} Änderungen"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Gib alle Änderungen und Vertretungen zurück."""
        if not self.coordinator.data:
            return {}
        
        changes = self.coordinator.data.get("changes", [])
        lessons = self.coordinator.data.get("lessons", [])
        
        all_changes = []
        
        # Explizite Änderungen
        for change in changes:
            change_entry = {
                "typ": "Änderung",
                "zeit": change.get("time", ""),
                "fach": change.get("subject", ""),
                "beschreibung": change.get("description", ""),
            }
            if change.get("teacher"):
                change_entry["lehrer"] = change["teacher"]
            if change.get("room"):
                change_entry["raum"] = change["room"]
            if change.get("period"):
                change_entry["stunde"] = change["period"]
            
            all_changes.append(change_entry)
        
        # Vertretungen in den Stunden
        for lesson in lessons:
            if lesson.get("is_change"):
                change_entry = {
                    "typ": "Vertretung",
                    "zeit": lesson.get("time", ""),
                    "fach": lesson.get("subject", ""),
                    "lehrer": lesson.get("teacher", ""),
                    "raum": lesson.get("room", ""),
                    "stunde": lesson.get("period", ""),
                }
                if lesson.get("info"):
                    change_entry["grund"] = lesson["info"]
                
                all_changes.append(change_entry)
        
        return {
            "alle_aenderungen": all_changes,
            "anzahl_aenderungen": len(changes),
            "anzahl_vertretungen": sum(1 for lesson in lessons if lesson.get("is_change")),
            "gesamt_aenderungen": len(all_changes),
            "datum": self.coordinator.data.get("date", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }