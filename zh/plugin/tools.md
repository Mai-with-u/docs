---
title: Tool 组件
---

# Tool 组件

`@Tool` 是 MaiBot 插件系统中最核心的组件类型。它允许插件向 LLM 暴露可调用的工具函数，使 LLM 能够在推理过程中主动调用外部能力——例如搜索知识库、查询数据库、调用外部 API 等。

::: tip Tool vs Action
`@Action` 是旧版装饰器，SDK 内部会自动将其转换为 `@Tool` 声明。新插件应直接使用 `@Tool`，不再使用 `@Action`。详见 [Action 组件（Legacy）](./actions.md)。
:::

## 装饰器签名

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType

@Tool(
    name: str,                                              # 工具名称（必填）
    description: str = "",                                  # 工具描述，作为备选描述字段
    brief_description: str = "",                            # 简要描述，优先级高于 description
    detailed_description: str = "",                         # 详细描述，可包含参数说明等
    parameters: list[ToolParameterInfo] | dict | None = None,  # 参数定义
    **metadata,                                             # 额外元数据
)
```

:::

### 参数说明

- **`name`** `str` — 工具名称，需在插件内唯一。LLM 通过此名称调用工具
- **`description`** `str` — 工具备选描述。当 `brief_description` 为空时使用此字段
- **`brief_description`** `str` — 工具主描述（优先使用）。传给 LLM 的工具描述摘要，帮助 LLM 判断是否需要调用
- **`detailed_description`** `str` — 详细描述，可包含参数使用说明、注意事项等。SDK 会自动合并参数 Schema 生成完整描述
- **`parameters`** `list | dict | None` — 工具参数定义，支持两种格式（见下文）

描述字段约定：
- `description`：关于工具的描述，包括使用方法，使用情景，注意事项。当 `brief_description` 为空时，`description` 会作为回退描述。
- `brief_description`：给主程序或小模型快速判断"这个工具是做什么的"的简要描述
- `detailed_description`：描述参数、必填项、可选项和调用约束的详细描述

## 参数定义

### 方式一：结构化参数（推荐）

使用 `ToolParameterInfo` 列表声明参数，SDK 会自动生成 JSON Schema：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import Tool, MaiBotPlugin
from maibot_sdk.types import ToolParameterInfo, ToolParamType

class MyPlugin(MaiBotPlugin):
    @Tool(
        "search",
        brief_description="搜索互联网获取信息",
        detailed_description="使用搜索引擎查找相关信息。参数说明：\n- query：string，必填。搜索关键词。\n- limit：integer，可选。返回结果数量上限。",
        parameters=[
            ToolParameterInfo(
                name="query",
                param_type=ToolParamType.STRING,
                description="搜索关键词",
                required=True,
            ),
            ToolParameterInfo(
                name="limit",
                param_type=ToolParamType.INTEGER,
                description="返回结果数量上限",
                required=False,
                default=5,
            ),
        ],
    )
    async def handle_search(self, query: str, limit: int = 5, **kwargs):
        results = await self._do_search(query, limit)
        return {"results": results}
```

:::

### 方式二：dict 参数（兼容旧式声明）

直接传入 JSON Schema 风格的字典：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPlugin(MaiBotPlugin):
    @Tool(
        "search",
        brief_description="搜索互联网获取信息",
        parameters={
            "query": {"type": "string", "description": "搜索关键词"},
            "limit": {"type": "integer", "description": "返回结果数量上限", "default": 5},
        },
    )
    async def handle_search(self, query: str, limit: int = 5, **kwargs):
        results = await self._do_search(query, limit)
        return {"results": results}
