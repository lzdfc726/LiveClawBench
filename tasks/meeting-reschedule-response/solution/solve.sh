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
        recipient_email="alice.chen@work.mosi.inc",
        subject="Re: Reschedule design review",
        body="Hi Alice,\n\n16:00-16:30 on 2026-04-04 works for me. Let's lock that.\n\nPeter",
        folder="sent",
        is_read=True,
    )
    db.session.add(reply)
    db.session.commit()
    print("Oracle: reply sent to alice.chen with 16:00-16:30")
PY
