---
title: 基础使用
---

# 基础使用

这页解决入门疑问：要不要付费、选哪个模型、能跑几只、支持哪些平台、第一次上手先做什么。

## MaiBot 需要付费吗？

MaiBot 本体开源免费。实际运行要调用 LLM、视觉模型或 embedding 服务，费用由服务商决定。

开销主要看聊天频率、上下文长度、开启的功能和模型价格。降频率、换便宜模型、关掉暂时不用的功能即可压下来。

## 应该选什么模型？

按任务选，不按型号榜单选：

- **Planner** — 要有可靠的推理和工具调用能力，直接决定麦麦什么时候说话、调哪个工具。
- **Replyer** — 决定最终回复的文字质量，选语言表现符合你口味的。
- **视觉模型** — 必须支持图片输入，用于看图说话和表情包识别。
- **Embedding** — 长期记忆的语义检索依赖它，不可用则记忆搜索失效。

具体分工和写法见[模型配置](../manual/configuration/model-config.md)。

## 一个 MaiBot 能同时跑多只麦麦吗？

能。工作区里可以登记多个 Bot，每个 Bot 独立进程、独立目录，配置、数据、插件互不影响，WebUI 共用一个入口和登录。

新建、启动、停止都在 WebUI 的 Bot 管理页完成，也可以用命令行：

::: code-group

```bash [多实例 ~vscode-icons:file-type-shell~]
maibot host list --directory <工作区>                       # 列出已登记的 Bot
maibot host create-bot --directory <工作区> --name 工作助手   # 新建一个 Bot
maibot host start --directory <工作区> --bot-id <bot_id>    # 启动并记为期望运行
```

:::

注意三点：所有 Bot 共用一个 Python 环境；克隆出来的 Bot 会连到同一个平台账号，启动前必须改掉账号配置；模型供应商和 API Key 在「公共设置」里统一维护，任务模型才按 Bot 分开。详见[多实例](../manual/multi-bot-host.md)。

## 一个 MaiBot 能服务多个群聊吗？

能。哪些群聊和私聊被接收，由主程序的适配器策略统一决定，默认全部放行。两个入口：

- **WebUI** — 侧边栏「配置管理 → 适配器设置」（`/adapter-management`）：顶部「全局默认规则」设置群聊 / 私聊的默认动作，选中适配器后在「黑白名单规则」页签填群号 / 用户 ID，改完自动保存。
- **配置文件** — `config/adapter_policy.toml`：`[defaults.group]` / `[defaults.private]` 写兜底规则，`[[adapters]]` 条目按适配器实例写 `allow_ids` / `deny_ids`。

见[适配器管理](../manual/webui/adapter-management.md)。

## MaiBot 支持哪些平台？

支持哪些平台取决于装了哪些适配器：

- **QQ 本地客户端** — OneBot 适配器，用你自己的 QQ 号登录，支持 NapCat 等 OneBot v11 实现。
- **QQ 开放平台机器人** — QQ 官方机器人适配器，申请 AppID + AppSecret 直连，不需要登录 QQ 客户端。
- **内置适配器** — Telegram、微信 ClawBot，装好即用，不需要额外装插件。
- **社区适配器** — 邮件、iMessage、QQ 语音通话。

选型与安装见[接入平台](../manual/adapters/index.md)。

## 第一次使用该做什么？

先把最小链路跑通：一个 LLM 服务商 + 一个能回复的模型 + 一个适配器，确认能在群里收到回复。再逐项打开长期记忆、插件、桌宠这些附加能力。

每次只改一类配置，改完验证再动下一项，出问题时才好定位。

## 提问时要提供什么？

操作系统、MaiBot 版本、部署方式（源码 / Docker / uv / 一键包）、适配器与插件版本、完整错误日志、相关配置、复现步骤。

公开前删掉 API Key、访问令牌、Cookie 等凭据。完整自查清单见[获取帮助](./getting-help.md)。
