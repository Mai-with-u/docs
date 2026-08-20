---
title: API Reference
---

# API Reference

MaiBot plugins access 17 capability proxies through `self.ctx` (`PluginContext`). Capability calls are automatically forwarded to Host via RPC, and the SDK automatically unwraps results; `ctx.paths` and `ctx.logger` are context helper objects injected by the Runner.

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

# Context helper objects
self.ctx.paths      # Plugin data and runtime directories
self.ctx.logger     # Logging (standard logging.Logger)
```

:::

## send — Message Sending {#send}

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Send text message
await self.ctx.send.text(text="Hello!", stream_id=stream_id)

# Send image message (base64 encoded)
await self.ctx.send.image(image_base64=base64_str, stream_id=stream_id)

# Send emoji (base64 encoded)
await self.ctx.send.emoji(emoji_base64=base64_str, stream_id=stream_id)

# Send hybrid message
await self.ctx.send.hybrid(segments=[...], stream_id=stream_id)

# Send forward message
await self.ctx.send.forward(messages=[...], stream_id=stream_id)

# Send custom type message
await self.ctx.send.custom(custom_type="card", data={...}, stream_id=stream_id)
```

:::

All `send.*` methods return `bool` by default, indicating whether the send was successful. Since 1.2.0, passing `return_details=True` returns a detailed result that includes the platform-confirmed final message ID, useful for later references (e.g. recalling):

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Default: returns bool
ok = await self.ctx.send.text("Hi", stream_id)

# return_details=True returns {"success": bool, "sent": bool, "message_id": str | None}
result = await self.ctx.send.text("Hi", stream_id, return_details=True)
if result["sent"] and result["message_id"]:
    platform_msg_id = result["message_id"]
```

:::

`return_details` works for all seven methods: `send.text`, `send.emoji`, `send.image`, `send.forward`, `send.hybrid`, `send.command`, `send.custom`. `message_id` is the platform-side final message ID reported back by the adapter (`platform_message_id`); it is `None` when the send failed or the platform did not report one back.

## db — Database Operations

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Query data
results = await self.ctx.db.query(model_name="my_data", filters={"key": "value"})

# Save data
await self.ctx.db.save(model_name="my_data", data={"key": "value", "count": 1})

# Get single record
result = await self.ctx.db.get(model_name="my_data", filters={"key": "value"})

# Delete data
await self.ctx.db.delete(model_name="my_data", filters={"key": "value"})

# Count
count = await self.ctx.db.count(model_name="my_data", filters={"status": "active"})
```

:::

## llm — LLM Calls

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Text generation
result = await self.ctx.llm.generate(prompt="Summarize the following", model="gpt-4")

# Text generation with tools
result = await self.ctx.llm.generate_with_tools(
    prompt="Search and answer",
    tools=[...],
    model="gpt-4",
)
```

:::

When `temperature` or `max_tokens` is omitted or set to `None`, the Host uses the values configured for the selected model/task in model management. Pass concrete values only when the plugin needs to override that configuration.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Generate an embedding vector for one text. Uses model_task_config.embedding by default.
embedding = await self.ctx.llm.embed(text="Text to vectorize")

# Generate embedding vectors in batch. task_name/model/model_name are model task names, not concrete model IDs.
embeddings = await self.ctx.llm.embed(
    texts=["First paragraph", "Second paragraph"],
    task_name="embedding",
    max_concurrent=4,
)

# Transcribe audio with the Host's current voice task.
with open("voice.mp3", "rb") as audio_file:
    asr_result = await self.ctx.llm.transcribe_audio(audio_file.read())
if asr_result["success"]:
    text = asr_result["text"]

# Get available model list
models = await self.ctx.llm.get_available_models()
```

:::

Before using embedding or audio transcription, declare `llm.embed` or `llm.transcribe_audio` in the plugin `_manifest.json` `capabilities` list.

## config — Configuration Reading

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Read config value
value = await self.ctx.config.get("key.subkey")

# Read plugin's own configuration
config = await self.ctx.config.get_plugin("com.example.my-plugin")

# Read all configuration
all_config = await self.ctx.config.get_all()
```

:::

The plugin's `config_model` defines its configuration structure and defaults. The Runner stores values for the current installation in the generated `config.toml` under the plugin directory, and the configuration capability proxy reads the runtime configuration already loaded by the Runner.

## message — Historical Messages

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get recent messages
messages = await self.ctx.message.get_recent(stream_id=stream_id, limit=20)

# Get messages by time
messages = await self.ctx.message.get_by_time(
    stream_id=stream_id,
    start_time="2024-01-01T00:00:00",
    end_time="2024-01-02T00:00:00",
)

# Count new messages
count = await self.ctx.message.count_new(stream_id=stream_id)

# Get one message by ID
message = await self.ctx.message.get_by_id(message_id="msg-001", stream_id=stream_id)

# Build readable text
text = await self.ctx.message.build_readable(messages=messages)
```

