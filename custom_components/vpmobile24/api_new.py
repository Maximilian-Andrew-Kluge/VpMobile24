"""API client for stundenplan24.de."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, date, time
from typing import Any
import re
import xml.etree.ElementTree as ET

import aiohttp
from aiohttp import BasicAuth

_LOGGER = logging.getLogger(__name__)


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
            
            # Test access to the mobile schedule page
            test_url = f"{self.base_url}/{self.school_id}/mobil/plankl.html"
            
            async with session.get(test_url, auth=auth, timeout=10) as response:
                return response.status == 200
                
        except Exception as ex:
            _LOGGER.error("Error testing connection: %s", ex)
            return False

    async def async_get_classes(self) -> list[str]:
        """Get list of available classes."""
        try:
            session = await self.async_get_session()
            auth = BasicAuth(self.username, self.password)
            
            classes_url = f"{self.base_url}/{self.school_id}/mobil/mobdaten/Klassen.xml"
            
            async with session.get(classes_url, auth=auth, timeout=10) as response:
                if response.status == 200:
                    xml_content = await response.text()
                    root = ET.fromstring(xml_content)
                    
                    classes = []
                    for kl in root.findall('.//Kl'):
                        kurz = kl.find('Kurz')
                        if kurz is not None and kurz.text:
                            classes.append(kurz.text)
                    
                    return classes
                else:
                    raise Exception(f"HTTP {response.status}")
                    
        except Exception as ex:
            _LOGGER.error("Error fetching classes: %s", ex)
            raise

    async def async_get_schedule(self, target_date: date | None = None, class_name: str | None = None) -> dict[str, Any]:
        """Get schedule data from stundenplan24."""
        try:
            session = await self.async_get_session()
            auth = BasicAuth(self.username, self.password)
            
            if target_date is None:
                target_date = date.today()
            
            # Format date as YYYYMMDD for the XML file
            date_str = target_date.strftime('%Y%m%d')
            xml_url = f"{self.base_url}/{self.school_id}/mobil/mobdaten/PlanKl{date_str}.xml"
            
            async with session.get(xml_url, auth=auth, timeout=15) as response:
                if response.status == 200:
                    xml_content = await response.text()
                    return self._parse_xml_schedule(xml_content, target_date, class_name)
                else:
                    raise Exception(f"HTTP {response.status} - Schedule not available for {target_date}")
                
        except Exception as ex:
            _LOGGER.error("Error fetching schedule: %s", ex)
            raise

    def _parse_xml_schedule(self, xml_content: str, target_date: date, class_name: str | None = None) -> dict[str, Any]:
        """Parse XML schedule data."""
        try:
            root = ET.fromstring(xml_content)
            
            schedule_data = {
                "date": target_date.isoformat(),
                "lessons": [],
                "changes": [],
                "last_updated": datetime.now().isoformat(),
                "timestamp": "",
                "classes": []
            }
            
            # Get timestamp
            zeitstempel = root.find('.//zeitstempel')
            if zeitstempel is not None and zeitstempel.text:
                schedule_data["timestamp"] = zeitstempel.text
            
            # Get all classes or filter by specific class
            classes_to_process = []
            for kl in root.findall('.//Kl'):
                kurz = kl.find('Kurz')
                if kurz is not None and kurz.text:
                    if class_name is None or kurz.text == class_name:
                        classes_to_process.append((kurz.text, kl))
                        schedule_data["classes"].append(kurz.text)
            
            # Process each class
            for class_short, kl_element in classes_to_process:
                # Get lessons for this class
                pl_element = kl_element.find('Pl')
                if pl_element is not None:
                    for std in pl_element.findall('Std'):
                        lesson = self._parse_lesson(std, class_short)
                        if lesson:
                            if lesson.get("is_change", False):
                                schedule_data["changes"].append(lesson)
                            else:
                                schedule_data["lessons"].append(lesson)
            
            # Sort lessons by time and class
            schedule_data["lessons"] = self._sort_lessons(schedule_data["lessons"])
            schedule_data["changes"] = self._sort_lessons(schedule_data["changes"])
            
            return schedule_data
            
        except ET.ParseError as e:
            _LOGGER.error("XML parsing error: %s", e)
            raise Exception(f"Invalid XML data: {e}")
        except Exception as e:
            _LOGGER.error("Error parsing schedule: %s", e)
            raise

    def _parse_lesson(self, std_element: ET.Element, class_name: str) -> dict[str, Any] | None:
        """Parse a single lesson from XML."""
        try:
            lesson = {
                "class": class_name,
                "period": "",
                "time_start": "",
                "time_end": "",
                "subject": "",
                "teacher": "",
                "room": "",
                "course": "",
                "info": "",
                "is_change": False
            }
            
            # Period (Stunde)
            st = std_element.find('St')
            if st is not None and st.text:
                lesson["period"] = st.text
            
            # Time
            beginn = std_element.find('Beginn')
            ende = std_element.find('Ende')
            if beginn is not None and beginn.text:
                lesson["time_start"] = beginn.text
            if ende is not None and ende.text:
                lesson["time_end"] = ende.text
            
            # Subject (Fach)
            fa = std_element.find('Fa')
            if fa is not None and fa.text:
                lesson["subject"] = fa.text
                
                # Check for subject changes
                fa_ae = fa.get('FaAe')
                if fa_ae == 'FaGeaendert':
                    lesson["is_change"] = True
            
            # Teacher (Lehrer)
            le = std_element.find('Le')
            if le is not None and le.text:
                lesson["teacher"] = le.text
                
                # Check for teacher changes
                le_ae = le.get('LeAe')
                if le_ae == 'LeGeaendert':
                    lesson["is_change"] = True
            
            # Room (Raum)
            ra = std_element.find('Ra')
            if ra is not None and ra.text:
                lesson["room"] = ra.text
                
                # Check for room changes
                ra_ae = ra.get('RaAe')
                if ra_ae == 'RaGeaendert':
                    lesson["is_change"] = True
            
            # Course (Kurs)
            ku2 = std_element.find('Ku2')
            if ku2 is not None and ku2.text:
                lesson["course"] = ku2.text
            
            # Info
            info = std_element.find('If')
            if info is not None and info.text:
                lesson["info"] = info.text
                # Info usually indicates changes
                if lesson["info"]:
                    lesson["is_change"] = True
            
            # Create time display
            if lesson["time_start"] and lesson["time_end"]:
                lesson["time"] = f"{lesson['time_start']}-{lesson['time_end']}"
            elif lesson["time_start"]:
                lesson["time"] = lesson["time_start"]
            else:
                lesson["time"] = f"{lesson['period']}. Stunde"
            
            # Only return if we have meaningful data
            if lesson["period"] or lesson["subject"]:
                return lesson
            
            return None
            
        except Exception as e:
            _LOGGER.error("Error parsing lesson: %s", e)
            return None

    def _sort_lessons(self, lessons: list[dict]) -> list[dict]:
        """Sort lessons by time and class."""
        def sort_key(lesson):
            # First by period number
            try:
                period = int(lesson.get("period", "0"))
            except (ValueError, TypeError):
                period = 999
            
            # Then by class name
            class_name = lesson.get("class", "")
            
            # Then by time
            time_start = lesson.get("time_start", "")
            try:
                if time_start and ":" in time_start:
                    hour, minute = map(int, time_start.split(":"))
                    time_sort = hour * 60 + minute
                else:
                    time_sort = 999
            except (ValueError, TypeError):
                time_sort = 999
            
            return (period, class_name, time_sort)
        
        try:
            return sorted(lessons, key=sort_key)
        except Exception:
            return lessons  # Return unsorted if sorting fails

    async def async_close(self) -> None:
        """Close the session."""
        if self.session:
            await self.session.close()
            self.session = None