---
title: API 参考
---

# API 参考

MaiBot 插件通过 `self.ctx`（`PluginContext`）访问 23 种能力代理。所有能力调用自动通过 RPC 转发到 Host 处理，SDK 会自动解包结果；`ctx.paths` 与 `ctx.logger` 是 Runner 注入的上下文辅助对象。

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
self.ctx.webui      # WebUI 上传凭证领取
self.ctx.files      # 文件收发与读取
self.ctx.web        # 联网搜索与网页读取
self.ctx.internal_chat  # 内部聊天（桌宠与网页共用会话）
self.ctx.personality    # 全局人设查询与切换
self.ctx.desktop_pet    # 桌宠控制、动画与扩展按钮

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

**返回值**：默认情况下所有 `send.*` 方法返回 `bool`，表示是否发送成功。传入 `return_details=True` 时，返回包含平台确认的最终消息 ID 的详细结果，便于后续引用（如撤回）：

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

注意：这里的 `model_name` 必须是 Host 侧 `src.common.database.database_model` 中存在的模型类名，例如 `"ChatHistory"`、`"ActionRecord"`。

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

- `await config.get(key, default=None)` — 读取**全局 Bot 配置**（`bot_config.toml`）中的字段，`key` 支持点分割
- `await config.get_plugin(plugin_name=None)` — 获取指定插件的配置，`plugin_name` 省略时为当前插件
- `await config.get_all()` — 获取**当前插件**的全部配置

插件配置的结构和默认值由插件的 `config_model` 定义。Runner 将当前安装实例的值保存在插件目录下自动生成的 `config.toml` 中，`config.get_plugin()` 与 `config.get_all()` 读取的是 Runner 已加载的这份运行时配置；`config.get()` 读的则是 Host 的全局 Bot 配置，与插件自己的 `config.toml` 无关。

`config.get()`、`config.get_plugin()` 和 `config.get_all()` 都会直接返回配置值或配置字典，不需要手动从 RPC 结果中读取 `value` 字段。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 读取全局 Bot 配置中的单个字段
permission = await self.ctx.config.get("plugin.permission", [])

# 读取指定插件的配置（省略参数则为当前插件）
config = await self.ctx.config.get_plugin("com.example.my-plugin")

# 读取当前插件的全部配置
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
- `await chat.get_avatar(platform, target_id, target_type="user", account_id="", scope="", force_refresh=False)` — 查询头像

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

### 头像查询 {#chat-avatar}

在 `_manifest.json` 的 `capabilities` 数组中加入 `chat.get_avatar`，即可查询用户或群头像。`target_type` 为 `user` 或 `group`；多账号或多连接部署通过 `account_id`、`scope` 指定适配器路由。

返回字段：

::: fields
- **`status`** — `available` 表示有头像，`unsupported` 表示适配器或目标类型不支持，`missing` 表示支持查询但目标没有头像。
- **`url`** — `available` 时为当前路由适配器提供的 HTTP(S) 头像源地址，可独立下载；其他状态为 `None`。结果不包含图片字节或 Host 文件路径。
- **`expires_at`** — Host 缓存到期的 Unix 时间戳，单位为秒。
:::

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 查询用户头像；target_type 取 "user" 或 "group"
avatar = await self.ctx.chat.get_avatar(
    platform="qq", target_id="1026294844", target_type="user",
    account_id="", scope="", force_refresh=False,
)
if avatar["status"] == "available":
    url = avatar["url"]              # 适配器提供的头像源地址
    expires_at = avatar["expires_at"]  # Unix 时间戳
```

:::

SDK 与 WebUI 共用 Host 头像缓存：成功结果按适配器有效期缓存，最多 24 小时；`unsupported` / `missing` 缓存 5 分钟。`force_refresh=True` 跳过现有缓存，同一目标的并发刷新合并。查询、协议校验和下载异常通过能力调用暴露，错误不缓存，也不返回过期图片。完整协议、图片限制与刷新规则见[头像接口](/develop/adapters/avatar-api)。

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

# 读取上下文里的图片
image = await self.ctx.maisaka.context.resolve_image(
    stream_id=stream["stream_id"],
    source_id="m123",   # 消息 ID、工具媒体索引或模型看到的短消息编号
    index=0,            # 该消息里的第几张图片，从 0 开始
)
# image["binary_data_base64"] 是 Base64 图片数据，image["binary_hash"] 是图片哈希
```

