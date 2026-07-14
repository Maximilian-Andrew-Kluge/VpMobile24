"""Sensor platform für VpMobile24."""
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

SENSOR_NAMES = {
    "en": {
        "next_lesson": "VpMobile24 Next Lesson",
        "week_schedule": "VpMobile24 Today Schedule",
        "week_table": "VpMobile24 Week Table",
        "additional_info": "VpMobile24 Additional Info",
        "changes": "VpMobile24 Changes",
        "current_lesson": "VpMobile24 Current Lesson",
    },
    "de": {
        "next_lesson": "VpMobile24 Nächste Stunde",
        "week_schedule": "VpMobile24 Heutiger Stundenplan",
        "week_table": "VpMobile24 Wochentabelle",
        "additional_info": "VpMobile24 Zusatzinfos",
        "changes": "VpMobile24 Änderungen",
        "current_lesson": "VpMobile24 Aktueller Unterricht",
    },
    "fr": {
        "next_lesson": "VpMobile24 Prochain Cours",
        "week_schedule": "VpMobile24 Programme du jour",
        "week_table": "VpMobile24 Tableau Hebdomadaire",
        "additional_info": "VpMobile24 Informations complémentaires",
        "changes": "VpMobile24 Changements",
        "current_lesson": "VpMobile24 Cours actuel",
    },
}

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
        "changes": "changes",
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
        "changes": "Änderungen",
    },
    "fr": {
        "no_data": "Aucune donnée",
        "no_lessons_today": "Plus d'heures aujourd'hui",
        "no_lessons": "Pas de cours aujourd'hui.",
        "lesson_today": "Horaires aujourd'hui",
        "lessons_today": "Horaires aujourd'hui",
        "no_additional_info": "Aucune information supplémentaire",
        "additional_info": "Informations Complémentaires",
        "additional_infos": "Informations Complémentaires",
        "no_changes": "Aucun changement",
        "change": "changement",
        "changes": "changements",
    },
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up VpMobile24 sensors."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    ha_lang = getattr(hass.config, "language", "en") or "en"
    lang_short = ha_lang.split("-")[0].lower()
    language = lang_short if lang_short in ("de", "en", "fr") else "en"

    async_add_entities([
        VpMobile24NextLessonSensor(coordinator, config_entry, language),
        VpMobile24WeekScheduleSensor(coordinator, config_entry, language),
        VpMobile24WeekTableSensor(coordinator, config_entry, language),
        VpMobile24AdditionalInfoSensor(coordinator, config_entry, language),
        VpMobile24ChangesSensor(coordinator, config_entry, language),
        VpMobile24CurrentLessonSensor(coordinator, config_entry, language),
        VpMobile24HolidaySensor(coordinator, config_entry, language),
    ])


def _device_info(config_entry) -> dict:
    """Return shared device info dict."""
    school_id = config_entry.data["school_id"]
    # options override data when class was changed via options flow
    class_name = config_entry.options.get("class_name") or config_entry.data.get("class_name", "")
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
        "sw_version": "2.5.0",
    }


