"""Demo mode data for VpMobile24 – offline test data without real credentials."""
from __future__ import annotations

from datetime import date, timedelta, datetime
from typing import Any

# ── Stundenzeiten ─────────────────────────────────────────────────────────────
_TIMES = {
    1: ("07:45", "08:30"),
    2: ("08:40", "09:25"),
    3: ("09:25", "10:10"),
    4: ("10:30", "11:15"),
    5: ("11:25", "12:10"),
    6: ("12:45", "13:30"),
    7: ("13:40", "14:25"),
    8: ("14:35", "15:20"),
}

_DAYS_DE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]

def _lesson(period: int, subject: str, teacher: str, room: str, cls: str,
            is_change: bool = False, info: str = "", cancelled: bool = False,
            target_date: date | None = None) -> dict[str, Any]:
    t_start, t_end = _TIMES.get(period, ("", ""))
    return {
        "class": cls,
        "period": str(period),
        "time_start": t_start,
        "time_end": t_end,
        "time": f"{t_start}-{t_end}" if t_start else f"{period}. Stunde",
        "subject": "" if cancelled else subject,
        "teacher": teacher,
        "room": room,
        "course": "",
        "info": info,
        "is_change": is_change or cancelled,
        "nr": str(period),
        "date": (target_date or date.today()).isoformat(),
        "day_name": _DAYS_DE[target_date.weekday()] if target_date else "",
    }


def _get_week_monday(offset: int = 0) -> date:
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    return monday + timedelta(weeks=offset)


def get_demo_data_student(class_name: str = "10b") -> dict[str, Any]:
    """Generate demo data for a student (Schüler-Modus)."""
    monday = _get_week_monday()
    today = date.today()
    today_str = today.isoformat()

    # ── Tagesplan (heute) ────────────────────────────────────────────────────
    lessons = []
    changes = []

    if today.weekday() < 5:  # Wochentag
        lessons = [
            _lesson(1, "Mathematik",   "MÜL", "201", class_name, target_date=today),
            _lesson(2, "Deutsch",      "SCH", "105", class_name, target_date=today),
            _lesson(3, "Englisch",     "BRN", "107", class_name, target_date=today),
            _lesson(4, "Physik",       "WEI", "Lab1", class_name, target_date=today),
            _lesson(6, "Geschichte",   "HAR", "203", class_name, target_date=today),
            _lesson(7, "Sport",        "KOC", "Sporthalle", class_name, target_date=today),
        ]
        changes = [
            _lesson(5, "Vertretung",   "VER", "108", class_name,
                    is_change=True, info="Frau Braun krank – Herr Schulz vertritt",
                    target_date=today),
            _lesson(8, "",             "---", "---", class_name,
                    cancelled=True, info="Chemie fällt aus",
                    target_date=today),
        ]

    # ── Wochenplan ───────────────────────────────────────────────────────────
    week_timetable = {
        0: [  # Montag
            _lesson(1, "Mathematik",   "MÜL", "201", class_name, target_date=monday),
            _lesson(2, "Deutsch",      "SCH", "105", class_name, target_date=monday),
            _lesson(3, "Englisch",     "BRN", "107", class_name, target_date=monday),
            _lesson(4, "Physik",       "WEI", "Lab1", class_name, target_date=monday),
            _lesson(5, "Chemie",       "FIS", "Lab2", class_name, target_date=monday),
            _lesson(6, "Geschichte",   "HAR", "203", class_name, target_date=monday),
        ],
        1: [  # Dienstag
            _lesson(1, "Biologie",     "GRÜ", "Bio1", class_name, target_date=monday+timedelta(1)),
            _lesson(2, "Mathematik",   "MÜL", "201", class_name, target_date=monday+timedelta(1)),
            _lesson(3, "Kunst",        "ROS", "Kunstraum", class_name, target_date=monday+timedelta(1)),
            _lesson(5, "Informatik",   "KLE", "PC1", class_name, target_date=monday+timedelta(1)),
            _lesson(6, "Religion",     "BAU", "106", class_name, target_date=monday+timedelta(1)),
        ],
        2: [  # Mittwoch
            _lesson(1, "Deutsch",      "SCH", "105", class_name, target_date=monday+timedelta(2)),
            _lesson(2, "Englisch",     "BRN", "107", class_name, target_date=monday+timedelta(2)),
            _lesson(3, "Sport",        "KOC", "Sporthalle", class_name, target_date=monday+timedelta(2)),
            _lesson(4, "Musik",        "DEM", "Musikraum", class_name, target_date=monday+timedelta(2)),
            _lesson(5, "Mathematik",   "MÜL", "201", class_name, target_date=monday+timedelta(2)),
        ],
        3: [  # Donnerstag
            _lesson(1, "Physik",       "WEI", "Lab1", class_name, target_date=monday+timedelta(3)),
            _lesson(2, "Geschichte",   "HAR", "203", class_name, target_date=monday+timedelta(3)),
            _lesson(3, "Deutsch",      "SCH", "105", class_name, target_date=monday+timedelta(3)),
            _lesson(4, "Englisch",     "BRN", "107", class_name, target_date=monday+timedelta(3)),
            _lesson(5, "Chemie",       "FIS", "Lab2", class_name,
                    is_change=True, info="Raumänderung: Lab3", target_date=monday+timedelta(3)),
        ],
        4: [  # Freitag
            _lesson(1, "Biologie",     "GRÜ", "Bio1", class_name, target_date=monday+timedelta(4)),
            _lesson(2, "Mathematik",   "MÜL", "201", class_name, target_date=monday+timedelta(4)),
            _lesson(3, "Informatik",   "KLE", "PC1", class_name, target_date=monday+timedelta(4)),
            _lesson(4, "Sport",        "KOC", "Sporthalle", class_name, target_date=monday+timedelta(4)),
            _lesson(5, "",             "---", "---", class_name,
                    cancelled=True, info="Kunst fällt aus", target_date=monday+timedelta(4)),
        ],
    }

    week_lessons = []
    week_changes = []
    for wd, day_lessons in week_timetable.items():
        for l in day_lessons:
            if l["is_change"] or not l["subject"]:
                week_changes.append(l)
            else:
                week_lessons.append(l)

    return {
        "date": today_str,
        "lessons": lessons,
        "changes": changes,
        "week_lessons": week_lessons,
        "week_changes": week_changes,
        "additional_info": [
            {"text": "🎭 Demo-Modus aktiv – keine echten Schuldaten", "type": "general_info"},
            {"text": "Elternsprechtag am 15.09. von 15–18 Uhr", "type": "general_info"},
        ],
        "last_updated": datetime.now().isoformat(),
        "timestamp": datetime.now().strftime("%d.%m.%Y %H:%M"),
        "classes": [class_name],
        "is_demo": True,
    }


