---
title: Configuration Management
---

# Configuration Management

MaiBot plugins support a declarative configuration management mechanism. By defining strongly-typed configuration models through `PluginConfigBase` and `Field`, the Runner automatically generates default configurations, fills in missing fields, and exposes renderable configuration schemas to the WebUI.

## Configuration Generation and Storage

In `plugin.py`, a plugin uses `config_model` to declare its configuration structure, defaults, and WebUI metadata. When the Runner first loads the plugin, it generates the WebUI Schema and creates the runtime `config.toml` in the installed plugin directory. When fields are added to the configuration model, the Runner fills them into the existing configuration with their model defaults.

The plugin source repository uses `config_model` as its configuration definition, and `.gitignore` should include `/config.toml`. Values changed through WebUI or runtime configuration APIs are stored in `config.toml` under the installed plugin directory.

::: tip Responsibilities of configuration-related files
- `config_model` in `plugin.py`: Defines the configuration structure, types, defaults, and WebUI presentation metadata
- `config.toml`: Stores the current installation's runtime configuration and is generated and maintained by the Runner
- `_manifest.json`: Declares the plugin ID, version, dependencies, and capabilities and is validated and managed by the Host
:::

## PluginConfigBase Configuration Model

### Basic Usage

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field


class MyPluginConfig(PluginConfigBase):
    """Plugin complete configuration"""
    __ui_label__ = "Plugin Configuration"

    enabled: bool = Field(default=True, description="Whether to enable the plugin")
    greeting: str = Field(default="Hello!", description="Default greeting")
    max_retries: int = Field(default=3, description="Maximum number of retries")


class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # Access strongly-typed configuration via self.config
        self.ctx.logger.info("Current greeting: %s", self.config.greeting)
        self.ctx.logger.info("Max retries: %d", self.config.max_retries)
```

:::

### Nested Configuration

Implement grouped configuration by nesting `PluginConfigBase` classes:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field


class PluginSection(PluginConfigBase):
    """Plugin basic configuration"""
    __ui_label__ = "Basic Settings"

    enabled: bool = Field(default=True, description="Whether to enable the plugin")
    greeting: str = Field(default="Hello!", description="Default greeting")


class AdvancedSection(PluginConfigBase):
    """Advanced configuration"""
    __ui_label__ = "Advanced Settings"

    max_retries: int = Field(default=3, description="Maximum number of retries")
    timeout: float = Field(default=30.0, description="Timeout duration (seconds)")


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

:::

## Field

`Field` is used to declare metadata for configuration fields:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import Field

Field(
    default=...,          # Default value
    default_factory=...,   # Default value factory function (for mutable default values)
    description="...",     # Field description (displayed in WebUI)
)
```

:::

- **`default`** `Any` — Field default value
- **`default_factory`** `Callable` — Default value factory function, used for mutable types like `list`, `dict`, nested `PluginConfigBase`, etc.
- **`description`** `str` — Field description, displayed as a form label in the WebUI
- **`json_schema_extra`** `dict` — Additional metadata passed to the WebUI Schema generator. Common keys: `placeholder` (input box placeholder text), `group` (UI grouping hint)

### __ui_label__

`PluginConfigBase` subclasses can set the group title displayed in the WebUI via the `__ui_label__` class attribute:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class PluginSection(PluginConfigBase):
    __ui_label__ = "Basic Settings"  # Title displayed in WebUI
    enabled: bool = Field(default=True, description="Whether to enable the plugin")
```

:::

### __ui_icon__

`PluginConfigBase` subclasses can set the group icon displayed in the WebUI via the `__ui_icon__` class attribute, accepting [Material Icons](https://fonts.google.com/icons) icon names:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class PluginSection(PluginConfigBase):
    __ui_label__ = "Basic Settings"
    __ui_icon__ = "settings"  # Material Icons icon name displayed in WebUI
    enabled: bool = Field(default=True, description="Whether to enable the plugin")
```

:::

### __ui_order__

`PluginConfigBase` subclasses can set the display order of groups in the WebUI via the `__ui_order__` class attribute. Lower values appear first:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class PluginSection(PluginConfigBase):
    __ui_label__ = "Basic Settings"
    __ui_icon__ = "settings"
    __ui_order__ = 0  # Sorting weight for the group in WebUI; lower numbers appear first
    enabled: bool = Field(default=True, description="Whether to enable the plugin")
