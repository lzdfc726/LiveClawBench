# LiveClawBench Complexity Factor Annotation (§3.3)

本文档包含 LiveClawBench 论文第 3.3 节的核心数据表，涵盖 29 个 case 的复杂度因子标注、统计分布、Domain × Factor 交叉表、对照组列表及难度分布。

## 复杂度因子定义

LiveClawBench 定义了四个正交的复杂度因子（complexity factors），用于刻画 case 超出基线难度的结构性来源：

- **A1 — Cross-Service Dependency**：任务需��跨多个独立服务（email、airline、calendar 等）协调完成
- **A2 — Contaminated Initial State**：环境初始状态包含错误、缺陷或不完整的 artifacts，agent 需先诊断再修复
- **B1 — Implicit Goal Resolution**：任务目标未被显式给出，agent 需从上下文中推断真实意图或处理隐含约束
- **B2 — Knowledge System Maintenance**：任务涉及对 skill repository 等知识体系的创建、更新、冲突解决或依赖管理

不携带任何因子的 case 作为 baseline，仅考察 agent 在单一环境下的基本执行能力。

---

## 1. 29-Case Factor Annotation Table

下表列出全部 29 个 case 的因子标注。`✓` 表示该 case 携带对应因子。

| case_id | Case Name                         | Difficulty | A1 | A2 | B1 | B2 | Primary Domain             |
|--------:|-----------------------------------|:----------:|:--:|:--:|:--:|:--:|----------------------------|
|       1 | skill_creation                    |     E      |    |    |    | ✓  | Documents & Knowledge      |
|       2 | skill_supplementation             |     E      |    |    |    | ✓  | Documents & Knowledge      |
|       3 | skill_conflict_resolvation        |     M      |    |    |    | ✓  | Documents & Knowledge      |
|       4 | skill_repository_curation         |     H      |    |    |    | ✓  | Documents & Knowledge      |
|       5 | skill_dependency_fix              |     H      |    |    |    | ✓  | Documents & Knowledge      |
|       6 | email-writing                     |     E      |    |    |    |    | Communication & Email      |
|       7 | email-reply                       |     E      |    |    |    |    | Communication & Email      |
|       8 | flight-booking                    |     E      |    |    |    |    | E-commerce & Daily Svcs    |
|       9 | flight-seat-selection             |     M      | ✓  |    |    |    | E-commerce & Daily Svcs    |
|      10 | flight-seat-selection-failed      |     H      | ✓  |    | ✓  |    | E-commerce & Daily Svcs    |
|      11 | flight-cancel-claim               |     H      | ✓  |    | ✓  |    | E-commerce & Daily Svcs    |
|      12 | flight-info-change-notice         |     H      | ✓  |    | ✓  |    | Calendar & Task Mgmt       |
|      13 | baggage-tracking-application      |     M      |    |    | ✓  |    | E-commerce & Daily Svcs    |
|      14 | schedule-change-request           |     H      | ✓  |    |    |    | Calendar & Task Mgmt       |
|      15 | blog-site-from-scratch            |     H      |    |    |    |    | Coding & Software Dev      |
|      16 | blog-site-completion-from-starter |     M      |    | ✓  |    |    | Coding & Software Dev      |
|      17 | washer-shop                       |     E      |    |    |    |    | E-commerce & Daily Svcs    |
|      18 | watch-shop                        |     E      |    |    |    |    | E-commerce & Daily Svcs    |
|      19 | washer-change                     |     E      |    |    |    |    | E-commerce & Daily Svcs    |
|      20 | info-change                       |     E      |    |    |    |    | E-commerce & Daily Svcs    |
|      21 | email-watch-shop                  |     M      | ✓  |    |    |    | E-commerce & Daily Svcs    |
|      22 | email-washer-change               |     M      | ✓  |    |    |    | E-commerce & Daily Svcs    |
|      23 | vue-project-build-bug-fix-easy    |     E      |    | ✓  |    |    | DevOps & Env Repair        |
|      24 | vue-project-build-bug-fix-hard    |     H      |    | ✓  |    |    | DevOps & Env Repair        |
|      25 | noise-filtering                   |     M      |    | ✓  |    | ✓  | Deep Research & Report     |
|      26 | incremental-update-ctp            |     M      |    | ✓  |    | ✓  | Documents & Knowledge      |
|      27 | conflict-repair-acb               |     M      | ✓  | ✓  |    | ✓  | Documents & Knowledge      |
|      28 | mixed-tool-memory                 |     H      | ✓  |    |    | ✓  | Documents & Knowledge      |
|      29 | live-web-research-sqlite-fts5     |     H      | ✓  |    |    | ✓  | Deep Research & Report     |

---

## 2. Factor Summary Statistics

各因子在 29 个 case 中的覆盖情况：

| Factor | Description                    | Count | Percentage | Representative Cases                                          |
|--------|--------------------------------|------:|-----------:|---------------------------------------------------------------|
| A1     | Cross-Service Dependency       |    10 |      34.5% | flight-seat-selection, email-watch-shop, conflict-repair-acb  |
| A2     | Contaminated Initial State     |     6 |      20.7% | blog-site-completion-from-starter, vue-project-build-bug-fix-easy, noise-filtering |
| B1     | Implicit Goal Resolution       |     4 |      13.8% | flight-seat-selection-failed, flight-cancel-claim, flight-info-change-notice, baggage-tracking-application |
| B2     | Knowledge System Maintenance   |    11 |      37.9% | skill_creation, skill_dependency_fix, noise-filtering         |

因子组合分布：

