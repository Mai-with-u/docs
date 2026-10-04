---
title: 🔧 错误排查 FAQ
---

# 🔧 错误排查 FAQ

> ⚠️ **网络是 80% 问题的根源** — API 连不上、Git 拉不下来、插件装不了，大概率都是网络问题。
> 遇到任何报错，先检查能不能访问外网（`curl -I https://www.baidu.com`），不行就换网络/开代理。

> 按错误出现的频率从高到低排列，新手请优先查看 🔴 极高频章节。
> 如果不确定问题属于哪一类，先看文末的「📋 错误排查流程图」。

---

## 🔴 极高频错误（新手必遇）

覆盖场景 1–6，新手部署和首次使用 MaiBot 时最容易遇到的问题。

<!-- TASK_4_CONTENT_START -->

### 场景 1：配置文件找不到或格式不对

#### 错误现象
- 启动 MaiBot 时立即崩溃
- 终端打印 TOML 解析错误，如 `Invalid TOML syntax`
- 或提示缺少 `[inner].version`、字段类型不正确等配置解析错误

#### 快速自查三连
1️⃣ 配置文件存在吗？看看 `config/` 文件夹里有没有 `bot_config.toml` 和 `model_config.toml`
2️⃣ TOML 语法对吗？字符串加引号、数字不引号、布尔值小写
3️⃣ 日志指出的是哪个文件和字段？不要同时重置两个配置文件

#### 解决方案

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

#### 预防建议
- 📝 **用 WebUI 改配置** — WebUI 会在保存时验证格式
- 💾 **修改前备份** — 备份 `config/bot_config.toml` 和 `config/model_config.toml`
- 🔍 **小步修改** — 每次只改几行，保存后测试能否启动

---

### 场景 2：API Key 错误/余额不足

#### 错误现象
- 机器人完全无回复
- 后端日志出现 `401 Unauthorized` / `402 Payment Required` / `403 Forbidden`
- 日志提示 `API key is invalid` 或 `Insufficient balance`

#### 快速自查三连
1️⃣ API Key 填对了吗？检查 `model_config.toml` 中 `api_key` 字段
2️⃣ 账户余额够吗？登录 API 提供商后台查看余额
3️⃣ 模型名对吗？检查 `model_identifier` 是否在提供商支持列表内

#### 解决方案

**步骤 1：检查 API Key 配置**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# model_config.toml
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-your-api-key-here"    # 必填！替换为你的真实 Key
auth_type = "bearer"
```

:::

**步骤 2：验证 Key 是否有效**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 测试 DeepSeek API
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer sk-your-api-key-here"
```

:::

**步骤 3：检查余额**
- 登录 DeepSeek/OpenAI 等提供商后台
- 查看账户余额是否大于 0
- 检查 API Key 是否过期或被禁用

**步骤 4：确认模型名**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# ✅ 正确示例
[[models]]
model_identifier = "deepseek-chat"   # 必须是 API 商支持的模型名
name = "deepseek-chat"
api_provider = "DeepSeek"

# ❌ 错误示例
[[models]]
model_identifier = "gpt-4"           # DeepSeek 不支持 GPT-4！
api_provider = "DeepSeek"
```

:::

#### 预防建议
- 🔑 **Key 不要提交到 Git** — 用环境变量或本地配置文件
- 💰 **设置余额提醒** — 在 API 后台设置低余额邮件通知
- 📊 **监控用量** — 定期检查 Token 消耗情况

---

### 场景 3：端口被占用

#### 错误现象
- 启动时报 `OSError: [Errno 98] Address already in use`
- 或 `[Errno 10048]`（Windows）
- 错误日志：`端口 8001 已被占用 (host=127.0.0.1)`

#### 快速自查三连
1️⃣ 哪个进程占用了端口？打开任务管理器/活动监视器找找
2️⃣ 能关掉占用进程吗？在任务管理器里结束占用进程
3️⃣ 能改 MaiBot 端口吗？编辑配置文件换其他端口

#### 解决方案

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

#### 预防建议
- 📝 **记录端口分配** — 避免多个服务用同一端口
- 🔄 **重启后检查** — 有时旧进程未清理，重启后需手动结束
- 🔧 **先确认再修改** — 使用系统工具确认目标端口空闲，不要只凭端口数字猜测

---

### 场景 4：WebUI 页面打不开

#### 错误现象
- 浏览器访问 `http://localhost:8001` 显示「无法访问此网站」或「连接被拒绝」
- 页面白屏或加载超时
- MaiBot 已启动但 WebUI 就是打不开

#### 快速自查三连
1️⃣ MaiBot 真的启动成功了吗？看终端有没有报错
2️⃣ 浏览器输入的地址对吗？默认是 `http://localhost:8001`
3️⃣ 防火墙有没有拦？Windows 防火墙/杀毒软件可能会阻止

#### 解决方案

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
如果端口被其他程序占了，WebUI 也启动不了。参考场景 3 检查端口占用。

#### 预防建议
- 🖥️ **启动后看日志** — 看到「WebUI 服务器 启动成功」再打开浏览器
- 🔧 **固定用 127.0.0.1** — 比 localhost 更稳定，避免 DNS 解析问题
- 🛡️ **提前关防火墙** — 如果确定安全，可以暂时关防火墙测试

