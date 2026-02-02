"""Sensor platform for vpmobile24."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    coordinator = hass.data[DOMAIN][config_entry.entry_id]
    
    entities = [
        VpMobile24NextLessonSensor(coordinator, config_entry),
        VpMobile24TodayScheduleSensor(coordinator, config_entry),
        VpMobile24ChangesSensor(coordinator, config_entry),
        VpMobile24WeekScheduleSensor(coordinator, config_entry),
    ]
    
    async_add_entities(entities)


class VpMobile24NextLessonSensor(CoordinatorEntity, SensorEntity):
    """Sensor for the next lesson."""

    def __init__(self, coordinator, config_entry):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Next Lesson"
        self._attr_unique_id = f"{config_entry.entry_id}_next_lesson"
        self._attr_icon = "mdi:school"

    @property
    def state(self) -> str | None:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None
            
        lessons = self.coordinator.data.get("lessons", [])
        if not lessons:
            return "No lessons"
            
        # Find next lesson (simplified logic - could be improved)
        current_time = datetime.now().time()
        for lesson in lessons:
            time_start = lesson.get("time_start", "")
            if time_start and ":" in time_start:
                try:
                    lesson_hour, lesson_minute = map(int, time_start.split(":"))
                    lesson_time = datetime.now().replace(hour=lesson_hour, minute=lesson_minute).time()
                    if lesson_time > current_time:
                        return f"{lesson['subject']} - {lesson['time']}"
                except (ValueError, TypeError):
                    continue
            
        return "No more lessons today"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if not self.coordinator.data:
            return {}
            
        lessons = self.coordinator.data.get("lessons", [])
        if lessons:
            # Find next lesson
            current_time = datetime.now().time()
            for lesson in lessons:
                time_start = lesson.get("time_start", "")
                if time_start and ":" in time_start:
                    try:
                        lesson_hour, lesson_minute = map(int, time_start.split(":"))
                        lesson_time = datetime.now().replace(hour=lesson_hour, minute=lesson_minute).time()
                        if lesson_time > current_time:
                            return {
                                "class": lesson.get("class"),
                                "period": lesson.get("period"),
                                "subject": lesson.get("subject"),
                                "teacher": lesson.get("teacher"),
                                "room": lesson.get("room"),
                                "time": lesson.get("time"),
                                "info": lesson.get("info"),
                            }
                    except (ValueError, TypeError):
                        continue
        return {}


class VpMobile24TodayScheduleSensor(CoordinatorEntity, SensorEntity):
    """Sensor for today's complete schedule."""

    def __init__(self, coordinator, config_entry):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Today Schedule"
        self._attr_unique_id = f"{config_entry.entry_id}_today_schedule"
        self._attr_icon = "mdi:calendar-today"

    @property
    def state(self) -> str | None:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None
            
        lessons = self.coordinator.data.get("lessons", [])
        return str(len(lessons))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if not self.coordinator.data:
            return {}
            
        return {
            "lessons": self.coordinator.data.get("lessons", []),
            "classes": self.coordinator.data.get("classes", []),
            "date": self.coordinator.data.get("date"),
            "timestamp": self.coordinator.data.get("timestamp"),
            "last_updated": self.coordinator.data.get("last_updated"),
        }


class VpMobile24ChangesSensor(CoordinatorEntity, SensorEntity):
    """Sensor for schedule changes."""

    def __init__(self, coordinator, config_entry):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Changes"
        self._attr_unique_id = f"{config_entry.entry_id}_changes"
        self._attr_icon = "mdi:alert-circle"

    @property
    def state(self) -> str | None:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None
            
        changes = self.coordinator.data.get("changes", [])
        return str(len(changes))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if not self.coordinator.data:
            return {}
            
        return {
            "changes": self.coordinator.data.get("changes", []),
            "date": self.coordinator.data.get("date"),
            "timestamp": self.coordinator.data.get("timestamp"),
        }


class VpMobile24WeekScheduleSensor(CoordinatorEntity, SensorEntity):
    """Sensor for the complete week schedule."""

    def __init__(self, coordinator, config_entry):
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._config_entry = config_entry
        self._attr_name = "VpMobile24 Week Schedule"
        self._attr_unique_id = f"{config_entry.entry_id}_week_schedule"
        self._attr_icon = "mdi:calendar-week"

    @property
    def state(self) -> str | None:
        """Return the state of the sensor."""
        if not self.coordinator.data:
            return None
            
        # For now, return today's lesson count
        # In a full implementation, this would show the week's total
        lessons = self.coordinator.data.get("lessons", [])
        return f"{len(lessons)} lessons today"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if not self.coordinator.data:
            return {}
        
        # Group lessons by day (for now just today)
        lessons_by_day = {
            "monday": [],
            "tuesday": [],
            "wednesday": [],
            "thursday": [],
            "friday": [],
        }
        
        # For today's lessons, determine the day
        today_lessons = self.coordinator.data.get("lessons", [])
        today_changes = self.coordinator.data.get("changes", [])
        
        from datetime import date
        today = date.today()
        day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        
        if today.weekday() < 5:  # Monday = 0, Friday = 4
            day_key = day_names[today.weekday()]
            lessons_by_day[day_key] = today_lessons
        
        return {
            "lessons_by_day": lessons_by_day,
            "total_lessons_today": len(today_lessons),
            "total_changes_today": len(today_changes),
            "date": self.coordinator.data.get("date"),
            "timestamp": self.coordinator.data.get("timestamp"),
            "class": self.coordinator.class_name,
            "week_summary": self._create_week_summary(lessons_by_day),
        }

    def _create_week_summary(self, lessons_by_day: dict) -> dict[str, Any]:
        """Create a summary of the week."""
        total_lessons = sum(len(lessons) for lessons in lessons_by_day.values())
        
        return {
            "total_lessons_week": total_lessons,
            "days_with_lessons": len([day for day, lessons in lessons_by_day.items() if lessons]),
            "average_lessons_per_day": round(total_lessons / 5, 1) if total_lessons > 0 else 0,
        }