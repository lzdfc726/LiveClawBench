#!/usr/bin/env bash
set -uo pipefail
bash /workspace/startup.sh

mkdir -p /workspace/notes
cat > /workspace/notes/newsletter-digest.md <<'EOF'
# Newsletter digest -- 2026-04-03

- VectorDB Cloud row-level ACLs
- OpenBrowse persistent sessions
- NovaStack Series A
EOF

python3 <<'PY'
import sys
sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app, db
from models import Email, User

with app.app_context():
    peter = User.query.filter_by(username="peter").first()
    db.session.add(Email(
        sender_id=peter.id,
        recipient_id=None,
        recipient_email="research@work.mosi.inc",
        subject="Newsletter digest -- 2026-04-03",
        body=(
            "Top three updates this cycle:\n\n"
            "  - VectorDB Cloud row-level ACLs\n"
            "  - OpenBrowse persistent sessions\n"
            "  - NovaStack Series A\n"
        ),
        folder="sent",
        is_read=True,
    ))
    db.session.commit()
    print("Oracle: digest file + email sent")
PY
