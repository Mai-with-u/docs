---
title: Tool Component
---

# Tool Component

`@Tool` is the most core component type in the MaiBot plugin system. It allows plugins to expose callable tool functions to the LLM, enabling the LLM to proactively call external capabilities during the reasoning process—such as searching knowledge bases, querying databases, calling external APIs, etc.

::: tip Tool vs Action
`@Action` is a legacy decorator that the SDK automatically converts into an `@Tool` declaration. New plugins should use `@Tool` directly and avoid `@Action`. See [Action Component (Legacy)](actions.md) for details.
:::

## Decorator Signature

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

### Argument Descriptions

- **`name`** `str` — Tool name, must be unique within the plugin. The LLM calls the tool via this name.
- **`description`** `str` — Alternative tool description. Used when `brief_description` is empty.
- **`brief_description`** `str` — Primary tool description (preferred). A summary of the tool description sent to the LLM to help it decide whether it needs to call it.
- **`detailed_description`** `str` — Detailed description, which can include parameter usage instructions, notes, etc. The SDK automatically merges the parameter Schema to generate a complete description.
- **`parameters`** `list | dict | None` — Tool parameter definitions, supporting two formats (see below).
- **`core_tool`** `bool` — Optional, passed through `**metadata`, defaults to `False`. With `True` the tool enters the core tool list and is directly visible to the LLM on every turn (equivalent to `visibility="visible"` when `visibility` is not set explicitly); with the default `False` it goes into the deferred pool and only appears in later turns after the model discovers it through tool search. More core tools mean a higher model selection cost, so reserve `True` for high-frequency, low-risk tools.

Description field conventions:
- `description`: Description of the tool, including usage methods, scenarios, and notes. When `brief_description` is empty, `description` serves as the fallback description.
- `brief_description`: A brief description used by the main program or small models to quickly determine "what this tool does".
- `detailed_description`: A detailed description of parameters, required items, optional items, and invocation constraints.

## Parameter Definition

### Method 1: Structured Parameters (Recommended)

Use an `ToolParameterInfo` list to declare parameters; the SDK automatically generates a JSON Schema:

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

### Method 2: dict parameters (Compatible with legacy declarations)

Pass a dictionary in JSON Schema style directly:

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

## ToolParameterInfo Fields

- **`name`** `str` — Parameter name
- **`param_type`** `ToolParamType` — Parameter type enum
- **`description`** `str` — Parameter description
- **`required`** `bool` · Default `True` — Whether required
- **`enum_values`** `list | None` — List of optional enum values
- **`default`** `Any` — Default value
- **`items_schema`** `dict | None` — Array element Schema (used when `param_type=ARRAY` is set)
- **`properties`** `dict | None` — Object property definitions (used when `param_type=OBJECT` is set)
- **`required_properties`** `list[str]` — Required fields within the object
- **`additional_properties`** `bool | dict | None` — Whether extra fields are allowed

## ToolParamType Enum

- **`STRING`** → JSON Schema `string` — String
- **`INTEGER`** → JSON Schema `integer` — Integer
- **`NUMBER`** → JSON Schema `number` — Number (integer or float)
- **`FLOAT`** → JSON Schema `number` — Float (equivalent to NUMBER)
- **`BOOLEAN`** → JSON Schema `boolean` — Boolean
- **`ARRAY`** → JSON Schema `array` — Array
- **`OBJECT`** → JSON Schema `object` — Object

## Handler Functions

Tool handlers are asynchronous methods on the plugin class that receive keyword arguments corresponding to parameter names and `**kwargs`:

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

### Return Value

The return value of a Tool handler is returned to the LLM as the tool execution result. The return value can be:

- `dict`: Recommended, as the LLM can understand structured data
- `str`: Simple text result
- Other serializable values

The LLM decides the next step based on the return value (e.g., replying to the user, calling other tools, etc.).

When returning a `dict`, you may also include the boolean field **`stop_after_execution`** — set it to `true` to request ending the current Planner run after the whole tool batch finishes, and wait for new messages before continuing:

- Takes effect only when the tool **succeeds**; if any successful result in the same batch carries `true`, it applies
- The field must be a boolean; any other type makes this tool call be treated as a failure
- When omitted, it defaults to `false` and behavior is unchanged

::: code-group

```python [Python ~vscode-icons:file-type-python~]
async def handle_shutdown(self, stream_id: str, **kwargs):
    await self.ctx.send.text("本轮操作已完成。", stream_id)
    return {"success": True, "stop_after_execution": True}
```

:::

### Returning Images and Other Media

