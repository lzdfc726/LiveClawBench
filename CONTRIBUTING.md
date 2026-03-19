# Contributing to LiveClawBench

## Adding a New Task

Each task must follow the Harbor format. Create a directory under `tasks/<id>-<task-name>/`:

```
tasks/<id>-<task-name>/
├── task.toml          # Required: metadata & resource config
├── instruction.md     # Required: agent-facing task description
├── environment/
│   └── Dockerfile     # Required: build environment
├── solution/
│   └── solve.sh       # Recommended: reference solution
└── tests/
    └── test.sh        # Required: verification script
```

### Naming Convention

- Format: `<zero-padded-id>-<semantic-name>` (e.g., `09-flight-seat-selection`)
- ID is a two-digit zero-padded integer, assigned sequentially
- Semantic name uses kebab-case derived from the task's logical name

### task.toml Template

```toml
version = "1.0"

[metadata]
difficulty = "medium"                    # easy | medium | hard
category = "open-world"
tags = ["e-commerce_daily_svcs", "communication_email"]

domain = "E-commerce & Daily Svcs"
domains_multi = ["E-commerce & Daily Svcs", "Communication & Email"]

# Triple-Axis Complexity Factors (0 = absent, 1 = present)
factor_a1 = 1   # Cross-Service Dependency
factor_a2 = 0   # Contaminated Initial State
factor_b1 = 0   # Implicit Goal Resolution
factor_b2 = 0   # Knowledge System Maintenance

case_id = 99    # assign a unique integer

[verifier]
timeout_sec = 900.0

[agent]
timeout_sec = 1800.0

[environment]
build_timeout_sec = 600.0
cpus = 2
memory_mb = 4096
storage_mb = 10240
allow_internet = false
```

### Multi-Service Tasks

Use a single Dockerfile. Start all mock services (email, airline, shop, etc.) within the same container using a supervisor script. Agents access services via `localhost`.

### Validation

Before submitting, run:

```bash
python scripts/validate_tasks.py
```

The validator checks:
- All four required files are present
- Directory name matches `##-kebab-case` pattern
- TOML content: version, metadata fields (difficulty, case_id, domain), required sections
- case_id uniqueness across all tasks
- Stub detection warnings (short instruction.md, echo-only test.sh, missing solve.sh)

### Submitting

1. Fork the repo and create a branch: `task/<task-name>`
2. Add your task directory under `tasks/`
3. Add an entry to `registry.json`
4. Add a row to `docs/metadata/cases_registry.csv`
5. Run `python scripts/validate_tasks.py` — all tasks must pass
6. Open a pull request with a brief description of the task
