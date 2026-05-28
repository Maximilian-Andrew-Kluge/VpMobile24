"""Sensor platform for VpMobile24."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Multilingual sensor names
# ---------------------------------------------------------------------------
SENSOR_NAMES: dict[str, dict[str, str]] = {
    "en": {
        "next_lesson":    "VpMobile24 Next Lesson",
        "week_schedule":  "VpMobile24 Today Schedule",
        "week_table":     "VpMobile24 Week Table",
        "additional_info":"VpMobile24 Additional Info",
        "changes":        "VpMobile24 Changes",
    },
    "de": {
        "next_lesson":    "VpMobile24 N\u00e4chste Stunde",
        "week_schedule":  "VpMobile24 Heutiger Stundenplan",
        "week_table":     "VpMobile24 Wochentabelle",
        "additional_info":"VpMobile24 Zusatzinfos",
        "changes":        "VpMobile24 \u00c4nderungen",
    },
    "fr": {
        "next_lesson":    "VpMobile24 Prochain Cours",
        "week_schedule":  "VpMobile24 Programme du jour",
        "week_table":     "VpMobile24 Tableau Hebdomadaire",
        "additional_info":"VpMobile24 Informations compl\u00e9mentaires",
        "changes":        "VpMobile24 Changements",
    },
}

# ---------------------------------------------------------------------------
# Multilingual state messages
# ---------------------------------------------------------------------------
STATE_MESSAGES: dict[str, dict[str, str]] = {
    "en": {
        "no_data":             "No data",
        "no_lessons_today":    "No more lessons today",
        "no_lessons":          "No lessons today",
        "lesson_today":        "lesson today",
        "lessons_today":       "lessons today",
        "no_additional_info":  "No additional info",
        "additional_info":     "additional info",
        "additional_infos":    "additional infos",
        "no_changes":          "No changes",
        "change":              "change",
        "changes":             "changes",
    },
    "de": {
        "no_data":             "Keine Daten",
        "no_lessons_today":    "Keine weiteren Stunden heute",
        "no_lessons":          "Keine Stunden heute",
        "lesson_today":        "Stunde heute",
        "lessons_today":       "Stunden heute",
        "no_additional_info":  "Keine Zusatzinfos",
        "additional_info":     "Zusatzinfo",
        "additional_infos":    "Zusatzinfos",
        "no_changes":          "Keine \u00c4nderungen",
        "change":              "\u00c4nderung",
        "changes":             "\u00c4nderungen",
    },
    "fr": {
        "no_data":             "Aucune donn\u00e9e",
        "no_lessons_today":    "Plus d'heures aujourd'hui",
        "no_lessons":          "Pas de cours aujourd'hui.",
        "lesson_today":        "Horaires aujourd'hui",
        "lessons_today":       "Horaires aujourd'hui",
        "no_additional_info":  "Aucune information suppl\u00e9mentaire",
        "additional_info":     "Informations Compl\u00e9mentaires",
        "additional_infos":    "Informations Compl\u00e9mentaires",
        "no_changes":          "Aucun changement",
        "change":              "changement",
        "changes":             "changements",
    },
}


# ---------------------------------------------------------------------------
# Helper: shared device_info dict
# ---------------------------------------------------------------------------
def _device_info(config_entry: ConfigEntry) -> dict:
    school_id = config_entry.data["school_id"]
    class_name = config_entry.data.get("class_name", "")
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


# ---------------------------------------------------------------------------
# Platform setup
# ---------------------------------------------------------------------------
async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up VpMobile24 sensors."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    ha_lang = getattr(hass.config, "language", "en") or "en"
    lang = ha_lang.split("-")[0].lower()
    if lang not in ("de", "en", "fr"):
        lang = "en"

    async_add_entities([
        VpMobile24NextLessonSensor(coordinator, config_entry, lang),
        VpMobile24WeekScheduleSensor(coordinator, config_entry, lang),
        VpMobile24WeekTableSensor(coordinator, config_entry, lang),
        VpMobile24AdditionalInfoSensor(coordinator, config_entry, lang),
        VpMobile24ChangesSensor(coordinator, config_entry, lang),
    ])


# ---------------------------------------------------------------------------
# Sensor: Next Lesson
# ---------------------------------------------------------------------------
class VpMobile24NextLessonSensor(CoordinatorEntity, SensorEntity):
    """Next upcoming lesson today."""

    def __init__(self, coordinator, config_entry: ConfigEntry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["next_lesson"]
        self._attr_unique_id = f"{config_entry.entry_id}_naechste_stunde"
        self._attr_icon = "mdi:clock-outline"

    @property
    def device_info(self) -> dict:
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        lesson = self._get_next_lesson()
        if not lesson:
            return STATE_MESSAGES[self._language]["no_lessons_today"]
        return f"{lesson.get('subject', '?')} - {lesson.get('time', '')}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        lesson = self._get_next_lesson()
        if not lesson:
            return {"status": STATE_MESSAGES[self._language]["no_lessons_today"]}
        return {
            "fach":         lesson.get("subject", ""),
            "zeit":         lesson.get("time", ""),
            "datum":        lesson.get("date", ""),
            "tag":          lesson.get("day_name", ""),
            "lehrer":       lesson.get("teacher", ""),
            "raum":         lesson.get("room", ""),
            "stunde":       lesson.get("period", ""),
            "zusatzinfo":   lesson.get("info", ""),
            "ist_vertretung": lesson.get("is_change", False),
        }

    def _get_next_lesson(self) -> dict[str, Any] | None:
        """Return the next lesson that hasn't started yet today."""
        lessons = (self.coordinator.data or {}).get("lessons", [])
        now = datetime.now()
        today = now.date()
        upcoming = []
        for lesson in lessons:
            date_str = lesson.get("date", "")
            time_start = lesson.get("time_start", "")
            if not date_str or not time_start or ":" not in time_start:
                continue
            try:
                if datetime.fromisoformat(date_str).date() != today:
                    continue
                h, m = map(int, time_start.split(":"))
                lesson_dt = datetime.combine(today, datetime.min.time().replace(hour=h, minute=m))
                if lesson_dt > now:
                    upcoming.append((lesson_dt, lesson))
            except (ValueError, TypeError):
                continue
        if upcoming:
            upcoming.sort(key=lambda x: x[0])
            return upcoming[0][1]
        return None


