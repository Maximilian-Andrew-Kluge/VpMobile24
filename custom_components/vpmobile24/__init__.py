"""The vpmobile24 integration."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

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
        data = await self.api.async_get_schedule(class_name=self.class_name)
        
        # Filter out excluded subjects
        if self.excluded_subjects:
            filtered_lessons = []
            filtered_changes = []
            
            for lesson in data.get("lessons", []):
                if lesson.get("subject") not in self.excluded_subjects:
                    filtered_lessons.append(lesson)
            
            for change in data.get("changes", []):
                if change.get("subject") not in self.excluded_subjects:
                    filtered_changes.append(change)
            
            data["lessons"] = filtered_lessons
            data["changes"] = filtered_changes
        
        return data