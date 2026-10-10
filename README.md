# MaiBot 文档

本仓库为 MaiBot 的官方文档。MaiBot 是一个智能聊天机器人，专为 QQ 群设计，具有基于 LLM 的对话能力、记忆系统和情感表达功能。

## 关于文档

此文档站点使用 [VitePress](https://vitepress.dev/) 构建。`zh/` 是内容源（权威），`en/` 是翻译镜像，两个目录结构一一对应；`en/` 内的站内链接带 `/en/` 前缀，`zh/` 内不带。

本地预览 `pnpm docs:dev`，构建 `pnpm docs:build`（PR 由 CI 强制跑构建检查）。完整协作规范见 [AGENTS.md](./AGENTS.md) 与 [文档站协作规范](./zh/contributing/index.md)。

## 文档部分

### 文档目录

- **用户手册**（`zh/manual/`）
    部署安装（Windows / Linux / Docker / 一键包）、接入平台（QQ 本地客户端 / QQ 官方机器人 / 邮件 / QQ 语音通话 / iMessage）、Bot 与模型配置（含 MCP）、插件安装与管理、WebUI 管理操作。

- **开发文档**（`zh/develop/`）
    只讲「怎么接入」：适配器（概览 / 消息协议 / 编写适配器 / 访问策略 / 排错）、插件接入、WebUI API 程序化对接、数据统计。模型与 MCP 的配置说明在用户手册 `zh/manual/configuration/`，不在开发文档里。

- **插件开发**（`zh/plugin/`）
    插件开发的权威入口：Manifest、生命周期、配置、Tool / Command / Hook / Event 等组件、API 参考与发布流程。

- **文档站协作**（`zh/contributing/`）
    协作硬规则、风格指南与 Markdown 写作特性。

- **常见问题与故障排除**（`zh/faq/`）
    部署、配置、模型、插件、数据迁移等常见问题，以及错误排查指南。

- **更新日志与项目信息**
    各版本更新记录见 `zh/changelog/`，项目元信息与法律条款见 `zh/about/`。

## 仓库结构

- `.vitepress/` — 站点配置：`config.mts`（顶部导航、插件注册）、`sidebar/zh.ts` 与 `sidebar/en.ts`（侧边栏）、`theme/`（主题与组件）、`markdown/`（自定义容器）
- `zh/` `en/` — 中文内容源与英文镜像，目录结构一一对应
- `public/` — 静态资源：`images/`、`title_img/`、`avatars/`、`installation-agent.md`（AI 安装指南，勿迁移）
- `public/_redirects` — 页面下线或改址后的 301 表
- `zh/examples/` — 被 `<<<` 导入的真实示例代码（不是页面，不要往里放 `.md`）
- `scripts/docs-quality.mjs` — 文档质量检查脚本（只读，不修改任何文件）

## 本地开发

需要 Node.js 与 pnpm：

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm docs:dev

# 构建生产版本（同时校验死链、容器配对与代码片段路径，并生成 llms.txt）
pnpm docs:build

# 预览生产版本
pnpm docs:preview

# 文档质量检查（可选；A/B 层是门禁项，C 层只统计不阻断）
node scripts/docs-quality.mjs
```

## 贡献

提 PR 前请先读 [AGENTS.md](./AGENTS.md) 与 [文档站协作规范](./zh/contributing/index.md)。下面几条硬规则会被 review 与 CI 检查：

1. **zh 先行，en 同步** — 改了 `zh/` 内容页，同一个 PR 内必须同步 `en/` 镜像；术语、代码与文件名保持一致，散文可重写。
2. **新页面必须注册导航** — 同时改 `.vitepress/sidebar/zh.ts` 与 `.vitepress/sidebar/en.ts`（英文侧链接带 `/en/` 前缀）；只有必要时才改 `.vitepress/config.mts` 的顶部导航。
3. **图片放 `public/images/`** — 正文用 `/images/xxx.png` 引用；头像与标题图分别放 `public/avatars/`、`public/title_img/`。
4. **写法三禁** — 内容页不用 Markdown 表格（改用定义列表或 `::: fields`）；独立外链不用裸链接（改用 `<Linkcard>`）；独立代码块不裸写（包进 `::: code-group` 并显式给 `~vscode-icons:...~` 图标）。
5. **提交前必须跑构建** — `pnpm docs:build` 通过才算完成，它同时校验死链、容器配对与代码片段导入路径。
6. **删页或改路径要补 301** — 在 `public/_redirects` 加一行指向新地址的映射（英文侧同时补 `/en/` 那条）。

### 完整方式

Fork 本仓库，修改或新增文档后提交 PR。新增页面时按上面的硬规则注册侧边栏并同步英文镜像。

### 懒人方式

Fork 后把你写的文档放在仓库根目录并提交 PR，说明想放置的目录位置；PR 通过后，我们会手动帮你放置文件并配置目录与导航。
