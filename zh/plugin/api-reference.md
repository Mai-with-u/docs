---
title: API 参考
---

# API 参考

MaiBot 插件通过 `self.ctx`（`PluginContext`）访问 17 种能力代理。所有能力调用自动通过 RPC 转发到 Host 处理，SDK 会自动解包结果；`ctx.paths` 与 `ctx.logger` 是 Runner 注入的上下文辅助对象。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 能力代理
self.ctx.send       # 发送消息
self.ctx.db         # 数据库操作
self.ctx.llm        # LLM 调用
self.ctx.config     # 配置读取
self.ctx.message    # 历史消息
self.ctx.chat       # 聊天流
self.ctx.person     # 用户信息
self.ctx.emoji      # 表情包管理
self.ctx.frequency  # 发言频率
self.ctx.component  # 插件管理
self.ctx.api        # 跨插件 API
self.ctx.gateway    # 消息网关
self.ctx.tool       # 工具定义
self.ctx.render     # HTML 渲染
self.ctx.knowledge  # 知识库搜索
self.ctx.statistics # 本机统计
self.ctx.maisaka    # Maisaka 上下文与主动任务

# 上下文辅助对象
self.ctx.paths      # 插件持久化与运行时目录
self.ctx.logger     # 日志记录器
```

:::

`ctx.paths` 详见下方的 paths 章节；`ctx.logger` 提供标准 `logging.Logger` 实例，详见 logger 章节。

## send — 消息发送 {#send}

::: code-group

```python [Python ~vscode-icons:file-type-python~]
send = self.ctx.send
```

:::

- `await send.text(text, stream_id, **kwargs)` — 发送文本消息
- `await send.image(image_data, stream_id, **kwargs)` — 发送图片
- `await send.emoji(emoji_data, stream_id, **kwargs)` — 发送表情
- `await send.command(command, stream_id, **kwargs)` — 发送指令消息
- `await send.forward(messages, stream_id, **kwargs)` — 发送转发消息
- `await send.hybrid(segments, stream_id, **kwargs)` — 发送图文混合消息
- `await send.custom(custom_type, data, stream_id, **kwargs)` — 发送自定义类型消息

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 发送文本
await self.ctx.send.text("你好", stream_id)

# 发送图片（base64）
import base64
with open("image.png", "rb") as f:
    data = base64.b64encode(f.read()).decode()
await self.ctx.send.image(data, stream_id)

# 图文混合
await self.ctx.send.hybrid([
    {"type": "text", "content": "看看这张图："},
    {"type": "image", "content": image_base64},
], stream_id)
```

:::

说明：`send.custom()` 会同时携带 `custom_type/data` 和 `message_type/content` 两套字段名，用于兼容不同版本的 Host 实现。插件侧只需要继续传 `custom_type` 与 `data`。

**返回值（1.2.0 起）**：默认情况下所有 `send.*` 方法返回 `bool`，表示是否发送成功。传入 `return_details=True` 时，返回包含平台确认的最终消息 ID 的详细结果，便于后续引用（如撤回）：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 默认返回 bool
ok = await self.ctx.send.text("你好", stream_id)

# return_details=True 返回 {"success": bool, "sent": bool, "message_id": str | None}
result = await self.ctx.send.text("你好", stream_id, return_details=True)
if result["sent"] and result["message_id"]:
    platform_msg_id = result["message_id"]
