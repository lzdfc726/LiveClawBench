#!/usr/bin/env python
"""Seed data for meeting-reschedule-response.

Alice proposes three slots on 2026-04-04; the calendar (separate mock) has
busy blocks covering two of them, leaving 16:00-16:30 free.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta

from app import app, db
from models import Email, User


def get_or_create_peter():
    peter = User.query.filter_by(username="peter").first()
    if not peter:
        peter = User(username="peter", email="peter.griffin@email.app")
        peter.set_password("password123")
        db.session.add(peter)
        db.session.commit()
    return peter


def get_or_create_user(username, email):
    existing = User.query.filter_by(username=username).first()
    if existing:
        return existing
    u = User(username=username, email=email)
    u.set_password("password123")
    db.session.add(u)
    db.session.commit()
    return u


def main():
    with app.app_context():
        peter = get_or_create_peter()
        alice = get_or_create_user("alice_chen", "alice.chen@work.mosi.inc")

        # Target: reschedule request from Alice
        request_email = Email(
            sender_id=alice.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Reschedule design review",
            body=(
                "Hi Peter,\n\n"
                "Can we move tomorrow's design review? I have a clash. "
                "Could any of these work for you on 2026-04-04?\n\n"
                "  - 10:00-10:30\n"
                "  - 13:30-14:00\n"
                "  - 16:00-16:30\n\n"
                "Whichever fits is fine.\n\n"
                "Thanks,\nAlice"
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=14),
        )
        db.session.add(request_email)

        # Distractor: unrelated thread (different sender)
        other = get_or_create_user("ravi_sales", "ravi.s@external.com")
        distractor = Email(
            sender_id=other.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Quick check on sales numbers",
            body="Peter, can you share the March numbers when you have a sec? --R",
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=4),
        )
        db.session.add(distractor)

        db.session.commit()
        print(f"Seeded {Email.query.count()} emails (meeting-reschedule-response)")


if __name__ == "__main__":
    main()
