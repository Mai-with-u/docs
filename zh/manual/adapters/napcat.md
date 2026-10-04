---
title: NapCat 适配器
---

# NapCat 适配器

**登录你自己的 QQ 号接入（官方推荐）。** NapCat 适配器让 MaiBot 通过 [NapCat](https://github.com/NapNeko/NapCatQQ) 接入 QQ，收发消息、处理群聊与私聊、推送通知事件。它是 MaiBot **官方维护的插件**，以客户端方式连接 NapCat 的**正向 WebSocket 服务器**，不需要反向 WebSocket，也不使用 `[maim_message]` 配置段。

::: tip 官方持续维护
NapCat 适配器由 MaiBot 官方团队持续维护，最近更新至 v1.4.0（2026-08-19），适配 MaiBot ≥ 1.2.0；支持群聊、私聊、语音、图片、合并转发、主动私聊与多实例连接。遇到问题欢迎在 [GitHub Issues](https://github.com/Mai-with-u/MaiBot-Napcat-Adapter/issues) 反馈。
:::

适配器仓库（🏛️ 官方维护）：

<Linkcard url="https://github.com/Mai-with-u/MaiBot-Napcat-Adapter" title="MaiBot-Napcat-Adapter" description="MaiBot 官方维护的 NapCat QQ 适配器插件" logo="/title_img/mai.png" />

消息流转：**QQ → NapCat → 适配器插件（MaiBot 内部）→ MaiBot**

## 环境要求

- **MaiBot** — ≥ 1.2.0
- **aiohttp** — 适配器依赖它建立 WebSocket 连接，MaiBot 环境通常已内置；缺失时插件会报错「依赖 aiohttp 但未安装」
- **NapCat** — 一个能登录并连接 QQ 的 NapCat 实例（见下方步骤 1）

## 安装 NapCat 并登录机器人 QQ 号

适配器只负责「MaiBot ↔ NapCat」这段连接，NapCat 本身的安装、登录与启动请按其官方文档完成。

<Linkcard url="https://doc.napneko.icu/" title="NapCat 官方文档" description="安装 NapCat、登录 QQ、配置 WebSocket 服务" />

1. 按官方文档安装 NapCat，并登录你的机器人 QQ 号；
2. 确认 NapCat 正常运行，且该 QQ 号已上线。

::: warning 这个 QQ 号就是机器人本体
NapCat 登录的 QQ 号必须与后面 `bot_config.toml` 里的 `qq_account` 完全一致，MaiBot 才能识别「机器人自己」发出的消息。两处不一致时，麦麦会把自己的消息当成别人的。
:::

## 开启正向 WebSocket 服务器

在 NapCat 的配置里开启**正向 WebSocket 服务器**，并记下它监听的**端口**和**访问令牌**：

- **端口** — 默认 `3001`。把它填到后面适配器的 `napcat_server.port`。
- **访问令牌（Token）** — 可选。开启后连接方必须带相同 token 才能握手，填到 `napcat_server.token`。

::: tip 分清三种 Token
- **NapCat WebUI Token** — 用于登录 NapCat 自带的网页管理界面，与本适配器无关。
- **NapCat 正向 WebSocket Token** — 在「正向 WebSocket」服务里设置的那个，才是这里要填的 `napcat_server.token`。
- **MaiBot WebUI Token** — 用于登录 MaiBot 自己的网页管理界面，与本适配器无关。
:::

## 配置 MaiBot 的机器人账号

编辑 `config/bot_config.toml` 的 `[bot]` 节，让 MaiBot 认识机器人自己：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"       # NapCat / SnowLuma 这类本地客户端适配器都用 qq
qq_account = "你的QQ号"  # 必须与 NapCat 登录的 QQ 号一致
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — 填 `"qq"`，即本地客户端适配器的平台标识。
- **`qq_account`** — 填 NapCat 登录的那个 QQ 号（字符串格式），两处必须完全一致。
- **`platforms`** — NapCat 走 `qq` 平台，不需要像官方机器人那样加 `qq_bot:` 条目，保持原样即可。

也可以在 WebUI 中设置：`麦麦设置 → 基础 → 平台账号`，平台选 `qq`，账号填机器人 QQ 号。

## 配置适配器连接

NapCat 适配器作为客户端主动连出到 NapCat。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                    # 启用适配器，必须为 true 才会建立连接
enable_private_chat_tool = false  # 主动私聊工具，见第 6 节
config_version = "0.1.0"          # 配置结构版本，一般不要改动

[napcat_server]
host = "127.0.0.1"   # NapCat 地址；同机回环地址，Docker 填服务名
port = 3001          # 正向 WebSocket 端口，与 NapCat 设置一致
token = ""           # 访问令牌；NapCat 开启鉴权后填相同 token
heartbeat_interval = 30.0   # 心跳判定间隔（秒），必须大于 0
reconnect_delay_sec = 5.0   # 断线重连等待（秒）
action_timeout_sec = 15.0   # 动作接口超时（秒）
connection_id = ""          # 连接标识；多实例时区分链路，见第 6 节

[chat]
enable_chat_list_filter = true    # 名单过滤，默认开启
show_dropped_chat_list_messages = false  # 记录被丢弃消息日志（排错时开）
group_list_type = "whitelist"     # 群聊名单模式：whitelist / blacklist
group_list = []                   # 群号列表，先加名单再测试，见第 5 节
private_list_type = "whitelist"   # 私聊名单模式：whitelist / blacklist
private_list = []                 # 用户 QQ 号列表
ban_user_id = []                  # 全局屏蔽的用户 QQ 号，消息直接丢弃
ban_qq_bot = false                # 屏蔽 QQ 官方机器人消息

[notice]
enabled = true            # 整体转发通知事件；关闭后所有通知不进入 Host
enable_poke = true        # 戳一戳
enable_friend_recall = true   # 好友消息撤回
enable_group_recall = true    # 群消息撤回
enable_group_ban = true       # 群禁言 / 解除禁言
enable_group_msg_emoji_like = true  # 群消息表情回应
enable_group_upload = true    # 群文件上传
enable_group_increase = true  # 入群
enable_group_decrease = true  # 退群
enable_group_admin = true     # 管理员变动
enable_essence = true         # 精华消息变动
enable_group_name = true      # 群名变更

[filters]
ignore_self_message = true        # 忽略机器人自身消息，建议保持开启
regex_filter_enabled = false      # 启用正则消息过滤
regex_filter_mode = "blacklist"   # blacklist（匹配则丢弃）/ whitelist（仅放行匹配）
regex_filter_patterns = []        # 正则表达式列表，Python re 语法
regex_filter_show_dropped = false # 记录正则过滤丢弃日志
```

:::

::: tip 通知事件的默认行为
通知事件默认开启，可逐类型控制哪些通知注入 Host；未列出的类型（如输入状态 `notify.input_status`）默认丢弃，避免刷屏。
:::

## 先加名单，再测试

聊天名单过滤**默认开启且名单为空**——不加名单，任何群聊和私聊消息都会被丢弃，这是接上 QQ 后「没反应」最常见的原因。正确做法是**先把要接入的群 / 用户加进名单，再测试**：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = true
group_list = ["123456789"]        # 你的群号
private_list = ["987654321"]      # 要私聊的用户 QQ 号
```

:::

群号与用户 QQ 号会自动转为字符串并去重。测试时想临时放行全部消息，可先关掉过滤观察连通性：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = false   # 仅临时测试，调试完记得加回名单再打开
```

:::

::: tip 还有一层主程序名单
除了适配器自己的 `[chat]` 名单，MaiBot 主程序在 `config/adapter_policy.toml` 里还有一套统一的群聊 / 私聊访问策略（默认动作 + 每个适配器的 `allow_ids` / `deny_ids`）。**两层都放行，消息才会进入对话**；排查"没反应"时两层都要看，入口见 [适配器管理](../webui/adapter-management.md)。
:::

::: tip 完整的 NapCat 官方动作 API
适配器透传了 NapCat 的大部分 OneBot action API（含 System / Account / Group / Message / File 等命名空间），供开发者调用。完整清单见 [NapCat 官方 API 参考](https://napcat.apifox.cn/)。
:::

## 可选高级能力：主动私聊、多实例

### 主动私聊

默认 `enable_private_chat_tool = false`。打开后，模型获得两个工具，可以**主动向用户发第一条私聊**，并**根据消息 ID 反查发送者 QQ 号**：

- **`open_private_chat`** — 向指定 QQ 用户发送首条私聊消息；成功后该用户的私聊入站消息在 **15 分钟**内临时绕过私聊名单过滤
- **`get_qq_by_msg_id`** — 根据当前聊天中的消息 ID，获取该消息发送者的 QQ 号，便于主动私聊前确认目标

开启方式：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
enable_private_chat_tool = true
```

:::

::: tip 为什么需要 `get_qq_by_msg_id`
群聊里成员可能没有私聊过机器人，模型不知道他们的 QQ 号。先用它把某条消息的发送者 QQ 号取出来，再调 `open_private_chat` 主动建立私聊。
:::

### 多实例

同一台 MaiBot 连多条 NapCat 链路时，为每条链路配**不同的 `connection_id`**（如 `primary`、`secondary`），用它作为路由作用域标识，避免链路互相干扰。

## 验证与排错

**验证连接** — 插件日志出现 `NapCat 适配器已连接: ws://127.0.0.1:3001`，且向已加入名单的群 @ 机器人能收到回复，即成功。

**连不上、日志反复「连接失败」** — 核对 `napcat_server.host` / `port` 与 NapCat 正向 WebSocket 监听地址一致；NapCat 是否已开启正向 WS 服务、端口是否被防火墙拦截；若开启鉴权，`napcat_server.token` 是否与 NapCat 设置一致。

**连接成功但群里 @ 机器人没反应** — 首选查聊天名单：确认该群已加入 `group_list`；可临时设 `enable_chat_list_filter = false` 或打开 `show_dropped_chat_list_messages = true` 观察丢弃日志。其次确认 `plugin.enabled = true`。

**能收不能发** — 机器人有无发言权限；`action_timeout_sec` 是否太短；确认 `bot_config.toml` 的 `qq_account` 与 NapCat 登录 QQ 一致。

**麦麦把自己的消息当成别人** — `bot_config.toml` 的 `qq_account` 与 NapCat 登录的 QQ 号不一致，改成一致后重启主程序。

**通知不进来（戳一戳 / 撤回等）** — 确认 `[notice].enabled = true`，且对应类型开关已打开；未列出的通知类型默认丢弃，属正常行为。
