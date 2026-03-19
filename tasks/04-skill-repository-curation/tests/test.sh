#!/usr/bin/env bash
set -euo pipefail
cd /workspace

# Run evaluation against the consolidated skill directory
python3 tests/evaluate.py \
    --model-output environment/skills/sales-data-pipeline \
    --output-json /workspace/output/eval_result.json
