---
title: QQBot 适配器
---

# QQBot 适配器

**接入 QQ 官方开放平台 Bot API，无需登录 QQ 客户端（社区维护）。** QQBot 适配器通过 **QQ 官方开放平台**的 Bot API（WebSocket + REST）将 MaiBot 接入 QQ，实现私聊（C2C）与群聊消息的双向收发。与 NapCat 等依赖本地客户端的适配器不同，它用 **AppID + AppSecret** 直接向腾讯服务器鉴权，身份体系基于 openid。

::: info 连接方向
`QQ 开放平台（api.sgroup.qq.com）⇄ QQBot 适配器 → MaiBot 插件消息网关`

适配器作为客户端主动连出：WSS 通道接收事件推送、维持心跳与断线重连，REST 通道发送消息与上传媒体；无需在本地开放端口，也不使用 `[maim_message]`。
:::

适配器仓库（🌐 社区维护）：

<Linkcard url="https://github.com/mayan613/MaiBot-QQBot-Adapter" title="MaiBot-QQBot-Adapter" description="mayan613 维护的 QQBot 适配器插件" />

## 1. 申请 QQ 机器人应用

QQBot 适配器接入的是 **QQ 官方机器人**，不是普通 QQ 账号，需要先在 QQ 开放平台创建应用：

1. 访问 [QQ 开放平台](https://q.qq.com) 并登录；
2. 创建机器人应用，在「开发设置」中获取 **AppID** 与 **AppSecret**；
3. 在「功能配置」中开启需要的事件订阅（如私信 C2C、群 @ 等），否则平台不会推送对应事件。

::: warning 环境要求

**MaiBot** — ≥ 1.0.0（插件宿主）。

**aiohttp** — ≥ 3.8，用于 WebSocket 与 REST 通信，MaiBot 环境通常已内置。

:::

::: tip 官方机器人与 NapCat 方案的区别
官方机器人**没有 QQ 号**，身份为 AppID + openid；官方 API 出于隐私保护不下发用户昵称，私聊显示的「名字」会退化为用户 openid（一长串十六进制），属正常现象。
:::

## 2. 配置 MaiBot 的机器人账号

官方机器人没有 QQ 号，MaiBot 核心需要用平台账号 `qq_bot:AppID` 来识别「机器人自己」。编辑 `config/bot_config.toml` 的 `[bot]` 节，在 `platforms` 中加入对应条目：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"                # 保持你原有平台不变（NapCat / SnowLuma 等本地客户端适配器都用 qq）
qq_account = "111111"          # 跟你原来配置保持一致
platforms = [
    "qq_bot:xxxxxxxxxx",       # 格式为 "qq_bot:AppID"，冒号后填你的 AppID
]
nickname = "麦麦"
alias_names = []
```

:::

::: warning
平台前缀必须是 `qq_bot`（本插件的平台名，用于区分 NapCat 的 `qq`），冒号后填 **AppID**。两处 AppID 必须完全一致：适配器配置里的 `app_id` 与此处的 `qq_bot:AppID`。不设置会导致麦麦把自己的消息当成别人的。
:::

也可以在 WebUI 中设置：`麦麦设置 → 基础 → 平台账号右侧的加号 → 平台填 qq_bot，账号填你的 AppID`。

## 3. 配置适配器连接

在 QQBot 适配器的插件设置中修改以下配置。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[qqbot]
app_id = "你的 AppID"
app_secret = "你的 AppSecret"
use_sandbox = false        # 沙箱环境（sandbox.api.sgroup.qq.com），上线前关闭
intents = 33554432         # 订阅的事件 Intents（位域），默认即 C2C 私聊 + 群 @
shard_count = 1            # 分片总数，单实例保持 1
shard_index = 0            # 当前分片序号（0 起），单实例保持 0
heartbeat_interval = 30.0  # 心跳超时判定间隔（秒），必须大于 0
reconnect_delay_sec = 5.0  # 断线后的重连等待（秒）
action_timeout_sec = 15.0  # REST API（发消息、传文件等）超时（秒）
token_refresh_before_sec = 300.0  # access_token 过期前提前刷新（秒），token 有效期 7200 秒
connection_id = ""         # 连接标识；多链路时区分，可选

[chat]
enable_chat_list_filter = true    # 名单过滤，默认开启
show_dropped_chat_list_messages = false  # 记录被丢弃消息日志（排错时开）
group_list_type = "whitelist"     # 群聊名单模式：whitelist / blacklist
group_list = []                   # 群 openid 列表
private_list_type = "whitelist"   # 私聊名单模式：whitelist / blacklist
private_list = []                 # 用户 openid 列表
ban_user_id = []                  # 全局屏蔽的用户 openid，消息直接丢弃
```

:::

::: tip
名单里填的是 **openid** 而不是 QQ 号 / 群号。默认开启白名单过滤且名单为空，所有消息都会被丢弃；测试时可临时关闭过滤或打开 `show_dropped_chat_list_messages` 观察丢弃日志。
:::

## 4. 平台限制与消息降级

以下为 QQ 官方平台的限制，使用前请知悉：

- **群全量消息需权限** — `GROUP_MESSAGE_CREATE`（非 @ 的群消息）仅在 bot 为群管理员或获得主动发言权限后由服务端推送；`GROUP_AT_MESSAGE_CREATE`（群 @）始终可用
- **被动回复窗口** — 收到用户消息后，C2C 私聊有 60 分钟、群聊有 5 分钟的被动回复窗口，且每条消息最多回复 5 次
- **主动消息受限** — 主动推送消息受平台严格限制，本插件以被动回复为主

受限于官方 Bot API 与 MaiBot 能力，以下出站消息段会被降级处理：

- **出站 @（`at`）** — 官方 API 不支持出站 @，转为 `@名称` 文本
- **语音（`voice`）** — 转为 `[语音]` 文本标记
- **合并转发（`forward`）** — 转为文本提示
- **引用回复（`reply`）** — 映射到 `msg_id` 参数实现引用

图片方面：入站图片会趁 URL 中的临时 rkey 有效时立即下载并回填二进制；出站图片走「上传媒体 → 发送 media」两步式。

## 验证与排错

**验证连接成功** — 插件日志依次出现 `QQ Bot access_token 已更新`、`QQ Bot WSS 已连接` 与 `QQ Bot Ready (session=...)`，表示鉴权与连接均成功。

**验证消息收发** — 用 QQ 私聊 bot 或在群内 @ bot，消息应注入 MaiBot 消息管道并得到回复。

**日志 `op=9 Invalid Session` 且带 4013/4014** — intents 无效或无权限；在 QQ 开放平台开启对应事件订阅，并核对 `intents` 值。

**连接建立后很快断开、无 READY** — AppSecret 错误或 token 获取失败；核对 `app_id` / `app_secret`，查看日志中 token 获取是否成功。

**断开日志显示 `close_code=4914/4915`** — 机器人被下架 / 封禁；前往 QQ 开放平台检查应用状态。

**断开前有「心跳超时」** — 网络问题或服务端未回 ACK；检查网络，插件会自动重连。

**图片报「加载图片二进制失败」** — 图片 rkey 过期或下载失败，属偶发，会退化为 `[图片]` 文本；检查到 `multimedia.nt.qq.com.cn` 的连通性。

**私聊名字是一长串十六进制** — 官方 API 不下发昵称，显示的是用户 openid，正常现象。

**麦麦把自己的消息当成别人** — `bot_config.toml` 未配置 `qq_bot:AppID`；在 `platforms` 中加入 `qq_bot:你的AppID` 并重启主程序。