---
title: API Component
---

# API Component

The `@API` decorator is used to declare API interfaces for inter-plugin communication. Other plugins can call these APIs through `ctx.api.call()`, enabling functional interoperability between plugins.

## Decorator Signature

```python
from maibot_sdk import API

@API(
    name: str,                  # API name (required)
    description: str = "",      # API description
    version: str = "1",         # API version
    public: bool = False,       # Whether to allow other plugins to call
    **metadata,                 # Additional metadata
)
```

## Parameter Description

### name

Unique identifier name for the API. Duplicate API names are not allowed within the same plugin. Other plugins locate and call APIs through `plugin ID + API name`.

### public

| Value | Behavior |
|----|------|
| `False` (default) | Only visible within the plugin, other plugins cannot call |
| `True` | Public API, other plugins can call through `ctx.api.call()` |

### version

API version number, defaults to `"1"`. Used for API version management, can increment version number when incompatible updates are needed.

## Static API Example

Declare APIs directly on the plugin class using the `@API` decorator:

```python
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

## Dynamic API Registration

In addition to using the `@API` decorator for static declaration, APIs can also be registered and unregistered dynamically at runtime. Dynamic APIs are suitable for scenarios where APIs need to be exposed based on configuration or runtime conditions.

### Dynamic API Methods

| Method | Description |
|------|------|
| `self.register_dynamic_api(name, handler, *, description, version, public, handler_name, **metadata)` | Register dynamic API |
| `self.unregister_dynamic_api(name, *, version="1")` | Unregister dynamic API |
| `self.clear_dynamic_apis()` | Clear all dynamic APIs |
| `await self.sync_dynamic_apis(*, offline_reason="Dynamic API offline")` | Sync dynamic APIs to main program |

### Dynamic Registration Example

```python
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field
from typing import Any


class DynamicApiPlugin(MaiBotPlugin):
    class MyConfig(PluginConfigBase):
        enable_translate: bool = Field(default=False, description="Whether to enable translation API")

    config_model = MyConfig

    async def on_load(self) -> None:
        # Dynamically register APIs based on configuration
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

        # Sync dynamic APIs to main program
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

### Dynamic Unregistration Example

```python
class ManagedApiPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        # Batch registration
        for name, handler in [("api_a", self._a), ("api_b", self._b)]:
            self.register_dynamic_api(name, handler, public=True)
        await self.sync_dynamic_apis()

    async def disable_api_b(self) -> None:
        # Unregister single API
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

## Calling Other Plugins' APIs

Query and call other plugins' public APIs through the `self.ctx.api` proxy.

### ctx.api Methods

| Method | Description |
|------|------|
| `await self.ctx.api.call(plugin_id, api_name, **kwargs)` | Call other plugin's API |
| `await self.ctx.api.get(plugin_id, api_name)` | Get API information |
| `await self.ctx.api.list()` | List all available APIs |
| `await self.ctx.api.replace_dynamic_apis(components, offline_reason="...")` | Replace dynamic APIs |

### Calling Example

```python
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
        detailed_description="Parameter description:\n- text: string, required. Text to be translated.",
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
        # Call other plugin's translation API
        result = await self.ctx.api.call(
            "com.example.translate",   # Target plugin ID
            "translate",                # API name
            text=text,
            target_lang="en",
        )
        return result
```

### Query API Information

```python
# Get detailed information of specific API
api_info = await self.ctx.api.get("com.example.translate", "translate")
self.ctx.logger.info("API info: %s", api_info)
```

## API Design Recommendations

### Naming Conventions

- Use lowercase letters and underscores: `render_html`, `get_stats`
- Start with verbs: `get_`, `render_`, `detect_`, `translate_`
- Avoid overly generic names, should reflect functional meaning

### Version Management

- Use `"1"` for initial version
- Increment version number for incompatible updates
- Multiple versions of the same name API can coexist

### Parameter Design

- API processor methods receive `**kwargs`, extract parameters from it
- Required parameters should be explicitly declared as positional parameters
- Return values should be serializable dictionaries

## Static API vs Dynamic API Comparison

| Feature | Static @API | Dynamic register_dynamic_api() |
|------|-----------|---------------------------|
| Declaration Timing | At class definition | At runtime (usually in on_load) |
| Conditional Exposure | Not supported | Can be decided dynamically based on configuration |
| Unregistration | Not supported | Can be dynamically unregistered via unregister |
| Synchronization | Automatic | Requires calling sync_dynamic_apis() |
| Use Cases | Fixed APIs | APIs that need to be enabled/disabled on demand |