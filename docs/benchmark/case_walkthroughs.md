# Representative Case Walkthroughs (§3.4)

本文档对 LiveClawBench 中三个代表性 case 进行详细拆解，展示不同 complexity factor 的叠加模式如何影响任务难度。

---

## Case 1: flight-info-change-notice

**展示 A1 (Cross-Service Dependency) + B1 (Implicit Goal Resolution) 叠加**

| 属性 | 值 |
|------|-----|
| Difficulty | Hard |
| Factors | A1 + B1 |
| Environments | Email + Airline + Calendar (3 heterogeneous services) |
| Domain | Calendar & Task Mgmt |

### Task Description

> "帮我看看邮箱里有没有航班变更通知，如果有检查日程有没有受影响，通知同行的人。"

### Complexity Analysis

**A1 factor — Cross-Service Dependency:**

Agent 必须串联三个异构 mock service 的操作：从 Email 中读取航班变更通知 → 调用 Airline API 获取航班变更详情 → 查询 Calendar 确认受影响的日程 → 最终通过 Email 发送通知。任何一环的失败都会导致整条链路断裂。

**B1 factor — Implicit Goal Resolution:**

任务指令中存在两处关键的隐式目标：

1. **"受影响的计划"** — 用户未定义何为"受影响"。Agent 需要自行判断：是同一日期的事件？时间段重叠的事件？还是目的地相同的事件？这要求 agent 具备常识推理能力。
2. **"通知同行的人"** — 用户未指明同行者是谁。Agent 必须从 calendar event 的 participants 字段中推断出哪些人是同行者，而非所有参会人。

**叠加效应：**

单独的 A1 只是机械的数据流转，单独的 B1 只是推理练习。但当两者叠加时，agent 必须在协调跨服务操作的同时做出判断性决策——这意味着推理错误会沿着服务链路传播，造成级联失败。

### Expected Agent Behavior

1. 检查 email inbox，定位航班变更通知邮件
2. 解析航班变更详情（原时间 → 新时间、航班号）
3. 查询 calendar 中受影响日期的事件
4. 判断哪些事件"受影响"（需要推理）
5. 从 calendar event participants 中识别同行者
6. 编写并发送包含航班变更详情的通知邮件

### Evaluation Rubric

- Rule-based 检查：验证 email database 中是否存在已发送的通知，收件人和航班变更信息是否正确
- 检查 calendar 是否有相应更新（如适用）

---

## Case 2: skill_dependency_fix

**展示 B2 (Knowledge System Maintenance) 的深度**

| 属性 | 值 |
|------|-----|
| Difficulty | Hard |
| Factors | B2 |
| Environments | Single (OpenClaw skill system) |
| Domain | Documents & Knowledge |

### Task Description

> 用户修改了底层 skill 后，agent 需要识别上层 skill 对底层 skill 的调用关系，并理顺上层 skill 对底层 skill 的调用。

### Complexity Analysis

**B2 factor — Knowledge System Maintenance (maximum depth):**

这不是简单的创建或更新单个 skill，而是要求 agent 理解一个 skill dependency graph。当底层 skill 被修改后，变更会级联传播到所有依赖它的上层 skill。

Agent 面临的核心挑战：

1. **依赖结构理解** — 必须解析 skill repository 中的调用关系，构建出完整的 dependency graph
2. **影响范围识别** — 从被修改的底层 skill 出发，追踪所有直接和间接依赖它的上层 skill
3. **变更一致性维护** — 对每个受影响的 skill 进行适配性修改，确保修改后的调用参数、返回值、行为语义与新的底层 skill 一致
4. **完整性验证** — 确保更新后不存在 circular dependency 或 broken reference

**为什么单因子也能达到 Hard：**

B2 的复杂性完全来自知识系统内部的结构性约束，而非外部环境的异构性。这类似于大型代码库中的 API breaking change 处理——改一个底层接口，所有调用方都需要适配。

### Expected Agent Behavior

1. 读取被修改的底层 skill，理解变更内容
2. 遍历 skill repository，追踪 dependency graph 找到所有引用该 skill 的上层 skill
3. 分析每个依赖 skill 的具体调用方式
4. 逐一更新依赖 skill，确保与新的底层 skill 接口一致
5. 验证整个 dependency chain 无 broken reference 或 circular dependency

