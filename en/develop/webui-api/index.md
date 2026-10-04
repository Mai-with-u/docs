---
title: WebUI HTTP API Entry
---

# WebUI HTTP API Entry

This subdirectory covers the HTTP / WebSocket APIs exposed by the MaiBot WebUI backend, targeting deployment ops personnel and users who need scripted management. If you only use the WebUI panel through a browser, you don't need to read this content.

Before proceeding, start with this page. It explains the skeleton of the entire API: how the server runs, how you authenticate, which route groups exist, and where to jump for specific scenarios.

## FastAPI Backend Overview

The WebUI backend is a FastAPI application that starts alongside the MaiBot main process. Default behavior:

- **Listening port** — `8001` (`WebUIConfig.port`)
- **Bind addresses** — `127.0.0.1` and `::1` (`WebUIConfig.host`)
- **Run mode** — `production` (`WebUIConfig.mode`), switch to `development` during development

::: warning Security Warning
By default, the server binds to loopback addresses and is only accessible locally. **Never set host to `0.0.0.0` and expose it directly on the public internet** — the WebUI does not include built-in TLS termination or WAF. If remote access is required, route traffic through a reverse proxy (Nginx / Caddy) and configure the proxy IP in `webui.trusted_proxies`.
:::

Key configuration options at a glance:

- **`webui.enabled`** — `true` to start WebUI, `false` to fully disable
- **`webui.host`** — List of listening addresses, can bind both IPv4 and IPv6 simultaneously
- **`webui.port`** — Listening port, default `8001`
- **`webui.allowed_ips`** — IP whitelist, comma-separated
- **`webui.secure_cookie`** — Whether to only send the login Cookie over HTTPS
- **`webui.anti_crawler_mode`** — Anti-crawler level, default `basic`
- **`webui.trusted_proxies`** — Reverse proxy IP list
- **`webui.trust_xff`** — Whether to trust the `X-Forwarded-For` header