```

:::

`return_details` 对 `send.text`、`send.emoji`、`send.image`、`send.forward`、`send.hybrid`、`send.command`、`send.custom` 七个方法均生效。`message_id` 为适配器回传的平台侧最终消息 ID（`platform_message_id`），未成功发送或平台未回传时为 `None`。

## db — 数据库操作

::: code-group

```python [Python ~vscode-icons:file-type-python~]
db = self.ctx.db
```

:::

- `await db.query(model_name, query_type="get", data=None, filters=None, order_by=None, limit=None, single_result=False)` — 通用数据库操作
- `await db.save(model_name, data, key_field="id", key_value=None)` — 插入或按字段更新
- `await db.get(model_name, filters=None, limit=None, order_by=None, single_result=False)` — 按条件获取记录
- `await db.delete(model_name, filters)` — 删除数据
- `await db.count(model_name, filters)` — 计数

`db.count()` 的返回值始终是 `int`。即使 Host 侧 RPC 返回的是带 `count` 字段的对象，SDK 也会自动解包。

注意：这里的 `model_name` 必须是 Host 侧 `src.common.database.database_model` 中存在的模型类名，例如 `"ChatHistory"`、`"ActionRecord"`。旧版 `table` 参数名和 `db.get(key_field, key_value)` 形式已经废弃。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 查询
results = await self.ctx.db.query(
    model_name="ChatHistory",
    query_type="get",
    filters={"session_id": "session-123"},
    order_by=["-start_timestamp"],
    limit=10,
)

# 获取单条记录
record = await self.ctx.db.get(
    model_name="ActionRecord",
    filters={"action_id": "a-1"},
    single_result=True,
)

# 插入
await self.ctx.db.save(
    model_name="ActionRecord",
    data={"action_id": "a-1", "session_id": "session-123", "action_name": "reply"},
)

# 更新
updated = await self.ctx.db.query(
    model_name="ChatHistory",
    query_type="update",
    data={"summary": "updated"},
    filters={"session_id": "session-123"},
)

# 删除
await self.ctx.db.delete(
    model_name="ChatHistory",
    filters={"session_id": "session-123"},
)

# 计数
count = await self.ctx.db.count("ChatHistory", {"session_id": "session-123"})
```

:::

## llm — LLM 调用

::: code-group

```python [Python ~vscode-icons:file-type-python~]
llm = self.ctx.llm
```

:::

- `await llm.generate(prompt, model="", temperature=None, max_tokens=None)` — 文本生成，`prompt` 支持字符串或消息列表
- `await llm.generate_with_tools(prompt, tools, model="", temperature=None, max_tokens=None)` — 带工具调用的生成
- `await llm.embed(text=..., texts=...)` — 生成文本嵌入向量
- `await llm.transcribe_audio(audio=..., audio_base64=...)` — 调用 Host 当前 `voice` 任务进行 ASR 语音识别，`audio` 支持音频字节或 Base64/Data URL 字符串
- `await llm.get_available_models()` — 获取可用模型列表，返回 `list[str]`

`temperature` 和 `max_tokens` 省略或传入 `None` 时，会使用模型管理页中当前模型/任务配置的值；只有显式传入具体值时才会覆盖配置。

**generate 返回值**：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
{
    "success": True,
    "response": "生成的文本",
    "reasoning": "推理内容（如有）",
    "model": "实际使用的模型名",
    "model_name": "实际使用的模型名"
}
```

:::

SDK 会始终补齐 `model` 字段；若 Host 仍返回旧字段名 `model_name`，SDK 会自动兼容。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 简单文本生成
result = await self.ctx.llm.generate(
    prompt="请用一句话介绍 Python",
    temperature=0.5,
)
if result["success"]:
    text = result["response"]

# 用消息列表格式
result = await self.ctx.llm.generate(
    prompt=[
        {"role": "system", "content": "你是一个翻译助手"},
        {"role": "user", "content": "翻译：Hello World"},
    ],
)

# 带工具调用
result = await self.ctx.llm.generate_with_tools(
    prompt="今天天气怎么样",
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询天气",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
            },
        },
    }],
)
tool_calls = result.get("tool_calls", [])

# 单条文本嵌入
embedding = await self.ctx.llm.embed(text="需要向量化的文本")

# 批量文本嵌入
embeddings = await self.ctx.llm.embed(
    texts=["第一段文本", "第二段文本"],
    task_name="embedding",
    max_concurrent=4,
)

# ASR 语音识别
with open("voice.mp3", "rb") as audio_file:
    asr_result = await self.ctx.llm.transcribe_audio(audio_file.read())
if asr_result["success"]:
    text = asr_result["text"]

# 获取可用模型列表
models = await self.ctx.llm.get_available_models()
```

:::

## config — 配置读取

::: code-group

```python [Python ~vscode-icons:file-type-python~]
config = self.ctx.config
```

:::

- `await config.get(key, default=None)` — 获取配置值，`key` 支持点分割
- `await config.get_plugin(plugin_name=None)` — 获取指定插件的配置
- `await config.get_all()` — 获取插件全部配置

