---
title: QQ 官方机器人适配器
---

# QQ 官方机器人适配器

**接入 QQ 官方开放平台机器人，无需登录 QQ 客户端（官方维护）。** QQ 官方机器人适配器让 MaiBot 直连 [QQ 开放平台](https://q.qq.com/)：用 **AppID + AppSecret** 鉴权，通过官方 WebSocket 网关与 OpenAPI 收发单聊与群聊消息，支持文本、@、图片、表情、语音、视频与文件，不需要任何 QQ 客户端在线。

::: info 连接方向
`QQ 开放平台 ← QQ 官方机器人适配器（wss 客户端）→ MaiBot 插件消息网关`

适配器用 AppID + AppSecret 换取 access_token，再向 QQ OpenAPI（默认 `https://api.bot.qq.com`）请求网关地址后主动建立连接。全部连接由适配器向外发起，不需要公网回调地址，也不使用 `[maim_message]` 配置段。
:::

适配器仓库（官方维护）：

<Linkcard url="https://github.com/Mai-with-u/MaiBot-QQ-Adapter" title="MaiBot-QQ-Adapter" description="MaiBot 官方维护的 QQ 官方机器人适配器插件，直连 QQ 开放平台" logo="/title_img/mai.png" />

## 申请 QQ 官方机器人账号

1. 打开 [QQ 开放平台](https://q.qq.com/)，完成开发者入驻并创建机器人；
2. 在控制台取得 **AppID** 与 **AppSecret（ClientSecret）**；
3. 在控制台为机器人开通群聊 / 单聊相关能力。

::: warning AppSecret 等同于机器人密码
请勿泄露，也不要提交本地的 `config.toml` 或其备份；一旦怀疑泄露，立即在开放平台重置。
:::

::: warning OpenID 不是普通 QQ 号
QQ 官方平台的 OpenID 与真实 QQ 号不互通（通常是不可读字符串）。日志、名单与工具参数里出现的都可能是 OpenID；需要让消息以真实 QQ 号归属时，用下方的[统一 ID 绑定命令](#统一-id-绑定命令)转换。
:::

### 开启群聊全量消息

如需使用群聊功能，须由**群主**进入 QQ 群设置，选择当前使用的机器人，将「机器人可获取的群聊消息范围」设置为「获取群内全部消息」。未开启时，机器人只能收到平台允许范围内的消息，无法正常参与完整群聊。该设置只能由群主操作，且需要对每个使用机器人的群分别设置。

## 启用内置适配器

在 WebUI 的适配器管理中打开「QQ 官方机器人适配器」，填好连接信息后启用。升级时会自动迁移旧安装的配置并沿用数据，旧安装目录保存在 `plugins/.builtin-backups/`。适配器随主程序更新。

## 配置适配器连接

配置文件位于 `config/builtin_plugins/qq_official_adapter/config.toml`，也可以在 WebUI 的「QQ 官方机器人适配器 → QQ 开放平台」配置中填写。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true             # 启用适配器，必须为 true 才会建立连接
config_version = "0.5.3"   # 配置结构版本，由程序管理

[qq_official]
app_id = "开放平台显示的 AppID"
app_secret = "与 AppID 配对的 AppSecret"
api_base_url = "https://api.bot.qq.com"  # QQ 开放平台 API 地址，一般不用改
unified_account_id = ""    # 关联 QQ 号：填写后聊天流按此 ID 归属，与其它 qq 适配器共享上下文
enable_mapping = false     # 启用映射：把已关联的用户 ID 从 OpenID 换成 QQ 号，见「启用映射」
silent_user_sync = true    # 在已绑定群中与关联账号静默匹配 QQ 号、昵称与群名片；需先填关联 QQ 号
snowluma_identity_only = false  # 官方连接就绪时让关联账号只采集身份，避免双重发送

[mute]
enabled = true             # 启用 set_mute 禁言工具，见「LLM 工具」
allowed_groups = []        # 允许禁言的群（目标对象列表），留空不限制，见「允许群与保护名单」
admin_users = []           # 禁言保护名单（目标对象列表），名单内用户不会被禁言
min_duration = 60          # 最短禁言时长（秒），正整数
max_duration = 2592000     # 最长禁言时长（秒），官方上限 30 天

[recall]
enabled = true             # 启用 recall_message 撤回工具
allowed_groups = []        # 允许撤回的群（目标对象列表），留空不限制；单聊不受此限制

[kick]
enabled = false            # 启用 kick_member 踢人工具；需要官方「移除群成员」接口权限
allowed_groups = []        # 允许踢人的群（目标对象列表），留空不限制
admin_users = []           # 踢人保护名单（目标对象列表），名单内用户不会被移除

[filter]
ignore_other_bots = true   # 忽略其它机器人发送的消息

[advanced]
show_debug_info = false    # 在日志中逐条显示消息按主动还是被动方式发送
reconnect_delay_sec = 5.0  # 断线后重连间隔（秒），1~300
```

:::

## 验证连接并放行平台

1. 保存配置后重启 MaiBot，在日志确认适配器已连接；
2. 在已配置的测试群 **@机器人 发一条纯文本**，或由测试用户发起单聊并发送纯文本，观察 MaiBot 是否创建聊天流并回复；
3. 到 WebUI 聊天页的「适配器策略」检查 `qq` 平台是否被放行。

::: tip 机器人身份自动上报
适配器连接后会自动向 MaiBot 上报身份：默认使用机器人自身的 OpenID，填写 `unified_account_id` 时跟随统一账号。`config/bot_config.toml` 的 `[bot].qq_account` 通常无需手动填写，仅在适配器尚未上报身份时作为备用值回退。
:::

## 出站消息能力

- **文本与 @** — 纯文本按普通消息发送；同一段文本里含 @ 时自动改用 markdown，只有 markdown 能渲染成真实的 @；
- **图片与表情** — jpg / png / gif / webp / bmp，按文件头识别格式；
- **语音** — SILK、MP3、WAV、OGG，同样按文件头识别，扩展名由适配器补上；单条上限 20 MB，非法数据、无法识别的格式或超限的语音直接拒绝发送；
- **视频与文件** — 视频必须是 MP4，视频和文件各自不超过 100 MiB；普通文件可用宿主签发的 `file_ref`，也可以直接给 Base64；
- **拆分规则** — 官方一条消息只能承载一种内容，混合消息按原顺序拆成多条发送；每条各占一个被动回复序号，**群聊每条入站消息最多被动回复 5 次**；
- **上传** — 图片、表情、语音、视频与文件都走官方分片上传取得 `file_info` 后再发送，无需手工处理。

::: tip 语音的来源
适配器只负责把音频按官方接口发出去，不做语音合成。要让它说话，先用 TTS 插件或回复扩展产出音频，再以 `voice` 段交给发送链路。
:::

## 消息身份与资料

官方消息自带一份身份信息，适配器会尽量把它补全后再转给 MaiBot：

- **昵称与群内昵称** — 群聊事件的官方昵称与群内昵称分别对应 `user_nickname` 与 `user_cardname`，比静默同步到的资料优先；
- **群名** — 消息事件通常不带群名，适配器按 `group_openid` 查群基本信息补齐；查不到时保留聊天流里已记录的群名，不会把已有群名冲掉；
- **头像** — 优先用消息下发的头像，取不到时再按用户查询；保存在适配器进程内，重启后重新收集；
- **角色与跨应用标识** — 群成员角色、Union OpenID、Union 群 OpenID 与原始 @ 对象一起写进消息的 `additional_config`，供插件和调试使用。

## 统一 ID 绑定命令

QQ 官方平台的 OpenID 与真实 QQ 号不互通。为了让消息以真实 QQ 号归属（与 OneBot 适配器共享数据），可在聊天内发送绑定命令：

- **`/assign_group_id <群号>`** — 把当前群的 `group_openid` 绑定到指定群号，群聊可用；
- **`/assign_id <QQ号>`** — 把发送者的 OpenID 绑定到指定 QQ 号；
- **`/assign_id @某人 <QQ号>`** — 为被 @ 的用户绑定。

要把旧号已有的记忆整体带到新号，单靠绑定不够——那只是建立关联，历史数据仍留在旧 ID。用[人物迁移](../webui/person-migration.md)把人物资料和长期记忆并过去。

绑定立即生效并持久化到 `data/plugins/<插件ID>/id_map.json`。群号绑定始终生效：入站消息的群 ID 按映射替换，出站发送时自动反查回 `group_openid`。用户绑定只保存关联关系，是否把用户 ID 换成 QQ 号由下面的开关决定。命令消息不进入聊天流，绑定结果以回复回执。

::: tip 启用映射
`[qq_official].enable_mapping` 默认关闭。关闭时用户 ID 保持原始 OpenID，已有的用户绑定和静默资料同步记录都保留不动；打开后，已关联的用户才用 QQ 号参与后续消息。切换模式不搬迁历史数据，同一个人可能因此显示成不同的用户或私聊。

开关也可以在 WebUI 的「其他来源信息同步 → 启用映射」或 QQ 官方适配器页面右上角的模式切换按钮改。
:::

::: tip 什么时候需要 unified_account_id
只做群 / 用户绑定时，ID 数据（统计、表达学习等）可与其它适配器对齐，但聊天流仍按本适配器的账号 ID 区分；要**完全合并聊天流**，在配置文件中填写 `unified_account_id` 指定同一账号 ID——此时该聊天流的出站消息会按路由精确匹配、优先发往另一适配器。
:::

## LLM 工具

三个群管理工具分别在 WebUI 适配器配置页的「禁言工具」「撤回工具」「踢人工具」里设置。保存后适配器按新配置重新连接网关，不需要重启 MaiBot。

### 禁言工具 set_mute

由 `[mute].enabled` 控制（默认开启）。参数为 `msg_id`、`duration`、`reason`，按消息 ID 禁言发送者，所在群从该消息解析，调用官方群禁言接口。`duration` 填 `0` 表示解除禁言，正整数表示施加的秒数。

- **`allowed_groups`** — 允许使用禁言的群，留空不限制；
- **`admin_users`** — 禁言保护名单，名单内用户不会被禁言，但不阻止解除禁言；
- **`min_duration` / `max_duration`** — 时长限制（秒），默认 60 / 2592000；正时长会被夹到这两个值之间，解除禁言不受 `min_duration` 约束；官方上限 30 天，接口限频 60 QPM。

平台限制：只能禁言普通成员（群主、管理员、机器人不可被禁言）；目标用户需能解析出 OpenID——其消息经本适配器接收时自动携带，否则需先 `/assign_id` 绑定。

### 撤回工具 recall_message

由 `[recall].enabled` 控制（默认开启）。参数为 `msg_id`，所在群 / 单聊从该消息解析。`allowed_groups` 限制可撤回的群，留空不限制，单聊不受此限制。

平台限制：发送超过 2 分钟的消息不可撤回；群聊中机器人是群管理员时可撤回自己与普通群成员的消息，否则只能撤回自己发的消息；单聊只能撤回机器人自己发的消息。

### 踢人工具 kick_member

由 `[kick].enabled` 控制，**默认关闭**。参数为 `msg_id` 和可选的 `reason`，从目标成员发过的消息解析出群与用户，调用官方移除群成员接口把单个成员移出群，**不加入群黑名单**。`reason` 只写进操作日志，不影响平台侧。

- **`allowed_groups`** — 允许使用踢人的群，留空不限制；
- **`admin_users`** — 踢人保护名单，名单内用户不会被移除。

前置条件：机器人需要群管理员权限，并且 QQ 开放平台已为其开通「移除群成员」接口——只有开关没有接口权限时调用会失败。工具自身还有两道保护：拒绝移除机器人自己，也拒绝处理 `msg_id` 指向单聊消息或解析不出官方 OpenID 的请求。

### 允许群与保护名单

`allowed_groups` 与 `admin_users` 都是**目标对象列表**，每一项有四个字段：

::: fields
- **`platform`** — `qq`，固定值。
- **`type`** — `group` 或 `user`，由字段本身决定，不用手改。
- **`id`** — 平台上的真实 ID，可以是统一群号 / QQ 号，也可以是 `group_openid` / OpenID。留空会在加载时报错。
- **`name`** — 显示用名称，不参与匹配；改名或被别人复用都不影响权限判断。
:::

在 WebUI 里这两个字段是搜索式多选框：输入群名或用户昵称就能从宿主已知的群、用户里多选，不用手抄 ID。只搜得到宿主已经记录过的目标——群要么产生过聊天流，用户要么在人物资料里出现过。

手写 TOML 时按下面的写法，数组里每一项是一个完整目标：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[mute]
allowed_groups = [
  { platform = "qq", type = "group", id = "123456789", name = "主群" },
]
admin_users = [
  { platform = "qq", type = "user", id = "1026294844", name = "值班同学" },
]

[recall]
allowed_groups = [
  { platform = "qq", type = "group", id = "123456789", name = "主群" },
]

[kick]
enabled = true
allowed_groups = [
  { platform = "qq", type = "group", id = "123456789", name = "主群" },
]
admin_users = [
  { platform = "qq", type = "user", id = "1026294844", name = "值班同学" },
]
```

:::

旧的字符串列表（`allowed_groups = ["123456789"]`）在加载时自动转换为目标对象，`platform` 补 `qq`、`type` 按字段补 `group` 或 `user`、`name` 留空；保存配置后写入的是结构化列表。空字符串会被丢弃，转换后 `id` 仍为空的条目直接报错。

保护名单的匹配范围跟着映射开关走：关闭映射时只用 OpenID 判断，所以名单里要填 OpenID；开启映射后，已关联的 QQ 号、Union ID 和 OpenID 都能命中。

::: tip 未配置工具时的默认行为
未填写工具配置或 `allowed_groups` 留空时，工具不限制群；已有配置中显式设置的 `enabled = false` 仍会关闭对应工具。禁言与撤回默认开启，踢人默认关闭，需要在 WebUI 里打开开关或写 `[kick].enabled = true`。
:::

## 头像接口（开发者）

提供公开 API `adapter.avatar.get`（版本 `1`），与 OneBot 适配器使用相同的[头像协议](/develop/adapters/avatar-api)。参数为 `platform`、`target_id`、`target_type`（`user` 或 `group`，默认 `user`），并接受宿主传入的 `account_id` 和 `scope`。

- **数字 ID** — QQ 号、群号直接用官方 qlogo 地址，返回 `expires_in = 86400`，图片由宿主统一下载、缓存；用 `/assign_id`、`/assign_group_id` 绑过数字 ID 的 OpenID 会按绑定值走这条路径，与映射开关无关；
- **用户 OpenID** — 优先用消息下发时记下的头像；没有记录时按 AppID + OpenID 拼 OpenID 头像路由，所以机器人需要已配置 AppID；
- **机器人自身** — 走 `/users/@me` 的详情接口取头像；
- **群 OpenID** — `status = "unsupported"`，官方没有按群 OpenID 查群头像的接口，这类群请改用数字群号；
- **非 `qq` 平台** — `status = "unsupported"`。

::: warning 戳一戳暂不支持
QQ 开放平台官方 API 目前没有提供戳一戳接口，本适配器暂不支持。
:::

## 验证与排错

**验证连接** — 重启 MaiBot，日志出现连接成功信息；在测试群 @ 机器人发一条纯文本、或由测试用户发起单聊发纯文本，能看到麦麦创建聊天流并回复，即成功。

**验证工具与名单** — 在 WebUI 适配器配置页打开「允许群」，应出现搜索框而不是文本框；选中一个群保存后，`config.toml` 里对应字段写入带 `platform`、`type`、`id`、`name` 的条目。

**返回 401 或鉴权失败** — 核对 AppID 与 AppSecret 是否属于同一个机器人；重置 AppSecret 后，需要同步更新插件配置并重启。

**收不到群聊或单聊消息** — 确认机器人已获得对应场景权限、已开启群聊全量消息；快速创建页面显示「暂不支持进入群聊」时，插件无法绕过平台限制。

**群里 @ 机器人但没有识别** — 到 WebUI 聊天页的「适配器策略」检查 `qq` 平台是否被放行；确认群里已把「机器人可获取的群聊消息范围」设为全部消息。

**绑定后用户 ID 仍是 OpenID** — 绑定只保存关联关系，还要打开「启用映射」；映射关闭是当前设置，不是绑定失败。

**搜不到某个群或用户** — 选择器只列宿主已知的目标：群要先产生过聊天流，用户要先在人物资料里出现过。这类目标也可以手写进 `config.toml`。

**禁言 / 撤回 / 踢人失败** — 查看同一时间段的 `ERROR` 日志，逐项核对：`[mute].enabled` / `[recall].enabled` / `[kick].enabled` 是否为 `true`、目标群是否在对应 `allowed_groups` 内、目标成员是否在 `admin_users` 名单里；官方接口限频 60 QPM，超频会失败；超过 2 分钟的消息不可撤回。

**踢人返回无接口权限** — 日志里出现 `QQ 接口 batch_remove_members 失败: HTTP 4xx code=11253`（`11253` 是开放平台的「无接口访问权限」）时，说明平台没给机器人开通「移除群成员」，工具开关解决不了；同时确认机器人本身有群管理员权限。

**语音发不出去** — 核对音频文件头是否为 SILK、MP3、WAV、OGG 之一（AAC 等格式会被判为不支持），以及是否超过 20 MB。适配器不做语音合成，`voice` 段必须带有效音频数据。

**「有思考但没有回复」** — 群聊每条入站消息最多被动回复 5 次，混合消息拆条会占用回复序号，超出后需等待下一条入站消息；同时查看同一时间段内的 `ERROR` 日志定位失败原因。