---

### 场景 5：MCP 配置错误

#### 错误现象
- 启动时报 `MCP 服务器 {name} 使用 stdio 时必须填写 command`
- 或 `MCP 服务器 {name} 使用 streamable_http 时必须填写 url`
- 或日志提示 `MCP server xxx failed to connect`

#### 快速自查三连
1️⃣ 服务器地址对吗？检查 `mcp.servers[].url` 或 `command` 字段
2️⃣ Token/Secret 匹配吗？确认 `bearer_token` 与 MCP 服务端一致
3️⃣ MCP 服务运行了吗？确认服务端已启动并可访问

#### 解决方案

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

#### 预防建议
- 📋 **逐项核对配置** — 参考 MCP 服务端文档确认参数
- 🔍 **先测试后上线** — 用 `curl` 测试连通性再配置到 MaiBot
- 📝 **记录 Token 变更** — Token 更新后同步更新 MaiBot 配置

---

### 场景 6：机器人不回复消息

#### 错误现象
- 消息已发送到平台（QQ 群/私聊）
- 机器人无任何响应
- 日志无报错，但就是没回复

#### 快速自查三连
1️⃣ 看后端终端输出，有没有收到消息的提示？
2️⃣ 匹配到规则了吗？检查关键词/意图规则是否覆盖该消息
3️⃣ LLM 配置对吗？确认 API Key 和模型配置正确（参考场景 2）

#### 解决方案

**步骤 1：看终端输出**
重启 MaiBot 后观察终端日志，看有没有：
- `收到消息：...`（说明消息到了 MaiBot）
- `正在调用 LLM...`（说明在请求 AI）
- `发送回复：...`（说明回复发出去了）
如果这些都有，说明 MaiBot 本身没问题，可能是平台权限或网络问题。

**步骤 2：检查回复规则**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 检查关键词规则
[[keyword_reaction.keyword_rules]]
keywords = ["你好", "hello"]    # 确保包含你发送的消息
reaction = "你好呀！"
enabled = true                  # 确保规则启用
```

:::

**步骤 3：检查发言频率**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[chat.reply_timing]
talk_value = 1                  # 群聊发言意愿（0-1），越小越安静；默认 1
private_talk_value = 1          # 私聊发言意愿（0-1），默认 1
```

:::

**步骤 4：检查平台权限**
- QQ 群：机器人是否被禁言？是否有发言权限？
- 私聊：是否被拉黑？
- 适配器：NapCat 是否正常连接？

**步骤 5：测试 LLM 响应**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 手动测试 API
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"你好"}]}'
# 应该能收到 API 返回的回复
```

:::

#### 预防建议
- 📊 **监控日志** — 定期查看日志，发现异常及时处理
- 🧪 **测试新规则** — 添加新规则后先测试是否生效
- 📝 **记录配置变更** — 修改回复规则后记录变更内容

<!-- TASK_4_CONTENT_END -->

---

## 🟡 高频错误（常见）

覆盖场景 7–11，正常使用过程中较常遇到的问题。

### 场景 7：插件加载失败

#### 错误现象
- 启动时日志提示插件加载失败，WebUI 插件列表里对应插件灰色不可用
- 日志显示 `ImportError`、`ModuleNotFoundError` 或 `Manifest 校验失败`
- 日志提示 `Host 版本不兼容` 或 `SDK 版本不兼容`（插件声明的 Host / SDK 版本区间不覆盖当前版本）
- 插件目录存在但没有任何插件被加载

#### 快速自查三连
1️⃣ 先试试重新安装插件，换个最新版本
2️⃣ 看看日志里提示缺少什么依赖
3️⃣ 确认 Python 版本 ≥ 3.12 且插件和 MaiBot 版本兼容

#### 解决方案

**步骤 1：换个版本试试**
重新下载插件，选一个和 MaiBot 版本兼容的版本。优先用官方插件或社区热门插件，兼容性更好。

**步骤 2：安装缺少的依赖**
看日志里有没有类似 `No module named 'xxx'` 的错误。如果有，说明插件缺少依赖，在插件目录下运行：
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
cd plugins/你的插件目录
uv sync
```

:::

**步骤 3：看完整的错误日志**
启动 MaiBot 时注意看终端的完整错误信息，找到类似这样的提示：
```
No module named 'requests'
```
根据提示缺什么装什么。

