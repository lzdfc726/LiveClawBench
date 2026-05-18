#!/usr/bin/env python3
"""Verify candidate-interview-slot-confirm.

Reward (sum = 1.0):
  0.8  sent email to priya.nair@candidates.mosi.inc with the canonical slot
       '15:15-16:00' in subject or body
  0.2  reply does not contain a disallowed slot string
"""
import json
import os
import re
import sys

sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app
from models import Email

CANONICAL = re.compile(r"\b15:15\s*-\s*16:00\b", re.IGNORECASE)
DISALLOWED = [
    re.compile(r"\b09:00\s*-\s*10:00\b", re.IGNORECASE),
    re.compile(r"\b13:00\s*-\s*14:00\b", re.IGNORECASE),
    re.compile(r"\b14:00\s*-\s*15:15\b", re.IGNORECASE),
    re.compile(r"\b15:00\s*-\s*15:45\b", re.IGNORECASE),
    re.compile(r"\b15:30\s*-\s*16:15\b", re.IGNORECASE),
    re.compile(r"\b16:00\s*-\s*16:45\b", re.IGNORECASE),
    re.compile(r"\b15:00\s*-\s*16:30\b", re.IGNORECASE),
]


def check():
    with app.app_context():
        rows = Email.query.filter_by(
            recipient_email="priya.nair@candidates.mosi.inc", folder="sent"
        ).all()
        slot_score = 0.0
        clean = True
        for r in rows:
            text = (r.subject or "") + "\n" + (r.body or "")
            if CANONICAL.search(text):
                slot_score = 0.8
            if any(p.search(text) for p in DISALLOWED):
                clean = False
        distractor_score = 0.2 if clean else 0.0
        reward = round(slot_score + distractor_score, 3)
        print(f"sent-to-priya rows: {len(rows)}")
        print(f"slot_score={slot_score}  distractor_score={distractor_score}")
        os.makedirs("/logs/verifier", exist_ok=True)
        with open("/logs/verifier/reward.json", "w") as f:
            json.dump({"reward": reward, "slot_score": slot_score, "distractor_score": distractor_score}, f)
        return reward


score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 0.5 else 1)
