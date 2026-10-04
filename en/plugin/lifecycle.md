---
title: Lifecycle
---
# Lifecycle

MaiBot plugins have three lifecycle methods: `on_load()`, `on_unload()`, and `on_config_update()`. The SDK enforces that all plugins implement these three methods; otherwise, the Runner will refuse to load the plugin.

## create_plugin() Factory Function

Each plugin's `plugin.py` must export a top-level `create_plugin()` function that returns the plugin instance:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin


class MyPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        ...

    async def on_unload(self) -> None:
        ...

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        ...


def create_plugin():
    return MyPlugin()
```

:::

When the Runner loads a plugin:

1. Import the `plugin.py` module
2. Call `create_plugin()` to obtain the plugin instance
3. Inject `PluginContext` (at this point `self.ctx` is available)
4. Call `on_load()`

## on_load()

Callback after the plugin has finished loading. The Runner calls this method **after** injecting the `PluginContext` and completing capability bootstrap, so all capability proxies of `self.ctx` can be used directly within `on_load()`.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
async def on_load(self) -> None:
    """Called after plugin loaded. Initialize resources here.

    Runner has already injected PluginContext before calling this,
    so self.ctx is available.
    """
```

:::

**Typical use cases:**

- Initialize internal plugin state
- Call `self.ctx.gateway.update_state()` to report the message gateway status
- Call `self.register_dynamic_api()` to register dynamic APIs and `await self.sync_dynamic_apis()`
- Read configuration and initialize resources

**Example:**

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field


class MyConfig(PluginConfigBase):
    greeting: str = Field(default="Hello!", description="Default greeting")


class MyPlugin(MaiBotPlugin):
    config_model = MyConfig

    async def on_load(self) -> None:
        # self.ctx has already been injected and can be used directly
        self.ctx.logger.info("Plugin loaded, current greeting: %s", self.config.greeting)

        # Dynamic APIs can be registered here
        self.register_dynamic_api(
            "my_api",
            self._handle_api,
            description="Example API",
            version="1",
            public=True,
        )
        await self.sync_dynamic_apis()

    async def _handle_api(self, **kwargs):
        return {"status": "ok"}
```

:::

## on_unload()

Callback before plugin unload. Release all resources held by the plugin in this method.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
async def on_unload(self) -> None:
    """Called before plugin unloaded. Cleanup resources."""
```

:::

**Typical use cases:**

- Close network connections, file handles
- Report gateway offline status (`self.ctx.gateway.update_state(..., ready=False)`)
- Unregister dynamic APIs
- Save persistent data

**Example:**

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPlugin(MaiBotPlugin):
    async def on_unload(self) -> None:
        self.ctx.logger.info("Plugin is unloading")

        # Report message gateway offline
        await self.ctx.gateway.update_state(
            gateway_name="my_gateway",
            ready=False,
        )

        # Clear dynamic APIs
        self.clear_dynamic_apis()
        await self.sync_dynamic_apis(offline_reason="Plugin has been unloaded")
```

:::

::: warning Note
`self.ctx` can still be used within `on_unload()`, but cleanup should be completed as quickly as possible. Do not perform time-consuming operations.
:::

## on_config_update()

Configuration hot-reload callback. The Runner calls this method when the plugin configuration or any subscribed global configuration changes.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
async def on_config_update(
    self,
    scope: str,
    config_data: dict[str, Any],
    version: str,
) -> None:
    """Called when config hot-reloads.

    Args:
        scope: Configuration change scope, with possible values "self", "bot", or "model".
        config_data: Latest configuration data corresponding to the current scope.
        version: Configuration version number.
    """
```

:::

### scope values

- **`"self"`** → `CONFIG_RELOAD_SCOPE_SELF` — Plugin's own configuration. Always triggered when `config.toml` in the plugin directory changes; no subscription required.
- **`"bot"`** → `ON_BOT_CONFIG_RELOAD` — Global Bot configuration. Requires subscription via `config_reload_subscriptions`.
- **`"model"`** → `ON_MODEL_CONFIG_RELOAD` — LLM model configuration. Requires subscription via `config_reload_subscriptions`.

::: info
- The callback for `scope == "self"` is **always triggered** and does not require additional subscription.
- `scope == "bot"` and `scope == "model"` are triggered only if declared in `config_reload_subscriptions`.
:::

### Example

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, CONFIG_RELOAD_SCOPE_SELF, ON_BOT_CONFIG_RELOAD, ON_MODEL_CONFIG_RELOAD
from typing import ClassVar, Iterable


class MyPlugin(MaiBotPlugin):
    # Subscribe to hot-reloads for both bot and model global configurations
    config_reload_subscriptions: ClassVar[Iterable[str]] = ("bot", "model")

    async def on_load(self) -> None:
        self.ctx.logger.info("Plugin loaded")

    async def on_unload(self) -> None:
        self.ctx.logger.info("Plugin unloaded")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        if scope == CONFIG_RELOAD_SCOPE_SELF:
            # Plugin's own configuration changed; self.config is automatically updated
            self.ctx.logger.info("Plugin configuration updated: version=%s", version)
        elif scope == ON_BOT_CONFIG_RELOAD:
            # Global Bot configuration changed
            bot_name = config_data.get("bot_name", "Unknown")
            self.ctx.logger.info("Bot configuration updated: bot_name=%s, version=%s", bot_name, version)
        elif scope == ON_MODEL_CONFIG_RELOAD:
            # LLM model configuration changed
            model_name = config_data.get("model_name", "Unknown")
            self.ctx.logger.info("Model configuration updated: model=%s, version=%s", model_name, version)
