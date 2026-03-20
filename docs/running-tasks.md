# Running Tasks with Harbor

This guide covers how to configure API keys, select models, and run individual benchmark tasks against the OpenClaw agent.

---

## Prerequisites

Harbor CLI must be installed from the `harbor/` directory:

```bash
cd harbor
uv tool install -e .
```

If `harbor` is not on your `$PATH` (e.g. `uv tool` bin dir not in PATH), use the local venv directly:

```bash
harbor/.venv/bin/harbor --help
```

---

## API Key Configuration

### Supported providers and their base URLs

These are hard-coded in `harbor/src/harbor/agents/installed/openclaw.py` under `_PROVIDER_CONFIGS`:

| Provider name | Base URL | API key env var |
|---|---|---|
| `volcengine` | `https://ark.cn-beijing.volces.com/api/v3` | `VOLCANO_ENGINE_API_KEY` |
| `volcengine-plan` | `https://ark.cn-beijing.volces.com/api/coding/v3` | `VOLCANO_ENGINE_API_KEY` |

Other providers (Anthropic, OpenAI, Gemini) are auto-discovered by OpenClaw using standard env vars:

| Env var | Provider |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic (claude-*) |
| `OPENAI_API_KEY` | OpenAI |
| `GEMINI_API_KEY` | Google Gemini |
| `VOLCANO_ENGINE_API_KEY` | Volcengine / Volcengine-Plan |

### Passing API keys to the container

Use `--ae KEY=VALUE` on the `harbor run` command. This injects the variable into the agent container environment:

```bash
harbor run ... --ae VOLCANO_ENGINE_API_KEY="your-key-here"
```

Multiple keys can be passed with repeated `--ae` flags:

```bash
harbor run ... --ae ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" --ae OPENAI_API_KEY="$OPENAI_API_KEY"
```

Shell environment variables are used as fallback if `--ae` is not provided.

### Using a `.env` file

Store keys in `LiveClawBench/.env` and source before running:

```bash
# LiveClawBench/.env
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://ark.cn-beijing.volces.com/api/coding/v3
```

```bash
source LiveClawBench/.env
harbor run ... --ae VOLCANO_ENGINE_API_KEY="$OPENAI_API_KEY"
```

---

## Model Name Format

Models are specified as `provider/model-id`:

```
volcengine-plan/kimi-k2.5
volcengine/deepseek-v3-250324
anthropic/claude-opus-4-1
anthropic/claude-sonnet-4-5
```

The provider prefix must match a key in `_PROVIDER_CONFIGS` (for volcengine variants) or be a provider OpenClaw can auto-discover.

---

## Running a Single Task

```bash
cd harbor

.venv/bin/harbor run \
  -p ../LiveClawBench/tasks/<task-name> \
  -a openclaw \
  -m volcengine-plan/kimi-k2.5 \
  -n 1 \
  -o ../LiveClawBench/jobs \
  --ae VOLCANO_ENGINE_API_KEY="$OPENAI_API_KEY" \
  --timeout-multiplier 2.0 \
  --debug
```

### Key parameters

| Flag | Description |
|---|---|
| `-p` | Path to the task directory (contains `task.toml`) |
| `-a` | Agent name — use `openclaw` for all ClawBench tasks |
| `-m` | Model in `provider/model-id` format |
| `-n` | Number of parallel runs (use `1` for single evaluation) |
| `-o` | Output directory for job results |
| `--ae` | Inject env var into agent container (`KEY=VALUE`) |
| `--timeout-multiplier` | Scale all timeouts in `task.toml` (e.g. `2.0` doubles them) |
| `--debug` | Verbose logging; keeps container alive on failure |

---

## Environment Configuration

### `task.toml` settings

Each task's `task.toml` controls container resources and permissions:

```toml
[environment]
allow_internet = true      # Required if agent needs to call LLM APIs
cpus = 2
memory_mb = 4096
storage_mb = 10240

[agent]
timeout_sec = 1800.0       # Max time for agent to complete the task

[verifier]
timeout_sec = 900.0        # Max time for verify.py to run
```

`allow_internet = true` is mandatory for any task where the agent calls external APIs (all OpenClaw tasks).

### Container startup mechanism

The Dockerfile sets `ENTRYPOINT ["/entrypoint.sh"]`. On container start, `entrypoint.sh` runs `startup.sh` in the background (5s sleep), then hands off to the main command. This starts any required backend/frontend services before the agent begins.

For `baggage-tracking-application`, `startup.sh` starts:
- Flask backend on port `5000` (logs → `/tmp/airline-backend.log`)
- Vite frontend on port `5173` (logs → `/tmp/airline-frontend.log`)

---

## Viewing Results

After a run completes, Harbor writes output to the job directory under `-o`:

```
LiveClawBench/jobs/
└── <job-id>/
    └── <trial-id>/
        └── logs/
            ├── verifier/
            │   └── reward.txt        # Final score (e.g. "1.0" or "0.0")
            └── agent/
                └── openclaw.txt      # Full agent session log
```

`reward.txt` contains a single float extracted from `verify.py`'s `Score: X.X/1.0` output.

To quickly check the result:

```bash
cat LiveClawBench/jobs/<job-id>/*/logs/verifier/reward.txt
```

---

## Adding a Custom Provider

If your model uses a provider not in `_PROVIDER_CONFIGS`, add it to `harbor/src/harbor/agents/installed/openclaw.py`:

```python
_PROVIDER_CONFIGS: dict[str, dict[str, Any]] = {
    # ... existing entries ...
    "my-provider": {
        "baseUrl": "https://api.example.com/v1",
        "api": "openai-completions",
        "apiKey": "MY_PROVIDER_API_KEY",   # env var name inside container
    },
}
```

Then pass the key via `--ae MY_PROVIDER_API_KEY="your-key"` and use `my-provider/model-id` as the `-m` value.
