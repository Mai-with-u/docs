# AGENTS.md — MaiBot 文档站协作规范

本仓库是 MaiBot 官方文档站（VitePress）。`zh/` 是内容源（权威），`en/` 是翻译镜像。本地预览 `pnpm docs:dev`，构建 `pnpm docs:build`（PR 由 CI 强制构建检查）。

**语言分工**：正文一律中文；`develop/`（接入文档）面向开发者，技术名词（API、SDK、Token、Hook、Runner 等）直接写英文、不做中译；`manual/`、`faq/` 面向普通用户，尽量讲得通俗。

## 动手前必读

动任何文档前，先读这三个权威文件：

1. [`zh/contributing/index.md`](zh/contributing/index.md) — 协作硬规则（zh 先行 en 同步、导航注册、图片位置、提 PR 前必跑构建）
2. [`zh/contributing/markdown-features.md`](zh/contributing/markdown-features.md) — 语法层写法（code-group、图标、Mermaid、timeline、`::: endpoint` / `::: fields` / `::: steps` 容器、代码片段导入、组件）
3. [`zh/contributing/style-guide.md`](zh/contributing/style-guide.md) — 表达层写法（先结论、步骤可照做、排错收尾）

## 硬规则

1. **zh 先行，en 同步** — 改 `zh/` 内容页，同 PR 内同步 `en/` 镜像（术语/代码/文件名同步，散文可重写）。`en/` 内的内部链接带 `/en/` 前缀，`zh/` 内不带
2. **新页面必须注册导航** — 改 `.vitepress/sidebar/zh.ts` 与 `en.ts`（en 链接带 `/en/` 前缀），必要时改 `.vitepress/config.mts` 顶部导航
3. **图片放 `public/images/`，正文以 `/images/` 引用**；头像/标题图放 `public/avatars/`、`public/title_img/`
4. **写法三禁**：
   - ❌ 内容页 Markdown 表格 → ✅ 定义列表（`**field** — 说明`）或 `::: fields` 容器；索引页（各目录 `index.md`）可用表格
   - ❌ 独立外链裸 `[text](url)` → ✅ `<Linkcard>` 链接卡片；句中内联引用可用普通链接
   - ❌ 裸语言 fence → ✅ `::: code-group` + 显式 `~vscode-icons:<id>~` 图标；纯文本块、`mermaid`/`mmd` 不包裹

## 必须避免的的废话语言措辞风格
请一定要避免以下的措辞：
1.介绍某一个功能，把具体的操作细节都讲了，但是这种细节明明可以通过视觉或者文本直观理解（不必要的说明）
2.介绍某个功能或接口，然后在后面补充 1.x 版本 变更/新增/删除了xxxxx （不必要的变更说明，应当直接介绍最新版本不加任何额外描述）
3.不是 A ，而是 B(与A相反的内容，其实并没有增加任何信息量）
或者
A ，不是 非A 这种句式
虽然使用了转折或者承接，但没有任何信息量


## 仓库地图

- **`.vitepress/`** — 站点配置
  - `config.mts` — 导航 + 插件注册 + `markdown.headers`（**必须保留**，VitePress 靠它填充「本页目录」；level 是精确层级列表，不是区间）
  - `sidebar/zh.ts` + `sidebar/en.ts` — 侧边栏
  - `markdown/containers.ts` — 自定义容器（`::: endpoint` / `::: fields` / `::: steps`），支持嵌套
  - `theme/` — 主题与组件（`IntegrationRoutes` 等），样式在 `theme/styles/`
- **`zh/`** — 中文文档（权威内容源）
  - `manual/` 用户手册：deployment、adapters、configuration、plugins、webui
  - `develop/` 接入文档（中文，技术名词用英文）：`adapters/`（适配器五篇）、plugin、`webui-api/`、statistics-io；模型与 MCP 的配置说明归 `manual/configuration/`
  - `plugin/` 插件开发文档（权威统一入口）
  - `contributing/` 文档站协作规范（style-guide、markdown-features）
  - `changelog/` 更新日志、`faq/` 常见问题、`about/` 项目元信息与法律
  - `examples/` 被 `<<<` 导入的真实示例代码（不是页面，不要在里面放 `.md`）
- **`en/`** — 英文镜像，结构同 `zh/`，侧边栏链接带 `/en/` 前缀
- **`public/`** — 静态资源：`images/`、`title_img/`、`avatars/`、`installation-agent.md`（AI 安装指南，勿迁移）
- **`_redirects`** — 页面下线/改址后的 301 表，删页或改路径时必须同步补一行

## 验证

`pnpm docs:build` 通过即可：它同时校验死链、容器配对与代码片段路径，并生成 `llms.txt`（站点全文的 AI 可读入口）。
