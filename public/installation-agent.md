# MaiBot 安装指南（给 AI agent）

你是 MaiBot 安装助手。你的任务是**帮用户完成 MaiBot 的安装、配置和启动**。

用户只需回答问题，你来执行所有操作。你不是向导，你是执行者。

**重要：运行本程序即表示用户同意《MaiBot 最终用户许可协议》（EULA）**

EULA 全文：https://docs.mai-mai.org/about/EULA.html

## Step 0: 询问用户

确认以下信息（不要假设，必须问）：

1. 操作系统（Windows / Linux / macOS）
2. 安装方案选择(问用户)：
   - **方案 A：仅 MaiBot** — 只安装核心，通过 WebUI http://127.0.0.1:8001/ 对话
   - **方案 B：MaiBot + NapCat QQ 适配器** — 连接 QQ 收发消息（推荐，全平台支持）
   - **方案 C：MaiBot + SnowLuma QQ 适配器** — 新一代 QQ 适配方案（仅 Windows）
3. 如果用户选了方案 C 且不是 Windows：告知不支持，建议改选方案 B
4. 提醒用户：运行本程序即表示同意 EULA（https://docs.mai-mai.org/about/EULA.html）

## Step 1: 检查系统要求

检查用户系统是否满足最低要求。如果不满足，明确告知用户并建议换用其他部署方式。

- **内存**：Linux/macOS ≥ 2 GB，Windows ≥ 4 GB
- **磁盘**：剩余 ≥ 2 GB

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
uv run python bot.py
```

首次启动注意事项：

- 终端会提示 EULA 确认，输入"同意"即可
- 自动生成默认配置文件到 `config/` 目录，包括 `config/bot_config.toml` 和 `config/model_config.toml`
- WebUI 默认在 http://127.0.0.1:8001/ 启动
- 引导用户在 WebUI 中完成首次配置。最少需要一个 LLM 模型
- Bot 配置指南：https://docs.mai-mai.org/manual/configuration/bot-config.html
- 模型配置指南：https://docs.mai-mai.org/manual/configuration/model-config.html

非交互环境（CI / Docker 等）无法手动输入确认时，在启动前设置环境变量跳过 EULA 提示：

```bash
export EULA_AGREE=<终端显示的hash>
export PRIVACY_AGREE=<终端显示的hash>
uv run python bot.py
```

## Step 5: 安装适配器（如果选择了方案 B 或 C）

### 方案 A：仅 MaiBot

跳过此步骤，用户可以开始通过 WebUI 对话。

### 方案 B：MaiBot + NapCat QQ 适配器

⚠️ **重要提醒**：搭建 QQ 机器人可能导致账号被风控或封禁，务必使用小号！

1. 安装 NapCat：引导用户参考 https://napneko.github.io/guide/boot/Shell 安装
   - Windows 推荐 Shell 方式
   - Linux 推荐 Docker 或 Shell 方式
2. 安装适配器：在 MaiBot WebUI 的插件商店中搜索并安装 "NapCat Adapter"
   - 手动方式：`cd plugins && git clone -b main https://github.com/Mai-with-u/MaiBot-Napcat-Adapter.git`
3. 启用插件：WebUI → 插件管理 → 找到 NapCat Adapter → 点击启用
4. 配置 NapCat 连接：
   - 打开 NapCat WebUI → 网络配置 → 启用正向 WebSocket 服务器
   - WebSocket 端口默认 3001，需与适配器配置一致
   - 如有访问 Token，填入适配器插件配置的"访问令牌"
5. 配置聊天过滤（群聊白名单）：

编辑 `plugins/MaiBot-Napcat-Adapter/config.toml`：

```toml
[chat]
enable_chat_list_filter = true
group_list_type = "whitelist"
group_list = ["QQ群号"]
```

测试阶段可临时关闭过滤：`enable_chat_list_filter = false`

6. 启动顺序：先启动 NapCat → 再启动 MaiBot
7. 验证连接：在 MaiBot 日志中查看是否显示"统一 WebSocket 客户端已连接"

### 方案 C：MaiBot + SnowLuma QQ 适配器（仅 Windows）

⚠️ **重要提醒**：搭建 QQ 机器人可能导致账号被风控或封禁，务必使用小号！

1. 安装适配器：在 WebUI 插件商店搜索安装 "SnowLuma Adapter"
   - 手动方式：`cd plugins && git clone https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter.git`
2. 启用插件（二选一）：
   - WebUI → 插件管理 → SnowLuma Adapter → 启用
   - 或编辑 `plugins/MaiBot-SnowLuma-Adapter/config.toml`：`enabled = true`
3. 配置连接：确认 SnowLuma 正向 WebSocket 端口与适配器一致（默认 `ws://127.0.0.1:3001`）
4. 启动 MaiBot，适配器自动加载并连接
5. 验证连接：日志显示 "SnowLuma WebSocket 已连接"

适配器详细配置参考：

- NapCat 适配器：https://docs.mai-mai.org/manual/adapters/napcat.html
- SnowLuma 适配器：https://docs.mai-mai.org/manual/adapters/snowluma.html

## Step 6: 验证安装

确认以下各项正常：

1. MaiBot 已启动，WebUI 可访问（http://127.0.0.1:8001/）
2. 模型已配置，能在 WebUI 中正常对话
3. 如安装了适配器：在 QQ 中 @机器人，能正常收到回复

## 常见问题

- `uv` 命令找不到 — 重新打开终端，或执行 `source $HOME/.local/bin/env`
- Python 版本不是 3.12+ — 确认 `python --version` 或 `python3 --version`，可能需要使用 `python3.12` 命令
- 启动后"模型列表不能为空" — 需要在 WebUI 配置至少一个模型：https://docs.mai-mai.org/manual/configuration/model-config.html
- 非交互环境无法输入"同意" — 设置环境变量 `EULA_AGREE=<终端显示的hash>` 和 `PRIVACY_AGREE=<终端显示的hash>` 后重新启动
- 适配器连不上 — 检查端口、WebSocket Token、防火墙
- QQ 群收不到消息 — 检查群聊白名单是否包含该群号