:::

`maisaka.proactive.trigger()` 把 `intent` 写入 Maisaka 内部上下文并唤醒 Planner，让 Maisaka 基于人格、记忆、当前上下文和可用工具自行决定是否回复以及如何表达。目标聊天流必须已经存在。

`maisaka.context.resolve_image()` 只读取该聊天流**现有**上下文中的图片，不会新建会话或跨聊天流查询。成功时返回包含 `binary_data_base64` 与 `binary_hash` 的图片对象；消息不存在、序号越界、图片数据不可读或超过插件 RPC 单帧上限时会报错。目标聊天流必须已在运行时有实例。

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
- **WebUI 自定义页面绑定的也是 `@API`**，但只限**本插件的静态 API**、`version` 必须与注册值精确匹配、不要求 `public=True`，动态 API 不能被页面绑定。详见 [WebUI 页面](./webui-pages.md)。

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

消息顶层 `platform/account_id/scope` 必须与网关就绪声明一致；`account_id` 为非空字符串，`scope` 没有值时可省略或填写 `None`。入站消息不登记新账号，也不会覆盖网关声明。旧扩展身份字段暂时兼容并打印下个版本移除的 WARNING。

详见 [消息网关](./message-gateway.md#消息归属)。

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

## internal_chat — 内部聊天

网页聊天室与桌宠共用同一条主人会话：平台为 `internal`、用户为 `owner`。插件通过这组能力识别这条会话并代主人发言。需要 SDK 2.17.0+。

- `await internal_chat.identity()` — 返回 `{platform, user_id}`，用于识别这条聊天流及麦麦发给主人的消息
- `await internal_chat.send(text)` — 以主人身份投递一句话（1～2000 字符）；消息记录插件来源，不具备受保护命令权限，可能触发麦麦回复并进入聊天历史

::: code-group

```python [Python ~vscode-icons:file-type-python~]
identity = await self.ctx.internal_chat.identity()
if identity["platform"] == "internal":
    await self.ctx.internal_chat.send("把待办整理一下")
```

:::

Manifest 能力：`internal_chat.identity`、`internal_chat.send`。

## personality — 人设 {#personality}

读取全局人设库并按名称切换，作用于所有会话。需要 SDK 2.20.0+；旧版 SDK 可用 `ctx.call_capability(...)` 调用同名 Host 能力。

- `await personality.list()` — 返回 `{"profiles": [人设对象, ...]}`
- `await personality.get_current()` — 返回当前人设对象；未入库时 `name` 为空字符串
- `await personality.switch(name)` — 按名称精确切换，返回 `{"changed": bool, "current": 人设对象}`；切换保留当前编辑并热重载，尚未入库的当前人设自动以「切换前人设」留档

::: code-group

```python [Python ~vscode-icons:file-type-python~]
available = await self.ctx.personality.list()
current = await self.ctx.personality.get_current()
result = await self.ctx.personality.switch("温柔的麦麦")
```

:::

人设对象含 `name`、`personality`、`behavior_style`、`reply_style`、`group_chat_prompt`、`private_chat_prompts`、`multiple_reply_style`、`multiple_probability`。切换到当前名称返回 `changed: false`；未知人设、缺授权或热重载失败都会抛出能力调用异常。Manifest 能力：`personality.list`、`personality.get_current`、`personality.switch`。

## desktop_pet — 桌宠

控制内置桌宠并在扩展菜单里提供按钮。需要 SDK 2.17.0+（控制）、2.18.0+（动画）、2.21+（按钮）；旧版 SDK 可用 `ctx.call_capability(...)`。所有方法都要求 manifest 声明同名 `desktop_pet.*` 能力。

- `await desktop_pet.status()` — 返回 `enabled`、`supported`、`running`、`ready`、`visible`、`error`
- `await desktop_pet.show()` / `hide()` — 显示或隐藏窗口；隐藏不退出进程，`show()` 不会绕过用户的启用开关
- `await desktop_pet.say(text)` — 显示 1～2000 字符气泡提示；不进入聊天记录、不触发模型调用
- `await desktop_pet.set_thinking(active)` — 开启或结束思考动画
- `await desktop_pet.refresh_buttons()` — 请求刷新扩展按钮状态

::: code-group

```python [Python ~vscode-icons:file-type-python~]
state = await self.ctx.desktop_pet.status()
if state["ready"]:
    await self.ctx.desktop_pet.show()
    await self.ctx.desktop_pet.say("待办已经整理好了")
```

:::

动画接口（SDK 2.18.0+）：`get_skin()`、`list_animations()`、`play_animation(name, repeat=1)`、`play_event(event)`、`stop_animation(playback_id)`、`animation_status(playback_id)`。回执表示窗口确认开始播放；同一插件的新动作替换旧动作，一次调用最多 30 秒。

扩展按钮（SDK 2.21+）：在插件类上声明 `desktop_pet_buttons` 列表（`DesktopPetButton` 或字典，最多 10 个），并实现 `get_desktop_pet_button_states()` 与 `on_desktop_pet_button_click(button_id)` 两个异步方法；回调限时 8 秒。桌宠侧的对应事件见 [Hook 清单](./hooks.md)。

## files — 文件

在宿主派发的工具调用期间读写当前聊天的附件。需要 SDK 2.17.0+，manifest 声明对应的 `files.*` 能力；文件作用域来自真实聊天授权，不能靠提交 `session_id` 选择聊天，定时任务与无聊天上下文的调用会被拒绝。

- `await files.list(offset=0)` — 列出当前聊天的文件
- `await files.read_text(file_ref, offset=0, limit=12000, encoding="utf-8-sig")` — 分页读取文本
- `await files.download(file_ref)` — 返回文件信息与下载 URL，独占创建本地目标文件并校验大小和哈希
- `await files.upload(name, mime_type)` — 申请上传票据，本地读取后流式上传
- `await files.send(file_ref)` — 把文件发送到当前聊天；返回 `sent` 或 `unknown`，`unknown` 表示未取得确定回执，需核对聊天，不自动重发

::: code-group

```python [Python ~vscode-icons:file-type-python~]
items = await self.ctx.files.list()
if items:
    text = await self.ctx.files.read_text(items[0]["file_ref"])
```

:::

存储、配额与部署细节见[文件功能](/manual/files)。

## web — 联网

复用统一联网服务的配置与参数校验，为插件提供搜索与网页读取。需要 Host 支持并在 manifest 声明 `web.search` / `web.fetch`；旧版 SDK 用 `ctx.call_capability("web.search", ...)` 调用，返回原始 `{success, result}`。

- `web.search` — 联网搜索，参数与统一联网服务的 `web_search` 工具一致
- `web.fetch` — 网页读取，参数与 `web_fetch` 工具一致

结果为完整结构化数据并附 `service` 与 `retrieved_at`；超过 500000 字符的传输上限会直接报错，请缩小查询范围。联网服务的配置见[模型配置](/manual/configuration/model-config)。

## WebUI 上传领取

`ctx.webui.claim_upload(upload_id)` 将宿主暂存的图片领取到本插件持久化数据目录的 `uploads/`，返回 `path`、`sha256` 和 `upload_id`。需要 SDK 2.11.0+、支持 `image_upload` 能力的宿主，以及 manifest 能力 `webui.claim_upload`。

::: code-group

```python [plugin.py ~vscode-icons:file-type-python~]
from pathlib import Path

claimed = await self.ctx.webui.claim_upload(upload_id)
image_path = Path(claimed["path"])
# 校验、保存或删除图片由插件负责；阻塞文件处理交给工作线程。
```

:::

凭证所属插件必须匹配，一小时过期，只能领取一次。它来自登录保护的 WebUI 上传接口，不接受任意文件路径代替。文件内容不经普通 JSON/RPC 传递。完整页面声明及格式/尺寸限制见[WebUI 页面](./webui-pages.md#图片上传)。

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
