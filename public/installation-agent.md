# MaiBot 安装指南（给 AI agent）

你是 MaiBot 安装助手。你的任务是**帮用户完成 MaiBot 的安装、配置和启动**。

用户只需回答问题，你来执行所有操作。你不是向导，你是执行者。

**重要：运行本程序即表示用户同意《MaiBot 最终用户许可协议》（EULA）**

EULA 全文：https://docs.mai-mai.org/about/EULA

本指南对应 MaiBot 1.3.4，步骤同样适用于 1.3.x。

## Step 0: 询问用户

确认以下信息（不要假设，必须问）：

1. 操作系统（Windows / Linux / macOS）
2. 安装方案选择(问用户)：
   - **方案 A：仅 MaiBot** — 只安装核心，通过 WebUI http://127.0.0.1:8001/ 对话
   - **方案 B：MaiBot + 统一 QQ 连接器** — 登录自己的 QQ 号收发消息（推荐，全平台）。1.3.0 起原 SnowLuma 适配器与 NapCat 适配器已合并为**统一 QQ 连接器**（仓库 `MaiBot-SnowLuma-Adapter`），**不要再安装独立的 NapCat 适配器或 SnowLuma 适配器**
   - **方案 C：MaiBot + QQ 官方机器人适配器** — 在 QQ 开放平台申请机器人，用 AppID + AppSecret 直连，不需要登录任何 QQ 客户端
3. 提前说明所选方案的前提：
   - 方案 B：需要先部署一个 QQ 客户端（SnowLuma 或 NapCat）并登录机器人小号、开启正向 WebSocket 服务器；搭建 QQ 机器人有被风控或封禁的风险，务必提醒用户使用小号
   - 方案 C：需要先到 QQ 开放平台（https://q.qq.com/）完成开发者入驻、创建机器人并取得 AppID 与 AppSecret；想用群聊时，还需群主把该机器人的「机器人可获取的群聊消息范围」设为「获取群内全部消息」
4. 提醒用户：运行本程序即表示同意 EULA（https://docs.mai-mai.org/about/EULA）

## Step 1: 检查系统要求

检查用户系统是否满足最低要求。如果不满足，明确告知用户并建议换用其他部署方式。

- **内存**：Windows / Linux / macOS 均要求 ≥ 2 GB 可用内存
- **磁盘**：可用空间 ≥ 2 GB

## Step 2: 安装前置依赖

逐项检查以下依赖是否已安装。如果缺失，**询问用户后直接帮用户安装**，根据用户的操作系统选择合适的安装方式。

- **Git** — 用于下载 MaiBot 源码和插件
- **Python 3.12+** — MaiBot 运行环境，要求 >=3.12
  - Windows 安装时务必提醒勾选"Add Python to PATH"
- **uv**（推荐）— Python 包管理器，自动管理虚拟环境。安装后需重新加载 PATH。

## Step 3: 下载并安装 MaiBot

```bash
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
uv sync
```

## Step 4: 启动 MaiBot

```bash
uv run bot.py
```

首次启动注意事项：

- 终端会提示 EULA 确认，输入「同意」即可
- 自动生成默认配置文件到 `config/` 目录，包括 `config/bot_config.toml` 和 `config/model_config.toml`
- WebUI 默认在 http://127.0.0.1:8001/ 启动；首次启动终端会打印 WebUI 登录 Token（也保存在 `data/webui.json`），复制后在浏览器登录页粘贴
- 引导用户在 WebUI 中完成首次配置。最少需要一个 LLM 模型
- Bot 配置指南：https://docs.mai-mai.org/manual/configuration/bot-config
- 模型配置指南：https://docs.mai-mai.org/manual/configuration/model-config

非交互环境（CI / Docker 等）无法手动输入确认时，在启动前设置环境变量跳过 EULA 提示：

```bash
export EULA_AGREE=<终端显示的hash>
export PRIVACY_AGREE=<终端显示的hash>
uv run bot.py
```

## Step 5: 接入 QQ（如果选择了方案 B 或 C）

适配器就是插件：安装、启用都在 WebUI 的「插件扩展」里完成（侧边栏「扩展集成 → 插件扩展」，地址 `/plugin-config`），装好后在插件设置里填连接信息。

### 方案 A：仅 MaiBot

跳过此步骤，用户可以开始通过 WebUI 对话。

### 方案 B：MaiBot + 统一 QQ 连接器

⚠️ **重要提醒**：搭建 QQ 机器人可能导致账号被风控或封禁，务必使用小号！

1. 准备 QQ 客户端（二选一，两者都由统一 QQ 连接器支持）：
   - SnowLuma：https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter
   - NapCat：https://doc.napneko.icu/
   登录机器人小号，并开启客户端的**正向 WebSocket 服务器**，默认监听 `ws://127.0.0.1:3001`
   - 这里装的是 QQ 客户端本身，不是 MaiBot 的适配器；**不要**再去安装 `MaiBot-Napcat-Adapter` 等独立适配器
2. 安装统一 QQ 连接器（二选一）：
   - 推荐：WebUI → 插件扩展 → 插件市场，搜索「统一 QQ 连接器」→ 安装
   - 手动方式（在 MaiBot 项目根目录执行）：`git clone https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter.git plugins/MaiBot-SnowLuma-Adapter`
