# Construction & Verification Pipeline (§3.5)

本文档描述 LiveClawBench 的 case 构建方法论与质量保障流程。

---

## Case Synthesis Pipeline

LiveClawBench 的 case 构建遵循以下七步流程：

### Step 1: Source — 真实用例采集

从 OpenClaw 平台的 1000+ 真实使用记录中筛选候选任务。这些记录涵盖了用户在日常工作中使用 AI assistant 完成的各类任务。

### Step 2: Selection — 候选筛选

筛选标准：
- **代表性** — 任务应反映真实 assistant 工作流，而非人为构造的 toy problem
- **可确定性评估** — 任务结果必须可通过 rule-based 方式验证，排除纯主观评价的任务
- **环境可模拟** — 任务涉及的外部服务可通过 mock environment 合理模拟

### Step 3: Environment Synthesis — 环境构建

Mock service 采用统一的技术栈：
- Frontend: React.js（提供完整的 web UI）
- Backend: Flask（RESTful API + session 管理）
- Database: SQLite（轻量、可移植、易于状态验证）

每个 mock service 模拟真实服务的核心功能，保持接口语义一致性。

### Step 4: Data Synthesis — 数据注入

采用 time-offset 机制生成测试数据：
- 所有时间戳基于 `current_time + offset` 动态计算
- 确保 case 在任意时间点运行都能产生有效结果
- 数据内容（用户信息、订单、邮件等）基于真实场景模板生成

### Step 5: Case Synthesis — Case 组装

将以下组件组装为 Harbor task format：
- Task metadata（`task.toml`）— 难度、domain、capability dimension、资源配置
- Agent instruction（`instruction.md`）— 模拟用户自然语言指令
- Environment setup（`Dockerfile`）— 环境构建与数据初始化
- Verification（`test.sh`）— Rule-based 验证脚本
- Reference solution（`solve.sh`）— 参考解法，用于验证 case 可解性

### Step 6: Quality Assurance — 质量审核

3 名经验丰富的 human reviewer 对每个 case 进行独立评审：
- 难度标定（Easy / Medium / Hard）是否合理
- 任务描述是否清晰且不泄露解法
- 验证脚本是否充分覆盖预期结果
- Reference solution 是否能通过所有 test

### Step 7: Factor Annotation — 因子标注

每个 case 标注其携带的 complexity factor（A1/A2/B1/B2），用于后续的对照实验和因果分析。标注由 reviewer 共识决定。

---

## 各 Case Group 的构建策略

不同类型的 case 采用针对性的构建方法：

### Life Automation（航班、日程、邮件）

- **环境策略：** Minimal Environment Set — Email + Airline + Calendar 三个 mock service 构成最小环境集
- **复用机制：** 不同 case 共享相同的 mock service 代码，仅替换 `.db` 文件改变任务上下文
- **对照设计：** 通过叠加 A1（跨服务依赖）构造难度梯度，如 washer-shop (E) → email-washer-change (M)

### Web Shop（购物、售后）

- **环境策略：** Email mock + Shop mock 组合
- **数据差异：** 不同商品类型（洗衣机、手表）使用不同的 product database，但 shop service 代码完全复用
- **验证重点：** 订单状态、支付记录、库存变化、通知邮件的多维度交叉验证

### Skill Evolution（技能管理）

- **环境策略：** 单一环境（OpenClaw skill system），复杂度来自 skill repository 内部的结构性约束
- **核心挑战：** Structured dependency graph 的理解与维护
- **难度梯度：** 从单一 skill 创建（E）到 dependency chain 修复（H），B2 因子深度递增

### PKB（Personal Knowledge Base）

- **环境策略：** 多源知识材料（文档、网页、音频 transcript 等）
- **数据特点：** 材料中包含 controlled noise 和 errors，测试 agent 的信息过滤与冲突解决能力
- **评估维度：** Knowledge graph 的完整性、准确性、一致性

### Coding & DevOps

- **环境策略：** 真实 open-source repo（如 Vue.js 项目）作为任务环境
- **Bug 注入：** 在真实代码中注入不同复杂度的 bug，从单文件语法错误（E）到跨模块逻辑缺陷（H）
- **验证方式：** 项目能否成功 build、test suite 是否通过、特定功能是否恢复正常
