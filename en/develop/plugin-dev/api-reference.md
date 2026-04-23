---
title: API Reference
---

# API Reference

MaiBot plugins access 15 capability proxies through `self.ctx` (`PluginContext`). All calls are automatically forwarded to Host via RPC, and the SDK automatically unwraps results.

```python
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
self.ctx.logger     # Logging (standard logging.Logger)
```

## send — Message Sending

```python
# Send text message
await self.ctx.send.text(text="Hello!", stream_id=stream_id)

# Send image message (base64 encoded)
await self.ctx.send.image(image_base64=base64_str, stream_id=stream_id)

# Send emoji (base64 encoded)
await self.ctx.send.emoji(emoji_base64=base64_str, stream_id=stream_id)

# Send hybrid message
await self.ctx.send.hybrid(parts=[...], stream_id=stream_id)

# Send forward message
await self.ctx.send.forward(messages=[...], stream_id=stream_id)

# Send custom type message
await self.ctx.send.custom(custom_type="card", data={...}, stream_id=stream_id)
```

All `send.*` methods return `bool`, indicating whether the send was successful.

## db — Database Operations

```python
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

## llm — LLM Calls

```python
# Text generation
result = await self.ctx.llm.generate(prompt="Summarize the following", model="gpt-4")

# Text generation with tools
result = await self.ctx.llm.generate_with_tools(
    prompt="Search and answer",
    tools=[...],
    model="gpt-4",
)

# Get available model list
models = await self.ctx.llm.get_available_models()
```

## config — Configuration Reading

```python
# Read config value
value = await self.ctx.config.get("key.subkey")

# Read plugin's own configuration
config = await self.ctx.config.get_plugin("com.example.my-plugin")

# Read all configuration
all_config = await self.ctx.config.get_all()
```

## message — Historical Messages

```python
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

# Build readable text
text = await self.ctx.message.build_readable(messages=messages)
```

## chat — Chat Streams

```python
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
```

## person — User Information

```python
# Get user ID
person_id = await self.ctx.person.get_id(name="username")

# Find user ID by name
person_id = await self.ctx.person.get_id_by_name(name="John")

# Get user attribute value
value = await self.ctx.person.get_value(person_id=person_id, key="nickname")
```

## emoji — Emoji Management

```python
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
```

## frequency — Talk Frequency

```python
# Get current talk frequency value
value = await self.ctx.frequency.get_current_talk_value()

# Set frequency adjustment value
await self.ctx.frequency.set_adjust(value=0.5)

# Get frequency adjustment value
value = await self.ctx.frequency.get_adjust()
```

## component — Plugin and Component Management

```python
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

## api — Cross-plugin API

```python
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

## gateway — Message Gateway

```python
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

See [Message Gateway](./message-gateway.md) for details.

## tool — Tool Definitions

```python
# Get LLM tool definition list
definitions = await self.ctx.tool.get_definitions()
```

## render — HTML Rendering

```python
# Render HTML to PNG image
result = await self.ctx.render.html2png(html="<h1>Hello</h1><p>World</p>")
```

`html2png()` returns a rendering result, suitable for scenarios requiring image output such as cards, leaderboards, or share images.

## knowledge — Knowledge Base Search

```python
# Search LPMM knowledge base
content = await self.ctx.knowledge.search(query="MaiBot configuration guide")
```

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