```

:::

## ToolParameterInfo 字段

- **`name`** `str` — 参数名称
- **`param_type`** `ToolParamType` — 参数类型枚举
- **`description`** `str` — 参数描述
- **`required`** `bool` · 默认 `True` — 是否必填
- **`enum_values`** `list | None` — 可选枚举值列表
- **`default`** `Any` — 默认值
- **`items_schema`** `dict | None` — 数组元素 Schema（当 `param_type=ARRAY` 时使用）
- **`properties`** `dict | None` — 对象属性定义（当 `param_type=OBJECT` 时使用）
- **`required_properties`** `list[str]` — 对象内部必填字段
- **`additional_properties`** `bool | dict | None` — 是否允许额外字段

## ToolParamType 枚举

- **`STRING`** → JSON Schema `string` — 字符串
- **`INTEGER`** → JSON Schema `integer` — 整数
- **`NUMBER`** → JSON Schema `number` — 数字（整数或浮点数）
- **`FLOAT`** → JSON Schema `number` — 浮点数（等价于 NUMBER）
- **`BOOLEAN`** → JSON Schema `boolean` — 布尔值
- **`ARRAY`** → JSON Schema `array` — 数组
- **`OBJECT`** → JSON Schema `object` — 对象

## 处理函数

Tool 处理函数是插件类上的异步方法，接收与参数名对应的具名参数和 `**kwargs`：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
@Tool("greet", description="向用户打招呼",
      parameters=[
          ToolParameterInfo(name="stream_id", param_type=ToolParamType.STRING,
                          description="当前聊天流 ID", required=True),
      ])
async def handle_greet(self, stream_id: str, **kwargs):
    await self.ctx.send.text("你好！", stream_id)
    return {"success": True, "message": "已回复"}
```

:::

### 返回值

Tool 处理函数的返回值会作为工具执行结果返回给 LLM。返回值可以是：

- `dict`：推荐，LLM 可以理解结构化数据
- `str`：简单文本结果
- 其他可序列化的值

LLM 会根据返回值决定下一步操作（如向用户回复、调用其他工具等）。

返回 `dict` 时还可携带布尔字段 **`stop_after_execution`** —— 置为 `true` 表示请求在当前工具批次全部执行完成后结束本轮 Planner，等待新消息再继续：

- 仅当工具**执行成功**时生效；同一批次内任意一个成功结果携带 `true` 即生效
- 该字段必须为布尔值，返回其他类型会导致这次工具调用按失败处理
- 缺省（不返回该字段）时视为 `false`，行为不变

::: code-group

```python [Python ~vscode-icons:file-type-python~]
async def handle_shutdown(self, stream_id: str, **kwargs):
    await self.ctx.send.text("本轮操作已完成。", stream_id)
    return {"success": True, "stop_after_execution": True}
```

:::

### 返回图片和其他媒体

如果 Tool 需要把图片交给 Maisaka 继续观察或推理，不要把图片 base64 直接塞进 `content`。推荐返回 `dict`，将给 LLM 阅读的文字放在 `content`，将图片本体放在 `content_items`：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from base64 import b64encode


async def handle_draw(self, prompt: str, **kwargs):
    image_bytes = await self._draw_image(prompt)

    return {
        "success": True,
        "content": "图片已生成，请查看索引对应的图片内容。",
        "content_items": [
            {
                "type": "image",
                "data": b64encode(image_bytes).decode("ascii"),
                "mime_type": "image/png",
                "name": "result.png",
                "description": "根据提示词生成的图片",
            }
        ],
    }
```

:::

也可以使用 data URL：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
return {
    "success": True,
    "content": "图片已生成。",
    "content_items": [
        {
            "type": "image",
            "uri": f"data:image/png;base64,{b64encode(image_bytes).decode('ascii')}",
            "mime_type": "image/png",
            "name": "result.png",
        }
    ],
}
```

:::

`content_items` 中常用字段如下：

- **`type` / `content_type`** `str` — 内容类型。图片使用 `image`；也支持 `audio`、`resource_link`、`resource`、`binary`
- **`data` / `base64`** `str` — 媒体二进制的 base64 字符串，推荐图片直接使用这个字段
- **`uri`** `str` — 媒体 URI。图片可使用 `data:image/...;base64,...`
- **`mime_type`** `str` — MIME 类型，例如 `image/png`、`image/jpeg`、`image/webp`
- **`name`** `str` — 文件名或展示名称
- **`description`** `str` — 对媒体内容的简短说明
- **`metadata`** `dict` — 额外元数据

