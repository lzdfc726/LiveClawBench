#!/usr/bin/env python3
"""Verify procurement-quote-compare-reply.

Reward (sum = 1.0):
  0.8  acceptance email to sales@asterbyte.io with an acceptance phrase
  0.2  no acceptance email to either losing vendor
       (quotes@northpeak.tech, desk@latticepro.ai)
"""

import json
import os
import sys

sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app
from models import Email

ACCEPTANCE_TERMS = [
    "proceed",
    "accept",
    "accepted",
    "go ahead",
    "we'll move forward",
    "we will move forward",
    "confirm the order",
    "place the order",
]


def contains_acceptance(text: str) -> bool:
    t = text.lower()
    return any(term in t for term in ACCEPTANCE_TERMS)


def check():
    with app.app_context():
        sent = Email.query.filter_by(folder="sent").all()

        winner_hits = [
            e
            for e in sent
            if e.recipient_email == "sales@asterbyte.io"
            and contains_acceptance((e.subject or "") + "\n" + (e.body or ""))
        ]
        loser_hits = [
            e
            for e in sent
            if e.recipient_email in ("quotes@northpeak.tech", "desk@latticepro.ai")
            and contains_acceptance((e.subject or "") + "\n" + (e.body or ""))
        ]

        acceptance_score = 0.8 if winner_hits else 0.0
        distractor_score = 0.0 if loser_hits else 0.2

        if winner_hits:
            print(
                f"PASS acceptance: {len(winner_hits)} sent email(s) to sales@asterbyte.io with acceptance phrase"
            )
        else:
            print("FAIL acceptance: no acceptance email to sales@asterbyte.io")
        if loser_hits:
            print(
                f"FAIL distractor: acceptance went to a losing vendor: {[e.recipient_email for e in loser_hits]}"
            )
        else:
            print("PASS distractor: no acceptance to losing vendors")

        reward = round(acceptance_score + distractor_score, 3)
        print(
            f"acceptance_score={acceptance_score}  distractor_score={distractor_score}"
        )

        os.makedirs("/logs/verifier", exist_ok=True)
        with open("/logs/verifier/reward.json", "w") as f:
            json.dump(
                {
                    "reward": reward,
                    "acceptance_score": acceptance_score,
                    "distractor_score": distractor_score,
                },
                f,
            )
        return reward


score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 0.5 else 1)