:::

## chat — Chat Streams

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get all chat streams
streams = await self.ctx.chat.get_all_streams()

# Get group chat streams
streams = await self.ctx.chat.get_group_streams()

# Get private chat streams
streams = await self.ctx.chat.get_private_streams()

# Get chat stream by Group ID
stream = await self.ctx.chat.get_stream_by_group_id(group_id="123456")

# Get chat stream by User ID
stream = await self.ctx.chat.get_stream_by_user_id(user_id="789012")

# Open or create a private chat stream
stream = await self.ctx.chat.open_session(
    platform="qq",
    chat_type="private",
    user_id="789012",
)

# Open or create a group chat stream. Group chats only need group_id, not user_id.
stream = await self.ctx.chat.open_session(
    platform="qq",
    chat_type="group",
    group_id="123456",
)
```

:::

`chat.open_session` returns `stream_id`, `session_id`, `chat_type`, `created`, and the full `stream` object. In multi-account or multi-route deployments, pass `account_id` and `scope` as well to avoid opening the wrong chat stream.

## maisaka - Maisaka Proactive Tasks

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Ask Maisaka to proactively process one conversation turn for a chat stream.
result = await self.ctx.maisaka.proactive.trigger(
    stream_id=stream["stream_id"],
    intent="Remind the user that they have a schedule item at 20:00 today",
    reason="calendar_reminder",
    metadata={"source": "calendar_plugin"},
)

# Append a plugin context message to a chat stream.
await self.ctx.maisaka.context.append(
    stream_id=stream["stream_id"],
    segments=[{"type": "text", "content": "The user just completed a plugin task"}],
    visible_text="The user just completed a plugin task",
    source_kind="plugin:calendar",
)
```

:::

`maisaka.proactive.trigger` does not send fixed text directly and does not impersonate a user message. It writes the `intent` into Maisaka's internal context and wakes the Planner, letting Maisaka decide whether to reply and how to express itself using personality, memory, current context, and available tools. The chat stream must already exist; call `chat.open_session` first when you need to open a private or group stream proactively.

## person — User Information

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get user ID
person_id = await self.ctx.person.get_id(name="username")

# Find user ID by name
person_id = await self.ctx.person.get_id_by_name(name="John")

# Get user attribute value
value = await self.ctx.person.get_value(person_id=person_id, key="nickname")
```

:::

## emoji — Emoji Management

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get random emojis
emojis = await self.ctx.emoji.get_random(count=5)

# Search emoji by description
emoji = await self.ctx.emoji.get_by_description(description="happy")

# Get all emojis
all_emojis = await self.ctx.emoji.get_all()

# Get emoji count
count = await self.ctx.emoji.get_count()

# Get emoji information
info = await self.ctx.emoji.get_info(emoji_id="emoji_001")

# Get emotion list
emotions = await self.ctx.emoji.get_emotions()

# Delete an emoji. keep_desc=True keeps the description cache; False removes the DB record too.
await self.ctx.emoji.delete_emoji(emoji_hash="sha256_hash", keep_desc=True)
```

:::

## frequency — Talk Frequency

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get current talk frequency value
value = await self.ctx.frequency.get_current_talk_value()

# Set frequency adjustment value
await self.ctx.frequency.set_adjust(value=0.5)

# Get frequency adjustment value
value = await self.ctx.frequency.get_adjust()
```

:::

## component — Plugin and Component Management

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Load plugin
await self.ctx.component.load_plugin(plugin_id="com.example.plugin")

# Unload plugin
await self.ctx.component.unload_plugin(plugin_id="com.example.plugin")

# Reload plugin
await self.ctx.component.reload_plugin(plugin_id="com.example.plugin")

# Get all plugins info
plugins = await self.ctx.component.get_all_plugins()

# Get single plugin info
plugin = await self.ctx.component.get_plugin_info(plugin_id="com.example.plugin")

# List loaded plugins
plugins = await self.ctx.component.list_loaded_plugins()

# List registered plugins
plugins = await self.ctx.component.list_registered_plugins()
```

:::

## api — Cross-plugin API

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Call another plugin's API
result = await self.ctx.api.call(
    plugin_id="com.other.plugin",
    api_name="render_html",
    html="<h1>Hello</h1>",
)

# Get API information
api_info = await self.ctx.api.get(
    plugin_id="com.other.plugin",
    api_name="render_html",
)

