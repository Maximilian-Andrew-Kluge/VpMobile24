"""API client for stundenplan24.de."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, date, timedelta
from typing import Any
import xml.etree.ElementTree as ET

import aiohttp
from aiohttp import BasicAuth

from .parser import parse_lesson, parse_xml_schedule, sort_lessons

_LOGGER = logging.getLogger(__name__)


class Stundenplan24AuthError(Exception):
    """Raised when the API returns 401/403 (invalid credentials)."""


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
        self._session_lock: asyncio.Lock | None = None

    async def async_get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session (concurrency-safe)."""
        if self._session_lock is None:
            self._session_lock = asyncio.Lock()
        async with self._session_lock:
            if self.session is None:
                self.session = aiohttp.ClientSession()
        return self.session

    async def async_test_connection(self) -> bool:
        """Test the connection to stundenplan24.

        Returns True if the server is reachable and credentials are accepted.
        Falls back to www only if the configured server has no data at all.
        """
        try:
            session = await self.async_get_session()
            auth = BasicAuth(self.username, self.password)

            status = await self._test_url(session, auth, self.base_url)
            if status == "ok":
                return True
            if status == "auth_fail":
                return False

            # 404 on configured server — only fall back to www if it's not already www
            # and the user didn't explicitly pick a zusatz server
            if self.base_url != "https://www.stundenplan24.de":
                _LOGGER.info(
                    "VpMobile24: server %s returned 404, trying www fallback",
                    self.base_url,
                )
                www_status = await self._test_url(
                    session, auth, "https://www.stundenplan24.de"
                )
                if www_status == "ok":
                    _LOGGER.info(
                        "VpMobile24: www fallback succeeded, switching base_url"
                    )
                    self.base_url = "https://www.stundenplan24.de"
                    return True
                if www_status == "auth_fail":
                    return False

            return False
        except Exception as ex:
            _LOGGER.error("Error testing connection: %s", ex)
            return False

    async def _test_url(
        self,
        session: aiohttp.ClientSession,
        auth: BasicAuth,
        base_url: str,
    ) -> str:
        """Try plankl.html then Klassen.xml. Returns 'ok', 'auth_fail', or 'not_found'."""
        for path in [
            f"{base_url}/{self.school_id}/mobil/plankl.html",
            f"{base_url}/{self.school_id}/mobil/mobdaten/Klassen.xml",
        ]:
            try:
                async with session.get(
                    path, auth=auth, timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        return "ok"
                    if resp.status in (401, 403):
                        return "auth_fail"
                    # 404 → try next path
            except Exception:
                return "not_found"
        return "not_found"

    async def async_get_classes(self) -> list[str]:
        """Get list of available classes."""
        try:
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
        except Exception as ex:
            _LOGGER.error("Error fetching classes: %s", ex)
            raise

    async def async_get_teachers(self) -> list[str]:
        """Get list of all teacher abbreviations.

        Strategy:
        1. Try daily schedule XMLs (PlanKl{date}.xml) with parallel batch
           requests (5 at a time) over a ±30 day window.
        2. If no schedule XML has data (e.g. school year transition / holidays),
           fall back to Klassen.xml which contains teacher abbreviations inside
           <Unterricht><UeNr>/<UeFa>/<UeLe> blocks for each class.
        """
        try:
            session = await self.async_get_session()
            auth = BasicAuth(self.username, self.password)
            teachers: set[str] = set()

            # Build candidate dates: today ± 30 days
            today = date.today()
            candidates = [today + timedelta(days=i) for i in range(0, 30)] + \
                         [today - timedelta(days=i) for i in range(1, 31)]

            # Fetch in parallel batches of 5
            batch_size = 5
            for i in range(0, len(candidates), batch_size):
                batch = candidates[i:i + batch_size]
                results = await asyncio.gather(
                    *(self._fetch_teachers_for_date(session, auth, d) for d in batch),
                    return_exceptions=True,
                )
                for result in results:
                    if isinstance(result, set):
                        teachers.update(result)
                if teachers:
                    break  # found data — stop searching

            # Fallback: extract teachers from Klassen.xml if no schedule was found
            if not teachers:
                teachers = await self._async_get_teachers_from_klassen(session, auth)

            return sorted(teachers)
        except Exception as ex:
            _LOGGER.error("Error fetching teachers: %s", ex)
            return []

    async def _fetch_teachers_for_date(
        self,
        session: aiohttp.ClientSession,
        auth: BasicAuth,
        check_date: date,
    ) -> set[str]:
        """Fetch teacher abbreviations from a single date's schedule XML."""
        teachers: set[str] = set()
        date_str = check_date.strftime("%Y%m%d")
        xml_url = f"{self.base_url}/{self.school_id}/mobil/mobdaten/PlanKl{date_str}.xml"
        try:
            async with session.get(xml_url, auth=auth, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status != 200:
                    return teachers
                xml_content = await response.text()
                root = ET.fromstring(xml_content)
                for le in root.findall(".//Le"):
                    if le.text and le.text.strip():
                        teachers.add(le.text.strip())
        except Exception:
            pass
        return teachers

    async def _async_get_teachers_from_klassen(
        self,
        session: aiohttp.ClientSession,
        auth: BasicAuth,
    ) -> set[str]:
        """Fallback: extract teacher abbreviations from Klassen.xml.

        Klassen.xml contains <Unterricht> blocks per class with <UeLe> elements
        holding teacher abbreviations. This file is always available, even when
        no daily schedule XMLs exist (e.g. during school year transitions).
        """
        teachers: set[str] = set()
        try:
            classes_url = f"{self.base_url}/{self.school_id}/mobil/mobdaten/Klassen.xml"
            async with session.get(classes_url, auth=auth, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status != 200:
                    return teachers
                xml_content = await response.text()
                root = ET.fromstring(xml_content)
                # <UeLe> elements contain teacher abbreviations
                for ue_le in root.findall(".//UeLe"):
                    if ue_le.text and ue_le.text.strip():
                        teachers.add(ue_le.text.strip())
                # Also check <Le> elements directly (some schemas use this)
                for le in root.findall(".//Le"):
                    if le.text and le.text.strip():
                        teachers.add(le.text.strip())
        except Exception as ex:
            _LOGGER.debug("Fallback teacher fetch from Klassen.xml failed: %s", ex)
        return teachers

    async def async_get_schedule(
        self,
        target_date: date | None = None,
        class_name: str | None = None,
        teacher_short: str | None = None,
    ) -> dict[str, Any]:
        """Get schedule data from stundenplan24."""
        try:
            session = await self.async_get_session()
            auth = BasicAuth(self.username, self.password)

            if target_date is None:
                target_date = date.today()

            date_str = target_date.strftime("%Y%m%d")
            xml_url = f"{self.base_url}/{self.school_id}/mobil/mobdaten/PlanKl{date_str}.xml"

            async with session.get(xml_url, auth=auth, timeout=aiohttp.ClientTimeout(total=15)) as response:
                if response.status == 200:
                    xml_content = await response.text()
                    return self._parse_xml_schedule(xml_content, target_date, class_name, teacher_short)
                if response.status in (401, 403):
                    raise Stundenplan24AuthError(
                        f"Authentication failed (HTTP {response.status}) for {target_date}"
                    )
                raise Exception(f"HTTP {response.status} - Schedule not available for {target_date}")

        except Exception as ex:
            ex_str = str(ex)
            if "404" in ex_str:
                _LOGGER.debug("Schedule not available for %s (404 - weekend/holiday)", target_date)
            else:
                _LOGGER.debug("Error fetching schedule for %s: %s", target_date, ex)
            raise

    def _parse_xml_schedule(
        self,
        xml_content: str,
        target_date: date,
        class_name: str | None = None,
        teacher_short: str | None = None,
    ) -> dict[str, Any]:
        """Parse XML schedule data (delegates to the pure parser module)."""
        return parse_xml_schedule(xml_content, target_date, class_name, teacher_short)

    def _parse_lesson(
        self, std_element: ET.Element, class_name: str
    ) -> dict[str, Any] | None:
        """Parse a single lesson from XML (delegates to the pure parser module)."""
        return parse_lesson(std_element, class_name)

    def _sort_lessons(self, lessons: list[dict]) -> list[dict]:
        """Sort lessons by period, class, then start time (delegates to parser)."""
        return sort_lessons(lessons)

    async def async_close(self) -> None:
        """Close the aiohttp session."""
        if self.session:
            await self.session.close()
            self.session = None
