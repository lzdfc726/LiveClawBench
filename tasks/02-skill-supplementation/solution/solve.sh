#!/usr/bin/env bash
set -euo pipefail

cd /workspace

# Multi-round dialogue execution
# Round 1
openclaw agent -m "Are there any operations that can be automated recently, according to potential patterns within the interaction history in /workspace/environment/history.json?"

# Round 2
openclaw agent -m "Please update the skills according to the pattern you discovered, and save the updated skills in /workspace/output"

