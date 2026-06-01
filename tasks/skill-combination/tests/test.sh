#!/usr/bin/env bash
set -euo pipefail
cd /workspace
mkdir -p /logs/verifier

# Run evaluation (|| true: evaluate.py exits non-zero when score is 0;
# must not abort before writing reward.txt)
python3 /tests/evaluate.py \
    --model-output /workspace/model_response \
    --output-json /workspace/output/eval_result.json 2>&1 | tee /tmp/eval_output.txt || true

# reward.txt: 0-1 scalar (TOTAL: X / 85 → X/85)
SCORE=$(grep -oP 'TOTAL:\s*\K[0-9]+' /tmp/eval_output.txt | head -1 || echo "0")
MAX=$(grep -oP 'TOTAL:\s*[0-9]+\s*/\s*\K[0-9]+' /tmp/eval_output.txt | head -1 || echo "85")
python3 -c "print(${SCORE}/${MAX})" > /logs/verifier/reward.txt

# reward.json: schema-compliant breakdown (C7 — top-level `reward: float`,
# string fields under `_meta_` so harbor's `dict[str, float|int]` model accepts it).
REWARD=$(cat /logs/verifier/reward.txt 2>/dev/null || echo "0.0")
python3 - "$REWARD" /workspace/output/eval_result.json /logs/verifier/reward.json <<'PY'
import json, sys, pathlib
reward, src, dst = float(sys.argv[1]), pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
out = {"reward": round(reward, 4)}
if src.is_file():
    try:
        raw = json.loads(src.read_text(encoding="utf-8"))
    except Exception as e:
        out["_meta_parse_error"] = str(e)
        raw = {}
    for k, v in raw.items():
        if k == "reward":
            continue
        if isinstance(v, bool):
            out[k] = 1 if v else 0
        elif isinstance(v, (int, float)):
            out[k] = v
        else:
            out[k if k.startswith("_meta_") else f"_meta_{k}"] = v
else:
    out["_meta_error"] = "eval_result.json not generated"
dst.parent.mkdir(parents=True, exist_ok=True)
dst.write_text(json.dumps(out, indent=2, ensure_ascii=False))
PY
