#!/usr/bin/env bash
set -euo pipefail

# Start services
bash /workspace/startup.sh

# Reference solution: run openclaw agent with the task instruction
openclaw agent --session-id "solve-baggage-tracking-application" \
    --timeout 120 \
    --message "$(cat /workspace/instruction.md)"