class VpMobile24NextLessonSensor(CoordinatorEntity, SensorEntity):
    """Sensor für die nächste Unterrichtsstunde."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["next_lesson"]
        self._attr_unique_id = f"{config_entry.entry_id}_naechste_stunde"
        self._attr_icon = "mdi:clock-outline"

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        lesson = self._get_next_lesson()
        if not lesson:
            return STATE_MESSAGES[self._language]["no_lessons_today"]
        return f"{lesson.get('subject', '')} - {lesson.get('time', '')}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        lesson = self._get_next_lesson()
        if not lesson:
            return {"status": STATE_MESSAGES[self._language]["no_lessons_today"]}
        # Calculate countdown
        countdown_min = None
        time_start = lesson.get("time_start", "")
        if time_start and ":" in time_start:
            try:
                now = datetime.now()
                h, m = map(int, time_start.split(":"))
                lesson_dt = now.replace(hour=h, minute=m, second=0, microsecond=0)
                diff = int((lesson_dt - now).total_seconds() / 60)
                countdown_min = max(0, diff)
            except (ValueError, TypeError):
                pass
        attrs = {
            "fach": lesson.get("subject", ""),
            "zeit": lesson.get("time", ""),
            "datum": lesson.get("date", ""),
            "tag": lesson.get("day_name", ""),
            "lehrer": lesson.get("teacher", ""),
            "raum": lesson.get("room", ""),
            "stunde": lesson.get("period", ""),
            "zusatzinfo": lesson.get("info", ""),
            "ist_vertretung": lesson.get("is_change", False),
        }
        if countdown_min is not None:
            attrs["countdown_minuten"] = countdown_min
            if countdown_min < 60:
                attrs["countdown_text"] = f"in {countdown_min} Min."
            else:
                h = countdown_min // 60
                m = countdown_min % 60
                attrs["countdown_text"] = f"in {h}h {m}min" if m else f"in {h}h"
        return attrs

    def _get_next_lesson(self) -> dict[str, Any] | None:
        if not self.coordinator.data:
            return None
        # Include both regular lessons and substitutions (changes)
        all_lessons = (
            self.coordinator.data.get("lessons", []) +
            self.coordinator.data.get("changes", [])
        )
        now = datetime.now()
        today = now.date()
        candidates = []
        for lesson in all_lessons:
            date_str = lesson.get("date", "")
            time_start = lesson.get("time_start", "")
            subject = lesson.get("subject", "")
            if not date_str or not time_start or ":" not in time_start:
                continue
            # Skip cancelled lessons as "next lesson"
            if not subject or subject.strip() in ["\u2014", "---", "", "-", " "]:
                continue
            try:
                if datetime.fromisoformat(date_str).date() != today:
                    continue
                h, m = map(int, time_start.split(":"))
                lesson_dt = now.replace(hour=h, minute=m, second=0, microsecond=0)
                if lesson_dt > now:
                    candidates.append((lesson_dt, lesson))
            except (ValueError, TypeError):
                continue
        if candidates:
            candidates.sort(key=lambda x: x[0])
            return candidates[0][1]
        return None


class VpMobile24WeekScheduleSensor(CoordinatorEntity, SensorEntity):
    """Sensor für den heutigen Stundenplan."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["week_schedule"]
        self._attr_unique_id = f"{config_entry.entry_id}_wochenstundenplan"
        self._attr_icon = "mdi:calendar-week"

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        today = datetime.now().date().isoformat()
        count = sum(
            1 for item in (
                self.coordinator.data.get("lessons", []) +
                self.coordinator.data.get("changes", [])
            )
            if item.get("date") == today
        )
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
        lessons = self.coordinator.data.get("lessons", [])
        changes = self.coordinator.data.get("changes", [])
        all_today = [
            item for item in lessons + changes
            if item.get("date") == today
        ]
        all_today.sort(key=lambda x: int(x.get("period", "0")) if str(x.get("period", "0")).isdigit() else 0)
        completed = self._complete_double_lessons(all_today)
        subjects_count: dict[str, int] = {}
        today_lessons = []
        for lesson in completed:
            subj = lesson.get("subject", "")
            subjects_count[subj] = subjects_count.get(subj, 0) + 1
            info: dict[str, Any] = {
                "zeit": lesson.get("time", ""),
                "fach": subj,
                "lehrer": lesson.get("teacher", ""),
                "raum": lesson.get("room", ""),
                "stunde": lesson.get("period", ""),
                "datum": lesson.get("date", ""),
                "tag": lesson.get("day_name", ""),
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
                    lesson_dt = now.replace(hour=h, minute=m, second=0, microsecond=0)
                    info["ist_vorbei"] = lesson_dt <= now
                except (ValueError, TypeError):
                    info["ist_vorbei"] = False
            else:
                info["ist_vorbei"] = False
            today_lessons.append(info)
        today_lessons.sort(key=lambda x: int(x.get("stunde", "0")) if str(x.get("stunde", "0")).isdigit() else 0)
        return {
            "stunden_heute": today_lessons,
            "faecher_anzahl": subjects_count,
            "gesamt_stunden": len(today_lessons),
            "datum": today,
            "klasse": getattr(self.coordinator, "class_name", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }

    def _complete_double_lessons(self, lessons: list) -> list:
        """Ergänze fehlende Stunden für Doppelstunden."""
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
        for period in range(min(by_period), max(by_period) + 1):
            if period in by_period:
                result.append(by_period[period])
                continue
            prev = by_period.get(period - 1)
            nxt = by_period.get(period + 1)
            if prev and prev.get("subject"):
                nxt_check = by_period.get(period + 1)
                if nxt_check and nxt_check.get("subject") != prev.get("subject"):
                    continue
                double = prev.copy()
                double["period"] = str(period)
                ts = prev.get("time_start", "")
                if ts and ":" in ts:
                    try:
                        h, m = map(int, ts.split(":"))
                        m += 45
                        if m >= 60:
                            h += 1
                            m -= 60
                        s = f"{h:02d}:{m:02d}"
                        em = m + 45
                        e = f"{h:02d}:{em:02d}" if em < 60 else f"{h+1:02d}:{em-60:02d}"
                        double["time_start"] = s
                        double["time_end"] = e
                        double["time"] = f"{s}-{e}"
                    except (ValueError, TypeError):
                        pass
                double["ist_doppelstunde"] = True
                result.append(double)
            elif nxt and nxt.get("subject"):
                prev_check = by_period.get(period - 1)
                if prev_check and prev_check.get("subject") != nxt.get("subject"):
                    continue
                double = nxt.copy()
                double["period"] = str(period)
                ts = nxt.get("time_start", "")
                if ts and ":" in ts:
                    try:
                        h, m = map(int, ts.split(":"))
                        m -= 45
                        if m < 0:
                            h -= 1
                            m += 60
                        s = f"{h:02d}:{m:02d}"
                        em = m + 45
                        e = f"{h:02d}:{em:02d}" if em < 60 else f"{h+1:02d}:{em-60:02d}"
                        double["time_start"] = s
                        double["time_end"] = e
                        double["time"] = f"{s}-{e}"
                    except (ValueError, TypeError):
                        pass
                double["ist_doppelstunde"] = True
                result.append(double)
        return result


class VpMobile24WeekTableSensor(CoordinatorEntity, SensorEntity):
    """Sensor für die komplette Wochenstundenplan-Tabelle."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["week_table"]
        self._attr_unique_id = f"{config_entry.entry_id}_week_table"
        self._attr_icon = "mdi:table"

    @property
    def device_info(self):
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
        if total == 1:
            return f"1 {STATE_MESSAGES[self._language]['lesson_today']}"
        return f"{total} {STATE_MESSAGES[self._language]['lessons_today']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        week_lessons = self.coordinator.data.get("week_lessons", [])
        week_changes = self.coordinator.data.get("week_changes", [])
        all_lessons = week_lessons + week_changes

        # Build next week table from coordinator cache
        from datetime import date, timedelta
        today = date.today()
        days_to_monday = today.weekday()
        next_monday = today - timedelta(days=days_to_monday) + timedelta(weeks=1)
        next_week_dates = {
            (next_monday + timedelta(days=i)).isoformat()
            for i in range(5)
        }
        cache = getattr(self.coordinator, "_week_data_cache", {})
        excluded = getattr(self.coordinator, "excluded_subjects", [])
        selected = getattr(self.coordinator, "selected_courses", [])

        def _should_include(lesson: dict) -> bool:
            subj   = lesson.get("subject", "") or ""
            course = lesson.get("course",  "") or ""
            if subj and subj in excluded:
                return False
            if selected and course and course not in selected:
                if any(c.isdigit() for c in course):
                    return False
            is_cancelled = not subj or subj.strip() in ["\u2014", "---", "", "-", " "]
            if is_cancelled and course:
                if course in excluded:
                    return False
                if selected and course not in selected and any(c.isdigit() for c in course):
                    return False
            return True

        next_week_lessons = []
        next_next_week_lessons = []
        for date_str, day_data in cache.items():
            if date_str in next_week_dates:
                for lesson in day_data.get("lessons", []) + day_data.get("changes", []):
                    if not _should_include(lesson):
                        continue
                    lesson_copy = lesson.copy()
                    lesson_copy["date"] = date_str
                    next_week_lessons.append(lesson_copy)

        # Build next_next_week_table (offset=2)
        next_next_monday = next_monday + timedelta(weeks=1)
        next_next_week_dates = {
            (next_next_monday + timedelta(days=i)).isoformat()
            for i in range(5)
        }
        for date_str, day_data in cache.items():
            if date_str in next_next_week_dates:
                for lesson in day_data.get("lessons", []) + day_data.get("changes", []):
                    if not _should_include(lesson):
                        continue
                    lesson_copy = lesson.copy()
                    lesson_copy["date"] = date_str
                    next_next_week_lessons.append(lesson_copy)

        return {
            "week_table": self._create_week_table(all_lessons),
            "next_week_table": self._create_week_table(next_week_lessons),
            "next_next_week_table": self._create_week_table(next_next_week_lessons),
            "class": getattr(self.coordinator, "class_name", ""),
            "total_lessons": len(all_lessons),
            "week_lessons_count": len(week_lessons),
            "week_changes_count": len(week_changes),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }

    def _create_week_table(self, all_lessons: list) -> dict:
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        table: dict = {day: {str(p): None for p in range(1, 11)} for day in weekdays}
        for lesson in all_lessons:
            date_str = lesson.get("date", "")
            period = lesson.get("period", "")
            if not date_str or not period:
                continue
            try:
                wd = datetime.fromisoformat(date_str).weekday()
                if 0 <= wd <= 4 and str(period).isdigit() and 1 <= int(period) <= 10:
                    table[weekdays[wd]][period] = {
                        "fach": lesson.get("subject", ""),
                        "lehrer": lesson.get("teacher", ""),
                        "raum": lesson.get("room", ""),
                        "zeit": lesson.get("time", ""),
                        "datum": date_str,
                        "ist_vertretung": lesson.get("is_change", False),
                        "zusatzinfo": lesson.get("info", ""),
                    }
            except (ValueError, TypeError):
                continue
        return table


class VpMobile24AdditionalInfoSensor(CoordinatorEntity, SensorEntity):
    """Sensor für zusätzliche Informationen – gesamte Woche."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["additional_info"]
        self._attr_unique_id = f"{config_entry.entry_id}_zusatzinfos"
        self._attr_icon = "mdi:information-outline"

    @property
    def device_info(self):
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
            "week_infos": week_infos,
            "allgemeine_infos": today_data.get("allgemeine_infos", []),
            "stunden_infos": today_data.get("stunden_infos", []),
            "anzahl_allgemeine_infos": len(today_data.get("allgemeine_infos", [])),
            "anzahl_stunden_infos": len(today_data.get("stunden_infos", [])),
            "gesamt_infos": sum(
                len(v.get("allgemeine_infos", [])) + len(v.get("stunden_infos", []))
                for v in week_infos.values()
            ),
            "datum": today_str,
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
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
        result: dict[str, dict] = {
            d: {"allgemeine_infos": [], "stunden_infos": [], "datum": ""}
            for d in weekdays
        }
        data = self.coordinator.data or {}
        # General ZusatzInfo from XML cache
        week_data_cache: dict = getattr(self.coordinator, "_week_data_cache", {})
        for date_str, day_cache in week_data_cache.items():
            key = self._date_to_weekday_key(date_str)
            if not key:
                continue
            result[key]["datum"] = date_str
            for info in day_cache.get("additional_info", []):
                text = info.get("text", "").strip() if isinstance(info, dict) else str(info).strip()
                if text and text not in result[key]["allgemeine_infos"]:
                    result[key]["allgemeine_infos"].append(text)
        # Lesson-level info (If field)
        all_lessons = (
            data.get("week_lessons", []) + data.get("week_changes", []) +
            data.get("lessons", []) + data.get("changes", [])
        )
        seen: set = set()
        for lesson in all_lessons:
            info_text = (lesson.get("info") or "").strip()
            if not info_text:
                continue
            key = self._date_to_weekday_key(lesson.get("date", ""))
            if not key:
                continue
            subject = lesson.get("subject", "")
            time_val = lesson.get("time", "")
            context = (
                f" ({subject} \u2013 {time_val})" if subject and time_val
                else (f" ({subject})" if subject else "")
            )
            entry = f"{info_text}{context}"
            uid = (key, entry)
            if uid not in seen:
                seen.add(uid)
                result[key]["stunden_infos"].append(entry)
        return result


class VpMobile24ChangesSensor(CoordinatorEntity, SensorEntity):
    """Sensor für Stundenplanänderungen und Vertretungen."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["changes"]
        self._attr_unique_id = f"{config_entry.entry_id}_aenderungen"
        self._attr_icon = "mdi:swap-horizontal"

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        if not self.coordinator.data:
            return STATE_MESSAGES[self._language]["no_data"]
        # Coordinator already filters by excluded_subjects
        total = len(self.coordinator.data.get("changes", []))
        if total == 0:
            return STATE_MESSAGES[self._language]["no_changes"]
        if total == 1:
            return f"1 {STATE_MESSAGES[self._language]['change']}"
        return f"{total} {STATE_MESSAGES[self._language]['changes']}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.coordinator.data:
            return {}
        changes = self.coordinator.data.get("changes", [])
        lessons = self.coordinator.data.get("lessons", [])
        all_changes = []
        for change in changes:
            entry: dict[str, Any] = {
                "typ": "Änderung",
                "zeit": change.get("time", ""),
                "fach": change.get("subject", ""),
                "datum": change.get("date", ""),
                "tag": change.get("day_name", ""),
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
            if lesson.get("is_change"):
                entry = {
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
                    entry["grund"] = lesson["info"]
                all_changes.append(entry)
        return {
            "alle_aenderungen": all_changes,
            "anzahl_aenderungen": len(changes),
            "anzahl_vertretungen": sum(1 for l in lessons if l.get("is_change")),
            "gesamt_aenderungen": len(all_changes),
            "datum": self.coordinator.data.get("date", ""),
            "letzte_aktualisierung": self.coordinator.data.get("timestamp", ""),
        }


class VpMobile24NextFreePeriodSensor(CoordinatorEntity, SensorEntity):
    """Sensor für die nächste freie Stunde heute."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["next_free_period"]
        self._attr_unique_id = f"{config_entry.entry_id}_naechste_freie_stunde"
        self._attr_icon = "mdi:clock-check-outline"

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        result = self._get_next_free()
        if not result:
            return STATE_MESSAGES[self._language]["no_data"]
        return result["state"]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        result = self._get_next_free()
        if not result:
            return {}
        return result["attrs"]

    def _get_next_free(self) -> dict | None:
        """Find the next free/cancelled period today that is still in the future."""
        if not self.coordinator.data:
            return None
        today = datetime.now().date().isoformat()
        now = datetime.now()

        # Build a dict of period -> lesson for today
        today_lessons: dict[int, dict] = {}
        for lesson in self.coordinator.data.get("lessons", []):
            if lesson.get("date") == today:
                p = lesson.get("period", "")
                if str(p).isdigit():
                    today_lessons[int(p)] = lesson

        # Walk periods 1–10, find first future free/cancelled slot
        for period in range(1, 11):
            lesson = today_lessons.get(period)
            if lesson is None:
                continue  # no entry at all — not a known free period
            subj = lesson.get("subject", "").strip()
            is_cancelled = not subj or subj in ["\u2014", "---", "", "-", " "]
            if not is_cancelled:
                continue
            # Check if it's still in the future
            ts = lesson.get("time_start", "")
            if ts and ":" in ts:
                try:
                    h, m = map(int, ts.split(":"))
                    lesson_dt = now.replace(hour=h, minute=m, second=0, microsecond=0)
                    if lesson_dt <= now:
                        continue  # already past
                except (ValueError, TypeError):
                    pass
            time_str = lesson.get("time", "")
            state = f"{period}. Stunde"
            if time_str:
                state += f" ({time_str})"
            return {
                "state": state,
                "attrs": {
                    "stunde": period,
                    "zeit": time_str,
                    "datum": today,
                    "info": lesson.get("info", ""),
                },
            }
        return {"state": "Keine freie Stunde heute", "attrs": {"datum": today}}


class VpMobile24CurrentLessonSensor(CoordinatorEntity, SensorEntity):
    """Sensor für den aktuell laufenden Unterricht."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._language = language
        self._attr_name = SENSOR_NAMES[language]["current_lesson"]
        self._attr_unique_id = f"{config_entry.entry_id}_aktueller_unterricht"
        self._attr_icon = "mdi:school"

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    @property
    def state(self) -> str | None:
        lesson = self._get_current_lesson()
        if not lesson:
            return STATE_MESSAGES[self._language]["no_data"]
        subj = lesson.get("subject", "")
        if not subj or subj.strip() in ["\u2014", "---", "", "-"]:
            return "Ausfall"
        return subj

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        lesson = self._get_current_lesson()
        if not lesson:
            return {"status": "Kein laufender Unterricht"}
        subj = lesson.get("subject", "")
        is_cancelled = not subj or subj.strip() in ["\u2014", "---", "", "-"]
        return {
            "fach": subj,
            "zeit": lesson.get("time", ""),
            "zeit_start": lesson.get("time_start", ""),
            "zeit_ende": lesson.get("time_end", ""),
            "lehrer": lesson.get("teacher", ""),
            "raum": lesson.get("room", ""),
            "stunde": lesson.get("period", ""),
            "ist_ausfall": is_cancelled,
            "ist_vertretung": lesson.get("is_change", False) and not is_cancelled,
            "zusatzinfo": lesson.get("info", ""),
            "datum": lesson.get("date", ""),
        }

    def _get_current_lesson(self) -> dict[str, Any] | None:
        """Find the lesson currently running right now."""
        if not self.coordinator.data:
            return None
        today = datetime.now().date().isoformat()
        now = datetime.now()
        now_mins = now.hour * 60 + now.minute

        # Check both regular lessons AND changes (Vertretungen land in changes)
        all_lessons = (
            self.coordinator.data.get("lessons", []) +
            self.coordinator.data.get("changes", [])
        )

        for lesson in all_lessons:
            if lesson.get("date") != today:
                continue
            ts = lesson.get("time_start", "")
            te = lesson.get("time_end", "")
            if not ts or not te or ":" not in ts or ":" not in te:
                continue
            try:
                sh, sm = map(int, ts.split(":"))
                eh, em = map(int, te.split(":"))
                start = sh * 60 + sm
                end = eh * 60 + em
                if start <= now_mins <= end:
                    return lesson
            except (ValueError, TypeError):
                continue
        return None


class VpMobile24HolidaySensor(SensorEntity):
    """Sensor für Schulferien – lädt Daten direkt von ferien-api.de."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        self._config_entry = config_entry
        self._language = language
        self._attr_name = "VpMobile24 Ferien"
        self._attr_unique_id = f"{config_entry.entry_id}_ferien"
        self._attr_icon = "mdi:beach"
        self._attr_should_poll = True
        self._current_holiday: dict | None = None
        self._next_holiday: dict | None = None

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    @property
    def device_info(self):
        return _device_info(self._config_entry)

    def _state_code(self) -> str:
        code = (
            self._config_entry.options.get("state_code")
            or self._config_entry.data.get("state_code", "")
        )
        if code.startswith("DE-"):
            code = code[3:]
        return code

    @property
    def state(self) -> str:
        if self._current_holiday:
            return self._current_holiday.get("name", "Ferien")
        return "Kein Ferien"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        ch = self._current_holiday
        nh = self._next_holiday
        return {
            "ist_ferien": ch is not None,
            "name":  ch.get("name")  if ch else None,
            "start": ch.get("start") if ch else None,
            "end":   ch.get("end")   if ch else None,
            "naechste_ferien_name":  nh.get("name")  if nh else None,
            "naechste_ferien_start": nh.get("start") if nh else None,
            "naechste_ferien_end":   nh.get("end")   if nh else None,
            "bundesland": self._state_code(),
            "manuell": False,
        }

    async def async_update(self) -> None:
        """Fetch holiday data directly from ferien-api.de."""
        state_code = self._state_code()
        if not state_code:
            return

        try:
            import aiohttp
            from datetime import date
            today = date.today()
            year = today.year
            all_holidays = []

            async with aiohttp.ClientSession() as session:
                for y in [year, year + 1]:
                    url = f"https://ferien-api.de/api/v1/holidays/{state_code}/{y}"
                    try:
                        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                            if resp.status == 200:
                                data = await resp.json()
                                if isinstance(data, list):
                                    all_holidays.extend(data)
                    except Exception:
                        pass

            self._holiday_data = all_holidays
            self._current_holiday = None
            self._next_holiday = None

            for h in all_holidays:
                try:
                    h_start = datetime.fromisoformat(h.get("start", "")).date()
                    h_end   = datetime.fromisoformat(h.get("end", "")).date()
                    name    = h.get("name", "Ferien").title()
                    if h_start <= today <= h_end:
                        self._current_holiday = {"name": name, "start": h.get("start"), "end": h.get("end")}
                    elif h_start > today and self._next_holiday is None:
                        self._next_holiday = {"name": name, "start": h.get("start"), "end": h.get("end")}
                except (ValueError, TypeError):
                    continue

            self._data_loaded = True

        except Exception as err:
            _LOGGER.debug("VpMobile24HolidaySensor: error fetching holidays: %s", err)

