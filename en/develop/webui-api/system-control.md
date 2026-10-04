---
title: System Control
---

# System Control

This page covers the ops endpoints under the `/api/webui/system/*` namespace of the MaiBot WebUI, aimed at deployers who need to script restarts, health checks, cache cleanup, and configuration hot-reloads. All endpoints require authentication — see [WebUI HTTP API Entry](./index.md) for details.

## Restart and Graceful Shutdown

`POST /api/webui/system/restart` triggers a main process restart. After calling, MaiBot will:

1. Immediately return HTTP 200, telling you "麦麦正在重启中"
2. Wait 0.5 seconds in the background (ensuring the response has been sent to the client)
3. Call the main loop to stop the plugin runtime
4. Exit the process with exit code `42`

Exit code 42 is a convention: external process managers (systemd, supervisord, Docker restart policy, etc.) can use it to determine this is an "intended restart" rather than an abnormal crash. If you start MaiBot directly via `python main.py`, the process will exit without auto-restarting — an external wrapper is needed to catch exit code 42 and restart it.

::: code-group

```bash [curl Restart ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/restart \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Expected response:**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{"success": true, "message": "麦麦正在重启中..."}
```

:::

**Response model:** `RestartResponse`, with two fields — `success` (bool) and `message` (str).

## Configuration Hot-Reload

`POST /api/webui/system/reload-config` triggers a configuration hot-reload. Unlike a restart, hot-reloading does not interrupt MaiBot's operation (won't go offline, won't lose current connections) — it only re-reads the latest values from the config file.

::: code-group

