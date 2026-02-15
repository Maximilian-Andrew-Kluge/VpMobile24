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
    
    # Register the custom card
    try:
        import os
        card_path = os.path.join(hass.config.path("custom_components"), DOMAIN, "card.js")
        
        if hasattr(hass.http, 'register_static_path'):
            # Register under multiple paths for compatibility
            hass.http.register_static_path(
                f"/local/community/{DOMAIN}/vpmobile24-card.js",
                card_path,
                True,
            )
            hass.http.register_static_path(
                f"/hacsfiles/{DOMAIN}/vpmobile24-card.js",
                card_path,
                True,
            )
            hass.http.register_static_path(
                f"/local/{DOMAIN}/vpmobile24-card.js",
                card_path,
                True,
            )
            _LOGGER.info(f"Custom card registered at multiple paths")
        else:
            _LOGGER.warning("Static path registration not available in this HA version")
    except Exception as e:
        _LOGGER.error(f"Could not register custom card: {e}", exc_info=True)
    
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
        try:
            _LOGGER.debug("Starting data update...")
            
            # Load week data (5 school days) - this includes today
            week_data = await self.api.async_get_multi_day_schedule(days=5, class_name=self.class_name)
            _LOGGER.debug(f"Week data loaded: {len(week_data.get('lessons', []))} lessons")
            
            # Store week data for the week table sensor
            self._week_data = week_data
            
            # Extract today's data from week data
            from datetime import date
            today_str = date.today().isoformat()
            
            today_lessons = []
            today_changes = []
            
            for lesson in week_data.get("lessons", []):
                if lesson.get("date") == today_str:
                    today_lessons.append(lesson)
            
            for change in week_data.get("changes", []):
                if change.get("date") == today_str:
                    today_changes.append(change)
            
            # Create today's data structure
            today_data = {
                "lessons": today_lessons,
                "changes": today_changes,
                "additional_info": week_data.get("additional_info", []),
                "date": today_str,
                "timestamp": week_data.get("timestamp", "")
            }
            
            _LOGGER.debug(f"Today's data extracted: {len(today_lessons)} lessons, {len(today_changes)} changes")
            
            # If no data available, create empty structure to prevent sensor failures
            if not week_data.get("lessons") and not week_data.get("changes"):
                _LOGGER.info("No schedule data available (possibly school holidays)")
                today_data = {
                    "lessons": [],
                    "changes": [],
                    "additional_info": [],
                    "date": today_str,
                    "timestamp": "",
                    "week_lessons": [],
                    "week_changes": []
                }
                return today_data
            
            # Filter out excluded subjects from lessons and changes, but keep additional_info
            if self.excluded_subjects:
                _LOGGER.debug(f"Filtering excluded subjects: {self.excluded_subjects}")
                
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
                _LOGGER.debug(f"Filtered today's data: {len(filtered_lessons)} lessons, {len(filtered_changes)} changes")
                
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
                _LOGGER.debug(f"Filtered week data: {len(week_filtered_lessons)} lessons, {len(week_filtered_changes)} changes")
            
            # Store both datasets
            today_data["week_lessons"] = week_data.get("lessons", [])
            today_data["week_changes"] = week_data.get("changes", [])
            
            _LOGGER.debug("Data update completed successfully")
            return today_data
            
        except Exception as e:
            _LOGGER.error(f"Error updating data: {e}")
            # Return empty data structure to prevent sensor failures
            from datetime import date
            today_str = date.today().isoformat()
            return {
                "lessons": [],
                "changes": [],
                "additional_info": [],
                "date": today_str,
                "timestamp": "",
                "week_lessons": [],
                "week_changes": []
            }