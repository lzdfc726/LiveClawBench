#!/usr/bin/env bash
set -euo pipefail
cd /workspace
mkdir -p /logs/verifier

python3 /tests/verify.py 2>&1 && PASSED=true || PASSED=false

if [ "$PASSED" = "true" ]; then
    echo "1.0" > /logs/verifier/reward.txt
else
    echo "0.0" > /logs/verifier/reward.txt
fi
