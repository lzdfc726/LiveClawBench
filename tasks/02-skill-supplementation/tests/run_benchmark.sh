#!/usr/bin/env bash
# =============================================================================
# OpenClaw Benchmark Case 2 — Automated Evaluation Script
# =============================================================================
# Tests: SKILL_ITER — Automatic skill generation from interaction history
#
# Flow:
#   1. Deploy environment/ files to WSL benchmark directory
#   2. Generate unique session ID
#   3. Run 2 rounds of dialogue
#   4. Run tests/evaluate.py to score
#
# Usage (from case root):
#   bash tests/run_benchmark.sh
# =============================================================================

set -euo pipefail

# ── Source directory resolution ───────────────────────────────────
# SCRIPT_DIR = tests/    CASE_SRC = case root (sh_case2/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CASE_SRC="$(dirname "$SCRIPT_DIR")"

# ── WSL target paths ─────────────────────────────────────────────
CASE_SRC="$HOME/.openclaw/benchmark/sh/sh_case2"
WORKSPACE="$HOME/.openclaw/workspace"
SKILLS_DIR="$WORKSPACE/skills"
MODEL_RESPONSE_DIR="$CASE_SRC/model_response"
LOG_DIR="$CASE_SRC/logs"

# ── Deploy environment files to WSL ──────────────────────────────
echo "Deploying environment files to $CASE_SRC ..."
mkdir -p "$CASE_SRC" "$MODEL_RESPONSE_DIR" "$LOG_DIR" "$SKILLS_DIR"

# The baseline SKILL.md (unmodified) is kept at CASE_SRC for scoring
BASELINE_SKILL="$CASE_SRC/environment/interaction_pattern_analyzer/SKILL.md"
HISTORY_FILE="$CASE_SRC/environment/history.json"

# ── Deploy initial skill to workspace ────────────────────────────
cp -r "$CASE_SRC/environment/interaction_pattern_analyzer" "$SKILLS_DIR/"

# ── Generate Session ID ─────────────────────────────────────────
SESSION_ID="bench-case2-$(uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())')"
export session_id="$SESSION_ID"

echo "============================================================"
echo "  OpenClaw Benchmark Case 2 — SKILL_ITER"
echo "  Session ID: $SESSION_ID"
echo "  Time: $(date -Iseconds)"
echo "============================================================"
echo ""

cd "$CASE_SRC"

# ── Round 1 ──────────────────────────────────────────────────────
PROMPT1="Are there any operations that can be automated recently, according to potential patterns within the interaction history in $HISTORY_FILE ?"

echo "── Round 1 ──────────────────────────────────────────────"
echo "Prompt: $PROMPT1"
echo ""
openclaw agent --session-id "$SESSION_ID" -m "$PROMPT1"

# ── Round 2 ──────────────────────────────────────────────────────
PROMPT2="please update the skills according to the pattern you discovered, and save the updated skills (including SKILL.md and any reports) in $MODEL_RESPONSE_DIR or a subdirectory within it"

echo ""
echo "── Round 2 ──────────────────────────────────────────────"
echo "Prompt: $PROMPT2"
echo ""
openclaw agent --session-id "$SESSION_ID" -m "$PROMPT2"

# ── Evaluate ─────────────────────────────────────────────────────
echo ""
echo "── Evaluation ───────────────────────────────────────────"
python3 "$CASE_SRC/tests/evaluate.py" \
    --baseline "$BASELINE_SKILL/" \
    --model-output "$MODEL_RESPONSE_DIR" \
    --skills-dir "$SKILLS_DIR" \
    --output-json "$CASE_SRC/score.json"