If a Tool needs to pass an image to Maisaka for further observation or reasoning, do not embed base64 images directly into `content`. It is recommended to return `dict`, placing the text for the LLM to read in `content` and the image itself in `content_items`:

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

You can also use data URLs:

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

Common fields in `content_items` are as follows:

- **`type` / `content_type`** `str` — Content type. Images use `image`; `audio`, `resource_link`, `resource`, and `binary` are also supported
- **`data` / `base64`** `str` — Base64 string of the media binary; for images, prefer this field
- **`uri`** `str` — Media URI. Images may use `data:image/...;base64,...`
- **`mime_type`** `str` — MIME type, e.g. `image/png`, `image/jpeg`, `image/webp`
- **`name`** `str` — File name or display name
- **`description`** `str` — Short description of the media content
- **`metadata`** `dict` — Extra metadata

Maisaka splits this kind of return into two context messages: the first is still a plain-text Tool Result containing a media index such as `tool_result:<tool_call_id>:1`; a normal user message is then appended, carrying the same index and the real image component. This keeps compatibility with model APIs that do not support returning images directly inside a tool result, while letting models with vision input observe the image as an ordinary image message.

::: tip View logic
In the LLM input and Prompt preview, the extracted image follows the normal `ImageComponent` display logic and looks basically the same as a real received image message. The difference is that its source is marked as `tool_result_media`, and its message ID is the tool media index, so it is not treated as a platform message actually sent by the user.
:::

### Common Extra Arguments in `kwargs`

- **`stream_id`** `str` — Current chat stream ID, usable for sending messages with `ctx.send.text()` and similar
- **`message`** `dict` — The original message that triggered this tool call

::: tip stream_id
`stream_id` is one of the most important arguments of a Tool component — it identifies the current conversation stream. Use `ctx.send.text("message", stream_id)` to send a message into the matching chat stream.
:::

## Description Generation Rules

The SDK automatically generates the complete description for a tool, with the following priority:

1. **`brief_description`**: used first (if provided)
2. **`description`**: fallback (used when `brief_description` is empty)
3. **`detailed_description`**: if provided, the SDK merges it with the parameter Schema to generate the complete description
4. **Auto-generated**: if none of the fields above are provided, the SDK uses `"工具 {name}"` as the description

The auto-generated parameter description has this format:
   ```
   参数说明：
   - query：string，必填。搜索关键词
   - limit：integer，可选。返回结果数量上限。默认值：5
   ```

## Complete Example

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

## Relationship with Legacy Action

The `@Action` decorator is deprecated in SDK 2.0 and is internally converted into an `@Tool` declaration:

- `action_parameters` → converted into the Tool `parameters` Schema (all parameter types are normalized to `string`)
- `activation_type` / `activation_keywords` → kept as Tool `metadata`
- Using `@Action` raises a `DeprecationWarning`

New plugins should use `@Tool` directly to benefit from richer parameter type support and more standard Schema generation.

## Verify and Troubleshoot

**Verification** — have the LLM call the tool once in chat (a tool in the deferred pool must be found with `tool_search` first): the readable text you prepared appears in the Tool Result, arguments arrive at the handler as declared, and the return value is parsed — the whole Tool chain works.

- **Arguments never reach the handler, or invocation raises `TypeError`** — each `ToolParameterInfo.name` must match a named parameter of the handler (declare `limit` if you list it, or keep `**kwargs` as a fallback), and types must line up with `ToolParamType`: `ARRAY` needs `items_schema`, `OBJECT` uses `properties` / `required_properties`. Otherwise the generated JSON Schema and the function signature disagree.
- **The tool is registered but the model never sees it** — with no `visibility` set, `core_tool` defaults to `False`, so the tool goes into the deferred pool and the model must find it with `tool_search` before it appears in later turns; set `core_tool=True` (equivalent to `visibility="visible"` when `visibility` is not set) only for high-frequency, low-risk tools, since more core tools make model selection more expensive.
- **The model gets no readable result** — for a `dict` return, the Host takes `content` (falling back to `message`) as the text for the LLM; with only custom fields such as `{"results": [...]}`, `content` is empty, the Tool Result carries no readable conclusion, and the model easily misjudges it. Put the conclusion text in `content` and keep structured data in your own fields.
- **The tool is treated as failed** — `stop_after_execution` must be a boolean; returning `"true"` or `1` makes that invocation count as a failure, and only `true` on a successful result has any effect, since the field is ignored when `success` is `False`.
- **Images never reach the model's context** — do not stuff base64 into `content`; return media through `content_items` (`type: "image"` with `data` or `uri`, plus a correct `mime_type`). Otherwise the model sees only a lump of plain text, or the item fails to parse because a field is invalid.
