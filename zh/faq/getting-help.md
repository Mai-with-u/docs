---
title: 获取帮助
---

# 获取帮助

这页告诉你怎么高效求助：提问前先自查什么、提交 Issue 要带哪些信息、有哪些社区支持渠道、怎么导出日志。按顺序读完再提问，问题会解决得更快。

## 提问前自查

在向别人求助之前，花 2 分钟做以下检查，大部分问题可以自己解决：

**`📖 1. 查阅官方文档`**
: 你的问题很可能已经在本文档的各个场景中有解答了。先搜一遍，省时省力。

**`🔍 2. 查看错误日志`**
: 日志里会写明具体的错误原因和堆栈跟踪，这是定位问题的第一线索。不知道怎么导出？往下看「如何获取日志」。

**`⚙️ 3. 检查近期改动`**
: 回想最近改过什么配置、装过什么插件、更新过什么版本。尝试回退到最后一次正常工作的状态，确认是不是哪步改错了。

**`🌐 4. 搜索已知问题`**
: 用错误关键词搜索 [GitHub Issues](https://github.com/Mai-with-u/docs/issues) 或搜索引擎，看看是否有别人遇到过相同的问题。

## 提交 Issue 的信息清单

向 GitHub 提交 Issue 时，请务必包含以下信息。缺少关键信息的问题可能会被延迟处理：

**`🖥️ 系统与环境`**
: 操作系统类型及版本、部署方式（源码/Docker）、Python 版本（源码部署时）

**`🔢 MaiBot 版本`**
: 运行 `git log --oneline -1` 查看当前 commit，或从 WebUI 底部的版本号获取

**`📄 完整错误日志`**
: 包含堆栈跟踪（traceback）的日志片段，不要只截图一小段。详见下方的「如何获取日志」

**`⚙️ 相关配置`**
: 与问题相关的配置内容（注意隐去 API Key 等敏感信息）

**`🎯 复现步骤`**
: 从启动到出现错误的具体操作步骤，越详细越好

## 社区支持渠道

**`💬 QQ 群`**
: 加入 MaiBot 用户交流群，和其他用户一起交流使用经验。各群群号与定位见[交流群](/about/community)

**`🐱 GitHub Issues`**
: 确认是 Bug 或功能建议，请在 [GitHub Issues](https://github.com/Mai-with-u/docs/issues) 提交。提交前记得先搜索，避免重复

**`📖 官方文档站`**
: 最新最全的文档请访问 [MaiBot 文档站](https://docs.mai-mai.org/)

**`💬 GitHub Discussions`**
: 功能讨论、技术提问可访问 [GitHub Discussions](https://github.com/Mai-with-u/docs/discussions) 参与社区讨论

## 如何获取日志

根据部署方式不同，获取日志的方法也不同：

**`🐍 源码部署`**
: 启动 MaiBot 的终端输出就是最直接的日志。如果终端已关闭，查看日志文件如下：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 查看最新的日志文件（JSONL 格式，一行一条）
cat logs/$(ls -t logs/app_*.log.jsonl | head -1)
```

:::

如果需要更详细的日志，在 `config/bot_config.toml` 中开启 DEBUG 级别：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[log]
log_level = "DEBUG"
```

:::

**`🐳 Docker 部署`**
: 使用 `docker logs` 命令查看容器日志：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 查看所有日志
docker logs maibot

# 持续跟踪日志输出
docker logs -f maibot

# 只查看最近 100 行
docker logs --tail 100 maibot
```

:::

**`🪟 Windows 部署`**
: 日志文件默认在 `logs\` 目录下：

::: code-group

```powershell [PowerShell ~vscode-icons:file-type-powershell~]
# 查看最新的日志文件（JSONL 格式，一行一条）
type logs\app_*.log.jsonl

# 或使用 PowerShell
Get-ChildItem logs\app_*.log.jsonl | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content
```

:::

> 💡 **提示**：获取日志后，用 ` ``` ` 代码块包起来粘贴到 Issue 中。如果日志很长，只贴最近一次启动到出错的部分即可，不要贴几千行的完整日志。

## 相关

- [错误排查总览](./error-troubleshooting.md) — 错误代码速查表、常见错误关键词索引和排查流程图。
- [启动与访问错误排查](./troubleshooting-startup.md) — 配置文件、MCP、端口、WebUI 访问与登录。
- [模型与规则错误排查](./troubleshooting-model.md) — API Key、网络超时、正则表达式和关键词规则。
- [运行与数据错误排查](./troubleshooting-runtime.md) — 不回复消息、数据库、表情包、记忆、磁盘空间和数据异常。
- [插件与适配器错误排查](./troubleshooting-plugins-adapters.md) — 插件加载失败、适配器连接和重连。
