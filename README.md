# LiveClawBench

> Benchmarking LLM Agents on Complex, Real-World Assistant Tasks

[![Paper](https://img.shields.io/badge/Paper-COLM%202026-blue)](https://arxiv.org/abs/TODO)
[![Dataset](https://img.shields.io/badge/Dataset-29%20Tasks-green)](tasks/)

## Overview

LiveClawBench is an open-world benchmark for evaluating LLM agents on realistic, multi-step assistant tasks. Built on the [Harbor](https://github.com/av/harbor) evaluation framework and the [OpenClaw](https://github.com/TODO/openclaw) agent platform.

**29 pilot tasks** spanning:
- 5 capability dimensions
- 15 task domains
- 9 Easy / 11 Medium / 9 Hard
- Triple-Axis Complexity Framework (A1/A2/B1/B2)

## Quick Start

```bash
git clone https://github.com/TODO/LiveClawBench.git
cd LiveClawBench

# List all tasks
harbor datasets list --registry-path registry.json

# Run a single task
harbor run --path tasks/ --task-name flight-seat-selection --agent openclaw --model anthropic/claude-opus-4-6

# Run the full benchmark
harbor run --dataset liveclawbench@1.0 --registry-path registry.json --agent openclaw --model anthropic/claude-opus-4-6
```

## Capability Dimensions

| Dimension | # Tasks | Description |
|-----------|---------|-------------|
| Skill Evolution | 5 | Create, update, merge, and manage reusable skills |
| Proactive Decision-Making | 10 | Autonomous judgment, fallback strategies, initiative |
| Cross-Environment Composition | 9 | Coordinate across multiple environments |
| Reflective Diagnosis | 5 | Debugging, root-cause analysis, incremental repair |
| Multi-Agent Coordination | 0 | Collaboration between multiple agents (roadmap) |

## Task Format

Each task under `tasks/<id>-<task_name>/` follows the Harbor format:

```
<id>-<task_name>/
├── task.toml          # Task metadata & resource config
├── instruction.md     # Agent-facing task description
├── environment/
│   └── Dockerfile     # Build environment
├── solution/
│   └── solve.sh       # Reference solution
└── tests/
    └── test.sh        # Verification script
```

See [docs/benchmark/task_format.md](docs/benchmark/task_format.md) for full specification.

## Validate Tasks

```bash
python scripts/validate_tasks.py
```

## Documentation

- [Task Taxonomy](docs/benchmark/task_taxonomy.md)
- [Complexity Factors](docs/benchmark/complexity_factors.md)
- [Design Principles](docs/benchmark/design_principles.md)
- [Case Walkthroughs](docs/benchmark/case_walkthroughs.md)
- [Contributing](CONTRIBUTING.md)

## Citation

```bibtex
@article{liveclawbench2026,
  title={LiveClawBench: Benchmarking LLM Agents on Complex, Real-World Assistant Tasks},
  author={TODO},
  journal={COLM 2026},
  year={2026}
}
```
