---
title: 邮件适配器
---

# 邮件适配器

**把专用机器人邮箱接入 MaiBot（社区维护）。** 邮件适配器把一个**专用机器人邮箱**接入 MaiBot：别人把邮件发到机器人邮箱，适配器经 **IMAP** 收信，按发件人为 MaiBot 开一条私聊；麦麦的回复经 **SMTP** 发回，并通过 MIME 线程头（`In-Reply-To` / `References` / `Re:`）挂在同一封会话里。收信、Reply-All 额外收件人和主动发信工具都受同一套地址 / 域名名单约束。

::: info 连接方向
`发件人 → 邮箱服务器（IMAP 收信）→ 邮件适配器 → MaiBot 插件消息网关`
`MaiBot 回复 → 邮件适配器 → 邮箱服务器（SMTP 发信）→ 收件人`

邮箱侧不需要配置 Webhook：适配器优先用 IMAP IDLE 推送，服务器不支持时回退为按间隔轮询。
:::

适配器仓库（🌐 社区维护）：

<Linkcard url="https://github.com/yufei-pan/maibot-email-adapter" title="maibot-email-adapter" description="yufei-pan 维护的邮件适配器插件" />

## 1. 准备机器人邮箱

请准备一个**专用的空邮箱**给机器人使用，不要填你的私人日常邮箱。密码字段填**应用专用密码 / 授权码**，不要填网页登录密码。

::: info 环境要求
适配器依赖 `aioimaplib`（>= 1.2.0）与 `aiosmtplib`（>= 3.0.0），并要求 `maibot-plugin-sdk >= 2.5.1`；以上均声明在 `_manifest.json` 中，由 MaiBot 自动处理。
:::

### Gmail：应用专用密码

