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

    # Options override data (allows changing class/subjects without re-setup)
    class_name = entry.options.get("class_name") or entry.data.get("class_name")
    excluded_subjects = entry.options.get(
        CONF_EXCLUDED_SUBJECTS, entry.data.get(CONF_EXCLUDED_SUBJECTS, [])
    )

    coordinator = VpMobile24DataUpdateCoordinator(
        hass,
        api,
        class_name,
        excluded_subjects,
    )
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Register device
    device_registry = dr.async_get(hass)
    school_id = entry.data["school_id"]
    device_id = f"{school_id}_{class_name}" if class_name else school_id
    device_name = f"VpMobile24 \u2013 {class_name} ({school_id})" if class_name else f"VpMobile24 ({school_id})"
    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, device_id)},
        name=device_name,
        manufacturer="VpMobile24",
        model="Stundenplan Integration",
        sw_version="2.4.8",
    )

    # Options update listener — apply new class/subjects immediately
    async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
        new_class = entry.options.get("class_name") or entry.data.get("class_name")
        new_excluded = entry.options.get(
            CONF_EXCLUDED_SUBJECTS, entry.data.get(CONF_EXCLUDED_SUBJECTS, [])
        )
        coord = hass.data[DOMAIN][entry.entry_id]
        class_changed = coord.class_name != new_class
        coord.class_name = new_class
        coord.excluded_subjects = new_excluded
        if class_changed:
            coord._week_data_cache = {}
            coord._current_week_monday = None
            coord._week_data = None
            _LOGGER.info("VpMobile24: class changed to %s, cache cleared", new_class)
        else:
            _LOGGER.info("VpMobile24: excluded subjects updated (%d excluded)", len(new_excluded))
        await coord.async_request_refresh()

    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    # Re-copy card on every config entry setup
    try:
        from pathlib import Path
        import shutil

        card_source = Path(__file__).parent / "vpmobile24-card.js"
        if card_source.exists():
            www_dir = Path(hass.config.path("www")) / "vpmobile24"
            www_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(str(card_source), str(www_dir / "vpmobile24-card.js"))
            shutil.copy2(str(card_source), str(www_dir / "card.js"))
            _LOGGER.info("VpMobile24 card refreshed in www folder")
    except Exception as copy_err:
        _LOGGER.warning("Could not refresh card file: %s", copy_err)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the vpmobile24 component."""
    try:
        from pathlib import Path
        import shutil
        import time

        integration_dir = Path(__file__).parent
        card_source = integration_dir / "vpmobile24-card.js"

        if not card_source.exists():
            _LOGGER.error("Card file not found at %s", card_source)
            return True

        www_dir = Path(hass.config.path("www")) / "vpmobile24"
        www_dir.mkdir(parents=True, exist_ok=True)
        www_card = www_dir / "vpmobile24-card.js"
        shutil.copy2(str(card_source), str(www_card))
        shutil.copy2(str(card_source), str(www_dir / "card.js"))
        _LOGGER.info("VpMobile24 card copied to %s (and card.js)", www_card)

        version = str(int(time.time()))
        new_url = f"/local/vpmobile24/vpmobile24-card.js?v={version}"

        try:
            from homeassistant.components.lovelace import _get_lovelace_data  # noqa: F401
        except ImportError:
            pass

        try:
            lovelace = hass.data.get("lovelace")
            if lovelace and hasattr(lovelace, "resources"):
                resources = lovelace.resources
                await resources.async_load()
                existing = resources.async_items()
                old_id = None
                for item in existing:
                    url = item.get("url", "")
                    if "vpmobile24-card.js" in url or "/vpmobile24/card.js" in url:
                        old_id = item.get("id")
                        break
                if old_id is not None:
                    await resources.async_update_item(old_id, {"res_type": "module", "url": new_url})
                    _LOGGER.info("VpMobile24 resource URL updated to %s", new_url)
                else:
                    await resources.async_create_item({"res_type": "module", "url": new_url})
                    _LOGGER.info("VpMobile24 resource registered: %s", new_url)
            else:
                _LOGGER.info("Lovelace resource store not available. Set resource URL to: %s", new_url)
        except Exception as res_err:
            _LOGGER.warning("Could not auto-update Lovelace resource URL: %s", res_err)

    except Exception as e:
        _LOGGER.error("Could not setup custom card: %s", e, exc_info=True)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        coordinator = hass.data[DOMAIN].pop(entry.entry_id)
        await coordinator.api.async_close()
    return unload_ok


class VpMobile24DataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the API."""

    def __init__(self, hass, api, class_name=None, excluded_subjects=None):
        self.api = api
        self.class_name = class_name
        self.excluded_subjects = excluded_subjects or []
        self._week_data = None
        self._week_data_cache = {}
        self._current_week_monday = None
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=15),
        )

    def _resolve_original_subject(self, base_schedule, weekday_index, period, course):
        """Return the original subject for a cancelled slot, or '' if ambiguous.

        Uses course to distinguish AGs at the same period.
        If course is empty and multiple subjects exist, returns '' (ambiguous).
        """
        if course:
            return base_schedule.get((weekday_index, period, course), "")
        candidates = [
            subj for (wd, per, _crs), subj in base_schedule.items()
            if wd == weekday_index and per == period
        ]
        unique = list(dict.fromkeys(candidates))
        return unique[0] if len(unique) == 1 else ""

    async def _async_update_data(self):
        """Update data via library."""
        try:
            _LOGGER.debug("Starting data update...")

            from datetime import date
            today = date.today()
            today_str = today.isoformat()

            days_since_monday = today.weekday()
            monday_this_week = today - timedelta(days=days_since_monday)
            monday_str = monday_this_week.isoformat()

            if self._current_week_monday != monday_str:
                _LOGGER.info("New week detected (Monday: %s), clearing cache", monday_str)
                self._week_data_cache = {}
                self._current_week_monday = monday_str

            week_dates = [
                (monday_this_week + timedelta(days=i)).isoformat()
                for i in range(5)
            ]

            if self._week_data is None:
                self._week_data = {
                    "lessons": [], "changes": [],
                    "additional_info": [], "timestamp": "", "days_loaded": 0
                }

            cached_dates = set(self._week_data_cache.keys())
            _LOGGER.debug("Cached dates: %s", cached_dates)

            dates_to_load = [today]
            for date_str in week_dates:
                if date_str not in cached_dates and date_str != today_str:
                    try:
                        dates_to_load.append(date.fromisoformat(date_str))
                    except ValueError:
                        continue

            _LOGGER.debug("Loading dates: %s", [d.isoformat() for d in dates_to_load])

            for target_date in dates_to_load:
                try:
                    date_str = target_date.isoformat()
                    _LOGGER.debug("Fetching schedule for %s", date_str)
                    day_data = await self.api.async_get_schedule(target_date, self.class_name)
                    self._week_data_cache[date_str] = {
                        "lessons": day_data.get("lessons", []),
                        "changes": day_data.get("changes", []),
                        "additional_info": day_data.get("additional_info", []),
                        "timestamp": day_data.get("timestamp", ""),
                    }
                    _LOGGER.debug("Cached %s: %d lessons", date_str, len(day_data.get("lessons", [])))
                except Exception as ex:
                    _LOGGER.warning("Could not fetch schedule for %s: %s", target_date, ex)
                    continue

            # Build base_schedule for cancelled-lesson detection
            # Key: (weekday, period, course) → subject
            base_schedule = {}
            _EMPTY = {"", " ", "\u2014", "---", "-"}

            for date_str in week_dates:
                if date_str not in self._week_data_cache:
                    continue
                cached_day = self._week_data_cache[date_str]
                try:
                    date_obj = date.fromisoformat(date_str)
                    weekday_index = date_obj.weekday()
                    for lesson in cached_day.get("lessons", []):
                        period = lesson.get("period", "")
                        subject = lesson.get("subject", "")
                        course = lesson.get("course", "")
                        is_change = lesson.get("is_change", False)
                        if period and subject and subject not in _EMPTY and not is_change:
                            key = (weekday_index, period, course)
                            if key not in base_schedule:
                                base_schedule[key] = subject
                except ValueError:
                    continue

            _LOGGER.debug("Base schedule created with %d entries", len(base_schedule))

            all_lessons = []
            all_changes = []
            all_additional_info = []
            latest_timestamp = ""

            for date_str in week_dates:
                if date_str not in self._week_data_cache:
                    continue
                cached_day = self._week_data_cache[date_str]
                try:
                    date_obj = date.fromisoformat(date_str)
                    day_name = date_obj.strftime("%A")
                    weekday_index = date_obj.weekday()

                    for lesson in cached_day.get("lessons", []):
                        subject = lesson.get("subject", "")
                        period = lesson.get("period", "")
                        if not subject or subject.strip() in _EMPTY:
                            original = self._resolve_original_subject(
                                base_schedule, weekday_index, period, lesson.get("course", "")
                            )
                            if original and original in self.excluded_subjects:
                                continue
                        elif subject in self.excluded_subjects:
                            continue
                        lc = lesson.copy()
                        lc["date"] = date_str
                        lc["day_name"] = day_name
                        all_lessons.append(lc)

                    for change in cached_day.get("changes", []):
                        subject = change.get("subject", "")
                        period = change.get("period", "")
                        if not subject or subject.strip() in _EMPTY:
                            original = self._resolve_original_subject(
                                base_schedule, weekday_index, period, change.get("course", "")
                            )
                            if original and original in self.excluded_subjects:
                                continue
                        elif subject in self.excluded_subjects:
                            continue
                        cc = change.copy()
                        cc["date"] = date_str
                        cc["day_name"] = day_name
                        all_changes.append(cc)

                    for info in cached_day.get("additional_info", []):
                        info_text = info.get("text", "") if isinstance(info, dict) else str(info)
                        if info_text and info_text not in [
                            (i.get("text", "") if isinstance(i, dict) else str(i))
                            for i in all_additional_info
                        ]:
                            all_additional_info.append(info)

                    if date_str == today_str or not latest_timestamp:
                        latest_timestamp = cached_day.get("timestamp", "")

                except ValueError:
                    continue

            self._week_data = {
                "lessons": all_lessons,
                "changes": all_changes,
                "additional_info": all_additional_info,
                "timestamp": latest_timestamp,
                "days_loaded": len([d for d in week_dates if d in self._week_data_cache]),
            }

            _LOGGER.debug(
                "Week data assembled: %d lessons from %d days, %d additional_info",
                len(all_lessons), self._week_data["days_loaded"], len(all_additional_info)
            )

            today_lessons = [l for l in all_lessons if l.get("date") == today_str]
            today_changes = [c for c in all_changes if c.get("date") == today_str]

            _LOGGER.debug("Today: %d lessons, %d changes", len(today_lessons), len(today_changes))

            if not all_lessons and not all_changes:
                _LOGGER.info("No schedule data available (possibly school holidays)")
                return {
                    "lessons": [], "changes": [], "additional_info": [],
                    "date": today_str, "timestamp": "",
                    "week_lessons": [], "week_changes": [],
                }

            _LOGGER.debug("Data update completed successfully")
            return {
                "lessons": today_lessons,
                "changes": today_changes,
                "additional_info": all_additional_info,
                "date": today_str,
                "timestamp": latest_timestamp,
                "week_lessons": all_lessons,
                "week_changes": all_changes,
            }

        except Exception as e:
            _LOGGER.error("Error updating data: %s", e)
            from datetime import date as _date
            return {
                "lessons": [], "changes": [], "additional_info": [],
                "date": _date.today().isoformat(), "timestamp": "",
                "week_lessons": [], "week_changes": [],
            }
