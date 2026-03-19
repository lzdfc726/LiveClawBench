#!/usr/bin/env bash
# ============================================================================
# sh_case5  —  Skill Hierarchy Change Propagation Benchmark
#
# This script:
#   1. Snapshots the original skill directory
#   2. Applies bottom-level patches (simulates manual developer edits)
#   3. Invokes openclaw to propagate changes to upper-level SKILL.md files
#   4. Runs the evaluation scorer against the result
#
# Usage:
#   bash tests/run_benchmark.sh [--skip-agent] [--skip-patches]
#
#   --skip-agent    Skip the openclaw invocation (re-scoring mode)
#   --skip-patches  Skip patch application (patches already applied)
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SKILL_NAME="report-generator-pipeline"
SKILLS_DIR="$BASE_DIR/environment/skills"
SKILL_DIR="$SKILLS_DIR/$SKILL_NAME"
SNAPSHOT_DIR="$BASE_DIR/environment/.skill_snapshot"
RESULT_JSON="$BASE_DIR/tests/eval_result.json"

SKIP_AGENT=false
SKIP_PATCHES=false
for arg in "$@"; do
    case "$arg" in
        --skip-agent)   SKIP_AGENT=true ;;
        --skip-patches) SKIP_PATCHES=true ;;
    esac
done

echo "=========================================================="
echo "  sh_case5: Skill Hierarchy Change Propagation Benchmark"
echo "=========================================================="
echo "Base dir  : $BASE_DIR"
echo "Skill     : $SKILL_NAME"
echo "Skill dir : $SKILL_DIR"
echo ""

# ------------------------------------------------------------------
# 1. Snapshot the original skill directory
# ------------------------------------------------------------------
echo "[1/4] Snapshotting original skill directory …"
rm -rf "$SNAPSHOT_DIR"
cp -r "$SKILL_DIR" "$SNAPSHOT_DIR"
echo "  → saved to $SNAPSHOT_DIR"
echo ""

# ------------------------------------------------------------------
# 2. Apply bottom-level patches
# ------------------------------------------------------------------
if [ "$SKIP_PATCHES" = false ]; then
    echo "[2/4] Applying bottom-level patches …"
    bash "$BASE_DIR/patches/apply_patches.sh"
else
    echo "[2/4] Skipping patch application (--skip-patches)"
fi
echo ""

# ------------------------------------------------------------------
# 3. Call openclaw agent to propagate changes upward
# ------------------------------------------------------------------
if [ "$SKIP_AGENT" = false ]; then
    echo "[3/4] Invoking openclaw agent …"
    SESSION_ID="bench-$(uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())')"
    echo "  Session ID: $SESSION_ID"

    PROMPT="The bottom-level skills csv-parser, column-calculator, and stats-aggregator "
    PROMPT+="have been updated. Please review their changes and update all parent SKILL.md "
    PROMPT+="files (data-loader, data-transformer, report-renderer, and the top-level "
    PROMPT+="report-generator-pipeline) to reflect the new capabilities, removed features, "
    PROMPT+="and changed output schemas."

    openclaw agent \
        --session-id "$SESSION_ID" \
        -m "$PROMPT" \
        "$SKILL_NAME" \
        2>&1 | tee "$BASE_DIR/tests/conversation.log"

    echo ""
    echo "  → conversation log saved to $BASE_DIR/tests/conversation.log"
else
    echo "[3/4] Skipping openclaw agent (--skip-agent)"
fi
echo ""

# ------------------------------------------------------------------
# 4. Evaluate the result
# ------------------------------------------------------------------
echo "[4/4] Running evaluation …"
python3 "$SCRIPT_DIR/evaluate.py" \
    --model-output "$SKILL_DIR" \
    --output-json "$RESULT_JSON"
