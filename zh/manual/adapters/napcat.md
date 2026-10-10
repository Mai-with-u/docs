---
title: NapCat 适配器（已归档）
---

# NapCat 适配器（已归档）

::: warning 该独立适配器已归档
独立的 NapCat 适配器（仓库 `MaiBot-Napcat-Adapter`）已**停止演进并标记归档**，其全部能力已并入**统一 QQ 连接器**（仓库 `MaiBot-SnowLuma-Adapter`，v1.0.0 起同时支持 SnowLuma / NapCat 客户端）。新用户请改用[统一 QQ 连接器](./qq-local-client.md)；本页仅作历史参考，不再更新。
:::

归档的只是独立适配器仓库——**NapCat 客户端本身照常维护**。统一 QQ 连接器连接 NapCat 前的准备步骤与本页一致，下文仍可参考。

## 安装 NapCat 并登录机器人 QQ 号

适配器只负责「MaiBot ↔ NapCat」这段连接，NapCat 本身的安装、登录与启动请按其官方文档完成。

<Linkcard url="https://doc.napneko.icu/" title="NapCat 官方文档" description="安装 NapCat、登录 QQ、配置 WebSocket 服务" />

1. 按官方文档安装 NapCat，并登录你的机器人 QQ 号；
2. 确认 NapCat 正常运行，且该 QQ 号已上线。

::: warning 这个 QQ 号就是机器人本体
NapCat 登录的 QQ 号必须与 `bot_config.toml` 里的 `qq_account` 完全一致，MaiBot 才能识别「机器人自己」发出的消息。两处不一致时，麦麦会把自己的消息当成别人的。
:::

## 开启正向 WebSocket 服务器

在 NapCat 的配置里开启**正向 WebSocket 服务器**，并记下它监听的**端口**和**访问令牌**：

- **端口** — 默认 `3001`。把它填到统一 QQ 连接器的 `client.port`。
- **访问令牌（Token）** — 可选。开启后连接方必须带相同 token 才能握手，填到 `client.token`。

::: tip 分清三种 Token
- **NapCat WebUI Token** — 用于登录 NapCat 自带的网页管理界面，与适配器无关。
- **NapCat 正向 WebSocket Token** — 在「正向 WebSocket」服务里设置的那个，才是这里要填的 `client.token`。
- **MaiBot WebUI Token** — 用于登录 MaiBot 自己的网页管理界面，与适配器无关。
:::

## 配置 MaiBot 的机器人账号

编辑 `config/bot_config.toml` 的 `[bot]` 节，让 MaiBot 认识机器人自己：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"        # SnowLuma / NapCat 这类本地客户端适配器都用 qq
qq_account = "你的QQ号"  # 必须与 NapCat 登录的 QQ 号一致
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — 填 `"qq"`，即本地客户端适配器的平台标识。
- **`qq_account`** — 填 NapCat 登录的那个 QQ 号（字符串格式），两处必须完全一致。

也可以在 WebUI 的**适配器设置**里设置：点页面顶部「全局默认规则」卡片右侧的 **平台账号**，平台选 `qq`，账号填机器人 QQ 号。

## 改用统一 QQ 连接器

安装统一 QQ 连接器后，在 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 的 `[client]` 节填写连接信息：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true           # 启用适配器，必须为 true 才会建立连接
config_version = "2.5.0" # 配置结构版本，一般不要改动

[client]
client_type = "napcat"   # 连接 NapCat；留 "auto" 则连接后自动判定
server = "127.0.0.1"     # NapCat 地址；同机回环地址，Docker 填服务名
port = 3001              # 正向 WebSocket 端口，与 NapCat 设置一致
token = ""               # 访问令牌；NapCat 开启鉴权后填相同 token
```

:::

与旧独立适配器相比，统一 QQ 连接器的变化：

- **内置名单移除** — 旧 `[chat]` 的群聊 / 私聊名单已移除，入站通行由宿主适配器策略（WebUI 适配器设置或 `config/adapter_policy.toml`）统一控制，默认全部放行；
- **工具开关归类** — 主动私聊等工具开关移到 `[chat_abilities]` 节，默认全部关闭；
- **配置段改名** — 旧 `[napcat_server]`（含 `host` 字段）在加载时自动迁移到 `[client]`（`server` 字段），无需手动改。

完整配置说明、能力差异与排错见[统一 QQ 连接器](./qq-local-client.md)。

## 旧版独立适配器参考（历史）

- **仓库** — `Mai-with-u/MaiBot-Napcat-Adapter`，最后版本 v1.4.0（2026-08-19），适配 MaiBot ≥ 1.2.0；仓库已标记归档，不再发布新版本。
- **历史能力** — 支持群聊、私聊、语音、图片、合并转发、主动私聊与多实例连接；透传大部分 NapCat OneBot action API。
- **历史提示** — 旧仓库 Issues 可查阅，但问题请到统一 QQ 连接器仓库反馈。

## 验证与排错

**验证连接** — 插件日志出现连接成功信息，且向已放行的群 @ 机器人能收到回复，即成功。

**连不上、日志反复「连接失败」** — 核对 `client.server` / `port` 与 NapCat 正向 WebSocket 监听地址一致；NapCat 是否已开启正向 WS 服务、端口是否被防火墙拦截；若开启鉴权，`client.token` 是否与 NapCat 设置一致。

**连接成功但群里 @ 机器人没反应** — 查宿主适配器策略（WebUI 适配器设置 / `config/adapter_policy.toml`）是否放行该群或该私聊；确认 `plugin.enabled = true`。

**麦麦把自己的消息当成别人** — `bot_config.toml` 的 `qq_account` 与 NapCat 登录的 QQ 号不一致，改成一致后重启主程序。

其它排错项见[统一 QQ 连接器](./qq-local-client.md)的「验证与排错」。