### Evaluation Rubric

- 所有依赖 skill 均已正确更新
- Skill dependency chain 保持一致性
- Skill repository 中无 broken reference

---

## Case 3: live-web-research-sqlite-fts5

**展示 A1 (Cross-Service Dependency) + B2 (Knowledge System Maintenance) 叠加**

| 属性 | 值 |
|------|-----|
| Difficulty | Hard |
| Factors | A1 + B2 |
| Environments | Live browser + pinned docs + YouTube + local SQLite |
| Domain | Deep Research & Report |

### Task Description

> 使用 live browser 浏览 pinned docs 和 YouTube 视频，整理 SQLite FTS5 quick reference，并构建本地 SQLite reference DB 回答后续问题。

### Complexity Analysis

**A1 factor — Cross-Service Dependency:**

Agent 需要在真实 web 环境中导航多个异构信息源：pinned documentation sites（结构化 HTML）、YouTube 视频（非结构化 transcript）。不同来源的信息格式、可靠性、粒度各不相同，agent 必须在提取过程中处理这些差异。

**B2 factor — Knowledge System Maintenance:**

任务的最终产出不是一份静态文档，而是一个可查询的 SQLite database with FTS5 full-text search。这要求 agent 完成从"信息获取"到"知识工程"的跨越：设计合理的 schema、选择正确的 tokenizer、构建 FTS5 index，使得后续查询能够返回准确结果。

**叠加效应：**

A1 和 B2 的叠加产生了独特的挑战：

- 从 web 获取的信息如果不能被正确结构化，则无法入库 — A1 的输出质量直接决定 B2 的成败
- Database schema 的设计反过来约束了信息提取的粒度 — B2 的需求反向影响 A1 的执行策略
- 两个因子形成了一个双向耦合：信息获取和知识持久化必须协同设计，而非顺序执行

### Expected Agent Behavior

1. 浏览 pinned documentation pages，提取 SQLite FTS5 核心概念和 API
2. 解析 YouTube 视频内容，获取补充性 insights
3. 将多源信息综合为结构化的 quick reference
4. 设计 SQLite database schema，创建 FTS5 virtual table
5. 将提取的知识填充到数据库中
6. 验证 FTS5 query 能正确返回相关结果

### Evaluation Rubric

- SQLite database 存在且包含正确的 FTS5 schema
- 数据库内容准确反映源材料信息
- FTS5 query 能返回相关结果
- Quick reference 文档完整且准确

---

## Cross-Case Analysis

### Factor Stacking Patterns

这三个 case 展示了三种不同的 complexity factor 叠加模式：

| Case | 模式 | 复杂性来源 |
|------|------|-----------|
| flight-info-change-notice | A1 + B1 | 跨环境数据流 + 隐式目标推理 |
| skill_dependency_fix | Pure B2 | 知识系统内部的依赖关系 |
| live-web-research-sqlite-fts5 | A1 + B2 | 跨环境信息获取 + 知识持久化工程 |

### 叠加模式分析

**A1 + B1 (flight-info-change-notice):**
Agent 需要在协调多个服务的同时做出判断性决策。A1 提供了操作的"宽度"（跨服务），B1 提供了决策的"深度"（隐式推理）。两者叠加时，推理错误会沿服务链路传播，形成级联失败。

**Pure B2 (skill_dependency_fix):**
单环境但认知深度极高。复杂性完全来自知识系统内部的结构性约束——dependency graph 的维护本身就是一个需要全局视野的任务。这证明了环境数量并非难度的唯一决定因素。

**A1 + B2 (live-web-research-sqlite-fts5):**
跨环境信息获取与知识持久化工程的双向耦合。Agent 需要同时处理信息来源的异构性和知识沉淀的结构化要求，两个维度相互约束、协同演进。

### Key Insight

单因子 case 可以通过专门的策略解决——A1 只需要好的 API orchestration，B2 只需要好的 state tracking。但多因子叠加时，agent 需要同时维持多个认知维度的能力，且这些维度之间存在非线性的交互效应。这正是现有 benchmark 难以测量、而 LiveClawBench 通过 factor stacking 框架能够系统性评估的核心能力。
