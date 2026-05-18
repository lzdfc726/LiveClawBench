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
    db.session.add(Email(
        sender_id=peter.id, recipient_id=None,
        recipient_email="ops@work.mosi.inc",
        subject="Escalation: BlueHarbor Labs -- stale > 48h",
        body=(
            "Heads up -- BlueHarbor Labs has been waiting since 2026-04-01 on "
            "contract redline blocked by missing DPA. No reply has gone out from "
            "our side. Flagging for ops follow-up."
        ),
        folder="sent", is_read=True,
    ))
    db.session.commit()
    print("Oracle: escalation email to ops")
PY

python3 <<'PY'
from pathlib import Path
p = Path("/workspace/notes/client-escalation-log.md")
content = p.read_text() if p.exists() else "# Client Escalation Log\n"
new_line = "- 2026-04-03 — BlueHarbor Labs — contract redline blocked by missing DPA."
if new_line not in content:
    p.write_text(content.rstrip() + "\n" + new_line + "\n")
print("Oracle: log entry appended")
PY
