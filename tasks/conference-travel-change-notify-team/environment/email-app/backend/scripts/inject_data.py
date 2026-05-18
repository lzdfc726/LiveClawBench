#!/usr/bin/env python
"""Seed data for conference-travel-change-notify-team.

Organizer moves the team's arrival from 14:10 to 17:45 on 2026-04-11.
Calendar (separate mock) shows which teammate has events before/after 17:45.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from datetime import datetime, timedelta

from app import app, db
from models import Email, User


def gocu(username, email):
    u = User.query.filter_by(username=username).first()
    if u:
        return u
    u = User(username=username, email=email)
    u.set_password("password123")
    db.session.add(u)
    db.session.commit()
    return u


def main():
    with app.app_context():
        peter = gocu("peter", "peter.griffin@email.app")
        organizer = gocu("conf_ops", "conf-ops@neuroconf.org")
        hotel = gocu("hotel_concierge", "concierge@hotel-pavilion.com")

        # Target: travel change
        change = Email(
            sender_id=organizer.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Arrival update -- NeuroConf 2026",
            body=(
                "Hi attendees,\n\n"
                "Due to a runway change at the destination, the group arrival "
                "for NeuroConf 2026 on 2026-04-11 has been moved.\n\n"
                "  Previous arrival: 14:10 local\n"
                "  New arrival:      17:45 local\n\n"
                "Please update any teammates whose plans depend on the earlier "
                "arrival.\n\n"
                "Thanks,\nConference Ops"
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=18),
        )
        db.session.add(change)

        # Distractor
        breakfast = Email(
            sender_id=hotel.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Breakfast hours update",
            body="Just a heads-up: hotel breakfast service runs 06:30-10:00 during the conference.",
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=17),
        )
        db.session.add(breakfast)

        db.session.commit()
        print(f"Seeded {Email.query.count()} emails (conference-travel-change-notify-team)")


if __name__ == "__main__":
    main()
