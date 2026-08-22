---
title: QQ 官方适配器
---
# QQ 官方适配器

QQ 官方适配器让 MaiBot 通过 [QQ 官方机器人开放平台](https://q.qq.com) 接入 QQ 平台，在单聊、群聊、文字子频道和频道私信中收发消息。

::: info 纯出站连接
QQ 官方适配器由 MaiBot 主动连接 QQ 官方的 WebSocket 网关和开放平台 API，是**纯出站**连接，不需要公网 IP、端口映射或回调地址。
:::

::: warning ID 体系不同
本适配器的 UserID / GroupID 来自 QQ 官方 OpenID 体系（`user_openid` / `member_openid` / `group_openid`），不是数字 QQ 号和群号，不能与 OneBot v11 的 ID 混用。
:::

## 简介

QQ 官方适配器是一个 MaiBot 插件，对接 QQ 官方机器人开放平台的 API v2。它主动连接 QQ 官方的 WebSocket 网关接收消息，并通过开放平台 REST API 发送回复：

- **入站**：QQ 官方 WebSocket 网关推送事件到适配器，适配器转换后注入 MaiBot
- **出站**：MaiBot 生成的回复经适配器转换后，通过 QQ 官方 API 发送出去

与 NapCat、GoCQ 等基于 OneBot 协议的适配器不同，QQ 官方适配器只对接 QQ 官方能力，不依赖第三方协议或服务，也不需要维护适配器与 MaiBot 之间的网络连接。

消息流转：**QQ 官方网关 → 适配器插件（MaiBot 内部）→ MaiBot**

### 适配器仓库

QQ 官方适配器的源码：[WhiteCloudOL/qq-official-adapter](https://github.com/WhiteCloudOL/qq-official-adapter)

## 安装

### 第一步：创建 QQ 机器人

打开 [QQ 机器人开放平台](https://q.qq.com/qqbot/openclaw/)，创建机器人，并保存它的 **AppID** 与 **AppSecret**。

::: tip AppSecret 是机器人密码
AppSecret 等同于机器人密码，请妥善保存，不要提交到代码仓库或分享给别人。一旦怀疑泄露，应立即在开放平台重置。
:::

### 第二步：获取适配器

克隆适配器仓库到 MaiBot 的 `plugins/` 文件夹中：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 进入 MaiBot 的 plugins 目录
cd MaiBot/plugins

# 克隆仓库
git clone https://github.com/WhiteCloudOL/qq-official-adapter.git
```

:::

MaiBot 会根据插件清单自动安装依赖。

### 第三步：填写插件配置

插件安装后**默认是禁用的**。在 MaiBot WebUI 的插件配置中找到 **"QQ 官方机器人适配器"**，填写以下内容：

- **启用适配器** — 开启
- **AppID** — QQ 开放平台显示的 AppID
- **AppSecret** — 与 AppID 对应的 AppSecret

聊天名单过滤默认关闭，不配置即可正常使用。需要限制允许接入的群或用户时，再启用"聊天过滤"并填写 QQ 官方 OpenID（详见下方[配置参考](#配置参考)）。

也可以直接编辑插件的配置文件 `plugins/qq-official-adapter/config.toml`，把 `enabled` 设为 `true` 并填入凭据，效果相同。

### 第四步：设置 MaiBot 主账号

先启动一次 MaiBot，让插件连接上 QQ 网关，然后在日志中找到：

```text
QQ 官方 WebSocket 已就绪: self_id=机器人自身ID
```

随后在 MaiBot 的 `config/bot_config.toml` 中填写：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"
qq_account = "日志中的 self_id"
```

:::

::: warning 不要填错账号
`qq_account` 必须填日志里的 `self_id`（即 WebSocket `READY` 事件中的机器人自身 ID）。**不要**填 AppID、QQ 号或 OneBot v11 的机器人 QQ 号。MaiBot 主程序会用它标记机器人自己发送的消息。
:::

机器人显示昵称会自动读取 `[bot]` 的 `nickname`（默认 `"麦麦"`），群聊中被 @ 时会以 `@昵称` 进入聊天上下文，无需在插件配置中重复填写机器人 ID。

### 第五步：开启群聊全量消息（仅群聊需要）

如需使用群聊功能，需要由**群主**进入 QQ 群设置，选择当前使用的机器人，将"机器人可获取的群聊消息范围"设置为"获取群内全部消息"。未开启时，机器人只能收到平台允许范围内的消息，无法正常参与完整群聊。

> 该设置只能由群主操作，并且需要对每个使用机器人的群分别设置。

### 第六步：重启并验证

重启 MaiBot，确认日志出现 **"QQ 官方 WebSocket 已就绪"**。建议依次测试：

1. 单聊发送普通文字。
2. 群聊艾特机器人并发送文字。
3. 发送普通图片和 QQ 表情/贴纸。
4. 让 MaiBot 分别回复纯图片、纯表情和图文消息。

## 配置参考

插件的配置文件位于 `plugins/qq-official-adapter/config.toml`，包含以下三个分组。

### 插件设置 (`[plugin]`)

- **`enabled`** — 是否启用 QQ 官方适配器。关闭时插件只注册消息网关，不会连接 QQ WebSocket。默认关闭
- **`config_version`** — 当前配置结构版本（自动管理，一般不需要手动修改）。默认 "1.1.0"

### 机器人凭据 (`[credentials]`)

- **`appid`** — QQ 开放平台机器人的 AppID（在 `https://q.qq.com` 获取）。默认为空
- **`app_secret`** — 与 AppID 配对的 AppSecret，用于获取访问令牌。默认为空
- **`sandbox`** — 是否使用沙箱环境。开启后 WebSocket 网关与消息发送走沙箱地址，便于测试。默认关闭

### 聊天过滤 (`[chat]`)

- **`enable_chat_list_filter`** — 是否启用群聊与私聊名单过滤。关闭后忽略 `group_list` / `private_list`，仅保留 `ban_user_id` 规则。默认关闭
- **`show_dropped_chat_list_messages`** — 是否记录未通过聊天名单过滤而被丢弃的消息。默认关闭
- **`group_list_type`** — 群聊名单模式。白名单只接收列表内群聊，黑名单则忽略列表内群聊。默认 "whitelist"
- **`group_list`** — 群聊名单，填写 `group_openid`（自动去重）。默认为空
- **`private_list_type`** — 私聊名单模式。白名单只接收列表内私聊，黑名单则忽略列表内私聊。默认 "whitelist"
- **`private_list`** — 私聊名单，填写 `user_openid`（自动去重）。默认为空
- **`ban_user_id`** — 全局屏蔽的用户列表，填写 `user_openid` 或 `member_openid`，这些用户的消息会在进入 MaiBot 之前被直接丢弃。默认为空

::: tip 名单里填的是 OpenID
聊天名单填写的都是 QQ 官方 OpenID（`group_openid` / `user_openid` / `member_openid`），不是数字群号 / QQ 号，可以在日志的调试信息中查看对应事件的 OpenID。
:::

### 完整配置示例

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
enabled = true
config_version = "1.1.0"

[credentials]
appid = "你的AppID"
app_secret = "你的AppSecret"
sandbox = false

[chat]
enable_chat_list_filter = false
show_dropped_chat_list_messages = false
group_list_type = "whitelist"
group_list = []
private_list_type = "whitelist"
private_list = []
ban_user_id = []
```

:::

## 消息能力

QQ 官方适配器支持以下消息场景：

- **QQ 单聊** — 接收文字、图片、表情、语音、视频和文件；可发送文字、图片、表情、语音、视频、文件和结构化消息
- **QQ 群聊** — 接收艾特消息、全量消息及附件；可发送文字、图片、表情、语音、视频、文件和结构化消息
- **文字子频道** — 接收艾特消息、全量消息及附件；可发送文字、图片、Markdown、Ark 和 Embed
- **频道私信** — 接收文字及附件；可发送文字、图片、Markdown、Ark 和 Embed

QQ 群与单聊中的表情以图片富媒体发送，不会显示为无效的 `[表情]` 文本；纯图片或纯表情回复也不会额外发送 `[图片]`、`[表情]` 占位文字。入站图片和表情会保留原始二进制供 MaiBot 识别，首次出现的图片会后台识别后补入聊天上下文，相同图片复用缓存描述。

适配器会自动判断群聊消息是否真正艾特当前机器人（结合事件类型、WebSocket 自身 ID、结构化 mentions 与消息元素），并自动学习群聊范围内的机器人 OpenID，无需在插件配置中重复填写机器人 ID。

## 验证与排查

### 验证连接

怎么知道连上了？看这几个地方：

1. **MaiBot 日志**：看到 `QQ 官方 WebSocket 已就绪` 的提示
2. **WebUI 插件列表**：能看到 QQ 官方适配器插件已加载
3. **发消息测试**：在 QQ 单聊 / 群里发消息，看 MaiBot 有没有回复

### 群里艾特机器人，但 MaiBot 没有识别

先确认日志收到的是 `GROUP_AT_MESSAGE_CREATE` 或 `GROUP_MESSAGE_CREATE`。若日志显示插件已识别，但 MaiBot 仍无法发送回复，检查 `bot_config.toml` 的 `qq_account` 是否等于就绪日志里的 `self_id`。

### 收不到群聊或频道消息

确认机器人已获得对应场景权限，并在开放平台启用了相应消息能力。如果快速创建页面显示"暂不支持进入群聊"，插件无法绕过平台限制。群聊场景还需要群主开启"获取群内全部消息"。

### 返回 401 或鉴权失败

核对 AppID 与 AppSecret 是否属于同一个机器人。重置 AppSecret 后，需要同步更新插件配置并重启。
