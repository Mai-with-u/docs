---
title: 插件与适配器错误排查
---

# 插件与适配器错误排查

这页解决插件和适配器相关的报错：插件加载失败、适配器未连接或账号不可用、适配器 WebSocket 断开重连循环。

## 插件加载失败

### 错误现象
- 启动时日志提示插件加载失败，WebUI 插件列表里对应插件灰色不可用
- 日志显示 `ImportError`、`ModuleNotFoundError` 或 `Manifest 校验失败`
- 日志提示 `Host 版本不兼容` 或 `SDK 版本不兼容`（插件声明的 Host / SDK 版本区间不覆盖当前版本）
- 插件目录存在但没有任何插件被加载

### 快速自查三连
1️⃣ 先试试重新安装插件，换个最新版本
2️⃣ 看看日志里提示缺少什么依赖
3️⃣ 确认 Python 版本 ≥ 3.12 且插件和 MaiBot 版本兼容

### 解决方案

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

开启后版本区间校验被跳过，日志里只记一条 warning（含插件声明的 Host / SDK 范围和当前版本），不再因此拒绝加载；**修改后需要重启 MaiBot 生效**。这是临时兜底而非推荐做法——插件可能真的不兼容，强行加载可能在运行期报错。确认插件有兼容版本后，请把它改回 `false` 并更新插件。该开关的完整说明见 [Bot 配置 · 调试](../manual/configuration/bot-config.md#调试)。

### 预防建议
- 安装插件前先看说明，确认兼容的 MaiBot 版本
- 优先用官方插件或社区热门插件
- 定期更新插件和 MaiBot 到最新版本
- 不要长期开启 `[debug].force_plugin_compatibility`，它只是没有兼容版本时的临时兜底

## 适配器未连接或账号不可用

### 错误现象
- 某平台（如 QQ）的消息无法发送
- 日志里看不到适配器上报的身份/连接信息
- 适配器已连接但机器人无响应
- 消息发送失败，返回 `400 Bad Request`

### 快速自查三连
1️⃣ **检查适配器连接** — NapCat 等适配器是否正常启动并连上了 MaiBot
2️⃣ **验证账号凭证** — 确认适配器里登录的 QQ 号状态正常、未被封禁或掉线
3️⃣ **查看适配器日志** — 在 WebUI 日志面板或终端里找适配器相关记录

### 解决方案

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

### 预防建议
- **使用小号** — 避免主号被封风险
- **定期检查适配器状态** — 掉线后及时重新登录
- **关注适配器更新** — 适配器版本过旧可能连不上新版 MaiBot

## 适配器 WebSocket 断开重连循环

### 错误现象
适配器日志持续刷屏：
```
[WebSocket] Connection closed, reconnecting...
[WebSocket] Reconnecting in 3s...
[WebSocket] Connection established
[WebSocket] Connection closed, reconnecting...
```
消息收发不稳定，有时能收到有时收不到。

### 快速自查三连
1️⃣ 适配器里填的 MaiBot 地址和端口对吗？MaiBot 侧旧版 WebSocket 服务默认端口是 `8000`（`[maim_message].ws_server_port`）
2️⃣ 网络稳不稳定？（服务器和适配器之间）
3️⃣ MaiBot 进程正常运行吗？终端有没有报端口占用或启动失败

### 解决方案
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
检查 MaiBot 终端输出，确认进程正常运行、端口没被占用（端口占用见[启动与访问错误排查 · 端口被占用](./troubleshooting-startup.md#端口被占用)）。旧版 WebSocket 服务的监听端口由 `[maim_message].ws_server_port` 控制，默认 `8000`，改动后需重启 MaiBot。

**添加心跳保活（高级）**
如果网络环境较差，在适配器侧开启 WebSocket 心跳保活，具体字段参考对应适配器的文档。

### 预防建议
- 🌐 **确保网络稳定** - 服务器和适配器之间网络要通畅
- 🔔 **启用心跳检测** - 长连接建议开启心跳保活
- 📊 **监控日志** - 发现频繁重连及时排查
- 🔄 **考虑用进程管理** - systemd/supervisor 可以自动重启服务

## 相关

- [错误排查总览](./error-troubleshooting.md) — 错误代码速查表、常见错误关键词索引和排查流程图。
- [启动与访问错误排查](./troubleshooting-startup.md) — 配置文件、MCP、端口、WebUI 访问与登录。
- [模型与规则错误排查](./troubleshooting-model.md) — API Key、网络超时、正则表达式和关键词规则。
- [运行与数据错误排查](./troubleshooting-runtime.md) — 不回复消息、数据库、表情包、记忆、磁盘空间和数据异常。
- [获取帮助](./getting-help.md) — 提问前自查、提交 Issue 的信息清单和获取日志的方法。