```bash [curl Hot-Reload ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/reload-config \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Current implementation status:** This endpoint is a placeholder, returning `{"success": true, "message": "配置重载功能待实现"}`. The actual hot-reload logic resides in `ConfigManager.reload_config()` (see `src/config/config.py`). Currently, it's invoked on-demand via `config_manager.reload_config(changed_scopes=...)` by other internal paths (e.g., WebUI config save, model switch), not uniformly triggered by this public endpoint.

**Future roadmap:** When this endpoint is completed, it will support passing `changed_scopes` parameter to specify the reload scope (e.g., `bot`, `model`), reloading only the changed config sections.

## System Status Query

`GET /api/webui/system/status` returns a snapshot of MaiBot's current runtime state.

::: code-group

```bash [curl Query Status ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/system/status \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Expected response:**

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

**Response fields:**

- **`running`** — Always `true` (the service must be online to respond)
- **`uptime`** — Seconds elapsed since process start (float)
- **`version`** — Current MaiBot version, taken from the `MMC_VERSION` constant
- **`start_time`** — ISO 8601 formatted startup timestamp

This endpoint is the top choice for writing health monitoring scripts: it provides runtime duration and version info beyond what `/health` offers, making it suitable for inspection reports.

## Update Notices

The update announcement system is used to display version-specific release notes in the WebUI frontend. Two endpoints are involved:

### Query Pending Update Notices

`GET /api/webui/system/update-notice` returns whether there are unacknowledged update announcements. The optional query parameter **`force=true`** is for debugging announcement display: when there is no pending announcement, the server generates a debug announcement for the current version. Normal clients should not send this parameter.

::: code-group

```bash [curl Query Notices ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/system/update-notice \
  -H "Cookie: maibot_session=你的Token"
```

```bash [curl Force-preview Notices ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/system/update-notice?force=true" \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Expected response (when pending notices exist):**

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

- **`pending`** — `true` indicates unread announcements, `false` means no popup needed
- **`current_version`** — Currently running version
- **`from_version`** — The starting version covered by the announcement (the last version the user acknowledged)
- **`versions`** — List of versions covered by the announcement
- **`content`** — Announcement body text

### Acknowledge Notices as Read

`POST /api/webui/system/update-notice/ack` marks the current version's announcement as acknowledged. After calling, `GET /update-notice` will return `{"pending": false, ...}`.

::: code-group

```bash [curl Acknowledge Notices ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/update-notice/ack \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Expected response:**

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{"success": true, "message": "更新公告已确认", "version": "1.2.0"}
```

:::

## Local Cache Cleanup

After long-term operation, MaiBot accumulates a significant amount of cleanable files and database redundant records. The `/system/local-cache/*` endpoint group provides comprehensive cache inspection and cleanup capabilities, with 5 sub-endpoint groups in total.

### local-cache Overview

`GET /api/webui/system/local-cache` returns directory-level statistics for three types of local storage: image cache, emoji cache, and log files, plus a database file size overview. The response is cached for 120 seconds (`_LOCAL_CACHE_STATS_CACHE_TTL_SECONDS`).

**Response model:** `LocalCacheStatsResponse`, containing a `directories` list and a `database` field.

### database VACUUM

`POST /api/webui/system/local-cache/database/vacuum` performs a VACUUM operation on the SQLite database. After deleting records such as chat history and statistics caches, SQLite does not automatically release disk space — VACUUM is needed to reclaim free pages. Execution process: first a WAL checkpoint (truncate mode), then VACUUM, and finally another checkpoint.

::: code-group

```bash [curl Run VACUUM ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/system/local-cache/database/vacuum \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Expected response:**

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

**Notes:** VACUUM rebuilds the entire database file and temporarily consumes extra disk space (written temporarily, released once the operation completes). When MaiBot has heavy concurrent writes, VACUUM may take longer — it's recommended to run during low-load periods.

### data-entries Browse and Delete

**`GET /api/webui/system/local-cache/data-entries?relative_path=`** — Browse files and folders under the `data/` directory. Supports navigating into subdirectories level by level.

**`DELETE /api/webui/system/local-cache/data-entries`** — Delete specified entries. Protected paths (database files and their `-wal`/`-shm` auxiliary files) cannot be deleted.

::: code-group

```bash [curl Browse data Root ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/system/local-cache/data-entries?relative_path=" \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Response model:** `LocalCacheDataEntriesResponse`, containing the current path, parent path, and an entry list (each entry annotated with `protected` status).

### images Browse and Delete

**`GET /api/webui/system/local-cache/images?target=images&page=1&page_size=40`** — Paginated listing of image or emoji cache files, with optional date range filtering.

**`GET /api/webui/system/local-cache/images/preview?target=images&relative_path=...`** — Returns a single image's binary stream for browser preview.

**`DELETE /api/webui/system/local-cache/images`** — Delete a single image (requires `target` and `relative_path`).

**`DELETE /api/webui/system/local-cache/images/bulk`** — Batch delete by date range or keeping the most recent N days.

::: code-group

```bash [curl List Image Cache ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/system/local-cache/images?target=images&page=1&page_size=20" \
  -H "Cookie: maibot_session=你的Token"
```

:::

**Response model:** `LocalCacheImageListResponse`, containing paginated data, `date_groups` date groupings, and total size.

### log-directories Listing and Cleanup

**`GET /api/webui/system/local-cache/log-directories`** — List log directories under `logs/` that can be cleaned individually.

**`DELETE /api/webui/system/local-cache/log-directories`** — Clean a specified log directory. Passing an empty `relative_path` only cleans files in the `logs/` root, not subdirectories.

### cleanup Unified Cleanup

`POST /api/webui/system/local-cache/cleanup` is a comprehensive endpoint for single-pass cleanup of specified targets, supporting four target types:

- **`images`** — Clear image cache directory + delete database image records
- **`emoji`** — Clear emoji cache directory (including thumbnail directory) + delete database emoji records
- **`log_files`** — Clear log directory
- **`database_logs`** — Clean database records by table name, supporting `all` or `older_than_days` mode, with optional VACUUM

::: code-group

```bash [curl Clean Statistics Cache Older Than 30 Days ~vscode-icons:file-type-http~]
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

**Expected response:**

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

**Request model:** `LocalCacheCleanupRequest`

- **`target`** — `images` | `emoji` | `log_files` | `database_logs`
- **`tables`** — Required when `database_logs`, see table below for options
- **`database_mode`** — `all` (clean all) or `older_than_days` (clean by days)
- **`older_than_days`** — Required when `database_mode` is `older_than_days`
- **`vacuum_after_cleanup`** — Whether to VACUUM after cleanup, default `true`

**Cleanable database tables:**

- **`llm_usage`** — LLM call records (invocation and statistics)
- **`tool_records`** — Tool call records (invocation and statistics)
- **`mai_messages`** — Message records (chat history)
- **`chat_history`** — Chat summary history (chat history)
- **`online_time`** — Online duration records (runtime statistics)
- **`statistics_message_hourly`** — Message hourly statistics (statistics cache)
- **`statistics_tool_hourly`** — Tool hourly statistics (statistics cache)
- **`statistics_model_hourly`** — Model hourly statistics (statistics cache)

## Maisaka Monitor Media Retrieval

`GET /api/webui/system/maisaka-monitor/media/{media_kind}/{media_hash}` is used to view raw images or emoji files attached to messages in the Maisaka observation panel. `media_kind` is `image` or `emoji`; `media_hash` is the file hash referenced in the observation panel message.

This is a read-only endpoint returning raw binary data (`FileResponse`) and is not related to cache management.

## `reload-config` vs. Manual Config Editing

Here's a common confusion: **after manually editing bot.toml or model.toml, should you call `reload-config` or `restart`?**

Actual behavior at the current stage:

- **`POST /system/reload-config`** — Placeholder endpoint; does not perform actual reload by itself. When you modify and save through the WebUI config interface, the frontend calls save endpoints like `/api/config/raw` or `/api/webui/config/*`, which internally call `config_manager.reload_config(changed_scopes=...)` to trigger the real hot-reload.
- **`POST /system/restart`** — Complete restart; all config changes will definitely take effect. The cost is several tens of seconds of service interruption and full plugin reinitialization.

**Recommended strategy:**

- **Modifying model config or bot core parameters → save via WebUI config interface**, which internally auto-hot-reloads the corresponding scope without restarting
- **Modifying advanced config in YAML / TOML not exposed in WebUI → perform a restart**, because hot-reload paths may not cover those fields
- **Unsure if config is safe for hot-reload → restart**, to avoid runtime state inconsistencies

Once the `reload-config` endpoint is completed, it will serve as the unified entry point for "notify the process to reload after manual file edits." The recommended flow would then be: manual edit → call `reload-config` → confirm via `/status` or logs.

## Automated Ops Script Snippet

Below is a Bash script snippet example: login, health check, clean statistics cache older than 30 days, run VACUUM — three steps. Depends on `curl` and `jq`.

::: code-group

```bash [Bash Ops Script ~vscode-icons:file-type-shell~]
#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:8001/api/webui"
TOKEN="${MAIBOT_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "Please set environment variable MAIBOT_TOKEN"
  exit 1
fi

# 1. Login to get Cookie (write temp cookie jar)
COOKIE_JAR=$(mktemp)
trap 'rm -f "$COOKIE_JAR"' EXIT

curl -s -X POST "$BASE/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" \
  -c "$COOKIE_JAR" > /dev/null

# 2. Health check — system status
echo "=== System Status ==="
curl -s -X GET "$BASE/system/status" -b "$COOKIE_JAR" | jq .

# 3. Local cache overview
echo "=== Local Cache ==="
curl -s -X GET "$BASE/system/local-cache" -b "$COOKIE_JAR" | jq .

# 4. Clean statistics cache older than 30 days
echo "=== Clean Statistics Cache ==="
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

# 5. Standalone VACUUM (if previous step didn't include vacuum)
echo "=== VACUUM ==="
curl -s -X POST "$BASE/system/local-cache/database/vacuum" \
  -b "$COOKIE_JAR" | jq .

echo "=== Ops Complete ==="
```

:::

This script can serve as a base template for cron jobs. If you use systemd to manage MaiBot, the restart operation can be replaced with:

::: code-group

```bash [Bash systemctl Restart ~vscode-icons:file-type-shell~]
# After triggering restart via WebUI API, systemd's Restart=on-failure or RestartExitStatus=42 will auto-restart the process
curl -s -X POST "http://127.0.0.1:8001/api/webui/system/restart" \
  -b "$COOKIE_JAR"
```

:::

**systemd service configuration tip:**

Add `RestartExitStatus=42` in the `[Service]` section, combined with `Restart=on-failure` or `Restart=always`, to have systemd auto-restart MaiBot after receiving the WebUI restart command. The plugin runtime is gracefully stopped during restart, but this is not equivalent to a full graceful shutdown (MaiBot exits via `os._exit(42)`, skipping the normal Python cleanup flow).
