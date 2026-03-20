# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the task corpus for ClawBench — 29 harbor-format benchmark tasks evaluating LLM agents on real-world assistant scenarios. The parent `CLAUDE.md` (one level up) covers the full project architecture including Harbor framework and OpenClaw adapter.

## Task List

| Task Dir | Domain | Difficulty |
|---|---|---|
| `watch-shop` | E-commerce & Daily Svcs | easy |
| `washer-shop` | E-commerce & Daily Svcs | easy |
| `info-change` | E-commerce & Daily Svcs | easy |
| `washer-change` | E-commerce & Daily Svcs | easy |
| `email-watch-shop` | E-commerce & Daily Svcs | medium |
| `email-washer-change` | E-commerce & Daily Svcs | medium |
| `email-writing` | Communication & Email | easy |
| `email-reply` | Communication & Email | easy |
| `schedule-change-request` | Calendar & Task Mgmt | hard |
| `flight-booking` | E-commerce & Daily Svcs | easy |
| `flight-info-change-notice` | Calendar & Task Mgmt | hard |
| `flight-seat-selection` | E-commerce & Daily Svcs | medium |
| `flight-seat-selection-failed` | E-commerce & Daily Svcs | hard |
| `flight-cancel-claim` | E-commerce & Daily Svcs | hard |
| `baggage-tracking-application` | E-commerce & Daily Svcs | medium |
| `blog-site-from-scratch` | Coding & Software Dev | hard |
| `blog-site-completion-from-starter` | Coding & Software Dev | medium |
| `vue-project-build-bug-fix-easy` | DevOps & Env Repair | easy |
| `vue-project-build-bug-fix-hard` | DevOps & Env Repair | hard |
| `skill-creation` | Documents & Knowledge | easy |
| `skill-repository-curation` | Documents & Knowledge | hard |
| `skill-supplementation` | Documents & Knowledge | easy |
| `skill-conflict-resolution` | Documents & Knowledge | medium |
| `skill-dependency-fix` | Documents & Knowledge | hard |
| `noise-filtering` | Deep Research & Report | medium |
| `mixed-tool-memory` | Documents & Knowledge | hard |
| `incremental-update-ctp` | Documents & Knowledge | medium |
| `live-web-research-sqlite-fts5` | Deep Research & Report | hard |
| `conflict-repair-acb` | Documents & Knowledge | medium |

## Task Structure

```
tasks/<task-name>/
├── task.toml           # difficulty, domain, factor_a1/a2/b1/b2, timeouts, allow_internet
├── instruction.md      # Agent-facing prompt
├── environment/
│   └── Dockerfile      # FROM ghcr.io/openclaw/openclaw:2026.3.11
├── solution/
│   └── solve.sh        # Reference solution
└── tests/
    ├── test.sh         # Extracts score from verify.py output → /logs/verifier/reward.txt
    └── verify.py       # Scoring logic; prints "Score: X.X/1.0"; exit 0 if score >= 0.5
```

## Scoring Convention

`verify.py` uses partial credit: full score (1.0) for complete task, partial (0.5) for meaningful progress. `test.sh` extracts the score with `grep -oP 'Score:\s*\K[0-9.]+'` and writes it to `/logs/verifier/reward.txt`.

## Adding a New Task

1. Create `tasks/<task-name>/` with the structure above
2. `task.toml` must set `allow_internet = true` under `[environment]` if the agent needs LLM API access
3. Set complexity factors (`factor_a1`, `factor_a2`, `factor_b1`, `factor_b2`) per the triple-axis framework
4. Base Dockerfile on `ghcr.io/openclaw/openclaw:2026.3.11`
5. `verify.py` must print `Score: X.X/1.0` and exit non-zero if score < 0.5

## Running a Single Task

```bash
# From harbor/ directory
harbor run -p ../LiveClawBench/tasks/<task-name> -a openclaw \
  -m volcengine-plan/kimi-k2.5 -n 1 -o ../LiveClawBench/jobs \
  --ae VOLCANO_ENGINE_API_KEY="$OPENAI_API_KEY" --timeout-multiplier 2.0 --debug
```

## Known Issues

- `skill-repository-curation`: `test.sh`'s `evaluate.py` is missing `--base-dir` parameter
- Tasks with `factor_a1=1` (Cross-Service Dependency) involve multiple running services in the same container — check Dockerfile for service startup scripts
