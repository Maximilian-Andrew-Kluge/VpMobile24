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
        VpMobile24WeekTableSensor(coordinator, config_entry, language),
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
        changes = self.coordinator.data.get("changes", [])
        
        # Filtere nur heutige Stunden - ALLE Stunden (normale + geänderte)
        today = datetime.now().date().isoformat()
        today_lessons = []
        
        # Normale Stunden
        for lesson in lessons:
            lesson_date = lesson.get("date", "")
            if lesson_date == today:
                today_lessons.append(lesson)
        
        # Geänderte Stunden (diese sind auch Stunden!)
        for change in changes:
            change_date = change.get("date", "")
            if change_date == today:
                today_lessons.append(change)
        
        # Zeige alle heutigen Stunden (normale + geänderte)
        lesson_count = len(today_lessons)
        
        if lesson_count == 0:
            return STATE_MESSAGES[self._language]["no_lessons"]
        elif lesson_count == 1:
            return f"1 {STATE_MESSAGES[self._language]['lesson_today']}"
        else:
            return f"{lesson_count} {STATE_MESSAGES[self._language]['lessons_today']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Gib den kompletten heutigen Stundenplan zurück."""
        if not self.coordinator.data:
            return {}
        
        lessons = self.coordinator.data.get("lessons", [])
        changes = self.coordinator.data.get("changes", [])
        
        # Filtere nur heutige Stunden - ALLE Stunden (normale + geänderte)
        today = datetime.now().date().isoformat()
        all_today_lessons = []
        subjects_count = {}
        current_datetime = datetime.now()
        
        # Normale Stunden
        for lesson in lessons:
            lesson_date = lesson.get("date", "")
            if lesson_date == today:
                all_today_lessons.append(lesson)
        
        # Geänderte Stunden (diese sind auch Stunden!)
        for change in changes:
            change_date = change.get("date", "")
            if change_date == today:
                all_today_lessons.append(change)
        
        # Verarbeite alle heutigen Stunden (normale + geänderte)
        # Erst sortieren nach Stunde für Doppelstunden-Erkennung
        all_today_lessons.sort(key=lambda x: int(x.get("period", "0")) if x.get("period", "").isdigit() else 0)
        
        # Doppelstunden-Erkennung und fehlende Stunden ergänzen
        completed_lessons = self._complete_double_lessons(all_today_lessons)
        
        today_lessons = []
        for lesson in completed_lessons:
            subject = lesson.get("subject", "Unbekannt")
            
            # Zähle Fächer
            if subject in subjects_count:
                subjects_count[subject] += 1
            else:
                subjects_count[subject] = 1
            
            # Erstelle lesson_info für alle heutigen Stunden
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
            if lesson.get("ist_doppelstunde"):
                lesson_info["ist_doppelstunde"] = True
            
            # Prüfe ob Stunde bereits vorbei ist
            time_start = lesson.get("time_start", "")
            if time_start and ":" in time_start:
                try:
                    lesson_hour, lesson_minute = map(int, time_start.split(":"))
                    lesson_datetime = datetime.combine(current_datetime.date(), datetime.min.time().replace(hour=lesson_hour, minute=lesson_minute))
                    
                    # Markiere vergangene Stunden
                    if lesson_datetime <= current_datetime:
                        lesson_info["ist_vorbei"] = True
                    else:
                        lesson_info["ist_vorbei"] = False
                except (ValueError, TypeError):
                    lesson_info["ist_vorbei"] = False
            else:
                lesson_info["ist_vorbei"] = False
            
            today_lessons.append(lesson_info)
        
        # Sortiere Stunden nach Stundennummer
        today_lessons.sort(key=lambda x: int(x.get("stunde", "0")) if x.get("stunde", "").isdigit() else 0)
        
        return {
            "stunden_heute": today_lessons,
            "faecher_anzahl": subjects_count,
            "gesamt_stunden": len(today_lessons),
            "datum": today,
            "status": f"Zeige alle {len(today_lessons)} Stunden von heute (normale + geänderte)",
            "klasse": getattr(self.coordinator, 'class_name', ''),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }

    def _complete_double_lessons(self, lessons: list) -> list:
        """Ergänze fehlende Stunden für Doppelstunden."""
        if not lessons:
            return lessons
        
        # Erstelle ein Dictionary mit Stunden als Schlüssel
        lessons_by_period = {}
        for lesson in lessons:
            period = lesson.get("period", "")
            if period and period.isdigit():
                lessons_by_period[int(period)] = lesson
        
        # Finde alle vorhandenen Stunden
        existing_periods = sorted(lessons_by_period.keys())
        if not existing_periods:
            return lessons
        
        completed_lessons = []
        
        # Gehe durch alle möglichen Stunden (1-8 typisch)
        min_period = min(existing_periods)
        max_period = max(existing_periods)
        
        for period in range(min_period, max_period + 1):
            if period in lessons_by_period:
                # Stunde existiert bereits
                completed_lessons.append(lessons_by_period[period])
            else:
                # Stunde fehlt - prüfe auf Doppelstunde
                prev_lesson = lessons_by_period.get(period - 1)
                next_lesson = lessons_by_period.get(period + 1)
                
                # Wenn vorherige Stunde existiert und gleiche Fach hat
                if prev_lesson and prev_lesson.get("subject"):
                    # Erstelle Doppelstunde basierend auf vorheriger Stunde
                    double_lesson = prev_lesson.copy()
                    double_lesson["period"] = str(period)
                    
                    # Berechne Zeit für die nächste Stunde (45 Min später)
                    prev_time_start = prev_lesson.get("time_start", "")
                    if prev_time_start and ":" in prev_time_start:
                        try:
                            hour, minute = map(int, prev_time_start.split(":"))
                            # 45 Minuten später
                            minute += 45
                            if minute >= 60:
                                hour += 1
                                minute -= 60
                            
                            new_time_start = f"{hour:02d}:{minute:02d}"
                            new_time_end = f"{hour:02d}:{minute + 45:02d}" if minute + 45 < 60 else f"{hour + 1:02d}:{minute + 45 - 60:02d}"
                            
                            double_lesson["time_start"] = new_time_start
                            double_lesson["time_end"] = new_time_end
                            double_lesson["time"] = f"{new_time_start}-{new_time_end}"
                            
                        except (ValueError, TypeError):
                            # Fallback: verwende Zeit der vorherigen Stunde
                            pass
                    
                    # Markiere als automatisch ergänzte Doppelstunde
                    double_lesson["ist_doppelstunde"] = True
                    completed_lessons.append(double_lesson)
                
                # Wenn nächste Stunde existiert und gleiches Fach hat
                elif next_lesson and next_lesson.get("subject"):
                    # Erstelle Doppelstunde basierend auf nächster Stunde
                    double_lesson = next_lesson.copy()
                    double_lesson["period"] = str(period)
                    
                    # Berechne Zeit für die vorherige Stunde (45 Min früher)
                    next_time_start = next_lesson.get("time_start", "")
                    if next_time_start and ":" in next_time_start:
                        try:
                            hour, minute = map(int, next_time_start.split(":"))
                            # 45 Minuten früher
                            minute -= 45
                            if minute < 0:
                                hour -= 1
                                minute += 60
                            
                            new_time_start = f"{hour:02d}:{minute:02d}"
                            new_time_end = f"{hour:02d}:{minute + 45:02d}" if minute + 45 < 60 else f"{hour + 1:02d}:{minute + 45 - 60:02d}"
                            
                            double_lesson["time_start"] = new_time_start
                            double_lesson["time_end"] = new_time_end
                            double_lesson["time"] = f"{new_time_start}-{new_time_end}"
                            
                        except (ValueError, TypeError):
                            # Fallback: verwende Zeit der nächsten Stunde
                            pass
                    
                    # Markiere als automatisch ergänzte Doppelstunde
                    double_lesson["ist_doppelstunde"] = True
                    completed_lessons.append(double_lesson)
        
        return completed_lessons


