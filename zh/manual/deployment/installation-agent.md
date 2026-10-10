---
title: AI 助手安装
---

# AI 助手安装

**把一份提示词交给 AI 助手，让它替你完成 MaiBot 的克隆、安装、配置和启动。** 你只需要回答几个问题，必要时在 WebUI 里点几下；想先弄清每一步在做什么，可以对照 [Windows 部署](./windows) 或 [Linux 部署](./linux)。

## 把提示词发给 AI

复制下面这句话，发给你正在使用的 AI 助手（Claude、GPT、Gemini 等都可以）：

::: info 提示词

> 请帮我安装 MaiBot，按照这里的指南操作：
>
> https://docs.mai-mai.org/installation-agent.md

:::

> **运行本程序即表示你同意 [MaiBot 最终用户许可协议（EULA）](../../about/EULA)。**

提示词本身是托管在文档站的纯文本指南，会跟着 MaiBot 版本一起更新，发链接即可，不用抄全文。

## AI 会带你走的流程

1. **问清两件事** — 你的操作系统，以及要不要接 QQ。接 QQ 有两条路线：**统一 QQ 连接器**（登录自己的 QQ 号，推荐）或 **QQ 官方机器人**（AppID + AppSecret，不用登录任何客户端）；
2. **检查环境** — 内存与磁盘可用空间都要 ≥ 2 GB，缺少 Git、Python 3.12+ 或 uv 会先帮你装好；
3. **克隆并启动** — 拉取 [MaiBot 仓库](https://github.com/Mai-with-u/MaiBot)，用 uv 安装依赖，再启动主程序；
4. **接入 QQ**（可选）— 按所选路线安装适配器、填连接信息、设置放行范围；
5. **验证** — 在 WebUI 或 QQ 里发一条消息，确认麦麦能回复。

AI 执行的安装与启动命令，和部署文档里是同一套：

::: code-group

```bash [安装依赖 ~vscode-icons:file-type-python~]
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
uv sync
```

:::

::: code-group

```bash [启动 MaiBot ~vscode-icons:file-type-shell~]
uv run bot.py
```

:::

第一次启动要在终端输入 **同意** 确认用户协议，随后终端会打印 WebUI 登录 Token（也保存在 `data/webui.json`）。打开 http://127.0.0.1:8001/ 粘贴 Token 登录，跟着配置向导至少配好一个 LLM 模型。

## 接 QQ 的两条路线

- **统一 QQ 连接器** — 在插件市场安装「统一 QQ 连接器」（仓库 `MaiBot-SnowLuma-Adapter`），再用 SnowLuma 或 NapCat 客户端登录机器人小号并开启正向 WebSocket。1.3.0 起原独立 SnowLuma / NapCat 适配器已合并进它，不要再装旧适配器；详细步骤见[统一 QQ 连接器](../adapters/qq-local-client.md)；
- **QQ 官方机器人** — 在 [QQ 开放平台](https://q.qq.com/)申请机器人，用 AppID + AppSecret 直连，不需要任何 QQ 客户端在线；详细步骤见 [QQ 官方机器人](../adapters/qq-official.md)。

两条路线都要设置**放行范围**：适配器本身已不再带群聊 / 私聊黑白名单，入站放行统一由 MaiBot 的适配器策略控制，默认全部放行，入口是 WebUI「配置管理 → 适配器设置」（`/adapter-management`）或 `config/adapter_policy.toml`。想只服务指定群时，写入：

::: code-group

```toml [adapter_policy.toml ~vscode-icons:file-type-toml~]
[[adapters]]
platform = "qq"            # 只写平台，管住该平台的所有账号

[adapters.group]
default_action = "block"   # 默认不接收
allow_ids = ["测试群号"]     # 只放行这些群
```

:::

完整字段见[访问策略与账户路由](/develop/adapters/policy)。建议先放行一个测试群和一个测试用户，确认收发正常后再扩大范围。

## 验证与排错

**验证**：把提示词交给 AI 后，它给出的安装步骤里不再出现独立的 NapCat / SnowLuma 适配器；照着做完，在 WebUI 里能和麦麦对话，接了 QQ 的话在已放行的群里 @ 它或与官方机器人单聊，能收到一条回复。

**AI 还在让你装 NapCat Adapter / SnowLuma Adapter？**

- 那是 1.3.0 之前的老方案。让它改为安装「统一 QQ 连接器」，并按 https://docs.mai-mai.org/installation-agent.md 重新给步骤

**提示 `uv: command not found`？**

- 执行 `source $HOME/.local/bin/env` 刷新环境变量，或重新打开一个终端

**启动后提示「模型列表不能为空」？**

- 到 WebUI 的模型配置里添加至少一个 LLM 模型，保存后重启；写法见[模型配置](../configuration/model-config.md)

**适配器连不上 QQ 客户端？**

- 核对 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 的 `[client]` 节：`server`、`port` 与客户端正向 WebSocket 监听地址一致（默认 `127.0.0.1:3001`），开启鉴权时 `token` 也要一致
- 确认客户端已登录并开启正向 WebSocket 服务，且保持「先启动客户端、后启动 MaiBot」的顺序

**群里 @ 麦麦没反应？**

- 先查适配器策略是否放行该群：WebUI「适配器设置」或 `config/adapter_policy.toml`，这是「没反应」的第一现场
- 再确认 `config/bot_config.toml` 的 `bot.qq_account` 与客户端登录的 QQ 号完全一致，发送者不在适配器的用户黑名单里
