---
title: API 参考
---

# API 参考

MaiBot 插件通过 `self.ctx`（`PluginContext`）访问 15 种能力代理。所有调用自动通过 RPC 转发到 Host 处理，SDK 会自动解包结果。

```python
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
self.ctx.logger     # 日志记录（标准 logging.Logger）
```

## send — 消息发送

```python
# 发送文本消息
await self.ctx.send.text(text="你好！", stream_id=stream_id)

# 发送图片消息（base64 编码）
await self.ctx.send.image(image_base64=base64_str, stream_id=stream_id)

# 发送表情（base64 编码）
await self.ctx.send.emoji(emoji_base64=base64_str, stream_id=stream_id)

# 发送混合消息
await self.ctx.send.hybrid(parts=[...], stream_id=stream_id)

# 发送转发消息
await self.ctx.send.forward(messages=[...], stream_id=stream_id)

# 发送自定义类型消息
await self.ctx.send.custom(custom_type="card", data={...}, stream_id=stream_id)
```

所有 `send.*` 方法返回 `bool`，表示是否发送成功。

## db — 数据库操作

```python
# 查询数据
results = await self.ctx.db.query(model_name="my_data", filters={"key": "value"})

# 保存数据
await self.ctx.db.save(model_name="my_data", data={"key": "value", "count": 1})

# 获取单条数据
result = await self.ctx.db.get(model_name="my_data", filters={"key": "value"})

# 删除数据
await self.ctx.db.delete(model_name="my_data", filters={"key": "value"})

# 计数
count = await self.ctx.db.count(model_name="my_data", filters={"status": "active"})
```

## llm — LLM 调用

```python
# 文本生成
result = await self.ctx.llm.generate(prompt="请总结以下内容", model="gpt-4")

# 带工具的文本生成
result = await self.ctx.llm.generate_with_tools(
    prompt="搜索并回答",
    tools=[...],
    model="gpt-4",
)

# 获取可用模型列表
models = await self.ctx.llm.get_available_models()
```

## config — 配置读取

```python
# 读取配置值
value = await self.ctx.config.get("key.subkey")

# 读取插件自身配置
config = await self.ctx.config.get_plugin("com.example.my-plugin")

# 读取所有配置
all_config = await self.ctx.config.get_all()
```

## message — 历史消息

```python
# 获取最近消息
messages = await self.ctx.message.get_recent(stream_id=stream_id, limit=20)

# 按时间获取消息
messages = await self.ctx.message.get_by_time(
    stream_id=stream_id,
    start_time="2024-01-01T00:00:00",
    end_time="2024-01-02T00:00:00",
)

# 统计新消息数
count = await self.ctx.message.count_new(stream_id=stream_id)

# 构建可读文本
text = await self.ctx.message.build_readable(messages=messages)
```

## chat — 聊天流

```python
# 获取所有聊天流
streams = await self.ctx.chat.get_all_streams()

# 获取群组聊天流
streams = await self.ctx.chat.get_group_streams()

# 获取私聊聊天流
streams = await self.ctx.chat.get_private_streams()

# 按 Group ID 获取聊天流
stream = await self.ctx.chat.get_stream_by_group_id(group_id="123456")

# 按用户 ID 获取聊天流
stream = await self.ctx.chat.get_stream_by_user_id(user_id="789012")
```

## person — 用户信息

```python
# 获取用户 ID
person_id = await self.ctx.person.get_id(name="用户名")

# 按名称查找用户 ID
person_id = await self.ctx.person.get_id_by_name(name="张三")

# 获取用户属性值
value = await self.ctx.person.get_value(person_id=person_id, key="nickname")
```

## emoji — 表情包管理

```python
# 获取随机表情
emojis = await self.ctx.emoji.get_random(count=5)

# 按描述搜索表情
emoji = await self.ctx.emoji.get_by_description(description="开心")

# 获取所有表情
all_emojis = await self.ctx.emoji.get_all()

# 获取表情数量
count = await self.ctx.emoji.get_count()

# 获取表情信息
info = await self.ctx.emoji.get_info(emoji_id="emoji_001")

# 获取情绪列表
emotions = await self.ctx.emoji.get_emotions()
```

## frequency — 发言频率

```python
# 获取当前发言频率值
value = await self.ctx.frequency.get_current_talk_value()

# 设置频率调整值
await self.ctx.frequency.set_adjust(value=0.5)

# 获取频率调整值
value = await self.ctx.frequency.get_adjust()
```

## component — 插件与组件管理

```python
# 加载插件
await self.ctx.component.load_plugin(plugin_id="com.example.plugin")

# 卸载插件
await self.ctx.component.unload_plugin(plugin_id="com.example.plugin")

# 重新加载插件
await self.ctx.component.reload_plugin(plugin_id="com.example.plugin")

# 获取所有插件信息
plugins = await self.ctx.component.get_all_plugins()

# 获取单个插件信息
plugin = await self.ctx.component.get_plugin_info(plugin_id="com.example.plugin")

# 列出已加载插件
plugins = await self.ctx.component.list_loaded_plugins()

# 列出已注册插件
plugins = await self.ctx.component.list_registered_plugins()
```

## api — 跨插件 API

```python
# 调用其他插件的 API
result = await self.ctx.api.call(
    plugin_id="com.other.plugin",
    api_name="render_html",
    html="<h1>Hello</h1>",
)

# 获取 API 信息
api_info = await self.ctx.api.get(
    plugin_id="com.other.plugin",
    api_name="render_html",
)

# 列出所有可用 API
apis = await self.ctx.api.list()

# 替换动态 API（由 sync_dynamic_apis 内部调用）
await self.ctx.api.replace_dynamic_apis(
    components=[...],
    offline_reason="动态 API 已下线",
)
```

## gateway — 消息网关

```python
# 注入入站消息到 Host
accepted = await self.ctx.gateway.route_message(
    gateway_name="my_gateway",
    message={...},
    route_metadata={...},
    external_message_id="msg-001",
    dedupe_key="msg-001",
)

# 上报网关状态
await self.ctx.gateway.update_state(
    gateway_name="my_gateway",
    ready=True,
    platform="qq",
    account_id="10001",
    scope="primary",
)
```

详见 [消息网关](./message-gateway.md)。

## tool — 工具定义

```python
# 获取 LLM 工具定义列表
definitions = await self.ctx.tool.get_definitions()
```

## render — HTML 渲染

```python
# 将 HTML 渲染为 PNG 图片
result = await self.ctx.render.html2png(html="<h1>Hello</h1><p>World</p>")
```

`html2png()` 返回渲染结果，适合卡片、榜单或分享图等需要图片化输出的场景。

## knowledge — 知识库搜索

```python
# 搜索 LPMM 知识库
content = await self.ctx.knowledge.search(query="MaiBot 配置方法")
```

## logger — 日志

```python
# 标准日志接口，Logger 名称为 "plugin.<plugin_id>"
self.ctx.logger.info("插件已启动")
self.ctx.logger.warning("配置缺失，使用默认值")
self.ctx.logger.error("出错了", exc_info=True)
self.ctx.logger.debug("调试信息: %s", data)
```

::: tip 日志自动转发
Runner 进程中的日志会自动通过 IPC 传输到主进程，无需额外配置。在主进程日志中可以找到插件输出的所有日志。
:::
