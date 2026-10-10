---
title: API Reference
---

# API Reference

MaiBot plugins access 18 capability proxies through `self.ctx` (`PluginContext`). All capability calls are automatically forwarded to the Host over RPC, and the SDK unwraps the results for you; `ctx.paths` and `ctx.logger` are context helper objects injected by the Runner.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Capability proxies
self.ctx.send       # Send messages
self.ctx.db         # Database operations
self.ctx.llm        # LLM calls
self.ctx.config     # Configuration reading
self.ctx.message    # Historical messages
self.ctx.chat       # Chat streams
self.ctx.person     # User information
self.ctx.emoji      # Emoji management
self.ctx.frequency  # Talk frequency
self.ctx.component  # Plugin management
self.ctx.api        # Cross-plugin API
self.ctx.gateway    # Message gateway
self.ctx.tool       # Tool definitions
self.ctx.render     # HTML rendering
self.ctx.knowledge  # Knowledge base search
self.ctx.statistics # Local statistics
self.ctx.maisaka    # Maisaka context and proactive tasks
self.ctx.webui      # Claim WebUI upload tokens

# Context helper objects
self.ctx.paths      # Plugin persistence and runtime directories
self.ctx.logger     # Logger
```

:::

For `ctx.paths`, see the paths section below; `ctx.logger` provides a standard `logging.Logger` instance, see the logger section.

## send — Message Sending {#send}

::: code-group

```python [Python ~vscode-icons:file-type-python~]
send = self.ctx.send
```

:::

- `await send.text(text, stream_id, **kwargs)` — send a text message
- `await send.image(image_data, stream_id, **kwargs)` — send an image
- `await send.emoji(emoji_data, stream_id, **kwargs)` — send an emoji
- `await send.command(command, stream_id, **kwargs)` — send a command message
- `await send.forward(messages, stream_id, **kwargs)` — send a forwarded message
- `await send.hybrid(segments, stream_id, **kwargs)` — send a mixed text-and-image message
- `await send.custom(custom_type, data, stream_id, **kwargs)` — send a custom-type message

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Send text
await self.ctx.send.text("Hello", stream_id)

# Send an image (base64)
import base64
with open("image.png", "rb") as f:
    data = base64.b64encode(f.read()).decode()
await self.ctx.send.image(data, stream_id)

# Mixed text and image
await self.ctx.send.hybrid([
    {"type": "text", "content": "Take a look at this picture:"},
    {"type": "image", "content": image_base64},
], stream_id)
```

:::

Note: `send.custom()` carries both the `custom_type/data` and `message_type/content` field sets at once, for compatibility with Host implementations across versions. The plugin side only needs to keep passing `custom_type` and `data`.

**Return value**: by default all `send.*` methods return `bool`, indicating whether the message was sent successfully. When `return_details=True` is passed, they return a detailed result containing the final message ID confirmed by the platform, which is convenient for later references (such as recall):

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Returns bool by default
ok = await self.ctx.send.text("Hello", stream_id)

# return_details=True returns {"success": bool, "sent": bool, "message_id": str | None}
result = await self.ctx.send.text("Hello", stream_id, return_details=True)
if result["sent"] and result["message_id"]:
    platform_msg_id = result["message_id"]
