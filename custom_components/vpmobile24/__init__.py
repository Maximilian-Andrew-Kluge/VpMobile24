"""The vpmobile24 integration."""
from __future__ import annotations

import logging
import shutil
from datetime import timedelta
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN, CONF_EXCLUDED_SUBJECTS, CONF_CLASS_NAME, DEFAULT_BASE_URL
from .api_new import Stundenplan24API

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.CALENDAR, Platform.BUTTON]

# The canonical URL for the card resource
CARD_URL_WWW = "/local/vpmobile24/vpmobile24-card.js"

# All known URL patterns that belong to this card (old or alternative paths)
_CARD_URL_PATTERNS = [
    "vpmobile24-card.js",
    "/vpmobile24/card.js",
    "/local/vpmobile24/card.js",
    "/hacsfiles/vpmobile24/",
    "/local/community/vpmobile24/",
]


def _copy_card_to_www(hass: HomeAssistant) -> str | None:
    """Copy the card JS to www/vpmobile24/. Returns the destination path or None."""
    try:
        src = Path(__file__).parent / "vpmobile24-card.js"
        if not src.exists():
            _LOGGER.error("VpMobile24: card source not found: %s", src)
            return None
        dst_dir = Path(hass.config.path("www")) / "vpmobile24"
        dst_dir.mkdir(parents=True, exist_ok=True)
        dst = dst_dir / "vpmobile24-card.js"
        shutil.copy2(str(src), str(dst))
        _LOGGER.info("VpMobile24: card copied to %s", dst)
        return str(dst)
    except Exception as err:
        _LOGGER.error("VpMobile24: failed to copy card: %s", err)
        return None


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Ensure the card is registered as a Lovelace resource with the correct URL.

    - If a resource with the correct URL already exists: do nothing.
    - If a resource with an old/wrong URL exists: update it to the correct URL.
    - If no resource exists at all: create one.
    """
    try:
        lovelace = hass.data.get("lovelace")
        if not lovelace or not hasattr(lovelace, "resources"):
            _LOGGER.debug("VpMobile24: Lovelace resource store not available yet")
            return

        resources = lovelace.resources
        try:
            await resources.async_load()
        except Exception:
            pass

        existing = resources.async_items()

        # Find any existing resource that belongs to this card
        correct_id = None   # ID of a resource already at the correct URL
        wrong_id = None     # ID of a resource at a wrong/old URL

        for item in existing:
            url = item.get("url", "")
            if url == CARD_URL_WWW:
                correct_id = item.get("id")
                break  # already correct, nothing to do
            for pattern in _CARD_URL_PATTERNS:
                if pattern in url:
                    wrong_id = item.get("id")
                    _LOGGER.info(
                        "VpMobile24: found card resource with wrong URL '%s', will update to '%s'",
                        url, CARD_URL_WWW,
                    )
                    break

        if correct_id is not None:
            _LOGGER.debug("VpMobile24: card resource already correct (%s)", CARD_URL_WWW)
            return

        if wrong_id is not None:
            # Update existing wrong entry to correct URL
            await resources.async_update_item(
                wrong_id, {"res_type": "module", "url": CARD_URL_WWW}
            )
            _LOGGER.info("VpMobile24: card resource updated to %s", CARD_URL_WWW)
        else:
            # No entry found at all — create one
            await resources.async_create_item(
                {"res_type": "module", "url": CARD_URL_WWW}
            )
            _LOGGER.info("VpMobile24: card resource registered: %s", CARD_URL_WWW)

    except Exception as err:
        _LOGGER.warning(
            "VpMobile24: could not register Lovelace resource: %s. "
            "Please add manually: %s (JavaScript module)",
            err, CARD_URL_WWW,
        )

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
        entry.options.get(CONF_CLASS_NAME) or entry.data.get("class_name"),
        entry.options.get(CONF_EXCLUDED_SUBJECTS, entry.data.get(CONF_EXCLUDED_SUBJECTS, []))
    )
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Register device — always use the effective class (options override data)
    device_registry = dr.async_get(hass)
    school_id = entry.data["school_id"]
    effective_class = entry.options.get(CONF_CLASS_NAME) or entry.data.get("class_name", "")
    device_id = f"{school_id}_{effective_class}" if effective_class else school_id
    device_name = (
        f"VpMobile24 \u2013 {effective_class} ({school_id})"
        if effective_class
        else f"VpMobile24 ({school_id})"
    )

    # Remove any stale devices for this config entry that have a different identifier
    # (happens when class was changed via options flow)
    for dev in list(device_registry.devices.values()):
        if entry.entry_id in dev.config_entries:
            if (DOMAIN, device_id) not in dev.identifiers:
                _LOGGER.info(
                    "VpMobile24: removing stale device %s (old class)", dev.name
                )
                device_registry.async_remove_device(dev.id)

    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, device_id)},
        name=device_name,
        manufacturer="VpMobile24",
        model="Stundenplan Integration",
        sw_version="2.4.8",
    )

    # Options update listener — apply new class/subjects immediately without HA restart
    async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
        new_class = entry.options.get(CONF_CLASS_NAME) or entry.data.get("class_name")
        new_excluded = entry.options.get(CONF_EXCLUDED_SUBJECTS, entry.data.get(CONF_EXCLUDED_SUBJECTS, []))
        coord = hass.data[DOMAIN][entry.entry_id]
        class_changed = coord.class_name != new_class
        if class_changed:
            old_class = coord.class_name  # save before overwriting
            coord.class_name = new_class
            coord._week_data_cache = {}
            coord._current_week_monday = None
            coord._week_data = None
            _LOGGER.info("VpMobile24: class changed to %s, cache cleared", new_class)

            # Update entry title
            school_id = entry.data["school_id"]
            new_title = f"VpMobile24 \u2013 {new_class} ({school_id})" if new_class else f"VpMobile24 ({school_id})"
            hass.config_entries.async_update_entry(entry, title=new_title)

            # Update device name
            device_registry = dr.async_get(hass)
            device_id = f"{school_id}_{new_class}" if new_class else school_id
            device = device_registry.async_get_device(identifiers={(DOMAIN, device_id)})
            if not device:
                # Old device with old class name — find and update it
                old_device_id = f"{school_id}_{old_class}" if old_class else school_id
                device = device_registry.async_get_device(identifiers={(DOMAIN, old_device_id)})
            if device:
                device_registry.async_update_device(
                    device.id,
                    name=new_title,
                    new_identifiers={(DOMAIN, device_id)},
                )

        coord.excluded_subjects = new_excluded
        await coord.async_request_refresh()

    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    # Copy card to www on every setup (ensures file is always up to date)
    await hass.async_add_executor_job(_copy_card_to_www, hass)
    # Register / fix the Lovelace resource URL
    await _async_register_lovelace_resource(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the vpmobile24 component."""
    await hass.async_add_executor_job(_copy_card_to_www, hass)
    # Register / fix the Lovelace resource URL (fires after HA is ready)
    async def _register_after_start(_event=None) -> None:
        await _async_register_lovelace_resource(hass)
    hass.bus.async_listen_once("homeassistant_started", _register_after_start)
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
        """Return the original subject for a cancelled slot, or '' if ambiguous."""
        if course:
            return base_schedule.get((weekday_index, period, course), "")
        candidates = [
            subj for (wd, per, _crs), subj in base_schedule.items()
            if wd == weekday_index and per == period
        ]
        unique = list(dict.fromkeys(candidates))
        return unique[0] if len(unique) == 1 else ""

    def _is_parallel_course_cancellation(self, base_schedule, weekday_index, period, cancel_course):
        """Return True if the cancellation is for a parallel course the student doesn't attend.

        Logic: If the cancelled entry has a specific course (Ku2) AND
        that course exists in base_schedule AND
        there are OTHER courses for the same (weekday, period) in base_schedule
        → this cancellation belongs to a parallel group the student is not in.
        """
        if not cancel_course:
            return False
        # The cancelled course must exist in base_schedule (it's a known course)
        cancel_course_known = (weekday_index, period, cancel_course) in base_schedule
        if not cancel_course_known:
            return False
        # Count distinct courses for this (weekday, period)
        other_courses = [
            crs for (wd, per, crs), subj in base_schedule.items()
            if wd == weekday_index and per == period and crs != cancel_course
        ]
        # If there are other parallel courses in the same slot → parallel group
        return len(other_courses) > 0

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
                _LOGGER.info(f"New week detected (Monday: {monday_str}), clearing cache")
                self._week_data_cache = {}
                self._current_week_monday = monday_str

            week_dates = []
            for i in range(5):
                week_dates.append((monday_this_week + timedelta(days=i)).isoformat())

            if self._week_data is None:
                self._week_data = {
                    "lessons": [],
                    "changes": [],
                    "additional_info": [],
                    "timestamp": "",
                    "days_loaded": 0
                }

            cached_dates = set(self._week_data_cache.keys())
            _LOGGER.debug(f"Cached dates: {cached_dates}")

            dates_to_load = [today]
            for date_str in week_dates:
                if date_str not in cached_dates and date_str != today_str:
                    try:
                        dates_to_load.append(date.fromisoformat(date_str))
                    except ValueError:
                        continue

            _LOGGER.debug(f"Loading dates: {[d.isoformat() for d in dates_to_load]}")

            for target_date in dates_to_load:
                try:
                    date_str = target_date.isoformat()
                    _LOGGER.debug(f"Fetching schedule for {date_str}")
                    day_data = await self.api.async_get_schedule(target_date, self.class_name)
                    self._week_data_cache[date_str] = {
                        "lessons": day_data.get("lessons", []),
                        "changes": day_data.get("changes", []),
                        "additional_info": day_data.get("additional_info", []),
                        "timestamp": day_data.get("timestamp", "")
                    }
                    _LOGGER.debug(f"Cached {date_str}: {len(day_data.get('lessons', []))} lessons, {len(day_data.get('additional_info', []))} additional_info")
                except Exception as ex:
                    ex_str = str(ex)
                    if "404" in ex_str:
                        _LOGGER.debug("No schedule for %s (404 - weekend/holiday)", target_date)
                    else:
                        _LOGGER.warning("Could not fetch schedule for %s: %s", target_date, ex)
                    continue

            # ── Feature 1: Pre-fetch next week so the card can show it ──────
            next_monday = monday_this_week + timedelta(weeks=1)
            next_week_dates = [
                (next_monday + timedelta(days=i)).isoformat() for i in range(5)
            ]
            for date_str in next_week_dates:
                if date_str not in self._week_data_cache:
                    try:
                        target = date.fromisoformat(date_str)
                        day_data = await self.api.async_get_schedule(target, self.class_name)
                        self._week_data_cache[date_str] = {
                            "lessons": day_data.get("lessons", []),
                            "changes": day_data.get("changes", []),
                            "additional_info": day_data.get("additional_info", []),
                            "timestamp": day_data.get("timestamp", "")
                        }
                        _LOGGER.debug("Pre-fetched next week %s", date_str)
                    except Exception as ex:
                        ex_str = str(ex)
                        if "404" not in ex_str:
                            _LOGGER.debug("Could not pre-fetch next week %s: %s", date_str, ex)
                        continue

            # ----------------------------------------------------------------
            # Build base_schedule: normal timetable without substitutions.
            # Key: (weekday_index, period, course) -> subject
            # Using course distinguishes AGs that share the same period,
            # e.g. "Toepfern" vs "Lernwerkstatt" both in period 7.
            # ----------------------------------------------------------------
            base_schedule = {}

            for date_str in week_dates:
                if date_str in self._week_data_cache:
                    cached_day = self._week_data_cache[date_str]
                    try:
                        date_obj = date.fromisoformat(date_str)
                        weekday_index = date_obj.weekday()

                        for lesson in cached_day.get("lessons", []):
                            period = lesson.get("period", "")
                            subject = lesson.get("subject", "")
                            course = lesson.get("course", "")
                            is_change = lesson.get("is_change", False)

                            if period and subject and not is_change and subject not in ["\u2014", "", " "]:
                                key = (weekday_index, period, course)
                                if key not in base_schedule:
                                    base_schedule[key] = subject
                    except ValueError:
                        continue

            _LOGGER.debug(f"Base schedule created with {len(base_schedule)} entries")

            # ----------------------------------------------------------------
            # Assemble filtered week data
            # ----------------------------------------------------------------
            all_lessons = []
            all_changes = []
            all_additional_info = []
            latest_timestamp = ""

            for date_str in week_dates:
                if date_str in self._week_data_cache:
                    cached_day = self._week_data_cache[date_str]
                    try:
                        date_obj = date.fromisoformat(date_str)
                        day_name = date_obj.strftime("%A")
                        weekday_index = date_obj.weekday()

                        for lesson in cached_day.get("lessons", []):
                            subject = lesson.get("subject", "")
                            period = lesson.get("period", "")

                            if not subject or subject.strip() in ["\u2014", "", " "]:
                                lesson_course = lesson.get("course", "")
                                if lesson_course and lesson_course in self.excluded_subjects:
                                    _LOGGER.debug(f"Skipping cancelled lesson for excluded course {lesson_course} on {date_str} period {period}")
                                    continue
                                # Skip if this is a parallel-group cancellation the student doesn't attend
                                if self._is_parallel_course_cancellation(base_schedule, weekday_index, period, lesson_course):
                                    _LOGGER.debug(f"Skipping parallel-group cancellation for course {lesson_course} on {date_str} period {period}")
                                    continue
                                original_subject = self._resolve_original_subject(
                                    base_schedule, weekday_index, period, lesson_course
                                )
                                if original_subject and original_subject in self.excluded_subjects:
                                    _LOGGER.debug(f"Skipping cancelled lesson for excluded subject {original_subject} on {date_str} period {period}")
                                    continue
                            elif subject in self.excluded_subjects:
                                continue

                            lesson_copy = lesson.copy()
                            lesson_copy["date"] = date_str
                            lesson_copy["day_name"] = day_name
                            all_lessons.append(lesson_copy)

                        for change in cached_day.get("changes", []):
                            subject = change.get("subject", "")
                            period = change.get("period", "")

                            if not subject or subject.strip() in ["\u2014", "", " "]:
                                change_course = change.get("course", "")
                                if change_course and change_course in self.excluded_subjects:
                                    _LOGGER.debug(f"Skipping cancelled change for excluded course {change_course} on {date_str} period {period}")
                                    continue
                                # Skip if this is a parallel-group cancellation the student doesn't attend
                                if self._is_parallel_course_cancellation(base_schedule, weekday_index, period, change_course):
                                    _LOGGER.debug(f"Skipping parallel-group cancellation for course {change_course} on {date_str} period {period}")
                                    continue
                                original_subject = self._resolve_original_subject(
                                    base_schedule, weekday_index, period, change_course
                                )
                                if original_subject and original_subject in self.excluded_subjects:
                                    _LOGGER.debug(f"Skipping cancelled change for excluded subject {original_subject} on {date_str} period {period}")
                                    continue
                            elif subject in self.excluded_subjects:
                                continue

                            change_copy = change.copy()
                            change_copy["date"] = date_str
                            change_copy["day_name"] = day_name
                            all_changes.append(change_copy)

                        for info in cached_day.get("additional_info", []):
                            info_text = info.get("text", "") if isinstance(info, dict) else str(info)
                            if info_text and info_text not in [
                                i.get("text", "") if isinstance(i, dict) else str(i)
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
                "days_loaded": len([d for d in week_dates if d in self._week_data_cache])
            }

            _LOGGER.debug(f"Week data assembled: {len(all_lessons)} lessons from {self._week_data['days_loaded']} days (after filtering excluded subjects), {len(all_additional_info)} additional_info")

            today_lessons = [l for l in all_lessons if l.get("date") == today_str]
            today_changes = [c for c in all_changes if c.get("date") == today_str]

            _LOGGER.debug(f"Today's data extracted: {len(today_lessons)} lessons, {len(today_changes)} changes")

            if not all_lessons and not all_changes:
                _LOGGER.info("No schedule data available (possibly school holidays)")
                return {
                    "lessons": [],
                    "changes": [],
                    "additional_info": [],
                    "date": today_str,
                    "timestamp": "",
                    "week_lessons": [],
                    "week_changes": []
                }

            today_data = {
                "lessons": today_lessons,
                "changes": today_changes,
                "additional_info": all_additional_info,
                "date": today_str,
                "timestamp": latest_timestamp,
                "week_lessons": all_lessons,
                "week_changes": all_changes,
            }

            _LOGGER.debug("Data update completed successfully")
            return today_data

        except Exception as e:
            _LOGGER.error(f"Error updating data: {e}")
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