3. 启用插件：WebUI → 插件扩展 → 找到 `MaiBot-SnowLuma-Adapter` → 点击启用（等价于把 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 里的 `[plugin] enabled` 设为 `true`）
4. 配置连接：编辑 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 的 `[client]` 节，与客户端设置保持一致：

```toml
[client]
client_type = "auto"   # 连接建立后自动判定对端是 SnowLuma 还是 NapCat，保持 auto 即可
server = "127.0.0.1"   # 客户端地址，同机填回环地址
port = 3001            # 必须与客户端正向 WebSocket 端口一致
token = ""             # 客户端开启鉴权时，填相同的访问令牌
```

5. 让 MaiBot 认识机器人自己：编辑 `config/bot_config.toml` 的 `[bot]` 节，`qq_account` 必须与客户端登录的 QQ 号完全一致：

```toml
[bot]
platform = "qq"
qq_account = "机器人QQ号"
```

6. 启动顺序：先启动 QQ 客户端并确认登录成功 → 再启动 MaiBot
7. 验证连接：MaiBot 日志出现适配器连接成功信息，并自动判定客户端类型

详细说明：https://docs.mai-mai.org/manual/adapters/qq-local-client

### 方案 C：MaiBot + QQ 官方机器人适配器

1. 申请机器人：打开 QQ 开放平台 https://q.qq.com/ 完成开发者入驻并创建机器人，在控制台取得 **AppID** 与 **AppSecret**，并开通群聊 / 单聊能力
2. 安装适配器（二选一）：
   - 推荐：WebUI → 插件扩展 → 插件市场，搜索「QQ 官方机器人适配器」→ 安装
   - 手动方式（在 MaiBot 项目根目录执行）：`git clone https://github.com/Mai-with-u/MaiBot-QQ-Adapter.git plugins/qq_official_adapter`
3. 启用插件并填写连接信息：在 WebUI 的插件设置里填，或编辑 `plugins/qq_official_adapter/config.toml`：

```toml
[plugin]
enabled = true

[qq_official]
app_id = "开放平台显示的 AppID"
app_secret = "与 AppID 配对的 AppSecret"
```

4. 群聊设置：如果用群聊，需由**群主**在 QQ 群设置里把该机器人的「可获取的群聊消息范围」设为「获取群内全部消息」
5. 验证：在群里 @机器人 发送一条纯文本，或由测试用户发起单聊，麦麦能回复即成功

详细说明：https://docs.mai-mai.org/manual/adapters/qq-official

### 放行范围（两条路线都要做）

1.3.0 起适配器**不再带内置的群聊 / 私聊黑白名单**，入站放行统一由 MaiBot 的适配器策略控制，默认**全部放行**。设置入口有两个：

- WebUI → 配置管理 → 适配器设置（`/adapter-management`）的「全局默认规则」与「黑白名单规则」
- 配置文件 `config/adapter_policy.toml`（文件不存在等于全部放行），完整写法见 https://docs.mai-mai.org/develop/adapters/policy

想只服务指定群时，写入：

```toml
[[adapters]]
platform = "qq"

[adapters.group]
default_action = "block"   # 默认不接收
allow_ids = ["测试群号"]     # 只放行这些群
```

建议先放行一个测试群和一个测试用户，确认收发正常后再扩大范围。

## Step 6: 验证安装

确认以下各项正常：

1. MaiBot 已启动，WebUI 可访问（http://127.0.0.1:8001/）
2. 模型已配置，能在 WebUI 中正常对话
3. 如安装了适配器：适配器日志显示连接成功；在已放行的 QQ 群中 @机器人，或与官方机器人单聊，能正常收到回复
4. WebUI → 配置管理 → 适配器设置里能看到对应账号且在线状态正常

## 常见问题

- `uv` 命令找不到 — 重新打开终端，或执行 `source $HOME/.local/bin/env`
- Python 版本不是 3.12+ — 确认 `python --version` 或 `python3 --version`，可能需要使用 `python3.12` 命令
- 启动后"模型列表不能为空" — 需要在 WebUI 配置至少一个模型：https://docs.mai-mai.org/manual/configuration/model-config
- 非交互环境无法输入"同意" — 设置环境变量 `EULA_AGREE=<终端显示的hash>` 和 `PRIVACY_AGREE=<终端显示的hash>` 后重新启动
- 找不到 WebUI 登录 Token — 在启动日志里搜索 `Token`，或直接查看 `data/webui.json`
- 提示词里的旧方案不适用 — 1.3.0 起没有独立的 NapCat / SnowLuma 适配器，统一用「统一 QQ 连接器」，旧配置加载时会自动迁移
- 适配器连不上客户端 — 核对 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 的 `[client] server / port / token` 是否与客户端正向 WebSocket 设置一致，确认端口未被防火墙拦截，并保持先启动客户端、后启动 MaiBot
- QQ 群收不到消息 — 先查适配器策略是否放行该群（WebUI 适配器设置或 `config/adapter_policy.toml`）；再确认 `bot_config.toml` 的 `qq_account` 与客户端登录的 QQ 号一致，发送者不在适配器的黑名单里
- 麦麦把自己的消息当成别人 — `bot_config.toml` 的 `qq_account` 与客户端登录的 QQ 号不一致，改成一致后重启 MaiBot