```

:::

`return_details` works for all seven methods: `send.text`, `send.emoji`, `send.image`, `send.forward`, `send.hybrid`, `send.command`, and `send.custom`. `message_id` is the platform-side final message ID reported back by the adapter (`platform_message_id`); it is `None` when the send did not succeed or the platform did not report one back.

## db — Database Operations

::: code-group

```python [Python ~vscode-icons:file-type-python~]
db = self.ctx.db
```

:::

- `await db.query(model_name, query_type="get", data=None, filters=None, order_by=None, limit=None, single_result=False)` — generic database operation
- `await db.save(model_name, data, key_field="id", key_value=None)` — insert, or update by field
- `await db.get(model_name, filters=None, limit=None, order_by=None, single_result=False)` — fetch records by condition
- `await db.delete(model_name, filters)` — delete data
- `await db.count(model_name, filters)` — count

The return value of `db.count()` is always an `int`. Even when the Host-side RPC returns an object with a `count` field, the SDK unwraps it automatically.

Note: `model_name` here must be a model class name that exists in the Host-side `src.common.database.database_model`, such as `"ChatHistory"` or `"ActionRecord"`.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Query
results = await self.ctx.db.query(
    model_name="ChatHistory",
    query_type="get",
    filters={"session_id": "session-123"},
    order_by=["-start_timestamp"],
    limit=10,
)

# Fetch a single record
record = await self.ctx.db.get(
    model_name="ActionRecord",
    filters={"action_id": "a-1"},
    single_result=True,
)

# Insert
await self.ctx.db.save(
    model_name="ActionRecord",
    data={"action_id": "a-1", "session_id": "session-123", "action_name": "reply"},
)

# Update
updated = await self.ctx.db.query(
    model_name="ChatHistory",
    query_type="update",
    data={"summary": "updated"},
    filters={"session_id": "session-123"},
)

# Delete
await self.ctx.db.delete(
    model_name="ChatHistory",
    filters={"session_id": "session-123"},
)

# Count
count = await self.ctx.db.count("ChatHistory", {"session_id": "session-123"})
```

:::

## llm — LLM Calls

::: code-group

```python [Python ~vscode-icons:file-type-python~]
llm = self.ctx.llm
```

:::

- `await llm.generate(prompt, model="", temperature=None, max_tokens=None)` — text generation; `prompt` accepts a string or a message list
- `await llm.generate_with_tools(prompt, tools, model="", temperature=None, max_tokens=None)` — generation with tool calling
- `await llm.embed(text=..., texts=...)` — generate text embedding vectors
- `await llm.transcribe_audio(audio=..., audio_base64=...)` — call the Host's current `voice` task for ASR speech recognition; `audio` accepts audio bytes or a Base64/Data URL string
- `await llm.get_available_models()` — get the list of available models, returns `list[str]`

When `temperature` and `max_tokens` are omitted or passed as `None`, the values configured for the current model/task on the model management page are used; only explicitly passing concrete values overrides that configuration.

**generate return value**:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
{
    "success": True,
    "response": "generated text",
    "reasoning": "reasoning content (if any)",
    "model": "model name actually used",
    "model_name": "model name actually used"
}
```

:::

The SDK always fills in the `model` field; if the Host still returns the legacy field name `model_name`, the SDK handles it automatically.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Simple text generation
result = await self.ctx.llm.generate(
    prompt="Introduce Python in one sentence",
    temperature=0.5,
)
if result["success"]:
    text = result["response"]

# Use the message list format
result = await self.ctx.llm.generate(
    prompt=[
        {"role": "system", "content": "You are a translation assistant"},
        {"role": "user", "content": "Translate: Hello World"},
    ],
)

# With tool calling
result = await self.ctx.llm.generate_with_tools(
    prompt="What is the weather like today",
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Query the weather",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
            },
        },
    }],
)
tool_calls = result.get("tool_calls", [])

# Single text embedding
embedding = await self.ctx.llm.embed(text="Text to vectorize")

# Batch text embedding
embeddings = await self.ctx.llm.embed(
    texts=["First paragraph", "Second paragraph"],
    task_name="embedding",
    max_concurrent=4,
)

# ASR speech recognition
with open("voice.mp3", "rb") as audio_file:
    asr_result = await self.ctx.llm.transcribe_audio(audio_file.read())
if asr_result["success"]:
    text = asr_result["text"]

# Get the list of available models
models = await self.ctx.llm.get_available_models()
```

:::

## config — Configuration Reading

::: code-group

```python [Python ~vscode-icons:file-type-python~]
config = self.ctx.config
```

:::

