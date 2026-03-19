#!/usr/bin/env bash
# ============================================================================
# sh_case4  —  Skill Deduplication & Consolidation Benchmark
#
# This script:
#   1. Snapshots the original (fragmented) skill directory
#   2. Invokes openclaw to clean up / restructure the skill
#   3. Runs the evaluation scorer against the result
#
# Usage:
#   bash tests/run_benchmark.sh [--skip-agent]
#
#   --skip-agent   Skip the openclaw invocation and evaluate an already-
#                  modified skill directory (useful for re-scoring).
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SKILL_NAME="sales-data-pipeline"
SKILLS_DIR="$BASE_DIR/environment/skills"
SKILL_DIR="$SKILLS_DIR/$SKILL_NAME"
SNAPSHOT_DIR="$BASE_DIR/environment/.skill_snapshot"
CONVERSATION_LOG="$BASE_DIR/tests/conversation.log"
RESULT_JSON="$BASE_DIR/tests/eval_result.json"

SKIP_AGENT=false
for arg in "$@"; do
    case "$arg" in
        --skip-agent) SKIP_AGENT=true ;;
    esac
done

echo "=========================================="
echo "  sh_case4: Skill Consolidation Benchmark"
echo "=========================================="
echo "Base dir  : $BASE_DIR"
echo "Skill     : $SKILL_NAME"
echo "Skill dir : $SKILL_DIR"
echo ""

# ------------------------------------------------------------------
# 1. Snapshot the original skill directory (for diff / rollback)
# ------------------------------------------------------------------
echo "[1/3] Snapshotting original skill directory …"
rm -rf "$SNAPSHOT_DIR"
cp -r "$SKILL_DIR" "$SNAPSHOT_DIR"
echo "  → saved to $SNAPSHOT_DIR"
echo ""

# ------------------------------------------------------------------
# 2. Call openclaw agent to clean up the skill
# ------------------------------------------------------------------
if [ "$SKIP_AGENT" = false ]; then
    echo "[2/3] Invoking openclaw agent …"
    SESSION_ID="bench-$(uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())')"
    echo "  Session ID: $SESSION_ID"

    openclaw agent \
        --session-id "$SESSION_ID" \
        -m "/skill skill-creator clean up, restructuring the $SKILL_NAME directory" \
        2>&1 | tee "$CONVERSATION_LOG"

    echo ""
    echo "  → conversation log saved to $CONVERSATION_LOG"
else
    echo "[2/3] Skipping openclaw agent (--skip-agent)"
    if [ ! -f "$CONVERSATION_LOG" ]; then
        echo "  (no conversation log found; rationale scoring will be skipped)"
        touch "$CONVERSATION_LOG"
    fi
fi
echo ""

# ------------------------------------------------------------------
# 3. Evaluate the result
# ------------------------------------------------------------------
echo "[3/3] Running evaluation …"

# The model output = the (now modified) skill directory.
# The evaluator expects a directory containing skill sub-dirs with SKILL.md files.
MODEL_OUTPUT="$SKILL_DIR"

CMD="python3 \"$SCRIPT_DIR/tests/evaluate.py\""
CMD="$CMD --base-dir \"$BASE_DIR\""
CMD="$CMD --model-output \"$MODEL_OUTPUT\""
CMD="$CMD --conversation-log \"$CONVERSATION_LOG\""
CMD="$CMD --output-json \"$RESULT_JSON\""

eval $CMD
