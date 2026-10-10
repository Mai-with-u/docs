---
title: 启动与访问错误排查
---

# 启动与访问错误排查

这页解决 MaiBot 启动和访问相关的报错：配置文件和 MCP 设置导致起不来、端口被占用、WebUI 打不开或登录不上、WebUI 里的 Git 操作失败。遇到启动崩溃或访问异常时，按下面的问题标题直达对应章节。

## 配置文件找不到或格式不对

### 错误现象
- 启动 MaiBot 时立即崩溃
- 终端打印 TOML 解析错误，如 `Invalid TOML syntax`
- 或提示缺少 `[inner].version`、字段类型不正确等配置解析错误

### 快速自查三连
1️⃣ 配置文件存在吗？看看 `config/` 文件夹里有没有 `bot_config.toml` 和 `model_config.toml`
2️⃣ TOML 语法对吗？字符串加引号、数字不引号、布尔值小写
3️⃣ 日志指出的是哪个文件和字段？不要同时重置两个配置文件

### 解决方案

**方法一：MaiBot 仍能启动时使用 WebUI**

WebUI 保存配置时会做格式校验，比直接手写 TOML 更不容易产生语法错误：

1. 启动 MaiBot，打开浏览器访问 `http://localhost:8001`
2. 进入「配置管理」页面
3. 按页面提示填写内容，保存即可

> 如果配置解析错误导致 MaiBot 无法启动，WebUI 也不会启动，请使用方法二。

**方法二（无法启动时）：备份故障文件，让程序重新生成**

加载代码会在目标配置文件**不存在**时生成当前版本的默认配置；已存在但语法错误的文件不会被自动覆盖。

先停止 MaiBot，根据日志只重命名出错的那个文件：

::: code-group

```powershell [Windows PowerShell ~vscode-icons:file-type-powershell~]
# 如果日志指向 bot_config.toml
Rename-Item config\bot_config.toml bot_config.broken.toml

# 如果日志指向 model_config.toml
Rename-Item config\model_config.toml model_config.broken.toml
```

```bash [Bash ~vscode-icons:file-type-shell~]
# Linux / macOS：只执行日志对应的一条
mv config/bot_config.toml config/bot_config.broken.toml
mv config/model_config.toml config/model_config.broken.toml
```

:::

然后重新启动：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
uv run python bot.py
```

:::

MaiBot 会创建缺失的 `config/` 目录以及当前版本的默认配置，并继续启动。进入 WebUI 重新填写必要设置；旧文件只用于人工对照，不要整份覆盖回去，否则可能把错误或旧版本结构一并恢复。

::: tip 自动升级时的备份
配置版本升级或程序重写已有配置时，代码会先把旧文件移动到 `config/old/` 并添加时间戳。语法错误发生在解析阶段时无法执行这一步，所以手动重命名仍然必要。
:::

**方法三：只修复 TOML 语法（手改文件时参考）**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# ✅ 正确示例
[bot]
nickname = "麦麦"           # 字符串要引号
port = 8001                 # 数字不要引号
enabled = true              # 布尔值小写

# ❌ 错误示例
[bot]
nickname = 麦麦             # 错误！没引号
port = "8001"              # 错误！数字不该引号
enabled = True             # 错误！应该小写 true
```

:::