- `await config.get(key, default=None)` — read a field from the **global Bot configuration** (`bot_config.toml`); `key` supports dot-separated paths
- `await config.get_plugin(plugin_name=None)` — get the configuration of the specified plugin; when `plugin_name` is omitted, the current plugin
- `await config.get_all()` — get **all configuration of the current plugin**

The structure and defaults of plugin configuration are defined by the plugin's `config_model`. The Runner stores the values of the current installation in the auto-generated `config.toml` under the plugin directory; `config.get_plugin()` and `config.get_all()` read that runtime configuration already loaded by the Runner, while `config.get()` reads the Host's global Bot configuration and has nothing to do with the plugin's own `config.toml`.

`config.get()`, `config.get_plugin()`, and `config.get_all()` all return the configuration value or configuration dictionary directly; you do not need to read the `value` field out of the RPC result manually.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Read a single field from the global Bot configuration
permission = await self.ctx.config.get("plugin.permission", [])

# Read a specific plugin's configuration (omit the argument for the current plugin)
config = await self.ctx.config.get_plugin("com.example.my-plugin")

# Read all configuration of the current plugin
all_config = await self.ctx.config.get_all()
```

:::

## message — Historical Messages

::: code-group

```python [Python ~vscode-icons:file-type-python~]
message = self.ctx.message
```

:::

- `await message.get_recent(chat_id, limit)` — get recent messages
- `await message.get_by_id(message_id, chat_id="", stream_id="")` — query a single message by message ID
- `await message.build_readable(messages, **kwargs)` — format a message list into a readable string
- `await message.get_by_time(start_time, end_time)` — query by time range (global)
- `await message.get_by_time_in_chat(chat_id, start_time, end_time)` — query a specific chat by time range
- `await message.count_new(chat_id, since)` — count new messages (`since` is a UNIX timestamp string)

`build_readable` supports two call styles:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Style 1: pass in an already-queried message list
msgs = await self.ctx.message.get_recent(chat_id, limit=20)
readable = await self.ctx.message.build_readable(msgs)

# Query by message ID
message_detail = await self.ctx.message.get_by_id(message_id, stream_id=chat_id)

# Style 2: pass chat_id + a time range as keyword arguments, and the Host performs the query
readable = await self.ctx.message.build_readable(
    messages=None,
    chat_id=chat_id,
    start_time=start_ts,
    end_time=end_ts,
)
```

:::

Optional keyword arguments: `replace_bot_name` (default `True`), `timestamp_mode` (default `"relative"`), `truncate` (default `False`).

`message.get_by_time()`, `message.get_by_time_in_chat()`, and `message.get_recent()` return the message list directly; `message.count_new()` returns the count directly; `message.build_readable()` returns the string directly.

## chat — Chat Streams

::: code-group

```python [Python ~vscode-icons:file-type-python~]
chat = self.ctx.chat
```

:::

- `await chat.get_all_streams(platform="qq")` — get all chat streams
- `await chat.get_group_streams(platform="qq")` — get all group chat streams
- `await chat.get_private_streams(platform="qq")` — get all private chat streams
- `await chat.get_stream_by_group_id(group_id, platform="qq")` — find a chat stream by group ID
- `await chat.get_stream_by_user_id(user_id, platform="qq")` — find a private chat stream by user ID
- `await chat.open_session(platform, chat_type, **kwargs)` — open or create a chat stream
- `await chat.get_avatar(platform, target_id, target_type="user", account_id="", scope="", force_refresh=False)` — query an avatar

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get all group chat streams
streams = await self.ctx.chat.get_group_streams()

# Get private chat streams
streams = await self.ctx.chat.get_private_streams()

# Get a chat stream by Group ID
stream = await self.ctx.chat.get_stream_by_group_id(group_id="123456")

# Get a chat stream by User ID
stream = await self.ctx.chat.get_stream_by_user_id(user_id="789012")

# Open or create a private chat stream
stream = await self.ctx.chat.open_session(
    platform="qq",
    chat_type="private",
    user_id="789012",
)

