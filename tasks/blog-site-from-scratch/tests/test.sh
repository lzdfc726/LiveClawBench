#!/usr/bin/env bash
set -euo pipefail
cd /workspace
mkdir -p /logs/verifier

# Install test dependencies
cd /workspace/environment/test-runner && npm install 2>/dev/null
cd /workspace

# Run test summary
node /tests/scripts/test-summary.mjs 2>&1 | tee /workspace/output/test_output.txt

# Parse and score
python3 /tests/verify.py 2>&1 | tee /tmp/verify_output.txt || true

# Extract score: "Score: X.XX/1.0" → float
SCORE=$(grep -oP 'Score:\s*\K[0-9.]+' /tmp/verify_output.txt | tail -1 || echo "0")
echo "$SCORE" > /logs/verifier/reward.txt
