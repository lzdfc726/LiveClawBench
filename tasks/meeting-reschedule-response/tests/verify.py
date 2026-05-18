#!/usr/bin/env python3
"""Verify meeting-reschedule-response.

Reward (sum = 1.0):
  0.8  sent email to alice.chen@work.mosi.inc with the canonical slot
       string '16:00-16:30' in subject or body
  0.2  no mention of either conflicting slot ('10:00-10:30' or '13:30-14:00')
       in any matching reply
"""

import json
import os
import re
import sys

sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app
from models import Email

CANONICAL = re.compile(r"\b16:00\s*-\s*16:30\b", re.IGNORECASE)
DISTRACTOR = [
    re.compile(r"\b10:00\s*-\s*10:30\b", re.IGNORECASE),
    re.compile(r"\b13:30\s*-\s*14:00\b", re.IGNORECASE),
]


def check():
    with app.app_context():
        rows = Email.query.filter_by(
            recipient_email="alice.chen@work.mosi.inc", folder="sent"
        ).all()

        slot_score = 0.0
        distractor_clean = True
        for r in rows:
            haystack = (r.subject or "") + "\n" + (r.body or "")
            if CANONICAL.search(haystack):
                slot_score = 0.8
            if any(p.search(haystack) for p in DISTRACTOR):
                distractor_clean = False

        distractor_score = 0.2 if distractor_clean else 0.0
        reward = round(slot_score + distractor_score, 3)

        print(f"sent-to-alice rows: {len(rows)}")
        print(f"slot_score={slot_score}  distractor_score={distractor_score}")

        os.makedirs("/logs/verifier", exist_ok=True)
        with open("/logs/verifier/reward.json", "w") as f:
            json.dump(
                {
                    "reward": reward,
                    "slot_score": slot_score,
                    "distractor_score": distractor_score,
                },
                f,
            )
        return reward


score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 0.5 else 1)