**步骤 4：版本不兼容时的兜底手段**
如果日志里是 `Host 版本不兼容` 或 `SDK 版本不兼容`（插件声明的版本区间不覆盖当前 MaiBot / SDK 版本），先按步骤 1 换插件版本；确实没有可用版本时，可以临时打开强制兼容：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[debug]
# 跳过插件声明的 Host / SDK 版本区间校验，直接加载插件
force_plugin_compatibility = true
```

:::

开启后版本区间校验被跳过，日志里只记一条 warning（含插件声明的 Host / SDK 范围和当前版本），不再因此拒绝加载；**修改后需要重启 MaiBot 生效**。这是临时兜底而非推荐做法——插件可能真的不兼容，强行加载可能在运行期报错。确认插件有兼容版本后，请把它改回 `false` 并更新插件。该开关的完整说明见[日志与观测 · Debug 配置项](/develop/observability#debug-配置项)。

#### 预防建议
- 安装插件前先看说明，确认兼容的 MaiBot 版本
- 优先用官方插件或社区热门插件
- 定期更新插件和 MaiBot 到最新版本
- 不要长期开启 `[debug].force_plugin_compatibility`，它只是没有兼容版本时的临时兜底

---

### 场景 8：数据库错误

#### 错误现象
- 运行时报 `DatabaseError` 或 `OperationalError`
- 启动时提示数据库迁移失败
- 日志显示 `database is locked` 或 `disk I/O error`

#### 快速自查三连
1️⃣ 检查是否同时启动多个 MaiBot 实例连接同一数据库
2️⃣ 查看磁盘空间是否已满（打开文件管理器看看）
3️⃣ 确认 `data/MaiBot.db` 文件权限是否正确（可读写）

#### 解决方案

**步骤 1：解决数据库锁定**

如果日志显示 `database is locked`，说明可能有多个 MaiBot 实例同时访问同一个数据库文件。关掉多余的 MaiBot 进程，只保留一个就行。

如果关掉后还是锁定，可以尝试把 `data/MaiBot.db` 文件删掉重来（注意先备份）。

**步骤 2：修复损坏的数据库**

如果怀疑数据库损坏（如突然断电后）：

1. 先备份：复制 `data/MaiBot.db` 到安全位置
2. 重启 MaiBot，程序会自动重建或修复数据库
3. 如果还不行，删掉 `data/MaiBot.db` 让程序重新创建（之前的重要数据需要从备份恢复）

**步骤 3：确认没有多实例在写同一个库**

`database is locked` 基本只有一个原因：多个 MaiBot 实例（或残留进程）在同时访问 `data/MaiBot.db`。关掉多余进程，只保留一个。数据库默认已经跑在 WAL 模式下，不需要也不能通过 `[database]` 段开启。

**步骤 4：清理磁盘空间**

打开 `logs/` 文件夹，删除不需要的旧日志文件。如果磁盘空间严重不足，也检查一下其他目录的大文件。

#### 预防建议
- 避免同时启动多个 MaiBot 实例连接同一数据库文件
- 定期备份 `data/MaiBot.db`（建议每周一次）
- 配置日志轮转，避免日志文件占满磁盘

---

### 场景 9：网络超时/连接失败

#### 错误现象
- LLM 请求长时间无响应后报 `APIConnectionError` 或 `TimeoutError`
- 日志显示 `Connection refused`、`Connection reset` 或 `Read timed out`
- 机器人完全无回复，但本地功能正常

#### 快速自查三连
1️⃣ 测试网络通不通（`curl -v https://api.deepseek.com`）
2️⃣ 换个网络试试（比如切换手机热点）
3️⃣ 确认 `timeout` 参数不是太小（建议 60-120 秒）

#### 解决方案

**步骤 1：测试网络连通性**

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 测试 API 端点是否可达
curl -v https://api.deepseek.com
```

:::
如果能连上（返回 HTTP 200 或 401 都算连通），说明网络没问题。
如果超时或连不上，说明你的网络到 API 服务商的线路不通，换个网络试试。

**步骤 2：增大超时时间**

如果网络不太好，把超时设长一点：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-your-api-key-here"
timeout = 120              # 单次请求超时（秒），网络差时可设到 180
max_retry = 3              # 失败重试次数
retry_interval = 8         # 重试间隔（秒）
```

:::

**步骤 3：换一个 API 提供商试试**

如果 DeepSeek 不稳定，可以在配置中加一个备用 API：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-key-1"

[[api_providers]]
name = "备用"
base_url = "https://api.openai.com/v1"  # 换成其他 API
api_key = "sk-your-backup-key"
```

:::

#### 预防建议
- 设置合理的 `timeout`（60-120 秒）和 `max_retry`（2-3 次）
- 网络不稳定时换个网络试试（如切换手机热点）
- 配置多个 API 提供商做备份，避免单点故障
- 定期检查 API 服务商状态（关注官方公告）

---

### 场景 10：表情包系统错误

#### 错误现象
- 发送表情命令无反应
- 表情注册失败，日志提示超出数量限制
- 表情注册失败，实际是 `data/emojis/` 目录不可写

#### 快速自查三连
1️⃣ 检查 `[emoji]` 的 `content_filtration` 是否过滤过严
2️⃣ 确认 `[emoji]` 的 `emoji_send_num` / `max_reg_num` 是否设得过小
3️⃣ 确保 `data/emojis/` 目录可写（权限正确）

#### 解决方案

**步骤 1：调整表情过滤规则**

如果表情被过滤规则误杀，先暂时关闭过滤确认是不是规则问题：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[emoji]
content_filtration = false   # 暂时关闭过滤，排查是否为规则问题
```

:::

**步骤 3：检查目录权限**

确保 `data/emojis/` 目录可写。如果权限不对，在文件管理器里右键设置读写权限。

