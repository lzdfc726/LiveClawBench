#!/usr/bin/env python3
"""Verify baggage-tracking-application: check lost baggage registered"""
import sys
sys.path.insert(0, "/workspace/environment/airline-app/backend")
from app import create_app, db
from models import BaggageClaim

app = create_app()

def check():
    with app.app_context():
        claim = BaggageClaim.query.first()
        if claim:
            print(f"PASS: Found baggage claim (id: {claim.id})")
            return 1.0
        print("FAIL: No baggage claim found")
        return 0.0

score = check()
print(f"Score: {score}/1.0")
sys.exit(0 if score >= 1.0 else 1)
