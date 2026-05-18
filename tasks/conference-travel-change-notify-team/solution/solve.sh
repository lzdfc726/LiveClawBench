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
    common_body = (
        "Heads up — the NeuroConf group arrival on 2026-04-11 has moved from "
        "14:10 to 17:45. Your earlier event won't be covered by the new arrival; "
        "you may want to adjust."
    )
    for addr in ("amy.cho@work.mosi.inc", "leo.qin@work.mosi.inc"):
        db.session.add(Email(
            sender_id=peter.id,
            recipient_id=None,
            recipient_email=addr,
            subject="Heads up -- NeuroConf arrival moved",
            body=common_body,
            folder="sent",
            is_read=True,
        ))
    db.session.commit()
    print("Oracle: notified amy.cho and leo.qin")
PY
