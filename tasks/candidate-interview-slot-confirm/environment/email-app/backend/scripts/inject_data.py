#!/usr/bin/env python
"""Seed data for candidate-interview-slot-confirm.

Priya proposes 3 windows on 2026-04-05. Only the free segment
15:15-16:00 (inside window 3) is a 45-minute opening; windows 1 and 2 are
fully busy in the calendar.
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
        priya = gocu("priya_nair", "priya.nair@candidates.mosi.inc")

        request_email = Email(
            sender_id=priya.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Interview availability -- Priya Nair",
            body=(
                "Hi Peter,\n\n"
                "Thanks for considering my application. Here are the windows "
                "I'm available on 2026-04-05 for the 45-minute interview:\n\n"
                "  - 09:00-10:00\n"
                "  - 13:00-14:00\n"
                "  - 15:00-16:30\n\n"
                "Pick the one that works for you.\n\n"
                "Best,\nPriya"
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=10),
        )
        db.session.add(request_email)

        # Distractor
        recruiter = gocu("recruiter_orla", "orla@external-recruit.io")
        d = Email(
            sender_id=recruiter.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Spring talent pool update",
            body="Sharing this week's candidate pipeline. Not actionable.",
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=3),
        )
        db.session.add(d)

        db.session.commit()
        print(f"Seeded {Email.query.count()} emails (candidate-interview-slot-confirm)")


if __name__ == "__main__":
    main()
