---
title: API Components
---

# API Component

`@API` decorator is used to declare API interfaces for inter-plugin communication. Other plugins can call these APIs through `ctx.api.call()` to achieve functional interoperability between plugins.

## Decorator Signature

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import API

@API(
    name: str,                  # API name (required)
    description: str = "",      # API description
    version: str = "1",         # API version
    public: bool = False,       # Whether to allow other plugins to call
    **metadata,                 # Additional metadata
)
```

:::

## Parameter Description

### name

The unique identifier name of the API. There cannot be duplicate API names within the same plugin. Other plugins use `插件 ID + API 名称` to locate and call it.

### public

- **`False`** (default) — Only visible within the plugin, cannot be called by other plugins
- **`True`** — Public API, can be called by other plugins via `ctx.api.call()`

### version

API version number, defaults to `"1"`. Used for API version management; the version number can be incremented when incompatible updates are needed.

## Static API Example

Directly declare APIs on the plugin class using the `@API` decorator:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, API


class RenderPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        self.ctx.logger.info("Render plugin loaded")

    async def on_unload(self) -> None:
        self.ctx.logger.info("Render plugin unloaded")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @API(
        "render_html",
        description="Render HTML to image",
        version="1",
        public=True,
    )
    async def handle_render_html(self, html: str, **kwargs):
        # Call rendering capability
        result = await self.ctx.render.html2png(html)
        return {"success": True, "image_path": result}

    @API(
        "get_stats",
        description="Get rendering statistics",
        version="1",
        public=True,
    )
    async def handle_get_stats(self, **kwargs):
        return {
            "total_renders": 42,
            "avg_time_ms": 150,
        }
```

:::

## Dynamic API Registration

In addition to statically declaring APIs using the `@API` decorator, you can also dynamically register and unregister APIs at runtime. Dynamic APIs are suitable for scenarios where you need to decide whether to expose an API based on configuration or runtime conditions.

### Dynamic API Methods

- `self.register_dynamic_api(name, handler, *, description, version, public, handler_name, **metadata)` — Register a dynamic API
- `self.unregister_dynamic_api(name, *, version="1")` — Unregister a dynamic API
- `self.clear_dynamic_apis()` — Clear all dynamic APIs
- `await self.sync_dynamic_apis(*, offline_reason="动态 API 已下线")` — Sync dynamic APIs to the main program

### Dynamic Registration Example

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field
from typing import Any


class DynamicApiPlugin(MaiBotPlugin):
    class MyConfig(PluginConfigBase):
        enable_translate: bool = Field(default=False, description="Whether to enable the translation API")

    config_model = MyConfig

    async def on_load(self) -> None:
        # Dynamically register API based on configuration
        if self.config.enable_translate:
            self.register_dynamic_api(
                "translate",
                self._handle_translate,
                description="Text translation",
                version="1",
                public=True,
                handler_name="handle_translate",
            )

            self.register_dynamic_api(
                "detect_language",
                self._handle_detect_language,
                description="Language detection",
                version="1",
                public=True,
            )

        # Sync dynamic APIs to the main program
        await self.sync_dynamic_apis()
        self.ctx.logger.info("Dynamic APIs synced")

    async def on_unload(self) -> None:
        # Clear and sync offline
        self.clear_dynamic_apis()
        await self.sync_dynamic_apis(offline_reason="Plugin unloaded")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    async def _handle_translate(self, text: str, target_lang: str = "en", **kwargs) -> dict[str, Any]:
        # Translation logic
        return {"translated": f"[translated {text} to {target_lang}]"}

    async def _handle_detect_language(self, text: str, **kwargs) -> dict[str, Any]:
        # Language detection logic
        return {"language": "zh", "confidence": 0.95}
```

:::

### Dynamic Unregistration Example

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class ManagedApiPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        # Batch register
        for name, handler in [("api_a", self._a), ("api_b", self._b)]:
            self.register_dynamic_api(name, handler, public=True)
        await self.sync_dynamic_apis()

    async def disable_api_b(self) -> None:
        # Unregister a single API
        self.unregister_dynamic_api("api_b")
        await self.sync_dynamic_apis(offline_reason="API B disabled")

    async def on_unload(self) -> None:
        self.clear_dynamic_apis()
        await self.sync_dynamic_apis(offline_reason="Plugin unloaded")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    async def _a(self, **kwargs):
        return {"result": "a"}

    async def _b(self, **kwargs):
        return {"result": "b"}
```

:::

## Calling Other Plugins' APIs

You can query and call public APIs of other plugins through the `self.ctx.api` proxy.

### ctx.api Methods

- `await self.ctx.api.call(api_name, *, version="", **kwargs)` — Call another plugin's API
- `await self.ctx.api.get(api_name, *, version="")` — Get API information
- `await self.ctx.api.list()` — List all available APIs
- `await self.ctx.api.replace_dynamic_apis(components, offline_reason="...")` — Replace a dynamic API

### Call Example

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType


class CallerPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        # List all available APIs
        apis = await self.ctx.api.list()
        self.ctx.logger.info("Available APIs: %s", apis)

    async def on_unload(self) -> None:
        pass

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @Tool(
        "translate_text",
        brief_description="Translate text",
        detailed_description="Parameter description:\n- text: string, required. The text to be translated.",
        parameters=[
            ToolParameterInfo(
                name="text",
                param_type=ToolParamType.STRING,
                description="Text to be translated",
                required=True,
            ),
        ],
    )
    async def handle_translate(self, text: str, **kwargs):
        # Call another plugin's translation API
        result = await self.ctx.api.call(
            "com.example.translate.translate",
            text=text,
            target_lang="en",
        )
        return result
```

:::

### Querying API Information

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Get detailed information of a specific API
api_info = await self.ctx.api.get("com.example.translate.translate")
self.ctx.logger.info("API info: %s", api_info)
```

:::

## API Design Recommendations

### Naming Conventions

- Use lowercase letters and underscores: `render_html`, `get_stats`
- Start with a verb: `get_`, `render_`, `detect_`, `translate_`
- Avoid overly generic names; they should reflect functional meaning

### Version Management

- Use `"1"` for the initial version
- Increment the version number for incompatible updates
- Multiple versions of an API with the same name can exist simultaneously

### Parameter Design

- API handler methods receive `**kwargs`, from which parameters are extracted
- Required parameters should be explicitly declared as positional parameters
- Return values should be serializable dictionaries

## Static API vs Dynamic API Comparison

- **Declaration timing**: `@API` At class definition → `register_dynamic_api()` At runtime (usually in on_load)
- **Conditional exposure**: `@API` Not supported → `register_dynamic_api()` Can be decided dynamically based on configuration
- **Unregistration**: `@API` Not supported → `register_dynamic_api()` Can be dynamically unregistered via unregister
- **Synchronization**: `@API` Automatic → `register_dynamic_api()` Requires calling sync_dynamic_apis()
- **Applicable scenarios**: `@API` Fixed APIs → `register_dynamic_api()` APIs enabled/disabled on demand
