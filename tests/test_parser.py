"""Unit tests for the pure XML parser (custom_components/vpmobile24/parser.py).

These tests cover the regression cases reported by users:
- Oberstufenkurse (short course codes like "la1", issue #17)
- Cancellations (Ausfall)
- Substitutions (Vertretung, FaGeaendert)
- Zeroth period (nullte Stunde, period "0")
- Break supervisions (Pausenaufsichten)

The parser depends only on the standard library, so no aiohttp /
homeassistant install is required to run these.
"""
from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path

# Make the integration package importable without installing it.
_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_ROOT / "custom_components" / "vpmobile24"))

import parser  # noqa: E402  (import after sys.path tweak)


def _std(**fields) -> ET.Element:
    """Build a <Std> element from simple field kwargs.

    Example: _std(St="1", Fa="MA", Le="MUE", Ra="201", Nr="10")
    Attributes can be set via a "<Tag>__attr" dict, e.g. Fa_attr={"FaAe": "FaGeaendert"}.
    """
    std = ET.Element("Std")
    for tag, value in fields.items():
        if tag.endswith("_attr"):
            continue
        el = ET.SubElement(std, tag)
        el.text = str(value)
        attr = fields.get(f"{tag}_attr")
        if attr:
            for k, v in attr.items():
                el.set(k, v)
    return std


# ── parse_lesson ────────────────────────────────────────────────────────────

def test_normal_lesson():
    lesson = parser.parse_lesson(
        _std(St="1", Beginn="07:45", Ende="08:30", Fa="MA", Le="MUE", Ra="201", Nr="10"),
        "10b",
    )
    assert lesson is not None
    assert lesson["subject"] == "MA"
    assert lesson["teacher"] == "MUE"
    assert lesson["room"] == "201"
    assert lesson["period"] == "1"
    assert lesson["time"] == "07:45-08:30"
    assert lesson["is_change"] is False
    assert lesson["is_supervision"] is False


def test_oberstufenkurs_la1_survives():
    """Issue #17: la1 is subject AND course; must be parsed intact."""
    lesson = parser.parse_lesson(
        _std(St="7", Beginn="13:40", Ende="14:25", Fa="la1", Ku2="la1", Le="TIL", Ra="49", Nr="643"),
        "JG11",
    )
    assert lesson is not None
    assert lesson["subject"] == "la1"
    assert lesson["course"] == "la1"
    assert lesson["nr"] == "643"
    assert lesson["is_change"] is False


def test_substitution_flag():
    lesson = parser.parse_lesson(
        _std(St="3", Fa="EN", Fa_attr={"FaAe": "FaGeaendert"}, Le="SCH", Nr="5"),
        "10b",
    )
    assert lesson is not None
    assert lesson["is_change"] is True


def test_cancellation_has_no_subject():
    """A <Std> with a period but empty subject is a cancellation slot."""
    std = ET.Element("Std")
    ET.SubElement(std, "St").text = "5"
    ET.SubElement(std, "Fa")  # empty subject
    ET.SubElement(std, "Nr").text = "8"
    lesson = parser.parse_lesson(std, "10b")
    assert lesson is not None
    assert lesson["subject"] == ""
    assert lesson["period"] == "5"


def test_zeroth_period():
    """Nullte Stunde: period '0' must be preserved, not dropped."""
    lesson = parser.parse_lesson(
        _std(St="0", Beginn="07:50", Ende="08:35", Fa="DE", Le="ABC", Nr="1"),
        "10b",
    )
    assert lesson is not None
    assert lesson["period"] == "0"
    assert lesson["subject"] == "DE"


def test_supervision_by_keyword():
    lesson = parser.parse_lesson(
        _std(St="3", Fa="Aufsicht", Le="MUE", Ra="Hof", Nr="99"),
        "",
    )
    assert lesson is not None
    assert lesson["is_supervision"] is True
    assert lesson["subject"] == "Aufsicht"


def test_supervision_short_code_au():
    std = ET.Element("Std")
    ET.SubElement(std, "St").text = "4"
    ET.SubElement(std, "Fa").text = "AU"
    ET.SubElement(std, "Le").text = "MUE"
    lesson = parser.parse_lesson(std, "")
    assert lesson is not None
    assert lesson["is_supervision"] is True
    assert lesson["subject"] == "Aufsicht"


def test_empty_std_returns_none():
    lesson = parser.parse_lesson(ET.Element("Std"), "10b")
    assert lesson is None


# ── sort_lessons ─────────────────────────────────────────────────────────────

def test_sort_by_period_including_zero():
    lessons = [
        {"period": "2", "class": "10b", "time_start": "08:40"},
        {"period": "0", "class": "10b", "time_start": "07:50"},
        {"period": "1", "class": "10b", "time_start": "07:45"},
    ]
    ordered = [l["period"] for l in parser.sort_lessons(lessons)]
    assert ordered == ["0", "1", "2"]


# ── parse_xml_schedule ───────────────────────────────────────────────────────

_XML_JG11 = """<?xml version="1.0" encoding="utf-8"?>
<VpMobil>
  <Kopf><zeitstempel>18.09.2026, 07:00</zeitstempel></Kopf>
  <Klassen>
    <Kl>
      <Kurz>JG11</Kurz>
      <Unterricht>
        <Ue><UeNr UeFa="LA" UeGr="la1" UeLe="TIL">643</UeNr></Ue>
      </Unterricht>
      <Pl>
        <Std>
          <St>7</St><Beginn>13:40</Beginn><Ende>14:25</Ende>
          <Fa>la1</Fa><Ku2>la1</Ku2><Le>TIL</Le><Ra>49</Ra><Nr>643</Nr><If></If>
        </Std>
      </Pl>
    </Kl>
  </Klassen>
  <ZusatzInfo><ZiZeile>Heute kein Schülercafe.</ZiZeile></ZusatzInfo>
</VpMobil>
"""


def test_parse_xml_la1_present_for_class():
    data = parser.parse_xml_schedule(_XML_JG11, date(2026, 9, 18), class_name="JG11")
    subjects = [l["subject"] for l in data["lessons"]]
    assert "la1" in subjects
    assert data["timestamp"] == "18.09.2026, 07:00"
    assert data["additional_info"] and data["additional_info"][0]["text"] == "Heute kein Schülercafe."


def test_parse_xml_other_class_filtered_out():
    data = parser.parse_xml_schedule(_XML_JG11, date(2026, 9, 18), class_name="10b")
    # JG11 lessons must not appear when a different class is selected
    assert data["lessons"] == []


def test_parse_xml_teacher_mode():
    data = parser.parse_xml_schedule(_XML_JG11, date(2026, 9, 18), teacher_short="TIL")
    subjects = [l["subject"] for l in data["lessons"]]
    assert "la1" in subjects


def test_parse_xml_teacher_mode_other_teacher():
    data = parser.parse_xml_schedule(_XML_JG11, date(2026, 9, 18), teacher_short="XYZ")
    assert data["lessons"] == []
