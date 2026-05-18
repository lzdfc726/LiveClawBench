#!/usr/bin/env python
"""Seed data for procurement-quote-compare-reply.

Seeds Peter's mailbox with an outgoing RFQ (in the `sent` folder) and three
inbound quote replies (in `inbox`) from AsterByte, NorthPeak, and LatticePro.
Only AsterByte satisfies both the $1200 budget cap and 7-business-day
delivery window from the RFQ.
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


def get_or_create_user(username: str, email: str) -> User:
    existing = User.query.filter_by(username=username).first()
    if existing:
        return existing
    user = User(username=username, email=email)
    user.set_password("password123")
    db.session.add(user)
    db.session.commit()
    return user


def main():
    with app.app_context():
        peter = get_or_create_peter()
        asterbyte = get_or_create_user("asterbyte_sales", "sales@asterbyte.io")
        northpeak = get_or_create_user("northpeak_quotes", "quotes@northpeak.tech")
        latticepro = get_or_create_user("latticepro_desk", "desk@latticepro.ai")

        rfq_subject = "Procurement RFQ -- 24 x LaptopX1"
        rfq_body = (
            "Hello vendors,\n\n"
            "Please quote on 24 units of LaptopX1 (16GB RAM, 512GB SSD).\n"
            "Budget cap: USD 1200 per unit.\n"
            "Delivery expected within 7 business days.\n"
            "Please reply with unit price and delivery commitment.\n\n"
            "Quote needed by 2026-04-04.\n\n"
            "Thanks,\nPeter"
        )
        for recipient in (asterbyte, northpeak, latticepro):
            rfq = Email(
                sender_id=peter.id,
                recipient_id=None,
                recipient_email=recipient.email,
                subject=rfq_subject,
                body=rfq_body,
                folder="sent",
                is_read=True,
                created_at=datetime.utcnow() - timedelta(days=2, hours=10),
            )
            db.session.add(rfq)

        replies = [
            (
                asterbyte,
                "Re: Procurement RFQ -- 24 x LaptopX1",
                "Hi Peter,\n\nWe can offer LaptopX1 at USD 1180 per unit. "
                "Delivery: 5 business days from PO confirmation.\n\nBest,\nAsterByte sales",
                1,
                4,
            ),
            (
                northpeak,
                "Re: Procurement RFQ -- 24 x LaptopX1",
                "Peter,\n\nOur unit price is USD 1090. Delivery: 6 weeks "
                "(we are out of stock; next batch from factory).\n\nThanks,\nNorthPeak",
                1,
                2,
            ),
            (
                latticepro,
                "Re: Procurement RFQ -- 24 x LaptopX1",
                "Hello,\n\nLatticePro can deliver LaptopX1 at USD 1240 per unit. "
                "Delivery: 4 business days. Premium support included.\n\nLatticePro desk",
                1,
                1,
            ),
        ]
        for sender, subject, body, days, hours in replies:
            email = Email(
                sender_id=sender.id,
                recipient_id=peter.id,
                recipient_email=peter.email,
                subject=subject,
                body=body,
                folder="inbox",
                is_read=False,
                created_at=datetime.utcnow() - timedelta(days=days, hours=hours),
            )
            db.session.add(email)

        db.session.commit()
        print(
            f"Seeded {Email.query.count()} emails for procurement-quote-compare-reply"
        )


if __name__ == "__main__":
    main()