配置结构和默认值由插件的 `config_model` 定义。Runner 将当前安装实例的值保存在插件目录下自动生成的 `config.toml` 中，配置能力代理读取的是 Runner 已加载的运行时配置。

`config.get()`、`config.get_plugin()` 和 `config.get_all()` 都会直接返回配置值或配置字典，不需要手动从 RPC 结果中读取 `value` 字段。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 读取单个值
api_key = await self.ctx.config.get("api_key", "")
timeout = await self.ctx.config.get("network.timeout", 30)

# 读取指定插件配置
config = await self.ctx.config.get_plugin("com.example.my-plugin")

# 读取全部配置
all_config = await self.ctx.config.get_all()
```

:::

## message — 历史消息

::: code-group

```python [Python ~vscode-icons:file-type-python~]
message = self.ctx.message
```

:::

- `await message.get_recent(chat_id, limit)` — 获取最近消息
- `await message.get_by_id(message_id, chat_id="", stream_id="")` — 按消息 ID 查询单条消息
- `await message.build_readable(messages, **kwargs)` — 将消息列表格式化为可读字符串
- `await message.get_by_time(start_time, end_time)` — 按时间范围查询（全局）
- `await message.get_by_time_in_chat(chat_id, start_time, end_time)` — 按时间范围查询指定聊天
- `await message.count_new(chat_id, since)` — 统计新消息数（`since` 为 UNIX 时间戳字符串）

`build_readable` 支持两种调用方式：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 方式 1：传入已查询的消息列表
msgs = await self.ctx.message.get_recent(chat_id, limit=20)
readable = await self.ctx.message.build_readable(msgs)

# 按消息 ID 查询
message_detail = await self.ctx.message.get_by_id(message_id, stream_id=chat_id)

# 方式 2：通过关键字参数传入 chat_id + 时间范围，由 Host 端查询
readable = await self.ctx.message.build_readable(
    messages=None,
    chat_id=chat_id,
    start_time=start_ts,
    end_time=end_ts,
)
```

:::

可选关键字参数：`replace_bot_name`（默认 `True`）、`timestamp_mode`（默认 `"relative"`）、`truncate`（默认 `False`）。

`message.get_by_time()`、`message.get_by_time_in_chat()` 和 `message.get_recent()` 会直接返回消息列表；`message.count_new()` 直接返回数量；`message.build_readable()` 直接返回字符串。

## chat — 聊天流

::: code-group

```python [Python ~vscode-icons:file-type-python~]
chat = self.ctx.chat
```

:::

- `await chat.get_all_streams(platform="qq")` — 获取所有聊天流
- `await chat.get_group_streams(platform="qq")` — 获取所有群聊流
- `await chat.get_private_streams(platform="qq")` — 获取所有私聊流
- `await chat.get_stream_by_group_id(group_id, platform="qq")` — 按群 ID 查找聊天流
- `await chat.get_stream_by_user_id(user_id, platform="qq")` — 按用户 ID 查找私聊流
- `await chat.open_session(platform, chat_type, **kwargs)` — 打开或创建聊天流

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 获取所有群聊流
streams = await self.ctx.chat.get_group_streams()

# 获取私聊聊天流
streams = await self.ctx.chat.get_private_streams()

# 按 Group ID 获取聊天流
stream = await self.ctx.chat.get_stream_by_group_id(group_id="123456")

# 按用户 ID 获取聊天流
stream = await self.ctx.chat.get_stream_by_user_id(user_id="789012")

# 打开或创建私聊聊天流
stream = await self.ctx.chat.open_session(
    platform="qq",
    chat_type="private",
    user_id="789012",
)

