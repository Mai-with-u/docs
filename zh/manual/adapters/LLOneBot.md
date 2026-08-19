---
title: 使用 LLOneBot（LuckyLilliaBot）连接 QQ
---

# 使用 LLOneBot（LuckyLilliaBot）连接 QQ

LLOneBot（LuckyLilliaBot，简称 LLBot）是一个基于 NTQQ 的 QQ 机器人协议端，支持 OneBot 11、Satori、Milky 协议。MaiBot 没有独立的 LLOneBot 插件，而是复用 **NapCat 适配器**连接 LLBot 的 **OneBot 11 正向 WebSocket（WebSocket 服务器）**：适配器作为客户端主动连接 LLBot，再通过插件消息网关把消息交给 MaiBot，不需要额外运行旧版独立适配器。

该方案对新注册或登录不稳定的 QQ 账号有时会有一定帮助；如果你已有 LLBot 环境，也可以直接用它替代 NapCat 完成 QQ 接入。

::: info 连接方向
`LLBot WebSocket 服务器 ← NapCat 适配器客户端 → MaiBot 插件消息网关`

插件版不使用 `[maim_message]`，也不需要把 LLBot 配置成“反向 WebSocket”。在 LLBot 中只需开启 OneBot 11 的**正向 WebSocket**。
:::

