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

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.CALENDAR, Platform.BUTTON]

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
        sw_version="2.3.0",
    )
    
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    
    return True


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the vpmobile24 component."""
    # Register the custom card
    try:
        from pathlib import Path
        import shutil
        
        # Get the path to the card file
        integration_dir = Path(__file__).parent
        card_path = integration_dir / "vpmobile24-card.js"
        
        if card_path.exists():
            # Copy to www folder automatically
            www_dir = Path(hass.config.path("www"))
            www_vpmobile_dir = www_dir / "vpmobile24"
            www_card_path = www_vpmobile_dir / "vpmobile24-card.js"
            
            # Create directory if it doesn't exist
            www_vpmobile_dir.mkdir(parents=True, exist_ok=True)
            
            # Copy the card file
            shutil.copy2(str(card_path), str(www_card_path))
            
            _LOGGER.info(f"Custom card automatically copied to {www_card_path}")
            _LOGGER.info(f"Add resource with URL: /local/vpmobile24/vpmobile24-card.js")
        else:
            _LOGGER.error(f"Card file not found at {card_path}")
    except Exception as e:
        _LOGGER.error(f"Could not setup custom card: {e}", exc_info=True)
    
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
        self._week_data = None  # Initialize week data storage
        self._week_data_cache = {}  # Cache für einzelne Tage: {date_str: day_data}
        self._current_week_monday = None  # Speichert den Montag der aktuellen Woche
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
            
            # Berechne Montag dieser Woche
            from datetime import date
            today = date.today()
            today_str = today.isoformat()
            
            # Montag = 0, Sonntag = 6
            days_since_monday = today.weekday()
            monday_this_week = today - timedelta(days=days_since_monday)
            monday_str = monday_this_week.isoformat()
            
            # Prüfe ob neue Woche begonnen hat - wenn ja, Cache leeren
            if self._current_week_monday != monday_str:
                _LOGGER.info(f"New week detected (Monday: {monday_str}), clearing cache")
                self._week_data_cache = {}
                self._current_week_monday = monday_str
            
            # Erstelle Liste aller Wochentage (Montag-Freitag)
            week_dates = []
            for i in range(5):  # Montag bis Freitag
                week_dates.append((monday_this_week + timedelta(days=i)).isoformat())
            
            # Initialisiere week_data wenn noch nicht vorhanden
            if self._week_data is None:
                self._week_data = {
                    "lessons": [],
                    "changes": [],
                    "additional_info": [],
                    "timestamp": "",
                    "days_loaded": 0
                }
            
            # Prüfe welche Tage bereits im Cache sind
            cached_dates = set(self._week_data_cache.keys())
            _LOGGER.debug(f"Cached dates: {cached_dates}")
            
            # Lade nur heute und fehlende Tage
            dates_to_load = []
            
            # Heute immer neu laden (für aktuelle Änderungen)
            dates_to_load.append(today)
            
            # Fehlende Tage der Woche laden
            for date_str in week_dates:
                if date_str not in cached_dates and date_str != today_str:
                    try:
                        date_obj = date.fromisoformat(date_str)
                        dates_to_load.append(date_obj)
                    except ValueError:
                        continue
            
            _LOGGER.debug(f"Loading dates: {[d.isoformat() for d in dates_to_load]}")
            
            # Lade die benötigten Tage
            for target_date in dates_to_load:
                try:
                    date_str = target_date.isoformat()
                    _LOGGER.debug(f"Fetching schedule for {date_str}")
                    
                    day_data = await self.api.async_get_schedule(target_date, self.class_name)
                    
                    # Speichere im Cache
                    self._week_data_cache[date_str] = {
                        "lessons": day_data.get("lessons", []),
                        "changes": day_data.get("changes", []),
                        "additional_info": day_data.get("additional_info", []),
                        "timestamp": day_data.get("timestamp", "")
                    }
                    
                    _LOGGER.debug(f"Cached {date_str}: {len(day_data.get('lessons', []))} lessons, {len(day_data.get('additional_info', []))} additional_info")
                    
                except Exception as ex:
                    _LOGGER.warning(f"Could not fetch schedule for {target_date}: {ex}")
                    # Wenn Laden fehlschlägt, behalte alte Daten im Cache
                    continue
            
            # Baue week_data aus dem Cache zusammen
            all_lessons = []
            all_changes = []
            all_additional_info = []
            latest_timestamp = ""
            
            # Erstelle zuerst einen Basis-Stundenplan (welches Fach ist normalerweise wann)
            base_schedule = {}  # {(weekday, period): subject}
            
            for date_str in week_dates:
                if date_str in self._week_data_cache:
                    cached_day = self._week_data_cache[date_str]
                    
                    try:
                        date_obj = date.fromisoformat(date_str)
                        weekday_index = date_obj.weekday()  # 0=Montag
                        
                        # Sammle normale Stunden für Basis-Stundenplan
                        for lesson in cached_day.get("lessons", []):
                            period = lesson.get("period", "")
                            subject = lesson.get("subject", "")
                            is_change = lesson.get("is_change", False)
                            
                            # Nur normale Stunden (keine Vertretungen) für Basis-Stundenplan
                            if period and subject and not is_change and subject not in ["—", "", " "]:
                                key = (weekday_index, period)
                                # Speichere nur wenn noch nicht vorhanden (erste normale Stunde zählt)
                                if key not in base_schedule:
                                    base_schedule[key] = subject
                    
                    except ValueError:
                        continue
            
            _LOGGER.debug(f"Base schedule created with {len(base_schedule)} entries")
            
            # Jetzt baue die gefilterten Wochendaten zusammen
            for date_str in week_dates:
                if date_str in self._week_data_cache:
                    cached_day = self._week_data_cache[date_str]
                    
                    # Füge Datum und Tag zu jeder Stunde hinzu
                    try:
                        date_obj = date.fromisoformat(date_str)
                        day_name = date_obj.strftime("%A")
                        weekday_index = date_obj.weekday()
                        
                        for lesson in cached_day.get("lessons", []):
                            subject = lesson.get("subject", "")
                            period = lesson.get("period", "")
                            
                            # Prüfe ob es eine Ausfallstunde ist (subject ist leer oder "—")
                            if subject in ["—", "", " ", None]:
                                # Schaue im Basis-Stundenplan nach, welches Fach normalerweise hier ist
                                key = (weekday_index, period)
                                original_subject = base_schedule.get(key, "")
                                
                                # Wenn das ursprüngliche Fach ausgeschlossen ist, überspringe diese Stunde
                                if original_subject and original_subject in self.excluded_subjects:
                                    _LOGGER.debug(f"Skipping cancelled lesson for excluded subject {original_subject} on {date_str} period {period}")
                                    continue
                            
                            # Filtere ausgeschlossene Fächer (normale Stunden)
                            if subject and subject not in ["—", "", " ", None] and subject in self.excluded_subjects:
                                continue
                            
                            lesson_copy = lesson.copy()
                            lesson_copy["date"] = date_str
                            lesson_copy["day_name"] = day_name
                            all_lessons.append(lesson_copy)
                        
                        for change in cached_day.get("changes", []):
                            subject = change.get("subject", "")
                            period = change.get("period", "")
                            
                            # Prüfe ob es eine Ausfallstunde ist
                            if subject in ["—", "", " ", None]:
                                key = (weekday_index, period)
                                original_subject = base_schedule.get(key, "")
                                
                                if original_subject and original_subject in self.excluded_subjects:
                                    _LOGGER.debug(f"Skipping cancelled change for excluded subject {original_subject} on {date_str} period {period}")
                                    continue
                            
                            # Filtere ausgeschlossene Fächer
                            if subject and subject not in ["—", "", " ", None] and subject in self.excluded_subjects:
                                continue
                            
                            change_copy = change.copy()
                            change_copy["date"] = date_str
                            change_copy["day_name"] = day_name
                            all_changes.append(change_copy)
                        
                        # Zusatzinfos sammeln (von allen Tagen, aber Duplikate vermeiden)
                        for info in cached_day.get("additional_info", []):
                            # Prüfe ob diese Info schon in der Liste ist
                            info_text = info.get("text", "") if isinstance(info, dict) else str(info)
                            if info_text and info_text not in [
                                i.get("text", "") if isinstance(i, dict) else str(i) 
                                for i in all_additional_info
                            ]:
                                all_additional_info.append(info)
                        
                        # Timestamp vom neuesten Tag (heute bevorzugt)
                        if date_str == today_str or not latest_timestamp:
                            latest_timestamp = cached_day.get("timestamp", "")
                    
                    except ValueError:
                        continue
            
            # Aktualisiere week_data
            self._week_data = {
                "lessons": all_lessons,
                "changes": all_changes,
                "additional_info": all_additional_info,
                "timestamp": latest_timestamp,
                "days_loaded": len([d for d in week_dates if d in self._week_data_cache])
            }
            
            _LOGGER.debug(f"Week data assembled: {len(all_lessons)} lessons from {self._week_data['days_loaded']} days (after filtering excluded subjects), {len(all_additional_info)} additional_info")
            
            # Extract today's data from week data
            today_lessons = []
            today_changes = []
            
            for lesson in all_lessons:
                if lesson.get("date") == today_str:
                    today_lessons.append(lesson)
            
            for change in all_changes:
                if change.get("date") == today_str:
                    today_changes.append(change)
            
            # Create today's data structure
            today_data = {
                "lessons": today_lessons,
                "changes": today_changes,
                "additional_info": all_additional_info,
                "date": today_str,
                "timestamp": latest_timestamp
            }
            
            _LOGGER.debug(f"Today's data extracted: {len(today_lessons)} lessons, {len(today_changes)} changes")
            
            # If no data available, create empty structure to prevent sensor failures
            if not all_lessons and not all_changes:
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
            
            # Store both datasets (already filtered by excluded_subjects)
            today_data["week_lessons"] = all_lessons
            today_data["week_changes"] = all_changes
            
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