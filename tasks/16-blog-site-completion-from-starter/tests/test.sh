#!/usr/bin/env bash
set -euo pipefail
cd /workspace
cd /workspace/environment/test-runner && npm install 2>/dev/null
cd /workspace
node tests/scripts/test-summary.mjs 2>&1 | tee /workspace/output/test_output.txt
python3 tests/verify.py
