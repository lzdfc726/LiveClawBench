#!/usr/bin/env bash
set -euo pipefail

ROOT="${HOME}/.openclaw"
OUTPUT="${ROOT}/output"
WORK="${ROOT}/workspace"

mkdir -p "${OUTPUT}" "${WORK}/memory" "${WORK}/state" "${WORK}/corpus"

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
rm -rf "${WORK}/corpus"
mkdir -p "${WORK}/corpus"
cp -R "${ROOT}/corpus/." "${WORK}/corpus/"
cat > "${WORK}/corpus/README.md" <<'EOF'
# Corpus Index

- baseline summary
- later addendum
- talk excerpt
- prior durable note
EOF

openclaw config set agents.defaults.workspace "${WORK}" >/dev/null

MESSAGE="$(cat "${ROOT}/instruction.md")"
SUCCESS=0

for attempt in 1 2 3; do
  rm -f "${OUTPUT}/agent_response.json" "${OUTPUT}/final.md" "${OUTPUT}/summary.md" "${OUTPUT}/answer.md" "${OUTPUT}/result.json"
  rm -rf "${WORK}/output"
  SESSION_ID="pkb-incremental-update-${attempt}-$(date +%s)-$$"
  openclaw agent \
    --local \
    --session-id "${SESSION_ID}" \
    --thinking "${AGENT_THINKING}" \
    --timeout 540 \
    --message "${MESSAGE}" \
    --json \
    > "${OUTPUT}/agent_response.json" || true

  export OPENCLAW_WORKSPACE_ROOT="${ROOT}"
  python3 "${ROOT}/common/normalize_case_outputs.py"
  if python3 "${ROOT}/common/check_case_outputs.py" --root "${ROOT}" --require-result; then
    SUCCESS=1
    break
  fi
  sleep 1
done

if [[ "${SUCCESS}" != "1" ]]; then
  exit 1
fi
