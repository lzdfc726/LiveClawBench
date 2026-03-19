#!/usr/bin/env bash
set -euo pipefail
cd /workspace

# Install test dependencies
cd /workspace/environment/test-runner && npm install 2>/dev/null
cd /workspace

# Run test summary
node tests/scripts/test-summary.mjs 2>&1 | tee /workspace/output/test_output.txt

# Parse and score
python3 tests/verify.py