1. 用机器人邮箱登录 Google，打开 [两步验证](https://myaccount.google.com/signinoptions/twosv)；
2. 打开 [应用专用密码](https://myaccount.google.com/apppasswords)，名称随意（例如 `maibot`），点创建；
3. 把生成的 16 位密码贴进插件的「密码或授权码」——Google 显示为 `xxxx xxxx xxxx xxxx` 时空格可以一起粘贴，插件会自动去掉空白；
4. **不要**填 Google 网页登录密码。

如果找不到应用专用密码页面，常见原因是：还没开两步验证、两步验证只允许安全密钥、开启了 Advanced Protection，或这是公司 / 学校 Workspace 账号且管理员禁用了应用专用密码。

### 服务商预设

`mailbox.provider` 默认是 `gmail`。选定预设后，插件会自动填入对应的 IMAP/SMTP 主机、端口与加密方式（`custom` 时才需要手填）：

- **Gmail** — IMAP `imap.gmail.com:993`（ssl），SMTP `smtp.gmail.com:587`（starttls）；认证用应用专用密码
- **Outlook** — IMAP `outlook.office365.com:993`（ssl），SMTP `smtp.office365.com:587`（starttls）；个人账户用应用密码
- **QQ 邮箱** — IMAP `imap.qq.com:993`（ssl），SMTP `smtp.qq.com:465`（ssl）；认证用**授权码**，不是 QQ 登录密码

::: warning
Outlook 个人邮箱走应用密码即可；已关闭基本 IMAP 认证的 Microsoft 365 目前无法使用。
:::

### 自定义 IMAP/SMTP

`provider = "custom"` 时插件不会覆盖你填写的主机，需自行配置 IMAP/SMTP 的主机、端口与加密方式（`ssl` 或 `starttls`）。自定义 IMAP 建议优先用 `ssl`（端口 993）。

## 2. 配置 MaiBot 机器人账号

在 Host 的 **机器人设置 → 其他平台** 中添加 `email:你的机器人邮箱`（与适配器里的邮箱地址一致）。不填也能收信，但回复时 Host 会报「平台 email 未配置机器人账号」。

::: tip
Host 1.2.0 及更高版本会自动登记适配器上报的邮件账号，无需手动写入「其他平台」（仅记一条提示日志）。
:::

## 3. 配置适配器连接

运行期配置在 WebUI 插件设置中填写，会写入插件目录下的 `config.toml`（含密码，请勿提交到版本库）。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                # 适配器开关，false 时不连接 IMAP/SMTP
enable_send_email_tool = false  # 主动发信工具 send_email，true 时麦麦可向名单内地址发新邮件

[mailbox]
provider = "gmail"            # 预设：gmail / outlook / qq / custom
address = "mai@example.com"   # 机器人邮箱完整地址，同时作为 SMTP 发件人
password = "应用专用密码或授权码"  # 粘贴时带入的空白会被自动去掉
imap_host = "imap.gmail.com"  # 仅 custom 需要手填
imap_port = 993               # 默认 993
imap_tls = "ssl"              # ssl / starttls
smtp_host = "smtp.gmail.com"  # 仅 custom 需要手填
smtp_port = 587               # 默认 587
smtp_tls = "starttls"         # ssl / starttls

[access]
mode = "allowlist"            # allowlist（白名单，空名单即拒绝所有人）/ denylist
allow_addresses = ["you@example.com"]  # 允许的完整邮箱地址
allow_domains = []            # 允许的域名
deny_addresses = []           # 始终拒绝的地址
deny_domains = []             # 始终拒绝的域名

[receive]
folder = "INBOX"              # 监视的单个 IMAP 文件夹
prefer_idle = true            # 优先 IMAP IDLE，不支持时回退轮询
poll_interval_sec = 30        # 轮询间隔（秒），范围 5–3600
mark_seen_on_inject = true    # 仅 Host 成功接收后标为已读
max_part_bytes = 10485760     # 单个 MIME 部件上限（10 MiB），超大附件不注入二进制

[send]
reply_all = false             # 回复时是否把原信其他收件人加入抄送
```

:::

保存配置后适配器会自动断开旧连接并按新配置重连，通常无需重启 MaiBot。

::: tip 名单规则
- 地址规则优先于域名规则：地址在允许列表里时，即使其域名在拒绝列表也会放行
- 域名只做精确匹配（`alice@mail.example.com` 不会命中名单里的 `example.com`）
- 机器人自己的邮箱地址始终被跳过，避免自循环
- 同一套名单同时约束收信、Reply-All 额外收件人和 `send_email` 工具
:::

## 验证与排错

**验证连接成功** — `plugin.enabled` 为 `true` 且配置完整时，适配器会先连 SMTP 再连 IMAP；日志出现已连接、网关上报就绪即成功。从名单内地址给机器人邮箱发一封信，应在 MaiBot 出现一条新私聊。

**提示「保持空闲」** — 日志出现「邮件适配器保持空闲状态，因为插件或配置未启用」，说明 `plugin.enabled` 未打开；若邮箱地址、密码或主机未填，日志会逐条警告缺失字段。

**登录失败** — 日志警告「IMAP/SMTP 登录失败，请检查应用专用密码或授权码」：确认填的是应用专用密码 / 授权码而非网页登录密码；Gmail 需先开两步验证。

**能收信不能回复** — Host 未登记邮件账号。在机器人设置的「其他平台」添加 `email:你的机器人邮箱`（Host 1.2.0+ 会自动登记）。

**收不到信** — 默认白名单且名单为空会拒绝所有人，先把发件地址加进 `allow_addresses`；另确认邮件确实落在 `receive.folder` 监视的文件夹（默认只监视 `INBOX`）。

**连接异常与重连** — 断线后按 5 / 10 / 20 / 40 / 300 秒退避自动重连；自定义服务器用 `starttls` 连不上时，改用 `ssl` 和端口 993 试试。

**UIDVALIDITY 变化** — 日志警告「IMAP UIDVALIDITY 已变化，UID 游标已重置」属正常现象（邮箱服务器重建了文件夹），适配器会重新拉取未处理的邮件。