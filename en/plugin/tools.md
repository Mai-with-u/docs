---
title: Tool Component
---

# Tool Component

`@Tool` is the most core component type in the MaiBot plugin system. It allows plugins to expose callabled tool functions to the LLM, enabling the LLM to proactively call external capabilities during the reasoning process—such as searching knowledge bases, querying databases, calling external APIs, etc.

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

- **`type` / `content_type`** `str` — Content type. Images use `image`; `audio` and `resource_link` are also supported.
- **`resource`** `binary` — The image body
- **`data`** `base64` — The text for the LLM to read
- **`str`** `uri` — MIME type
- **`str`** `data:image/...;base64,...` — Image URI
- **`mime_type`** `str` — Description of parameters and call constraints
- **`image/png`** `image/jpeg` — Display name
- **`image/webp`** `name` — Description metadata
- **`str`** `description` — Tool parameter description
- **`str`** `metadata` — Tool usage scenario
- **`dict`** `tool_result:<tool_call_id>:1` — Tool notes
