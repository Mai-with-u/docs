---
title: Realtime Subscriptions & Statistics
---

# Realtime Subscriptions & Statistics

This page covers the real-time push channels and ops statistics queries of the MaiBot WebUI, and is the final page of this subdirectory. If you've just opened the [entry page](./index), it's recommended to read the route structure first, then complete login via [Auth and First Setup](./auth-and-setup).

All endpoints in this document are mounted under the `/api/webui` prefix.

## Unified WebSocket Channel

MaiBot provides a unified WebSocket endpoint — the frontend only needs to maintain one connection to subscribe to multiple push streams: logs, plugin progress, MaiSaka monitoring, and chat events.

**Endpoint:**

**`GET /api/webui/ws`** — Unified WebSocket entry point

**Connection method:**

WebSocket connections authenticate via an optional handshake Token. When connecting, the server attempts authentication in the following order:

1. If the URL carries a `?token=` query parameter, use [temporary WebSocket Token](#temporary-websocket-token-request) for one-time verification first
2. If the request carries a `maibot_session` Cookie, use Cookie Token authentication
3. If neither is present or both fail, the server closes the connection with code `4001`

After authentication passes, the server pushes a `system.ready` event containing `connection_id` and `timestamp`.

**Communication protocol:**

JSON objects are exchanged between client and server. Each client message must include an `op` field to indicate the operation type. Server responses are divided into two categories: paired request/response with `id` (client provides `id` when initiating `op`), and actively pushed events (without `id`).

**Supported operations (`op`):**

**`ping`** — Heartbeat probe; server replies with pong carrying the server timestamp

**`subscribe`** — Subscribe to topic pushes for a domain. Requires `domain` and `topic` fields. Supported subscription targets:

**`domain: "logs", topic: "main"`** — Log stream. After subscribing, the server immediately pushes a `logs/snapshot` event replaying the most recent N log entries (controllable via `data.replay` parameter, range 0-500, default 100)

**`domain: "plugin_progress", topic: "main"`** — Plugin progress. After subscribing, the server immediately pushes a `plugin_progress/snapshot` event replaying the current progress state of all plugins

**`domain: "maisaka_monitor", topic: "main"`** — MaiSaka inference monitoring. After subscribing, the server replays monitor event history, controllable via `data.since_event_id` and `data.replay_limit` (range 1-10000, default 1000). After replay completes, a `maisaka_monitor/stage.snapshot` event is also pushed showing the current state of each stage

**`unsubscribe`** — Unsubscribe from a domain's topic. Requires `domain` and `topic` fields

**`call`** — Call a method for a domain. Currently only `domain: "chat"` is supported, with methods including:

**`method: "session.open"`** — Open a logical chat session. Requires `session` (frontend session ID), with optional parameters `user_id`, `user_name`, `platform`, `person_id`, `group_name`, `group_id`, `client` (client type info), and `restore` (whether to restore an existing session). On success, all chat events for that session will be pushed via `domain: "chat"` related events

**`method: "session.close"`** — Close a chat session. Requires `session`

**`method: "message.send"`** — Send a chat message. Requires `session` and `data.content` (text content), optional `data.images`, `data.emojis`, `data.files`, `data.voices`

**`method: "session.update_nickname"`** — Update the user nickname for the current chat session. Requires `session` and `data.user_name`

## Temporary WebSocket Token Request

Browser-side WebSocket connections cannot carry Cookies. MaiBot provides a temporary Token endpoint, serving as a bridge from Cookie authentication to WebSocket handshake.

**Endpoint:**

**`GET /api/webui/ws-token`** — Get a one-time WebSocket handshake Token (requires Cookie auth)

**Workflow:**

1. The browser calls `GET /api/webui/ws-token` with the Cookie
2. After verifying the Cookie is valid, the server generates a `secrets.token_urlsafe(32)` random string
3. The temporary Token is valid for 60 seconds and can only be used once (deleted immediately after consumption)
4. When verifying the temporary Token, the server simultaneously checks that the associated original session Token is still valid

For detailed security features (one-time consumption, 60-second timeout, session-linked validation), see [Auth and First Setup](./auth-and-setup#temporary-websocket-token).

**Response body:**

**`success`** — Whether retrieval succeeded (`true` / `false`)
**`token`** — Temporary WS Token (present on success)
**`expires_in`** — Valid seconds (fixed at 60)
**`message`** — Error description (present on failure)

::: code-group

```http [curl Get WS Token ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/ws-token \
  -H "Cookie: maibot_session=你的Token"
```

:::

After success, immediately use the returned `token` to connect via WebSocket: `ws://127.0.0.1:8001/api/webui/ws?token=<临时Token>`. The Token is consumed on use; if the connection drops, call `/ws-token` again to get a new one.

## Statistics Queries

Three endpoints cover everything from the ops dashboard to per-model breakdown statistics, all requiring Cookie auth. The default statistics window is the most recent 24 hours, adjustable via the `hours` query parameter.

### Dashboard

**`GET /api/webui/statistics/dashboard?hours=24`**

Returns comprehensive dashboard data; the return structure follows the `DashboardData` model. The `hours` parameter controls the statistics time window; passing 0 means no time range limit.

::: code-group

```http [curl Dashboard ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/statistics/dashboard?hours=24" \
  -H "Cookie: maibot_session=你的Token"
```

:::

### Summary

**`GET /api/webui/statistics/summary?hours=24`**

Returns a statistics summary for the specified time window, not tied to a specific data model; the content is dynamically generated by the underlying `get_summary_statistics` service. Suitable for embedding in custom monitoring panels.

::: code-group

```http [curl Summary ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/statistics/summary?hours=24" \
  -H "Cookie: maibot_session=你的Token"
```

:::

### Models

**`GET /api/webui/statistics/models?hours=24`**

Returns per-model aggregated call statistics (call count per model, Token consumption, etc.), suitable for tracking usage and cost across different models.

::: code-group

```http [curl Models ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/statistics/models?hours=24" \
  -H "Cookie: maibot_session=你的Token"
```

:::

## Reasoning Process Log Browsing and Replay

MaiBot records each reasoning process (prompt construction, LLM invocation, tool execution) in the `logs/maisaka_prompt/` directory, organized by reasoning stage and session. These endpoints provide browsing, filtering, and replay capabilities.

All reasoning process endpoints require Cookie auth and are mounted under the `/api/webui/reasoning-process` prefix.

**Endpoint overview:**

**`GET /api/webui/reasoning-process/stages`** — List all reasoning stages (such as `planner`, `replyer`, `jargon_learning_update`), including each stage's session count and last modified time

**`GET /api/webui/reasoning-process/files`** — Paginated listing of reasoning process log files. Key query parameters:
**`stage`** — Reasoning stage name, default `planner`
**`session`** — Session name; `auto` picks the most recently active session, `__all_group_chats__` views all group chat logs
**`page`** — Page number (starting from 1, default 1)
**`page_size`** — Entries per page (10-200, default 50)
**`search`** — Fuzzy search (matches stage, session, output summary, model name, etc.)
**`action`** — Filter by action name (only effective for planner and jargon learning stages)

The response body includes `items` (log entry list), `total`, `stages`, `stage_infos`, `sessions`, `session_infos`, etc. Each entry contains `stage`, `session_id`, `stem` (filename stem), `output_preview` (replyer stage), `action_preview` (planner stage), `model_name`, `duration_ms`, and (since 1.2.0) token usage stats such as `prompt_tokens`, `completion_tokens`, `total_tokens`.

**`GET /api/webui/reasoning-process/file?path=<relative_path>`** — Read the complete text content of a single reasoning log (txt or json). Returns `content`, `size`, `modified_at`, `model_name`, `duration_ms`, `prompt_tokens`, `completion_tokens`, `total_tokens` (since 1.2.0), and the message sender avatar map `message_avatars`

**`GET /api/webui/reasoning-process/html?path=<relative_path>`** — Preview a reasoning log as HTML. Returns a `text/html` file stream, suitable for rendering a structured preview of the prompt directly in the browser

**`POST /api/webui/reasoning-process/replay`** — Replay a reasoning request with an editable message list. Request body:
**`model_name`** — Model name used for replay (required)
**`messages`** — Message list (required, at least one entry)
**`source_path`** — Original prompt JSON path (optional, used to auto-extract tool_definitions)
**`tool_definitions`** — Tool definitions (optional; auto-filled if not provided and source_path is available)
**`temperature`** — Temperature parameter (optional, 0-2)
**`max_tokens`** — Max tokens (optional)
The replay response includes `response` (model output text), `reasoning` (chain of thought), `tool_calls`, `prompt_tokens`, and complete Token usage statistics.

**`DELETE /api/webui/reasoning-process/stages/{stage}`** — Clear all log files for a specified reasoning stage

::: code-group

```http [curl Query Stage Overview ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/reasoning-process/stages \
  -H "Cookie: maibot_session=你的Token"
```

```http [curl Paginated Planner Log Browse ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/reasoning-process/files?stage=planner&page=1&page_size=20" \
  -H "Cookie: maibot_session=你的Token"
```

```http [curl Read Single Log ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/reasoning-process/file?path=planner/session_name/file_stem.json" \
  -H "Cookie: maibot_session=你的Token"
```

```http [curl Replay Reasoning Request ~vscode-icons:file-type-http~]
curl -X POST http://127.0.0.1:8001/api/webui/reasoning-process/replay \
  -H "Content-Type: application/json" \
  -H "Cookie: maibot_session=你的Token" \
  -d '{
    "model_name": "gpt-4o",
    "messages": [
      {"role": "system", "content": "你是一个助手"},
      {"role": "user", "content": "你好"}
    ]
  }'
```

:::

## Python WebSocket Client Example

The script below demonstrates the complete WebSocket real-time log subscription flow: use the Cookie to call `/ws-token` to get a temporary Token, then use that Token to establish a WebSocket connection, subscribe to the log domain, and continuously print received real-time log events.

::: code-group

```python [Python WS Client ~vscode-icons:file-type-python~]
import asyncio
import json

import aiohttp

API_BASE = "http://127.0.0.1:8001/api/webui"
WS_URL = "ws://127.0.0.1:8001/api/webui/ws"
COOKIE = {"maibot_session": "你的Token"}


async def main():
    async with aiohttp.ClientSession(cookies=COOKIE) as session:
        # Step 1: Get temporary WebSocket Token
        async with session.get(f"{API_BASE}/ws-token") as resp:
            data = await resp.json()
            if not data.get("success"):
                raise RuntimeError(f"Failed to get WS Token: {data.get('message')}")
            ws_token = data["token"]
            print(f"Temp Token obtained (valid for {data['expires_in']}s)")

        # Step 2: Establish WebSocket connection
        async with session.ws_connect(f"{WS_URL}?token={ws_token}") as ws:
            # Receive system.ready event
            ready = await ws.receive_json()
            print(f"Connected: {ready}")

            # Step 3: Subscribe to log stream
            sub_msg = {
                "op": "subscribe",
                "domain": "logs",
                "topic": "main",
                "data": {"replay": 50},
            }
            await ws.send_json(sub_msg)
            print("Subscribed to log stream")

            # Step 4: Continuously receive real-time log events
            while True:
                msg = await ws.receive_json()
                if msg.get("type") == "event":
                    domain = msg.get("domain")
                    event = msg.get("event")
                    if domain == "logs":
                        log_entries = msg.get("data", {}).get("entries", [])
                        if event == "snapshot":
                            print(f"[Snapshot] Replaying {len(log_entries)} log entries")
                        else:
                            for entry in log_entries:
                                print(f"[Log] {entry}")
                    elif domain == "plugin_progress":
                        print(f"[Progress] {msg.get('data')}")
                elif msg.get("type") == "response":
                    ok = msg.get("ok")
                    req_id = msg.get("id")
                    print(f"[Response] id={req_id} ok={ok}")


asyncio.run(main())
```

:::

This script depends on `aiohttp`. Before running, complete login to get a Cookie (see [Auth and First Setup](./auth-and-setup)), then replace the `COOKIE` value in the script.

## Next Steps

At this point, the entire WebUI HTTP API subdirectory has been covered. From the skeleton in the entry page through the six scenario documents, you should now have a complete understanding of authentication, configuration, system control, plugin management, data operations, and real-time channels.

If you have specific needs:
- Getting started debugging the API → go back to **[WebUI HTTP API Entry](./index)** for a quick connectivity test
- Writing script integrations → start with **[Auth and First Setup](./auth-and-setup)** to handle login, then jump by scenario
- Looking up individual endpoints → use your browser's search function directly within this subdirectory to search for endpoint paths