**步骤 4：调整表情数量限制**

如果提示注册数量超限：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[emoji]
emoji_send_num = 25          # 单次发送候选数（1-64）
max_reg_num = 64             # 最大注册表情包数量
do_replace = true            # 满额后替换旧表情
```

:::

#### 预防建议
- 谨慎开启 `content_filtration`，避免误杀正常表情
- 定期清理 `data/emojis/` 目录，删除不用的表情
- 设置合理的 `max_reg_num`，避免占用过多存储空间

---

### 场景 11：记忆系统错误

#### 错误现象
- 机器人回答"我不记得"或"未找到相关信息"
- 日志提示长期记忆加载失败
- 记忆添加后无法检索到

#### 快速自查三连
1️⃣ 在 WebUI 的「记忆」页面执行索引重建（段落、向量各有入口）
2️⃣ 检查 `data/a-memorix/` 目录是否可写、内容是否完整
3️⃣ 确认 `[a_memorix]` 下 `plugin.enabled` 为 `true`

#### 解决方案

**步骤 1：重建记忆索引**

长期记忆的段落索引和向量索引都在 WebUI 的「记忆」页面重建，1.3.1 没有独立的命令行重建工具。打开 WebUI → 记忆页面，按提示执行对应重建入口即可。

**步骤 2：检查记忆数据目录**

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 查看记忆数据目录（在 [a_memorix] 的 storage.data_dir 中配置，默认 data/a-memorix）
ls -la data/a-memorix/

# 确认目录可写，且没有残留的 .lock / .tmp 文件
```

:::

**步骤 3：启用记忆系统**

在配置文件中确认长期记忆已启用：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[a_memorix.plugin]
enabled = true                 # 长期记忆系统总开关，默认 false
```

:::

**步骤 4：向量索引损坏时重建**

如果检索不到新加入的记忆，优先在 WebUI 的「记忆」页面执行向量重建。仍不行就先备份 `data/a-memorix/`，停止 MaiBot 后删除该目录让系统重新生成（历史记忆需要从备份恢复）。

#### 预防建议
- 定期在 WebUI 检查记忆索引状态，发现检索不到及时重建
- 备份 `data/a-memorix/` 目录，它是长期记忆的唯一存储位置
- 使用 WebUI 的记忆管理功能，不要手动编辑 `data/a-memorix/` 里的文件

---

## 🟢 中频错误（特定场景）

覆盖场景 12–17，在特定操作或配置场景下才会遇到的问题。

### 场景 12：WebUI 登录失败 / Token 过期

#### 错误现象
- 打开 WebUI 页面后自动跳回登录页
- 粘贴 Token 后提示「登录失败」或「Token 无效」
- API 请求返回 `401 Unauthorized` 错误
- 浏览器控制台显示 `Token expired` 或 `Invalid session`

#### 快速自查三连
1️⃣ **清除浏览器缓存** — Cookie/LocalStorage 可能已过期或损坏
2️⃣ **检查 Token 是否正确** — 确认大小写、特殊字符输入无误，且没多复制空格
3️⃣ **查看 WebUI 服务状态** — 确认服务正在运行且未重启过

#### 解决方案

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

#### 预防建议
- **换成固定 Token** — 首次启动后把临时 Token 换成自己的，并在 `data/webui.json` 里固定下来
- **不要频繁修改 Token** — 否则每次都要重新登录
- **使用浏览器书签** — 保存登录后的页面，避免重复输入 Token

---

### 场景 13：适配器未连接或账号不可用

#### 错误现象
- 某平台（如 QQ）的消息无法发送
- 日志里看不到适配器上报的身份/连接信息
- 适配器已连接但机器人无响应
- 消息发送失败，返回 `400 Bad Request`

#### 快速自查三连
1️⃣ **检查适配器连接** — NapCat 等适配器是否正常启动并连上了 MaiBot
2️⃣ **验证账号凭证** — 确认适配器里登录的 QQ 号状态正常、未被封禁或掉线
3️⃣ **查看适配器日志** — 在 WebUI 日志面板或终端里找适配器相关记录

#### 解决方案

**步骤一：确认适配器已连接**
1.3.1 的平台账号由适配器侧维护，不在 `bot_config.toml` 里填写。先确认 NapCat（或其他适配器）已启动，并按[适配器文档](/manual/adapters/)连上 MaiBot。

**步骤二：检查适配器连接状态**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 查看 MaiBot 日志中的适配器记录
# Docker 部署
docker logs maibot | grep -i adapter

# 源码部署
# 观察终端输出，寻找适配器连接、身份上报相关日志
```

:::

**步骤三：验证账号凭证**
- **QQ 平台** — 确认适配器里登录的 QQ 号正常在线，未被禁言或封禁
- **其他平台** — 参考对应适配器的文档确认登录状态

#### 预防建议
- **使用小号** — 避免主号被封风险
- **定期检查适配器状态** — 掉线后及时重新登录
- **关注适配器更新** — 适配器版本过旧可能连不上新版 MaiBot

---

### 场景 14：正则表达式无效

