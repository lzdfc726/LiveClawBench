#!/usr/bin/env bash
set -euo pipefail
cd /workspace

# Apply patches to bottom-level skills first
bash patches/apply_patches.sh

# Run evaluation against the skill directory
python3 tests/evaluate.py \
    --model-output environment/skills/report-generator-pipeline \
    --output-json /workspace/output/eval_result.json
