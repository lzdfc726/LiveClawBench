#!/usr/bin/env python3
"""Seed calendar events for conference-travel-change-notify-team.

2026-04-11 (impacted day, new arrival 17:45):
  Amy 16:00-17:00 — IMPACTED (event starts before 17:45)
  Leo 17:00-18:30 — IMPACTED (event starts before 17:45)
  Welcome dinner (all four) 20:00-22:00 — after arrival, not impacted
  Nina hotel check-in 19:30-20:30 — after arrival, not impacted
2026-04-10: Amy travel-prep — different day
2026-04-12: Sam keynote-prep 09:00-10:00 — different day, NOT impacted
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db, Event

EVENTS = [
    # 2026-04-11
    ("Workshop check-in @ NeuroConf", "2026-04-11T16:00:00", "2026-04-11T17:00:00", "2026-04-11",
     ["amy.cho@work.mosi.inc"], True, "NeuroConf Hall A"),
    ("Sponsor booth setup",           "2026-04-11T17:00:00", "2026-04-11T18:30:00", "2026-04-11",
     ["leo.qin@work.mosi.inc"], True, "NeuroConf Expo Hall"),
    ("Hotel check-in",                "2026-04-11T19:30:00", "2026-04-11T20:30:00", "2026-04-11",
     ["nina.zhou@work.mosi.inc"], True, "Hotel Pavilion"),
    ("Welcome dinner (all hands)",    "2026-04-11T20:00:00", "2026-04-11T22:00:00", "2026-04-11",
     ["amy.cho@work.mosi.inc","leo.qin@work.mosi.inc","nina.zhou@work.mosi.inc","sam.park@work.mosi.inc"], True, ""),
    # Adjacent-day distractors
    ("Travel prep sync",              "2026-04-10T15:00:00", "2026-04-10T15:30:00", "2026-04-10",
     ["amy.cho@work.mosi.inc"], True, ""),
    ("Day-2 keynote prep",            "2026-04-12T09:00:00", "2026-04-12T10:00:00", "2026-04-12",
     ["sam.park@work.mosi.inc"], True, ""),
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
