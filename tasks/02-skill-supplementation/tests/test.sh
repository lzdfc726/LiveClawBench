#!/usr/bin/env bash
set -euo pipefail
cd /workspace

# Run evaluation against model output
python3 tests/evaluate.py /workspace/output --output-json /workspace/output/eval_result.json
