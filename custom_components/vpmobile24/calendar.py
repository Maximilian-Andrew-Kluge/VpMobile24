"""Calendar platform for vpmobile24."""
from __future__ import annotations

from datetime import datetime, date, timedelta
from typing import Any

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import DOMAIN


CALENDAR_NAMES = {
    "de": "VpMobile24 Wochenkalender",
    "en": "VpMobile24 Week Calendar",
    "fr": "VpMobile24 Calendrier Hebdomadaire",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the calendar platform."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    ha_lang = getattr(hass.config, "language", "en") or "en"
    lang_short = ha_lang.split("-")[0].lower()
    language = lang_short if lang_short in ("de", "en", "fr") else "en"

    async_add_entities([VpMobile24WeekCalendar(coordinator, config_entry, language)])


class VpMobile24WeekCalendar(CoordinatorEntity, CalendarEntity):
    """Calendar entity for weekly schedule."""

    def __init__(self, coordinator, config_entry, language: str = "en") -> None:
        """Initialize the calendar."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = CALENDAR_NAMES.get(language, CALENDAR_NAMES["en"])
        self._attr_unique_id = f"{config_entry.entry_id}_week_calendar"
        self._attr_icon = "mdi:calendar-week"

    @property
    def device_info(self) -> dict:
        """Return device information."""
        school_id = self._config_entry.data["school_id"]
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

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming event."""
        now = dt_util.now()
        for event in self._get_week_events():
            if event.start_datetime_local > now:
                return event
        return None

    async def async_get_events(
        self,
        hass: HomeAssistant,
        start_date: datetime,
        end_date: datetime,
    ) -> list[CalendarEvent]:
        """Return calendar events within a datetime range."""
        return self._get_events_in_range(start_date, end_date)

    def _get_week_events(self) -> list[CalendarEvent]:
        """Get all events for the current week."""
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())  # Monday
        end_of_week = start_of_week + timedelta(days=6)  # Sunday

        start_dt = dt_util.as_local(datetime.combine(start_of_week, datetime.min.time()))
        end_dt = dt_util.as_local(datetime.combine(end_of_week, datetime.max.time()))

        return self._get_events_in_range(start_dt, end_dt)

    def _get_events_in_range(
        self, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        """Get events within a date range."""
        if not self.coordinator.data:
            return []

        events: list[CalendarEvent] = []
        current_date = start_date.date()
        end_date_only = end_date.date()

        while current_date <= end_date_only:
            if current_date.weekday() < 5:  # Mon–Fri only
                events.extend(self._get_events_for_date(current_date))
            current_date += timedelta(days=1)

        events.sort(key=lambda x: x.start_datetime_local)
        return events

    def _get_events_for_date(self, target_date: date) -> list[CalendarEvent]:
        """Get events for a specific date."""
        if not self.coordinator.data:
            return []

        target_str = target_date.isoformat()
        events: list[CalendarEvent] = []

        for lesson in self.coordinator.data.get("week_lessons", []):
            if lesson.get("date") == target_str:
                ev = self._lesson_to_event(lesson, target_date, is_change=False)
                if ev:
                    events.append(ev)

        for change in self.coordinator.data.get("week_changes", []):
            if change.get("date") == target_str:
                ev = self._lesson_to_event(change, target_date, is_change=True)
                if ev:
                    events.append(ev)

        return events

    def _lesson_to_event(
        self, lesson: dict, target_date: date, is_change: bool = False
    ) -> CalendarEvent | None:
        """Create a CalendarEvent from a lesson dict."""
        try:
            time_start = lesson.get("time_start", "")
            time_end = lesson.get("time_end", "")
            subject = lesson.get("subject", "")

            if not time_start or not subject:
                return None

            # Parse start time
            start_hour, start_minute = map(int, time_start.split(":"))
            start_dt = dt_util.as_local(
                datetime.combine(
                    target_date,
                    datetime.min.time().replace(hour=start_hour, minute=start_minute),
                )
            )

            # Parse end time (fall back to +45 min)
            if time_end:
                end_hour, end_minute = map(int, time_end.split(":"))
                end_dt = dt_util.as_local(
                    datetime.combine(
                        target_date,
                        datetime.min.time().replace(hour=end_hour, minute=end_minute),
                    )
                )
            else:
                end_dt = start_dt + timedelta(minutes=45)

            summary = f"\U0001f504 {subject}" if is_change else subject

            parts: list[str] = []
            teacher = lesson.get("teacher", "")
            room = lesson.get("room", "")
            period = lesson.get("period", "")
            info = lesson.get("info", "")
            if teacher:
                parts.append(f"Lehrer: {teacher}")
            if room:
                parts.append(f"Raum: {room}")
            if period:
                parts.append(f"Stunde: {period}")
            if info:
                parts.append(f"Info: {info}")
            if is_change:
                parts.append("\u26a0\ufe0f Vertretung/\u00c4nderung")

            return CalendarEvent(
                start=start_dt,
                end=end_dt,
                summary=summary,
                description="\n".join(parts),
                location=room,
            )

        except (ValueError, TypeError):
            return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        if not self.coordinator.data:
            return {}
        return {
            "total_events_this_week": len(self._get_week_events()),
            "date": self.coordinator.data.get("date"),
            "timestamp": self.coordinator.data.get("timestamp"),
            "class": self.coordinator.class_name,
        }
