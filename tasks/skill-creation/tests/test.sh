#!/usr/bin/env bash
set -euo pipefail
cd /workspace
mkdir -p /logs/verifier

# Search for SKILL.md in output and workspace
python3 /tests/evaluate.py /workspace/output --output-json /workspace/output/eval_result.json 2>&1 && PASSED=true || PASSED=false

if [ "$PASSED" = "true" ]; then
    echo "1.0" > /logs/verifier/reward.txt
else
    echo "0.0" > /logs/verifier/reward.txt
fi
