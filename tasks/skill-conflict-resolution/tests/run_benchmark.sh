#!/usr/bin/env bash
# =============================================================================
# OpenClaw Benchmark Case 3 — Automated Evaluation Script
# =============================================================================
# Tests: SKILL_CONFLICT_DETECTION — Detect misleading patterns in an existing
#        skill, discover real patterns, communicate conflicts, and upgrade.
#
# The model may produce multiple skill versions under MODEL_RESPONSE_DIR in
# arbitrary subdirectories (e.g. model_response/v1/, model_response/attempt_2/).
# The evaluator scans ALL subdirectories recursively — a criterion passes if
# ANY candidate satisfies it.
#
# Flow:
#   1. Deploy environment/ files to WSL benchmark directory
#   2. Generate unique session ID
#   3. Run 2 rounds of dialogue
#   4. List discovered output subdirectories
#   5. Run tests/evaluate.py to score (recursive scan)
#
# Usage (from case root):
#   bash tests/run_benchmark.sh
# =============================================================================

set -euo pipefail

# ── Source directory resolution ───────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CASE_SRC="$(dirname "$SCRIPT_DIR")"

# ── WSL target paths ─────────────────────────────────────────────
WORKSPACE="$HOME/.openclaw/workspace"
SKILLS_DIR="$WORKSPACE/skills"
MODEL_RESPONSE_DIR="$CASE_SRC/model_response"
LOG_DIR="$CASE_SRC/logs"
CONVERSATION_LOG="$LOG_DIR/conversation.jsonl"

# ── Deploy environment files to WSL ──────────────────────────────
echo "Deploying environment files to $CASE_SRC ..."
mkdir -p "$CASE_SRC" "$MODEL_RESPONSE_DIR" "$LOG_DIR" "$SKILLS_DIR"

# Copy environment assets
BASELINE_SKILL="$CASE_SRC/environment/interaction_pattern_analyzer/SKILL.md"
HISTORY_FILE="$CASE_SRC/environment/history.json"

# ── Deploy initial skill to workspace ────────────────────────────
cp -r "$CASE_SRC/environment/interaction_pattern_analyzer" "$SKILLS_DIR/"

# ── Generate Session ID ──────────────────────────────────────────
SESSION_ID="bench-case3-$(uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())')"
export session_id="$SESSION_ID"

echo "============================================================"
echo "  OpenClaw Benchmark Case 3 — SKILL_CONFLICT_DETECTION"
echo "  Session ID: $SESSION_ID"
echo "  Time: $(date -Iseconds)"
echo "============================================================"
echo ""

cd "$CASE_SRC"

# ── Round 1: Analyze & detect conflicts ──────────────────────────
PROMPT1="Analyze the interaction history in ${HISTORY_FILE} and cross-check the results against the existing 'Discovered Patterns' in the interaction_pattern_analyzer skill. Are there any conflicts or inaccuracies?"

echo "── Round 1 ──────────────────────────────────────────────"
echo "Prompt: $PROMPT1"
echo ""
openclaw agent --session-id "$SESSION_ID" -m "$PROMPT1"

# ── Round 2: Update skill & save ─────────────────────────────────
PROMPT2="Please update the skill to correct any misleading content and add the real patterns you discovered. Save the updated skill files in ${MODEL_RESPONSE_DIR}."

echo ""
echo "── Round 2 ──────────────────────────────────────────────"
echo "Prompt: $PROMPT2"
echo ""
openclaw agent --session-id "$SESSION_ID" -m "$PROMPT2"

# ── List discovered output locations ─────────────────────────────
echo ""
echo "── Output discovery ─────────────────────────────────────"
echo "Scanning $MODEL_RESPONSE_DIR for model output subdirectories..."
if [ -d "$MODEL_RESPONSE_DIR" ]; then
    SUBDIRS=$(find "$MODEL_RESPONSE_DIR" -type f \( -name "SKILL.md" -o -name "pattern_report.json" \) -printf '%h\n' 2>/dev/null | sort -u)
    if [ -n "$SUBDIRS" ]; then
        echo "Found output in:"
        echo "$SUBDIRS" | while read -r d; do
            echo "  - $d"
            ls -1 "$d" | sed 's/^/      /'
        done
    else
        echo "  (no SKILL.md or pattern_report.json found)"
    fi
else
    echo "  (model_response directory does not exist)"
fi

# ── Evaluate ─────────────────────────────────────────────────────
echo ""
echo "── Evaluation ───────────────────────────────────────────"

EVAL_ARGS=(
    --baseline "$BASELINE_SKILL"
    --model-output "$MODEL_RESPONSE_DIR"
    --skills-dir "$SKILLS_DIR"
    --output-json "$CASE_SRC/score.json"
)

# Attach conversation log if it exists
if [ -f "$CONVERSATION_LOG" ]; then
    EVAL_ARGS+=(--conversation-log "$CONVERSATION_LOG")
fi

python3 "$CASE_SRC/tests/evaluate.py" "${EVAL_ARGS[@]}"
