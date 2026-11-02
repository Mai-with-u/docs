---
title: 外接 Agent 连接
---

# 外接 Agent 连接

麦麦可以通过 ACP 把一部分工作交给外部 Agent（如 dsh）。两种用法共用同一套连接配置：外接 Agent 与普通聊天并行运行，或让指定聊天流的 Planner 直接改用外部 Agent 决策。模型、凭据和 ACP 会话都由外部程序管理。

外部程序需要支持 ACP v1 和 HTTP MCP；要恢复已保存的会话，还需要 `session/resume`。

## 本机 dsh CLI

CLI 模式不需要桥接插件。先在运行麦麦的同一用户环境里确认 `dsh --profile acp` 能启动，再配置：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[agent]
enabled = true        # 启用与普通聊天并行的外接 Agent
connection = "dsh"    # dsh CLI 自动追加 --profile acp
acp_command = "dsh"   # Windows 可填 dsh.cmd 或实际程序的绝对路径
```

:::

`acp_command` 只填程序，参数放 `acp_args`（仅 `custom` 模式使用）；`acp_env` 会覆盖子进程环境，程序查找也用覆盖后的 `PATH`。

## 让指定聊天改用外接 Planner

不启用 `enabled` 也可以：打开 `planner_enabled`，把要接管的聊天流 `session_id` 填进 `planner_sessions`，这些聊天的主 Planner 就走 ACP。

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[agent]
planner_enabled = true       # 实验性总开关；关闭时保留名单
planner_sessions = ["qq:123456789"]  # 填真实聊天流 session_id；空列表不生效
connection = "dsh"
```

:::

每个聊天流使用持久会话并增量同步上下文，重启后恢复，清空聊天后重置。工具仍由原聊天运行时执行；连接失败直接报错，不回退本体 Planner。外部 Agent 自带的工具受其自身配置控制。

## 通过 SSH 连接远程 dsh CLI

麦麦运行在 A、dsh 运行在 B 时，需要两个方向的连接：A 通过 SSH 的标准输入输出调用 B 的 ACP，B 通过 SSH 反向转发访问 A 的 MCP 工具服务。

先为运行麦麦的用户配好 SSH 密钥和已确认的主机密钥，并在 B 上创建会话目录。下面假设 B 是 Linux，`dsh` 位于 `/usr/local/bin/dsh`：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[agent]
enabled = true
connection = "custom"
acp_command = "ssh"
acp_args = [
    "-T",
    "-o", "BatchMode=yes",
    "-o", "ExitOnForwardFailure=yes",
    "-o", "ServerAliveInterval=15",
    "-o", "ServerAliveCountMax=3",
    "-R", "127.0.0.1:{mcp_port}:127.0.0.1:{mcp_port}",
    "user@server-b",
    "/usr/local/bin/dsh", "--profile", "acp",
]
acp_cwd = ""                      # A 上启动 SSH 的目录；留空由麦麦创建
acp_remote_cwd = "/srv/maibot-agent"  # B 上已存在的绝对目录，原样传给会话
mcp_port = 0                      # 0 = 自动分配本机回环端口
```

:::

`acp_remote_cwd` 不会在 A 上创建或展开，不要填 `~` 或相对路径；SSH 命令自身需要切目录时，在远端命令里显式处理。

麦麦先启动工具服务，再把 `acp_args` 里的 `{mcp_port}` 替换成本次实际端口，其他花括号保持原样。两侧端口必须相同，传给 dsh 的 `http://127.0.0.1:<port>/mcp` 才能通过隧道回到麦麦。SSH 服务端需允许 TCP 转发；远端端口被占用时连接直接失败并报告原因，不会重试任务。

外接 Planner 每个连接都会创建工具服务，保留 `mcp_port = 0` 可避免本机端口冲突。切换远程工作目录后不能继续恢复原会话，可通过清空对应聊天建立新会话。跨主机切换前用独立实例保存各自的会话状态，不要把同一个会话 ID 用在两个 Host 上。

远程 dsh 的文件系统与麦麦的文件系统彼此独立。工具在麦麦主机执行，`agent_talk` 的附图路径也必须在麦麦本机允许的目录内；需要传文件时先显式同步。