# List all available APIs
apis = await self.ctx.api.list()

# Replace dynamic APIs (called internally by sync_dynamic_apis)
await self.ctx.api.replace_dynamic_apis(
    components=[...],
    offline_reason="Dynamic API offline",
)
```

:::

## gateway — Message Gateway

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Inject inbound message to Host
accepted = await self.ctx.gateway.route_message(
    gateway_name="my_gateway",
    message={...},
    route_metadata={...},
    external_message_id="msg-001",
    dedupe_key="msg-001",
)

# Report gateway state
await self.ctx.gateway.update_state(
    gateway_name="my_gateway",
    ready=True,
    platform="qq",
    account_id="10001",
    scope="primary",
)
```

:::

See [Message Gateway](./message-gateway.md) for details.

## tool — Tool Definitions

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get LLM tool definition list
definitions = await self.ctx.tool.get_definitions()
```

:::

## render — HTML Rendering

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Render HTML to PNG image
result = await self.ctx.render.html2png(html="<h1>Hello</h1><p>World</p>")
```

:::

`html2png()` returns a rendering result, suitable for scenarios requiring image output such as cards, leaderboards, or share images.

## knowledge — Knowledge Base Search

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Search LPMM knowledge base
content = await self.ctx.knowledge.search(query="MaiBot configuration guide")
```

:::

## statistics — Local Statistics

::: code-group

```python [Python ~vscode-icons:file-type-python~]
statistics = self.ctx.statistics
```

:::

`statistics.local.*` reads only the current MaiBot instance's local statistics. It does not expose telemetry or uploaded client statistics. Declare the corresponding capability in `_manifest.json` before calling it.

- `await statistics.local.models(days=7, limit=10)` — get model-level aggregate statistics
- `await statistics.local.model_trend(days=7, bucket="day", top_models=10, metric="token", module_name="")` — get model usage trends
- `await statistics.local.token_trend(days=7, bucket="day", group_by="", top_items=10)` — get token usage trends
- `await statistics.local.token_distribution(days=7, group_by="model", top_items=10)` — get token usage distribution
- `await statistics.local.message_trend(days=7, bucket="day", top_chats=10)` — get message-count trends by chat stream
- `await statistics.local.tool_trend(days=7, bucket="day", top_tools=10)` — get tool-call trends
- `await statistics.local.online_time_trend(days=7, bucket="day")` — get online-time trends

Common parameters:

- `days`: number of recent days to query; must be a positive integer
- `bucket`: time bucket, either `"hour"` or `"day"`
- `group_by`: token grouping, one of `"model"`, `"module"`, `"provider"`, or `"type"`; an empty string returns total/input/output/request-count series
- `metric`: model trend metric, one of `"token"`, `"request"`, `"cost"`, or `"latency"`

Trend methods directly return a `series` object with `timestamps`, `values_by_key`, `labels_by_key`, `total`, and `source_count`. `token_distribution()` directly returns a `distribution` object with chart-ready `pies`.

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

## paths — Runtime Paths

::: code-group

```python [Python ~vscode-icons:file-type-python~]
data_path = self.ctx.paths.data_dir / "records.json"
runtime_path = self.ctx.paths.runtime_dir / "latest-card.png"
```

:::

`ctx.paths` provides standard per-plugin directories, so plugins do not need to write runtime data into the source directory or manually construct paths under the Host root.

- `data_dir`: persistent data directory, mapped to `data/plugins/<plugin_id>/` by default
- `runtime_dir`: temporary runtime directory, mapped to `temp/plugins/<plugin_id>/` by default

Use `data_dir` for plugin databases, JSON state, user-generated content, and other data that should survive restarts. Use `runtime_dir` for download caches, rendering intermediates, and rebuildable files. `runtime_dir` is not guaranteed to be retained long term, so plugins should recreate required files when it has been cleaned.

Path safety notes:

- Do not use the legacy `plugins/<plugin>/data` directory for new data.
- Do not use raw user input as a filename; normalize it through an allowlist or map it to an internal plugin ID first.
- Do not accept absolute paths or relative paths containing `..` as write targets; writes should stay under `data_dir` or `runtime_dir`.

## logger — Logging

```python
# Standard logging interface, Logger name is "plugin.<plugin_id>"
self.ctx.logger.info("Plugin started")
self.ctx.logger.warning("Config missing, using default")
self.ctx.logger.error("Something went wrong", exc_info=True)
self.ctx.logger.debug("Debug info: %s", data)
```

::: tip Automatic Log Forwarding
Logs in the Runner process are automatically transmitted to the main process via IPC, no extra configuration needed. All plugin output logs can be found in the main process logs.
:::
