# AGENTS.md — MaiBot 文档站协作规范

本仓库是 MaiBot 官方文档站（VitePress）。`zh/` 是内容源（权威），`en/` 是翻译镜像。本地预览 `pnpm docs:dev`，构建 `pnpm docs:build`（PR 由 CI 强制构建检查）。

## 动手前必读

动任何文档前，先读这两个权威文件：

1. [`zh/develop/markdown-features.md`](zh/develop/markdown-features.md) — 语法层写法（code-group、图标、Mermaid、timeline、组件）
2. [`zh/develop/style-guide.md`](zh/develop/style-guide.md) — 表达层写法（先结论、步骤可照做、排错收尾）

## 硬规则

1. **zh 先行，en 同步** — 改 `zh/` 内容页，同 PR 内同步 `en/` 镜像（术语/代码/文件名同步，散文可重写）
2. **新页面必须注册导航** — 改 `.vitepress/sidebar/zh.ts` 与 `en.ts`（en 链接带 `/en/` 前缀），必要时改 `.vitepress/config.mts` 顶部导航
3. **图片放 `public/images/`，正文以 `/images/` 引用**；头像/标题图放 `public/avatars/`、`public/title_img/`
4. **写法三禁**：
   - ❌ 内容页 Markdown 表格 → ✅ 定义列表（`**field** — 说明`）；索引页（各目录 `index.md`）可用表格
   - ❌ 独立外链裸 `[text](url)` → ✅ `<Linkcard>` 链接卡片；句中内联引用可用普通链接
   - ❌ 裸语言 fence → ✅ `::: code-group` + 显式 `~vscode-icons:<id>~` 图标；纯文本块、`mermaid`/`mmd` 不包裹

## 仓库地图

- **`.vitepress/`** — 站点配置：`config.mts`（导航/插件）、`sidebar/zh.ts` + `sidebar/en.ts`（侧边栏）、`theme/`（主题与组件）
- **`zh/`** — 中文文档（权威内容源）
  - `manual/` 用户手册：deployment、adapters、configuration、plugins、webui
  - `develop/` 开发文档：进阶专题 + `webui-api/` + 写作规范（style-guide、markdown-features）
  - `plugin/` 插件开发文档（权威统一入口）
  - `changelog/` 更新日志、`faq/` 常见问题、`about/` 项目元信息与法律
- **`en/`** — 英文镜像，结构同 `zh/`，侧边栏链接带 `/en/` 前缀
- **`public/`** — 静态资源：`images/`、`title_img/`、`avatars/`、`installation-agent.md`（AI 安装指南，勿迁移）

## 验证

`pnpm docs:build` 通过即可；构建同时生成 `llms.txt`（站点全文的 AI 可读入口）。
