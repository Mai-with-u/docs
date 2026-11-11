---
title: OneBot 适配器
---

# OneBot 适配器

**登录你自己的 QQ 号接入（官方维护）。** OneBot 适配器让 MaiBot 通过 NapCat 或其他 OneBot v11 实现接入 QQ：连接建立后自动判定对端实现并套用对应能力画像，收发群聊和私聊消息，支持语音与表情解析、主动私聊。它是 MaiBot 官方维护的插件，只有插件模式，直接在 MaiBot 进程内运行。插件市场里这个插件的显示名是「OneBot 适配器」，仓库名仍是 `MaiBot-SnowLuma-Adapter`。

::: tip 官方持续维护
OneBot 适配器由 MaiBot 官方团队持续维护，遇到问题欢迎在 [GitHub Issues](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter/issues) 反馈。
:::

适配器仓库（官方维护）：

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="OneBot 适配器" description="官方维护的 OneBot v11 适配器插件仓库" logo="/title_img/mai.png" />

消息流转：**QQ → NapCat / 其他 OneBot v11 实现 → 适配器插件（MaiBot 内部）→ MaiBot**

## 准备客户端并登录机器人 QQ 号

适配器只负责「MaiBot ↔ 客户端」这段连接，客户端本身的部署与登录请按其文档完成，并确保它已启用**正向 WebSocket 服务器**。默认连接 `ws://127.0.0.1:3001`（同机）。只支持正向 WebSocket 根路径，不支持反向 WS、HTTP 或 OneBot v12。

<Linkcard url="https://doc.napneko.icu/" title="NapCat 官方文档" description="安装 NapCat、登录 QQ、开启正向 WebSocket 服务器" />

<Linkcard url="https://github.com/botuniverse/onebot-11" title="OneBot 11 标准" description="动作、消息段与事件的标准定义；换用其他实现时按此对照" />

::: warning 这个 QQ 号就是机器人本体
客户端登录的 QQ 号必须与后面 `bot_config.toml` 里的 `qq_account` 完全一致，MaiBot 才能识别「机器人自己」发出的消息。
:::

## 配置 MaiBot 的机器人账号

编辑 `config/bot_config.toml` 的 `[bot]` 节，让 MaiBot 认识机器人自己：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"         # NapCat 等本地客户端适配器都用 qq
qq_account = "你的QQ号"  # 必须与客户端登录的 QQ 号一致
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — 填 `"qq"`，本地客户端适配器的平台标识。
- **`qq_account`** — 填客户端登录的那个 QQ 号（字符串格式）。

适配器通常会上报自己的身份，这两个字段是上报失败时的备用值；保持填写一致，退化成备用值时才不会认错账号。

也可以在 WebUI 的**适配器设置**里设置：点页面顶部「全局默认规则」卡片右侧的 **平台账号**，平台选 `qq`，账号填机器人 QQ 号。

## 配置适配器连接

配置文件位于 `plugins/MaiBot-SnowLuma-Adapter/config.toml`。下面是一份**完整可复制**的配置模板，按注释修改即可；配置页里的分组顺序与模板一致：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                      # 启用适配器，必须为 true 才会建立连接
qq_face_parse_mode = "description"  # QQ 表情解析：description 转中文描述 / emoji 转近似 Unicode 表情
enable_text_face_conversion = false # 发送时把 /表情名 转成 QQ 原生表情
enable_text_at_conversion = false   # 群聊发送文本里的 @QQ号 / @群名片 / @昵称 转成真实 @
config_version = "2.8.0"            # 配置结构版本，一般不要改动

[chat_abilities]
enable_private_chat_tool = false  # 主动私聊工具，见「LLM 工具开关」
enable_poke_tool = false          # 戳一戳工具
enable_recall_tool = false        # 撤回工具
enable_mute_tool = false          # 智能禁言工具
enable_emoji_like_tool = false    # 表情表态工具
enable_forward_tool = false       # 合并转发工具

[client]
client_type = "auto"        # 对端实现：auto 连接后自动判定 / napcat / onebot_v11
server = "127.0.0.1"        # NapCat 或其他 OneBot v11 实现的地址；同机回环地址
port = 3001                 # 正向 WebSocket 端口，与客户端设置一致
token = ""                  # 访问令牌；客户端开启鉴权后填相同 token
heartbeat_interval = 30.0   # 协议层心跳保活间隔（秒），必须大于 0
reconnect_delay_sec = 5.0   # 断线重连等待（秒）
action_timeout_sec = 30.0   # 动作接口超时（秒）
connection_id = ""          # 连接标识；多实例时区分链路，见下文

