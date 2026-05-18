#!/usr/bin/env bash
# Deterministic oracle: directly insert the winning acceptance email into the DB.
set -euo pipefail

# Make sure backend services are running (needed for sqlite file to be there)
bash /workspace/startup.sh

python3 <<'PY'
import sys
sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app, db
from models import Email, User

with app.app_context():
    peter = User.query.filter_by(username="peter").first()
    acceptance = Email(
        sender_id=peter.id,
        recipient_id=None,
        recipient_email="sales@asterbyte.io",
        subject="Re: Procurement RFQ -- 24 x LaptopX1",
        body=(
            "Hi AsterByte,\n\n"
            "Thanks for the quote. We'd like to proceed with your offer at "
            "USD 1180/unit, 5 business-day delivery. Please send the PO "
            "confirmation and we'll confirm the order on our side.\n\n"
            "Best,\nPeter"
        ),
        folder="sent",
        is_read=True,
    )
    db.session.add(acceptance)
    db.session.commit()
    print("Oracle: acceptance email inserted to sales@asterbyte.io")
PY
