#!/usr/bin/env bash
set -uo pipefail
mkdir -p /logs/verifier /logs/artifacts

cd /workspace
python3 /tests/verify.py 2>&1 | tee /tmp/verify_output.txt || true

SCORE=$(grep -oP 'Score:\s*\K[0-9.]+' /tmp/verify_output.txt | tail -1 || echo "0")
echo "$SCORE" > /logs/verifier/reward.txt

[ -f /tmp/email-frontend.log ] && cp /tmp/email-frontend.log /logs/artifacts/email-frontend.log || true
[ -f /tmp/email-backend.log ] && cp /tmp/email-backend.log /logs/artifacts/email-backend.log || true
[ -f /tmp/calendar-backend.log ] && cp /tmp/calendar-backend.log /logs/artifacts/calendar-backend.log || true
exit 0