[filters]
ban_user_id = []                  # 用户黑名单（QQ 号），其群聊和私聊消息直接丢弃
ban_qq_bot = false                # 屏蔽 QQ 官方机器人消息
regex_filter_enabled = false      # 启用正则消息过滤
regex_filter_mode = "blacklist"   # blacklist 匹配则丢弃 / whitelist 仅放行匹配
regex_filter_patterns = []        # 正则表达式列表，Python re 语法
regex_filter_show_dropped = false # 记录正则过滤丢弃日志

[notice]
enabled = true                    # 整体转发通知事件；关闭后所有通知不进入 Host
enable_poke = true                # 戳一戳
enable_friend_recall = true       # 好友消息撤回
enable_group_recall = true        # 群消息撤回
enable_group_ban = true           # 群禁言 / 解除禁言
enable_group_msg_emoji_like = true  # 群消息表情回应
enable_group_upload = true        # 群文件上传
enable_group_increase = true      # 入群
enable_group_decrease = true      # 退群
enable_group_admin = true         # 管理员变动
enable_essence = true             # 精华消息变动
enable_group_name = true          # 群名变更

[debug]
enable_ada_debug_raw_message_log = false       # 记录入站原始消息段，排查消息结构时开启
enable_ada_debug_raw_outbound_message_log = false  # 记录出站实际调用的 action 和 params
ignore_self_message = false                    # 忽略机器人自身发送的消息

[mute]
admin_users = []        # 禁言保护名单（QQ 号），名单内用户不会被禁言
allowed_groups = []     # 允许禁言的群白名单，留空不限制
min_duration = 60       # 最短禁言时长（秒），模型给的时长低于该值会被抬升
max_duration = 2592000  # 最长禁言时长（秒），默认 30 天，超出会被截断
```

:::

::: tip 旧配置自动迁移
旧配置里的 `[luma_client]` / `[napcat_server]` / `[connection]` 段会在加载时合并进 `[client]`（`host` → `server`、`access_token` → `token`），配置版本号自动改写，无需手动改。
:::

### client_type 怎么选

- **`auto`**（默认）— 每次连接建立后调 `get_version_info` 读对端自报的 `app_name` 判定实现；识别得出 NapCat 就套 NapCat 画像，识别不出则走标准 OneBot v11 模式。
- **`napcat`** — 固定按 NapCat 画像运行。适配器仍会做一次判定，与声明不一致时打警告并按声明继续，不会静默改判。
- **`onebot_v11`** — 固定走标准模式，只使用 OneBot v11 标准动作与消息段，见下文「两种画像的差异」。接入非 NapCat 的实现时选它，行为最可预期。

连接对象固定时用固定值，日常推荐保持 `auto`。

### 多实例 connection_id

同一台 MaiBot 连多条客户端链路时，为每条链路配**不同的 `connection_id`**（如 `primary`、`secondary`），用它作为路由作用域标识，避免链路互相干扰。

## 先加名单，再测试

OneBot 适配器的入站访问范围由宿主适配器策略控制：WebUI 的适配器设置（黑白名单规则）或 `config/adapter_policy.toml`，默认**全部放行**（所有群消息都接受）。想限制范围时，把「默认不阅读」打开、只放行指定的群号或用户即可。

策略的可视化入口见 [适配器管理](../webui/adapter-management.md)；`config/adapter_policy.toml` 的完整写法见[访问策略与账户路由](/develop/adapters/policy)。

::: tip 先小范围验证更稳
先在适配器策略里只加一个测试群和一个测试用户，确认收发正常后再扩大放行范围；排查「没反应」时，这一层是第一现场。
:::

## 客户端画像与标准模式

适配器按判定的对端实现套用能力画像：NapCat 走专用画像，识别不出实现或固定成 `onebot_v11` 时走标准模式。这两种画像在下面五项上取值相同，换实现时不用改配置：

- **发送动作** — 都用 `send_group_msg` / `send_private_msg`
- **出站文件** — 都内联 `file` 段
- **合并转发参数键** — 都用 `message`
- **语音 `get_record` 格式** — 都按 `wav` 接收
- **QZone API** — 都不支持，调用显式报错

标准模式的差别只有一层准入检查：

- **动作白名单** — 只放行 OneBot v11 标准动作，厂商扩展（QZone、`set_input_status`、`nc_get_packet_status` 等）直接报错，不做试探性调用
- **消息段白名单** — 出站只接受标准消息段；字符串消息按 CQ 码解析后逐段检查，出现非标准段报错
- **ID 转整数** — 发送前把宿主传来的字符串 `user_id` / `group_id` / `message_id` 转成整数
- **扩展工具不启用** — 标准模式下 `[chat_abilities]` 里打开了 `enable_poke_tool` 和 `enable_emoji_like_tool` 也不会启用对应工具，`enable_forward_tool` 依赖的会话列表与合并转发同理

token 鉴权不区分画像：连接时同时附带 `Authorization: Bearer` 头与 URL `access_token` 参数（OneBot v11 两种标准方式），服务端各取所需。

## LLM 工具开关

`[chat_abilities]` 下的工具默认全部关闭，打开后模型才会获得对应能力：

- **`enable_private_chat_tool`** — 主动私聊：模型可向指定 QQ 用户发送首条私聊消息；请在宿主适配器策略中放行该私聊
- **`enable_poke_tool`** — 戳一戳：群聊中戳当前群成员，私聊中发送好友戳一戳；标准模式下不启用
- **`enable_recall_tool`** — 撤回：撤回自己的消息限 2 分钟内，撤回他人消息需要机器人是群管理员
- **`enable_mute_tool`** — 智能禁言：按消息 ID 禁言发送者；群主、管理员及 `[mute].admin_users` 保护名单不会被禁言，生效范围与时长由 `[mute]` 节限制
- **`enable_emoji_like_tool`** — 表情表态：给消息贴 QQ 表情回应（如赞、爱心）；标准模式下不启用
- **`enable_forward_tool`** — 合并转发：把一批消息打包成合并转发，发送到指定群或私聊；标准模式下不启用

## 插件 API（开发者）

其它插件通过 SDK 的 `ctx.api.call` 调用适配器 API，`version="1"`。注册名是 `adapter.napcat.*`，同时提供完全等价的 `adapter.onebot.*` 别名：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
member = await self.ctx.api.call(
    "adapter.onebot.group.get_group_member_info",
    version="1",
    group_id=123456,
    user_id=654321,
)
# 把上面的 adapter.onebot. 换成 adapter.napcat.，调用行为完全相同。
```