#### 错误现象
- 启动或保存配置时报 `re.error: bad escape` 等错误
- 日志提示 `Invalid regex pattern` 或 `正则表达式编译失败`
- 关键词规则/消息过滤不生效
- 配置页面提示「保存失败：正则语法错误」

#### 快速自查三连
1️⃣ **检查特殊字符转义** — `\.` `\*` `\+` 等特殊字符是否加了反斜杠
2️⃣ **检查括号闭合** — `()` `[]` `{}` 是否成对出现
3️⃣ **使用在线工具测试** — 用 regex101.com 验证正则是否正确

#### 解决方案

**方法一：使用在线正则测试工具**
```text
# 访问 https://regex101.com/
# 1. 在左侧输入你的正则表达式
# 2. 在下方输入测试文本
# 3. 查看是否报错并调整
```

**方法二：转义特殊字符**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 错误示例：未转义
ban_msgs_regex = ["\d{17}[\dXx"]  # 方括号未闭合

# 正确示例：转义并闭合
ban_msgs_regex = [
    "\\d{17}[\\dXx]",            # 身份证号（TOML 中需要双反斜杠）
    "1[3-9]\\d{9}",              # 手机号
    "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",  # 邮箱
]
```

:::

**方法三：使用普通字符串代替正则**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 如果不需要复杂匹配，用普通字符串更安全
ban_words = ["广告", "加微信", "兼职"]  # 简单关键词，无需正则

# 避免写复杂的正则表达式
# ban_msgs_regex = ["(今天 | 明天 | 后天).*(天气 | 气温)"]  # 容易出错
# 改用关键词匹配
ban_words = ["天气", "气温", "温度"]
```

:::

> 💡 **提示**：TOML 文件中正则表达式需要双反斜杠 `\\` 转义，因为 `\` 本身是 TOML 的转义字符。

#### 预防建议
- **优先用关键词匹配** — 简单场景不需要正则
- **复杂正则单独测试** — 先在 regex101.com 验证再填入配置
- **添加注释说明** — 在正则旁边注释匹配的内容，方便后续维护

---

### 场景 15：关键词规则配置错误

#### 错误现象
- 消息匹配到错误的回复规则
- 规则完全不生效，机器人不回复
- 优先级冲突，高优先级规则覆盖低优先级
- 中英文标点混用导致匹配失败

#### 快速自查三连
1️⃣ **检查规则优先级** — `priority` 高的规则会覆盖低的
2️⃣ **确认规则已启用** — `enabled = true` 是否设置
3️⃣ **测试标点符号** — 全角/半角符号差异会影响匹配

#### 解决方案

**步骤一：检查关键词规则配置**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 编辑 config/bot_config.toml
[keyword_reaction]

# 纯关键词规则
[[keyword_reaction.keyword_rules]]
keywords = ["你好", "hello", "嗨"]
regex = []
reaction = "你好呀！有什么可以帮你的吗？"
priority = 10                    # 优先级，数字越大优先级越高
enabled = true                   # 确保规则已启用

# 纯正则规则
[[keyword_reaction.regex_rules]]
keywords = []
regex = ["(早安 | 早上好 | 早 [上啊].*)"]
reaction = "早上好！今天又是美好的一天~"
priority = 20
enabled = true

# 关键词 + 正则混合规则
[[keyword_reaction.keyword_rules]]
keywords = ["天气"]
regex = ["(今天 | 明天 | 后天).*(天气 | 气温 | 温度)"]
reaction = "让我看看天气预报..."
priority = 15
enabled = true
```

:::

**步骤二：调整优先级**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 优先级示例：
# priority = 30 — 最高优先级（精确匹配）
# priority = 20 — 中等优先级（正则匹配）
# priority = 10 — 默认优先级（普通关键词）
# priority = 1  — 最低优先级（兜底规则）

# 确保重要规则的优先级高于通用规则
[[keyword_reaction.keyword_rules]]
keywords = ["帮助", "help"]
reaction = "我可以帮你..."
priority = 30                    # 高优先级，确保优先匹配

[[keyword_reaction.keyword_rules]]
keywords = ["吗", "呢", "吧"]     # 通用疑问词，优先级放低
reaction = "这个嘛..."
priority = 5
```

:::

**步骤三：测试标点符号差异**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 全角标点（中文输入法）
keywords = ["你好，", "你好，"]   # 逗号不同

# 半角标点（英文输入法）
keywords = ["hello,", "hello!"]

# 建议同时配置两种标点
keywords = ["你好，", "你好，", "hello", "hello!"]
```

:::

#### 预防建议
- **规则命名加注释** — 在规则旁边注释用途
- **优先级分层管理** — 精确匹配 > 正则匹配 > 普通关键词 > 兜底规则
- **定期测试规则** — 在群里发送测试消息验证匹配效果
- **使用调试模式** — 打开 `DEBUG` 日志查看实际匹配链路

---

### 场景 16：Git 操作失败（WebUI）

#### 错误现象
- WebUI 中知识库同步/Git 镜像操作失败
- 日志显示 `Git clone failed` 或 `Permission denied`
- SSH Key 验证失败提示 `Host key verification failed`
- Git LFS 文件过大导致超时

