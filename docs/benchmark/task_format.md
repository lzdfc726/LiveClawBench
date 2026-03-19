# Harbor Task Format

本文档描述 LiveClawBench 采用的 Harbor task format 及其 hybrid evaluation rubric 设计。

---

## Task 目录结构

每个 task 遵循以下标准化目录结构：

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

**各文件职责：**

- `task.toml` — 声明 task 的元数据（难度、domain、capability dimension）和资源配置（CPU、内存、超时时间）
- `instruction.md` — Agent 看到的任务描述，模拟用户的自然语言指令
- `Dockerfile` — 构建 task 运行环境，包括 mock service 启动、数据库初始化、依赖安装
- `solve.sh` — 参考解法脚本，用于验证 task 可解性（不暴露给 agent）
- `test.sh` — 验证脚本，检查 agent 执行后的环境状态

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
```

**关键配置说明：**

| 字段 | 含义 |
|------|------|
| `capability_dimension` | 对应五大能力维度之一：`cross_environment_composition`, `proactive_decision_making`, `multi_agent_coordination`, `reflective_diagnosis`, `skill_evolution` |
| `verifier.timeout_sec` | 验证脚本的最大执行时间 |
| `agent.timeout_sec` | Agent 完成任务的最大时间 |
| `environment.build_timeout_sec` | Docker 环境构建超时 |

---

## Hybrid Evaluation Rubric

LiveClawBench 采用 outcome-driven 的 hybrid evaluation 策略，兼顾评估的确定性和灵活性。

**Rule-based verification（`test.sh`）：**

验证脚本通过检查任务完成后的环境状态来判定结果：

- **Database state** — 查询 SQLite 数据库，验证预期记录是否存在（订单、邮件、日程等）
- **File contents** — 检查生成的文件是否包含预期内容（skill 文件、代码文件、报告等）
- **API responses** — 调用 mock service API，验证服务状态是否符合预期

**Outcome-driven 原则：**

- 不检查 agent 的 action sequence，只检查最终状态
- Agent 可以用任何策略达成目标——直接调用 API、通过 web UI 操作、甚至编写脚本自动化
- 这确保了评估结果反映 agent 的真实能力，而非对特定路径的记忆

**Partial credit 支持：**

- 对于 multi-step task，验证脚本将任务分解为多个独立的 checkpoint
- 每个 checkpoint 独立评分，agent 完成部分步骤也能获得相应分数
- 例如：航班变更通知任务可分为"识别变更邮件"、"查询受影响日程"、"发送通知"三个 checkpoint
- 这提供了更细粒度的能力评估，避免了 all-or-nothing 的粗暴评分