适配器源码：[Mai-with-u/MaiBot-Napcat-Adapter](https://github.com/Mai-with-u/MaiBot-Napcat-Adapter)
LLBot 源码与文档：[LLOneBot/LuckyLilliaBot](https://github.com/LLOneBot/LuckyLilliaBot) · [官方文档](https://www.llonebot.com/guide/introduction)

::: warning 风控提示
LLBot 属于非官方 QQ 协议端，任何非官方协议端都无法完全避免账号风控。建议使用专用 QQ 小号并遵守平台规则；LLBot 的纯协议（无头）模式存在掉线风险，账号体质不佳时慎用。
:::

## 1. 安装并登录 LLBot

LLBot 提供 Desktop（Windows 图形界面）、CLI（Linux / macOS）和 Docker 三种安装方式，选择适合你的环境即可，具体步骤见[官方安装文档](https://www.llonebot.com/guide/choice_install)：

- **Desktop 版** — 解压后双击 `llbot.exe` 并点击启动。有头模式必须由 LLBot 拉起 QQ，自己手动打开的 QQ 不会被 LLBot 接管。
- **CLI 版** — 解压后运行 `./start.sh`，按终端提示扫码登录，或访问 WebUI 登录（默认 `http://localhost:3080`）。
- **Docker 版** — 运行一键安装脚本或直接拉取镜像，然后在容器日志或 WebUI 中扫码登录。

LLBot 支持两种运行方式：**有头模式**由 LLBot 拉起原版 NTQQ 客户端，稳定性较好；**无头模式**（纯协议）不依赖 QQ 客户端、资源占用更低，但存在掉线风险。

登录时使用的 QQ 号就是机器人的账号。登录成功后，后续的协议配置都在 LLBot WebUI（默认 `http://localhost:3080`）中完成。

## 2. 开启 OneBot 11 正向 WebSocket

在 LLBot 中启用 OneBot 11 协议并新建一条**正向 WebSocket（`ws`）**连接，可通过以下任一方式：

- **LLBot WebUI**（默认 `http://localhost:3080`）— 在 OneBot11 配置中新建或启用正向 WS，填写端口和 Token 后保存
- **LLBot Desktop** — 在“Bot 配置 → OneBot11”中操作
- **直接修改配置文件** `data/config_<你的QQ号>.json`（Windows / CLI 版位于 `bin/llbot/data/`；Docker 版挂载在 Volume 中）：

::: code-group

```json5 [JSON5 ~vscode-icons:file-type-json~]
{
  "ob11": {
    "enable": true,     // 是否启用 OneBot 11 协议
    "connect": [
      {
        "type": "ws",          // 正向 WS：LLBot 作为 WebSocket 服务器
        "enable": true,
        "port": 3001,          // 监听端口，常用 3001
        "heartInterval": 60000,
        "token": "",           // 访问 Token，未设置则留空
        "reportSelfMessage": false,   // 建议保持 false，不处理自己发出的消息
        "reportOfflineMessage": false,
        "messageFormat": "array"
      }
    ]
  }
}
```

:::

关键项说明：

- **`type: "ws"`** — 必须是正向 WebSocket。LLBot 的“反向 WebSocket”是让 LLBot 作为客户端去连接你提供的地址，插件版适配器不需要它。
- **`port`** — 正向 WebSocket 监听端口，常用 `3001`，稍后填入适配器。
- **`token`** — 正向 WebSocket 的访问 Token。如果设置了，稍后把同一个 Token 填入适配器；未设置则留空。
- **`messageFormat`** — 保持 `array`。
- **`reportSelfMessage`** — 建议保持 `false`，避免机器人处理自己刚发出的消息。

不要把 LLBot WebUI Token、MaiBot WebUI Access Token 和 OneBot WebSocket Token 混用。

::: tip 仅监听本地
LLBot 默认 `onlyLocalhost: true`，只监听本地地址。如果 MaiBot 与 LLBot 不在同一台机器，或用 Docker 分开部署，需要把 `onlyLocalhost` 改为 `false`（让 LLBot 监听可访问的网卡地址）、设置强 Token，并用防火墙限制来源。
:::

## 3. 配置 MaiBot 的机器人账号

在 WebUI 基础配置中填写平台和 QQ 账号，或编辑 `config/bot_config.toml`：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"
qq_account = "123456789"
```

:::

`qq_account` 必须与 LLBot 实际登录的 QQ 号一致。LLBot 用该账号登录 QQ；MaiBot 核心用这个配置识别机器人自己发送的消息。插件版虽然不使用 `[maim_message]`，但仍然需要 `[bot].qq_account`。

## 4. 安装并启用适配器

在 MaiBot WebUI 中打开“插件管理”，从插件市场安装 **NapCat Adapter**，然后手动启用。插件默认配置为禁用，安装成功不等于已经运行。

如果插件市场不可用，也可以把仓库克隆到 MaiBot 的 `plugins/` 目录：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
git clone https://github.com/Mai-with-u/MaiBot-Napcat-Adapter.git plugins/MaiBot-Napcat-Adapter
```

:::

手动克隆后仍建议在 WebUI 中完成启用和配置。插件目录名可能因安装方式而异，不要依赖固定目录名判断是否安装成功。

## 5. 配置连接

在 NapCat Adapter 的插件设置中，把连接地址指向 LLBot：

**`napcat_server.host`** — LLBot 的地址。同机运行填 `127.0.0.1`；不在同一台机器时填 LLBot 所在设备的局域网地址；使用项目 Docker Compose 时填服务名 `llbot`。

**`napcat_server.port`** — LLBot 正向 WebSocket 的监听端口，例如 `3001`，必须与第 2 步一致。

**`napcat_server.token`** — LLBot 正向 WebSocket 的访问 Token；未设置则留空。

适配器会连接类似 `ws://127.0.0.1:3001` 的地址。保存配置后，插件的 `on_config_update` 会停止旧连接并按新配置重新连接，通常不需要重启 MaiBot。

::: warning Docker 网络
MaiBot 与 LLBot 在不同容器时，不要把地址写成 `127.0.0.1`（它只指向容器自身）。按部署方式填写 Compose 服务名或 `host.docker.internal`。
:::

## 6. 配置聊天名单

适配器默认启用聊天名单过滤，群聊与私聊均默认为白名单，初始名单为空。未加入名单的消息会被丢弃。

测试时可在插件设置中临时关闭名单过滤；正式使用建议保留过滤并把允许的群号或 QQ 号加入对应名单。例如：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = true
show_dropped_chat_list_messages = true
group_list_type = "whitelist"
group_list = ["你的QQ群号"]
```

:::

## 验证与排错

**确认插件已加载** — WebUI 插件列表显示 NapCat Adapter 已启用，MaiBot 日志没有加载错误。

**确认连接方向** — LLBot 运行的是 WebSocket 服务器，适配器日志显示已连接到 LLBot；不要在 LLBot 里配置反向 WebSocket。

**已连接但不收消息** — 首先检查群聊或私聊白名单，并临时打开丢弃消息日志；然后确认 LLBot 已登录 QQ、正向 WebSocket 已启用，端口与适配器一致。

**连接失败** — 核对地址、端口和 WebSocket Token。同机填写 `127.0.0.1`；Docker / 跨设备部署检查 `onlyLocalhost`、端口映射和防火墙。

**改配置后没有重连** — 查看插件配置更新日志；只有热更新回调失败时，才把完整重启 MaiBot 作为兜底。

**无头模式频繁掉线** — LLBot 纯协议模式存在掉线风险，情况严重时改回有头模式或使用其他协议端（如 [NapCat](./napcat.md)）。

## 相关文档

- [使用 NapCat 适配器连接 QQ](./napcat.md) — 本方案使用的适配器插件的完整用法
- [适配器概览](./index.md) — QQ 及其他平台适配器的选择
- LLBot 官方文档：[项目介绍](https://www.llonebot.com/guide/introduction) · [快速安装](https://www.llonebot.com/guide/choice_install) · [配置说明](https://www.llonebot.com/guide/config) · [常见问题](https://www.llonebot.com/guide/faq)
- LLBot 源码：[LLOneBot/LuckyLilliaBot](https://github.com/LLOneBot/LuckyLilliaBot)