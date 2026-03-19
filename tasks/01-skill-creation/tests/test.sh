#!/usr/bin/env bash
set -euo pipefail
cd /workspace

# Search for SKILL.md in output and workspace
python3 tests/evaluate.py /workspace/output --output-json /workspace/output/eval_result.json
