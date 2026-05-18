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
        recipient_email="ops@orchid-systems.com",
        subject="Re: Requirement Summary: Phoenix Analytics pilot API scope",
        body=(
            "Hi,\n\nThanks for the summary -- received and we'll review it this "
            "week. Will follow up with questions if any.\n\nPeter"
        ),
        folder="sent",
        is_read=True,
    )
    db.session.add(reply)
    db.session.commit()
    print("Oracle: reply sent to ops@orchid-systems.com")
PY

# Update the tracker line in place, preserving the other two entries
python3 <<'PY'
from pathlib import Path
p = Path("/workspace/notes/requirements-tracker.md")
content = p.read_text()
target_old = "- Phoenix Analytics pilot API scope — awaiting latest summary"
target_new = "- Phoenix Analytics pilot API scope — received 2026-04-03"
if target_old in content:
    content = content.replace(target_old, target_new)
    p.write_text(content)
    print("Oracle: tracker line updated")
else:
    print("Oracle: target line not found; appending instead")
    p.write_text(content.rstrip() + "\n" + target_new + "\n")
PY
