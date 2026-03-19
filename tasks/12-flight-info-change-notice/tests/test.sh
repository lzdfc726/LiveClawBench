#!/usr/bin/env bash
set -euo pipefail

# Start all services
bash /workspace/startup.sh

# Run verification
cd /workspace
python3 tests/verify.py
