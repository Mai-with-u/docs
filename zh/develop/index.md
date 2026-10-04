---
title: 开发指南
---

# 开发指南

本节面向部署运维与高级使用者——把 MaiBot 跑稳、排查问题、扩展对接、作数据归档与自动化。

::: tip 技术栈
MaiBot 采用 Python 3.12+ / FastAPI / SQLModel / structlog / Pydantic + TOML 热重载，通过 `uv` 管理依赖。完整项目结构与技术选型见 [配置系统](./configuration.md)。
:::

## 文档索引

- **数据库** — SQLite + SQLModel 22 张表：连接与会话、PRAGMA 调优、数据归档与排查。（运维）
- **配置系统** — 两份 TOML（bot_config + model_config）的版本链、热重载机制、升级钩子与旧版迁移。（运维 / 高级使用者）
- **消息服务器** — WebSocket 消息服务器如何让外部适配器（NapCat、SnowLuma、QQ 官方、邮件等）接入 MaiBot：认证、消息流向与部署要点。（运维）
- **LLM 模型集成** — APIProvider / ModelInfo / ModelTaskConfig 三概念驱动的 LLM 接入链路，配置即连。（高级使用者）
- **MCP 集成与外部工具接入** — MCP 客户端集成：三种 transport 选型、工具注册、命名冲突处理与调试。（高级使用者）
- **WebUI HTTP API 入口** — 子目录 6 篇：FastAPI 后端 HTTP / WebSocket API 总览，含认证、路由组与场景跳转。（运维 / 高级使用者）
- **日志与观测** — structlog 三条并行输出通道（文件 / 控制台 / WebUI）：日志调优、第三方降噪、LLM 请求快照抓取与线上排查。（运维）
- **数据导入导出** — 小时粒度聚合表、实时仪表盘查询、异步导出 zip 包三条数据消费路径。（运维 / 高级使用者）
- **事件与钩子** — EventBus 与命名 Hook 双事件系统的协同机制：拦截型 / 非拦截型处理器、插件桥接与排查视角。（高级使用者 / 插件底层）
- **运行时架构** — Host / Runner 双进程 IPC 架构的内部机制：msgpack 编解码、热重载与故障隔离。面向运维排查，非插件开发。（插件底层）

## 路线图

- 把 bot 跑在 VPS → [配置系统](./configuration.md) → [消息服务器](./message-server-and-adapters.md) → [日志与观测](./observability.md)
- 写 WebUI 自动化面板 → [WebUI HTTP API 入口](./webui-api/) → [数据导入导出](./statistics-io.md)
- 对接外部聊天平台 → [消息服务器](./message-server-and-adapters.md) → [事件与钩子](./event-pipeline-hooks.md)
- 接 MCP Server → [配置系统](./configuration.md) → [MCP 集成与外部工具接入](./mcp-integration.md)
- 导出 / 迁移数据 → [数据库](./database.md) → [数据导入导出](./statistics-io.md)

## 扩展与贡献

- 如需写插件，请前往 [插件开发文档](/plugin/)，那里覆盖 Manifest、生命周期、组件注册等面向开发者的内容。
- 如需向 MaiBot 源码贡献代码，请查阅 [GitHub 仓库的贡献指南](https://github.com/Mai-with-u/MaiBot/blob/main/docs/CONTRIBUTE.md)。本仓库原有 `contributing.md` 已不再维护，以 GitHub 仓库为准。
