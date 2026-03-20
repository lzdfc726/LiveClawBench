# LiveClawBench

> Benchmarking LLM Agents on Complex, Real-World Assistant Tasks

[![Paper](https://img.shields.io/badge/Paper-arXiv%20Submitted-orange)](https://arxiv.org/abs/TODO)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Tasks](https://img.shields.io/badge/Tasks-29-green)](tasks/)

LiveClawBench evaluates LLM agents on realistic, multi-step assistant tasks using the [Harbor](https://github.com/Mosi-AI/claw-harbor) framework and the [OpenClaw](https://github.com/openclaw/openclaw) agent platform.

## Quick Start

```bash
git clone https://github.com/TODO/LiveClawBench.git
cd LiveClawBench
./setup.sh          # installs harbor CLI, creates .env from template
# edit .env with your API key, then:
harbor run -p tasks/watch-shop -a openclaw -m custom/<YOUR_MODEL_ID> \
  -n 1 -o jobs \
  --ae CUSTOM_BASE_URL="<YOUR_BASE_URL>" \
  --ae CUSTOM_API_KEY="<YOUR_API_KEY>"
```

See [docs/guide/getting-started.md](docs/guide/getting-started.md) for full setup details.

## Documentation

> New here? Start with **Getting Started**, then **Running Tasks**.

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/guide/getting-started.md) | Prerequisites, setup, first run |
| [Running Tasks](docs/guide/running-tasks.md) | Harbor CLI flags, results, full dataset runs |
| [Adding Tasks](docs/guide/adding-tasks.md) | Task format, scoring contract, submission |
| [Benchmark Design](docs/benchmark/design_principles.md) | Triple-Axis complexity framework |
| [Task Taxonomy](docs/benchmark/task_taxonomy.md) | Domain and difficulty breakdown |

## Tasks (29 pilot)

| Domain | Easy | Medium | Hard |
|--------|------|--------|------|
| E-commerce & Daily Svcs | 3 | 3 | 3 |
| Communication & Email | 2 | — | — |
| Calendar & Task Mgmt | — | — | 2 |
| Coding & Software Dev | — | 1 | 1 |
| DevOps & Env Repair | 1 | — | 1 |
| Documents & Knowledge | 2 | 3 | 3 |
| Deep Research & Report | — | 1 | 1 |
| **Total** | **9** | **11** | **9** |

Complexity factors: A1 Cross-Service Dependency (10), A2 Contaminated State (6), B1 Implicit Goals (4), B2 Knowledge Maintenance (11).

## Citation

```bibtex
@article{liveclawbench2026,
  title={LiveClawBench: Benchmarking LLM Agents on Complex, Real-World Assistant Tasks},
  author={TODO},
  journal={COLM 2026},
  year={2026}
}
```
