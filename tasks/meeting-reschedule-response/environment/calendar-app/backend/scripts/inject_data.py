#!/usr/bin/env python3
"""Seed calendar events for meeting-reschedule-response.

Target: only 16:00-16:30 on 2026-04-04 is free. Busy blocks cover Alice's
other proposed slots (10:00-10:30 and 13:30-14:00).
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db, Event


EVENTS = [
    # 2026-04-04: target day
    ("Quarterly review",   "2026-04-04T09:45:00", "2026-04-04T10:30:00", "2026-04-04", [], True, "Room A"),
    ("Design crit prep",   "2026-04-04T11:30:00", "2026-04-04T12:00:00", "2026-04-04", [], True, "Room B"),
    ("Lunch hold",         "2026-04-04T12:00:00", "2026-04-04T13:00:00", "2026-04-04", [], True, ""),
    ("Vendor sync (Atlas)","2026-04-04T13:00:00", "2026-04-04T14:00:00", "2026-04-04", [], True, "Zoom"),
    # 16:00-16:30 left FREE on purpose
    ("Wrap-up sync",       "2026-04-04T17:00:00", "2026-04-04T17:30:00", "2026-04-04", [], True, ""),
    # Adjacent-day distractors
    ("Onboarding prep",    "2026-04-03T10:00:00", "2026-04-03T11:00:00", "2026-04-03", [], True, ""),
    ("Friday standup",     "2026-04-05T09:00:00", "2026-04-05T09:30:00", "2026-04-05", [], True, ""),
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
