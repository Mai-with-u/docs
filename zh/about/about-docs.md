---
title: 关于本文档
---

# 关于本文档

这里是 MaiBot 官方文档站，基于 VitePress 构建，中英双语（[简体中文](/) / [English](/en/)），由社区贡献者维护。

## 文档结构

`zh/` 是权威内容源，`en/` 是同结构镜像。

- **用户手册**（`manual/`）— 部署安装、接入平台、配置、插件安装、WebUI 操作，以及多实例、人设、聊天场景、文件功能、桌宠、内部聊天这些功能页
- **开发文档**（`develop/`）— 只讲怎么接入：适配器五篇、插件接入与开发、外接 Agent 连接
- **文档站协作**（`contributing/`）— 协作硬规则、风格指南与 Markdown 写作特性
- **常见问题**（`faq/`）— 按分类组织的 FAQ 和错误排查
- **更新日志**（`changelog/`）— 各版本的功能变化与修复记录
- **关于**（`about/`）— 项目介绍、交流群、致谢、EULA 与隐私条款

## 技术栈

- **VitePress** — 静态站点生成器，构建产物直接部署到 Cloudflare Pages
- **Mermaid** — 流程图与时序图
- **vitepress-plugin-group-icons** — 代码组标签的语言图标
- **vitepress-markdown-timeline** — 更新日志的时间线排版
- **Linkcard** — 外链卡片组件，按域名匹配本地矢量图标
- **vitepress-plugin-llms** — 生成 `llms.txt` 与 `llms-full.txt`，供 AI 读取整站

## 本地开发

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

:::

`pnpm docs:build` 会校验死链、容器配对与代码片段路径，并生成 `llms.txt`。提交 PR 前必须跑一次。

## 参与文档

- Fork 仓库，改完提交 PR
- 新增页面同时注册 `.vitepress/sidebar/zh.ts` 与 `en.ts`（英文链接带 `/en/` 前缀）；顶部导航只在需要时改 `config.mts`
- 同一个 PR 内同步 `en/` 镜像，术语、代码与文件名保持一致
- 页面下线或改路径时，在 `public/_redirects` 补一行 301

写作规范见[参与文档站](/contributing/)与[文档风格指南](/contributing/style-guide)，语法细节见[文档编写特性](/contributing/markdown-features)。
