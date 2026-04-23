---
title: Configuration
---

# Configuration

MaiBot plugins support a declarative configuration management mechanism. Through `PluginConfigBase` and `Field`, you define strongly-typed configuration models. The Runner automatically generates default configuration, fills in missing fields, and exposes a renderable configuration Schema to the WebUI.

## Configuration File Location

Each plugin's configuration file is located at `config.toml` under the plugin directory:

```
my_plugin/
├── plugin.py          # Plugin entry
├── config.toml        # Plugin configuration (optional)
└── _manifest.json     # Plugin metadata
```

::: tip config.toml vs _manifest.json
- `config.toml`: Plugin's **runtime configuration** (feature toggles, parameters, etc.), read by the plugin itself
- `_manifest.json`: Plugin's **metadata** (ID, version, dependencies, etc.), validated and managed by Host

These serve completely different purposes — do not confuse them.
:::

## PluginConfigBase Configuration Model

### Basic Usage

```python
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field


class MyPluginConfig(PluginConfigBase):
    """Plugin complete configuration"""
    __ui_label__ = "Plugin Config"

    enabled: bool = Field(default=True, description="Whether to enable the plugin")
    greeting: str = Field(default="Hello!", description="Default greeting")
    max_retries: int = Field(default=3, description="Maximum retry count")


class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # Access strongly-typed config via self.config
        self.ctx.logger.info("Current greeting: %s", self.config.greeting)
        self.ctx.logger.info("Max retries: %d", self.config.max_retries)
```

### Nested Configuration

Implement grouped configuration by nesting `PluginConfigBase` classes:

```python
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field


class PluginSection(PluginConfigBase):
    """Plugin basic configuration"""
    __ui_label__ = "Basic Settings"

    enabled: bool = Field(default=True, description="Whether to enable the plugin")
    greeting: str = Field(default="Hello!", description="Default greeting")


class AdvancedSection(PluginConfigBase):
    """Advanced configuration"""
    __ui_label__ = "Advanced Settings"

    max_retries: int = Field(default=3, description="Maximum retry count")
    timeout: float = Field(default=30.0, description="Timeout (seconds)")


class MyPluginConfig(PluginConfigBase):
    """Plugin complete configuration"""
    plugin: PluginSection = Field(default_factory=PluginSection)
    advanced: AdvancedSection = Field(default_factory=AdvancedSection)


class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # Access nested configuration
        self.ctx.logger.info("Greeting: %s", self.config.plugin.greeting)
        self.ctx.logger.info("Timeout: %s", self.config.advanced.timeout)
```

## Field

`Field` is used to declare metadata for configuration fields:

```python
from maibot_sdk import Field

Field(
    default=...,          # Default value
    default_factory=...,   # Default value factory function (for mutable defaults)
    description="...",     # Field description (displayed in WebUI)
)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `default` | `Any` | Field default value |
| `default_factory` | `Callable` | Default value factory function, used for mutable types like `list`, `dict`, nested `PluginConfigBase` |
| `description` | `str` | Field description, displayed as form label in WebUI |

### __ui_label__

`PluginConfigBase` subclasses can set the group title displayed in WebUI through the `__ui_label__` class attribute:

```python
class PluginSection(PluginConfigBase):
    __ui_label__ = "Basic Settings"  # Title displayed in WebUI
    enabled: bool = Field(default=True, description="Whether to enable the plugin")
```

## Accessing Configuration

### Strongly-typed Access (self.config)

```python
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # Strongly-typed access with code completion and type checking
        greeting = self.config.plugin.greeting
        timeout = self.config.advanced.timeout
```

::: warning Note
- Calling `self.config` without declaring `config_model` raises `RuntimeError`
- Calling `self.config` before configuration is injected also raises `RuntimeError`
:::

### Raw Dict Access

```python
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # Get raw configuration dictionary
        raw = self.get_plugin_config_data()
        greeting = raw.get("plugin", {}).get("greeting", "default value")
```

`get_plugin_config_data()` is always available and returns `dict[str, Any]`. No need to declare `config_model`.

## Configuration Hot-reload

When the `config.toml` file changes, the Runner automatically triggers the `on_config_update()` callback:

```python
from maibot_sdk import MaiBotPlugin, CONFIG_RELOAD_SCOPE_SELF

class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        if scope == CONFIG_RELOAD_SCOPE_SELF:
            # self.config is automatically updated to the latest value
            self.ctx.logger.info("Config updated, new greeting: %s", self.config.plugin.greeting)
```

::: important
`self.config` is automatically updated when `on_config_update(scope="self")` is called. No need to manually re-read.
:::

For more about configuration hot-reload, see [Lifecycle](./lifecycle.md#on-config-update).

## config.toml Format

Configuration files use TOML format, corresponding to `PluginConfigBase` nesting structure:

```toml
[plugin]
config_version = "1.0.0"
enabled = true
greeting = "Hello!"

[advanced]
max_retries = 3
timeout = 30.0
```

### config_version

`config_version` is a special field used to track configuration version. The Runner preserves this field when merging default configuration.

## Default Configuration and Schema Generation

### Auto-fill

When `config.toml` is missing certain fields, the Runner auto-fills them based on `config_model` defaults:

```python
# If config.toml only has:
# [plugin]
# enabled = false

# Runner will automatically fill in greeting and advanced section defaults
```

### WebUI Schema

After declaring `config_model`, the Runner automatically generates a WebUI-renderable configuration Schema:

```python
# Method on the plugin class (usually no need to call manually)
schema = MyPlugin.build_config_schema(
    plugin_id="com.example.my-plugin",
    plugin_name="My Plugin",
    plugin_version="1.0.0",
)
```

The WebUI renders configuration forms based on the Schema. Users can edit configuration directly in the browser.

## Reading Configuration via API

In addition to `self.config` and `self.get_plugin_config_data()`, you can also read configuration through capability proxies:

```python
# Read plugin's own configuration
value = await self.ctx.config.get("plugin.greeting")

# Read another plugin's configuration
value = await self.ctx.config.get_plugin("com.other.plugin")

# Read global Bot configuration
all_config = await self.ctx.config.get_all()
```

## Not Using config_model

If the plugin configuration is very simple, you can skip declaring `config_model` and use `ctx.config` and `get_plugin_config_data()` directly:

```python
class SimplePlugin(MaiBotPlugin):
    # No config_model declared

    async def on_load(self) -> None:
        # Can only read through raw dict or ctx.config
        raw = self.get_plugin_config_data()
        name = raw.get("name", "default name")

        # self.config will raise RuntimeError
        # Do not call self.config
```

However, it is recommended to always use `config_model` for better type safety and WebUI integration.
