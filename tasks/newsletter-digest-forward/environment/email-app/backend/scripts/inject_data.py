#!/usr/bin/env python
"""Seed data for newsletter-digest-forward."""
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
        vector = gocu("vectordb_news", "news@vectordb-cloud.io")
        openbrowse = gocu("openbrowse_builders", "builders@openbrowse.dev")
        founders = gocu("founders_editor", "editor@founders-brief.com")
        pulse = gocu("marketing_pulse", "pulse@marketing-pulse.io")

        rows = [
            # Three target unread newsletters (recent)
            (vector,
             "Weekly Vector Digest -- 2026-04-02",
             "Top stories this week:\n\n"
             "  1. VectorDB Cloud row-level ACLs are now generally available...\n"
             "  2. New benchmark publication...\n"
             "  3. Customer story from FinTech\n\n--Vector Digest team",
             36),
            (openbrowse,
             "OpenBrowse Builders Notes -- April",
             "Hello builders!\n\n"
             "Headline update: OpenBrowse persistent sessions are now in beta. "
             "Sessions survive a tab reload and auth restart -- huge unlock for "
             "long-running automation flows.\n\nOther items: tooling refresh, "
             "community office hours.\n\n--OpenBrowse",
             34),
            (founders,
             "Founders Brief -- 2026-04-02",
             "This week's headline: NovaStack Series A closed at $42M led by "
             "Crucible Ventures. Big news for the agent-platform space.\n\n"
             "Other items: regulatory roundup, hiring trends.\n\n--Founders Brief",
             32),
            # Older distractor
            (pulse,
             "Marketing Pulse Monthly -- March",
             "Hot off the press: April mascot giveaway launches for our enterprise "
             "tier customers. Plus: brand survey results, content roadmap.\n\n--Marketing Pulse",
             24 * 14),  # 14 days old
        ]
        for sender, subject, body, hours in rows:
            db.session.add(Email(
                sender_id=sender.id,
                recipient_id=peter.id,
                recipient_email=peter.email,
                subject=subject,
                body=body,
                folder="inbox",
                is_read=False,
                created_at=datetime.utcnow() - timedelta(hours=hours),
            ))

        db.session.commit()
        print(f"Seeded {Email.query.count()} emails (newsletter-digest-forward)")


if __name__ == "__main__":
    main()
