#!/usr/bin/env python
"""Seed data for stale-client-escalation.

Target: BlueHarbor Labs VIP thread stale >48h, no outbound reply.
Distractors:
  - Nimbus Data VIP, recent inbound (<48h)
  - Stratoscape VIP, recent outbound reply (resolved)
  - Non-VIP marketing newsletter (stale but not a client)
  - Internal colleague (stale but not a client)
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
        bh = gocu("blueharbor_procurement", "procurement@blueharbor.example.com")
        nd = gocu("nimbus_acct", "acct@nimbus-data.example.com")
        ss = gocu("stratoscape_legal", "legal@stratoscape.example.com")
        mp = gocu("market_pulse_news", "news@market-pulse.io")
        colin = gocu("colin_eng", "colin@work.mosi.inc")

        now = datetime.utcnow()

        # Target: stale VIP (>48h, no outbound)
        db.session.add(
            Email(
                sender_id=bh.id,
                recipient_id=peter.id,
                recipient_email=peter.email,
                subject="Contract redline blocked -- DPA needed",
                body=(
                    "Hi Peter,\n\n"
                    "We're stuck on the contract redline -- our legal team can't sign "
                    "off without the Data Processing Addendum. Can you confirm the "
                    "DPA is on its way? This is blocking signature.\n\n"
                    "Thanks,\nBlueHarbor procurement"
                ),
                folder="inbox",
                is_read=False,
                created_at=now - timedelta(hours=56),
            )
        )

        # Distractor: recent VIP (10h ago)
        db.session.add(
            Email(
                sender_id=nd.id,
                recipient_id=peter.id,
                recipient_email=peter.email,
                subject="Re: April invoice question",
                body="Hi Peter, quick clarification on the April invoice... -- Nimbus AE",
                folder="inbox",
                is_read=False,
                created_at=now - timedelta(hours=10),
            )
        )

        # Distractor: resolved VIP (inbound stale BUT outbound reply more recent)
        db.session.add(
            Email(
                sender_id=ss.id,
                recipient_id=peter.id,
                recipient_email=peter.email,
                subject="Schema migration question",
                body="Peter, please review the schema migration plan for Q2... -- Stratoscape legal",
                folder="inbox",
                is_read=True,
                created_at=now - timedelta(hours=72),
            )
        )
        db.session.add(
            Email(
                sender_id=peter.id,
                recipient_id=None,
                recipient_email="legal@stratoscape.example.com",
                subject="Re: Schema migration question",
                body="Thanks -- approved, please proceed. --Peter",
                folder="sent",
                is_read=True,
                created_at=now - timedelta(hours=24),
            )
        )

        # Distractor: non-VIP stale newsletter
        db.session.add(
            Email(
                sender_id=mp.id,
                recipient_id=peter.id,
                recipient_email=peter.email,
                subject="Market Pulse -- March wrap-up",
                body="Top marketing trends... --Market Pulse",
                folder="inbox",
                is_read=False,
                created_at=now - timedelta(days=9),
            )
        )

        # Distractor: internal stale colleague
        db.session.add(
            Email(
                sender_id=colin.id,
                recipient_id=peter.id,
                recipient_email=peter.email,
                subject="Lunch tomorrow?",
                body="Hey Peter -- want to grab lunch tomorrow? --Colin",
                folder="inbox",
                is_read=True,
                created_at=now - timedelta(days=5),
            )
        )

        db.session.commit()
        print(f"Seeded {Email.query.count()} emails (stale-client-escalation)")


if __name__ == "__main__":
    main()
