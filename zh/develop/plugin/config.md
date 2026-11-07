---
title: 配置管理
---

# 配置管理

MaiBot 插件支持声明式的配置管理机制，通过 `PluginConfigBase` 和 `Field` 定义强类型配置模型，Runner 会自动生成默认配置、补齐缺失字段，并向 WebUI 暴露可渲染的配置 Schema。

## 配置生成与存储

插件在 `plugin.py` 中通过 `config_model` 声明配置结构、默认值和 WebUI 元数据。Runner 首次加载插件时生成 WebUI Schema，并在已安装插件目录中创建运行时 `config.toml`；配置模型增加字段后，Runner 会用模型默认值补齐现有配置。

插件源码仓库以 `config_model` 为配置定义，`.gitignore` 应包含 `/config.toml`。用户通过 WebUI 或运行时配置接口修改的值保存在安装目录中的 `config.toml`。

::: tip 配置相关文件的职责
- `plugin.py` 中的 `config_model`：定义配置结构、类型、默认值和 WebUI 展示信息
- `config.toml`：保存当前安装实例的运行时配置，由 Runner 生成和维护
- `_manifest.json`：声明插件 ID、版本、依赖和能力，由 Host 校验和管理
:::

## PluginConfigBase 配置模型

### 基本用法

::: code-group

```python [Python ~vscode-icons:file-type-python~]
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

:::

### 嵌套配置

通过嵌套 `PluginConfigBase` 类实现分组配置：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
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

:::

## Field 字段

`Field` 用于声明配置字段的元数据：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import Field

Field(
    default=...,          # 默认值
    default_factory=...,   # 默认值工厂函数（用于可变默认值）
    description="...",     # 字段描述（显示在 WebUI 中）
)
```

:::

- **`default`** `Any` — 字段默认值
- **`default_factory`** `Callable` — 默认值工厂函数，用于 `list`、`dict`、嵌套 `PluginConfigBase` 等可变类型
- **`description`** `str` — 字段描述，WebUI 中显示为表单标签
- **`json_schema_extra`** `dict` — 额外元数据，传递给 WebUI Schema 生成器。常用键: `placeholder`（输入框占位符文本）、`group`（UI 分组提示）

### __ui_label__

`PluginConfigBase` 子类可通过 `__ui_label__` 类属性设置在 WebUI 中显示的分组标题：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class PluginSection(PluginConfigBase):
    __ui_label__ = "基础设置"  # WebUI 中显示的标题
    enabled: bool = Field(default=True, description="是否启用插件")
```

:::

### __ui_icon__

`PluginConfigBase` 子类可通过 `__ui_icon__` 类属性设置在 WebUI 中显示的分组图标，接受 [Material Icons](https://fonts.google.com/icons) 图标名称：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class PluginSection(PluginConfigBase):
    __ui_label__ = "基础设置"
    __ui_icon__ = "settings"  # WebUI 中显示的 Material Icons 图标名
    enabled: bool = Field(default=True, description="是否启用插件")
```

:::

### __ui_order__

`PluginConfigBase` 子类可通过 `__ui_order__` 类属性设置分组在 WebUI 中的显示顺序，数值越小越靠前：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class PluginSection(PluginConfigBase):
    __ui_label__ = "基础设置"
    __ui_icon__ = "settings"
    __ui_order__ = 0  # WebUI 中分组的排序权重，数字越小越靠前
    enabled: bool = Field(default=True, description="是否启用插件")
```

:::

### json_schema_extra

`json_schema_extra` 用于传递额外元数据给 WebUI Schema 生成器，常用场景包括：

- `placeholder`：输入框的占位符提示文本
- `group`：WebUI 中的配置分组提示

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPluginConfig(PluginConfigBase):
    """插件完整配置"""
    greeting: str = Field(
        default="你好！",
        description="默认问候语",
        json_schema_extra={"placeholder": "请输入问候语", "group": "basic"}
    )
    api_key: str = Field(
        default="",
        description="API 密钥",
        json_schema_extra={"placeholder": "请输入 API Key", "group": "advanced"}
    )
```

:::

## 访问配置

### 强类型访问（self.config）

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # 强类型访问，有代码补全和类型检查
        greeting = self.config.plugin.greeting
        timeout = self.config.advanced.timeout
```

:::

::: warning 注意
- 未声明 `config_model` 时调用 `self.config` 会抛出 `RuntimeError`
- 配置尚未注入时调用 `self.config` 也会抛出 `RuntimeError`
:::

### 原始字典访问

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_load(self) -> None:
        # 获取原始配置字典
        raw = self.get_plugin_config_data()
        greeting = raw.get("plugin", {}).get("greeting", "默认值")
```

