---
title: iMessage 适配器
---

# iMessage 适配器

**把 Apple iMessage 接入 MaiBot（社区维护）。** iMessage 适配器通过 **Photon Spectrum** 云端服务将 MaiBot 接入 Apple iMessage，实现消息双向收发。它**不需要**你自己的 Mac，也不依赖 BlueBubbles：插件在本地启动一个 Node.js 侧车进程，经 `spectrum-ts` SDK 连接 Photon 云端（云端 Mac 服务器），由 Photon 转发到 Apple iMessage。

::: info 连接方向
`MaiBot（插件）← 本地 WebSocket 127.0.0.1:18763 → Node.js 侧车 ← spectrum-ts SDK → Photon 云端 ←→ Apple iMessage`
:::

适配器仓库（🌐 社区维护）：

<Linkcard url="https://github.com/mayan613/MaiBot-iMessage-Adapter" title="MaiBot-iMessage-Adapter" description="mayan613 维护的 iMessage 适配器插件" />

## 1. 准备运行环境

- **MaiBot ≥ 1.0.0** — 插件宿主
- **Node.js ≥ 18** — 侧车运行时。插件优先使用系统自带的 Node.js；若未找到，会自动通过 `nodeenv` 在插件目录下的 `.nodeenv/` 准备一份，无需手动处理
- **Photon 账号** — iMessage 云端服务，在 [app.photon.codes](https://app.photon.codes) 注册

适配器首次启动时，会自动执行 `npm install` 拉取侧车依赖并编译 TypeScript（约 150 个包，可能需要 1–2 分钟），后续启动会跳过此步骤。

## 2. 获取 Photon 凭证与号码

1. 在 [app.photon.codes](https://app.photon.codes) 注册账号并创建项目；
2. 在 [Photon Dashboard](https://app.photon.codes/dashboard/) 获取 **项目 ID（Project ID）** 与 **项目密钥（Project Secret）**，稍后填入适配器配置；
3. 记录 Photon 为项目分配的 **iMessage 号码**（形如 `+10000000000`），配置 MaiBot 机器人账号时要用。

::: warning 免费计划限制
- 免费版 Photon **仅支持手机号**，不支持电子邮件地址的 iMessage；
- 免费版**不能主动发起会话**，必须先由对方通过 iMessage 向 Photon 号码发送首条消息后，才能回复；
- 初次使用前，务必先通过 iMessage 向 Photon 分配的号码发送一条消息，否则会出现 `AuthenticationError: [spectrum-imessage] Target not allowed for this project`。
:::

## 3. 配置适配器连接

在 MaiBot WebUI 的插件配置页面修改。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true          # 启用适配器，false 时不启动侧车、不连接 Photon

[photon]
project_id = "你的项目 ID"      # Photon 控制台创建项目后获取
project_secret = "你的项目密钥"  # 妥善保管，切勿泄露

[bridge]
ws_port = 18763                # 本地 WebSocket 端口，仅监听 127.0.0.1
max_retries = 3                # 侧车异常退出后的最大自动重启次数
retry_interval = 3.0           # 侧车重启间隔（秒），建议不低于 2
max_attachment_size_mb = 10    # 最大附件大小（MB），建议 1–50
```

:::

## 4. 配置 MaiBot 机器人账号

MaiBot 核心仍用主配置里的平台账号识别「机器人自己」，不设置将无法正常发送消息。编辑 `config/bot_config.toml` 的 `[bot]` 段，把 Photon 分配的号码加入 `platforms`：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = ""                           # 若没有主要平台可保持为空
qq_account = ""                         # 同上
platforms = ["imessage:+10000000000"]   # 格式：imessage: + Photon 分配的号码
nickname = "麦麦"
```

:::

也可以在 WebUI 中设置：`麦麦设置 → 基础 → 平台账号右侧的加号 → 平台填 imessage，账号填 +10000000000`（请换成你自己的项目号码）。

## 验证与排错

**验证连接状态** — 在聊天中发送 `/imessage_status`，可查看连接状态、侧车 PID、重启次数。

**手动重连** — 发送 `/imessage_reconnect`，手动重连侧车与 Photon。

**状态显示未连接** — 多为侧车依赖未就绪或编译失败；适配器会自动执行 `npm install && tsc`，查看日志确认是否成功。

**Photon 认证失败** — `project_id` / `project_secret` 配置错误，在 WebUI 插件配置页面核对凭证是否正确。

**侧车反复重启** — 多为网络问题或 Photon 服务异常，查看 MaiBot 日志中带 `[侧车]` 前缀的消息。

**能收不能发** — 网关未就绪，等待 Photon 完全连接后重试，或用 `/imessage_status` 确认状态；同时确认 `[bot]` 的 `platforms` 已正确填写。

**端口冲突** — `18763` 被其他程序占用时，在 WebUI 中修改「桥接端口」配置。

::: info 不支持的消息类型
受 Photon 云端服务与 MaiBot 能力限制，以下消息类型无法正常收发，插件会自动拦截并记录日志：
- **语音消息（`.caf`）** — Photon 附件服务对 iMessage 语音附件下载存在 bug（gRPC `UNAVAILABLE`），已在侧车层拦截；
- **实况图片（`.heic` / `.heif`）** — Apple 实况图片格式无法被解析，已在侧车层拦截；
- **联系人名片（vCard）** — 可作为 meta 信息接收，但不会生成可读消息内容。
:::