Maisaka 会把这类返回拆成两种上下文消息：第一条仍是纯文本 Tool Result，其中包含类似 `tool_result:<tool_call_id>:1` 的媒体索引；随后追加一条普通 user message，里面放入同一索引和真实图片组件。这样可以兼容不支持在 tool result 中直接回传图片的模型 API，同时让支持视觉输入的模型按普通图片消息观察图片。

::: tip 视图逻辑
拆出来的图片在 LLM 输入和 Prompt 预览里会走普通 `ImageComponent` 的展示逻辑，和真实收到的图片消息基本一致。区别是它的来源会标记为 `tool_result_media`，消息 ID 是工具媒体索引，不会被当作真实用户发来的平台消息。
:::

### kwargs 中常见的额外参数

- **`stream_id`** `str` — 当前聊天流 ID，可用于 `ctx.send.text()` 等发送消息
- **`message`** `dict` — 触发此工具调用的原始消息

::: tip stream_id
`stream_id` 是 Tool 组件中最重要的参数之一，它标识了当前对话流。使用 `ctx.send.text("消息", stream_id)` 可以将消息发送到对应的聊天流中。
:::

## 描述生成规则

SDK 会自动为工具生成完整的描述信息，优先级如下：

1. **`brief_description`**：优先使用（如果提供）
2. **`description`**：降级回退（`brief_description` 为空时使用）
3. **`detailed_description`**：如果提供了，SDK 会将其与参数 Schema 合并生成完整描述
4. **自动生成**：如果上述字段都未提供，SDK 会使用 `"工具 {name}"` 作为描述

自动生成的参数说明格式为：
   ```
   参数说明：
   - query：string，必填。搜索关键词
   - limit：integer，可选。返回结果数量上限。默认值：5
   ```

## 完整示例

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import Any

from maibot_sdk import MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType


class SearchPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        self.ctx.logger.info("搜索插件已加载")

    async def on_unload(self) -> None:
        pass

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @Tool(
        "search_web",
        description="搜索互联网获取信息",
        parameters=[
            ToolParameterInfo(
                name="query",
                param_type=ToolParamType.STRING,
                description="搜索关键词",
                required=True,
            ),
            ToolParameterInfo(
                name="limit",
                param_type=ToolParamType.INTEGER,
                description="返回结果数量上限",
                required=False,
                default=5,
            ),
        ],
    )
    async def search(self, query: str, limit: int = 5, **kwargs):
        """搜索互联网"""
        results = await self._do_search(query, limit)
        return {"results": results, "count": len(results)}

    @Tool(
        "get_weather",
        description="获取指定城市的天气信息",
        parameters=[
            ToolParameterInfo(
                name="city",
                param_type=ToolParamType.STRING,
                description="城市名称",
                required=True,
            ),
        ],
    )
    async def get_weather(self, city: str, **kwargs):
        """查询天气"""
        weather = await self._fetch_weather(city)
        return {"city": city, "weather": weather}

    async def _do_search(self, query: str, limit: int) -> list:
        # 实际搜索逻辑
        return []

    async def _fetch_weather(self, city: str) -> dict:
        # 实际天气查询逻辑
        return {}


def create_plugin():
    return SearchPlugin()
```

:::

## 与旧版 Action 的关系

`@Action` 装饰器在 SDK 2.0 中已废弃，内部会自动转换为 `@Tool` 声明：

- `action_parameters` → 转换为 Tool 的 `parameters` Schema（所有参数类型统一为 `string`）
- `activation_type` / `activation_keywords` → 作为 Tool 的 `metadata` 保留
- 使用 `@Action` 时会触发 `DeprecationWarning`

新插件应直接使用 `@Tool`，享受更丰富的参数类型支持和更规范的 Schema 生成。