# 打开或创建群聊聊天流
stream = await self.ctx.chat.open_session(
    platform="qq",
    chat_type="group",
    group_id="123456",
)
```

:::

`chat.open_session()` 会返回 `stream_id`、`session_id`、`chat_type`、`created` 以及完整 `stream` 对象。在多账号或多路由部署中，建议同时传入 `account_id` 和 `scope`，避免打开到错误的聊天流。

## maisaka — Maisaka 主动任务

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 请求 Maisaka 基于指定聊天流主动处理一轮对话
result = await self.ctx.maisaka.proactive.trigger(
    stream_id=stream["stream_id"],
    intent="提醒用户今晚 20:00 有日程",
    reason="calendar_reminder",
    metadata={"source": "calendar_plugin"},
)

# 向指定聊天流追加一条插件上下文消息
await self.ctx.maisaka.context.append(
    stream_id=stream["stream_id"],
    segments=[{"type": "text", "content": "用户刚刚完成了一个插件任务"}],
    visible_text="用户刚刚完成了一个插件任务",
    source_kind="plugin:calendar",
)
```

:::

`maisaka.proactive.trigger()` 不会直接发送固定文本，也不会伪装成用户消息。它会把 `intent` 写入 Maisaka 内部上下文并唤醒 Planner，让 Maisaka 基于人格、记忆、当前上下文和可用工具自行决定是否回复以及如何表达。目标聊天流必须已经存在。

## person — 用户信息

::: code-group

```python [Python ~vscode-icons:file-type-python~]
person = self.ctx.person
```

:::

- `await person.get_id(platform, user_id)` — 获取 person_id
- `await person.get_value(person_id, field_name)` — 获取用户字段值
- `await person.get_id_by_name(person_name)` — 根据用户名获取 person_id

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 获取 person_id
pid = await self.ctx.person.get_id("qq", "12345")

# 获取昵称
name = await self.ctx.person.get_value(pid, "nickname") or "未知"
```

:::

## emoji — 表情包管理

::: code-group

```python [Python ~vscode-icons:file-type-python~]
emoji = self.ctx.emoji
```

:::

- `await emoji.get_random(count)` — 随机获取表情包
- `await emoji.get_by_description(description, limit)` — 按描述搜索
- `await emoji.get_count()` — 获取总数
- `await emoji.get_info()` — 获取统计信息
- `await emoji.get_emotions()` — 获取情感标签列表
- `await emoji.get_all()` — 获取全部表情包
- `await emoji.register_emoji(emoji_base64)` — 注册新表情
- `await emoji.delete_emoji(emoji_hash, keep_desc=None)` — 删除表情；`keep_desc=True` 时保留描述缓存，仅移除文件和注册状态，`False` 时同步删除数据库记录，默认 `None` 由主程序按当前记录决定

## frequency — 发言频率

::: code-group

```python [Python ~vscode-icons:file-type-python~]
frequency = self.ctx.frequency
```

:::

- `await frequency.get_current_talk_value(chat_id)` — 获取当前 talk value
- `await frequency.set_adjust(chat_id, value)` — 设置频率调整值
- `await frequency.get_adjust(chat_id)` — 获取频率调整值

两个 `get_*` 方法都会直接返回数值；`set_adjust()` 返回布尔值表示是否设置成功。

## component — 插件与组件管理

::: code-group

```python [Python ~vscode-icons:file-type-python~]
component = self.ctx.component
```

:::

- `await component.get_all_plugins()` — 获取所有插件信息（含各插件注册的组件列表）
- `await component.get_plugin_info(plugin_name)` — 获取指定插件信息
- `await component.list_loaded_plugins()` — 列出已加载插件
- `await component.list_registered_plugins()` — 列出已注册插件
- `await component.enable_component(name, component_type, scope="global", stream_id="")` — 启用组件（`name` 支持 `plugin_id.comp_name` 全名或短名）
- `await component.disable_component(name, component_type, scope="global", stream_id="")` — 禁用组件（`name` 支持 `plugin_id.comp_name` 全名或短名）
- `await component.load_plugin(plugin_name)` — 加载插件（会校验插件是否存在并路由到对应 Supervisor）
- `await component.unload_plugin(plugin_name)` — 卸载插件
- `await component.reload_plugin(plugin_name)` — 重新加载插件

`scope` 支持 `"global"` 和 `"stream"`，`stream` 级别需传入 `stream_id`。

> **注意**：`enable_component` / `disable_component` 的 `name` 参数既可以传完整名称 `"my_plugin.my_command"`，也可以只传短名 `"my_command"`（Host 会自动按 `component_type` 匹配）。当使用短名且存在同名组件时，优先匹配指定 `type` 的组件。
>
> `load_plugin()` / `reload_plugin()` 返回 `True` 仅表示新 Runner 已完成初始化并成功切换；如果预热失败且 Host 回滚到旧 Runner，这两个接口会返回 `False`。

## api — 跨插件 API

::: code-group

```python [Python ~vscode-icons:file-type-python~]
api = self.ctx.api
```

:::

- `await api.call(api_name, version="", **kwargs)` — 调用其他插件公开的 API
- `await api.get(api_name, version="")` — 获取单个可见 API 的元信息
- `await api.list(plugin_id="")` — 列出当前插件可见的 API
- `await api.replace_dynamic_apis(apis, offline_reason="动态 API 已下线")` — 用新的动态 API 集合替换当前插件已暴露的动态 API

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 调用其他插件公开的 API
result = await self.ctx.api.call("plugin_a.sum_numbers", a=1, b=2)

# 查询可见 API
apis = await self.ctx.api.list()
info = await self.ctx.api.get("plugin_a.sum_numbers", version="1")
```

