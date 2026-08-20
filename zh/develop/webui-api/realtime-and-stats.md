---
title: 实时订阅与统计
---

# 实时订阅与统计

本篇覆盖 MaiBot WebUI 的实时推送通道和运维统计查询，是子目录的最后一篇。如果你刚打开[入口页](./index)，建议先读完路由结构再去[认证与首次配置](./auth-and-setup)完成登录。

文中所有端点都挂在 `/api/webui` 前缀下。

## 统一 WebSocket 通道

MaiBot 提供了一个统一的 WebSocket 端点，前端只需维持一条连接即可订阅日志、插件进度、MaiSaka 监控和聊天事件等多种推送流。

**端点：**

**`GET /api/webui/ws`** — 统一 WebSocket 入口

**连接方式：**

WebSocket 连接通过一个可选的握手 Token 认证。连接时，服务端按以下顺序尝试认证：

1. 如果 URL 携带 `?token=` 查询参数，优先用[临时 WebSocket Token](#临时-websocket-token-申请)做一次性验证
2. 如果请求中带有 `maibot_session` Cookie，走 Cookie Token 认证
3. 两者都没有或都失败时，服务端关闭连接并返回 code `4001`

认证通过后，服务端推送一条 `system.ready` 事件，包含 `connection_id` 和 `timestamp`。

**通信协议：**

客户端和服务端之间交换 JSON 对象。每条客户端消息必须包含一个 `op` 字段来指示操作类型。服务端响应分为两类：带 `id` 的 request/response 对（客户端发起 `op` 时提供 `id`），以及主动推送的 event（无 `id`）。

**支持的操作（`op`）：**

**`ping`** — 心跳探测，服务端回复 pong 并携带服务端时间戳

**`subscribe`** — 订阅某个域的主题推送。需提供 `domain` 和 `topic` 字段。支持的订阅目标：

**`domain: "logs", topic: "main"`** — 日志流。订阅后服务端立即推送一条 `logs/snapshot` 事件回放最近 N 条日志（可通过 `data.replay` 参数控制条数，范围 0-500，默认 100）

**`domain: "plugin_progress", topic: "main"`** — 插件进度。订阅后服务端立即推送一条 `plugin_progress/snapshot` 事件回放当前所有插件的进度状态

**`domain: "maisaka_monitor", topic: "main"`** — MaiSaka 推理监控。订阅后服务端回放监控事件历史，可通过 `data.since_event_id` 和 `data.replay_limit`（范围 1-10000，默认 1000）控制回放范围。回放完成后还会推送一条 `maisaka_monitor/stage.snapshot` 事件展示各阶段当前状态

**`unsubscribe`** — 退订某个域的主题。需提供 `domain` 和 `topic` 字段

**`call`** — 调用某个域的方法。目前仅支持 `domain: "chat"`，方法包括：

**`method: "session.open"`** — 打开一个逻辑聊天会话。需提供 `session`（前端会话 ID），可选参数包括 `user_id`、`user_name`、`platform`、`person_id`、`group_name`、`group_id`、`client`（客户端类型信息）和 `restore`（是否恢复已有会话）。成功后所有该会话的聊天事件将通过 `domain: "chat"` 的相关 event 推送

**`method: "session.close"`** — 关闭一个聊天会话。需提供 `session`

**`method: "message.send"`** — 发送聊天消息。需提供 `session` 和 `data.content`（文本内容），可选 `data.images`、`data.emojis`、`data.files`、`data.voices`

**`method: "session.update_nickname"`** — 更新当前聊天会话的用户昵称。需提供 `session` 和 `data.user_name`

## 临时 WebSocket Token 申请

浏览器端 WebSocket 连接无法携带 Cookie。MaiBot 提供了一个临时 Token 端点，作为 Cookie 认证到 WebSocket 握手的桥梁。

**端点：**

**`GET /api/webui/ws-token`** — 获取一次性 WebSocket 握手 Token（需 Cookie 认证）

**工作流程：**

1. 浏览器通过 Cookie 调 `GET /api/webui/ws-token`
2. 服务端验证 Cookie 有效后生成一个 `secrets.token_urlsafe(32)` 随机串
3. 临时 Token 有效期 60 秒，且只能使用一次（消费后立即删除）
4. 验证临时 Token 时，服务端同时校验关联的原始 session Token 是否仍有效

详细的安全特性（一次性消费、60 秒超时、session 联带校验）见 [认证与首次配置](./auth-and-setup#临时-websocket-token)。

**响应体：**

**`success`** — 是否获取成功（`true` / `false`）
**`token`** — 临时 WS Token（成功时存在）
**`expires_in`** — 有效秒数（固定 60）
**`message`** — 错误说明（失败时存在）

::: code-group

```http [curl 获取 WS Token ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/ws-token \
  -H "Cookie: maibot_session=你的Token"
```

:::

成功后立即用返回的 `token` 连接 WebSocket：`ws://127.0.0.1:8001/api/webui/ws?token=<临时Token>`。Token 用后即删，如果连接断线需要重新调 `/ws-token` 获取。

## 统计查询

三个端点覆盖从运维大盘到模型细分的统计查询，均需 Cookie 认证。默认统计窗口为最近 24 小时，可通过 `hours` 查询参数调整。

### Dashboard（运维大盘）

**`GET /api/webui/statistics/dashboard?hours=24`**

返回综合仪表盘数据，返回结构为 `DashboardData` 模型。`hours` 参数控制统计时间窗口，传 0 表示不限制时间范围。

::: code-group

```http [curl Dashboard ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/statistics/dashboard?hours=24" \
  -H "Cookie: maibot_session=你的Token"
```

:::

### Summary（统计摘要）

**`GET /api/webui/statistics/summary?hours=24`**

返回指定时间窗口内的统计摘要，不绑定具体数据模型，内容由底层 `get_summary_statistics` 服务动态生成。适合嵌入在自定义监控面板中。

::: code-group

```http [curl Summary ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/statistics/summary?hours=24" \
  -H "Cookie: maibot_session=你的Token"
```

:::

### Models（模型统计）

**`GET /api/webui/statistics/models?hours=24`**

返回按模型维度聚合的调用统计（各模型的调用次数、Token 消耗等），适合跟踪不同模型的用量和成本。

::: code-group

```http [curl Models ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/statistics/models?hours=24" \
  -H "Cookie: maibot_session=你的Token"
```

:::

## 推理过程日志浏览与 Replay

MaiBot 将每次推理过程（prompt 构建、LLM 调用、工具执行）记录在 `logs/maisaka_prompt/` 目录下，按推理阶段（stage）和会话（session）组织。这些端点提供浏览、筛选和重放能力。

所有推理过程端点均需 Cookie 认证，挂在 `/api/webui/reasoning-process` 前缀下。

**端点一览：**

**`GET /api/webui/reasoning-process/stages`** — 列出所有推理阶段（如 `planner`、`replyer`、`jargon_learning_update`），含每个阶段的会话数和最近修改时间

**`GET /api/webui/reasoning-process/files`** — 分页列出推理过程日志文件。关键查询参数：
**`stage`** — 推理阶段名，默认 `planner`
**`session`** — 会话名，`auto` 选最近活跃的会话，`__all_group_chats__` 查看所有群聊日志
**`page`** — 页码（从 1 开始，默认 1）
**`page_size`** — 每页条数（10-200，默认 50）
**`search`** — 模糊搜索（匹配阶段、会话、输出摘要、模型名等）
**`action`** — 按动作名过滤（仅对 planner 和黑话学习阶段有效）

返回体包含 `items`（日志条目列表）、`total`、`stages`、`stage_infos`、`sessions`、`session_infos` 等字段。每个条目包含 `stage`、`session_id`、`stem`（文件名主干）、`output_preview`（replyer 阶段）、`action_preview`（planner 阶段）、`model_name`、`duration_ms` 以及（1.2.0 起）`prompt_tokens`、`completion_tokens`、`total_tokens` 等 Token 用量统计。

**`GET /api/webui/reasoning-process/file?path=<相对路径>`** — 读取单条推理日志的完整文本内容（txt 或 json）。返回 `content`、`size`、`modified_at`、`model_name`、`duration_ms`、`prompt_tokens`、`completion_tokens`、`total_tokens`（1.2.0 起）以及消息发送者的头像映射 `message_avatars`

**`GET /api/webui/reasoning-process/html?path=<相对路径>`** — 以 HTML 形式预览推理日志。返回 `text/html` 文件流，适合在浏览器中直接渲染 prompt 的结构化预览

**`POST /api/webui/reasoning-process/replay`** — 用可编辑的消息列表重放一次推理请求。请求体：
**`model_name`** — 重放使用的模型名（必填）
**`messages`** — 消息列表（必填，至少一条）
**`source_path`** — 原始 prompt JSON 路径（可选，用于自动提取 tool_definitions）
**`tool_definitions`** — 工具定义（可选，未提供且 source_path 可用时自动补全）
**`temperature`** — 温度参数（可选，0-2）
**`max_tokens`** — 最大 Token 数（可选）
重放响应包含 `response`（模型输出文本）、`reasoning`（思维链）、`tool_calls`、`prompt_tokens` 等完整的 Token 用量统计。

**`DELETE /api/webui/reasoning-process/stages/{stage}`** — 清空指定推理阶段的所有日志文件

::: code-group

```http [curl 查询 Stage 概览 ~vscode-icons:file-type-http~]
curl -X GET http://127.0.0.1:8001/api/webui/reasoning-process/stages \
  -H "Cookie: maibot_session=你的Token"
```

```http [curl 分页浏览 Planner 日志 ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/reasoning-process/files?stage=planner&page=1&page_size=20" \
  -H "Cookie: maibot_session=你的Token"
```

```http [curl 读取单条日志 ~vscode-icons:file-type-http~]
curl -X GET "http://127.0.0.1:8001/api/webui/reasoning-process/file?path=planner/session_name/file_stem.json" \
  -H "Cookie: maibot_session=你的Token"
```

```http [curl 重放推理请求 ~vscode-icons:file-type-http~]
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

## Python WebSocket Client 示例

以下脚本演示完整的 WebSocket 实时日志订阅流程：先用 Cookie 调 `/ws-token` 获取临时 Token，再用它建立 WebSocket 连接，订阅日志域，持续打印收到的实时日志事件。

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
        # Step 1: 获取临时 WebSocket Token
        async with session.get(f"{API_BASE}/ws-token") as resp:
            data = await resp.json()
            if not data.get("success"):
                raise RuntimeError(f"获取 WS Token 失败: {data.get('message')}")
            ws_token = data["token"]
            print(f"临时 Token 已获取 (有效期 {data['expires_in']}s)")

        # Step 2: 建立 WebSocket 连接
        async with session.ws_connect(f"{WS_URL}?token={ws_token}") as ws:
            # 接收 system.ready 事件
            ready = await ws.receive_json()
            print(f"连接成功: {ready}")

            # Step 3: 订阅日志流
            sub_msg = {
                "op": "subscribe",
                "domain": "logs",
                "topic": "main",
                "data": {"replay": 50},
            }
            await ws.send_json(sub_msg)
            print("已订阅日志流")

            # Step 4: 持续接收实时日志事件
            while True:
                msg = await ws.receive_json()
                if msg.get("type") == "event":
                    domain = msg.get("domain")
                    event = msg.get("event")
                    if domain == "logs":
                        log_entries = msg.get("data", {}).get("entries", [])
                        if event == "snapshot":
                            print(f"[快照] 回放最近 {len(log_entries)} 条日志")
                        else:
                            for entry in log_entries:
                                print(f"[日志] {entry}")
                    elif domain == "plugin_progress":
                        print(f"[进度] {msg.get('data')}")
                elif msg.get("type") == "response":
                    ok = msg.get("ok")
                    req_id = msg.get("id")
                    print(f"[响应] id={req_id} ok={ok}")


asyncio.run(main())
```

:::

这个脚本依赖 `aiohttp`。运行前先完成登录拿到 Cookie（参见 [认证与首次配置](./auth-and-setup)），替换脚本中的 `COOKIE` 值即可使用。

## 接下来

至此，WebUI HTTP API 子目录已全部覆盖。从入口页的骨架到六篇场景文档，你应该已经对认证、配置、系统控制、插件管理、数据操作和实时通道有了完整的认识。

如果有具体需求：
- 起手调试 API → 回 **[WebUI HTTP API 入口](./index)** 走快速测连
- 写脚本对接 → **[认证与首次配置](./auth-and-setup)** 先搞定登录，再按场景跳转
- 查个别端点 → 直接用浏览器搜索功能在当前子目录搜索端点路径
