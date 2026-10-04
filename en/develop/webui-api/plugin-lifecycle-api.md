---
title: Plugin Lifecycle API
---

# Plugin Lifecycle API

This document covers the complete HTTP interface for plugin installation, updates, enable/disable toggling, config editing, runtime component queries, icon retrieval, statistics proxying, and progress tracking. It targets deployment ops personnel and scripted users. All endpoints are mounted under `/api/webui/plugins/` and require Cookie authentication (see [Authentication Model](./index.md#authentication-model-three-methods)).

If you need to debug plugin Host/Runner communication protocols, circuit breaker logic, or process lifecycles, see [Runtime Architecture](../plugin-runtime-internals.md). This page covers only API operations and does not go into runtime protocol details.

## 1. Installed Plugin Queries

Two endpoints return plugin lists and metadata:

- **`GET /api/webui/plugins/installed`** — Returns all installed plugins' manifest, enabled status, runtime load status, and circuit breaker info. Each plugin entry in the response contains fields such as `id`, `manifest`, `path`, `enabled`, `load_status`, `load_error`, `circuit_status`, `changelog`, and `release`.
- **`GET /api/webui/plugins/local-readme/{plugin_id}`** — Get the plugin's local README content (Markdown string).
- **`GET /api/webui/plugins/local-changelog/{plugin_id}`** — Get the plugin's local CHANGELOG content.

**`release`** — Present only for plugins installed from a release (`null` otherwise). It is the `.maibot-release.json` install record: `plugin_id`, `version`, `tag`, `commit`, `repository_url`, `pinned`. The frontend uses it to decide whether a plugin has a locked version and to block branch `git pull` updates.

**Query example:**

::: code-group

```bash [curl Query Installed Plugins ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/plugins/installed \
  -H "Cookie: maibot_session=你的Token"
```

:::

## 2. Install / Uninstall / Update

Three POST endpoints implement plugin lifecycle management. They are all async long-running tasks that push progress in real time via the [WebSocket progress channel](#_9-plugin-progress-websocket-progress-tracking).

Install, update, and uninstall on the same plugin are mutually exclusive. If that plugin already has a change operation in flight, the server immediately returns **HTTP 409 Conflict**, without queuing or overwriting the existing progress. The response `detail` explains the operation in progress; the client should retry after the current operation finishes. Operations on different plugins can still run in parallel.

### Install

**`POST /api/webui/plugins/install`** — Installs a plugin. Request body:

- **`plugin_id`** — Plugin ID (used for directory naming and manifest validation)
- **`repository_url`** — Repository URL (supports GitHub and custom Git URLs). **Leave empty for release installs**; it is resolved from the version index
- **`branch`** — Branch name, default `main`
- **`mirror_id`** — Optional Git mirror source ID for mirror acceleration
- **`version`** — Optional release version. Pass a concrete version to install that version; pass `latest` to install the index's recommended compatible stable version; omit it for a branch install
- **`pinned`** — Whether to lock the selected release version. Default `false`; a locked plugin refuses automatic updates

In branch-install mode, the server clones the repo in order, validates `_manifest.json` (checking five required fields: `manifest_version`, `id`, `name`, `version`, `author`), and upon success creates the plugin directory under `plugins/`.

When `version` is given, the release-install path runs: shallow-clone by tag into a temporary directory, verify the commit and manifest match the index, dependencies are satisfied, and the switch does not break other installed plugins' version constraints on this plugin, then stop the plugin → preserve `config.toml` / `config_back/` / `data/` → write `.maibot-release.json` → atomically replace the directory (the old one is renamed into `.update_backups/`) → reload.

**Install examples:**

::: code-group

```bash [curl Install Plugin ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/plugins/install \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=你的Token" \
  -d '{
    "plugin_id": "example-plugin",
    "repository_url": "https://github.com/somebody/example-plugin",
    "branch": "main"
  }'
```

```bash [curl Install a Specific Release and Lock It ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/plugins/install \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=你的Token" \
  -d '{
    "plugin_id": "example-plugin",
    "version": "1.4.2",
    "pinned": true
  }'
```

:::

**Errors possible on release installs:**

- **400 Plugin dependencies unsatisfied** — other plugins or Python packages required by that version are missing
- **400 No installable compatible stable version** — `latest` was passed but the index has no compatible stable version
- **400 Release version does not exist** — the version is not in the index
- **400 This plugin has no Release yet; only branch install is supported** — the index lists it in branch mode; install without `version`
- **404 Plugin not yet in the version index** — the repository is not indexed officially
- **409 Plugin already installed** / **409 Plugin target directory already exists** — the target location is not empty
- **409 This version does not satisfy the dependency requirement of installed plugin X** — switching versions would break another plugin's dependency constraint
- **409 The plugin has local code modifications; resolve them first** — the plugin directory carries local code changes
- **409 The tag's current commit does not match the version index** / **409 The downloaded manifest does not match the version index** — the index and repository are out of sync
- **502 Failed to fetch the plugin version index** — the official index could not be fetched; switch mirror source or retry later

### Uninstall

**`POST /api/webui/plugins/uninstall`** — Uninstall a specified plugin. Before the operation, the plugin is first disabled and the runtime is notified to unload it, then the entire plugin directory is deleted. Request body only needs `plugin_id`.

### Update

**`POST /api/webui/plugins/update`** — Update an installed plugin. The request body is the same as for install. The logic splits into three paths:

- **Release install** (`version` is a concrete version or `latest`) — the same stop / replace / reload chain as install; the response `update_mode` is `release` and additionally returns `commit`, `pinned`, and `backup_path`
- **Git repository** — Directly `git pull` the new version, preserving local `config.toml` and `config_back/` directory; `update_mode` is `git_pull`
- **Non-Git directory** — Re-clone and perform backup recovery; the `update_mode` field will be `reinstall_from_backup`

On successful update, the response includes `old_version` and `new_version` fields.

::: warning Release-installed plugins cannot be git pull-ed
If the plugin directory contains `.maibot-release.json`, an update without `version` returns **409** "This plugin was installed from a release; update it through version selection, branch pull is not supported". Pass `version` with the target version instead.
:::

**Additional constraints on release updates:**

- **409 This plugin has a locked version** — automatic update is refused when the plugin has `pinned = true`; unlock it on the detail page
- **409 Already on the newest compatible version; automatic update will not downgrade or reinstall** — with `version: "latest"` the target version is not newer than the current one; a downgrade must pass a concrete version number

## 3. Enable / Disable

**`POST /api/webui/plugins/config/{plugin_id}/toggle`** — Toggle a plugin's enabled status. No request body needed; the server reads the current `[plugin].enabled` value from `config.toml`, negates it, and writes back to disk. Configuration changes are auto-hot-reloaded to the corresponding plugin's runtime.

**Toggle example:**

::: code-group

```bash [curl Toggle Enabled Status ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/plugins/config/example-plugin/toggle \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=你的Token"
```

:::

The `enabled` field in the response reflects the new state after toggling; the `note` field reminds that "状态更改将自动热更新到对应插件".

## 4. Catalog Git Mirror Operations

Plugin marketplace and mirror source management endpoints, built around git_mirror_service.

- **`GET /api/webui/plugins/version`** — Return the current MaiBot version (`version`, `version_major`, `version_minor`, `version_patch`)
- **`GET /api/webui/plugins/git-status`** — Check whether Git is installed locally, returns `installed`, `version`, `path`
- **`GET /api/webui/plugins/mirrors`** — List all configured Git mirror sources (each mirror has `id`, `name`, `raw_prefix`, `clone_prefix`, `enabled`, `priority`)
- **`POST /api/webui/plugins/mirrors`** — Add a new mirror source
- **`PUT /api/webui/plugins/mirrors/{mirror_id}`** — Update specified mirror source parameters
- **`DELETE /api/webui/plugins/mirrors/{mirror_id}`** — Delete specified mirror source
- **`POST /api/webui/plugins/fetch-raw`** — Fetch a remote repo's raw file via mirror source (typically used to pull `plugin_details.json` from the plugin store)
- **`POST /api/webui/plugins/clone`** — Clone a specified repository to a target path via mirror source
- **`GET /api/webui/plugins/releases`** — Returns the official version index (`plugin_versions.json` from `Mai-with-u/plugin-repo`, cached for 60 seconds), which powers the version dropdown and compatibility hints in the frontend

### Version Index Structure

`GET /api/webui/plugins/releases` returns `{"plugins": [...]}`, where each entry describes one indexed plugin:

- **`id`** / **`manifest_id`** — the index ID and the plugin ID from the manifest; either can be matched on lookup (case-insensitive)
- **`repositoryUrl`** — the GitHub repository URL
- **`mode`** — `releases` (install by Git Release) or `branch` (branch install only)
- **`sync_error`** — why the index sync failed; when non-empty the plugin cannot be installed by version
- **`recommended_version`** — the newest stable version compatible with the current Host / SDK; `null` when none exists
- **`versions`** — the release list, sorted by version descending. Each item carries `version`, `tag`, `commit`, `prerelease`, `yanked`, `manifest`, `release_notes`, `published_at`, `release_url`, plus two derived fields:
  - **`compatible`** — whether it is compatible with the current Host / SDK (computed live with `ManifestValidator`; yanked versions are always `false`)
  - **`reasons`** — the list of incompatibility reasons; the frontend compresses them into short strings such as "Supports MaiBot ≤ x only"
- **`rejected_releases`** — releases rejected by the index sync tool (`tag`, `version`, `error`). Common causes: the Git Tag does not match the manifest `version`, the release changed the plugin ID, the manifest protocol version is unsupported, or no manifest can be read from that commit

Index errors return **502** (`Failed to fetch the plugin version index` / `Invalid plugin version index`). The install endpoints reuse the same index and `release_compatibility()` judgment, so what the frontend displays and what the backend actually allows stay consistent.

## 5. Plugin Config Editing

The plugin config routes provide three operations: structured, raw TOML, and reset.

### Query Config

- **`GET /api/webui/plugins/config/{plugin_id}/bundle`** — Return config page init data in one call: `schema` (config form Schema), `config` (current structured config), `raw_config` (raw TOML text)
- **`GET /api/webui/plugins/config/{plugin_id}/schema`** — Return only the config form Schema
- **`GET /api/webui/plugins/config/{plugin_id}`** — Return only the current config dict
- **`GET /api/webui/plugins/config/{plugin_id}/raw`** — Return the raw TOML text

Schema is preferentially obtained via runtime `inspect_plugin_config`; when the runtime is unavailable, a fallback Schema is automatically inferred from on-disk config.

**Query example:**

::: code-group

```bash [curl Get Config Bundle ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/plugins/config/example-plugin/bundle \
  -H "Cookie: maibot_session=你的Token"
```

:::

### Modify Config

- **`PUT /api/webui/plugins/config/{plugin_id}`** — Update structured config (JSON format). The server merges into the existing config, validates via runtime (if available), auto-backs up the original file, then writes `config.toml`. Supports dot-path flattened keys (e.g., `"plugin.enabled": true`).
- **`PUT /api/webui/plugins/config/{plugin_id}/raw`** — Update raw TOML text. Validates TOML syntax legality before writing, and backs up the original file.
- **`POST /api/webui/plugins/config/{plugin_id}/reset`** — Reset plugin config: moves the existing `config.toml` into a backup directory and deletes it, so the plugin reverts to default config.

All write operations auto-backup the original file (backup path includes a timestamp). The `note` in the response reminds that "配置更改将自动热更新到对应插件".

## 6. Runtime Component Queries

These endpoints query the plugin runtime for registered components, home cards, and Hook specs.

- **`GET /api/webui/plugins/runtime/plugins/{plugin_id}/components`** — Return the currently registered Commands and Tools component list for the specified plugin, each component containing `name`, `description`, `enabled`, `component_type`, and type-specific parameter/schema fields.
- **`GET /api/webui/plugins/runtime/home-cards`** — Return WebUI home cards for all enabled plugins. Card data is truncated and link-safe filtered (only allowing links starting with `http:`, `https:`, `mailto:`, `/`), sorted by `order`, `plugin_id`, `name`.
- **`GET /api/webui/plugins/runtime/hooks`** — Return the currently exposed Hook spec list from the runtime, each Hook containing `name`, `description`, `parameters_schema`, `default_timeout_ms`, `allow_blocking`, `allow_abort`, and other fields.

**Component query example:**

::: code-group

```bash [curl Query Plugin Components ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/plugins/runtime/plugins/example-plugin/components \
  -H "Cookie: maibot_session=你的Token"
```

:::

> **Distinction note** — The component queries in this section are read-only data pulls at the API level and do not involve Host/Runner inter-process communication protocols (such as RPC message serialization, fault circuit-breaker recovery, Runner lifecycle management, etc.). For those, see [Runtime Architecture](../plugin-runtime-internals.md).

## 7. Plugin Icon Retrieval

**`GET /api/webui/plugins/icon/{plugin_id}`** — Return the local icon file declared in the plugin's `_manifest.json`. The icon declaration format is `display.icon.type = "local"` with `display.icon.value` as a relative path within the plugin directory.

The server applies multiple checks on icons: only relative paths allowed (reject `..` traversal and absolute paths), extension restricted to `jpg/jpeg/png/svg/webp`, file size capped at 512 KB. The response header includes `Cache-Control: public, max-age=3600`, suitable for frontend caching.

## 8. stats_proxy Statistics Proxy

This module reverse-proxies to an external plugin statistics service (default address `http://hyybuth.xyz:10059`, overridable via the `MAIBOT_PLUGIN_STATS_BASE_URL` environment variable), providing likes, ratings, download counts, and other features for the WebUI frontend's plugin store. All endpoints uniformly time out at 8 seconds (overridable via `MAIBOT_PLUGIN_STATS_TIMEOUT`).

- **`GET /api/webui/plugins/stats-proxy/stats/summary`** — Plugin statistics overview
- **`GET /api/webui/plugins/stats-proxy/stats/{plugin_id}`** — Single plugin statistics
- **`GET /api/webui/plugins/stats-proxy/stats/user-state?plugin_id=...&user_id=...`** — Query a user's like/rating status for a plugin
- **`POST /api/webui/plugins/stats-proxy/stats/like`** — Like (request body `plugin_id` + `user_id`)
- **`POST /api/webui/plugins/stats-proxy/stats/dislike`** — Dislike
- **`POST /api/webui/plugins/stats-proxy/stats/rate`** — Rate + comment (request body `plugin_id` + `user_id` + optional `rating`/`comment`)
- **`POST /api/webui/plugins/stats-proxy/stats/download`** — Record plugin download

> **Note** — The stats_proxy endpoints do not use Cookie authentication; they use the `require_auth` dependency (`Depends(require_auth)`) for backend-side authorization. Returns HTTP 502 when the external statistics service is unavailable.

## 9. plugin-progress WebSocket Progress Tracking

::: warning This is not HTTP
plugin-progress is a **WebSocket** endpoint, not an HTTP request. You cannot call it with `curl` — you need to connect via a WebSocket client.
:::

### Recommended: Unified WebSocket Channel

All plugin progress events are pushed through the [Unified WebSocket Channel](./realtime-and-stats), with `domain` as `plugin_progress` and `topic` as `main`. This is the path the frontend WebUI actually uses; there's no need for a separate plugin-specific WebSocket connection.

Authentication is done via [WebSocket Temporary Token](./index.md#_3-websocket-temporary-token). Place the temporary Token in the URL query parameter `?token=...` to establish the connection. After receiving pushes, each frame follows this format:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{"topic":"plugin_progress:main","event":"update","data":{"progress":{...}}}
```

:::

The `progress` object contains current operation info:

- **`operation`** — Operation type: `install` / `uninstall` / `update` / `fetch` / `idle`
- **`stage`** — Current stage: `loading` / `success` / `error` / `idle`
- **`progress`** — Progress percentage (0-100)
- **`message`** — Progress description text
- **`plugin_id`** — Currently processing plugin ID
- **`error`** — Error details (only present when `stage=error`)
- **`total_plugins`** / **`loaded_plugins`** — Counters for batch operations
- **`mirror_id`** / **`mirror_name`** / **`mirror_index`** / **`total_mirrors`** — Mirror info during multi-mirror retries
- **`attempt`** / **`max_attempts`** — Retry count within a single mirror

### Legacy Direct Endpoint

**`WS /api/webui/plugins/ws/plugin-progress`** — Legacy plugin progress WebSocket (direct connection, bypassing the unified channel). Supports authentication via URL query `?token=...` or the Cookie `maibot_session`. Upon connection establishment, immediately sends the current progress snapshot, then continuously pushes incremental updates. Supports `ping`/`pong` heartbeat to keep the connection alive.

> New integrations should use the unified WebSocket channel; the legacy endpoint is retained for compatibility with existing frontends.

## 10. Relationship with Runtime Architecture

Everything covered in this page is at the HTTP / WebSocket API operation level. When you need to understand the runtime mechanisms behind these operations (such as how a plugin gets loaded by the Host after `POST /install`, how the Runner subprocess spawns, or how config hot-refreshes after `PUT /config`), go to **[Runtime Architecture](../plugin-runtime-internals.md)**. That document specifically covers:

- Host / Runner dual-process model and spawn conventions
- `_manifest.json` parsing flow in the runtime
- Runner subprocess lifecycle management and fault recovery
- Config hot-reload and runtime validation implementation chain
- Component registration, Hook dispatch, and circuit breaker mechanism

This page's role is "what happens when you fire a curl"; runtime-internals' role is "how the plugin process actually runs inside." The two are complementary and there's no need to expand on internals here.
