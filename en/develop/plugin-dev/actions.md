---
title: Action Component (Legacy)
---

# Action Component (Legacy)

::: danger Deprecated
The `@Action` decorator is deprecated. The SDK internally auto-converts it to a `@Tool` declaration. **New plugins should use [`@Tool`](./tools.md) directly.** Using `@Action` triggers a `DeprecationWarning`.
:::

## Migrating from @Action to @Tool

Core differences between `@Action` and `@Tool`:

| Comparison | `@Action` (Legacy) | `@Tool` (New) |
|------------|-------------------|---------------|
| Parameter types | All `string` | Supports 7 types: `string`, `integer`, `boolean`, `array`, `object`, etc. |
| Parameter declaration | `action_parameters={"key": "description"}` | `parameters=[ToolParameterInfo(...)]` |
| Parameter Schema | No JSON Schema generation | Automatically generates complete JSON Schema |
| Activation method | `activation_type` + `activation_keywords` | Always available (LLM decides when to call) |
| Description mechanism | Single `description` | `brief_description` + `detailed_description` |

### Migration Example

**Old style (@Action):**

```python
from maibot_sdk import MaiBotPlugin, Action

class MyPlugin(MaiBotPlugin):
    @Action(
        "search",
        description="Search the internet for information",
        activation_type="always",
        action_parameters={"query": "Search keywords"},
    )
    async def handle_search(self, query: str, **kwargs):
        results = await self._do_search(query)
        return results
```

**New style (@Tool):**

```python
from maibot_sdk import MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType

class MyPlugin(MaiBotPlugin):
    @Tool(
        "search",
        brief_description="Search the internet for information",
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

## @Action Decorator Signature (Reference)

Below is the complete parameter signature of `@Action`, for legacy plugin maintenance reference only:

```python
from maibot_sdk import Action

@Action(
    name: str,                                          # Action name
    description: str = "",                              # Action description
    activation_type: ActivationType = ActivationType.ALWAYS,  # Activation type
    activation_keywords: list[str] | None = None,       # Activation keywords
    activation_probability: float = 1.0,                # Random activation probability
    chat_mode: ChatMode = ChatMode.NORMAL,              # Chat mode
    action_parameters: dict[str, Any] | None = None,    # Parameter definition
    action_require: list[str] | None = None,            # Usage requirements
    associated_types: list[str] | None = None,          # Associated message types
    parallel_action: bool = False,                      # Whether parallel execution is allowed
    action_prompt: str = "",                            # LLM prompt
    **metadata,
)
```

### ActivationType Enum

| Enum Value | Description |
|------------|-------------|
| `NEVER` | Never activate |
| `ALWAYS` | Always as candidate tool |
| `RANDOM` | Randomly enable with certain probability |
| `KEYWORD` | Enable when message contains keywords |

### ChatMode Enum

| Enum Value | Description |
|------------|-------------|
| `FOCUS` | Focus mode |
| `NORMAL` | Normal mode |
| `PRIORITY` | Priority mode |
| `ALL` | All modes |

## Internal Conversion Mechanism

The SDK internally converts all `@Action` parameters to `@Tool`-equivalent metadata:

- `action_parameters` → converted to Tool parameter Schema (all field types become `string`)
- `activation_type` / `activation_keywords` / `activation_probability` / `chat_mode` → saved as `legacy_action` marker fields in Tool `metadata`
- `action_require` / `associated_types` / `action_prompt` → merged into Tool's `detailed_description`
- `invoke_method` is fixed as `"plugin.invoke_action"` (for legacy call path compatibility)

After conversion, the Host side maintains only one Tool abstraction, no longer distinguishing between Action and Tool call flows.
