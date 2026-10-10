---
title: 统一 QQ 连接器
---

# 统一 QQ 连接器

**登录你自己的 QQ 号接入（官方维护）。** 统一 QQ 连接器（仓库 `MaiBot-SnowLuma-Adapter`，v1.0.0 起由原 SnowLuma 适配器与 NapCat 适配器合并而成）让 MaiBot 通过 [SnowLuma](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter) 或 [NapCat](https://github.com/NapNeko/NapCatQQ) 接入 QQ：一个插件同时支持两类客户端，连接建立后自动判定对端类型，收发消息、处理群聊和私聊，支持语音、表情解析与主动私聊。它是 MaiBot **官方维护的插件**，只有插件模式，直接在 MaiBot 进程内运行。

::: tip 官方持续维护
统一 QQ 连接器由 MaiBot 官方团队持续维护，遇到问题欢迎在 [GitHub Issues](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter/issues) 反馈。
:::

::: warning 升级到 MaiBot 1.3.0 时
MaiBot 1.3.0 需要配合 v1.0.0 及以上的统一 QQ 连接器使用：新版适配器已合并原 NapCat 适配器，升级后请**重新设置黑白名单**（原名单不会自动沿用）。原独立的 NapCat 适配器已停止演进并归档，见 [NapCat 适配器（已归档）](./napcat.md)。
:::

适配器仓库（🏛️ 官方维护）：

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="MaiBot-SnowLuma-Adapter" description="统一 QQ 连接器：一个插件同时支持 SnowLuma / NapCat 客户端" logo="/title_img/mai.png" />

消息流转：**QQ → SnowLuma/NapCat → 适配器插件（MaiBot 内部）→ MaiBot**

## 准备客户端并登录机器人 QQ 号

适配器只负责「MaiBot ↔ SnowLuma/NapCat」这段连接，客户端本身的部署与登录请按其文档完成，并确保它已启用**正向 WebSocket 服务器**。默认连接 `ws://127.0.0.1:3001`（同机）。

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="SnowLuma 文档" description="部署 SnowLuma、登录 QQ、启用正向 WebSocket 服务" />

<Linkcard url="https://doc.napneko.icu/" title="NapCat 官方文档" description="安装 NapCat、登录 QQ、开启正向 WebSocket 服务器" />

::: warning 这个 QQ 号就是机器人本体
客户端登录的 QQ 号必须与后面 `bot_config.toml` 里的 `qq_account` 完全一致，MaiBot 才能识别「机器人自己」发出的消息。
:::

## 配置 MaiBot 的机器人账号

编辑 `config/bot_config.toml` 的 `[bot]` 节，让 MaiBot 认识机器人自己：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"         # SnowLuma / NapCat 这类本地客户端适配器都用 qq
qq_account = "你的QQ号"  # 必须与客户端登录的 QQ 号一致
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — 填 `"qq"`，即本地客户端适配器的平台标识。
- **`qq_account`** — 填客户端登录的那个 QQ 号（字符串格式），两处必须完全一致。

也可以在 WebUI 的**适配器设置**里设置：点页面顶部「全局默认规则」卡片右侧的 **平台账号**，平台选 `qq`，账号填机器人 QQ 号。

## 配置适配器连接

配置文件位于 `plugins/MaiBot-SnowLuma-Adapter/config.toml`。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                      # 启用适配器，必须为 true 才会建立连接
qq_face_parse_mode = "description"  # QQ 表情解析：description 转中文描述 / emoji 转近似 Unicode 表情
config_version = "2.5.0"            # 配置结构版本，一般不要改动

[client]
client_type = "auto"        # 对端客户端类型：auto 连接后自动判定；也可固定 napcat / snowluma
server = "127.0.0.1"        # SnowLuma / NapCat 地址；同机回环地址
port = 3001                 # 正向 WebSocket 端口，与客户端设置一致
token = ""                  # 访问令牌；客户端开启鉴权后填相同 token
heartbeat_interval = 30.0   # 协议层心跳保活间隔（秒），必须大于 0
reconnect_delay_sec = 5.0   # 断线重连等待（秒）
action_timeout_sec = 15.0   # 动作接口超时（秒）
connection_id = ""          # 连接标识；多实例时区分链路，见下文

[chat_abilities]
enable_private_chat_tool = false  # 主动私聊工具，见「LLM 工具开关」
enable_poke_tool = false          # 戳一戳工具
enable_recall_tool = false        # 撤回工具
enable_mute_tool = false          # 智能禁言工具
enable_emoji_like_tool = false    # 表情表态工具
enable_forward_tool = false       # 合并转发工具

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

[filters]
ban_user_id = []                  # 用户黑名单（QQ 号），其群聊和私聊消息直接丢弃
ban_qq_bot = false                # 屏蔽 QQ 官方机器人消息
regex_filter_enabled = false      # 启用正则消息过滤
regex_filter_mode = "blacklist"   # blacklist 匹配则丢弃 / whitelist 仅放行匹配
regex_filter_patterns = []        # 正则表达式列表，Python re 语法
regex_filter_show_dropped = false # 记录正则过滤丢弃日志

[mute]
admin_users = []        # 禁言保护名单（QQ 号），名单内用户不会被禁言
allowed_groups = []     # 允许禁言的群白名单，留空不限制
min_duration = 60       # 最短禁言时长（秒），模型给的时长低于该值会被抬升
max_duration = 2592000  # 最长禁言时长（秒），默认 30 天，超出会被截断

[debug]
enable_ada_debug_raw_message_log = false       # 记录入站原始消息段，排查消息结构时开启
enable_ada_debug_raw_outbound_message_log = false  # 记录出站实际调用的 action 和 params
ignore_self_message = false                    # 忽略机器人自身发送的消息
```

:::

::: tip 旧配置自动迁移
旧版 SnowLuma / NapCat 适配器的 `[luma_client]` / `[napcat_server]` / `[connection]` 配置段，会在加载时**自动迁移到 `[client]`**（`host` → `server`、`access_token` → `token`），旧版本号自动改写，无需手动改。
:::

### client_type 怎么选

- **`auto`**（默认）— 每次连接建立后通过 `get_version_info` 自动判定对端是 NapCat 还是 SnowLuma，并应用对应能力画像；
- **`napcat` / `snowluma`** — 固定声明客户端类型，适配器会把声明与自动判定结果做一致性校验，不一致时打警告并按声明运行。连接对象固定时可用，日常推荐保持 `auto`。

### 多实例 connection_id

同一台 MaiBot 连多条客户端链路时，为每条链路配**不同的 `connection_id`**（如 `primary`、`secondary`），用它作为路由作用域标识，避免链路互相干扰。

## 先加名单，再测试

统一 QQ 连接器**已移除内置的群聊 / 私聊黑白名单**——入站通行统一由宿主适配器策略控制：WebUI 的适配器设置（黑白名单规则）或 `config/adapter_policy.toml`，默认**全部放行**（所有群消息都接受）。想限制范围时，把「默认不阅读」打开、只放行指定的群号或用户即可。

策略的可视化入口见 [适配器管理](../webui/adapter-management.md)；`config/adapter_policy.toml` 的完整写法见[访问策略与账户路由](/develop/adapters/policy)。

::: tip 先小范围验证更稳
先在适配器策略里只加一个测试群和一个测试用户，确认收发正常后再扩大放行范围；排查「没反应」时，这一层是第一现场。
:::

## 两类客户端的能力差异

适配器按连接判定的客户端类型应用能力画像，调用动作 API 时会感知到以下差异：

- **发送动作** — napcat 画像用 `send_group_msg` / `send_private_msg`；snowluma 画像用通用 `send_msg` + `message_type`
- **出站文件** — napcat 画像内联 `file` 段；snowluma 画像拆为独立 `upload_group_file` / `upload_private_file` 动作
- **合并转发参数键** — napcat 画像用 `message`；snowluma 画像用 `messages`
- **语音 `get_record` 格式** — napcat 画像返回 `wav`；snowluma 画像返回 `mp3`（silk 自动转码兜底）
- **QZone API** — napcat 画像不支持，调用会显式报错；snowluma 画像支持
- **token 鉴权** — 不区分画像：连接时同时附带 `Authorization: Bearer` 头与 URL `access_token` 参数（OneBot v11 两种标准方式），两类服务端各取所需

## LLM 工具开关

`[chat_abilities]` 下的工具默认全部关闭，按需打开后模型才会获得对应能力：

- **`enable_private_chat_tool`** — 主动私聊：模型可向指定 QQ 用户发送首条私聊消息；请在宿主适配器策略中放行该私聊
- **`enable_poke_tool`** — 戳一戳：群聊中戳当前群成员，私聊中发送好友戳一戳
- **`enable_recall_tool`** — 撤回：撤回自己的消息限 2 分钟内，撤回他人消息需要机器人是群管理员
- **`enable_mute_tool`** — 智能禁言：按消息 ID 禁言发送者；群主、管理员及 `[mute].admin_users` 保护名单不会被禁言，生效范围与时长由 `[mute]` 节限制
- **`enable_emoji_like_tool`** — 表情表态：给消息贴 QQ 表情回应（如赞、爱心）
- **`enable_forward_tool`** — 合并转发：把一批消息打包成合并转发，发送到指定群或私聊

## 插件 API（开发者）

其它插件通过 SDK 的 `ctx.api.call` 调用适配器 API，两套前缀均可使用，`version="1"`：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
member = await self.ctx.api.call(
    "adapter.snowluma.group.get_group_member_info",
    version="1",
    group_id=123456,
    user_id=654321,
)
# 把上面的 adapter.snowluma. 换成 adapter.napcat.，调用行为完全相同。
```

:::

- **两套前缀** — `adapter.napcat.*` 与 `adapter.snowluma.*` 调用行为完全相同；前缀不会切换客户端类型，实际能力仍取决于当前连接的客户端。`await self.ctx.api.list()` 可查看已注册的两组名称。
- **头像接口** — 公开 API `adapter.avatar.get`（版本 1）查询用户 / 群头像，返回 `status` / `url` / `expires_in`，供宿主统一下载、缓存；遇到 QQ 官方机器人 OpenID 时返回 `unsupported`。
- **QZone API** — 两个前缀下均仅 SnowLuma 画像支持，napcat 下调用会显式报错。

## 验证与排错

**验证连接** — WebUI 插件列表已加载；日志出现连接成功信息并自动判定客户端类型；在已放行的群里 @ 机器人有回复，即成功。

**连不上** — 核对 `client.server` / `port` 与客户端正向 WebSocket 监听地址一致；客户端是否已开启正向 WS 服务、端口是否被防火墙拦截、是否同机；若开启鉴权，`token` 是否与客户端设置一致。

**client_type 一致性警告** — 显式指定 `napcat` / `snowluma` 但连接对端不是该类型时，日志会打警告并按声明运行；看到该警告请把 `client_type` 改回 `auto`，或改连对应的客户端。

**连接成功但群里 @ 机器人没反应** — 先查宿主适配器策略（WebUI 适配器设置 / `config/adapter_policy.toml`）是否放行该群或该私聊；再确认 `plugin.enabled = true`、发送者不在 `[filters].ban_user_id`。

**能收不能发** — 机器人有无发言权限；`action_timeout_sec` 是否太短；确认 `bot_config.toml` 的 `qq_account` 与客户端登录 QQ 一致。

**麦麦把自己的消息当成别人** — `bot_config.toml` 的 `qq_account` 与客户端登录的 QQ 号不一致，改成一致后重启主程序。

**通知不进来（戳一戳 / 撤回等）** — 确认 `[notice].enabled = true`，且对应类型开关已打开；未列出的通知类型默认丢弃，属正常行为。