```

:::

## config_reload_subscriptions

Class variable declaring the global configuration hot-reload scopes that the plugin needs to subscribe to. Only supports the values `"bot"` and `"model"`:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import ClassVar, Iterable


class MyPlugin(MaiBotPlugin):
    # Subscribe to both global configurations
    config_reload_subscriptions: ClassVar[Iterable[str]] = ("bot", "model")

    # Subscribe only to Bot configuration
    # config_reload_subscriptions: ClassVar[Iterable[str]] = ("bot",)

    # Subscribe only to Model configuration
    # config_reload_subscriptions: ClassVar[Iterable[str]] = ("model",)

    # Do not subscribe to any global configuration (default value)
    # config_reload_subscriptions: ClassVar[Iterable[str]] = ()
```

:::

**Rules:**

- The default value is an empty tuple `()`, meaning no global configurations are subscribed to.
- The `"self"` scope **always triggers** the callback and does not need (nor can it) be declared here.
- Only `"bot"` and `"model"` are valid subscription values.
- Declaring unsupported values will raise a `ValueError` in `get_config_reload_subscriptions()`.
- You cannot pass a string directly (e.g., `config_reload_subscriptions = "bot"`); an iterable collection must be used.

## Complete Lifecycle Example

Below is a complete plugin example that includes all lifecycle methods:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import Any, ClassVar, Iterable

from maibot_sdk import (
    CONFIG_RELOAD_SCOPE_SELF,
    Command,
    MaiBotPlugin,
    ON_BOT_CONFIG_RELOAD,
    ON_MODEL_CONFIG_RELOAD,
    Tool,
)
from maibot_sdk.types import ToolParameterInfo, ToolParamType


class GreeterPlugin(MaiBotPlugin):
    """Greeting Plugin — Demonstrates the complete plugin lifecycle."""

    # Subscribe to global configuration hot reload
    config_reload_subscriptions: ClassVar[Iterable[str]] = ("bot", "model")

    async def on_load(self) -> None:
        """Initialize when the plugin is loaded."""
        self.ctx.logger.info("GreeterPlugin loaded")
        # self.ctx is already available here; you can directly call capability proxies
        raw_config = self.get_plugin_config_data()
        self.ctx.logger.info("Current config: %s", raw_config)

    async def on_unload(self) -> None:
        """Clean up resources when the plugin is unloaded."""
        self.ctx.logger.info("GreeterPlugin is unloading")

    async def on_config_update(self, scope: str, config_data: dict[str, Any], version: str) -> None:
        """Handle configuration hot update."""
        if scope == CONFIG_RELOAD_SCOPE_SELF:
            self.ctx.logger.info("Plugin config updated: version=%s", version)
        elif scope == ON_BOT_CONFIG_RELOAD:
            self.ctx.logger.info("Bot config updated: version=%s", version)
        elif scope == ON_MODEL_CONFIG_RELOAD:
            self.ctx.logger.info("Model config updated: version=%s", version)

    @Tool(
        "greet",
        brief_description="Greet the user",
        detailed_description="Parameter description:\n- stream_id: string, required. The current chat stream ID.",
        parameters=[
            ToolParameterInfo(
                name="stream_id",
                param_type=ToolParamType.STRING,
                description="Current chat stream ID",
                required=True,
            ),
        ],
    )
    async def handle_greet(self, stream_id: str, **kwargs):
        await self.ctx.send.text("Hello!", stream_id)
        return {"success": True, "message": "Replied"}

    @Command("hello", pattern=r"^/hello")
    async def handle_hello(self, **kwargs):
        await self.ctx.send.text("Hello!", kwargs["stream_id"])
        return True, "Hello!", 2


def create_plugin():
    return GreeterPlugin()
```

:::

## Lifecycle Sequence

```mermaid
sequenceDiagram
    participant Runner
    participant Plugin

    Runner->>Plugin: create_plugin()
    Note over Plugin: Returns the plugin instance
    Runner->>Plugin: _set_context(ctx)
    Note over Plugin: Injects PluginContext
    Runner->>Plugin: on_load()
    Note over Plugin: Initializes resources; ctx is available

    Note over Runner,Plugin: ... Plugin is running ...

    Note over Runner: config.toml changed
    Runner->>Plugin: on_config_update(scope="self", ...)

    Note over Runner: Global configuration changed (if subscribed)
    Runner->>Plugin: on_config_update(scope="bot"/"model", ...)

    Note over Runner: Unload or hot reload
    Runner->>Plugin: on_unload()
    Note over Plugin: Cleans up resources
```