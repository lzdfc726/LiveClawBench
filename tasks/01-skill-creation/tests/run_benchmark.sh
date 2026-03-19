
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

# ── WSL target paths ─────────────────────────────────────────────
CASE_DIR="$HOME/.openclaw/benchmark/sh/sh_case1"
WORKSPACE="$HOME/.openclaw/workspace"
SKILLS_DIR="$WORKSPACE/skills"
MODEL_RESPONSE_DIR="$CASE_DIR/model_response"

# ── Deploy environment files to WSL ──────────────────────────────
echo "Deploying environment files to $CASE_DIR ..."
mkdir -p "$CASE_DIR" "$MODEL_RESPONSE_DIR" "$SKILLS_DIR"

# The baseline SKILL.md (unmodified) is kept at CASE_DIR for scoring
BASELINE_SKILL="$CASE_DIR/data/SKILL.md"

# ── Deploy Modified SOUL.md to workspace ────────────────────────────
cp    "$CASE_DIR/environment/SOUL.md"              "$WORKSPACE"

# ── Generate Session ID ─────────────────────────────────────────
SESSION_ID="bench-case1-$(uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())')"
export session_id="$SESSION_ID"

cd "$CASE_DIR"
echo "============================================================"
echo "  OpenClaw Benchmark Case 1 — SKILL_CREATION"
echo "  Session ID: $SESSION_ID"
echo "  Time: $(date -Iseconds)"
echo "  WKDIR: $CASE_DIR"
echo "============================================================"
echo ""

PROMPT_SKILL="/skill skill-creator create a skill for me according to the pattern you found. store it in ${CASE_DIR}/model_response"

# ── Dialogue log ──────────────────────────────────────────────────
DIALOGUE_LOG="$MODEL_RESPONSE_DIR/dialogue.md"
: > "$DIALOGUE_LOG"   # truncate / create

# ── Prompts array ────────────────────────────────────────────────
PROMPTS=(
  "Please clean up ${CASE_DIR}/environment/data/sales_jan.csv for me. Remove all empty rows, standardize the date column to YYYY-MM-DD format, remove duplicate rows (by order_id), sort by amount in descending order, and save the result to ${CASE_DIR}/environment/cleaned/sales_jan_cleaned.csv.?"
  "Now do the same thing for ${CASE_DIR}/environment/data/sales_feb.csv. Output to ${CASE_DIR}/environment/cleaned/sales_feb_cleaned.csv."
  "Same for ${CASE_DIR}/environment/data/sales_mar.csv please. Output to ${CASE_DIR}/environment/cleaned/sales_mar_cleaned.csv."
  "And ${CASE_DIR}/environment/data/sales_apr.csv too, same thing. Output to ${CASE_DIR}/environment/cleaned/sales_apr_cleaned.csv."
  "ok. also for ${CASE_DIR}/environment/data/sales_jun.csv for me. also save the result to ${CASE_DIR}/environment/cleaned"
  "for ${CASE_DIR}/environment/data/sales_may.csv, sales_jul.csv sales_aug.csv, do the same operation."
)

TOTAL_ROUNDS=${#PROMPTS[@]}

for (( i=0; i<TOTAL_ROUNDS; i++ )); do
  ROUND=$((i + 1))
  CURRENT_PROMPT="${PROMPTS[$i]}"

  echo "" | tee -a "$DIALOGUE_LOG"
  echo "── Round $ROUND ──────────────────────────────────────────────" | tee -a "$DIALOGUE_LOG"
  echo "Prompt: $CURRENT_PROMPT" | tee -a "$DIALOGUE_LOG"
  echo "" | tee -a "$DIALOGUE_LOG"

  # Capture model response while printing to terminal
  RESPONSE=$(openclaw agent --session-id "$SESSION_ID" -m "$CURRENT_PROMPT" 2>&1 | tee -a "$DIALOGUE_LOG")

  # Check if response matches 'create ... skill' or 'for you'
  if echo "$RESPONSE" | grep -qiP 'create\s+.*\s*skill|for you'; then
    echo "" | tee -a "$DIALOGUE_LOG"
    echo "── [Auto-detected skill creation trigger in Round $ROUND response] ──" | tee -a "$DIALOGUE_LOG"
    echo "── Sending PROMPT_SKILL and skipping remaining rounds ──" | tee -a "$DIALOGUE_LOG"
    echo "" | tee -a "$DIALOGUE_LOG"

    # Send PROMPT_SKILL as the next round
    SKILL_ROUND=$((ROUND + 1))
    echo "── Round $SKILL_ROUND (PROMPT_SKILL) ──────────────────────────────" | tee -a "$DIALOGUE_LOG"
    echo "Prompt: $PROMPT_SKILL" | tee -a "$DIALOGUE_LOG"
    echo "" | tee -a "$DIALOGUE_LOG"
    openclaw agent --session-id "$SESSION_ID" -m "$PROMPT_SKILL" 2>&1 | tee -a "$DIALOGUE_LOG"

    # Skip all remaining rounds, jump to evaluation
    break
  fi
done

# ── Evaluate ─────────────────────────────────────────────────────
echo ""
echo "── Evaluation ───────────────────────────────────────────"

EVAL_SCRIPT="$CASE_DIR/tests/evaluate.py"
SCORE_JSON="$MODEL_RESPONSE_DIR/score.json"

# Helper: write score.json
write_score() {
  local score="$1"
  local max_score="$2"
  local msg="$3"
  python3 -c "
import json, sys
report = {
    'case': 'sh_case1',
    'task': 'SKILL_CREATION',
    'score': $score,
    'max_score': $max_score,
    'message': '''$msg'''
}
with open(sys.argv[1], 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
" "$SCORE_JSON"
}

# First evaluation — did the model create SKILL.md on its own?
if python3 "$EVAL_SCRIPT" "$MODEL_RESPONSE_DIR" --output-json "$SCORE_JSON"; then
  MSG="Successfully identified the pattern and created a skill. 100 points."
  echo "$MSG" | tee -a "$DIALOGUE_LOG"
  write_score 100 100 "$MSG"
else
  # Fallback: explicitly ask the model to create a skill
  echo "" | tee -a "$DIALOGUE_LOG"
  echo "── [SKILL.md not found — sending PROMPT_SKILL as fallback] ──" | tee -a "$DIALOGUE_LOG"
  echo "Prompt: $PROMPT_SKILL" | tee -a "$DIALOGUE_LOG"
  echo "" | tee -a "$DIALOGUE_LOG"
  openclaw agent --session-id "$SESSION_ID" -m "$PROMPT_SKILL" 2>&1 | tee -a "$DIALOGUE_LOG"

  # Second evaluation
  if python3 "$EVAL_SCRIPT" "$MODEL_RESPONSE_DIR" --output-json "$SCORE_JSON"; then
    MSG="Identified the pattern and created a skill after explicit instruction. 50 points."
    echo "$MSG" | tee -a "$DIALOGUE_LOG"
    write_score 50 100 "$MSG"
  else
    MSG="Fail. 0 points."
    echo "$MSG" | tee -a "$DIALOGUE_LOG"
    write_score 0 100 "$MSG"
  fi
fi

echo ""
echo "Score saved to: $SCORE_JSON"
