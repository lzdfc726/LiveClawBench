#!/usr/bin/env python3
"""Verify stale-client-escalation.

Reward (sum = 1.0):
  0.4 escalation email to ops@work.mosi.inc, subject+body contains both
       'BlueHarbor' and 'contract redline' (case-insensitive).
       Partial: 0.2 if only one substring matches.
  0.4 client-escalation-log.md gains a new line (not in the seed) that
       contains 'BlueHarbor Labs', 'contract redline', and '2026-04-03'.
       Partial: 0.2 if BlueHarbor+redline present but date missing.
  0.2 preservation: prior log lines remain present AND no sent email to ops
       mentions any distractor client.
"""

import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app
from models import Email

LOG = Path("/workspace/notes/client-escalation-log.md")
SNAPSHOT = Path("/tests/_seed_snapshots/client-escalation-log.md")

DISTRACTOR_PATTERNS = [
    re.compile(r"nimbus data", re.IGNORECASE),
    re.compile(r"stratoscape", re.IGNORECASE),
    re.compile(r"market[- ]pulse", re.IGNORECASE),
    re.compile(r"colin@work\.mosi\.inc", re.IGNORECASE),
]


def check():
    # 1. escalation email
    escalation_score = 0.0
    ops_rows = []
    with app.app_context():
        ops_rows = Email.query.filter_by(
            recipient_email="ops@work.mosi.inc", folder="sent"
        ).all()
        for r in ops_rows:
            t = ((r.subject or "") + "\n" + (r.body or "")).lower()
            has_bh = "blueharbor" in t
            has_redline = "contract redline" in t
            if has_bh and has_redline:
                escalation_score = 0.4
                break
            if has_bh or has_redline:
                escalation_score = max(escalation_score, 0.2)

    # 2. log
    log_score = 0.0
    seed_lines = set()
    if SNAPSHOT.exists():
        seed_lines = set(SNAPSHOT.read_text().splitlines())
    current_lines = []
    if LOG.exists():
        current_lines = LOG.read_text().splitlines()
    new_lines = [ln for ln in current_lines if ln not in seed_lines]
    for ln in new_lines:
        t = ln.lower()
        has_bh = "blueharbor" in t
        has_redline = "contract redline" in t
        has_date = "2026-04-03" in t
        if has_bh and has_redline and has_date:
            log_score = 0.4
            break
        if has_bh and has_redline:
            log_score = max(log_score, 0.2)

    # 3. preservation
    preserved_lines_ok = bool(seed_lines) and seed_lines.issubset(set(current_lines))
    distractor_hit = False
    for r in ops_rows:
        t = (r.subject or "") + "\n" + (r.body or "")
        if any(p.search(t) for p in DISTRACTOR_PATTERNS):
            distractor_hit = True
            break
    preservation_score = 0.2 if (preserved_lines_ok and not distractor_hit) else 0.0

    reward = round(escalation_score + log_score + preservation_score, 3)
    print(
        f"escalation_score={escalation_score}  log_score={log_score}  preservation_score={preservation_score}"
    )
    os.makedirs("/logs/verifier", exist_ok=True)
    with open("/logs/verifier/reward.json", "w") as f:
        json.dump(
            {
                "reward": reward,
                "escalation_score": escalation_score,
                "log_score": log_score,
                "preservation_score": preservation_score,
            },
            f,
        )
    return reward


score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 0.5 else 1)