# ---------------------------------------------------------------------------
# Sensor: Today Schedule
# ---------------------------------------------------------------------------
class VpMobile24WeekScheduleSensor(CoordinatorEntity, SensorEntity):
    """All lessons for today."""

    def __init__(self, coordinator, config_entry: ConfigEntry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["week_schedule"]
        self._attr_unique_id = f"{config_entry.entry_id}_wochenstundenplan"
        self._attr_icon = "mdi:calendar-week"

    @property
    def device_info(self) -> dict:
        return _device_info(self._config_entry)

    def _today_lessons(self) -> list:
        data = self.coordinator.data or {}
        today = datetime.now().date().isoformat()
        result = []
        for lesson in data.get("lessons", []):
            if lesson.get("date") == today:
                result.append(lesson)
        for change in data.get("changes", []):
            if change.get("date") == today:
                result.append(change)
        return result

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        count = len(self._today_lessons())
        if count == 0:
            return STATE_MESSAGES[self._language]["no_lessons"]
        if count == 1:
            return f"1 {STATE_MESSAGES[self._language]['lesson_today']}"
        return f"{count} {STATE_MESSAGES[self._language]['lessons_today']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}

        today = datetime.now().date().isoformat()
        now = datetime.now()
        raw = self._today_lessons()
        raw.sort(key=lambda x: int(x.get("period", "0")) if str(x.get("period", "0")).isdigit() else 0)
        completed = self._complete_double_lessons(raw)

        subjects_count: dict[str, int] = {}
        today_lessons = []
        for lesson in completed:
            subject = lesson.get("subject", "")
            subjects_count[subject] = subjects_count.get(subject, 0) + 1

            info: dict[str, Any] = {
                "zeit":   lesson.get("time", ""),
                "fach":   subject,
                "lehrer": lesson.get("teacher", ""),
                "raum":   lesson.get("room", ""),
                "stunde": lesson.get("period", ""),
                "datum":  lesson.get("date", ""),
                "tag":    lesson.get("day_name", ""),
            }
            if lesson.get("info"):
                info["zusatzinfo"] = lesson["info"]
            if lesson.get("is_change"):
                info["ist_vertretung"] = True
            if lesson.get("ist_doppelstunde"):
                info["ist_doppelstunde"] = True

            time_start = lesson.get("time_start", "")
            if time_start and ":" in time_start:
                try:
                    h, m = map(int, time_start.split(":"))
                    lesson_dt = datetime.combine(now.date(), datetime.min.time().replace(hour=h, minute=m))
                    info["ist_vorbei"] = lesson_dt <= now
                except (ValueError, TypeError):
                    info["ist_vorbei"] = False
            else:
                info["ist_vorbei"] = False

            today_lessons.append(info)

        today_lessons.sort(
            key=lambda x: int(x.get("stunde", "0")) if str(x.get("stunde", "0")).isdigit() else 0
        )

        return {
            "stunden_heute":       today_lessons,
            "faecher_anzahl":      subjects_count,
            "gesamt_stunden":      len(today_lessons),
            "datum":               today,
            "klasse":              getattr(self.coordinator, "class_name", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }

    def _complete_double_lessons(self, lessons: list) -> list:
        """Fill in the missing half of double lessons."""
        if not lessons:
            return lessons

        by_period: dict[int, dict] = {}
        for lesson in lessons:
            p = lesson.get("period", "")
            if str(p).isdigit():
                by_period[int(p)] = lesson

        if not by_period:
            return lessons

        result = []
        min_p = min(by_period)
        max_p = max(by_period)

        for period in range(min_p, max_p + 1):
            if period in by_period:
                result.append(by_period[period])
                continue

            prev = by_period.get(period - 1)
            nxt  = by_period.get(period + 1)

            if prev and prev.get("subject"):
                nxt_check = by_period.get(period + 1)
                if nxt_check and nxt_check.get("subject") != prev.get("subject"):
                    continue
                double = prev.copy()
                double["period"] = str(period)
                double["ist_doppelstunde"] = True
                ts = prev.get("time_start", "")
                if ts and ":" in ts:
                    try:
                        h, m = map(int, ts.split(":"))
                        m += 45
                        if m >= 60:
                            h += 1; m -= 60
                        te_m = m + 45
                        te_h = h + (1 if te_m >= 60 else 0)
                        te_m = te_m - 60 if te_m >= 60 else te_m
                        double["time_start"] = f"{h:02d}:{m:02d}"
                        double["time_end"]   = f"{te_h:02d}:{te_m:02d}"
                        double["time"]       = f"{h:02d}:{m:02d}-{te_h:02d}:{te_m:02d}"
                    except (ValueError, TypeError):
                        pass
                result.append(double)

            elif nxt and nxt.get("subject"):
                prev_check = by_period.get(period - 1)
                if prev_check and prev_check.get("subject") != nxt.get("subject"):
                    continue
                double = nxt.copy()
                double["period"] = str(period)
                double["ist_doppelstunde"] = True
                ts = nxt.get("time_start", "")
                if ts and ":" in ts:
                    try:
                        h, m = map(int, ts.split(":"))
                        m -= 45
                        if m < 0:
                            h -= 1; m += 60
                        te_m = m + 45
                        te_h = h + (1 if te_m >= 60 else 0)
                        te_m = te_m - 60 if te_m >= 60 else te_m
                        double["time_start"] = f"{h:02d}:{m:02d}"
                        double["time_end"]   = f"{te_h:02d}:{te_m:02d}"
                        double["time"]       = f"{h:02d}:{m:02d}-{te_h:02d}:{te_m:02d}"
                    except (ValueError, TypeError):
                        pass
                result.append(double)

        return result


# ---------------------------------------------------------------------------
# Sensor: Week Table
# ---------------------------------------------------------------------------
class VpMobile24WeekTableSensor(CoordinatorEntity, SensorEntity):
    """Full week timetable as a structured attribute."""

    def __init__(self, coordinator, config_entry: ConfigEntry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["week_table"]
        self._attr_unique_id = f"{config_entry.entry_id}_week_table"
        self._attr_icon = "mdi:table"

    @property
    def device_info(self) -> dict:
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        week_lessons = self.coordinator.data.get("week_lessons", [])
        week_changes = self.coordinator.data.get("week_changes", [])
        total = len(week_lessons) + len(week_changes)
        if total == 0:
            return STATE_MESSAGES[self._language]["no_lessons"]
        return f"{total} {STATE_MESSAGES[self._language]['lessons_today']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        week_lessons = self.coordinator.data.get("week_lessons", [])
        week_changes = self.coordinator.data.get("week_changes", [])
        all_lessons = week_lessons + week_changes
        return {
            "week_table":          self._build_week_table(all_lessons),
            "total_lessons":       len(all_lessons),
            "week_lessons_count":  len(week_lessons),
            "week_changes_count":  len(week_changes),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }

    def _build_week_table(self, lessons: list) -> dict:
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        table: dict = {day: {str(p): None for p in range(1, 11)} for day in weekdays}
        for lesson in lessons:
            date_str = lesson.get("date", "")
            period   = lesson.get("period", "")
            if not date_str or not period:
                continue
            try:
                wd = datetime.fromisoformat(date_str).weekday()
                if 0 <= wd <= 4 and str(period).isdigit() and 1 <= int(period) <= 10:
                    table[weekdays[wd]][period] = {
                        "fach":         lesson.get("subject", ""),
                        "lehrer":       lesson.get("teacher", ""),
                        "raum":         lesson.get("room", ""),
                        "zeit":         lesson.get("time", ""),
                        "datum":        date_str,
                        "ist_vertretung": lesson.get("is_change", False),
                        "zusatzinfo":   lesson.get("info", ""),
                    }
            except (ValueError, TypeError):
                continue
        return table


# ---------------------------------------------------------------------------
# Sensor: Additional Info
# ---------------------------------------------------------------------------
class VpMobile24AdditionalInfoSensor(CoordinatorEntity, SensorEntity):
    """Additional info (ZusatzInfo) for the whole week."""

    def __init__(self, coordinator, config_entry: ConfigEntry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["additional_info"]
        self._attr_unique_id = f"{config_entry.entry_id}_zusatzinfos"
        self._attr_icon = "mdi:information-outline"

    @property
    def device_info(self) -> dict:
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        week_infos = self._build_week_infos()
        total = sum(
            len(v.get("allgemeine_infos", [])) + len(v.get("stunden_infos", []))
            for v in week_infos.values()
        )
        if total == 0:
            return STATE_MESSAGES[self._language]["no_additional_info"]
        if total == 1:
            return f"1 {STATE_MESSAGES[self._language]['additional_info']}"
        return f"{total} {STATE_MESSAGES[self._language]['additional_infos']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        week_infos = self._build_week_infos()
        today_str = datetime.now().date().isoformat()
        today_key = self._date_to_weekday_key(today_str)
        today_data = week_infos.get(today_key, {})
        return {
            "week_infos":              week_infos,
            "allgemeine_infos":        today_data.get("allgemeine_infos", []),
            "stunden_infos":           today_data.get("stunden_infos", []),
            "anzahl_allgemeine_infos": len(today_data.get("allgemeine_infos", [])),
            "anzahl_stunden_infos":    len(today_data.get("stunden_infos", [])),
            "gesamt_infos": sum(
                len(v.get("allgemeine_infos", [])) + len(v.get("stunden_infos", []))
                for v in week_infos.values()
            ),
            "datum":                   today_str,
            "letzte_aktualisierung":   self.coordinator.data.get("timestamp", ""),
        }

    def _date_to_weekday_key(self, date_str: str) -> str:
        keys = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        try:
            wd = datetime.fromisoformat(date_str).weekday()
            return keys[wd] if 0 <= wd <= 4 else ""
        except (ValueError, TypeError):
            return ""

    def _build_week_infos(self) -> dict:
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        result: dict = {d: {"allgemeine_infos": [], "stunden_infos": [], "datum": ""} for d in weekdays}
        data = self.coordinator.data or {}

        # General ZusatzInfo from the per-day cache
        cache: dict = getattr(self.coordinator, "_week_data_cache", {})
        for date_str, day_cache in cache.items():
            key = self._date_to_weekday_key(date_str)
            if not key:
                continue
            result[key]["datum"] = date_str
            for info in day_cache.get("additional_info", []):
                text = (info.get("text", "") if isinstance(info, dict) else str(info)).strip()
                if text and text not in result[key]["allgemeine_infos"]:
                    result[key]["allgemeine_infos"].append(text)

        # Lesson-level info (If field)
        all_lessons = (
            data.get("week_lessons", [])
            + data.get("week_changes", [])
            + data.get("lessons", [])
            + data.get("changes", [])
        )
        seen: set = set()
        for lesson in all_lessons:
            info_text = (lesson.get("info") or "").strip()
            if not info_text:
                continue
            key = self._date_to_weekday_key(lesson.get("date", ""))
            if not key:
                continue
            subject  = lesson.get("subject", "")
            time_val = lesson.get("time", "")
            ctx = f" ({subject} \u2013 {time_val})" if subject and time_val else (f" ({subject})" if subject else "")
            entry = f"{info_text}{ctx}"
            uid = (key, entry)
            if uid not in seen:
                seen.add(uid)
                result[key]["stunden_infos"].append(entry)

        return result


# ---------------------------------------------------------------------------
# Sensor: Changes
# ---------------------------------------------------------------------------
class VpMobile24ChangesSensor(CoordinatorEntity, SensorEntity):
    """Substitutions and schedule changes."""

    def __init__(self, coordinator, config_entry: ConfigEntry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["changes"]
        self._attr_unique_id = f"{config_entry.entry_id}_aenderungen"
        self._attr_icon = "mdi:swap-horizontal"

    @property
    def device_info(self) -> dict:
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        total = self._count_changes()
        if total == 0:
            return STATE_MESSAGES[self._language]["no_changes"]
        if total == 1:
            return f"1 {STATE_MESSAGES[self._language]['change']}"
        return f"{total} {STATE_MESSAGES[self._language]['changes']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        data = self.coordinator.data
        excluded = getattr(self.coordinator, "excluded_subjects", [])
        changes  = data.get("changes", [])
        lessons  = data.get("lessons", [])

        all_changes: list[dict] = []

        for change in changes:
            subject = change.get("subject", "")
            if subject and subject in excluded:
                continue
            entry: dict[str, Any] = {
                "typ":         "\u00c4nderung",
                "zeit":        change.get("time", ""),
                "fach":        subject,
                "datum":       change.get("date", ""),
                "tag":         change.get("day_name", ""),
                "beschreibung": change.get("description", ""),
            }
            if change.get("teacher"):
                entry["lehrer"] = change["teacher"]
            if change.get("room"):
                entry["raum"] = change["room"]
            if change.get("period"):
                entry["stunde"] = change["period"]
            all_changes.append(entry)

        for lesson in lessons:
            if not lesson.get("is_change"):
                continue
            entry = {
                "typ":    "Vertretung",
                "zeit":   lesson.get("time", ""),
                "fach":   lesson.get("subject", ""),
                "datum":  lesson.get("date", ""),
                "tag":    lesson.get("day_name", ""),
                "lehrer": lesson.get("teacher", ""),
                "raum":   lesson.get("room", ""),
                "stunde": lesson.get("period", ""),
            }
            if lesson.get("info"):
                entry["grund"] = lesson["info"]
            all_changes.append(entry)

        return {
            "alle_aenderungen":    all_changes,
            "anzahl_aenderungen":  len([c for c in changes if c.get("subject", "") not in excluded]),
            "anzahl_vertretungen": sum(1 for l in lessons if l.get("is_change")),
            "gesamt_aenderungen":  len(all_changes),
            "datum":               data.get("date", ""),
            "letzte_aktualisierung": data.get("timestamp", ""),
        }

    def _count_changes(self) -> int:
        data = self.coordinator.data or {}
        excluded = getattr(self.coordinator, "excluded_subjects", [])
        changes = [
            c for c in data.get("changes", [])
            if c.get("subject", "") not in excluded
        ]
        substitutions = sum(1 for l in data.get("lessons", []) if l.get("is_change"))
        return len(changes) + substitutions