# Open or create a group chat stream
stream = await self.ctx.chat.open_session(
    platform="qq",
    chat_type="group",
    group_id="123456",
)
```

:::

`chat.open_session()` returns `stream_id`, `session_id`, `chat_type`, `created`, and the full `stream` object. In multi-account or multi-route deployments, pass `account_id` and `scope` as well to avoid opening the wrong chat stream.

`chat.get_avatar()` returns three keys — `status`, `url`, and `expires_at`: `expires_at` is a Unix timestamp, and when `status` is `available`, `url` is the avatar source address provided by the adapter that the platform currently routes to. The result contains **no image bytes and no Host file path**, so you can download it yourself or hand it to your frontend for display. This capability must be declared as `chat.get_avatar` in the manifest's `capabilities`.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Query a user avatar; target_type is "user" or "group"
avatar = await self.ctx.chat.get_avatar(platform="qq", target_id="1026294844")
if avatar["status"] == "available":
    url = avatar["url"]              # Avatar source address provided by the adapter
    expires_at = avatar["expires_at"]  # Unix timestamp
```

:::

## maisaka — Maisaka Proactive Tasks

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Ask Maisaka to proactively process one conversation turn for the specified chat stream
result = await self.ctx.maisaka.proactive.trigger(
    stream_id=stream["stream_id"],
    intent="Remind the user that there is a schedule item at 20:00 tonight",
    reason="calendar_reminder",
    metadata={"source": "calendar_plugin"},
)

# Append a plugin context message to the specified chat stream
await self.ctx.maisaka.context.append(
    stream_id=stream["stream_id"],
    segments=[{"type": "text", "content": "The user has just completed a plugin task"}],
    visible_text="The user has just completed a plugin task",
    source_kind="plugin:calendar",
)
```

:::

`maisaka.proactive.trigger()` writes `intent` into Maisaka's internal context and wakes the Planner, letting Maisaka decide on its own — based on personality, memory, current context, and available tools — whether to reply and how to phrase it. The target chat stream must already exist.

## person — User Information

::: code-group

```python [Python ~vscode-icons:file-type-python~]
person = self.ctx.person
```

:::

- `await person.get_id(platform, user_id)` — get the person_id
- `await person.get_value(person_id, field_name)` — get a user field value
- `await person.get_id_by_name(person_name)` — get the person_id by user name

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get person_id
pid = await self.ctx.person.get_id("qq", "12345")

# Get the nickname
name = await self.ctx.person.get_value(pid, "nickname") or "unknown"
```

:::

## emoji — Emoji Management

::: code-group

```python [Python ~vscode-icons:file-type-python~]
emoji = self.ctx.emoji
```

:::

- `await emoji.get_random(count)` — get random emojis
- `await emoji.get_by_description(description, limit)` — search by description
- `await emoji.get_count()` — get the total count
- `await emoji.get_info()` — get statistical information
- `await emoji.get_emotions()` — get the list of emotion tags
- `await emoji.get_all()` — get all emojis
- `await emoji.register_emoji(emoji_base64)` — register a new emoji
- `await emoji.delete_emoji(emoji_hash, keep_desc=None)` — delete an emoji; `keep_desc=True` keeps the description cache and only removes the file and registration state, `False` deletes the database record as well, and the default `None` lets the main program decide based on the current record

## frequency — Talk Frequency

::: code-group

```python [Python ~vscode-icons:file-type-python~]
frequency = self.ctx.frequency
```

:::

- `await frequency.get_current_talk_value(chat_id)` — get the current talk value
- `await frequency.set_adjust(chat_id, value)` — set the frequency adjustment value
- `await frequency.get_adjust(chat_id)` — get the frequency adjustment value

Both `get_*` methods return the value directly; `set_adjust()` returns a boolean indicating whether the setting succeeded.

## component — Plugin and Component Management

::: code-group

```python [Python ~vscode-icons:file-type-python~]
component = self.ctx.component
```

