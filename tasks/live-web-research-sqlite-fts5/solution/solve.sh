#!/usr/bin/env bash
set -euo pipefail

ROOT="${HOME}/.openclaw"
OUTPUT="${ROOT}/output"
WORK="${ROOT}/workspace"
DB_DIR="${WORK}/db"
TRACE_TMP="/tmp/openclaw-live-web-trace.zip"
REQUESTS_LOG="${OUTPUT}/browser_requests.json"
TABS_LOG="${OUTPUT}/browser_tabs.json"
GATEWAY_LOG="${OUTPUT}/gateway.log"
GATEWAY_PID=""
BROWSER_READY=0

mkdir -p "${OUTPUT}" "${WORK}/memory" "${WORK}/state" "${WORK}/corpus" "${DB_DIR}"

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

cleanup() {
  openclaw browser trace stop --out "${TRACE_TMP}" >/dev/null 2>&1 || true
  openclaw browser requests --json > "${REQUESTS_LOG}" 2>/dev/null || true
  openclaw browser tabs --json > "${TABS_LOG}" 2>/dev/null || true
  if [[ -f "${TRACE_TMP}" ]]; then
    cp "${TRACE_TMP}" "${OUTPUT}/browser_trace.zip" 2>/dev/null || true
  fi
  openclaw browser stop >/dev/null 2>&1 || true
  if [[ -n "${GATEWAY_PID}" ]]; then
    kill "${GATEWAY_PID}" >/dev/null 2>&1 || true
    wait "${GATEWAY_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

openclaw config set models.providers.ark "${PROVIDER_JSON}" >/dev/null
openclaw models set "ark/${ARK_MODEL}" >/dev/null
rm -rf "${WORK}/corpus"
mkdir -p "${WORK}/corpus"
cp -R "${ROOT}/corpus/." "${WORK}/corpus/"
cat > "${WORK}/corpus/README.md" <<'EOF'
# Corpus Index

- live source brief with pinned URLs
- follow-up query contract
EOF

openclaw config set agents.defaults.workspace "${WORK}" >/dev/null
openclaw config set browser.executablePath "/usr/bin/chromium" >/dev/null
openclaw config set browser.headless true >/dev/null
openclaw config set browser.noSandbox true >/dev/null

openclaw gateway run --allow-unconfigured > "${GATEWAY_LOG}" 2>&1 &
GATEWAY_PID=$!

for _ in $(seq 1 30); do
  if openclaw browser start >/dev/null 2>&1; then
    BROWSER_READY=1
    break
  fi
  sleep 1
done

if [[ "${BROWSER_READY}" != "1" ]]; then
  echo "OpenClaw browser did not become ready" >&2
  exit 1
fi

openclaw browser trace start >/dev/null 2>&1 || true

MESSAGE="$(cat "${ROOT}/instruction.md")"
SUCCESS=0
for attempt in 1 2; do
  rm -f "${OUTPUT}/agent_response.json" "${OUTPUT}/final.md" "${OUTPUT}/summary.md" "${OUTPUT}/answer.md" "${OUTPUT}/result.json"
  find "${DB_DIR}" -maxdepth 1 -type f \( -name '*.db' -o -name '*.sqlite' \) -delete
  rm -rf "${WORK}/output"
  SESSION_ID="pkb-live-web-${attempt}-$(date +%s)-$$"
  openclaw agent \
    --local \
    --session-id "${SESSION_ID}" \
    --thinking "${AGENT_THINKING}" \
    --timeout 540 \
    --message "${MESSAGE}" \
    --json \
    > "${OUTPUT}/agent_response.json" 2>&1 &
  AGENT_PID=$!

  for _ in $(seq 1 108); do
    export OPENCLAW_WORKSPACE_ROOT="${ROOT}"
    python3 "${ROOT}/common/normalize_case_outputs.py"
    openclaw browser requests --json > "${REQUESTS_LOG}" 2>/dev/null || true
    openclaw browser tabs --json > "${TABS_LOG}" 2>/dev/null || true
    if python3 "${ROOT}/common/check_case_outputs.py" --root "${ROOT}" --require-result --require-db --require-browser-any; then
      SUCCESS=1
      kill "${AGENT_PID}" >/dev/null 2>&1 || true
      wait "${AGENT_PID}" >/dev/null 2>&1 || true
      break
    fi
    if ! kill -0 "${AGENT_PID}" >/dev/null 2>&1; then
      break
    fi
    sleep 5
  done

  export OPENCLAW_WORKSPACE_ROOT="${ROOT}"
  python3 "${ROOT}/common/normalize_case_outputs.py"
  openclaw browser requests --json > "${REQUESTS_LOG}" 2>/dev/null || true
  openclaw browser tabs --json > "${TABS_LOG}" 2>/dev/null || true
  if python3 "${ROOT}/common/check_case_outputs.py" --root "${ROOT}" --require-result --require-db --require-browser-any; then
    SUCCESS=1
    wait "${AGENT_PID}" >/dev/null 2>&1 || true
    break
  fi
  kill "${AGENT_PID}" >/dev/null 2>&1 || true
  wait "${AGENT_PID}" >/dev/null 2>&1 || true
  sleep 1
done

if [[ "${SUCCESS}" != "1" ]]; then
  exit 1
fi

openclaw browser requests --json > "${REQUESTS_LOG}" 2>/dev/null || true
openclaw browser tabs --json > "${TABS_LOG}" 2>/dev/null || true
python3 "${ROOT}/common/check_case_outputs.py" --root "${ROOT}" --require-result --require-db --require-browser-any
