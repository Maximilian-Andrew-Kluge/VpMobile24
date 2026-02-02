"""The vpmobile24 integration."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN, CONF_EXCLUDED_SUBJECTS, DEFAULT_BASE_URL
from .api_new import Stundenplan24API

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.CALENDAR]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up vpmobile24 from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    api = Stundenplan24API(
        school_id=entry.data["school_id"],
        username=entry.data["username"],
        password=entry.data["password"],
        base_url=DEFAULT_BASE_URL
    )
    
    coordinator = VpMobile24DataUpdateCoordinator(
        hass, 
        api, 
        entry.data.get("class_name"),
        entry.data.get(CONF_EXCLUDED_SUBJECTS, [])
    )
    await coordinator.async_config_entry_first_refresh()
    
    hass.data[DOMAIN][entry.entry_id] = coordinator
    
    # Register device with icon
    device_registry = dr.async_get(hass)
    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.data["school_id"])},
        name=f"VpMobile24 ({entry.data['school_id']})",
        manufacturer="VpMobile24",
        model="Stundenplan Integration",
        sw_version="1.4.5",
    )
    
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        coordinator = hass.data[DOMAIN].pop(entry.entry_id)
        await coordinator.api.async_close()
    
    return unload_ok


class VpMobile24DataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the API."""

    def __init__(self, hass: HomeAssistant, api: Stundenplan24API, class_name: str | None = None, excluded_subjects: list[str] | None = None) -> None:
        """Initialize."""
        self.api = api
        self.class_name = class_name
        self.excluded_subjects = excluded_subjects or []
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=15),
        )

    async def _async_update_data(self):
        """Update data via library."""
        # Load today's data for sensors
        today_data = await self.api.async_get_multi_day_schedule(days=1, class_name=self.class_name)
        
        # Load week data for calendar (7 days)
        week_data = await self.api.async_get_multi_day_schedule(days=7, class_name=self.class_name)
        
        # Filter out excluded subjects from lessons and changes, but keep additional_info
        if self.excluded_subjects:
            # Filter today's data for sensors
            filtered_lessons = []
            filtered_changes = []
            
            for lesson in today_data.get("lessons", []):
                if lesson.get("subject") not in self.excluded_subjects:
                    filtered_lessons.append(lesson)
            
            for change in today_data.get("changes", []):
                if change.get("subject") not in self.excluded_subjects:
                    filtered_changes.append(change)
            
            today_data["lessons"] = filtered_lessons
            today_data["changes"] = filtered_changes
            
            # Filter week data for calendar
            week_filtered_lessons = []
            week_filtered_changes = []
            
            for lesson in week_data.get("lessons", []):
                if lesson.get("subject") not in self.excluded_subjects:
                    week_filtered_lessons.append(lesson)
            
            for change in week_data.get("changes", []):
                if change.get("subject") not in self.excluded_subjects:
                    week_filtered_changes.append(change)
            
            week_data["lessons"] = week_filtered_lessons
            week_data["changes"] = week_filtered_changes
            # Keep additional_info as is - it's not subject-specific
        
        # Store both datasets
        today_data["week_lessons"] = week_data.get("lessons", [])
        today_data["week_changes"] = week_data.get("changes", [])
        
        return today_data
