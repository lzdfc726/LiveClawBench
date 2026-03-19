# Design Principles (§3.1)

本文档阐述 LiveClawBench 的四项核心设计原则。

---

## 1. Sim2Real

LiveClawBench 的 mock environment 追求对真实服务的高保真模拟，而非简化的 API stub。

**技术架构：**

- 每个 mock service（Email、Airline、Shop、Calendar）均采用完整的 B/S 架构：React.js frontend + Flask backend + SQLite database
- Agent 面对的交互界面与真实 web service 无异——有完整的 HTTP endpoint、session 管理、错误码体系
- 这确保了 benchmark 中测量到的 agent 能力可以迁移到真实场景

**时间偏移数据注入：**

- 测试数据中的时间戳不使用绝对日期，而是基于 `current_time + offset` 动态计算
- 例如：航班出发时间 = 当前时间 + 3 天，而非固定的 "2026-04-01"
- 这保证了 case 在任何时间点运行都能产生有效的测试结果，避免了"过期数据"问题

---

## 2. Minimal Environment Set（最小环境集）

对每个场景，确定完成真实任务所需的最小环境组合，避免冗余开发。

**核心思路：**

- Life Automation 场景的最小环境集：Email + Airline + Calendar（三个 mock service 即可覆盖航班预订、日程管理、邮件通知等完整工作流）
- Web Shop 场景的最小环境集：Email + Shop（购物 + 订单通知）
- 不同 case 复用相同的环境，仅替换 database 文件（`.db`）来改变任务上下文

**设计收益：**

- 环境复用大幅降低了开发和维护成本
- 同一环境集上的不同 case 天然形成对照组——环境相同，仅任务目标和数据不同
- 验证逻辑也因此简化：既然只有 database 文件在变化，verification 本质上就是检查 DB 中的预期数据

---

## 3. Outcome-Driven Evaluation

评估关注最终环境状态，而非 agent 的执行路径。

**Rule-based rubric 设计：**

- 验证脚本（`test.sh`）检查任务完成后的环境状态：database 记录、文件内容、API 响应
- 不要求 agent 遵循固定的 action sequence——只要最终状态正确，任何策略都被接受
- 这避免了对 agent 行为的过度约束，允许不同 agent 展现不同的问题解决风格

**防止 reward hacking：**

- 验证逻辑检查多个独立的 observable outcome，而非单一指标
- 例如：购物任务不仅检查订单是否创建，还检查支付记录、库存变化、通知邮件等关联状态
- 多维度交叉验证使得 agent 难以通过 shortcut 获得高分

---

## 4. Controlled Pair Design（对照组设计）

通过构造两类对照组，实现因果分析。

**两类对照组：**

- **Factor-addition pairs**：在同一 base case 上叠加一个新的 complexity factor，构造 variant。两端仅差一个因子，用于测量该因子的边际影响。
- **Intensity-gradient pairs**：两端共享同一因子，但强度/深度不同。用于揭示单一因子内的性能退化模式。

**Factor-addition 示例：**

| Base Case | Added Factor | Variant Case | 难度变化 |
|-----------|-------------|-------------|---------|
| washer-shop (E, no factors) | +A1 (email integration) | email-washer-change (M) | E → M |
| flight-seat-selection (M, A1) | +B1 (constraint failure) | flight-seat-selection-failed (H) | M → H |

**Intensity-gradient 示例：**

| Base Case | Shared Factor | Variant Case | 难度变化 |
|-----------|--------------|-------------|---------|
| vue-project-build-bug-fix-easy (E, A2) | A2 depth | vue-project-build-bug-fix-hard (H) | E → H |
| skill_creation (E, B2) | B2 depth | skill_dependency_fix (H) | E → H |

**独特价值：**

- LiveClawBench 是首个支持测量 complexity factor stacking effect 的 benchmark
- Factor-addition pairs 可以量化回答："增加跨服务依赖（A1）平均使 agent 成功率下降多少？"
- Intensity-gradient pairs 可以揭示："同一因子从轻度到重度，性能退化是线性还是超线性？"
- 对照组设计将 benchmark 从单纯的排行榜工具提升为因果分析工具
