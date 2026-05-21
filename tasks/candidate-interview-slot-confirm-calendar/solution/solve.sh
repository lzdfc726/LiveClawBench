#!/usr/bin/env bash
set -uo pipefail
bash /workspace/startup.sh

python3 <<'PY'
import sys
sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app, db
from models import Email, User

with app.app_context():
    peter = User.query.filter_by(username="peter").first()
    reply = Email(
        sender_id=peter.id,
        recipient_id=None,
        recipient_email="priya.nair@candidates.mosi.inc",
        subject="Re: Interview availability -- Priya Nair",
        body="Hi Priya,\n\nConfirmed: 2026-04-05 15:15-16:00. Talk soon.\n\nPeter",
        folder="sent",
        is_read=True,
    )
    db.session.add(reply)
    db.session.commit()
    print("Oracle: reply sent to priya.nair with 15:15-16:00")
PY
