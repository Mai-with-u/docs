---
title: 关于本文档
---

# 关于本文档

## 本文档是什么

这里是 MaiBot 官方文档站，基于 [VitePress](https://vitepress.dev/) 构建。从安装部署、配置、功能使用到插件和适配器开发，你需要的指南都在这里。文档支持中英双语（[简体中文](/) / [English](/en/)），由社区贡献者一起维护。

## 文档结构

文档按功能模块组织，zh/ 和 en/ 目录镜像同步：

- **用户手册** (`manual/`) — 部署安装（Windows/Linux/Docker/一键包）、接入平台（QQ 本地客户端、QQ 官方机器人、邮件、QQ 语音通话、iMessage）、Bot 与模型配置（含 MCP）、插件安装与管理、WebUI 管理操作
- **开发文档** (`develop/`) — 只讲「怎么接入」：适配器五篇（概览、消息协议、编写适配器、访问策略、排错）、插件接入、WebUI API 程序化对接、数据统计；模型与 MCP 的配置说明归用户手册的 `manual/configuration/`
- **插件开发** (`plugin/`) — 插件 Manifest、生命周期、配置、Tool/Command/Hook/Event 等组件开发、API 参考、发布流程
- **文档站协作** (`contributing/`) — 本仓库的协作硬规则、风格指南与 Markdown 写作特性
- **常见问题** (`faq/`) — 部署、配置、模型、插件、数据迁移等 FAQ；错误排查指南
- **更新日志** (`changelog/`) — 各版本更新记录
- **关于** (`about/`) — 关于本项目、关于本文档、交流群、致谢与链接、EULA、隐私条款

## 技术栈

本文档站使用的技术与插件：

- [VitePress](https://vitepress.dev/) — 基于 Vite 和 Vue 的静态网站生成器
- [Mermaid](https://mermaid.js.org/) — 通过 `vitepress-plugin-mermaid` 支持流程图、时序图等
- [vitepress-plugin-group-icons](https://vp.yuy1n.io/features.html) — 为代码组标签自动显示语言图标
- [vitepress-markdown-timeline](https://github.com/LittleFox94/vitepress-markdown-timeline) — 支持时间线
- Linkcard — 自定义链接卡片组件（已注册为全局组件 `<Linkcard>`，没指定 logo 时会自动显示链接图标）
- [xgplayer](https://h5player.bytedance.com/) — 视频播放器组件
- [vitepress-plugin-llms](https://github.com/AnYiEE/vitepress-plugin-llms) — 生成 llms.txt / llms-full.txt
- [@nolebase/vitepress-plugin-enhanced-readabilities](https://nolebase.ayaka.io/pages/zh-CN/integrations/vitepress-plugin-enhanced-readabilities/) — 增强阅读体验

## 本地开发

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 安装依赖
pnpm install

# 启动开发服务器
pnpm docs:dev

# 构建生产版本
pnpm docs:build

# 预览生产版本
pnpm docs:preview
```

:::

## 贡献方式

欢迎参与文档建设！你可以通过以下方式贡献：

- Fork 本仓库，修改或新增文档内容后提交 PR
- 新增页面时，把它同时注册到 `.vitepress/sidebar/zh.ts` 与 `.vitepress/sidebar/en.ts`（英文侧链接带 `/en/` 前缀）；只有顶部导航需要时才改 `.vitepress/config.mts`
- 同一个 PR 内同步 `en/` 镜像，术语、代码与文件名保持一致
- 提交前跑一次 `pnpm docs:build`，它会校验死链、容器配对与代码片段路径，并生成 llms.txt
- 页面下线或路径变更时，在 `public/_redirects` 补一行 301 指向新地址

详细的贡献流程可以参考本仓库 [README](https://github.com/Mai-with-u/docs) 的"贡献"部分；如果想参与 MaiBot 代码开发，请参阅贡献指南。

## 文档编写特性

本站除了 VitePress 原生功能，还配置了一些额外的 Markdown 插件和自定义组件。准备写文档的话，建议先看看 [文档编写特性](/contributing/markdown-features) 页，了解 Mermaid 图表、更新时间线、代码组图标、Linkcard 组件等特性的用法和约束。
