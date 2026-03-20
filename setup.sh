#!/usr/bin/env bash
# setup.sh — LiveClawBench development environment setup
# Run from the LiveClawBench/ directory.
set -euo pipefail

HARBOR_REPO_URL="https://github.com/Mosi-AI/claw-harbor.git"
HARBOR_DIR="$(cd "$(dirname "$0")/.." && pwd)/harbor"

echo "==> LiveClawBench Setup"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Prerequisite checks
# ---------------------------------------------------------------------------
echo "[1/3] Checking prerequisites..."

check_cmd() {
    local cmd="$1"
    local install_hint="$2"
    if ! command -v "$cmd" &>/dev/null; then
        echo "  ERROR: '$cmd' not found."
        echo "         $install_hint"
        exit 1
    fi
    echo "  OK  $cmd ($(command -v "$cmd"))"
}

check_cmd git   "Install from https://git-scm.com/downloads"
check_cmd uv    "Install from https://docs.astral.sh/uv/getting-started/installation/"
check_cmd docker "Install from https://docs.docker.com/get-docker/"

# Python >= 3.12 check (uv manages Python, but verify host has one accessible)
PY_VERSION=$(python3 --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
PY_MAJOR=$(echo "$PY_VERSION" | cut -d. -f1)
PY_MINOR=$(echo "$PY_VERSION" | cut -d. -f2)
if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 12 ]; }; then
    echo "  ERROR: Python >= 3.12 required (found $PY_VERSION)."
    echo "         Install via uv: uv python install 3.12"
    exit 1
fi
echo "  OK  python3 ($PY_VERSION)"

echo ""

# ---------------------------------------------------------------------------
# Step 2: Harbor installation (idempotent)
# ---------------------------------------------------------------------------
echo "[2/3] Setting up Harbor framework..."

if [ ! -d "$HARBOR_DIR" ]; then
    echo "  Cloning Harbor into $HARBOR_DIR ..."
    git clone "$HARBOR_REPO_URL" "$HARBOR_DIR"
else
    echo "  Harbor repo found at $HARBOR_DIR — skipping clone."
fi

echo "  Installing harbor CLI via uv tool..."
(cd "$HARBOR_DIR" && uv tool install -e . --quiet)

if ! command -v harbor &>/dev/null; then
    echo ""
    echo "  WARNING: 'harbor' not found on PATH after install."
    echo "  The uv tool bin dir may not be in your PATH."
    echo "  Run:  export PATH=\"\$(uv tool bin-dir):\$PATH\""
    echo "  Or add the above to your shell profile (~/.zshrc, ~/.bashrc)."
else
    echo "  harbor CLI: $(harbor --version 2>&1 | head -1)"
fi

echo ""

# ---------------------------------------------------------------------------
# Step 3: .env setup
# ---------------------------------------------------------------------------
echo "[3/3] Configuring .env..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    echo "  Created .env from .env.example"
    echo ""
    echo "  *** ACTION REQUIRED: edit .env and fill in your API credentials. ***"
    echo ""
    echo "  Template preview:"
    echo "  -----------------------------------------------------------------"
    grep -v '^#' "$SCRIPT_DIR/.env.example" | grep -v '^$' | head -20 || true
    echo "  -----------------------------------------------------------------"
else
    echo "  .env already exists — no changes made."
    echo "  Tip: run 'diff .env .env.example' to check for new required variables."
fi

echo ""
echo "================================================================"
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "    1. Edit .env with your API credentials"
echo "    2. See docs/guide/getting-started.md for usage details"
echo "    3. Run your first task:"
echo "       harbor run -p tasks/watch-shop -a openclaw \\"
echo "         -m volcengine-plan/kimi-k2.5 -n 1 -o jobs \\"
echo "         --ae VOLCANO_ENGINE_API_KEY=\"\$VOLCANO_ENGINE_API_KEY\""
echo "================================================================"
