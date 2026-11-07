"""Compare complete daily snapshots without treating missing plans as cancellations."""
from __future__ import annotations

FIELDS = ("subject", "teacher", "room", "time_start", "time_end", "info")


def cancelled(lesson):
    return not lesson.get("is_supervision") and str(lesson.get("subject") or "").strip() in ("", "—", "–", "---", "-")


def snapshot(lessons):
    """Group parallel lessons; ambiguous matches are deliberately not guessed."""
    result = {}
    for lesson in lessons:
        key = (str(lesson.get("period", "")), str(lesson.get("class", "")), str(lesson.get("course", "")))
        result.setdefault(key, []).append(dict(lesson))
    return result


def compare_day(previous, current, day):
    """Emit one structured change per unambiguous existing lesson."""
    result = []
    for key, lessons in current.items():
        old = previous.get(key, [])
        if len(old) != 1 or len(lessons) != 1:
            continue
        before, after = old[0], lessons[0]
        fields = [field for field in FIELDS if before.get(field) != after.get(field)]
        if not fields:
            continue
        kind = ("cancelled" if cancelled(after) and not cancelled(before) else
                "restored" if cancelled(before) and not cancelled(after) else
                "room" if "room" in fields and set(fields) <= {"room", "info"} else "updated")
        subject = after.get("subject") if not cancelled(after) else before.get("subject")
        label = f"{day} · {key[0]}. · {subject or '—'}"
        if kind == "cancelled":
            de, en = "Stunde fällt aus", "Lesson cancelled"
        elif kind == "restored":
            de, en = "Stunde findet wieder statt", "Lesson reinstated"
        elif "room" in fields:
            de = f"Raum {before.get('room') or '—'} → {after.get('room') or '—'}"
            en = f"Room {before.get('room') or '—'} → {after.get('room') or '—'}"
        else:
            labels = {"subject": ("Fach", "Subject"), "teacher": ("Lehrer", "Teacher"),
                      "time_start": ("Beginn", "Start"), "time_end": ("Ende", "End"),
                      "info": ("Info", "Info")}
            de_parts, en_parts = [], []
            for field in fields:
                if field not in labels:
                    continue
                value = f"{before.get(field) or '—'} → {after.get(field) or '—'}"
                de_parts.append(f"{labels[field][0]}: {value}")
                en_parts.append(f"{labels[field][1]}: {value}")
            de, en = "; ".join(de_parts) or "Stunde geändert", "; ".join(en_parts) or "Lesson changed"
        result.append({"date": day, "period": key[0], "kind": kind,
                       "fields": fields, "before": before, "after": after,
                       "message_de": f"{label}: {de}", "message_en": f"{label}: {en}"})
    return result