#### 快速自查三连
1️⃣ **先确认网络** — 能不能访问 GitHub/Gitee？
2️⃣ **换个公开仓库试试** — 不需要登录的仓库有没有问题？
3️⃣ **仓库是不是太大了** — 大文件会导致超时

#### 解决方案

**步骤一：确认网络连通**
看看能不能打开 GitHub 或 Gitee 网站。如果打不开，说明网络有问题，先解决网络。

**步骤二：换个不需要登录的仓库试试**
如果提示权限错误（Permission denied），在 WebUI 中换个公开仓库（不需要 SSH Key 的那种）测试一下。如果公开仓库能正常同步，说明是 SSH 权限配置问题，去 GitHub/Gitee 检查 SSH Key 设置。

**步骤三：调整 Git 超时**
Git 镜像源在 WebUI 的「Git 镜像」页面维护，超时等参数随镜像源一起设置，不在 `bot_config.toml` 里。仓库较大时，在 WebUI 中把该镜像源的超时调大，或把不希望同步的大文件/目录排除掉。

#### 预防建议
- **先用公开仓库测试** — 确认能同步了再换私有仓库
- **避免大文件** — 不要在仓库里放大型二进制文件

---

### 场景 17：日志文件过大 / 磁盘空间满

#### 错误现象
- 系统运行缓慢或崩溃
- 日志轮转失败报 `No space left on device`
- 磁盘使用率 100%，无法写入新文件
- MaiBot 启动失败，提示数据库锁定或写入失败

#### 快速自查三连
1️⃣ **检查磁盘空间** — 打开文件管理器看看磁盘还剩多少空间
2️⃣ **查看日志文件大小** — 看看 `logs/` 文件夹有多大
3️⃣ **检查日志级别** — `DEBUG` 级别会产生大量日志

#### 解决方案

**步骤一：清理日志文件**
打开 `logs/` 文件夹，删除不需要的旧日志文件。一般只需要保留最近几天的日志，以前的可以直接删掉。

**步骤二：配置日志轮转**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 编辑 config/bot_config.toml
[log]
log_level = "INFO"             # 全局日志级别，生产环境用 INFO，调试时用 DEBUG
log_file_max_bytes = 10485760  # 单个日志文件超过 10MB 后轮转
max_log_files = 30             # 最多保留多少个主日志文件
log_cleanup_days = 30          # 超过该天数的日志文件自动清理
```

:::

日志轮转和清理默认就是开启的，改这三个值即可控制体积和保留时长。更细的调法见[日志与观测](/develop/observability)。

**步骤三：清理其他垃圾文件**
- Docker 用户：清理未使用的镜像和容器释放空间
- 检查 `~/.cache/` 目录，可以删除里面不需要的缓存文件

**步骤四：如果还不行，换个盘**
如果当前磁盘确实空间太小，考虑把 MaiBot 的日志和数据目录移到空间更大的磁盘上。

#### 预防建议
- **生产环境用 INFO 级别** — 避免 DEBUG 日志过多
- **配置日志轮转** — 限制日志文件大小和数量
- **定期清理** — 设置 crontab 每周自动清理旧日志
- **独立磁盘挂载** — 将日志目录挂载到独立磁盘分区
- **监控磁盘空间** — 设置告警，使用率超过 80% 时通知

---

## ⚪ 低频错误（罕见）

覆盖场景 18–19，极少遇到但在特殊操作时可能出现的问题。

### 场景 18：人物/用户系统数据异常

#### 错误现象
- WebUI 中用户资料加载失败，显示空白或报错
- 人物卡信息丢失，之前设置的性格/背景没了
- 绑定账号时提示「用户已存在」或「外键约束失败」

#### 快速自查三连
1️⃣ 是不是直接改过 SQLite 数据库文件？
2️⃣ `data/persons/` 文件夹里的人物卡 JSON 格式对吗？
3️⃣ 有没有多个 MaiBot 实例同时访问同一个数据库？

#### 解决方案
**重建人物索引**
人物卡信息异常时，先在 WebUI 的人物/用户管理页面刷新或重建索引；1.3.1 没有独立的命令行重建工具。

**检查人物卡格式**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 进入人物卡目录
cd data/persons/

# 验证 JSON 格式（以某个角色为例）
python -m json.tool "角色名.json" > /dev/null
```

:::

**修复数据库（谨慎操作）**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 备份数据库
cp data/MaiBot.db data/MaiBot.db.bak