These fields are defined in the `WebUIConfig` class in `src/config/official_configs.py`. All can be read/written via the [WebUI configuration interface](/en/manual/webui/) or the [`/api/config/raw`](#compat-routers) endpoint.

## Authentication Model: Three Methods

The vast majority of WebUI API endpoints require authentication. MaiBot provides three authentication methods, covering browser, scripting tools, and WebSocket scenarios.

### 1. Cookie Token (Primary Browser Mode)

This is the default authentication path for the WebUI frontend. Flow:

1. Obtain the temporary Token from MaiBot's startup log (auto-generated on first startup, printed in the terminal)
2. Call `POST /api/webui/auth/verify` with this Token
3. After server-side validation passes, an HttpOnly Cookie (`maibot_session`) is set in the `Set-Cookie` header, valid for 7 days
4. Subsequent requests automatically carry this Cookie — no need to pass the Token each time

**`/auth/verify` request example:**

::: code-group

```bash [curl Verify Token ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "你的临时或固定Token"}'
```
:::

**Related endpoints:**

- **`POST /api/webui/auth/verify`** — Verify Token and set Cookie (rate-limited: 5 attempts / 5 minutes, trigger results in 10-minute ban)
- **`GET /api/webui/auth/check`** — Check whether the current Cookie is still valid
- **`POST /api/webui/auth/logout`** — Clear Cookie, log out
- **`POST /api/webui/auth/update`** — Replace with a custom Token (requires login)
- **`POST /api/webui/auth/regenerate`** — Have the system regenerate a random Token (requires login)

**`/auth/check` query example:**

::: code-group

```bash [curl Check Auth Status ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/auth/check \
  -H "Cookie: maibot_session=你的Token"
```
:::

### 2. api_server_allowed_api_keys (Script / External Calls)

When calling the WebUI API from scripts, CI pipelines, or other external services, you can use the `api_server_allowed_api_keys` whitelist from the MaimMessage configuration. These API Keys are validated at MaiBot's message server and are suited for automation scenarios not tied to browser Cookies.

When calling via API Key, populate the `maibot_session` Cookie with the Key value to bypass the WebUI's own Token verification (provided the Key is in the message service whitelist and maps to a valid token).

### 3. WebSocket Temporary Token

Browser-side WebSocket connections cannot carry custom HTTP Headers and cannot reliably carry Cookies. MaiBot provides a temporary Token mechanism for this:

1. The frontend first authenticates via Cookie, then calls `GET /api/webui/ws-token`
2. The server generates a one-time temporary Token, valid for **60 seconds**, consumed on use
3. The frontend uses this temporary Token as the `?token=` query parameter in the WebSocket URL to complete the handshake

::: code-group

```bash [curl Get WS Token ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/ws-token \
  -H "Cookie: maibot_session=你的Token"
```
:::

## Route Structure and Base Path

The entire API is organized in two layers: the main routes are mounted under `/api/webui`, and three compat routes are registered independently.

### Main Routes: `/api/webui/*`

The core is the `APIRouter(prefix="/api/webui")` created in `src/webui/routes.py`. It aggregates the following sub-route modules (all mounted under `/api/webui/`):

- **`/health`** — Health check (no auth required)
- **`/auth/*`** — Authentication
- **`/setup/*`** — First-time setup wizard
- **`/config/*`** — Runtime config read/write (TOML format)
- **`/person/*`** — Person info management
- **`/model/*`** — Model list and connectivity verification
- **`/plugin/*`** — Plugin lifecycle management
- **`/system/*`** — System control and data migration
- **`/memory/*`** — Long-term memory graph
- **`/emoji/*`** — Emoji/sticker management
- **`/expression/*`**, **`/jargon/*`**, **`/behavior/*`** — Expression styles, slang, behaviors
- **`/statistics/*`** — Statistics
- **`/avatar/*`** — Avatars
- **`/ws-token`** — WebSocket temporary Token
- WebSocket endpoints (`unified` unified channel, `logs` log stream, `plugin/progress` plugin progress)

### Compat Routers

For compatibility with older frontends and some external integrations, the following three routes bypass the `/api/webui` prefix and are registered independently:

**`/api/config/*`** (module `src/webui/routers/config.py`) — Structured read/write of TOML configuration. Paths include `/api/config/schema` (get config form schema), `/api/config/raw` (read/write complete TOML content).

**`/api/*`** (module `src/webui/routers/memory.py`) — Full REST interface for the Amemorix memory graph. Paths include `/api/graph` (knowledge graph query), `/api/episodes` (memory episodes), `/api/import` (data import), `/api/retrieval_tuning` (retrieval tuning).

**`/api/chat/*`** (module `src/webui/routers/chat/`) — Local chat room. The "chat directly with MaiMai" feature in the WebUI is implemented through these endpoints.

**When to use:** If you're writing automation scripts, prefer the `/api/webui/*` main routes (consistent paths, uniform auth). Use the compat routes only when existing scripts depend on old paths, or when doing large-scale data operations on the memory graph.

## Quick Connectivity Test

The simplest health check requires no authentication — a single curl confirms whether the backend is running:

::: code-group

```bash [curl Health Check ~vscode-icons:file-type-http~]
curl http://127.0.0.1:8001/api/webui/health
```
:::

Expected response:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{"status": "healthy", "service": "MaiBot WebUI"}
```

:::

## First Run Setup Flow

On first startup, the `TokenManager` generates a temporary Token and prints it in the terminal log. When the WebUI frontend detects `token_source` is `temporary`, it enters the first-time setup wizard.

There are only two key endpoints:

1. **`GET /api/webui/setup/status`** (auth required) — Check whether in first-setup state
2. **`POST /api/webui/setup/complete`** (auth required) — Mark setup as complete

Full flow:

1. Call `/auth/verify` with the temporary Token to get a Cookie
2. Call `/setup/status` to confirm `is_first_setup: true`
3. Complete basic setup in the WebUI (model, persona, etc.)
4. Call `POST /auth/update` to replace with a permanent custom Token
5. Call `POST /setup/complete` to mark as done

Additionally, `POST /api/webui/setup/reset` clears the config state and rebuilds the wizard flow. Typically used during migration or reset.

## Roadmap

Jump to the corresponding sub-page based on what you need:

- **[This page] WebUI HTTP API Entry** — API skeleton, auth, route structure, health check, first-time setup
- **[Auth & Configuration](./auth-and-setup)** — Full Token replacement/regeneration/logout flow, First Run Setup automation scripts
- **[System Control](./system-control)** — Ops endpoints: restart, shutdown, log viewing, runtime status queries
- **[Plugin Lifecycle API](./plugin-lifecycle-api)** — HTTP interface for installing, uninstalling, enabling, disabling plugins
- **[Data and Memory API](./data-and-memory-api)** — Amemorix memory graph CRUD, data import/export, retrieval tuning
- **[Realtime and Stats](./realtime-and-stats)** — WebSocket (unified channel, log stream, plugin progress) and statistics queries

## Next Steps

If you're writing a script to interface with the WebUI API, follow this order:

1. Start with `/health` to ensure the backend is online
2. Go through `/auth/verify` to log in and get a Cookie
3. Consult the roadmap to find the scenario page you need, then write logic following its endpoint examples

All endpoints (except `/health`) require authentication. Cookies are valid for 7 days — long-running scripts should handle re-login after Cookie expiry.
