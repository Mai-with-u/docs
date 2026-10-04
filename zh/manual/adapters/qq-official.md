---
title: QQ 官方机器人适配器
---

# QQ 官方机器人适配器

**接入 QQ 官方开放平台机器人，无需登录 QQ 客户端（官方维护）。** QQ 官方机器人适配器让 MaiBot 直连 [QQ 开放平台](https://q.qq.com/)：用 **AppID + AppSecret** 鉴权，通过官方 WebSocket 网关与 OpenAPI 收发单聊与群聊消息，支持文本、@、图片与表情的出站发送，不需要任何 QQ 客户端在线。

::: info 连接方向
`QQ 开放平台 ← QQ 官方机器人适配器（wss 客户端）→ MaiBot 插件消息网关`

适配器用 AppID + AppSecret 换取 access_token，再向 QQ OpenAPI（默认 `https://api.bot.qq.com`）请求网关地址后主动建立连接。全部连接由适配器向外发起，不需要公网回调地址，也不使用 `[maim_message]` 配置段。
:::

适配器仓库（🏛️ 官方维护）：

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

## 安装适配器

1. 在 MaiBot WebUI 的插件市场下载安装「QQ 官方机器人适配器」，或从 GitHub 仓库下载压缩包、解压到 `plugins/` 目录；
2. 在插件列表启用该适配器。

::: info 依赖自动处理
适配器依赖 `aiohttp`（>= 3.14.3），已声明在插件清单中，由 MaiBot 自动处理，无需手动安装。
:::

## 配置适配器连接

配置文件位于 `plugins/qq_official_adapter/config.toml`，也可以在 WebUI 的「QQ 官方机器人适配器 → QQ 开放平台」配置中填写。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true            # 启用适配器，必须为 true 才会建立连接
config_version = "0.4.1"  # 配置结构版本，一般不要改动

[qq_official]
app_id = "开放平台显示的 AppID"
app_secret = "与 AppID 配对的 AppSecret"
api_base_url = "https://api.bot.qq.com"  # QQ 开放平台 API 地址，一般不用改
reconnect_delay_sec = 5.0                # 断线重连间隔（秒）
unified_account_id = ""   # 可选：统一账号 ID（如 NapCat 机器人 QQ 号），填写后与其它 qq 适配器共享聊天流
assign_admin_ids = []     # 可选：允许执行绑定命令的用户（统一 ID 或 OpenID），留空不限制

[mute]
enabled = true            # 启用 mute 禁言工具，见「LLM 工具」
allowed_groups = []       # 允许禁言的群（统一群号或 group_openid），留空不限制

[recall]
enabled = true            # 启用 recall_message 撤回工具
allowed_groups = []       # 允许撤回的群（统一群号或 group_openid），留空不限制；单聊不受此限制
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

- **支持的内容** — 文本、@（含 @ 时以 markdown 发送以渲染真实 @）、图片与表情（jpg / png / gif / webp / bmp）；
- **拆分规则** — 官方一条消息只能承载一种内容，混合消息按原顺序拆成多条发送；每条各占一个被动回复序号，**群聊每条入站消息最多被动回复 5 次**；
- **图片上传** — 图片 / 表情走官方分片上传取得 `file_info` 后再发送，无需手工处理；
- **暂不支持** — 语音、文件出站，调用会直接返回发送失败。

## 统一 ID 绑定命令

QQ 官方平台的 OpenID 与真实 QQ 号不互通。为了让消息以真实 QQ 号归属（与 NapCat 系适配器的数据统一），可在聊天内发送绑定命令：

- **`/assign_group_id <群号>`** — 把当前群的 `group_openid` 绑定到指定群号，群聊可用；
- **`/assign_id <QQ号>`** — 把发送者的 OpenID 绑定到指定 QQ 号；
- **`/assign_id @某人 <QQ号>`** — 为被 @ 的用户绑定。

绑定立即生效并持久化到 `data/plugins/<插件ID>/id_map.json`：入站消息的群 / 用户 ID 按映射替换（原始 OpenID 保留在消息路由信息中），出站发送时自动反查回 OpenID 调用官方 API。命令消息不进入聊天流，绑定结果以回复回执。

::: tip 什么时候需要 unified_account_id
只做群 / 用户绑定时，ID 数据（统计、表达学习等）可与其它适配器对齐，但聊天流仍按本适配器的账号 ID 区分；要**完全合并聊天流**，在配置文件中填写 `unified_account_id` 指定同一账号 ID——此时该聊天流的出站消息会按路由精确匹配、优先发往另一适配器。
:::

## LLM 工具

### 禁言工具 mute

由 `[mute].enabled` 控制（默认开启）。参数为 `msg_id`、`duration`、`reason`，按消息 ID 禁言发送者，所在群从该消息解析，调用官方群禁言接口。约束：

- **`allowed_groups`** — 允许使用禁言的群（统一群号或 `group_openid`），留空不限制；
- **`admin_users`** — 保护名单（统一 QQ 号或 OpenID），名单内用户不会被禁言；
- **`min_duration` / `max_duration`** — 时长限制（秒），默认 60 / 2592000；官方上限 30 天，接口限频 60 QPM。

平台限制：只能禁言普通成员（群主、管理员、机器人不可被禁言）；目标用户需能解析出 OpenID——其消息经本适配器接收时自动携带，否则需先 `/assign_id` 绑定。

### 撤回工具 recall_message

由 `[recall].enabled` 控制（默认开启）。参数为 `msg_id`，所在群 / 单聊从该消息解析。`allowed_groups` 限制可撤回的群，留空不限制，单聊不受此限制。

平台限制：发送超过 2 分钟的消息不可撤回；群聊中机器人是群管理员时可撤回自己与普通群成员的消息，否则只能撤回自己发的消息；单聊只能撤回机器人自己发的消息。

::: tip 未配置工具时的默认行为
未填写工具配置或 `allowed_groups` 留空时，工具默认启用且不限制群；已有配置中显式设置的 `enabled = false` 仍会关闭对应工具。
:::

## 头像接口（开发者）

提供公开 API `adapter.avatar.get`（版本 `1`），与统一 QQ 连接器使用相同的头像协议。参数为 `platform`、`target_id`、`target_type`（`user` 或 `group`，默认 `user`），并接受宿主传入的 `account_id` 和 `scope`。

- 数字 QQ 号、群号返回头像 URL 和 `expires_in = 86400`，图片由宿主统一下载、缓存；
- OpenID 已通过 `/assign_id` 或 `/assign_group_id` 绑定真实数字 ID 时，使用绑定值查询头像；
- 未绑定的 OpenID、非数字绑定值及非 `qq` 平台返回 `status = "unsupported"`。

::: warning 戳一戳暂不支持
QQ 开放平台官方 API 目前没有提供戳一戳接口，本适配器暂不支持。
:::

## 验证与排错

**验证连接** — 重启 MaiBot，日志出现连接成功信息；在测试群 @ 机器人发一条纯文本、或由测试用户发起单聊发纯文本，能看到麦麦创建聊天流并回复，即成功。

**返回 401 或鉴权失败** — 核对 AppID 与 AppSecret 是否属于同一个机器人；重置 AppSecret 后，需要同步更新插件配置并重启。

**收不到群聊或单聊消息** — 确认机器人已获得对应场景权限、已开启群聊全量消息；快速创建页面显示「暂不支持进入群聊」时，插件无法绕过平台限制。

**群里 @ 机器人但没有识别** — 到 WebUI 聊天页的「适配器策略」检查 `qq` 平台是否被放行；确认群里已把「机器人可获取的群聊消息范围」设为全部消息。

**禁言 / 撤回失败** — 查看同一时间段的 `ERROR` 日志：确认 `[mute].enabled` / `[recall].enabled` 为 `true`、目标群在 `allowed_groups` 放行范围；官方接口限频 60 QPM，超频会失败；超过 2 分钟的消息不可撤回。

**「有思考但没有回复」** — 群聊每条入站消息最多被动回复 5 次，混合消息拆条会占用回复序号，超出后需等待下一条入站消息；同时查看同一时间段内的 `ERROR` 日志定位失败原因。
