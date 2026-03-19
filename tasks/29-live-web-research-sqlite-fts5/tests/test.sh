#!/usr/bin/env bash
set -euo pipefail
ROOT="${HOME}/.openclaw"
python3 "${ROOT}/tests/deterministic_checks.py"
