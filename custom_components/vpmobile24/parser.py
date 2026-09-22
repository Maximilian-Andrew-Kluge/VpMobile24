"""Pure XML parsing logic for stundenplan24.de schedule data.

This module deliberately depends only on the Python standard library
(no aiohttp / homeassistant), so the parsing behaviour can be unit-tested
in isolation. The API client (api_new.py) delegates to these functions.
"""
from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any
import xml.etree.ElementTree as ET

_LOGGER = logging.getLogger(__name__)

# Values that represent "no real subject" (cancellation markers).
_SUPERVISION_TERMS = ("aufsicht", "pausenaufsicht")


def parse_lesson(std_element: ET.Element, class_name: str) -> dict[str, Any] | None:
    """Parse a single <Std> lesson element into a normalized dict.

    Returns None if the element carries neither a period nor a subject.
    """
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
            "is_supervision": False,
            "nr": "",
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

        nr = std_element.find("Nr")
        if nr is not None and nr.text:
            lesson["nr"] = nr.text.strip()

        info = std_element.find("If")
        if info is not None and info.text:
            lesson["info"] = info.text
            lesson["is_change"] = True

        # ── Detect break supervisions (Pausenaufsichten) ──────────────
        # stundenplan24 encodes supervisions in the subject or info field
        # with keywords like "Aufsicht" / "Pausenaufsicht" (sometimes the
        # short "AU"). These are especially relevant in teacher mode.
        subject_l = (lesson["subject"] or "").strip().lower()
        info_l = (lesson["info"] or "").strip().lower()
        if (
            any(term in subject_l for term in _SUPERVISION_TERMS)
            or any(term in info_l for term in _SUPERVISION_TERMS)
            or subject_l in ("au",)
        ):
            lesson["is_supervision"] = True
            # Make sure supervisions always have a readable label so they
            # are not rendered as a cancellation (—).
            if not lesson["subject"] or subject_l in ("au",):
                lesson["subject"] = "Aufsicht"

        # If subject is empty but info text AND teacher are present,
        # treat it as a special lesson (e.g. "Klassenleiterstunde").
        # Use the info text as subject so it's NOT shown as cancellation (—).
        if not lesson["subject"] and lesson["info"] and lesson["teacher"]:
            lesson["subject"] = lesson["info"]

        if lesson["time_start"] and lesson["time_end"]:
            lesson["time"] = f"{lesson['time_start']}-{lesson['time_end']}"
        elif lesson["time_start"]:
            lesson["time"] = lesson["time_start"]
        else:
            lesson["time"] = f"{lesson['period']}. Stunde"

        if lesson["period"] or lesson["subject"]:
            return lesson
        return None

    except Exception as e:  # noqa: BLE001 - defensive, never break the whole parse
        _LOGGER.error("Error parsing lesson: %s", e)
        return None


def sort_lessons(lessons: list[dict]) -> list[dict]:
    """Sort lessons by period, then class, then start time."""
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
    except Exception:  # noqa: BLE001
        return lessons


def parse_xml_schedule(
    xml_content: str,
    target_date: date,
    class_name: str | None = None,
    teacher_short: str | None = None,
) -> dict[str, Any]:
    """Parse a full PlanKl XML document into schedule data.

    Args:
        xml_content: Raw XML string.
        target_date: The date this plan is for.
        class_name: In student mode, only this class is processed.
        teacher_short: In teacher mode, all classes are processed and lessons
            are filtered to those taught by this teacher abbreviation.
    """
    try:
        root = ET.fromstring(xml_content)

        schedule_data: dict[str, Any] = {
            "date": target_date.isoformat(),
            "lessons": [],
            "changes": [],
            "additional_info": [],
            "last_updated": datetime.now().isoformat(),
            "timestamp": "",
            "classes": [],
        }

        zeitstempel = root.find(".//zeitstempel")
        if zeitstempel is not None and zeitstempel.text:
            schedule_data["timestamp"] = zeitstempel.text

        zusatz_info = root.find(".//ZusatzInfo")
        if zusatz_info is not None:
            for zi_zeile in zusatz_info.findall("ZiZeile"):
                if zi_zeile.text and zi_zeile.text.strip():
                    schedule_data["additional_info"].append({
                        "text": zi_zeile.text.strip(),
                        "type": "general_info",
                    })

        classes_to_process = []
        for kl in root.findall(".//Kl"):
            kurz = kl.find("Kurz")
            if kurz is not None and kurz.text:
                # Teacher mode: process ALL classes (filter by teacher later)
                # Student mode: only process the selected class
                if teacher_short is not None or class_name is None or kurz.text == class_name:
                    classes_to_process.append((kurz.text, kl))
                    schedule_data["classes"].append(kurz.text)

        for class_short, kl_element in classes_to_process:
            # ── Build set of lesson-numbers (Nr) from Unterricht block ──
            # Each <UeNr> has a lesson number; <Nr> in <Std> references it.
            # This tells us which lessons actually belong to THIS class/student.
            unterricht_nrs: set[str] = set()
            # In teacher mode skip the Unterricht filter — teachers see all lessons
            if not teacher_short:
                unterricht_el = kl_element.find("Unterricht")
                if unterricht_el is not None:
                    for ue in unterricht_el.findall("Ue"):
                        ue_nr = ue.find("UeNr")
                        if ue_nr is not None and ue_nr.text:
                            unterricht_nrs.add(ue_nr.text.strip())

            pl_element = kl_element.find("Pl")
            if pl_element is not None:
                for std in pl_element.findall("Std"):
                    lesson = parse_lesson(std, class_short)
                    if lesson:
                        # ── Teacher mode: only keep lessons for this teacher ──
                        if teacher_short:
                            lesson_teacher = lesson.get("teacher", "").strip()
                            if lesson_teacher.upper() != teacher_short.upper():
                                continue
                        else:
                            # Filter by Unterricht membership when possible
                            lesson_nr = lesson.get("nr", "")
                            if unterricht_nrs and lesson_nr and lesson_nr not in unterricht_nrs:
                                # Belongs to a parallel group not in the student's Unterricht
                                continue
                        if lesson.get("is_change", False):
                            schedule_data["changes"].append(lesson)
                        else:
                            schedule_data["lessons"].append(lesson)

        schedule_data["lessons"] = sort_lessons(schedule_data["lessons"])
        schedule_data["changes"] = sort_lessons(schedule_data["changes"])
        return schedule_data

    except ET.ParseError as e:
        _LOGGER.error("XML parsing error: %s", e)
        raise Exception(f"Invalid XML data: {e}") from e
    except Exception as e:
        _LOGGER.error("Error parsing schedule: %s", e)
        raise