**方法四：在线验证**
如果手动改了文件不确定格式对不对，可以用 [TOML 在线验证器](https://toml.io/cn/) 检查。

### 预防建议
- 📝 **用 WebUI 改配置** — WebUI 会在保存时验证格式
- 💾 **修改前备份** — 备份 `config/bot_config.toml` 和 `config/model_config.toml`
- 🔍 **小步修改** — 每次只改几行，保存后测试能否启动

## 端口被占用

### 错误现象
- 启动时报 `OSError: [Errno 98] Address already in use`
- 或 `[Errno 10048]`（Windows）
- 错误日志：`端口 8001 已被占用 (host=127.0.0.1)`

### 快速自查三连
1️⃣ 哪个进程占用了端口？打开任务管理器/活动监视器找找
2️⃣ 能关掉占用进程吗？在任务管理器里结束占用进程
3️⃣ 能改 MaiBot 端口吗？编辑配置文件换其他端口

### 解决方案

**方法一：结束占用进程**
在任务管理器（Windows）或活动监视器（macOS）中找到占用端口的进程并结束它。如果不知道哪个进程占用了，直接重启电脑也可以释放端口。

**方法二：修改 MaiBot 端口**

只修改日志中报错的服务，不要把下面两个示例同时照抄。

如果 WebUI 默认端口 `8001` 被占用：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[webui]
port = 8002             # 改为 8002 或其他空闲端口
```

:::

如果你确实启用了 legacy `maim_message`，并且日志显示它的默认端口 `8000` 被占用：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[maim_message]
ws_server_port = 18000  # 示例；也可以使用其他已确认空闲的端口
```

:::

`8001` 和 `8002` 本身不冲突。这里不能继续推荐 `8001` 给另一个服务，是因为本场景已经确认 `8001` 被外部进程占用。NapCat 插件版不使用 `[maim_message]`。

修改监听端口后需要重新启动 MaiBot，使服务绑定到新端口。

### 预防建议
- 📝 **记录端口分配** — 避免多个服务用同一端口
- 🔄 **重启后检查** — 有时旧进程未清理，重启后需手动结束
- 🔧 **先确认再修改** — 使用系统工具确认目标端口空闲，不要只凭端口数字猜测

## WebUI 页面打不开

### 错误现象
- 浏览器访问 `http://localhost:8001` 显示「无法访问此网站」或「连接被拒绝」
- 页面白屏或加载超时
- MaiBot 已启动但 WebUI 就是打不开

### 快速自查三连
1️⃣ MaiBot 真的启动成功了吗？看终端有没有报错
2️⃣ 浏览器输入的地址对吗？默认是 `http://localhost:8001`
3️⃣ 防火墙有没有拦？Windows 防火墙/杀毒软件可能会阻止

### 解决方案

**步骤 1：确认 MaiBot 已启动**
看运行 MaiBot 的终端窗口，有没有看到类似这样的日志：
```
WebUI 服务器 启动成功: http://127.0.0.1:8001
```
如果没看到，说明 MaiBot 还没完全启动，先解决启动报错。

**步骤 2：检查地址和端口**
- 默认地址：`http://127.0.0.1:8001`（推荐用 127.0.0.1 而不是 localhost）
- 如果改了端口，用你改的端口访问
- 如果部署在远程服务器，把 `127.0.0.1` 换成服务器 IP

**步骤 3：检查防火墙**
- **Windows**：打开「Windows 安全中心」→「防火墙和网络保护」→「允许应用通过防火墙」，确保 Python 被允许
- **macOS**：系统设置 → 网络 → 防火墙，检查是否阻止了 Python
- **Linux**：检查 iptables 或 ufw 规则

**步骤 4：检查端口是否被占用**
如果端口被其他程序占了，WebUI 也启动不了。参考[端口被占用](#端口被占用)检查端口占用。

### 预防建议
- 🖥️ **启动后看日志** — 看到「WebUI 服务器 启动成功」再打开浏览器
- 🔧 **固定用 127.0.0.1** — 比 localhost 更稳定，避免 DNS 解析问题
- 🛡️ **提前关防火墙** — 如果确定安全，可以暂时关防火墙测试

## MCP 配置错误

### 错误现象
- 启动时报 `MCP 服务器 {name} 使用 stdio 时必须填写 command`
- 或 `MCP 服务器 {name} 使用 streamable_http 时必须填写 url`
- 或日志提示 `MCP server xxx failed to connect`

### 快速自查三连
1️⃣ 服务器地址对吗？检查 `mcp.servers[].url` 或 `command` 字段
2️⃣ Token/Secret 匹配吗？确认 `bearer_token` 与 MCP 服务端一致
3️⃣ MCP 服务运行了吗？确认服务端已启动并可访问

### 解决方案

**步骤 1：检查 MCP 配置**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml

[mcp]
enable = true

# STDIO 类型（本地进程通信）
[[mcp.servers]]
name = "local-filesystem"
enabled = true
transport = "stdio"
command = "node"                          # 必填！启动命令
args = ["/path/to/mcp-server/index.js"]   # 命令参数

# HTTP 类型（远程服务）
[[mcp.servers]]
name = "remote-search"
enabled = true
transport = "streamable_http"
url = "https://mcp-search.example.com/sse"    # 必填！HTTP 端点

[mcp.servers.authorization]
mode = "bearer"
bearer_token = "your-bearer-token-here"       # 必填！认证 Token
```

:::

**步骤 2：验证 MCP 服务可访问**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 测试 HTTP 类型 MCP
curl -v https://mcp-search.example.com/sse \
  -H "Authorization: Bearer your-bearer-token-here"

# 测试 STDIO 类型 MCP
node /path/to/mcp-server/index.js
# 应该能看到 MCP 服务启动日志
```

:::

**步骤 3：检查常见错误**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# ❌ 错误示例 1：stdio 模式缺少 command
[[mcp.servers]]
transport = "stdio"
command = ""              # 错误！必须填写启动命令

# ❌ 错误示例 2：HTTP 模式缺少 url
[[mcp.servers]]
transport = "streamable_http"
url = ""                  # 错误！必须填写 HTTP 端点

# ❌ 错误示例 3：Bearer 认证未填 Token
[mcp.servers.authorization]
mode = "bearer"
bearer_token = ""         # 错误！必须填写 Token
```

:::

### 预防建议
- 📋 **逐项核对配置** — 参考 MCP 服务端文档确认参数
- 🔍 **先测试后上线** — 用 `curl` 测试连通性再配置到 MaiBot
- 📝 **记录 Token 变更** — Token 更新后同步更新 MaiBot 配置

## WebUI 登录失败 / Token 过期

### 错误现象
- 打开 WebUI 页面后自动跳回登录页
- 粘贴 Token 后提示「登录失败」或「Token 无效」
- API 请求返回 `401 Unauthorized` 错误
- 浏览器控制台显示 `Token expired` 或 `Invalid session`

### 快速自查三连
1️⃣ **清除浏览器缓存** — Cookie/LocalStorage 可能已过期或损坏
2️⃣ **检查 Token 是否正确** — 确认大小写、特殊字符输入无误，且没多复制空格
3️⃣ **查看 WebUI 服务状态** — 确认服务正在运行且未重启过

### 解决方案

**方法一：清除 Cookie 重新登录**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 浏览器操作：
# 1. 按 F12 打开开发者工具
# 2. 进入 Application → Cookies
# 3. 删除所有 MaiBot 相关的 Cookie
# 4. 刷新页面重新登录
```

:::

**方法二：重启 WebUI 服务**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 修改了 data/webui.json 中的 Token 后，需要重启服务
# Docker 部署
docker restart maibot

# 源码部署
# 先停止当前进程（Ctrl+C），再重新启动
uv run bot.py
```

:::

**方法三：核对登录 Token**
WebUI 的登录 Token 保存在 `data/webui.json` 的 `access_token` 字段，不在 `bot_config.toml` 里：

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "access_token": "your-access-token-here",
  "token_source": "configured"
}
```

:::

改完 Token 后重启 MaiBot 生效。终端每次启动也会打印当前 Token，直接复制那条即可。第一次启动生成的是临时 Token，换成自己的固定 Token 更省事。

> ⚠️ **注意**：浏览器是把 Token 存在 `maibot_session` Cookie 里做登录态的，修改 Token 后所有已登录的 Session 都会失效，需要重新登录。

### 预防建议
- **换成固定 Token** — 首次启动后把临时 Token 换成自己的，并在 `data/webui.json` 里固定下来
- **不要频繁修改 Token** — 否则每次都要重新登录
- **使用浏览器书签** — 保存登录后的页面，避免重复输入 Token

## Git 操作失败（WebUI）

### 错误现象
- WebUI 中知识库同步/Git 镜像操作失败
- 日志显示 `Git clone failed` 或 `Permission denied`
- SSH Key 验证失败提示 `Host key verification failed`
- Git LFS 文件过大导致超时

### 快速自查三连
1️⃣ **先确认网络** — 能不能访问 GitHub/Gitee？
2️⃣ **换个公开仓库试试** — 不需要登录的仓库有没有问题？
3️⃣ **仓库是不是太大了** — 大文件会导致超时

### 解决方案

**步骤一：确认网络连通**
看看能不能打开 GitHub 或 Gitee 网站。如果打不开，说明网络有问题，先解决网络。

**步骤二：换个不需要登录的仓库试试**
如果提示权限错误（Permission denied），在 WebUI 中换个公开仓库（不需要 SSH Key 的那种）测试一下。如果公开仓库能正常同步，说明是 SSH 权限配置问题，去 GitHub/Gitee 检查 SSH Key 设置。

**步骤三：调整 Git 超时**
Git 镜像源在 WebUI 的「Git 镜像」页面维护，超时等参数随镜像源一起设置，不在 `bot_config.toml` 里。仓库较大时，在 WebUI 中把该镜像源的超时调大，或把不希望同步的大文件/目录排除掉。

### 预防建议
- **先用公开仓库测试** — 确认能同步了再换私有仓库
- **避免大文件** — 不要在仓库里放大型二进制文件

## 相关

- [错误排查总览](./error-troubleshooting.md) — 错误代码速查表、常见错误关键词索引和排查流程图。
- [模型与规则错误排查](./troubleshooting-model.md) — API Key、网络超时、正则表达式和关键词规则。
- [运行与数据错误排查](./troubleshooting-runtime.md) — 不回复消息、数据库、表情包、记忆、磁盘空间和数据异常。
- [插件与适配器错误排查](./troubleshooting-plugins-adapters.md) — 插件加载失败、适配器连接和重连。
- [获取帮助](./getting-help.md) — 提问前自查、提交 Issue 的信息清单和获取日志的方法。