def get_demo_data_teacher(teacher_short: str = "DEM") -> dict[str, Any]:
    """Generate demo data for a teacher (Lehrer-Modus)."""
    monday = _get_week_monday()
    today = date.today()
    today_str = today.isoformat()

    lessons = []
    changes = []

    if today.weekday() < 5:
        lessons = [
            _lesson(2, "Musik",  teacher_short, "Musikraum", "8a",  target_date=today),
            _lesson(3, "Musik",  teacher_short, "Musikraum", "9b",  target_date=today),
            _lesson(5, "Musik",  teacher_short, "Musikraum", "10b", target_date=today),
            _lesson(7, "Chor",   teacher_short, "Aula",      "AG",  target_date=today),
        ]
        changes = [
            _lesson(4, "Vertretung", teacher_short, "205", "6c",
                    is_change=True, info="Vertretung für Frau Braun (krank)",
                    target_date=today),
        ]

    week_lessons = []
    week_changes = []
    classes_by_day = {
        0: [("8a","Musik",2),("9b","Musik",4),("10b","Musik",6)],
        1: [("7a","Musik",1),("8b","Musik",3),("AG","Chor",7)],
        2: [("8a","Musik",2),("9b","Musik",4),("10b","Musik",5)],
        3: [("7b","Musik",2),("9a","Musik",5)],
        4: [("8b","Musik",1),("10a","Musik",3),("AG","Chor",6)],
    }
    for wd, entries in classes_by_day.items():
        d = monday + timedelta(days=wd)
        for cls, subj, period in entries:
            week_lessons.append(_lesson(period, subj, teacher_short, "Musikraum", cls, target_date=d))

    # Eine Vertretung am Donnerstag
    week_changes.append(
        _lesson(4, "Vertretung", teacher_short, "205", "6c",
                is_change=True, info="Vertretung für Frau Braun",
                target_date=monday+timedelta(3))
    )

    return {
        "date": today_str,
        "lessons": lessons,
        "changes": changes,
        "week_lessons": week_lessons,
        "week_changes": week_changes,
        "additional_info": [
            {"text": "🎭 Demo-Modus aktiv – keine echten Schuldaten", "type": "general_info"},
            {"text": f"Lehrer-Demo: {teacher_short} | Fach: Musik", "type": "general_info"},
        ],
        "last_updated": datetime.now().isoformat(),
        "timestamp": datetime.now().strftime("%d.%m.%Y %H:%M"),
        "classes": list({e[0] for entries in classes_by_day.values() for e in entries}),
        "is_demo": True,
    }