:::

- **两套前缀** — `adapter.onebot.*` 与 `adapter.napcat.*` 共享同一处理器、参数、返回值与能力校验；前缀不切换客户端模式，实际能力仍取决于当前画像。`await self.ctx.api.list()` 可查看已注册的名称。
- **头像接口** — 公开 API `adapter.avatar.get`（版本 1）查询用户 / 群头像，返回 `status` / `url` / `expires_in`，供宿主统一下载、缓存；遇到 QQ 官方机器人 OpenID 时返回 `unsupported`。完整协议见[头像接口](/develop/adapters/avatar-api)。
- **QZone API** — 两套前缀下都不支持，调用会显式报错。

## 验证与排错

**验证** — WebUI 插件列表已加载；日志出现连接成功与生效画像的信息；在已放行的群里 @ 机器人有回复，即成功。

**连不上** — 核对 `client.server` / `port` 与客户端正向 WebSocket 监听地址一致；客户端是否已开启正向 WS 服务、端口是否被防火墙拦截、是否同机；若开启鉴权，`token` 是否与客户端设置一致。

**client_type 一致性警告** — 固定成 `napcat` 但连接对端不是 NapCat 时，日志会打警告并按声明运行；看到该警告请把 `client_type` 改回 `auto`，或改连对应的客户端。

**客户端类型探测失败** — 日志报 `get_version_info` 探测失败时，适配器不会激活消息网关，固定 `client_type` 也不会跳过这一步。确认对端实现了这个标准动作并能正常返回 `app_name`。

**对端 `app_name` 认不出来** — 探测成功但 `app_name` 不属于已知实现时，`auto` 会自动落到标准 OneBot v11 模式；想显式固定就写 `client_type = "onebot_v11"`。

**连接成功但群里 @ 机器人没反应** — 先查宿主适配器策略（WebUI 适配器设置 / `config/adapter_policy.toml`）是否放行该群或该私聊；再确认 `plugin.enabled = true`、发送者不在 `[filters].ban_user_id`。

**能收不能发** — 机器人有无发言权限；`action_timeout_sec` 是否太短；确认 `bot_config.toml` 的 `qq_account` 与客户端登录 QQ 一致。

**麦麦把自己的消息当成别人** — `bot_config.toml` 的 `qq_account` 与客户端登录的 QQ 号不一致，改成一致后重启主程序。

**标准模式下某个工具或扩展调用报错** — 标准模式只放行 OneBot v11 标准动作与消息段，QZone、厂商戳一戳、表情表态、文件上传、合并转发等扩展会被拒绝。需要这些能力时换回 `client_type = "auto"` 或 `napcat`。

**通知不进来（戳一戳 / 撤回等）** — 确认 `[notice].enabled = true`，且对应类型开关已打开；未列出的通知类型默认丢弃，属正常行为。
