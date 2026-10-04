---
title: QQ 官方适配器
---

# QQ 官方适配器

**接入 QQ 官方开放平台机器人，无需登录 QQ 客户端（社区维护）。** QQ 官方适配器让 MaiBot 通过 QQ 开放平台的 WebSocket 网关与 OpenAPI 收发消息，支持单聊、群聊、文字子频道与频道私信，可传文字、图片、表情、语音、视频和文件。它通过 **AppID + AppSecret** 鉴权，不需要任何 QQ 客户端在线。

::: info 连接方向
`QQ 官方 WebSocket 网关 ← QQ 官方适配器（wss 客户端）→ MaiBot 插件消息网关`

适配器用 AppID + AppSecret 换取 access_token，再向 QQ OpenAPI（`https://api.sgroup.qq.com`）请求 `/gateway/bot` 拿到 `wss` 地址后主动建立连接。全部连接由适配器向外发起，不需要公网回调地址，也不使用 `[maim_message]`。
:::

适配器仓库（🌐 社区维护）：

<Linkcard url="https://github.com/WhiteCloudOL/qq-official-adapter" title="qq-official-adapter" description="WhiteCloudOL 维护的 QQ 官方机器人适配器插件" />

## 1. 申请 QQ 官方机器人账号

1. 打开 [QQ 机器人开放平台](https://q.qq.com/qqbot/openclaw/)，创建机器人；
2. 在机器人管理页面（`https://q.qq.com`）妥善保存 `AppID` 与 `AppSecret`。

::: warning AppSecret 等同于机器人密码
请勿泄露，也不要提交本地的 `config.toml` 或其备份；一旦怀疑泄露，立即在开放平台重置。
:::

实际可用场景取决于机器人在开放平台获得的权限：快速创建的私人机器人通常只供创建者使用；是否支持群聊、频道和全量消息，以开放平台页面显示为准。

### 开启群聊全量消息

如需使用群聊功能，须由**群主**进入 QQ 群设置，选择当前使用的机器人，将「机器人可获取的群聊消息范围」设置为「获取群内全部消息」。未开启时，机器人只能收到平台允许范围内的消息，无法正常参与完整群聊。该设置只能由群主操作，且需要对每个使用机器人的群分别设置。

## 2. 环境要求

- **MaiBot 主程序** — 1.0.6 及以上（1.x）
- **MaiBot Plugin SDK** — 2.7.0 及以上
- **Python** — 3.11 及以上
- **aiohttp** — 3.8.0 及以上，为插件在清单中声明的依赖，由 MaiBot 自动处理，无需手动操作

## 3. 配置适配器连接

适配器配置在 MaiBot WebUI 的插件配置页面填写（对应插件目录下的 `config.toml`）。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[credentials]
appid = "开放平台显示的 AppID"
app_secret = "与 AppID 配对的 AppSecret"
sandbox = false   # 沙箱环境（sandbox.api.sgroup.qq.com），仅供调试

[chat]
enable_chat_list_filter = false   # 名单过滤，默认关闭
show_dropped_chat_list_messages = false  # 记录被丢弃消息日志（排错时开）
group_list_type = "whitelist"     # 群聊名单模式：whitelist / blacklist
group_list = []                   # 群 openid 列表
private_list_type = "whitelist"   # 私聊名单模式：whitelist / blacklist
private_list = []                 # 用户 openid 列表
ban_user_id = []                  # 全局屏蔽的用户 openid，消息直接丢弃
```

:::

::: warning 名单里填的是 OpenID
名单里填写的是 QQ 官方 **OpenID**（通常是不可读字符串），**不是**数字 QQ 号或数字群号，请按日志中实际显示的 OpenID 填写。
:::

名单过滤默认关闭，不配置即可接收机器人权限范围内的全部消息；关闭时忽略名单，仅保留全局屏蔽规则。

## 4. 设置 MaiBot 主账号

平台名称仍然使用 `qq`。先让适配器成功连接一次，在日志中找到：

```
QQ 官方 WebSocket 已就绪: ... self_id=机器人自身ID
```

随后在 MaiBot 的 `config/bot_config.toml` 中填写：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"
qq_account = "就绪日志中的 self_id"
```

:::

::: warning
`qq_account` 填的是 QQ 官方事件中的机器人自身 ID（OpenID 体系），**不是** AppID、数字 QQ 号或 OneBot v11 的机器人 QQ 号。MaiBot 主程序用它标记机器人自己发送的消息；机器人显示昵称会从 `bot.nickname` 自动读取，群聊中的艾特会以 `@昵称` 形式保留在聊天上下文中，无需在插件配置里重复填写机器人 ID。
:::

## 验证与排错

**验证连接成功** — 重启 MaiBot，确认日志出现「QQ 官方 WebSocket 已就绪」。建议依次测试：单聊发送普通文字；群聊艾特机器人并发送文字；发送普通图片和 QQ 表情；让 MaiBot 分别回复纯图片、纯表情和图文消息。

**群里艾特机器人但没有识别** — 确认调试日志收到的事件是 `GROUP_AT_MESSAGE_CREATE` 或 `GROUP_MESSAGE_CREATE`。插件会结合事件类型、WebSocket 自身 ID、结构化 mentions 与消息元素自动判断是否艾特自己，并自动学习群聊范围内的机器人 OpenID，无需手工填写机器人 ID。

**已识别但无法发送回复** — 检查 `config/bot_config.toml` 的 `qq_account` 是否等于就绪日志里的 `self_id`。

**收不到群聊或频道消息** — 确认机器人已获得对应场景权限并已开启全量消息；快速创建页面显示「暂不支持进入群聊」时，插件无法绕过平台限制。

**返回 401 或鉴权失败** — 核对 AppID 与 AppSecret 是否属于同一个机器人；重置 AppSecret 后，需要同步更新插件配置并重启。

**「有思考但没有回复」** — 优先查看同一时间段内的 `ERROR` 日志；正常收发消息的逐条记录位于 `DEBUG` 级别，不会占用默认信息日志。