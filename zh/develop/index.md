---
title: 开发总览
---

# 开发总览

麦麦的接入面只有两块：把麦麦接到一个聊天平台，或给麦麦加功能。两条路线都写 Python，都不需要改 MaiBot 源码。

<IntegrationRoutes />

## 路线一：把麦麦接到一个聊天平台

写一个 Adapter，把平台消息翻成麦麦的统一格式发进来，再把麦麦的回复翻回去。官方适配器（OneBot 适配器、QQ 官方机器人、Telegram、微信 ClawBot）都是这么做的，可以直接装；自研平台从[适配器接入](./adapters/index.md)开始。

**前置条件** — 平台侧有可用的收发接口（官方 SDK、OneBot 实现或私有协议库），能拿到消息事件、能调发送接口。

**产物** — 一个连上麦麦消息服务器的进程，或一个 `plugin_type = "adapter"` 的插件。

## 路线二：给麦麦加功能

写一个 Plugin，在插件目录里放 `_manifest.json` 和 `plugin.py` 就能被加载。加 Tool 让 LLM 调用、加 Command 响应斜杠命令、加 HookHandler 改写消息与回复、加 MessageGateway 收发消息、加 WebUI 页面扩展控制台。

**前置条件** — Python 3.10+ 与 `maibot-plugin-sdk`。

**产物** — 一个可热重载的插件目录，也可以打包提交到插件市场。

## 外接 Agent

麦麦可以把一部分工作交给支持 ACP 的外部 Agent（dsh 等），模型与会话由外部程序管理，见[外接 Agent 连接](./agent-connections.md)。

## 部署与使用

部署和配置麦麦不在本分区，见[用户手册](/manual/)；报错排查见[常见问题](/faq/)。