:::

- `await component.get_all_plugins()` — get information for all plugins (including the component lists registered by each plugin)
- `await component.get_plugin_info(plugin_name)` — get information for the specified plugin
- `await component.list_loaded_plugins()` — list loaded plugins
- `await component.list_registered_plugins()` — list registered plugins
- `await component.enable_component(name, component_type, scope="global", stream_id="")` — enable a component (`name` accepts the full `plugin_id.comp_name` or a short name)
- `await component.disable_component(name, component_type, scope="global", stream_id="")` — disable a component (`name` accepts the full `plugin_id.comp_name` or a short name)
- `await component.load_plugin(plugin_name)` — load a plugin (validates that the plugin exists and routes to the corresponding Supervisor)
- `await component.unload_plugin(plugin_name)` — unload a plugin
- `await component.reload_plugin(plugin_name)` — reload a plugin

`scope` supports `"global"` and `"stream"`; the `stream` level requires a `stream_id`.

> **Note**: the `name` parameter of `enable_component` / `disable_component` accepts either the full name `"my_plugin.my_command"` or just the short name `"my_command"` (the Host matches automatically by `component_type`). When a short name is used and components with the same name exist, the component with the specified `type` is matched first.
>
> `load_plugin()` / `reload_plugin()` returning `True` only means the new Runner has finished initializing and the switch succeeded; if warm-up fails and the Host rolls back to the old Runner, these two interfaces return `False`.

## api — Cross-plugin API

::: code-group

```python [Python ~vscode-icons:file-type-python~]
api = self.ctx.api
```

:::

- `await api.call(api_name, version="", **kwargs)` — call an API exposed by another plugin
- `await api.get(api_name, version="")` — get the metadata of a single visible API
- `await api.list(plugin_id="")` — list the APIs visible to the current plugin
- `await api.replace_dynamic_apis(apis, offline_reason="Dynamic API is offline")` — replace the dynamic APIs already exposed by the current plugin with a new set of dynamic APIs

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Call an API exposed by another plugin
result = await self.ctx.api.call("plugin_a.sum_numbers", a=1, b=2)

# Query visible APIs
apis = await self.ctx.api.list()
info = await self.ctx.api.get("plugin_a.sum_numbers", version="1")
```

:::

Notes:

- `api_name` accepts the full name `plugin_id.api_name` as well as a unique short name.
- `replace_dynamic_apis()` suits scenarios where the "API set changes dynamically", such as MCP servers and external capability marketplaces.
- After a dynamic API goes offline, the Host marks it as offline and returns `offline_reason` for subsequent calls.
- **WebUI custom pages also bind `@API`**, but only **this plugin's static APIs**; `version` must match the registered value exactly, `public=True` is not required, and dynamic APIs cannot be bound by pages. See [WebUI Pages](./webui-pages.md).

## gateway — Message Gateway

::: code-group

```python [Python ~vscode-icons:file-type-python~]
gateway = self.ctx.gateway
```

:::

- `await gateway.route_message(gateway_name, message, route_metadata=None, external_message_id="", dedupe_key="")` — inject an external platform message into the Host through the specified message gateway
- `await gateway.update_state(gateway_name, ready, platform="", account_id="", scope="", metadata=None)` — report the message gateway's runtime state to the Host
- `await gateway.receive_external_message(message, gateway_name=..., ...)` — a compatibility alias for `route_message()`
- `await gateway.update_runtime_state(gateway_name=..., connected=..., ...)` — a compatibility alias for `update_state()`

::: code-group

```python [Python ~vscode-icons:file-type-python~]
await self.ctx.gateway.update_state(
    gateway_name="napcat_gateway",
    ready=True,
    platform="qq",
    account_id="10001",
    scope="primary",
    metadata={"protocol": "napcat"},
)

