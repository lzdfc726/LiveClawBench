# Harbor Task Format

This document describes the Harbor task format used by LiveClawBench and the
hybrid evaluation rubric design.

---

## Task Directory Structure

Each task follows this standardised directory layout:

```
<task_name>/
├── task.toml               # Task metadata & resource config
├── instruction.md          # Agent-facing task description
├── environment/
│   └── Dockerfile          # Build environment
├── solution/
│   └── solve.sh            # Reference solution
└── tests/
    └── test.sh             # Verification script
```

**File responsibilities:**

- `task.toml` — declares task metadata (difficulty, domain, capability dimension) and resource config (CPU, memory, timeouts)
- `instruction.md` — the task description shown to the agent, simulating a user's natural language request
- `Dockerfile` — builds the task runtime environment, including mock service startup, database init, and dependency installation
- `solve.sh` — reference solution script used to verify task solvability (not exposed to the agent)
- `test.sh` — verification script that checks environment state after agent execution

---

## task.toml Template

```toml
version = "1.0"

[metadata]
difficulty = "medium"                    # easy | medium | hard
category = "open-world"
tags = ["cross-env", "email", "airline"]
capability_dimension = "cross_environment_composition"
domain = "E-commerce & Daily Svcs"

[verifier]
timeout_sec = 900.0

[agent]
timeout_sec = 1800.0

[environment]
build_timeout_sec = 600.0
cpus = 2
memory = "4G"
storage = "10G"
allow_internet = true   # required if the agent needs LLM API access
```

**Key fields:**

| Field | Description |
|-------|-------------|
| `capability_dimension` | One of: `cross_environment_composition`, `proactive_decision_making`, `multi_agent_coordination`, `reflective_diagnosis`, `skill_evolution` |
| `verifier.timeout_sec` | Maximum execution time for the verification script |
| `agent.timeout_sec` | Maximum time the agent has to complete the task |
| `environment.build_timeout_sec` | Docker environment build timeout |
| `allow_internet` | Set to `true` if the agent must call external LLM APIs |

**Complexity factor fields** (set to `true` when the factor applies):

| Field | Factor |
|-------|--------|
| `factor_a1` | A1 — Cross-Service Dependency |
| `factor_a2` | A2 — Contaminated Initial State |
| `factor_b1` | B1 — Implicit Goal Resolution |
| `factor_b2` | B2 — Knowledge System Maintenance |

---

## Hybrid Evaluation Rubric

LiveClawBench uses an outcome-driven hybrid evaluation strategy that balances
determinism with flexibility.

**Rule-based verification (`test.sh`):**

The verification script checks environment state after task completion:

- **Database state** — query SQLite databases to verify expected records exist (orders, emails, schedules, etc.)
- **File contents** — check generated files for expected content (skill files, code, reports, etc.)
- **API responses** — call mock service APIs to verify service state matches expectations

**Outcome-driven principle:**

- The verifier checks final state, not the agent's action sequence
- Agents can achieve the goal via any strategy: direct API calls, web UI interaction, scripting, etc.
- This ensures evaluation reflects genuine agent capability rather than path memorisation

**Partial credit:**

- For multi-step tasks, the verifier decomposes the task into independent checkpoints
- Each checkpoint is scored independently; completing partial steps yields partial credit
- Example: the flight-info-change-notice task has three checkpoints — "identify change email", "find affected schedule", "send notification"
- This provides fine-grained capability measurement and avoids all-or-nothing scoring
