---
title: Tool 组件
---

# Tool 组件

`@Tool` 是 MaiBot 插件系统中最核心的组件类型。它允许插件向 LLM 暴露可调用的工具函数，使 LLM 能够在推理过程中主动调用外部能力——例如搜索知识库、查询数据库、调用外部 API 等。

::: tip Tool vs Action
`@Action` 是旧版装饰器，SDK 内部会自动将其转换为 `@Tool` 声明。新插件应直接使用 `@Tool`，不再使用 `@Action`。详见 [Action 组件（Legacy）](./actions.md)。
:::

## 装饰器签名

```python
from maibot_sdk import Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType

@Tool(
    name: str,                                              # 工具名称（必填）
    description: str = "",                                  # 兼容参数，等价于 brief_description
    brief_description: str = "",                            # 简要描述，供 LLM 快速判断
    detailed_description: str = "",                         # 详细描述，含参数说明
    parameters: list[ToolParameterInfo] | dict | None = None,  # 参数定义
    **metadata,                                             # 额外元数据
)
```

### 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `str` | 工具名称，需在插件内唯一。LLM 通过此名称调用工具 |
| `description` | `str` | 兼容旧参数，建议直接使用 `brief_description` |
| `brief_description` | `str` | 简要描述。传给 LLM 的工具描述摘要，帮助 LLM 判断是否需要调用 |
| `detailed_description` | `str` | 详细描述。可包含参数使用说明、注意事项等。SDK 会自动合并参数 Schema 生成完整描述 |
| `parameters` | `list \| dict \| None` | 工具参数定义，支持两种格式（见下文） |

## 参数定义

### 方式一：结构化参数（推荐）

使用 `ToolParameterInfo` 列表声明参数，SDK 会自动生成 JSON Schema：

```python
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

### 方式二：dict 参数（兼容旧式声明）

直接传入 JSON Schema 风格的字典：

```python
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

## ToolParameterInfo 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `str` | 参数名称 |
| `param_type` | `ToolParamType` | 参数类型枚举 |
| `description` | `str` | 参数描述 |
| `required` | `bool` | 是否必填，默认 `True` |
| `enum_values` | `list \| None` | 可选枚举值列表 |
| `default` | `Any` | 默认值 |
| `items_schema` | `dict \| None` | 数组元素 Schema（当 `param_type=ARRAY` 时使用） |
| `properties` | `dict \| None` | 对象属性定义（当 `param_type=OBJECT` 时使用） |
| `required_properties` | `list[str]` | 对象内部必填字段 |
| `additional_properties` | `bool \| dict \| None` | 是否允许额外字段 |

## ToolParamType 枚举

| 枚举值 | JSON Schema 类型 | 说明 |
|--------|-----------------|------|
| `STRING` | `string` | 字符串 |
| `INTEGER` | `integer` | 整数 |
| `NUMBER` | `number` | 数字（整数或浮点数） |
| `FLOAT` | `number` | 浮点数（等价于 NUMBER） |
| `BOOLEAN` | `boolean` | 布尔值 |
| `ARRAY` | `array` | 数组 |
| `OBJECT` | `object` | 对象 |

## 处理函数

Tool 处理函数是插件类上的异步方法，接收与参数名对应的具名参数和 `**kwargs`：

```python
@Tool("greet", brief_description="向用户打招呼",
      detailed_description="参数说明：\n- stream_id：string，必填。当前聊天流 ID。",
      parameters=[
          ToolParameterInfo(name="stream_id", param_type=ToolParamType.STRING,
                          description="当前聊天流 ID", required=True),
      ])
async def handle_greet(self, stream_id: str, **kwargs):
    await self.ctx.send.text("你好！", stream_id)
    return {"success": True, "message": "已回复"}
```

### 返回值

Tool 处理函数的返回值会作为工具执行结果返回给 LLM。返回值可以是：

- `dict`：推荐，LLM 可以理解结构化数据
- `str`：简单文本结果
- 其他可序列化的值

LLM 会根据返回值决定下一步操作（如向用户回复、调用其他工具等）。

### kwargs 中常见的额外参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `stream_id` | `str` | 当前聊天流 ID，可用于 `ctx.send.text()` 等发送消息 |
| `message` | `dict` | 触发此工具调用的原始消息 |

::: tip stream_id
`stream_id` 是 Tool 组件中最重要的参数之一，它标识了当前对话流。使用 `ctx.send.text("消息", stream_id)` 可以将消息发送到对应的聊天流中。
:::

## 描述生成规则

SDK 会自动为工具生成完整的描述信息：

1. 如果提供了 `detailed_description`，SDK 会将参数 Schema 的说明追加到 `detailed_description` 末尾
2. 如果仅提供了 `brief_description`（或 `description`），SDK 会基于参数 Schema 自动生成参数说明
3. 自动生成的参数说明格式为：
   ```
   参数说明：
   - query：string，必填。搜索关键词
   - limit：integer，可选。返回结果数量上限。默认值：5
   ```

## 完整示例

```python
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
        brief_description="搜索互联网获取信息",
        detailed_description="使用搜索引擎查找相关信息。返回与关键词最匹配的结果列表。",
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
        brief_description="获取指定城市的天气信息",
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

## 与旧版 Action 的关系

`@Action` 装饰器在 SDK 2.0 中已废弃，内部会自动转换为 `@Tool` 声明：

- `action_parameters` → 转换为 Tool 的 `parameters` Schema（所有参数类型统一为 `string`）
- `activation_type` / `activation_keywords` → 作为 Tool 的 `metadata` 保留
- 使用 `@Action` 时会触发 `DeprecationWarning`

新插件应直接使用 `@Tool`，享受更丰富的参数类型支持和更规范的 Schema 生成。
