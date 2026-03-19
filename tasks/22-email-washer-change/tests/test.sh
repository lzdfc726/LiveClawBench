#!/usr/bin/env bash
set -euo pipefail
cd /workspace
bash environment/startup.sh
python3 tests/verify.py
