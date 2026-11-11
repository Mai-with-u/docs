# MaiBot 文档

MaiBot（麦麦）官方文档站。站点基于 VitePress 构建，`zh/` 是权威内容源，`en/` 是同结构镜像。

本地预览 `pnpm docs:dev`，构建 `pnpm docs:build`（PR 由 CI 强制跑构建检查）。协作规范见 [AGENTS.md](./AGENTS.md) 与[文档站协作规范](./zh/contributing/index.md)。

## 内容分区

- **用户手册**（`zh/manual/`）— 部署安装、接入平台、配置、插件安装、WebUI 操作，以及多实例、人设、聊天场景、文件功能、桌宠、内部聊天等功能页
- **开发文档**（`zh/develop/`）— 只讲怎么接入：适配器五篇、插件接入与开发、外接 Agent 连接。模型与 MCP 的配置说明在用户手册 `zh/manual/configuration/`
- **文档站协作**（`zh/contributing/`）— 协作硬规则、风格指南与 Markdown 写作特性
- **常见问题**（`zh/faq/`）— 按分类组织的 FAQ 与错误排查
- **更新日志**（`zh/changelog/`）— 各版本的功能变化与修复记录
- **关于**（`zh/about/`）— 项目介绍、交流群、致谢、EULA 与隐私条款

## 仓库结构

- `.vitepress/` — 站点配置：`config.mts`（顶部导航、插件注册）、`sidebar/`（侧边栏）、`theme/`（主题与组件）、`markdown/`（自定义容器）
- `zh/` `en/` — 中文内容源与英文镜像，目录结构一一对应
- `public/` — 静态资源：`images/`、`title_img/`、`avatars/`、`installation-agent.md`（AI 安装指南，勿迁移）
- `public/_redirects` — 页面下线或改址后的 301 表
- `zh/examples/` — 被 `<<<` 导入的真实示例代码（不是页面，不要往里放 `.md`）
- `scripts/docs-quality.mjs` — 文档质量检查脚本（只读）

## 本地开发

需要 Node.js 22+ 与 pnpm：

::: code-group

```bash [安装依赖 ~vscode-icons:file-type-pnpm~]
pnpm install
```

```bash [本地预览 ~vscode-icons:file-type-shell~]
pnpm docs:dev
```

```bash [构建 ~vscode-icons:file-type-shell~]
pnpm docs:build
```

```bash [质量检查 ~vscode-icons:file-type-shell~]
node scripts/docs-quality.mjs
```

:::

`pnpm docs:build` 会校验死链、容器配对与代码片段路径，并生成 `llms.txt`。质量脚本的 A/B 层是门禁项，C 层只统计不阻断。

## Cloudflare 自动部署

站点发布到 `https://docs.maibot.chat`，Worker 名称为 `maibot-docs`。根目录的 `wrangler.json` 指定静态资源目录 `.vitepress/dist`、自定义域名与 404 处理方式。

在 Cloudflare 的 **Workers & Pages → maibot-docs → Settings → Builds → Connect** 中连接 `Mai-with-u/docs`：

- 生产分支：`main`
- 根目录：`/`
- 构建命令：`pnpm docs:build`
- 部署命令：`npx wrangler deploy`
- 构建环境变量：`NODE_VERSION=24`、`PNPM_VERSION=10.30.3`

连接完成且配置提交到 `main` 后，后续推送自动构建并发布。`.node-version` 与 `package.json` 的 `packageManager` 同时记录工具版本。

## 贡献

提 PR 前先读 [AGENTS.md](./AGENTS.md) 与[文档站协作规范](./zh/contributing/index.md)。以下规则由 review 与 CI 检查：

1. **zh 先行，en 同步** — 改了 `zh/` 内容页，同一个 PR 内同步 `en/` 镜像；术语、代码与文件名保持一致，散文可重写。
2. **新页面必须注册导航** — 同时改 `.vitepress/sidebar/zh.ts` 与 `en.ts`（英文链接带 `/en/` 前缀）；只有顶部导航需要时才改 `config.mts`。
3. **图片放 `public/images/`** — 正文用 `/images/xxx.png` 引用；头像与标题图放 `public/avatars/`、`public/title_img/`。
4. **写法三禁** — 内容页不用 Markdown 表格（改用 `::: fields` 或定义列表）；独立外链不用裸链接（改用 `<Linkcard>`）；独立代码块不裸写（包进 `::: code-group` 并显式给 `~vscode-icons:...~` 图标）。
5. **提交前跑构建** — `pnpm docs:build` 通过才算完成。
6. **删页或改路径补 301** — 在 `public/_redirects` 加映射（英文侧同时补 `/en/` 那条）。

### 完整方式

Fork 本仓库，改完提交 PR。新增页面时按上面的规则注册侧边栏并同步英文镜像。

### 懒人方式

Fork 后把文档放在仓库根目录提交 PR，说明想放置的目录；PR 通过后由维护者放置文件并配置导航。