accepted = await self.ctx.gateway.route_message(
    gateway_name="napcat_gateway",
    message={
        "message_id": "msg-1",
        "platform": "qq",
        "account_id": "10001",
        "scope": "primary",
        "timestamp": "1791504000.0",
        "message_info": {...},
        "raw_message": [],
    },
    external_message_id="external-1",
    dedupe_key="dedupe-1",
)
```

:::

The message's top-level `platform/account_id/scope` must match the gateway's ready declaration. `account_id` must be a non-empty string; omit `scope` or use `None` when there is no scope. Inbound messages do not discover new accounts or override gateway declarations. Legacy identity fields are temporarily supported with a WARNING that support will be removed in the next version.

See [Message Gateway](./message-gateway.md#message-ownership) for details.

## tool — Tool Definitions

::: code-group

```python [Python ~vscode-icons:file-type-python~]
tool = self.ctx.tool
```

:::

- `await tool.get_definitions()` — get the list of tool definitions available to the LLM

Each element in the returned list contains a `name` and a `definition` field. `tool.get_definitions()` returns the tool definition list directly, so you do not need to read the `tools` field out of the RPC result manually.

## render — HTML Rendering

::: code-group

```python [Python ~vscode-icons:file-type-python~]
render = self.ctx.render
```

:::

- `await render.html2png(html, **kwargs)` — render HTML content into a PNG image

Common parameters include:

- `selector`: the target selector to screenshot; defaults to `body`
- `viewport`: viewport size, for example `{"width": 1200, "height": 800}`
- `device_scale_factor`: device pixel ratio
- `full_page`: whether to capture the full page
- `omit_background`: whether to drop the default background
- `wait_until` / `wait_for_selector` / `wait_for_timeout_ms`: control when the page is considered stable
- `allow_network`: whether the page may access external network resources

::: code-group

```python [Python ~vscode-icons:file-type-python~]
card = await self.ctx.render.html2png(
    "<body><div id='card'>Hello MaiBot</div></body>",
    selector="#card",
    viewport={"width": 960, "height": 540},
    device_scale_factor=2.0,
)

await self.ctx.send.image(card["image_base64"], stream_id)
```

:::

`render.html2png()` returns the result dictionary unwrapped by the Host, usually containing fields such as `image_base64`, `mime_type`, `width`, and `height`.

## knowledge — Knowledge Base Search

::: code-group

```python [Python ~vscode-icons:file-type-python~]
knowledge = self.ctx.knowledge
```

:::

- `await knowledge.search(query, limit=5)` — search the LPMM knowledge base

::: code-group

```python [Python ~vscode-icons:file-type-python~]
content = await self.ctx.knowledge.search("What is Python", limit=3)
if content:
    print(content)
```

:::

## statistics — Local Statistics

::: code-group

```python [Python ~vscode-icons:file-type-python~]
statistics = self.ctx.statistics
```

:::

`statistics.local.*` reads only the current MaiBot instance's local statistics; it does not include telemetry or uploaded client statistics. A plugin must declare the corresponding capability in `_manifest.json`'s `capabilities` before calling it.

- `await statistics.local.models(days=7, limit=10)` — get model-dimension aggregate statistics
- `await statistics.local.model_trend(days=7, bucket="day", top_models=10, metric="token", module_name="")` — get model call trends
- `await statistics.local.token_trend(days=7, bucket="day", group_by="", top_items=10)` — get token usage trends
- `await statistics.local.token_distribution(days=7, group_by="model", top_items=10)` — get token usage distribution
- `await statistics.local.message_trend(days=7, bucket="day", top_chats=10)` — get message-volume trends by chat stream
- `await statistics.local.tool_trend(days=7, bucket="day", top_tools=10)` — get tool call trends
- `await statistics.local.online_time_trend(days=7, bucket="day")` — get online-time trends

Common parameters:

- `days`: how many recent days of data to query; must be a positive integer
- `bucket`: time granularity, either `"hour"` or `"day"`
- `group_by`: token statistics grouping, supporting `"model"`, `"module"`, `"provider"`, and `"type"`; an empty string returns four series — total tokens, input tokens, output tokens, and request count
- `metric`: model trend metric, supporting `"token"`, `"request"`, `"cost"`, and `"latency"`

Trend methods return the `series` structure directly, containing `timestamps`, `values_by_key`, `labels_by_key`, `total`, and `source_count`. `token_distribution()` returns the `distribution` structure directly, containing `pies` ready for pie charts.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
models = await self.ctx.statistics.local.models(days=7, limit=5)
token_series = await self.ctx.statistics.local.token_trend(days=7, group_by="model")
message_series = await self.ctx.statistics.local.message_trend(days=7, top_chats=5)

top_model = models[0]["model_name"] if models else "unknown"
```