# 使用 WebUI 管理用户，不要直接操作数据库
```

:::

#### 预防建议
- 🖥️ **用 WebUI 管理** - 不要直接改数据库文件
- 💾 **定期备份** - `data/persons/` 和 `data/MaiBot.db` 很重要
- 🔒 **避免并发访问** - 不要同时启动多个 MaiBot 连同一个数据库

---

### 场景 19：适配器 WebSocket 断开重连循环

#### 错误现象
适配器日志持续刷屏：
```
[WebSocket] Connection closed, reconnecting...
[WebSocket] Reconnecting in 3s...
[WebSocket] Connection established
[WebSocket] Connection closed, reconnecting...
```
消息收发不稳定，有时能收到有时收不到。

#### 快速自查三连
1️⃣ 适配器里填的 MaiBot 地址和端口对吗？MaiBot 侧旧版 WebSocket 服务默认端口是 `8000`（`[maim_message].ws_server_port`）
2️⃣ 网络稳不稳定？（服务器和适配器之间）
3️⃣ MaiBot 进程正常运行吗？终端有没有报端口占用或启动失败

#### 解决方案
**确认 MaiBot 侧的连接地址**
适配器（如 NapCat）里的 WebSocket 地址由适配器自己的配置文件维护，不在 `bot_config.toml` 里。默认连 MaiBot 的 `8000` 端口：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 仅当你确实启用了旧版 maim_message WebSocket 服务时，才需要改 MaiBot 侧端口
[maim_message]
ws_server_port = 8000
```

:::

