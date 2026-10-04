---
title: 系统控制
---

# 系统控制

本篇覆盖 MaiBot WebUI 中 `/api/webui/system/*` 命名空间下的运维端点，面向需要用脚本做重启、巡检、缓存清理和配置热重载的部署者。所有端点均需认证，详见 [WebUI HTTP API 入口](./index.md)。

## 重启与优雅关闭

`POST /api/webui/system/restart` 触发主进程重启。调用后 MaiBot 会：

1. 立即返回 HTTP 200，告诉你"麦麦正在重启中"
2. 在后台等待 0.5 秒（确保响应已发送到客户端）
3. 调用主循环停掉插件运行时
4. 以退出码 `42` 结束进程

退出码 42 是一个约定：外部进程管理器（systemd、supervisord、docker restart policy 等）可以据此判断这是"应重启"而非异常崩溃。如果你通过 `python main.py` 直接启动，进程会退出而不会自动重启，需要由外部 wrapper 捕获退出码 42 后重新启动。

::: code-group

```bash [curl 重启 ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/restart \
  -H "Cookie: maibot_session=你的Token"
```

:::

**预期返回：**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{"success": true, "message": "麦麦正在重启中..."}
```

:::

**响应模型：** `RestartResponse`，仅两个字段 — `success` (bool) 和 `message` (str)。

## 配置热重载

`POST /api/webui/system/reload-config` 触发配置热重载。与重启不同，热重载不会中断 MaiBot 的运行（不会下线、不会丢失当前连接），仅重新从配置文件读取最新值。

::: code-group

```bash [curl 热重载 ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/reload-config \
  -H "Cookie: maibot_session=你的Token"
```

:::

**当前实现状态：** 该端点是一个占位端点，返回 `{"success": true, "message": "配置重载功能待实现"}`。实际热重载逻辑在 `ConfigManager.reload_config()` 中（见 `src/config/config.py`），目前由其他内部路径（如 WebUI 配置保存、模型切换等）通过 `config_manager.reload_config(changed_scopes=...)` 按需调用，而不是由这个公开端点统一触发。

**后续规划：** 待该端点完善后，它将支持传入 `changed_scopes` 参数来指定重载范围（如 `bot`、`model`），仅重载发生变化的配置段。

## 系统状态查询

`GET /api/webui/system/status` 返回 MaiBot 当前运行状态的快照。

::: code-group

```bash [curl 查询状态 ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/system/status \
  -H "Cookie: maibot_session=你的Token"
```

:::

**预期返回：**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "running": true,
  "uptime": 86400.5,
  "version": "1.2.0",
  "start_time": "2026-07-17T12:00:00"
}
```

:::

**响应字段：**

- **`running`** — 恒为 `true`（服务在线才能响应请求）
- **`uptime`** — 自进程启动起已运行的秒数（浮点）
- **`version`** — 当前 MaiBot 版本号，取自 `MMC_VERSION` 常量
- **`start_time`** — ISO 8601 格式的启动时间戳

这个端点是编写健康监控脚本的首选：它比 `/health` 多了运行时长和版本信息，适合做巡检报告。

## 更新通知

更新公告系统用于在 WebUI 前端弹出指定版本的更新说明。涉及两个端点：

### 查询待更新公告

`GET /api/webui/system/update-notice` 返回当前是否有未确认的更新公告。可选查询参数 **`force=true`** 用于调试公告展示：没有待确认公告时，服务端会生成一条当前版本的调试公告；正常客户端不应携带此参数。

::: code-group

```bash [curl 查询公告 ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/system/update-notice \
  -H "Cookie: maibot_session=你的Token"
```

```bash [curl 强制预览公告 ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/system/update-notice?force=true" \
  -H "Cookie: maibot_session=你的Token"
```

:::

**预期返回（有待公告时）：**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "pending": true,
  "current_version": "1.2.0",
  "from_version": "1.1.0",
  "versions": ["1.1.0", "1.2.0"],
  "content": "本次更新新增..."
}
```

:::

- **`pending`** — `true` 表示有待阅读的公告，`false` 表示无需弹出
- **`current_version`** — 当前运行的版本
- **`from_version`** — 公告覆盖的起始版本（即上一个用户已确认的版本）
- **`versions`** — 公告覆盖的版本列表
- **`content`** — 公告正文

### 确认公告已读

`POST /api/webui/system/update-notice/ack` 标记当前版本的公告已被用户确认。调完后 `GET /update-notice` 将返回 `{"pending": false, ...}`。

::: code-group

```bash [curl 确认公告 ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/update-notice/ack \
  -H "Cookie: maibot_session=你的Token"
```

:::

**预期返回：**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{"success": true, "message": "更新公告已确认", "version": "1.2.0"}
```

:::

## 本地缓存清理

MaiBot 长期运行后，本地会产生大量可清理的文件和数据库冗余记录。`/system/local-cache/*` 端点组提供了完整的缓存巡检与清理能力，共 5 个子端点群。

### local-cache 总览

`GET /api/webui/system/local-cache` 返回三类本地存储的目录级别统计：图片缓存、表情包缓存和日志文件，外加数据库文件大小概览。响应做了 120 秒缓存（`_LOCAL_CACHE_STATS_CACHE_TTL_SECONDS`）。

**响应模型：** `LocalCacheStatsResponse`，包含 `directories` 列表和 `database` 字段。

### database VACUUM

`POST /api/webui/system/local-cache/database/vacuum` 对 SQLite 数据库执行 VACUUM 操作。删除聊天记录、统计缓存等数据后，SQLite 不会自动归还磁盘空间，需要 VACUUM 回收空闲页。执行过程：先做 WAL checkpoint（截断模式），再 VACUUM，最后再做一次 checkpoint。

::: code-group

```bash [curl 执行 VACUUM ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/local-cache/database/vacuum \
  -H "Cookie: maibot_session=你的Token"
```

:::

**预期返回：**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "success": true,
  "message": "数据库 VACUUM 已完成",
  "database_size_before": 52428800,
  "database_size_after": 31457280,
  "reclaimed_bytes": 20971520,
  "checkpoint_busy": 0,
  "checkpoint_log": 0,
  "checkpointed": 5
}
```

:::

**注意事项：** VACUUM 需要重建整个数据库文件，会短暂占用额外磁盘空间（临时写入，操作完成后释放）。当 MaiBot 有大量并发写入时，VACUUM 可能耗时较长，建议在低负载时段执行。

### data-entries 浏览与删除

**`GET /api/webui/system/local-cache/data-entries?relative_path=`** 浏览 `data/` 目录下的文件和文件夹。支持逐级进入子目录。

**`DELETE /api/webui/system/local-cache/data-entries`** 删除指定的条目。受保护路径（数据库文件及其 `-wal`/`-shm` 辅助文件）不可删除。

::: code-group

```bash [curl 浏览 data 根目录 ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/system/local-cache/data-entries?relative_path=" \
  -H "Cookie: maibot_session=你的Token"
```

:::

**响应模型：** `LocalCacheDataEntriesResponse`，包含当前路径、父路径、条目列表（每个条目标注 `protected` 状态）。

### images 浏览与删除

**`GET /api/webui/system/local-cache/images?target=images&page=1&page_size=40`** 分页列出图片或表情包缓存文件，支持按日期范围过滤。

**`GET /api/webui/system/local-cache/images/preview?target=images&relative_path=...`** 返回单张图片的二进制流，供浏览器预览。

**`DELETE /api/webui/system/local-cache/images`** 删除单张图片（需传 `target` 和 `relative_path`）。

**`DELETE /api/webui/system/local-cache/images/bulk`** 按日期范围或保留最近 N 天批量删除。

::: code-group

```bash [curl 列出图片缓存 ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/system/local-cache/images?target=images&page=1&page_size=20" \
  -H "Cookie: maibot_session=你的Token"
```

:::

**响应模型：** `LocalCacheImageListResponse`，包含分页数据、`date_groups` 日期分组和总大小。

### log-directories 列出与清理

**`GET /api/webui/system/local-cache/log-directories`** 列出 `logs/` 目录下可分别清理的日志目录。

**`DELETE /api/webui/system/local-cache/log-directories`** 清理指定日志目录。传空 `relative_path` 仅清理 `logs/` 根目录下的文件，不删除子目录。

### cleanup 统一清理

`POST /api/webui/system/local-cache/cleanup` 是一次性清理指定目标的综合端点，支持四类目标：

- **`images`** — 清空图片缓存目录 + 删除数据库 image 记录
- **`emoji`** — 清空表情包缓存目录（含缩略图目录）+ 删除数据库 emoji 记录
- **`log_files`** — 清空日志目录
- **`database_logs`** — 按表名清理数据库记录，支持 `all` 或 `older_than_days` 模式，可附带 VACUUM

::: code-group

```bash [curl 清理最近 30 天以前的统计缓存 ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/local-cache/cleanup \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=你的Token" \
  -d '{
    "target": "database_logs",
    "tables": ["statistics_message_hourly", "statistics_tool_hourly", "statistics_model_hourly"],
    "database_mode": "older_than_days",
    "older_than_days": 30,
    "vacuum_after_cleanup": true
  }'
```

:::

**预期返回：**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "success": true,
  "message": "数据库表清理完成",
  "target": "database_logs",
  "removed_records": 12500,
  "vacuumed": true,
  "database_size_before": 41943040,
  "database_size_after": 25165824,
  "reclaimed_bytes": 16777216
}
```

:::

**请求模型：** `LocalCacheCleanupRequest`

- **`target`** — `images` | `emoji` | `log_files` | `database_logs`
- **`tables`** — `database_logs` 时必填，可选值见下表
- **`database_mode`** — `all`（全部清理）或 `older_than_days`（按天数清理）
- **`older_than_days`** — `database_mode` 为 `older_than_days` 时必填
- **`vacuum_after_cleanup`** — 清理后是否 VACUUM，默认 `true`

**可清理的数据库表：**

- **`llm_usage`** — LLM 调用记录（调用与统计）
- **`tool_records`** — 工具调用记录（调用与统计）
- **`mai_messages`** — 消息记录（聊天历史）
- **`chat_history`** — 聊天摘要历史（聊天历史）
- **`online_time`** — 在线时长记录（运行统计）
- **`statistics_message_hourly`** — 消息小时统计（统计缓存）
- **`statistics_tool_hourly`** — 工具小时统计（统计缓存）
- **`statistics_model_hourly`** — 模型小时统计（统计缓存）

## Maisaka Monitor 媒体获取

`GET /api/webui/system/maisaka-monitor/media/{media_kind}/{media_hash}` 用于 Maibaka 观察面板中查看消息附带的原始图片或表情文件。`media_kind` 取值为 `image` 或 `emoji`，`media_hash` 是观察面板消息中引用的文件哈希。

这是一个只读端点，返回原始二进制数据（`FileResponse`），不涉及缓存管理。

## `reload-config` 与手工编辑配置的权衡

这里有一个常见的困惑：**手工改了 bot.toml 或 model.toml，该调 `reload-config` 还是 `restart`？**

当前阶段的实际行为如下：

- **`POST /system/reload-config`** — 占位端点，本身不做实际重载。当你在 WebUI 中通过配置界面修改并保存时，前端会调的是 `/api/config/raw` 或 `/api/webui/config/*` 中的保存端点，这些端点内部会调用 `config_manager.reload_config(changed_scopes=...)` 来触发真正的热重载。
- **`POST /system/restart`** — 彻底重启，所有配置必然生效。代价是服务中断几十秒，插件全部重新初始化。

**建议策略：**

- **修改模型配置或 bot 核心参数 → 走 WebUI 配置界面保存**，内部会自动热重载对应 scope，无需重启
- **修改了 YAML / TOML 中未暴露在 WebUI 的高级配置 → 执行重启**，因为热重载路径可能未覆盖这些字段
- **不确定配置是否热重载安全 → 重启**，避免运行时状态不一致

待到 `reload-config` 端点完善后，它将统一充当"手工改文件后通知进程重新加载"的入口，届时推荐流程变为：手工编辑 → 调 `reload-config` → 通过 `/status` 或日志确认生效。

## 自动化运维脚本片段

下面是一个 Bash 脚本片段示例：登录、巡检、清理 30 天以前的统计缓存、执行 VACUUM，三步走。依赖 `curl` 和 `jq`。

::: code-group

```bash [Bash 运维脚本 ~vscode-icons:file-type-shell~]
#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:8001/api/webui"
TOKEN="${MAIBOT_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "请设置环境变量 MAIBOT_TOKEN"
  exit 1
fi

# 1. 登录拿 Cookie（写临时 cookie jar）
COOKIE_JAR=$(mktemp)
trap 'rm -f "$COOKIE_JAR"' EXIT

curl -s -X POST "$BASE/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" \
  -c "$COOKIE_JAR" > /dev/null

# 2. 巡检状态
echo "=== 系统状态 ==="
curl -s -X GET "$BASE/system/status" -b "$COOKIE_JAR" | jq .

# 3. 本地缓存总览
echo "=== 本地缓存 ==="
curl -s -X GET "$BASE/system/local-cache" -b "$COOKIE_JAR" | jq .

# 4. 清理 30 天以前的统计缓存
echo "=== 清理统计缓存 ==="
curl -s -X POST "$BASE/system/local-cache/cleanup" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "target": "database_logs",
    "tables": ["statistics_message_hourly", "statistics_tool_hourly", "statistics_model_hourly"],
    "database_mode": "older_than_days",
    "older_than_days": 30,
    "vacuum_after_cleanup": true
  }' | jq .

# 5. 单独 VACUUM（如果上一步未包含 vacuum）
echo "=== VACUUM ==="
curl -s -X POST "$BASE/system/local-cache/database/vacuum" \
  -b "$COOKIE_JAR" | jq .

echo "=== 运维完成 ==="
```

:::

此脚本可作为 cron 定时任务的基础模板。如果你用 systemd 管理 MaiBot，重启操作可替换为：

::: code-group

```bash [Bash systemctl 重启 ~vscode-icons:file-type-shell~]
# 通过 WebUI API 触发重启后，systemd 的 Restart=on-failure 或 RestartExitStatus=42 会自动拉起进程
curl -s -X POST "http://127.0.0.1:8001/api/webui/system/restart" \
  -b "$COOKIE_JAR"
```

:::

**systemd service 配置提示：**

在 `[Service]` 段中加入 `RestartExitStatus=42`，并配合 `Restart=on-failure` 或 `Restart=always`，即可让 MaiBot 在收到 WebUI 重启指令后由 systemd 自动拉起。重启时插件运行时会被优雅停止，但不等于完整的 graceful shutdown（MaiBot 的退出走 `os._exit(42)`，跳过正常的 Python 清理流程）。
