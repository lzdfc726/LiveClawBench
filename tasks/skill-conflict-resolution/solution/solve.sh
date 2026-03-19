#!/usr/bin/env bash
set -euo pipefail

cd /workspace

# Multi-round dialogue execution
# Round 1
openclaw agent -m "Analyze the interaction history in /workspace/environment/history.json and cross-check the results against the existing 'Discovered Patterns' in the interaction_pattern_analyzer skill. Are there any conflicts or inaccuracies?"

# Round 2
openclaw agent -m "Please update the skill to correct any misleading content and add the real patterns you discovered. Save the updated skill files in /workspace/output."

