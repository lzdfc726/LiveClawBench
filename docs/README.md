# LiveClawBench Documentation

LiveClawBench: Benchmarking LLM Agents on Complex, Real-World Assistant Tasks.

Core question: when real assistant tasks stack multiple complexity factors (environment heterogeneity, instruction ambiguity, state contamination, knowledge persistence), how does agent capability degrade — and where does it break?

## Directory Map

| Directory | Purpose | Paper Section |
|-----------|---------|---------------|
| [`background/`](background/) | Triple-Axis Complexity Framework & benchmark comparison | §1–§2 |
| [`benchmark/`](benchmark/) | Design principles, taxonomy, factor annotations, walkthroughs | §3 |
| [`cases/`](cases/) | Per-group case design details (engineering docs) | §3.4 inline |
| [`metadata/`](metadata/) | `cases_registry.csv` — single source of truth for all case metadata. Note: `ability_category` 为早期分类字段，论文以 Triple-Axis Framework (A1/A2/B1/B2) 为准 | All stats |
| [`roadmap/`](roadmap/) | Current status & future expansion plans | §6 |

## Case Design Documents

| File | Cases |
|------|-------|
| [`cases/skill_evolution.md`](cases/skill_evolution.md) | 5 skill evolution cases |
| [`cases/life_automation.md`](cases/life_automation.md) | 9 life automation cases |
| [`cases/web_shop.md`](cases/web_shop.md) | 6 web shop cases |
| [`cases/personal_knowledge_base.md`](cases/personal_knowledge_base.md) | 5 PKB cases |
| [`cases/coding_devops.md`](cases/coding_devops.md) | 4 coding & devops cases |

## Benchmark Documents

| File | Content |
|------|---------|
| [`benchmark/design_principles.md`](benchmark/design_principles.md) | Sim2Real, controlled pairs, outcome-driven evaluation |
| [`benchmark/task_taxonomy.md`](benchmark/task_taxonomy.md) | 15 task domains with coverage status |
| [`benchmark/complexity_factors.md`](benchmark/complexity_factors.md) | 29-case factor annotation table + domain×factor heatmap |
| [`benchmark/case_walkthroughs.md`](benchmark/case_walkthroughs.md) | Detailed walkthrough of 3 representative cases |
| [`benchmark/construction_pipeline.md`](benchmark/construction_pipeline.md) | Case synthesis methodology |
| [`benchmark/task_format.md`](benchmark/task_format.md) | Harbor task format & evaluation rubric |

## Quick Stats (29 pilot cases)

- Difficulty: 9 Easy, 11 Medium, 9 Hard
- Factor coverage: A1=10, A2=6, B1=4, B2=11
- Domains covered: 7 of 15 (primary)