## dsh Desktop

Desktop 模式需要在 Desktop 侧安装 `dsh-maibot-bridge`，启动后生成 `~/.dsh/maibot-desktop.json`。麦麦选择 `connection = "dsh_desktop"`，`desktop_manifest` 留空就用上述默认文件，也可以指定绝对路径。

<Linkcard url="https://github.com/SengokuCola/dsh-maibot-bridge/releases/download/v0.1.1/dsh-maibot-bridge-0.1.1.tgz" title="dsh-maibot-bridge" description="dsh Desktop 的麦麦桥接插件，公开下载，无需 GitHub 登录" />

主程序不包含这个插件，用 Desktop 自带的 dsh 命令安装后重启 Desktop，也可以在 Desktop 的插件安装入口选择本地源码目录。

::: code-group

```powershell [PowerShell ~vscode-icons:file-type-powershell~]
dsh plugin --profile desktop add https://github.com/SengokuCola/dsh-maibot-bridge/releases/download/v0.1.1/dsh-maibot-bridge-0.1.1.tgz
```

:::

桥接和麦麦工具服务都只监听回环地址，远程 Desktop 用 SSH 隧道接入即可，不需要改成公网监听：

::: steps
1. 在麦麦侧把 `acp_remote_cwd` 设为 Desktop 主机上的绝对目录，`mcp_port` 设为空闲端口（如 `48123`）。固定端口只适合单个连接，不要和多个外接 Planner 共用。
2. 假设 Desktop manifest 里桥接端口是 `51234`，在麦麦主机保持一条隧道运行：

   ::: code-group

   ```sh [Bash ~vscode-icons:file-type-shell~]
   ssh -N -T -o ExitOnForwardFailure=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -L 127.0.0.1:48124:127.0.0.1:51234 -R 127.0.0.1:48123:127.0.0.1:48123 user@desktop-host
   ```

   :::

3. 把 Desktop manifest 安全复制到麦麦主机，保留 `version` 与 `token`，把 `host` 改为 `127.0.0.1`、`port` 改为本地转发端口 `48124`，再用 `desktop_manifest` 指向这份副本。
:::

Desktop 重启后桥接端口和令牌可能变化，需要同步更新隧道与 manifest 副本。不要分享 manifest 或其中的令牌。关闭麦麦只断开桥接，不会关闭 Desktop。

## 回复、身份与暂停

外部 Agent 的文本通过 `session/update` 流式保存到执行记录，显示在独立 Agent 的 WebUI 页面；`session/prompt` 的最终回执只提供停止原因，不承载完整正文。向普通聊天传话要显式调用 `agent_talk` 并指定真实会话 ID，传话回执不等于 IM 已发言。

正常结束原因是 `end_turn`。其他停止原因（如 `refusal`、`max_tokens`）和 dsh 返回的模型请求错误，会保留已收到的输出、清除在途标记并报告单轮失败，不暂停整个队列；来源聊天会收到带任务编号和原始错误的内部通知。换模型不会触发重试，换好后发送「继续」或新请求即可进入同一会话。

重启保留暂停状态。旧版本记录的故障暂停可由新的用户请求或 WebUI 恢复，系统输入不能解除暂停；手动暂停始终要在 WebUI 恢复，暂停期间的传话回执会明确提示仅入队。

## 验证与排错

**验证** — 启动后在 WebUI 的 Agent 页面能看到会话建立，发送一条任务能收到流式输出。外接 Planner 模式下，对应聊天流的新回复由外部 Agent 产生。

**连接超时** — 日志里的 `ACP stderr:` 会实时显示外部进程诊断，超时也会附带最近 20 行 stderr。先查 SSH 认证、端口转发、dsh 模型凭据和远端目录。

**协议解析失败** — ACP stdout 只能包含 JSON-RPC 协议行，启动脚本的调试信息必须写到 stderr；SSH 不要分配伪终端。

**远端端口占用** — 连接直接失败并报告原因，不会重试任务。换一个空闲端口并同步更新两侧的转发规则。

**任务没有重发** — 断线、超时或连接配置错误会暂停队列，修复后发送新请求或在 WebUI 恢复；系统不会自动重发结果未知的任务。
