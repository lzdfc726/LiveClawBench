#!/usr/bin/env python3
"""Seed calendar events for candidate-interview-slot-confirm.

2026-04-05: windows 1 (09:00-10:00) and 2 (13:00-14:00) fully busy;
window 3 (15:00-16:30) has busy 14:00-15:15 and 16:00-16:45 flanking,
leaving exactly 15:15-16:00 free (45 minutes).
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db, Event

EVENTS = [
    ("Team standup",        "2026-04-05T09:00:00", "2026-04-05T10:00:00", "2026-04-05", [], True, ""),
    ("Architecture review", "2026-04-05T13:00:00", "2026-04-05T14:00:00", "2026-04-05", [], True, "Room A"),
    ("Vendor onboarding",   "2026-04-05T14:00:00", "2026-04-05T15:15:00", "2026-04-05", [], True, "Zoom"),
    ("Bug bash retro",      "2026-04-05T16:00:00", "2026-04-05T16:45:00", "2026-04-05", [], True, ""),
    ("Lunch hold",          "2026-04-05T12:00:00", "2026-04-05T13:00:00", "2026-04-05", [], True, ""),
    # Adjacent-day distractors
    ("Sprint planning",     "2026-04-04T10:00:00", "2026-04-04T11:00:00", "2026-04-04", [], True, ""),
    ("Friday demo",         "2026-04-06T15:00:00", "2026-04-06T16:00:00", "2026-04-06", [], True, ""),
]


def main():
    with app.app_context():
        if Event.query.count() > 0:
            print("Calendar already seeded")
            return
        for title, start, end, day, atts, busy, loc in EVENTS:
            db.session.add(Event(
                title=title, start_time=start, end_time=end, day_key=day,
                attendees=json.dumps(atts), busy=busy, location=loc,
            ))
        db.session.commit()
        print(f"Seeded {Event.query.count()} calendar events")


if __name__ == "__main__":
    main()
