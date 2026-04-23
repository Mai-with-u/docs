---
title: 配置管理
---

# 配置管理

MaiBot 插件支持声明式的配置管理机制，通过 `PluginConfigBase` 和 `Field` 定义强类型配置模型，Runner 会自动生成默认配置、补齐缺失字段，并向 WebUI 暴露可渲染的配置 Schema。

## 配置文件位置

每个插件的配置文件位于插件目录下的 `config.toml`：

```
my_plugin/
├── plugin.py          # 插件入口
├── config.toml        # 插件配置（可选）
└── _manifest.json     # 插件元信息
```

::: tip config.toml vs _manifest.json
- `config.toml`：插件的**运行时配置**（功能开关、参数等），由插件自身读取
- `_manifest.json`：插件的**元信息**（ID、版本、依赖等），由 Host 校验和管理

两者用途完全不同，不要混淆。
:::

## PluginConfigBase 配置模型

### 基本用法

```python
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field


class MyPluginConfig(PluginConfigBase):
    """插件完整配置"""
    __ui_label__ = "插件配置"

    enabled: bool = Field(default=True, description="是否启用插件")
    greeting: str = Field(default="你好！", description="默认问候语")
    max_retries: int = Field(default=3, description="最大重试次数")


class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # 通过 self.config 访问强类型配置
        self.ctx.logger.info("当前问候语: %s", self.config.greeting)
        self.ctx.logger.info("最大重试: %d", self.config.max_retries)
```

### 嵌套配置

通过嵌套 `PluginConfigBase` 类实现分组配置：

```python
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field


class PluginSection(PluginConfigBase):
    """插件基础配置"""
    __ui_label__ = "基础设置"

    enabled: bool = Field(default=True, description="是否启用插件")
    greeting: str = Field(default="你好！", description="默认问候语")


class AdvancedSection(PluginConfigBase):
    """高级配置"""
    __ui_label__ = "高级设置"

    max_retries: int = Field(default=3, description="最大重试次数")
    timeout: float = Field(default=30.0, description="超时时间（秒）")


class MyPluginConfig(PluginConfigBase):
    """插件完整配置"""
    plugin: PluginSection = Field(default_factory=PluginSection)
    advanced: AdvancedSection = Field(default_factory=AdvancedSection)


class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # 访问嵌套配置
        self.ctx.logger.info("问候语: %s", self.config.plugin.greeting)
        self.ctx.logger.info("超时: %s", self.config.advanced.timeout)
```

## Field 字段

`Field` 用于声明配置字段的元数据：

```python
from maibot_sdk import Field

Field(
    default=...,          # 默认值
    default_factory=...,   # 默认值工厂函数（用于可变默认值）
    description="...",     # 字段描述（显示在 WebUI 中）
)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `default` | `Any` | 字段默认值 |
| `default_factory` | `Callable` | 默认值工厂函数，用于 `list`、`dict`、嵌套 `PluginConfigBase` 等可变类型 |
| `description` | `str` | 字段描述，WebUI 中显示为表单标签 |

### __ui_label__

`PluginConfigBase` 子类可通过 `__ui_label__` 类属性设置在 WebUI 中显示的分组标题：

```python
class PluginSection(PluginConfigBase):
    __ui_label__ = "基础设置"  # WebUI 中显示的标题
    enabled: bool = Field(default=True, description="是否启用插件")
```

## 访问配置

### 强类型访问（self.config）

```python
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # 强类型访问，有代码补全和类型检查
        greeting = self.config.plugin.greeting
        timeout = self.config.advanced.timeout
```

::: warning 注意
- 未声明 `config_model` 时调用 `self.config` 会抛出 `RuntimeError`
- 配置尚未注入时调用 `self.config` 也会抛出 `RuntimeError`
:::

### 原始字典访问

```python
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # 获取原始配置字典
        raw = self.get_plugin_config_data()
        greeting = raw.get("plugin", {}).get("greeting", "默认值")
```

`get_plugin_config_data()` 始终可用，返回 `dict[str, Any]`，无需声明 `config_model`。

## 配置热重载

当 `config.toml` 文件变更时，Runner 会自动触发 `on_config_update()` 回调：

```python
from maibot_sdk import MaiBotPlugin, CONFIG_RELOAD_SCOPE_SELF

class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        if scope == CONFIG_RELOAD_SCOPE_SELF:
            # self.config 会自动更新为最新值
            self.ctx.logger.info("配置已更新，新问候语: %s", self.config.plugin.greeting)
```

::: important
`self.config` 在 `on_config_update(scope="self")` 调用时已自动更新，无需手动重新读取。
:::

更多关于配置热重载的内容，参见 [生命周期](./lifecycle.md#on-config-update)。

## config.toml 格式

配置文件使用 TOML 格式，与 `PluginConfigBase` 的嵌套结构对应：

```toml
[plugin]
config_version = "1.0.0"
enabled = true
greeting = "你好！"

[advanced]
max_retries = 3
timeout = 30.0
```

### config_version

`config_version` 是一个特殊字段，用于跟踪配置版本。Runner 在合并默认配置时会保留此字段。

## 默认配置与 Schema 生成

### 自动补齐

当 `config.toml` 中缺少某些字段时，Runner 会根据 `config_model` 的默认值自动补齐：

```python
# 如果 config.toml 只有:
# [plugin]
# enabled = false

# Runner 会自动补齐 greeting 和 advanced 部分的默认值
```

### WebUI Schema

声明 `config_model` 后，Runner 会自动生成 WebUI 可渲染的配置 Schema：

```python
# 插件类上的方法（通常不需要手动调用）
schema = MyPlugin.build_config_schema(
    plugin_id="com.example.my-plugin",
    plugin_name="我的插件",
    plugin_version="1.0.0",
)
```

WebUI 会根据 Schema 渲染配置表单，用户可以在浏览器中直接编辑配置。

## 通过 API 读取配置

除了通过 `self.config` 和 `self.get_plugin_config_data()` 外，还可以通过能力代理读取配置：

```python
# 读取插件自身配置
value = await self.ctx.config.get("plugin.greeting")

# 读取其他插件配置
value = await self.ctx.config.get_plugin("com.other.plugin")

# 读取全局 Bot 配置
all_config = await self.ctx.config.get_all()
```

## 不使用 config_model

如果插件配置非常简单，可以不声明 `config_model`，直接使用 `ctx.config` 和 `get_plugin_config_data()`：

```python
class SimplePlugin(MaiBotPlugin):
    # 不声明 config_model

    async def on_load(self) -> None:
        # 只能通过原始字典或 ctx.config 读取
        raw = self.get_plugin_config_data()
        name = raw.get("name", "默认名称")

        # self.config 会抛出 RuntimeError
        # 不要调用 self.config
```

但建议始终使用 `config_model`，以获得更好的类型安全和 WebUI 集成体验。