```

:::

### json_schema_extra

`json_schema_extra` is used to pass additional metadata to the WebUI Schema generator. Common use cases include:

- `placeholder`: Placeholder hint text for the input box
- `group`: Configuration grouping hint in the WebUI

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPluginConfig(PluginConfigBase):
    """Plugin complete configuration"""
    greeting: str = Field(
        default="Hello!",
        description="Default greeting",
        json_schema_extra={"placeholder": "Please enter a greeting", "group": "basic"}
    )
    api_key: str = Field(
        default="",
        description="API Key",
        json_schema_extra={"placeholder": "Please enter API Key", "group": "advanced"}
    )
```

:::

## Accessing Configuration

### Strongly-Typed Access (self.config)

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # Strongly-typed access, with code completion and type checking
        greeting = self.config.plugin.greeting
        timeout = self.config.advanced.timeout
```

:::

::: warning Note
- Calling `self.config` without declaring `config_model` will raise `RuntimeError`
- Calling `self.config` before the configuration is injected will also raise `RuntimeError`
:::

### Raw Dictionary Access

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # Get raw configuration dictionary
        raw = self.get_plugin_config_data()
        greeting = raw.get("plugin", {}).get("greeting", "Default value")
```

:::

`get_plugin_config_data()` is always available, returns `dict[str, Any]`, and does not require declaring `config_model`.

## Configuration Hot Reload

When the `config.toml` file changes, the Runner automatically triggers the `on_config_update()` callback:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, CONFIG_RELOAD_SCOPE_SELF

class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        if scope == CONFIG_RELOAD_SCOPE_SELF:
            # self.config is automatically updated to the latest value
            self.ctx.logger.info("Configuration updated, new greeting: %s", self.config.plugin.greeting)
```

:::

::: info
`self.config` is automatically updated when `on_config_update(scope="self")` is called, so there is no need to manually re-read it.
:::

For more on configuration hot reloading, see [Lifecycle](./lifecycle.md#on-config-update).

## config.toml Format

The configuration file uses the TOML format, corresponding to the nested structure of `PluginConfigBase`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
config_version = "1.0.0"
enabled = true
greeting = "Hello!"

[advanced]
max_retries = 3
timeout = 30.0
```

:::

### config_version

`config_version` is a special field used to track the configuration version. The Runner preserves this field when merging default configurations.

## Default Configuration and Schema Generation

### Auto-Fill

When certain fields are missing in `config.toml`, the Runner automatically fills them based on the default values of `config_model`:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# If config.toml only has:
# [plugin]
# enabled = false

# The Runner will automatically fill in the default values for the greeting and advanced sections
```

:::

### WebUI Schema

After declaring `config_model`, the Runner automatically generates a WebUI-renderable configuration Schema:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Method on the plugin class (usually does not need to be called manually)
schema = MyPlugin.build_config_schema(
    plugin_id="com.example.my-plugin",
    plugin_name="My Plugin",
    plugin_version="1.0.0",
)
```

:::

The WebUI renders a configuration form based on the Schema, allowing users to edit the configuration directly in the browser.

## Reading Configuration via API

In addition to using `self.config` and `self.get_plugin_config_data()`, you can also read configuration through the capability proxy:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# Read the plugin's own configuration
value = await self.ctx.config.get("plugin.greeting")

# Read other plugin's configuration
value = await self.ctx.config.get_plugin("com.other.plugin")

# Read global Bot configuration
all_config = await self.ctx.config.get_all()
```

:::

## Not Using config_model

If the plugin configuration is very simple, you can omit declaring `config_model` and directly use `ctx.config` and `get_plugin_config_data()`:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class SimplePlugin(MaiBotPlugin):
    # Do not declare config_model

    async def on_load(self) -> None:
        # Can only read via raw dictionary or ctx.config
        raw = self.get_plugin_config_data()
        name = raw.get("name", "Default Name")

        # self.config will raise a RuntimeError
        # Do not call self.config
```

:::

However, it is recommended to always use `config_model` for better type safety and WebUI integration.
