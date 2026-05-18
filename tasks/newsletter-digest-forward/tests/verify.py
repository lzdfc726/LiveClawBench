#!/usr/bin/env python3
"""Verify newsletter-digest-forward.

Reward (sum = 1.0):
  0.4 digest: /workspace/notes/newsletter-digest.md contains the 3 target
       lead-update substrings (0.133 each, rounded).
  0.4 email: at least one sent email to research@work.mosi.inc body contains
       the same 3 target substrings (0.133 each).
  0.2 distractor: 'April mascot giveaway' substring NOT present in digest
       file or any matching sent email.
"""
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app
from models import Email

TARGETS = [
    "VectorDB Cloud row-level ACLs",
    "OpenBrowse persistent sessions",
    "NovaStack Series A",
]
DISTRACTOR = "April mascot giveaway"
DIGEST = Path("/workspace/notes/newsletter-digest.md")
PER_HIT = 0.4 / 3


def check():
    # 1. digest
    digest_score = 0.0
    digest_content = ""
    if DIGEST.exists():
        digest_content = DIGEST.read_text()
        hits = sum(1 for t in TARGETS if t in digest_content)
        digest_score = round(hits * PER_HIT, 3)

    # 2. email
    email_score = 0.0
    email_bodies = []
    with app.app_context():
        rows = Email.query.filter_by(
            recipient_email="research@work.mosi.inc", folder="sent"
        ).all()
        best = 0
        for r in rows:
            text = (r.subject or "") + "\n" + (r.body or "")
            email_bodies.append(text)
            hits = sum(1 for t in TARGETS if t in text)
            if hits > best:
                best = hits
        email_score = round(best * PER_HIT, 3)

    # 3. distractor
    distractor_score = 0.2
    if DISTRACTOR in digest_content or any(DISTRACTOR in b for b in email_bodies):
        distractor_score = 0.0

    reward = round(digest_score + email_score + distractor_score, 3)
    print(f"digest_score={digest_score}  email_score={email_score}  distractor_score={distractor_score}")
    os.makedirs("/logs/verifier", exist_ok=True)
    with open("/logs/verifier/reward.json", "w") as f:
        json.dump({"reward": reward, "digest_score": digest_score,
                   "email_score": email_score, "distractor_score": distractor_score}, f)
    return reward


score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 0.5 else 1)
