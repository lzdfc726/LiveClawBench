# Coding & DevOps Cases

## Vue Project Build with Bug Fix (2 cases)

case 名称: vue-project-build-bug-fix (easy / hard)

描述: OpenClaw 构建 GitHub 上的开源 Vue 项目仓库，构建过程需要解决软件依赖的版本冲突问题，构建成功后打开浏览器并在网页上找到固定信息写入文件。

难度: 一个仓库衍生出两道题：
- **vue-project-build-bug-fix-easy (E)**: 较轻量的依赖冲突，agent 人工注入较轻量错误
- **vue-project-build-bug-fix-hard (H)**: 更复杂的依赖与版本冲突，agent 人工注入更复杂错误

合成方法: 以开源 Vue 仓库为基础，通过 agent 人工注入不同复杂度的错误合成 easy/hard 任务。评价 agent 完成构建、依赖修复、运行验证与结果提取写回的能力。

涉及环境: DevOps + Coding + Browser

---

## Blog Site (2 cases)

### blog-site-from-scratch (H)

描述: 从零搭建博客网站：指定 Astro 做前端、Node.js 做后端、SQLite 数据库；支持普通用户、编辑、管理员三种角色；支持发帖、关键词搜索、Markdown 渲染、邮箱注册登录、个人 dashboard 查看自己的 post；编辑可删帖，管理员可任命编辑，所有界面支持相互跳转。

### blog-site-completion-from-starter (M)

描述: 从一个博客代码库雏形出发，实现上述完整博客功能。

合成方法: 用 GLM-5 vibe coding + 人类测试反馈构建完整仓库，据此构建测试样例，再删除全部或部分代码。评价 agent 在指定技术栈下进行全栈系统设计、实现、联调与角色权限管理的能力。
