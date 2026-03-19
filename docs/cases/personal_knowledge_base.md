1. 噪声过滤｜描述：在可靠 paper/article/transcript 之外混入 blog/forum/memo/note 等低可信内容，要求把某个概念的有效结论和夸张说法拆开。｜难度：中等。单环境，但需要长步数判断 source 可信度。｜合成方法和思考：这类题专门针对 OpenClaw 在"可检索不等于可信"的场景下的表现，要求 agent 不只是会找信息，还要会降权、解释为什么降权，并避免把噪声写进 durable state，对应真实用户整理技术资料、论坛经验和营销稿混杂时的工作流。

2. 增量更新（CTP）｜描述：已有旧笔记部分正确、部分过时，需要基于新 addendum 和 talk 对 Context Thread Packing 做局部修订，而不是整段重写。｜难度：中等。单环境长步数，重点在"保留正确部分 + 精准更新错误部分"。｜合成方法和思考：这题直接对齐 OpenClaw 的长期工作区维护场景，考 agent 能不能把"什么还成立、什么已不泛化"写清楚；真实用户场景就是维护个人研究笔记或团队知识库时的 delta update，而不是每次都 full rewrite。

3. 冲突修复（ACB）｜描述：旧 durable note 里有明显错误，需要结合本地材料和 internal browser portal，把 Adaptive Cache Bridging 的关键机制与错误 shorthand 区分开。｜难度：中等。多环境但步数不算特别长。｜合成方法和思考：设计上把"本地资料可发现冲突、浏览器补足裁决证据"拆成两段，利用 OpenClaw 的受控 browser 工具链考查 agent 何时该继续检索、何时该修 memory，不是简单再写一份新 summary；这也很像真实团队在旧知识污染后做定点修复的任务。

4. 混合工具记忆 | 描述：不仅要整理 Delta-backed Planning Windows 的结论，还要从本地资料和 browser portal 中补全安全约束，并把结果落成可查询的本地 SQLite DB。｜难度：难。多环境、多步数，还要求结构化产物。｜合成方法和思考：这是比较典型的 OpenClaw 框架特异性 case，核心不是"找到答案"，而是把答案转成下一轮可复用的 state，包括 workspace/ durable notes、workspace/db/ 本地库和 result.json 的 follow-up 问答；非常贴近用户希望 agent 先研究、再沉淀、以后还能查的真实需求。

5. 实时网页研究与本地知识库构建（SQLite FTS5）｜描述：使用 OpenClaw live browser 浏览 pinned docs 和 YouTube 视频，整理 SQLite FTS5 quick reference，并构建本地 SQLite reference DB 回答后续问题。｜难度：难。多环境、多步数，且包含真实 web 交互。｜合成方法和思考：这题直接覆盖 OpenClaw 最有代表性的能力链路：真实浏览器访问、跨网页/视频取证、写回 durable workspace、再把结果结构化进本地 DB 供后续查询；用户场景非常直接，就是"帮我做一轮带工具的 research，并把结果沉淀成以后还能继续用的个人知识底座"。