class VpMobile24WeekTableSensor(CoordinatorEntity, SensorEntity):
    """Sensor für die komplette Wochenstundenplan-Tabelle."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        """Initialisiere den Sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = "VpMobile24 Week Table"
        self._attr_unique_id = f"{config_entry.entry_id}_week_table"
        self._attr_icon = "mdi:table"

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
            return "Keine Daten"
        
        # Zugriff auf die Wochendaten vom Coordinator
        week_lessons = getattr(self.coordinator, '_week_data', {}).get('lessons', [])
        week_changes = getattr(self.coordinator, '_week_data', {}).get('changes', [])
        
        total_week_lessons = len(week_lessons) + len(week_changes)
        
        if total_week_lessons == 0:
            return "Keine Wochendaten"
        else:
            return f"{total_week_lessons} Wochenstunden"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Gib die kompletten Wochendaten als Tabelle zurück."""
        if not self.coordinator.data:
            return {}
        
        # Zugriff auf die Wochendaten vom Coordinator
        week_lessons = getattr(self.coordinator, '_week_data', {}).get('lessons', [])
        week_changes = getattr(self.coordinator, '_week_data', {}).get('changes', [])
        
        # Kombiniere alle Wochenstunden
        all_week_lessons = []
        all_week_lessons.extend(week_lessons)
        all_week_lessons.extend(week_changes)
        
        # Erstelle Wochentabelle
        week_table = self._create_week_table(all_week_lessons)
        
        return {
            "week_table": week_table,
            "total_lessons": len(all_week_lessons),
            "week_lessons_count": len(week_lessons),
            "week_changes_count": len(week_changes),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }

    def _create_week_table(self, all_lessons: list) -> dict:
        """Erstelle eine strukturierte Wochentabelle."""
        # Wochentage (0=Montag, 4=Freitag)
        weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        
        # Initialisiere Tabelle
        week_table = {}
        for day in weekdays:
            week_table[day] = {}
            for period in range(1, 7):  # Stunden 1-6
                week_table[day][str(period)] = None
        
        # Fülle Tabelle mit Stunden
        for lesson in all_lessons:
            lesson_date = lesson.get("date", "")
            period = lesson.get("period", "")
            
            if lesson_date and period:
                try:
                    # Konvertiere Datum zu Wochentag
                    lesson_datetime = datetime.fromisoformat(lesson_date)
                    weekday_index = lesson_datetime.weekday()  # 0=Montag
                    
                    if 0 <= weekday_index <= 4 and period.isdigit():
                        weekday_name = weekdays[weekday_index]
                        
                        lesson_info = {
                            "fach": lesson.get("subject", ""),
                            "lehrer": lesson.get("teacher", ""),
                            "raum": lesson.get("room", ""),
                            "zeit": lesson.get("time", ""),
                            "ist_vertretung": lesson.get("is_change", False),
                            "zusatzinfo": lesson.get("info", "")
                        }
                        
                        week_table[weekday_name][period] = lesson_info
                        
                except (ValueError, TypeError):
                    continue
        
        return week_table


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
