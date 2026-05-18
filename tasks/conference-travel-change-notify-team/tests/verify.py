#!/usr/bin/env python3
"""Verify conference-travel-change-notify-team.

Reward (sum = 1.0):
  0.4  sent email to amy.cho@work.mosi.inc
  0.4  sent email to leo.qin@work.mosi.inc
  0.2  no sent email to nina.zhou@ or sam.park@work.mosi.inc
"""
import json
import os
import sys

sys.path.insert(0, "/workspace/environment/email-app/backend")
from app import app
from models import Email

IMPACTED = ["amy.cho@work.mosi.inc", "leo.qin@work.mosi.inc"]
UNIMPACTED = ["nina.zhou@work.mosi.inc", "sam.park@work.mosi.inc"]


def check():
    with app.app_context():
        impacted_score = 0.0
        for addr in IMPACTED:
            if Email.query.filter_by(recipient_email=addr, folder="sent").first():
                impacted_score += 0.4
        unimpacted_hits = []
        for addr in UNIMPACTED:
            row = Email.query.filter_by(recipient_email=addr, folder="sent").first()
            if row:
                unimpacted_hits.append(addr)
        unimpacted_score = 0.0 if unimpacted_hits else 0.2

        reward = round(impacted_score + unimpacted_score, 3)
        print(f"impacted_score={impacted_score}  unimpacted_score={unimpacted_score}")
        if unimpacted_hits:
            print(f"  (penalty: unimpacted notified: {unimpacted_hits})")
        os.makedirs("/logs/verifier", exist_ok=True)
        with open("/logs/verifier/reward.json", "w") as f:
            json.dump({"reward": reward, "impacted_score": impacted_score, "unimpacted_score": unimpacted_score}, f)
        return reward


score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 0.5 else 1)
