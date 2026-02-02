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


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the calendar platform."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    
    entities = [
        VpMobile24WeekCalendar(coordinator, config_entry),
    ]
    
    async_add_entities(entities)


class VpMobile24WeekCalendar(CoordinatorEntity, CalendarEntity):
    """Calendar entity for weekly schedule."""

    def __init__(self, coordinator, config_entry):
        """Initialize the calendar."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Week Calendar"
        self._attr_unique_id = f"{config_entry.entry_id}_week_calendar"
        self._attr_icon = "mdi:calendar-week"

    @property
    def device_info(self):
        """Return device information."""
        from .const import DOMAIN
        return {
            "identifiers": {(DOMAIN, self._config_entry.data["school_id"])},
            "name": f"VpMobile24 ({self._config_entry.data['school_id']})",
            "manufacturer": "VpMobile24",
            "model": "Stundenplan Integration",
            "sw_version": "1.4.5",
        }

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next upcoming event."""
        events = self._get_week_events()
        if not events:
            return None
        
        # Find next event
        now = dt_util.now()
        for event in events:
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
        
        # Get timezone-aware datetimes
        tz = dt_util.get_default_time_zone()
        start_datetime = datetime.combine(start_of_week, datetime.min.time()).replace(tzinfo=tz)
        end_datetime = datetime.combine(end_of_week, datetime.max.time()).replace(tzinfo=tz)
        
        return self._get_events_in_range(start_datetime, end_datetime)

    def _get_events_in_range(self, start_date: datetime, end_date: datetime) -> list[CalendarEvent]:
        """Get events within a date range."""
        events = []
        
        if not self.coordinator.data:
            return events
        
        # Get lessons for each day in the range
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            # Skip weekends
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                day_events = self._get_events_for_date(current_date)
                events.extend(day_events)
            
            current_date += timedelta(days=1)
        
        # Sort events by start time
        events.sort(key=lambda x: x.start_datetime_local)
        
        return events

    def _get_events_for_date(self, target_date: date) -> list[CalendarEvent]:
        """Get events for a specific date."""
        events = []
        
        if not self.coordinator.data:
            return events
        
        # Use week data from coordinator
        week_lessons = self.coordinator.data.get("week_lessons", [])
        week_changes = self.coordinator.data.get("week_changes", [])
        
        # Filter lessons for the target date
        target_date_str = target_date.isoformat()
        
        # Process regular lessons for this date
        for lesson in week_lessons:
            lesson_date = lesson.get("date", "")
            if lesson_date == target_date_str:
                event = self._create_event_from_lesson(lesson, target_date)
                if event:
                    events.append(event)
        
        # Process changes for this date
        for change in week_changes:
            change_date = change.get("date", "")
            if change_date == target_date_str:
                event = self._create_event_from_lesson(change, target_date, is_change=True)
                if event:
                    events.append(event)
        
        return events

    def _create_event_from_lesson(self, lesson: dict, target_date: date, is_change: bool = False) -> CalendarEvent | None:
        """Create a calendar event from a lesson."""
        try:
            time_start = lesson.get("time_start", "")
            time_end = lesson.get("time_end", "")
            subject = lesson.get("subject", "")
            teacher = lesson.get("teacher", "")
            room = lesson.get("room", "")
            period = lesson.get("period", "")
            info = lesson.get("info", "")
            
            if not time_start or not subject:
                return None
            
            # Get Home Assistant timezone
            tz = dt_util.get_default_time_zone()
            
            # Parse times
            start_hour, start_minute = map(int, time_start.split(":"))
            start_datetime = datetime.combine(
                target_date, 
                datetime.min.time().replace(hour=start_hour, minute=start_minute)
            ).replace(tzinfo=tz)
            
            if time_end:
                end_hour, end_minute = map(int, time_end.split(":"))
                end_datetime = datetime.combine(
                    target_date, 
                    datetime.min.time().replace(hour=end_hour, minute=end_minute)
                ).replace(tzinfo=tz)
            else:
                # Default to 45 minutes if no end time
                end_datetime = start_datetime + timedelta(minutes=45)
            
            # Create summary
            summary = subject
            if is_change:
                summary = f"🔄 {subject}"
            
            # Create description
            description_parts = []
            if teacher:
                description_parts.append(f"Lehrer: {teacher}")
            if room:
                description_parts.append(f"Raum: {room}")
            if period:
                description_parts.append(f"Stunde: {period}")
            if info:
                description_parts.append(f"Info: {info}")
            if is_change:
                description_parts.append("⚠️ Vertretung/Änderung")
            
            description = "\n".join(description_parts)
            
            return CalendarEvent(
                start=start_datetime,
                end=end_datetime,
                summary=summary,
                description=description,
                location=room,
            )
            
        except (ValueError, TypeError) as e:
            return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        if not self.coordinator.data:
            return {}
        
        week_events = self._get_week_events()
        
        return {
            "total_events_this_week": len(week_events),
            "date": self.coordinator.data.get("date"),
            "timestamp": self.coordinator.data.get("timestamp"),
            "class": self.coordinator.class_name,
        }
