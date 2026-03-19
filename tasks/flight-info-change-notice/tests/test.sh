#!/usr/bin/env bash
set -euo pipefail
mkdir -p /logs/verifier

cd /workspace
python3 /tests/verify.py 2>&1 | tee /tmp/verify_output.txt

# Extract score from "Score: X/N" pattern and normalize to [0,1]
RAW=$(grep -oP 'Score:\s*\K[0-9.]+(?=/[0-9]+)' /tmp/verify_output.txt | tail -1 || echo "0")
DENOM=$(grep -oP 'Score:\s*[0-9.]+/\K[0-9]+' /tmp/verify_output.txt | tail -1 || echo "1")
SCORE=$(python3 -c "print(round(float('$RAW') / float('$DENOM'), 4))" 2>/dev/null || echo "0")
echo "$SCORE" > /logs/verifier/reward.txt
