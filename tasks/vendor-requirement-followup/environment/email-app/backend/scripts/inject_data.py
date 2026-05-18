#!/usr/bin/env python
"""Seed data for vendor-requirement-followup."""

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
        vendor = gocu("orchid_systems_ops", "ops@orchid-systems.com")
        near_vendor = gocu("orchid_partners", "partners@orchid-partners.com")
        finance = gocu("finance_ops", "finance@work.mosi.inc")

        # Target: requirement summary
        target = Email(
            sender_id=vendor.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Requirement Summary: Phoenix Analytics pilot API scope",
            body=(
                "Hi Peter,\n\n"
                "Attached is the latest requirement summary for the Phoenix Analytics "
                "pilot. Key items:\n"
                "  - Authentication: OAuth2 client credentials, scoped per tenant\n"
                "  - Data freshness: 5-minute incremental sync\n"
                "  - Rate limits: 200 rps per project\n"
                "  - Optional features: row-level ACLs (deferred to phase 2)\n\n"
                "Best,\nOps @ Orchid Systems"
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=6),
        )
        db.session.add(target)

        # Distractor 1: near-duplicate domain
        d1 = Email(
            sender_id=near_vendor.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Quarterly partner sync",
            body=(
                "Hi Peter,\n\n"
                "Quick reminder about Orchid Partners' quarterly sync next month. "
                "Nothing actionable today.\n\nThanks,\nOrchid Partners"
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=20),
        )
        db.session.add(d1)

        # Distractor 2: same product, different topic
        d2 = Email(
            sender_id=finance.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Phoenix budget check",
            body=(
                "Hey Peter, finance here. Just confirming the Phoenix Analytics "
                "pilot budget is still under the cap. No action required."
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=2),
        )
        db.session.add(d2)

        db.session.commit()
        print(f"Seeded {Email.query.count()} emails (vendor-requirement-followup)")


if __name__ == "__main__":
    main()