**调整适配器侧重连间隔**
重连间隔在适配器侧配置，调大可以减少频繁重连：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 打开适配器自己的配置文件，把重连间隔调大（如 5 秒）
# 具体字段名以你使用的适配器文档为准
```

:::

**检查服务端状态**
检查 MaiBot 终端输出，确认进程正常运行、端口没被占用（端口占用见场景 3）。旧版 WebSocket 服务的监听端口由 `[maim_message].ws_server_port` 控制，默认 `8000`，改动后需重启 MaiBot。

**添加心跳保活（高级）**
如果网络环境较差，在适配器侧开启 WebSocket 心跳保活，具体字段参考对应适配器的文档。

#### 预防建议
- 🌐 **确保网络稳定** - 服务器和适配器之间网络要通畅
- 🔔 **启用心跳检测** - 长连接建议开启心跳保活
- 📊 **监控日志** - 发现频繁重连及时排查
- 🔄 **考虑用进程管理** - systemd/supervisor 可以自动重启服务

---

## ⚡ 错误代码速查表

> 按错误日志中常见的关键词快速定位到对应场景。

<!-- TASK_8_CONTENT_START -->

### HTTP 状态码速查

**HTTP 400 Bad Request** 🟧 严重 → [场景 13：适配器未连接或账号不可用](#场景-13-适配器未连接或账号不可用) — 请求参数错误，消息发送失败

**HTTP 401 Unauthorized** 🟥 致命 → [场景 2：API Key 错误/余额不足](#场景-2-api-key-错误-余额不足) — API Key 无效或缺失

**HTTP 401 Unauthorized** 🟧 严重 → [场景 12：WebUI 登录失败 / Token 过期](#场景-12-webui-登录失败-token-过期) — Session 过期或 Token 失效

**HTTP 402 Payment Required** 🟧 严重 → [场景 2：API Key 错误/余额不足](#场景-2-api-key-错误-余额不足) — 账户余额不足

**HTTP 403 Forbidden** 🟥 致命 → [场景 2：API Key 错误/余额不足](#场景-2-api-key-错误-余额不足) — API Key 权限不足

**HTTP 429 Too Many Requests** 🟧 严重 → [场景 9：网络超时/连接失败](#场景-9-网络超时-连接失败) — 请求频率过高被限流

**HTTP 500 Internal Server Error** 🟧 严重 → [场景 9：网络超时/连接失败](#场景-9-网络超时-连接失败) — API 服务端内部错误

**HTTP 502 Bad Gateway** 🟧 严重 → [场景 9：网络超时/连接失败](#场景-9-网络超时-连接失败) — 网关错误，上游服务不可达

**HTTP 503 Service Unavailable** 🟧 严重 → [场景 9：网络超时/连接失败](#场景-9-网络超时-连接失败) — 服务暂时不可用（过载/维护）

### 常见错误关键词索引

**`Address already in use`** / **`[Errno 98]`** / **`[Errno 10048]`** 🟧 严重 → [场景 3：端口被占用](#场景-3-端口被占用) — 端口已被其他进程占用

**`APIConnectionError`** 🟧 严重 → [场景 9：网络超时/连接失败](#场景-9-网络超时-连接失败) — API 连接失败

**`Connection refused`** / **`无法访问此网站`** 🟥 致命 → [场景 4：WebUI 页面打不开](#场景-4-webui-页面打不开) — WebUI 服务未启动或端口不可达

**`database is locked`** 🟧 严重 → [场景 8：数据库错误](#场景-8-数据库错误) — 数据库被多进程锁定

**`DatabaseError`** / **`OperationalError`** 🟧 严重 → [场景 8：数据库错误](#场景-8-数据库错误) — 数据库操作异常

**`FileNotFoundError`** 🟥 致命 → [场景 1：配置文件找不到或格式不对](#场景-1-配置文件找不到或格式不对) — 配置文件不存在

**`Host 版本不兼容`** / **`SDK 版本不兼容`** 🟧 严重 → [场景 7：插件加载失败](#场景-7-插件加载失败) — 插件声明的版本区间不覆盖当前版本

**`ImportError`** / **`ModuleNotFoundError`** 🟧 严重 → [场景 7：插件加载失败](#场景-7-插件加载失败) — 插件依赖缺失

**`No space left on device`** 🟧 严重 → [场景 17：日志文件过大 / 磁盘空间满](#场景-17-日志文件过大-磁盘空间满) — 磁盘空间不足

**`PluginConfigVersionError`** 🟧 严重 → [场景 7：插件加载失败](#场景-7-插件加载失败) — 插件配置版本不受支持

**`re.error`** / **`bad escape`** 🟨 警告 → [场景 14：正则表达式无效](#场景-14-正则表达式无效) — 正则语法错误

**`TimeoutError`** 🟧 严重 → [场景 9：网络超时/连接失败](#场景-9-网络超时-连接失败) — 请求超时

**`Token expired`** 🟨 警告 → [场景 12：WebUI 登录失败 / Token 过期](#场景-12-webui-登录失败-token-过期) — 登录 Session 已过期

**`TOML syntax error`** 🟥 致命 → [场景 1：配置文件找不到或格式不对](#场景-1-配置文件找不到或格式不对) — 配置文件格式错误

**`ValueError`** 🟥 致命 → [场景 5：MCP 配置错误](#场景-5-mcp-配置错误) — MCP 服务器配置参数无效

**表情注册失败** 🟨 警告 → [场景 10：表情包系统错误](#场景-10-表情包系统错误) — 超出数量限制或 `data/emojis/` 不可写

**记忆加载失败** 🟧 严重 → [场景 11：记忆系统错误](#场景-11-记忆系统错误) — 记忆索引损坏或记忆目录不可写

**Session 过期** 🟨 警告 → [场景 12：WebUI 登录失败 / Token 过期](#场景-12-webui-登录失败-token-过期) — 浏览器 Session 已失效

<!-- TASK_8_CONTENT_END -->

---

## 🆘 获取帮助指引

<!-- TASK_9_CONTENT_START -->

### 🤔 提问前自查

在向别人求助之前，花 2 分钟做以下检查，大部分问题可以自己解决：

**`📖 1. 查阅官方文档`**
: 你的问题很可能已经在本文档的各个场景中有解答了。先搜一遍，省时省力。

**`🔍 2. 查看错误日志`**
: 日志里会写明具体的错误原因和堆栈跟踪，这是定位问题的第一线索。不知道怎么导出？往下看「如何获取日志」。

**`⚙️ 3. 检查近期改动`**
: 回想最近改过什么配置、装过什么插件、更新过什么版本。尝试回退到最后一次正常工作的状态，确认是不是哪步改错了。

**`🌐 4. 搜索已知问题`**
: 用错误关键词搜索 [GitHub Issues](https://github.com/Mai-with-u/docs/issues) 或搜索引擎，看看是否有别人遇到过相同的问题。

### 📋 提交 Issue 的信息清单

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

### 🌐 社区支持渠道

**`💬 QQ 群`**
: 加入 MaiBot 用户交流群，和其他用户一起交流使用经验。群号：`[请填写群号]`

**`🐱 GitHub Issues`**
: 确认是 Bug 或功能建议，请在 [GitHub Issues](https://github.com/Mai-with-u/docs/issues) 提交。提交前记得先搜索，避免重复

**`📖 官方文档站`**
: 最新最全的文档请访问 [MaiBot 文档站](https://docs.mai-mai.org/)

**`💬 GitHub Discussions`**
: 功能讨论、技术提问可访问 [GitHub Discussions](https://github.com/Mai-with-u/docs/discussions) 参与社区讨论

### 📝 如何获取日志

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

<!-- TASK_9_CONTENT_END -->

---

## 📋 错误排查流程图

> 不确定问题属于哪一类？按流程图指引找到对应章节。

<!-- TASK_FLOWCHART_START -->

```mermaid
graph TD
    A[❓ 遇到什么问题？] --> B{启动时崩溃/报错退出？}
    B -->|是| C[🔴 极高频错误]
    B -->|否| D{启动正常但功能异常？}
    D -->|是| E{哪方面功能？}
    E -->|消息不回复| F[场景 6：机器人不回复]
    E -->|表情包| G[场景 10：表情包系统]
    E -->|记忆/知识| H[场景 11：记忆系统]
    E -->|插件| I[场景 7：插件加载]
    D -->|否| J{WebUI 相关问题？}
    J -->|是| K{WebUI 打得开吗？}
    K -->|打不开| L[场景 4：WebUI 页面打不开]
    K -->|打得开但登录失败| M[🟢 中频错误]
    J -->|否| N{平台消息收发？}
    N -->|是| O{具体表现？}
    O -->|发不出消息| P[场景 13：适配器/账号]
    O -->|频繁断连| Q[场景 19：适配器重连]
    N -->|否| R{运行时性能/存储？}
    R -->|是| S[场景 17：磁盘满]
    R -->|否| T[⚪ 低频错误]

    click C "scenario-1"
    click F "scenario-6"
    click G "scenario-10"
    click H "scenario-11"
    click I "scenario-7"
    click L "scenario-4"
    click M "scenario-12"
    click P "scenario-13"
    click Q "scenario-19"
    click S "scenario-17"
```

<!-- TASK_FLOWCHART_END -->