- 无因子（baseline）：8 cases（27.6%）— email-writing, email-reply, flight-booking, blog-site-from-scratch, washer-shop, watch-shop, washer-change, info-change
- 单因子：13 cases（44.8%）
- 双因子：7 cases（24.1%）— flight-seat-selection-failed (A1+B1), flight-cancel-claim (A1+B1), flight-info-change-notice (A1+B1), noise-filtering (A2+B2), incremental-update-ctp (A2+B2), mixed-tool-memory (A1+B2), live-web-research-sqlite-fts5 (A1+B2)
- 三因��：1 case（3.4%）— conflict-repair-acb (A1+A2+B2)
- **多因子（≥2 factors）：8 cases（27.6%）**

> 注：无 case 同时携带全部四个因子，这反映了真实任务中复杂度来源的自然分布特征。

---

## 3. Domain × Factor Heatmap

各 primary domain 中因子的出现频��：

| Primary Domain             | A1 | A2 | B1 | B2 | Total Factor Instances |
|----------------------------|----|----|----|----|-----------------------:|
| Documents & Knowledge      |  2 |  2 |  0 |  9 |                     13 |
| Communication & Email      |  0 |  0 |  0 |  0 |                      0 |
| E-commerce & Daily Svcs    |  5 |  0 |  2 |  0 |                      7 |
| Calendar & Task Mgmt       |  2 |  0 |  1 |  0 |                      3 |
| Coding & Software Dev      |  0 |  1 |  0 |  0 |                      1 |
| DevOps & Env Repair        |  0 |  2 |  0 |  0 |                      2 |
| Deep Research & Report     |  1 |  1 |  0 |  2 |                      4 |

观察：

- **B2 高度集中在 Documents & Knowledge**（9/11），反映了知识管理任务的本质特征
- **A1 分布最广**，跨 4 个 domain，体现了跨服务协调的普遍性
- **B1 仅出现在 E-commerce 和 Calendar**，这些 domain 的任务更容易产生隐式目标
- **Communication & Email 无因子**，作为纯 baseline domain

---

## 4. Controlled Pairs

LiveClawBench 设计了 5 组对照实验，用于隔离单个因子对 agent 性能的影响：

- **Factor-addition pairs**：variant 在 base 的基础上增加一个新的 complexity factor
- **Intensity-gradient pairs**：两端共享同一因子，但强度/深度不同

| Pair ID | Controlled Pair                    | Base Case (Difficulty)              | Added Factor                | Variant Case (Difficulty)                |
|--------:|------------------------------------|-------------------------------------|-----------------------------|------------------------------------------|
|       1 | Shopping → Cross-env Shopping      | washer-shop (E)                     | +A1 (email integration)     | email-washer-change (M)                  |
|       2 | Shopping → Cross-env Shopping      | watch-shop (E)                      | +A1 (email integration)     | email-watch-shop (M)                     |
|       3 | Seat Selection → Failed Selection  | flight-seat-selection (M)           | +B1 (constraint failure)    | flight-seat-selection-failed (H)         |
|       4 | Vue Fix easy → hard                | vue-project-build-bug-fix-easy (E)  | +A2 (more complex faults)   | vue-project-build-bug-fix-hard (H)       |
|       5 | Skill Creation → Dependency Fix    | skill_creation (E)                  | +B2 (dependency chain)      | skill_dependency_fix (H)                 |

对照组设计说明：

- Pair 1–2 验证 A1（Cross-Service Dependency）的影响：在简单购物任务上叠加 email 通知环节，难度从 E 提升至 M
- Pair 3 验证 B1（Implicit Goal Resolution）的影响：座位选择任务在遇到约束冲突时需要 agent 自主判断回退策略，难度从 M 提升至 H
- Pair 4 为 intensity gradient：同类 bug fix 任务中，A2 因子的强度不同——easy 版本仅有简单 bug，hard 版本包含更复杂的故障链，从 E 跳至 H
- Pair 5 为 intensity gradient：从单一 skill 创建到依赖链修复，B2 因子的深度不同，知识管理的复杂度显著提升

---

## 5. Difficulty Distribution

29 个 case 的难度分布如下：

| Difficulty | Count | Percentage | Cases                                                                                                                                                                                                  |
|:----------:|------:|-----------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|   Easy     |    10 |      34.5% | skill_creation, skill_supplementation, email-writing, email-reply, flight-booking, washer-shop, watch-shop, washer-change, info-change, vue-project-build-bug-fix-easy |
|   Medium   |     9 |      31.0% | skill_conflict_resolvation, flight-seat-selection, baggage-tracking-application, blog-site-completion-from-starter, email-watch-shop, email-washer-change, noise-filtering, incremental-update-ctp, conflict-repair-acb |
|   Hard     |    10 |      34.5% | skill_repository_curation, skill_dependency_fix, flight-seat-selection-failed, flight-cancel-claim, flight-info-change-notice, schedule-change-request, blog-site-from-scratch, vue-project-build-bug-fix-hard, mixed-tool-memory, live-web-research-sqlite-fts5 |

难度与因子数量的关联：

| Difficulty | Avg Factor Count | Baseline (0 factors) | Single Factor | Multi-Factor |
|:----------:|:----------------:|:--------------------:|:-------------:|:------------:|
|   Easy     |             0.3  |          7           |       3       |       0      |
|   Medium   |             1.4  |          0           |       6       |       3      |
|   Hard     |             1.4  |          1           |       4       |       5      |

> 注：Easy case 中 baseline 占比 70%，而 Medium/Hard case 几乎全部携带至少一个因子。这验证了复杂度因子作为难度预测指标的有效性。Hard 中唯一的 baseline case（blog-site-from-scratch）其难度来源于任务本身的规模和开放性，而非结构性复杂度因子。
