---
title: Action Component (Legacy)
---
# Action Component (Legacy)

::: danger Deprecated
The `@Action` decorator is deprecated. The SDK will automatically convert it internally to a `@Tool` declaration. **New plugins should directly use [`@Tool`](./tools.md)**. Using `@Action` will trigger a `DeprecationWarning`.
:::

## Migrating from @Action to @Tool

The core differences between `@Action` and `@Tool`:

- **Parameter Types**: `@Action` uses only `string` → `@Tool` supports 7 types: `string`, `integer`, `boolean`, `array`, `object`, etc.
- **Parameter Declaration**: `action_parameters={"key": "description"}` → `parameters=[ToolParameterInfo(...)]`
- **Parameter Schema**: No JSON Schema generation → Automatic generation of a complete JSON Schema
- **Activation Method**: `activation_type` + `activation_keywords` → Always available (LLM decides when to invoke)
- **Description Mechanism**: Single `description` → `brief_description` + `detailed_description`

### Migration Example

**Old Syntax (@Action):**

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, Action

class MyPlugin(MaiBotPlugin):
    @Action(
        "search",
        description="Search the internet to retrieve information",
        activation_type="always",
        action_parameters={"query": "Search keywords"},
    )
    async def handle_search(self, query: str, **kwargs):
        results = await self._do_search(query)
        return results
```

:::

**New Syntax (@Tool):**

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType

class MyPlugin(MaiBotPlugin):
    @Tool(
        "search",
        brief_description="Search the internet to retrieve information",
        parameters=[
            ToolParameterInfo(
                name="query",
                param_type=ToolParamType.STRING,
                description="Search keywords",
                required=True,
            ),
        ],
    )
    async def handle_search(self, query: str, **kwargs):
        results = await self._do_search(query)
        return {"results": results}
```

:::

## @Action Decorator Signature (Reference)

The following is the complete parameter signature for `@Action`, provided for reference when maintaining legacy plugins:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import Action

@Action(
    name: str,                                          # Action name
    description: str = "",                              # Action description
    activation_type: ActivationType = ActivationType.ALWAYS,  # Activation type
    activation_keywords: list[str] | None = None,       # Activation keywords
    activation_probability: float = 1.0,                # Random activation probability
    chat_mode: ChatMode = ChatMode.NORMAL,              # Chat mode
    action_parameters: dict[str, Any] | None = None,    # Parameter definitions
    action_require: list[str] | None = None,            # Usage requirements
    associated_types: list[str] | None = None,          # Associated message types
    parallel_action: bool = False,                      # Whether parallel execution is allowed
    action_prompt: str = "",                            # LLM prompt
    **metadata,
)
```

:::

### ActivationType Enum

- **`NEVER`** — Never activated
- **`ALWAYS`** — Always available as a candidate tool
- **`RANDOM`** — Randomly enabled with a certain probability
- **`KEYWORD`** — Enabled when the message contains specific keywords

### ChatMode Enum

- **`FOCUS`** — Focus mode
- **`NORMAL`** — Normal mode
- **`PRIORITY`** — Priority mode
- **`ALL`** — All modes

## Internal Conversion Mechanism

The SDK internally converts all parameters of `@Action` into equivalent metadata for `@Tool`:

- `action_parameters` → Converted to Tool parameter Schema (all fields are of type `string`)
- `activation_type` / `activation_keywords` / `activation_probability` / `chat_mode` → Saved as `legacy_action` marker fields within the Tool `metadata`
- `action_require` / `associated_types` / `action_prompt` → Merged into the Tool's `detailed_description`
- `invoke_method` is fixed to `"plugin.invoke_action"` (for compatibility with legacy invocation paths)

After conversion, the Host side maintains a single Tool abstraction, no longer distinguishing between Action and Tool invocation flows.