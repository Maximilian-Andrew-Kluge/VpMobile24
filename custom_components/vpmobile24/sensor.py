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

# Multilingual sensor names
SENSOR_NAMES = {
    "en": {
        "next_lesson": "VpMobile24 Next Lesson",
        "week_schedule": "VpMobile24 Week Schedule", 
        "additional_info": "VpMobile24 Additional Info",
        "changes": "VpMobile24 Changes"
    },
    "de": {
        "next_lesson": "VpMobile24 Nächste Stunde",
        "week_schedule": "VpMobile24 Wochenstundenplan",
        "additional_info": "VpMobile24 Zusatzinfos", 
        "changes": "VpMobile24 Änderungen"
    },
    "fr": {
        "next_lesson": "VpMobile24 Prochain Cours",
        "week_schedule": "VpMobile24 Emploi du Temps",
        "additional_info": "VpMobile24 Infos Supplémentaires",
        "changes": "VpMobile24 Changements"
    }
}

# Multilingual state messages
STATE_MESSAGES = {
    "en": {
        "no_data": "No data",
        "no_lessons_today": "No more lessons today", 
        "no_lessons": "No lessons today",
        "lesson_today": "lesson today",
        "lessons_today": "lessons today",
        "no_additional_info": "No additional info",
        "additional_info": "additional info",
        "additional_infos": "additional infos", 
        "no_changes": "No changes",
        "change": "change",
        "changes": "changes"
    },
    "de": {
        "no_data": "Keine Daten",
        "no_lessons_today": "Keine weiteren Stunden heute",
        "no_lessons": "Keine Stunden heute", 
        "lesson_today": "Stunde heute",
        "lessons_today": "Stunden heute",
        "no_additional_info": "Keine Zusatzinfos",
        "additional_info": "Zusatzinfo",
        "additional_infos": "Zusatzinfos",
        "no_changes": "Keine Änderungen", 
        "change": "Änderung",
        "changes": "Änderungen"
    },
    "fr": {
        "no_data": "Aucune donnée",
        "no_lessons_today": "Plus de cours aujourd'hui",
        "no_lessons": "Aucun cours aujourd'hui",
        "lesson_today": "cours aujourd'hui", 
        "lessons_today": "cours aujourd'hui",
        "no_additional_info": "Aucune info supplémentaire",
        "additional_info": "info supplémentaire",
        "additional_infos": "infos supplémentaires",
        "no_changes": "Aucun changement",
        "change": "changement", 
        "changes": "changements"
    }
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Richte VpMobile24 Sensoren ein."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    
    # Get language from config entry, default to English
    language = config_entry.data.get("language", "en")
    
    sensors = [
        VpMobile24NextLessonSensor(coordinator, config_entry, language),
        VpMobile24WeekScheduleSensor(coordinator, config_entry, language),
        VpMobile24AdditionalInfoSensor(coordinator, config_entry, language),
        VpMobile24ChangesSensor(coordinator, config_entry, language),
    ]
    
    async_add_entities(sensors)


class VpMobile24NextLessonSensor(CoordinatorEntity, SensorEntity):
    """Sensor für die nächste Unterrichtsstunde."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["next_lesson"]
        self._attr_unique_id = f"{config_entry.entry_id}_naechste_stunde"
        self._attr_icon = "mdi:clock-outline"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        
        next_lesson = self._get_next_lesson()
        if not next_lesson:
            return STATE_MESSAGES[self._language]["no_lessons_today"]
        
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
            return {"status": STATE_MESSAGES[self._language]["no_lessons_today"]}
        
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

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["week_schedule"]
        self._attr_unique_id = f"{config_entry.entry_id}_wochenstundenplan"
        self._attr_icon = "mdi:calendar-week"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        
        lessons = self.coordinator.data.get("lessons", [])
        lesson_count = len(lessons)
        
        if lesson_count == 0:
            return STATE_MESSAGES[self._language]["no_lessons"]
        elif lesson_count == 1:
            return f"1 {STATE_MESSAGES[self._language]['lesson_today']}"
        else:
            return f"{lesson_count} {STATE_MESSAGES[self._language]['lessons_today']}"

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

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["additional_info"]
        self._attr_unique_id = f"{config_entry.entry_id}_zusatzinfos"
        self._attr_icon = "mdi:information-outline"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        
        # Debug: Log what data we have
        _LOGGER.debug(f"Coordinator data keys: {list(self.coordinator.data.keys())}")
        
        # Zähle ZusatzInfo aus XML
        additional_info = self.coordinator.data.get("additional_info", [])
        _LOGGER.debug(f"Additional info count: {len(additional_info)}")
        
        # Zähle auch Zusatzinfos aus Stunden
        lessons = self.coordinator.data.get("lessons", [])
        lesson_info_count = 0
        for lesson in lessons:
            if lesson.get("info"):
                lesson_info_count += 1
        
        total_info_count = len(additional_info) + lesson_info_count
        _LOGGER.debug(f"Total info count: {total_info_count} (additional: {len(additional_info)}, lessons: {lesson_info_count})")
        
        if total_info_count == 0:
            return STATE_MESSAGES[self._language]["no_additional_info"]
        elif total_info_count == 1:
            return f"1 {STATE_MESSAGES[self._language]['additional_info']}"
        else:
            return f"{total_info_count} {STATE_MESSAGES[self._language]['additional_infos']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Gib alle zusätzlichen Informationen zurück."""
        if not self.coordinator.data:
            return {}
        
        # ZusatzInfo aus XML
        additional_info = self.coordinator.data.get("additional_info", [])
        general_infos = []
        for info in additional_info:
            general_infos.append({
                "text": info.get("text", ""),
                "typ": "Allgemeine Info"
            })
        
        # Zusatzinfos aus Stunden
        lessons = self.coordinator.data.get("lessons", [])
        lesson_infos = []
        for lesson in lessons:
            if lesson.get("info"):
                info_entry = {
                    "zeit": lesson.get("time", ""),
                    "fach": lesson.get("subject", ""),
                    "zusatzinfo": lesson["info"],
                    "typ": "Stunden-Info"
                }
                if lesson.get("teacher"):
                    info_entry["lehrer"] = lesson["teacher"]
                if lesson.get("room"):
                    info_entry["raum"] = lesson["room"]
                if lesson.get("period"):
                    info_entry["stunde"] = lesson["period"]
                
                lesson_infos.append(info_entry)
        
        return {
            "allgemeine_infos": general_infos,
            "stunden_infos": lesson_infos,
            "anzahl_allgemeine_infos": len(general_infos),
            "anzahl_stunden_infos": len(lesson_infos),
            "gesamt_infos": len(general_infos) + len(lesson_infos),
            "datum": self.coordinator.data.get("date", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
            "debug_data_keys": list(self.coordinator.data.keys()) if self.coordinator.data else [],
        }


class VpMobile24ChangesSensor(CoordinatorEntity, SensorEntity):
    """Sensor für Stundenplanänderungen und Vertretungen."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["changes"]
        self._attr_unique_id = f"{config_entry.entry_id}_aenderungen"
        self._attr_icon = "mdi:swap-horizontal"

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        
        changes = self.coordinator.data.get("changes", [])
        lessons = self.coordinator.data.get("lessons", [])
        
        # Zähle Vertretungen in den Stunden
        substitution_count = 0
        for lesson in lessons:
            if lesson.get("is_change"):
                substitution_count += 1
        
        total_changes = len(changes) + substitution_count
        
        if total_changes == 0:
            return STATE_MESSAGES[self._language]["no_changes"]
        elif total_changes == 1:
            return f"1 {STATE_MESSAGES[self._language]['change']}"
        else:
            return f"{total_changes} {STATE_MESSAGES[self._language]['changes']}"

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