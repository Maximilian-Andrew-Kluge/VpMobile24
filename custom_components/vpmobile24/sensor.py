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
        "week_schedule": "VpMobile24 Today Schedule", 
        "additional_info": "VpMobile24 Additional Info",
        "changes": "VpMobile24 Changes"
    },
    "de": {
        "next_lesson": "VpMobile24 Nächste Stunde",
        "week_schedule": "VpMobile24 Heutiger Stundenplan",
        "additional_info": "VpMobile24 Zusatzinfos", 
        "changes": "VpMobile24 Änderungen"
    },
    "fr": {
        "next_lesson": "VpMobile24 Prochain Cours",
        "week_schedule": "VpMobile24 Emploi Aujourd'hui",
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
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.data["school_id"])},
            "name": f"VpMobile24 ({self._config_entry.data['school_id']})",
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "1.4.5",
        }

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
            "datum": next_lesson.get("date", ""),
            "tag": next_lesson.get("day_name", ""),
            "lehrer": next_lesson.get("teacher", ""),
            "raum": next_lesson.get("room", ""),
            "stunde": next_lesson.get("period", ""),
            "zusatzinfo": next_lesson.get("info", ""),
            "ist_vertretung": next_lesson.get("is_change", False),
        }

    def _get_next_lesson(self) -> dict[str, Any] | None:
        """Finde die nächste Stunde nur für heute."""
        if not self.coordinator.data:
            return None
            
        lessons = self.coordinator.data.get("lessons", [])
        if not lessons:
            return None
            
        current_datetime = datetime.now()
        current_date = current_datetime.date()
        current_time = current_datetime.time()
        
        # Nur heutige Stunden betrachten
        today_lessons = []
        for lesson in lessons:
            lesson_date_str = lesson.get("date", "")
            time_start = lesson.get("time_start", "")
            
            if lesson_date_str and time_start and ":" in time_start:
                try:
                    lesson_date = datetime.fromisoformat(lesson_date_str).date()
                    
                    # Nur heutige Stunden
                    if lesson_date == current_date:
                        lesson_hour, lesson_minute = map(int, time_start.split(":"))
                        lesson_datetime = datetime.combine(lesson_date, datetime.min.time().replace(hour=lesson_hour, minute=lesson_minute))
                        
                        # Nur zukünftige Stunden von heute
                        if lesson_datetime > current_datetime:
                            today_lessons.append((lesson_datetime, lesson))
                except (ValueError, TypeError):
                    continue
        
        # Sortiere nach Zeit und gib die erste zurück
        if today_lessons:
            today_lessons.sort(key=lambda x: x[0])
            return today_lessons[0][1]
        
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
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.data["school_id"])},
            "name": f"VpMobile24 ({self._config_entry.data['school_id']})",
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "1.4.5",
        }

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        
        lessons = self.coordinator.data.get("lessons", [])
        
        # Filtere nur heutige Stunden
        today = datetime.now().date().isoformat()
        today_lessons = []
        
        for lesson in lessons:
            lesson_date = lesson.get("date", "")
            if lesson_date == today:
                today_lessons.append(lesson)
        
        # Prüfe welche heutigen Stunden noch nicht vorbei sind
        current_datetime = datetime.now()
        remaining_today_lessons = []
        
        for lesson in today_lessons:
            time_start = lesson.get("time_start", "")
            if time_start and ":" in time_start:
                try:
                    lesson_hour, lesson_minute = map(int, time_start.split(":"))
                    lesson_datetime = datetime.combine(current_datetime.date(), datetime.min.time().replace(hour=lesson_hour, minute=lesson_minute))
                    
                    # Stunde ist noch nicht vorbei
                    if lesson_datetime > current_datetime:
                        remaining_today_lessons.append(lesson)
                except (ValueError, TypeError):
                    continue
        
        # Zeige nur verbleibende heutige Stunden
        lesson_count = len(remaining_today_lessons)
        
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
        
        # Filtere nur heutige Stunden
        today = datetime.now().date().isoformat()
        today_lessons = []
        subjects_count = {}
        
        for lesson in lessons:
            lesson_date = lesson.get("date", "")
            if lesson_date == today:
                subject = lesson.get("subject", "Unbekannt")
                
                # Zähle Fächer
                if subject in subjects_count:
                    subjects_count[subject] += 1
                else:
                    subjects_count[subject] = 1
                
                today_lessons.append(lesson)
        
        # Prüfe welche heutigen Stunden noch nicht vorbei sind
        current_datetime = datetime.now()
        remaining_today_lessons = []
        
        for lesson in today_lessons:
            time_start = lesson.get("time_start", "")
            
            # Erstelle lesson_info
            lesson_info = {
                "zeit": lesson.get("time", ""),
                "fach": lesson.get("subject", ""),
                "lehrer": lesson.get("teacher", ""),
                "raum": lesson.get("room", ""),
                "stunde": lesson.get("period", ""),
                "datum": lesson.get("date", ""),
                "tag": lesson.get("day_name", ""),
            }
            if lesson.get("info"):
                lesson_info["zusatzinfo"] = lesson["info"]
            if lesson.get("is_change"):
                lesson_info["ist_vertretung"] = True
            
            # Prüfe ob Stunde noch nicht vorbei ist
            if time_start and ":" in time_start:
                try:
                    lesson_hour, lesson_minute = map(int, time_start.split(":"))
                    lesson_datetime = datetime.combine(current_datetime.date(), datetime.min.time().replace(hour=lesson_hour, minute=lesson_minute))
                    
                    # Stunde ist noch nicht vorbei
                    if lesson_datetime > current_datetime:
                        remaining_today_lessons.append(lesson_info)
                except (ValueError, TypeError):
                    # Bei Fehlern die Stunde trotzdem anzeigen
                    remaining_today_lessons.append(lesson_info)
            else:
                # Ohne Zeit-Info die Stunde trotzdem anzeigen
                remaining_today_lessons.append(lesson_info)
        
        return {
            "stunden_heute": remaining_today_lessons,
            "faecher_anzahl": subjects_count,
            "gesamt_stunden": len(remaining_today_lessons),
            "datum": today,
            "status": f"Zeige {len(remaining_today_lessons)} verbleibende Stunden von heute",
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
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.data["school_id"])},
            "name": f"VpMobile24 ({self._config_entry.data['school_id']})",
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "1.4.5",
        }

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
        
        # ZusatzInfo aus XML - nur der Text ohne typ
        additional_info = self.coordinator.data.get("additional_info", [])
        general_infos = []
        for info in additional_info:
            text = info.get("text", "").strip()
            if text:
                general_infos.append(text)
        
        # Zusatzinfos aus Stunden - nur der Text
        lessons = self.coordinator.data.get("lessons", [])
        lesson_infos = []
        for lesson in lessons:
            if lesson.get("info"):
                lesson_text = lesson["info"].strip()
                if lesson_text:
                    # Optional: Kontext hinzufügen (Fach und Zeit)
                    context = ""
                    if lesson.get("subject") and lesson.get("time"):
                        context = f" ({lesson['subject']} - {lesson['time']})"
                    lesson_infos.append(f"{lesson_text}{context}")
        
        return {
            "allgemeine_infos": general_infos,
            "stunden_infos": lesson_infos,
            "anzahl_allgemeine_infos": len(general_infos),
            "anzahl_stunden_infos": len(lesson_infos),
            "gesamt_infos": len(general_infos) + len(lesson_infos),
            "datum": self.coordinator.data.get("date", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
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
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.data["school_id"])},
            "name": f"VpMobile24 ({self._config_entry.data['school_id']})",
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "1.4.5",
        }

    @property
    def state(self) -> str | None:
        """Gib den Status des Sensors zurück."""
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        
        changes = self.coordinator.data.get("changes", [])
        lessons = self.coordinator.data.get("lessons", [])
        
        # Filtere Änderungen nach ausgewählten Fächern
        excluded_subjects = getattr(self.coordinator, 'excluded_subjects', [])
        
        filtered_changes = []
        for change in changes:
            subject = change.get("subject", "")
            if subject and subject not in excluded_subjects:
                filtered_changes.append(change)
        
        # Zähle Vertretungen in den Stunden (bereits gefiltert durch Coordinator)
        substitution_count = 0
        for lesson in lessons:
            if lesson.get("is_change"):
                substitution_count += 1
        
        total_changes = len(filtered_changes) + substitution_count
        
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
        
        # Filtere Änderungen nach ausgewählten Fächern
        excluded_subjects = getattr(self.coordinator, 'excluded_subjects', [])
        
        all_changes = []
        
        # Explizite Änderungen - nur für ausgewählte Fächer
        for change in changes:
            subject = change.get("subject", "")
            if subject and subject not in excluded_subjects:
                change_entry = {
                    "typ": "Änderung",
                    "zeit": change.get("time", ""),
                    "fach": change.get("subject", ""),
                    "datum": change.get("date", ""),
                    "tag": change.get("day_name", ""),
                    "beschreibung": change.get("description", ""),
                }
                if change.get("teacher"):
                    change_entry["lehrer"] = change["teacher"]
                if change.get("room"):
                    change_entry["raum"] = change["room"]
                if change.get("period"):
                    change_entry["stunde"] = change["period"]
                
                all_changes.append(change_entry)
        
        # Vertretungen in den Stunden (bereits durch Coordinator gefiltert)
        for lesson in lessons:
            if lesson.get("is_change"):
                change_entry = {
                    "typ": "Vertretung",
                    "zeit": lesson.get("time", ""),
                    "fach": lesson.get("subject", ""),
                    "datum": lesson.get("date", ""),
                    "tag": lesson.get("day_name", ""),
                    "lehrer": lesson.get("teacher", ""),
                    "raum": lesson.get("room", ""),
                    "stunde": lesson.get("period", ""),
                }
                if lesson.get("info"):
                    change_entry["grund"] = lesson["info"]
                
                all_changes.append(change_entry)
        
        return {
            "alle_aenderungen": all_changes,
            "anzahl_aenderungen": len([c for c in changes if c.get("subject", "") not in excluded_subjects]),
            "anzahl_vertretungen": sum(1 for lesson in lessons if lesson.get("is_change")),
            "gesamt_aenderungen": len(all_changes),
            "datum": self.coordinator.data.get("date", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }
