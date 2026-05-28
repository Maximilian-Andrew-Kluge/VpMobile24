"""API client for stundenplan24.de."""
from __future__ import annotations

import logging
from datetime import datetime, date, timedelta
from typing import Any
import xml.etree.ElementTree as ET

import aiohttp
from aiohttp import BasicAuth

_LOGGER = logging.getLogger(__name__)

# Subjects that represent an empty / cancelled slot in the XML
_EMPTY_SUBJECTS = {"", " ", "\u2014", "---", "-"}


class Stundenplan24API:
    """API client for stundenplan24.de."""

    def __init__(
        self,
        school_id: str,
        username: str,
        password: str,
        base_url: str = "https://www.stundenplan24.de",
    ) -> None:
        """Initialize the API client."""
        self.school_id = school_id
        self.username = username
        self.password = password
        self.base_url = base_url
        self.session: aiohttp.ClientSession | None = None

    async def async_get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def async_test_connection(self) -> bool:
        """Test the connection to stundenplan24."""
        try:
            session = await self.async_get_session()
            auth = BasicAuth(self.username, self.password)
            test_url = f"{self.base_url}/{self.school_id}/mobil/plankl.html"
            async with session.get(test_url, auth=auth, timeout=aiohttp.ClientTimeout(total=10)) as response:
                return response.status == 200
        except Exception as ex:
            _LOGGER.error("Error testing connection: %s", ex)
            return False

    async def async_get_classes(self) -> list[str]:
        """Get list of available classes."""
        session = await self.async_get_session()
        auth = BasicAuth(self.username, self.password)
        classes_url = f"{self.base_url}/{self.school_id}/mobil/mobdaten/Klassen.xml"
        async with session.get(classes_url, auth=auth, timeout=aiohttp.ClientTimeout(total=10)) as response:
            if response.status == 200:
                xml_content = await response.text()
                root = ET.fromstring(xml_content)
                classes = []
                for kl in root.findall(".//Kl"):
                    kurz = kl.find("Kurz")
                    if kurz is not None and kurz.text:
                        classes.append(kurz.text)
                return classes
            raise Exception(f"HTTP {response.status}")

    async def async_get_schedule(
        self,
        target_date: date | None = None,
        class_name: str | None = None,
    ) -> dict[str, Any]:
        """Get schedule data from stundenplan24.

        Raises an exception on failure so callers can decide how to handle it.
        404 responses (weekend / holiday) are logged at DEBUG level only.
        """
        if target_date is None:
            target_date = date.today()

        session = await self.async_get_session()
        auth = BasicAuth(self.username, self.password)
        date_str = target_date.strftime("%Y%m%d")
        xml_url = f"{self.base_url}/{self.school_id}/mobil/mobdaten/PlanKl{date_str}.xml"

        try:
            async with session.get(
                xml_url, auth=auth, timeout=aiohttp.ClientTimeout(total=15)
            ) as response:
                if response.status == 200:
                    xml_content = await response.text()
                    return self._parse_xml_schedule(xml_content, target_date, class_name)
                # Non-200 → raise so the coordinator can handle it
                raise Exception(f"HTTP {response.status} - Schedule not available for {target_date}")

        except Exception as ex:
            ex_str = str(ex)
            if "404" in ex_str:
                # Weekend / holiday — completely normal, no noise in the log
                _LOGGER.debug(
                    "Schedule not available for %s (404 – weekend/holiday)", target_date
                )
            else:
                _LOGGER.error("Error fetching schedule: %s", ex)
            raise

    async def async_get_multi_day_schedule(
        self,
        start_date: date | None = None,
        days: int = 2,
        class_name: str | None = None,
    ) -> dict[str, Any]:
        """Get schedule data for multiple days (school days Mon–Fri only)."""
        if start_date is None:
            start_date = date.today()

        all_lessons: list = []
        all_changes: list = []
        all_additional_info: list = []
        latest_timestamp = ""

        current_date = start_date
        days_loaded = 0
        max_attempts = days * 2
        attempts = 0

        while days_loaded < days and attempts < max_attempts:
            attempts += 1
            if current_date.weekday() >= 5:  # Saturday / Sunday
                current_date += timedelta(days=1)
                continue

            try:
                day_data = await self.async_get_schedule(current_date, class_name)
                for lesson in day_data.get("lessons", []):
                    lesson["date"] = current_date.isoformat()
                    lesson["day_name"] = current_date.strftime("%A")
                    all_lessons.append(lesson)
                for change in day_data.get("changes", []):
                    change["date"] = current_date.isoformat()
                    change["day_name"] = current_date.strftime("%A")
                    all_changes.append(change)
                if days_loaded == 0:
                    all_additional_info = day_data.get("additional_info", [])
                    latest_timestamp = day_data.get("timestamp", "")
                days_loaded += 1
            except Exception as ex:
                _LOGGER.debug("Could not fetch schedule for %s: %s", current_date, ex)

            current_date += timedelta(days=1)

        return {
            "date": start_date.isoformat(),
            "lessons": all_lessons,
            "changes": all_changes,
            "additional_info": all_additional_info,
            "last_updated": datetime.now().isoformat(),
            "timestamp": latest_timestamp,
            "days_loaded": days,
        }

    # ------------------------------------------------------------------
    # XML parsing
    # ------------------------------------------------------------------

    def _parse_xml_schedule(
        self,
        xml_content: str,
        target_date: date,
        class_name: str | None = None,
    ) -> dict[str, Any]:
        """Parse XML schedule data."""
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError as e:
            _LOGGER.error("XML parsing error: %s", e)
            raise Exception(f"Invalid XML data: {e}") from e

        schedule_data: dict[str, Any] = {
            "date": target_date.isoformat(),
            "lessons": [],
            "changes": [],
            "additional_info": [],
            "last_updated": datetime.now().isoformat(),
            "timestamp": "",
            "classes": [],
        }

        # Timestamp
        zeitstempel = root.find(".//zeitstempel")
        if zeitstempel is not None and zeitstempel.text:
            schedule_data["timestamp"] = zeitstempel.text

        # General additional info
        zusatz_info = root.find(".//ZusatzInfo")
        if zusatz_info is not None:
            for zi_zeile in zusatz_info.findall("ZiZeile"):
                if zi_zeile.text and zi_zeile.text.strip():
                    schedule_data["additional_info"].append(
                        {"text": zi_zeile.text.strip(), "type": "general_info"}
                    )

        # Classes to process
        classes_to_process = []
        for kl in root.findall(".//Kl"):
            kurz = kl.find("Kurz")
            if kurz is not None and kurz.text:
                if class_name is None or kurz.text == class_name:
                    classes_to_process.append((kurz.text, kl))
                    schedule_data["classes"].append(kurz.text)

        for class_short, kl_element in classes_to_process:
            pl_element = kl_element.find("Pl")
            if pl_element is not None:
                for std in pl_element.findall("Std"):
                    lesson = self._parse_lesson(std, class_short)
                    if lesson:
                        if lesson.get("is_change", False):
                            schedule_data["changes"].append(lesson)
                        else:
                            schedule_data["lessons"].append(lesson)

        schedule_data["lessons"] = self._sort_lessons(schedule_data["lessons"])
        schedule_data["changes"] = self._sort_lessons(schedule_data["changes"])
        return schedule_data

    def _parse_lesson(
        self, std_element: ET.Element, class_name: str
    ) -> dict[str, Any] | None:
        """Parse a single lesson from XML."""
        try:
            lesson: dict[str, Any] = {
                "class": class_name,
                "period": "",
                "time_start": "",
                "time_end": "",
                "subject": "",
                "teacher": "",
                "room": "",
                "course": "",
                "info": "",
                "is_change": False,
            }

            st = std_element.find("St")
            if st is not None and st.text:
                lesson["period"] = st.text

            beginn = std_element.find("Beginn")
            ende = std_element.find("Ende")
            if beginn is not None and beginn.text:
                lesson["time_start"] = beginn.text
            if ende is not None and ende.text:
                lesson["time_end"] = ende.text

            fa = std_element.find("Fa")
            if fa is not None and fa.text:
                lesson["subject"] = fa.text
                if fa.get("FaAe") == "FaGeaendert":
                    lesson["is_change"] = True

            le = std_element.find("Le")
            if le is not None and le.text:
                lesson["teacher"] = le.text
                if le.get("LeAe") == "LeGeaendert":
                    lesson["is_change"] = True

            ra = std_element.find("Ra")
            if ra is not None and ra.text:
                lesson["room"] = ra.text
                if ra.get("RaAe") == "RaGeaendert":
                    lesson["is_change"] = True

            ku2 = std_element.find("Ku2")
            if ku2 is not None and ku2.text:
                lesson["course"] = ku2.text

            info = std_element.find("If")
            if info is not None and info.text:
                lesson["info"] = info.text
                lesson["is_change"] = True

            if lesson["time_start"] and lesson["time_end"]:
                lesson["time"] = f"{lesson['time_start']}-{lesson['time_end']}"
            elif lesson["time_start"]:
                lesson["time"] = lesson["time_start"]
            else:
                lesson["time"] = f"{lesson['period']}. Stunde"

            if lesson["period"] or lesson["subject"]:
                return lesson
            return None

        except Exception as e:
            _LOGGER.error("Error parsing lesson: %s", e)
            return None

    def _sort_lessons(self, lessons: list[dict]) -> list[dict]:
        """Sort lessons by period, class, then start time."""
        def sort_key(lesson: dict):
            try:
                period = int(lesson.get("period", "0"))
            except (ValueError, TypeError):
                period = 999
            class_name = lesson.get("class", "")
            time_start = lesson.get("time_start", "")
            try:
                if time_start and ":" in time_start:
                    h, m = map(int, time_start.split(":"))
                    time_sort = h * 60 + m
                else:
                    time_sort = 999
            except (ValueError, TypeError):
                time_sort = 999
            return (period, class_name, time_sort)

        try:
            return sorted(lessons, key=sort_key)
        except Exception:
            return lessons

    async def async_close(self) -> None:
        """Close the aiohttp session."""
        if self.session:
            await self.session.close()
            self.session = None