:::

说明：

- `api_name` 支持完整名 `plugin_id.api_name`，也支持唯一短名。
- `replace_dynamic_apis()` 适合 MCP 服务器、外部能力市场等"API 集合会动态变化"的场景。
- 动态 API 下线后，Host 会把它们标记为 offline，并对后续调用返回 `offline_reason`。

## gateway — 消息网关

::: code-group

```python [Python ~vscode-icons:file-type-python~]
gateway = self.ctx.gateway
```

:::

- `await gateway.route_message(gateway_name, message, route_metadata=None, external_message_id="", dedupe_key="")` — 通过指定消息网关把外部平台消息注入 Host
- `await gateway.update_state(gateway_name, ready, platform="", account_id="", scope="", metadata=None)` — 向 Host 上报消息网关运行时状态
- `await gateway.receive_external_message(message, gateway_name=..., ...)` — `route_message()` 的兼容别名
- `await gateway.update_runtime_state(gateway_name=..., connected=..., ...)` — `update_state()` 的兼容别名

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
        "message_info": {...},
        "raw_message": [],
    },
    route_metadata={"self_id": "10001", "connection_id": "primary"},
    external_message_id="external-1",
    dedupe_key="dedupe-1",
)
```

:::

详见 [消息网关](./message-gateway.md)。

## tool — 工具定义

::: code-group

```python [Python ~vscode-icons:file-type-python~]
tool = self.ctx.tool
```

:::

- `await tool.get_definitions()` — 获取 LLM 可用的工具定义列表

返回的列表中每个元素包含 `name` 和 `definition` 字段。`tool.get_definitions()` 会直接返回工具定义列表，不需要再从 RPC 结果里手动读取 `tools` 字段。

## render — HTML 渲染

::: code-group

```python [Python ~vscode-icons:file-type-python~]
render = self.ctx.render
```

:::

- `await render.html2png(html, **kwargs)` — 将 HTML 内容渲染为 PNG 图片

常用参数包括：

- `selector`：需要截图的目标选择器，默认是 `body`
- `viewport`：视口大小，例如 `{"width": 1200, "height": 800}`
- `device_scale_factor`：设备像素比
- `full_page`：是否截取整页
- `omit_background`：是否去掉默认背景
- `wait_until` / `wait_for_selector` / `wait_for_timeout_ms`：控制页面稳定时机
- `allow_network`：是否允许页面访问外部网络资源

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

`render.html2png()` 会直接返回 Host 解包后的结果字典，通常包含 `image_base64`、`mime_type`、`width` 和 `height` 等字段。

## knowledge — 知识库搜索

::: code-group

```python [Python ~vscode-icons:file-type-python~]
knowledge = self.ctx.knowledge
```

:::

- `await knowledge.search(query, limit=5)` — 搜索 LPMM 知识库

::: code-group

```python [Python ~vscode-icons:file-type-python~]
content = await self.ctx.knowledge.search("Python 是什么", limit=3)
if content:
    print(content)
