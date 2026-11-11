# AGENTS.md — MaiBot 文档站协作规范

本仓库是 MaiBot 官方文档站（VitePress 2）。`zh/` 是内容源（权威），`en/` 是同结构镜像。本地预览 `pnpm docs:dev`，构建 `pnpm docs:build`（PR 由 CI 强制构建检查）。

**语言分工**：正文一律中文；`develop/`（接入文档）面向开发者，技术名词（API、SDK、Token、Hook、Runner 等）直接写英文、不做中译；`manual/`、`faq/` 面向普通用户，尽量讲得通俗。

## 动手前必读

动任何文档前，先读这三个权威文件：

1. [`zh/contributing/index.md`](zh/contributing/index.md) — 协作硬规则（zh 先行 en 同步、导航注册、图片位置、提 PR 前必跑构建）
2. [`zh/contributing/markdown-features.md`](zh/contributing/markdown-features.md) — 语法层写法（code-group、图标、Mermaid、timeline、`::: endpoint` / `::: fields` / `::: steps` 容器、代码片段导入、组件）
3. [`zh/contributing/style-guide.md`](zh/contributing/style-guide.md) — 表达层写法（照搬 DeepSeek API 文档风格：一句话导语、H2 按任务切、参数用定义列表、收尾只放验证与排错）

## 硬规则

1. **zh 先行，en 同步** — 改 `zh/` 内容页，同 PR 内同步 `en/` 镜像（术语/代码/文件名同步，散文可重写）。`en/` 内的内部链接带 `/en/` 前缀，`zh/` 内不带
2. **新页面必须注册导航** — 改 `.vitepress/sidebar/zh.ts` 与 `en.ts`（en 链接带 `/en/` 前缀），必要时改 `.vitepress/config.mts` 顶部导航
3. **图片放 `public/images/`，正文以 `/images/` 引用**；头像/标题图放 `public/avatars/`、`public/title_img/`
4. **写法三禁**：
   - ❌ 内容页 Markdown 表格 → ✅ 定义列表（`**field** — 说明`）或 `::: fields` 容器；索引页（各目录 `index.md`）可用表格
   - ❌ 独立外链裸 `[text](url)` → ✅ `<Linkcard>` 链接卡片；句中内联引用可用普通链接
   - ❌ 裸语言 fence → ✅ `::: code-group` + 显式 `~vscode-icons:<id>~` 图标；纯文本块、`mermaid`/`mmd` 不包裹
5. **每张 `::: endpoint` 卡片自带收尾 `:::`** — 连续写多张卡片时，每张都要闭合，漏写构建直接失败

## 必须避免的废话措辞

1. **复述界面上肉眼可见的操作** — 「点击右上角按钮，弹出窗口后选第一项」不写，只写读者看不到的默认值、后果、前置条件
2. **版本变更注记** — 不写「1.4.0 起支持」「旧版本没有」「相比上个版本新增」；直接介绍当前版本的事实
3. **「不是 A，而是 B」/「A，不是非 A」** — 没有信息量的转折一律删
4. **空泛指令** — 「根据实际情况设置」「按需配置」不写，要么给具体值，要么说明取值依据

## 仓库地图

- **`.vitepress/`** — 站点配置
  - `config.mts` — 导航 + 插件注册 + `markdown.headers`（**必须保留**，VitePress 靠它填充「本页目录」；level 是精确层级列表，不是区间）
  - `sidebar/zh.ts` + `sidebar/en.ts` — 侧边栏
  - `markdown/containers.ts` — 自定义容器（`::: endpoint` / `::: fields` / `::: steps`），支持嵌套
  - `theme/` — 主题与组件（`Linkcard`、`HomeSections`、`IntegrationRoutes`），样式在 `theme/styles/`
- **`zh/`** — 中文文档（权威内容源）
  - `manual/` 用户手册：deployment、adapters、configuration、plugins、webui，以及功能页（多实例、人设、聊天场景、文件功能、桌宠、内部聊天）
  - `develop/` 接入文档（中文，技术名词用英文）：`adapters/`（适配器五篇）、`plugin/`（插件开发权威入口）、`agent-connections`；模型与 MCP 的配置说明归 `manual/configuration/`
  - `contributing/` 文档站协作规范（style-guide、markdown-features）
  - `changelog/` 更新日志、`faq/` 常见问题、`about/` 项目元信息与法律
  - `examples/` 被 `<<<` 导入的真实示例代码（不是页面，不要在里面放 `.md`）
- **`en/`** — 英文镜像，结构同 `zh/`，侧边栏链接带 `/en/` 前缀
- **`public/`** — 静态资源：`images/`、`title_img/`、`avatars/`、`installation-agent.md`（AI 安装指南，勿迁移）
- **`_redirects`** — 页面下线/改址后的 301 表，删页或改路径时必须同步补一行
- **`scripts/docs-quality.mjs`** — 文档质量检查：A 层机械一致性（zh/en 对称、页面骨架、链接锚点、容器配对、写法三禁、无孤儿页、可渲染）、B 层语义一致性（配置键、HTTP 路由、插件能力名对得上源码）、C 层信息项（重复锚点、未引用资源）。A/B 是门禁，C 只统计

## 验证

写进 CI 的两道关：

::: code-group

```bash [构建 ~vscode-icons:file-type-shell~]
pnpm docs:build
```

```bash [质量检查 ~vscode-icons:file-type-shell~]
MAIBOT_DIR=../MaiBot node scripts/docs-quality.mjs
```

:::

`pnpm docs:build` 校验死链、容器配对与代码片段路径，并生成 `llms.txt`（站点全文的 AI 可读入口）。质量脚本需要指向上游源码目录才能跑 B 层检查。