:::

`get_plugin_config_data()` 始终可用，返回 `dict[str, Any]`，无需声明 `config_model`。

## 配置热重载

当 `config.toml` 文件变更时，Runner 会自动触发 `on_config_update()` 回调：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import MaiBotPlugin, CONFIG_RELOAD_SCOPE_SELF

class MyPlugin(MaiBotPlugin):
    config_model = MyPluginConfig

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        if scope == CONFIG_RELOAD_SCOPE_SELF:
            # self.config 会自动更新为最新值
            self.ctx.logger.info("配置已更新，新问候语: %s", self.config.plugin.greeting)
```

:::

::: info
`self.config` 在 `on_config_update(scope="self")` 调用时已自动更新，无需手动重新读取。
:::

::: tip 配置回调合并
配置热重载在后台**合并下发**。短时间内连续保存时，插件可能只收到一次回调，内容是该 scope 的完整最新配置；保存请求不等待广播完成。
:::

更多关于配置热重载的内容，参见 [生命周期](./lifecycle.md#on-config-update)。

## config.toml 格式

配置文件使用 TOML 格式，与 `PluginConfigBase` 的嵌套结构对应：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
config_version = "1.0.0"
enabled = true
greeting = "你好！"

[advanced]
max_retries = 3
timeout = 30.0
```

:::

### config_version

`config_version` 是一个特殊字段，用于跟踪配置版本。Runner 在合并默认配置时会保留此字段。

## 默认配置与 Schema 生成

### 自动补齐

当 `config.toml` 中缺少某些字段时，Runner 会根据 `config_model` 的默认值自动补齐：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 如果 config.toml 只有:
# [plugin]
# enabled = false

# Runner 会自动补齐 greeting 和 advanced 部分的默认值
```

:::

### WebUI Schema

声明 `config_model` 后，Runner 会自动生成 WebUI 可渲染的配置 Schema：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 插件类上的方法（通常不需要手动调用）
schema = MyPlugin.build_config_schema(
    plugin_id="com.example.my-plugin",
    plugin_name="我的插件",
    plugin_version="1.0.0",
)
```

:::

WebUI 会根据 Schema 渲染配置表单，用户可以在浏览器中直接编辑配置。

## 通过 API 读取配置

除了通过 `self.config` 和 `self.get_plugin_config_data()` 外，还可以通过能力代理读取配置：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# 读取本插件的全部配置
all_config = await self.ctx.config.get_all()

# 读取指定插件的配置（不传 plugin_name 时是当前插件）
plugin_config = await self.ctx.config.get_plugin("com.other.plugin")

# 读取全局 Bot 配置里的单个字段
global_value = await self.ctx.config.get("plugin.permission")
```

:::

## 不使用 config_model

如果插件配置非常简单，可以不声明 `config_model`，直接使用 `ctx.config` 和 `get_plugin_config_data()`：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
class SimplePlugin(MaiBotPlugin):
    # 不声明 config_model

    async def on_load(self) -> None:
        # 只能通过原始字典或 ctx.config 读取
        raw = self.get_plugin_config_data()
        name = raw.get("name", "默认名称")

        # self.config 会抛出 RuntimeError
        # 不要调用 self.config
```

:::

但建议始终使用 `config_model`，以获得更好的类型安全和 WebUI 集成体验。

## 验证与排错

**验收动作** — 在 WebUI 插件配置页改一个字段（如问候语）并保存：`plugins/<插件名>/config.toml` 里出现该值，插件日志随即打印新值（`on_config_update` 被触发），说明配置模型、WebUI Schema 与热重载都通了。

- **`self.config` 抛 `RuntimeError`** — 两种情况：插件没有声明 `config_model`，或者调用发生在配置注入之前（比如模块顶层）；前者改用 `get_plugin_config_data()`，后者把访问挪到 `on_load()` 之后。
- **WebUI 里看不到新加的字段** — Schema 只在插件加载时生成，改完 `config_model` 要重载插件（或重启 MaiBot）；重载后 Runner 会用模型默认值补齐 `config.toml` 里缺失的字段。
- **手改 `config.toml` 不生效或串位** — TOML 的分组要与模型嵌套层级对应（`plugin.greeting` 对应 `[plugin]` 下的 `greeting`），类型也要与字段声明一致；`config_version` 由 Runner 维护，不要手改。
- **可变类型默认值报错** — `list`、`dict` 和嵌套 `PluginConfigBase` 要用 `default_factory=list` / `default_factory=PluginSection`，直接写 `default=[]` 会被当成共享默认值。
- **连续保存只收到一次回调** — 热重载广播会合并下发，短时间多次保存只触发一次并带上合并后的最新快照，属预期行为。