```

:::

## statistics — 本机统计

::: code-group

```python [Python ~vscode-icons:file-type-python~]
statistics = self.ctx.statistics
```

:::

`statistics.local.*` 只读取当前 MaiBot 本机统计数据，不包含遥测或上传后的客户端统计数据。插件需要在 `_manifest.json` 的 `capabilities` 中声明对应能力后才能调用。

- `await statistics.local.models(days=7, limit=10)` — 获取模型维度汇总统计
- `await statistics.local.model_trend(days=7, bucket="day", top_models=10, metric="token", module_name="")` — 获取模型调用趋势
- `await statistics.local.token_trend(days=7, bucket="day", group_by="", top_items=10)` — 获取 token 使用趋势
- `await statistics.local.token_distribution(days=7, group_by="model", top_items=10)` — 获取 token 使用分布
- `await statistics.local.message_trend(days=7, bucket="day", top_chats=10)` — 获取聊天流消息量趋势
- `await statistics.local.tool_trend(days=7, bucket="day", top_tools=10)` — 获取工具调用趋势
- `await statistics.local.online_time_trend(days=7, bucket="day")` — 获取在线时长趋势

常用参数：

- `days`：查询最近多少天的数据，必须为正整数
- `bucket`：时间粒度，支持 `"hour"` 或 `"day"`
- `group_by`：token 统计分组，支持 `"model"`、`"module"`、`"provider"`、`"type"`；空字符串表示返回总 token / 输入 token / 输出 token / 请求次数四条序列
- `metric`：模型趋势指标，支持 `"token"`、`"request"`、`"cost"`、`"latency"`

趋势类方法会直接返回 `series` 结构，包含 `timestamps`、`values_by_key`、`labels_by_key`、`total` 和 `source_count`。`token_distribution()` 会直接返回 `distribution` 结构，包含可用于饼图的 `pies`。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
models = await self.ctx.statistics.local.models(days=7, limit=5)
token_series = await self.ctx.statistics.local.token_trend(days=7, group_by="model")
message_series = await self.ctx.statistics.local.message_trend(days=7, top_chats=5)

top_model = models[0]["model_name"] if models else "unknown"
```

:::

Manifest 示例：

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

## paths — 运行时路径

::: code-group

```python [Python ~vscode-icons:file-type-python~]
data_path = self.ctx.paths.data_dir / "records.json"
runtime_path = self.ctx.paths.runtime_dir / "latest-card.png"
```

:::

`ctx.paths` 提供插件专属的标准目录，避免插件把运行数据写进源码目录或自行拼接 Host 根目录。

- `data_dir`：持久化数据目录，默认对应 `data/plugins/<plugin_id>/`
- `runtime_dir`：运行时临时目录，默认对应 `temp/plugins/<plugin_id>/`

建议把用户设置、插件数据库、小型 JSON 状态等需要跨重启保留的数据写入 `data_dir`；把下载缓存、渲染中间产物、可重建文件写入 `runtime_dir`。`runtime_dir` 不承诺长期保留，插件应能在目录被清理后自动重建必要内容。

路径安全注意事项：

- 不要再使用旧式 `plugins/<plugin>/data` 目录保存新数据。
- 不要把用户输入直接作为文件名；需要写文件时应先做白名单化或映射成插件内部 ID。
- 不要接受绝对路径或包含 `..` 的相对路径作为写入目标；写入位置应始终限制在 `data_dir` 或 `runtime_dir` 下。

## logger — 日志

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 方式一：通过 ctx.logger（名称自动为 plugin.<plugin_id>）
logger = self.ctx.logger
logger.info("插件已启动")
logger.error(f"请求失败: {err}", exc_info=True)

# 方式二：直接用 stdlib logging（同样会被自动传输）
import logging
logger = logging.getLogger(__name__)
logger.warning("配置缺失，使用默认值")
```

:::

`self.ctx.logger` 是标准 `logging.Logger`，名称为 `plugin.<plugin_id>`。支持所有标准方法：`debug()`、`info()`、`warning()`、`error()`、`critical()`。

::: tip 日志自动转发
Runner 进程中的日志会自动通过 IPC 传输到主进程，无需额外配置。在主进程日志中可以找到插件输出的所有日志。
:::

> **注意**：旧版的 `await self.ctx.logging.info(...)` 异步 API 已移除。请改用上述标准 `logging` 写法。
