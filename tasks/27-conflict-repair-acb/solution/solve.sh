#!/usr/bin/env bash
set -euo pipefail

ROOT="${HOME}/.openclaw"
OUTPUT="${ROOT}/output"
WORK="${ROOT}/workspace"
BROWSER_MOCK_BASE_URL="${BROWSER_MOCK_BASE_URL:-}"
BROWSER_MOCK_ACCESS_LOG="${BROWSER_MOCK_ACCESS_LOG:-}"
BROWSER_LOG="${OUTPUT}/browser_mock_access.jsonl"

mkdir -p "${OUTPUT}" "${WORK}/memory" "${WORK}/state" "${WORK}/corpus" "${WORK}/tools"

if [[ -n "${BROWSER_MOCK_BASE_URL}" ]]; then
  if [[ -n "${BROWSER_MOCK_ACCESS_LOG}" ]]; then
    mkdir -p "$(dirname "${BROWSER_MOCK_ACCESS_LOG}")"
    : > "${BROWSER_MOCK_ACCESS_LOG}"
  else
    BROWSER_MOCK_ACCESS_LOG="${BROWSER_LOG}"
    : > "${BROWSER_MOCK_ACCESS_LOG}"
  fi

  for _ in $(seq 1 30); do
    if python3 - "${BROWSER_MOCK_BASE_URL}" 2>/dev/null <<'PY'
import json
import sys
import urllib.request

base_url = sys.argv[1].rstrip("/")
with urllib.request.urlopen(f"{base_url}/health", timeout=1) as resp:
    payload = json.load(resp)
sys.exit(0 if payload.get("ok") else 1)
PY
    then
      READY=1
      break
    fi
    sleep 1
  done

  if [[ "${READY:-0}" != "1" ]]; then
    echo "browser mock server did not become ready" >&2
    exit 1
  fi
fi

sync_browser_log() {
  if [[ -n "${BROWSER_MOCK_ACCESS_LOG}" && "${BROWSER_MOCK_ACCESS_LOG}" != "${BROWSER_LOG}" && -f "${BROWSER_MOCK_ACCESS_LOG}" ]]; then
    cp "${BROWSER_MOCK_ACCESS_LOG}" "${BROWSER_LOG}" 2>/dev/null || true
  fi
}

ARK_BASE_URL="${OPENCLAW_ARK_BASE_URL:-https://ark.cn-beijing.volces.com/api/coding/v3}"
ARK_MODEL="${OPENCLAW_ARK_MODEL:-kimi-k2.5}"
ARK_API_KEY="${OPENCLAW_ARK_API_KEY:-}"
AGENT_THINKING="${OPENCLAW_AGENT_THINKING:-on}"

if [[ -z "${ARK_API_KEY}" ]]; then
  echo "OPENCLAW_ARK_API_KEY is not set" >&2
  exit 1
fi

PROVIDER_JSON="$(cat <<EOF
{"baseUrl":"${ARK_BASE_URL}","apiKey":"${ARK_API_KEY}","api":"openai-completions","models":[{"id":"${ARK_MODEL}","name":"${ARK_MODEL}"}]}
EOF
)"

openclaw config set models.providers.ark "${PROVIDER_JSON}" >/dev/null
openclaw models set "ark/${ARK_MODEL}" >/dev/null
rm -rf "${WORK}/corpus" "${WORK}/tools"
mkdir -p "${WORK}/corpus" "${WORK}/tools"
cp -R "${ROOT}/corpus/." "${WORK}/corpus/"
cp -R "${ROOT}/tools/." "${WORK}/tools/"
cat > "${WORK}/corpus/README.md" <<'EOF'
# Corpus Index

- formal digest
- talk transcript
- public explainer article
EOF

openclaw config set agents.defaults.workspace "${WORK}" >/dev/null

MESSAGE="$(cat "${ROOT}/instruction.md")"
SUCCESS=0
for attempt in 1 2 3; do
  rm -f "${OUTPUT}/agent_response.json" "${OUTPUT}/final.md" "${OUTPUT}/summary.md" "${OUTPUT}/answer.md" "${OUTPUT}/result.json"
  rm -rf "${WORK}/output"
  SESSION_ID="pkb-conflict-repair-${attempt}-$(date +%s)-$$"
  openclaw agent \
    --local \
    --session-id "${SESSION_ID}" \
    --thinking "${AGENT_THINKING}" \
    --timeout 720 \
    --message "${MESSAGE}" \
    --json \
    > "${OUTPUT}/agent_response.json" || true

  export OPENCLAW_WORKSPACE_ROOT="${ROOT}"
  python3 "${ROOT}/common/normalize_case_outputs.py"
  sync_browser_log
  if python3 "${ROOT}/common/check_case_outputs.py" --root "${ROOT}" --require-result --require-browser-mock; then
    SUCCESS=1
    break
  fi
  sleep 1
done

if [[ "${SUCCESS}" != "1" ]]; then
  exit 1
fi
