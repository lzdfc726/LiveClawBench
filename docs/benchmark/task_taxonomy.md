# Task Domains (§3.2)

本文档定义 LiveClawBench 的 15 个任务领域及其覆盖状态。

---

## 15 Domain 全景表

LiveClawBench 定义了 15 个 task domain，覆盖 LLM agent 在开放世界中的主要应用场景。当前 29 个 case 主要覆盖其中 7 个 domain，其余 domain 列入 roadmap，计划在扩展至 100 cases 时补全。

| # | Domain | Description | Coverage | Cases |
|---|--------|-------------|----------|-------|
| 1 | Documents & Knowledge | 知识库构建、文档组织、knowledge graph building | ✓ primary | 9 |
| 2 | Deep Research & Report | 多步推理、长文报告生成、multi-source synthesis | ✓ primary | 2 |
| 3 | Communication & Email | 邮件处理、消息管理、跨平台通信 | ✓ primary | 2 |
| 4 | Social Media Operations | 内容发布、数据分析、广告投放优化 | roadmap | 0 |
| 5 | Calendar & Task Mgmt | 日程协调、任务分解、daily briefing 生成 | ✓ primary | 2 |
| 6 | Coding & Software Dev | 代码生成/审查、PR 管理、项目开发 | ✓ primary | 2 |
| 7 | DevOps & Env Repair | 部署、CI/CD、故障诊断、环境恢复 | ✓ primary | 2 |
| 8 | Browser & Web Scraping | Web 交互、数据抽取、anti-detection browsing | ✓ secondary | 0 standalone |
| 9 | E-commerce & Daily Svcs | 下单、比价、旅行规划、售后处理 | ✓ primary | 10 |
| 10 | Finance & Data Analytics | 交易策略、记账、dashboard、数据分析 | ✓ secondary | 0 standalone |
| 11 | Multimedia Creation | 图像/视频/动画/演示文稿的生成与编辑 | roadmap | 0 |
| 12 | Voice & Multimodal | 语音识别、TTS、电话交互、transcription | ✓ secondary | 0 standalone |
| 13 | Security & Privacy | 安全扫描、入侵检测、密钥管理 | roadmap | 0 |
| 14 | Smart Home & IoT | 设备控制、健康追踪、meal planning | roadmap | 0 |
| 15 | Information Aggregation | 多源检索、过滤、structured summarization | roadmap | 0 |

---

## Coverage 说明

**Primary vs Secondary：**

- **primary** — 该 domain 有独立的 standalone case，是 case 的主要任务领域
- **secondary** — 该 domain 出现在 multi-domain case 中作为辅助环节，但没有独立 case。例如 Browser & Web Scraping 在 Deep Research 类 case 中作为数据采集手段出现

**当前覆盖率：**

- 7 个 domain 有 primary 覆盖，3 个有 secondary 覆盖
- 5 个 domain 在 roadmap 中（33%），计划在扩展至 100 cases 时补全
- 29 个 case 的 domain 分布集中在 Documents & Knowledge（9）和 E-commerce & Daily Svcs（10），两者合计占 66%

---

## Multi-Domain Cases

许多 case 横跨多个 domain，这在 `cases_registry.csv` 的 `domains_multi` 列中记录。

典型的 multi-domain 组合：

| Case | Primary Domain | Secondary Domains |
|------|---------------|-------------------|
| flight-info-change-notice | Calendar & Task Mgmt | Communication & Email, E-commerce & Daily Svcs |
| live-web-research-sqlite-fts5 | Deep Research & Report | Browser & Web Scraping, Finance & Data Analytics |

Multi-domain case 的存在使得 secondary domain 虽无 standalone case，但其相关能力仍在 benchmark 中得到间接评估。这也是 LiveClawBench "开放世界"特性的体现——真实任务天然跨越多个领域边界。
