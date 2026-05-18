#!/usr/bin/env python
"""Seed data for invoice-to-expense-draft."""

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
        northwind = gocu("northwind_ap", "ap@northwind-components.com")
        northbound = gocu("northbound_bill", "billing@northbound.io")

        # Target invoice
        target = Email(
            sender_id=northwind.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Invoice INV-NC-2048 -- April 2026",
            body=(
                "Hi Peter,\n\n"
                "Please find this month's invoice details below.\n\n"
                "  Vendor: Northwind Components\n"
                "  Invoice #: INV-NC-2048\n"
                "  Bill Date: 2026-04-03\n"
                "  Total Due: USD 1840.50\n"
                "  Attachment ref: inv_nc_2048 (file: INV-NC-2048.pdf)\n\n"
                "Payment due in 30 days.\n\n"
                "Best,\nNorthwind AP"
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=4),
        )
        db.session.add(target)

        # Distractor: purchase ack, similar-looking sender domain
        distractor = Email(
            sender_id=northbound.id,
            recipient_id=peter.id,
            recipient_email=peter.email,
            subject="Order Acknowledgement -- Purchase #87412",
            body=(
                "Hi Peter,\n\n"
                "Confirming receipt of your purchase order.\n\n"
                "  Order ID: 87412\n"
                "  Order Date: 2026-04-02\n"
                "  Estimated total: USD 920.00\n\n"
                "We will follow up with the invoice once items ship.\n\n"
                "--Northbound billing"
            ),
            folder="inbox",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=10),
        )
        db.session.add(distractor)

        db.session.commit()
        print(f"Seeded {Email.query.count()} emails (invoice-to-expense-draft)")


if __name__ == "__main__":
    main()
