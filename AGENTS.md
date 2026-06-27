
## 根目录文件
| 文件 | 说明 |
|------|------|
| `index.md` | VitePress 首页/Hero page，展示 MaiBot 简介和导航入口 |
| `README.md` | 项目说明，介绍文档仓库用途、本地开发方法和贡献指南 |
| `_redirects` | 单页应用路由重定向配置（所有路径重定向到 /index.html） |
| `.gitignore` | Git 忽略规则（node_modules, dist, .vitepress/cache 等） |
| `package.json` | Node.js 项目配置（VitePress + Mermaid + Tabs 插件） |
| `pnpm-lock.yaml` | pnpm 依赖锁定文件 |
| `LICENSE` | 开源许可证文件 |

## 文件夹结构详述

### `.vitepress/` — VitePress 站点配置

| 文件/文件夹 | 说明 |
|-------------|------|
| `config.mts` | VitePress 核心配置：导航栏、侧边栏、多语言（中文/English）、搜索、markdown 插件（Mermaid, Tabs）、社交链接 |
| `theme/` | 自定义主题目录 |
| `theme/index.ts` | 主题入口 |
| `theme/style.css` | 自定义样式 |

### `manual/` — 用户手册（简体中文）

| 文件/文件夹 | 说明 |
|-------------|------|
| `index.md` | 用户手册总览 |
| `deployment/` | 部署与安装指南（部署概览、源码安装、Docker、适配器安装） |
| `adapters/` | 平台适配器文档（NapCat QQ连接、GoCQ 适配器） |
| `configuration/` | 配置说明（Bot 配置、模型配置） |
| `features/` | 功能详解（消息管线、Maisaka推理引擎、记忆系统、学习系统、表情包系统、MCP集成） |
| `webui/` | WebUI 管理文档（配置管理、记忆管理、插件管理、聊天统计） |
| `faq/` | 常见问题与故障排除 |
| `getting-started/` | 快速入门指南 |

### `develop/` — 开发文档（简体中文）

| 文件/文件夹 | 说明 |
|-------------|------|
| `index.md` | 开发指南总览（技术栈、项目结构、环境搭建） |
| `architecture.md` | 架构设计总览 |
| `contributing.md` | 贡献指南 |
| `architecture/` | 架构详解（消息管线、Maisaka推理引擎、记忆系统、WebUI内部机制） |
| `plugin-dev/` | 插件开发文档（Manifest、生命周期、Tool、Command、Hook、事件处理、API组件、消息网关、Action、配置、API参考） |
| `adapter-dev/` | 适配器开发文档（PlatformIO 驱动） |

### `features/` — 功能介绍页

| 文件/文件夹 | 说明 |
|-------------|------|
| 各功能页面 | 首页特性卡片展示内容 |

### `changelog/` — 更新日志

| 文件/文件夹 | 说明 |
|-------------|------|
| 各版本日志 | 记录每个版本的更新内容 |

### `community/` — 社区页面

| 文件/文件夹 | 说明 |
|-------------|------|
| 各社区页面 | QQ群、GitHub链接、社交媒体、衍生项目 |

### `en/` — 英文版文档

en/ 目录下的结构与中文版完全镜像，包含 manual/（用户手册）、develop/（开发文档）、features/（功能介绍）、changelog/（更新日志）、community/（社区页面）等子目录。

> ⚠️ **注意**：en/ 英文文档是通过翻译中文内容得来，应最大程度与中文内容保持同步。

### `public/` — 静态资源

| 文件/文件夹 | 说明 |
|-------------|------|
| `images/` | 文档图片（截图、示意图） |
| `title_img/` | 首页标题图片 |
| `avatars/` | 头像/角色图片 |

### `.sisyphus/` — 内部工作流记录

> ⚠️ 注意：此文件夹为内部工作流记录，请勿手动编辑

## 文档写作约定

- **不要在内容页中使用 Markdown 表格**。Markdown 表格在 VitePress 中渲染效果差（移动端不友好、列宽不可控），仅 `index.md` 页面允许使用表格。内容页请用定义列表替代，例如 `**`field`** — 说明。默认 X`
- **中文文档和英文文档必须同步更新**。修改中文文档时，必须同步修改 `en/` 下对应英文文档；修改英文文档时，也要同步检查并更新对应中文文档。中英文内容应表达同一信息，避免只更新单侧文档。
