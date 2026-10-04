---
title: SnowLuma 适配器
---

# SnowLuma 适配器

**登录你自己的 QQ 号接入（官方维护）。** SnowLuma 适配器让 MaiBot 通过 [SnowLuma](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter) 接入 QQ，收发消息、处理群聊和私聊，支持语音、表情解析与主动私聊。它是 MaiBot **官方维护的插件**，只有插件模式，直接在 MaiBot 进程内运行。

::: tip 官方持续维护
SnowLuma 适配器由 MaiBot 官方团队持续维护，遇到问题欢迎在 [GitHub Issues](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter/issues) 反馈。
:::

::: warning 升级到 MaiBot 1.3.0 时
MaiBot 1.3.0 需要配合最新版本的 SnowLuma 适配器使用：新版适配器已合并 NapCat 适配器，升级后请**重新设置黑白名单**（原名单不会自动沿用）。
:::

适配器仓库（🏛️ 官方维护）：

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="MaiBot-SnowLuma-Adapter" description="MaiBot 官方维护的 SnowLuma QQ 适配器插件" logo="/title_img/mai.png" />

消息流转：**QQ → SnowLuma → 适配器插件（MaiBot 内部）→ MaiBot**

## 1. 准备 SnowLuma 并登录机器人 QQ 号

适配器只负责「MaiBot ↔ SnowLuma」这段连接，SnowLuma 本身的部署与登录请按其文档完成，并确保它已启用**正向 WebSocket 服务器**。默认连接 `ws://127.0.0.1:3001`（同机）。

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="SnowLuma 官方文档" description="部署 SnowLuma、登录 QQ、启用正向 WebSocket 服务" />

::: warning 这个 QQ 号就是机器人本体
SnowLuma 登录的 QQ 号必须与后面 `bot_config.toml` 里的 `qq_account` 完全一致，MaiBot 才能识别「机器人自己」发出的消息。
:::

## 2. 配置 MaiBot 的机器人账号

编辑 `config/bot_config.toml` 的 `[bot]` 节，让 MaiBot 认识机器人自己：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"       # NapCat / SnowLuma 这类本地客户端适配器都用 qq
qq_account = "你的QQ号"  # 必须与 SnowLuma 登录的 QQ 号一致
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — 填 `"qq"`，即本地客户端适配器的平台标识。
- **`qq_account`** — 填 SnowLuma 登录的那个 QQ 号（字符串格式），两处必须完全一致。

也可以在 WebUI 中设置：`麦麦设置 → 基础 → 平台账号`，平台选 `qq`，账号填机器人 QQ 号。

## 3. 配置适配器连接

配置文件位于 `plugins/MaiBot-SnowLuma-Adapter/config.toml`。下面是一份**完整可复制**的配置模板，按注释修改即可：

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true          # 启用适配器，必须为 true 才会建立连接
config_version = "1.0.6"  # 配置结构版本，一般不要改动

[luma_client]
server = "127.0.0.1"   # SnowLuma 地址；同机回环地址
port = 3001            # 正向 WebSocket 端口，与 SnowLuma 设置一致
token = ""             # 访问令牌；SnowLuma 开启鉴权后填相同 token
connection_id = ""     # 连接标识；多实例时区分链路，见本节末尾
reconnect_delay_sec = 5.0   # 断线重连等待（秒）
action_timeout_sec = 10.0   # 动作接口超时（秒）

[chat]
enable_chat_list_filter = true    # 名单过滤，默认开启
show_dropped_chat_list_messages = true  # 记录被丢弃消息日志（排错时开）
group_list_type = "whitelist"     # 群聊名单模式：whitelist / blacklist
group_list = []                   # 群号列表，先加名单再测试，见第 4 节
private_list_type = "whitelist"   # 私聊名单模式：whitelist / blacklist
private_list = []                 # 用户 ID 列表
ban_user_id = []                  # 全局屏蔽的用户 ID，消息直接丢弃
ban_qq_bot = false                # 屏蔽 QQ 官方机器人消息
```

:::

### 多实例 `connection_id`

同一台 MaiBot 连多条 SnowLuma 链路时，为每条链路配**不同的 `connection_id`**（如 `primary`、`secondary`），用它作为路由作用域标识，避免链路互相干扰。

## 4. 先加名单，再测试

聊天名单过滤**默认开启且名单为空**——不加名单，任何群聊和私聊消息都会被丢弃，这是接上 QQ 后「没反应」最常见的原因。正确做法是**先把要接入的群 / 用户加进名单，再测试**：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = true
group_list = ["123456789"]        # 你的群号
private_list = ["987654321"]      # 要私聊的用户 ID
```

:::

测试时想临时放行全部消息，可先关掉过滤观察连通性：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = false   # 仅临时测试，调试完记得加回名单再打开
```

:::

::: tip 还有一层主程序名单
除了适配器自己的 `[chat]` 名单，MaiBot 主程序在 `config/adapter_policy.toml` 里还有一套统一的群聊 / 私聊访问策略。**两层都放行，消息才会进入对话**；排查"没反应"时两层都要看，入口见 [适配器管理](../webui/adapter-management.md)。
:::

## 验证与排错

**验证连接** — WebUI 插件列表已加载；日志出现 `SnowLuma WebSocket 已连接`；群里 @ 机器人有回复，即成功。

**连不上** — 核对 `luma_client.server` / `port` 与 SnowLuma 正向 WebSocket 监听地址一致；SnowLuma 是否已开启正向 WS 服务、端口是否被防火墙拦截、是否同机；若开启鉴权，`token` 是否与 SnowLuma 设置一致。

**连接成功但群里 @ 机器人没反应** — 首选查聊天名单：确认该群已加入 `group_list`；可临时设 `enable_chat_list_filter = false` 或打开 `show_dropped_chat_list_messages` 观察丢弃日志。其次确认 `plugin.enabled = true`。

**能收不能发** — 机器人有无发言权限；`action_timeout_sec` 是否太短；确认 `bot_config.toml` 的 `qq_account` 与 SnowLuma 登录 QQ 一致。

**麦麦把自己的消息当成别人** — `bot_config.toml` 的 `qq_account` 与 SnowLuma 登录的 QQ 号不一致，改成一致后重启主程序。