:::

Manifest example:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "capabilities": [
    "statistics.local.models",
    "statistics.local.model_trend",
    "statistics.local.token_trend",
    "statistics.local.token_distribution",
    "statistics.local.message_trend",
    "statistics.local.tool_trend",
    "statistics.local.online_time_trend"
  ]
}
```

:::

## WebUI Upload Claims

`ctx.webui.claim_upload(upload_id)` claims a host-staged image into the plugin's persistent `uploads/` directory. It returns `path`, `sha256`, and `upload_id`. Requires SDK 2.11.0+, a host supporting `file_upload`, and manifest capability `webui.claim_upload`.

::: code-group

```python [plugin.py ~vscode-icons:file-type-python~]
from pathlib import Path

claimed = await self.ctx.webui.claim_upload(upload_id)
image_path = Path(claimed["path"])
# The plugin handles validation, retention, or deletion.
# Move blocking file work to a worker thread.
```

:::

Tokens must belong to the claiming plugin, expire after one hour, and can be claimed only once. They originate from authenticated WebUI uploads; arbitrary paths are not substitutes. File contents do not travel through ordinary JSON/RPC. See [WebUI Pages](./webui-pages.md#upload-and-interaction-capabilities) for declarations and format/size limits.

## paths — Runtime Paths

::: code-group

```python [Python ~vscode-icons:file-type-python~]
data_path = self.ctx.paths.data_dir / "records.json"
runtime_path = self.ctx.paths.runtime_dir / "latest-card.png"
```

:::

`ctx.paths` provides standard per-plugin directories, so a plugin does not have to write runtime data into the source directory or assemble paths under the Host root by itself.

- `data_dir`: persistent data directory, mapped by default to `data/plugins/<plugin_id>/`
- `runtime_dir`: temporary runtime directory, mapped by default to `temp/plugins/<plugin_id>/`

Write user settings, plugin databases, small JSON state, and other data that must survive restarts into `data_dir`; write download caches, rendering intermediates, and rebuildable files into `runtime_dir`. `runtime_dir` is not guaranteed to be retained long term, so a plugin should be able to rebuild whatever it needs after the directory has been cleaned.

Path safety notes:

- Do not keep using the legacy `plugins/<plugin>/data` directory for new data.
- Do not use raw user input as a filename; allowlist it or map it to an internal plugin ID first when you need to write a file.
- Do not accept absolute paths or relative paths containing `..` as write targets; the write location should always stay under `data_dir` or `runtime_dir`.

## logger — Logging

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Option 1: through ctx.logger (the name is automatically plugin.<plugin_id>)
logger = self.ctx.logger
logger.info("Plugin started")
logger.error(f"Request failed: {err}", exc_info=True)

# Option 2: use stdlib logging directly (it is forwarded automatically too)
import logging
logger = logging.getLogger(__name__)
logger.warning("Configuration missing, using defaults")
```

:::

`self.ctx.logger` is a standard `logging.Logger` named `plugin.<plugin_id>`. It supports all standard methods: `debug()`, `info()`, `warning()`, `error()`, `critical()`.

::: tip Automatic log forwarding
Logs in the Runner process are automatically transmitted to the main process over IPC, with no extra configuration needed. You can find all logs output by the plugin in the main process logs.
:::
