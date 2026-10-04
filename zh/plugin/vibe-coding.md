---
title: Vibe Coding 插件开发指南
---

# Vibe Coding 插件开发指南

本文面向使用 AI 辅助编写 MaiBot 插件的开发者。目标是把插件需求拆成 AI 容易理解、容易验证、不会误改主程序的工作单元。

## AI 任务简报

把下面这段作为给 AI 的首段上下文，再补充你的具体需求：

```text
你正在为 MaiBot 编写第三方插件。插件必须放在 plugins/<plugin-name>/ 下，不要修改 MaiBot 主程序代码，除非我明确许可。请使用 maibot-plugin-sdk，入口文件为 plugin.py，元信息文件为 _manifest.json。必须实现 on_load、on_unload、on_config_update 和 create_plugin。优先使用 @Tool、@Command、@HookHandler、@EventHandler、@API、@MessageGateway；不要给新插件使用 @Action。所有用户可见文本优先使用简体中文。请保持改动边界清晰，并给出测试方式。
```

## 开发边界

- 插件目录固定为 `plugins/<plugin-name>/`；插件专属忽略项写在目录内的 `.gitignore`，其中包含 `/config.toml`。
- 插件入口固定为 `plugin.py`，工厂函数固定为 `create_plugin()`。
- 插件元信息由 `_manifest.json` 声明，配置结构和默认值由 `plugin.py` 中的 `config_model` 声明，Runner 负责生成运行时 `config.toml`。
- 新插件不要修改 `src/`、`dashboard/`、`config/` 等主程序目录；确实需要主程序能力时，先说明原因、影响面和替代方案，再请求许可。
- 不要把本地实验数据、日志、临时脚本、个人密钥、token、cookie、数据库文件提交进插件。
- 依赖以 `_manifest.json` 的 `dependencies` 为准；只有在维护 MaiBot 主程序依赖时才同步 `pyproject.toml` 和 `requirements.txt`。

## 最小目录结构

```text
plugins/my-plugin/
├── _manifest.json
├── plugin.py
├── README.md
└── .gitignore          # 包含 /config.toml
```

首次加载后，Runner 根据 `config_model` 在已安装插件目录中生成 `config.toml`，并在配置模型演进时补齐新增字段。

推荐额外添加：

```text
plugins/my-plugin/
├── tests/
├── docs/
└── assets/
```

## Manifest 要点

`_manifest.json` 用于让 Host 在加载前校验插件。AI 生成时必须注意：

- `manifest_version` 当前固定为 `2`。
- `id` 使用小写反向域名或作者前缀，例如 `com.example.my-plugin`。
- `version` 使用严格三段式语义版本，例如 `1.0.0`。
- `author.url`、`urls.repository` 等 URL 必须以 `http://` 或 `https://` 开头。
- `host_application` 和 `sdk` 都要声明 `min_version` 与 `max_version`。
- Python 包依赖写入 `dependencies`，类型为 `python_package`。
- 插件间依赖写入 `dependencies`，类型为 `plugin`。
- `capabilities` 只声明确实需要的能力。
- `i18n.default_locale` 推荐使用 `zh-CN`。

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "manifest_version": 2,
  "id": "com.example.my-plugin",
  "version": "1.0.0",
  "name": "我的插件",
  "description": "一个 MaiBot 插件",
  "author": {
    "name": "开发者",
    "url": "https://github.com/developer"
  },
  "license": "MIT",
  "urls": {
    "repository": "https://github.com/developer/my-plugin"
  },
  "host_application": {
    "min_version": "1.0.0",
    "max_version": "1.99.99"
  },
  "sdk": {
    "min_version": "2.5.1",
    "max_version": "2.99.99"
  },
  "dependencies": [],
  "capabilities": ["send_message"],
  "i18n": {
    "default_locale": "zh-CN"
  }
}
```

:::

## 代码骨架

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import Any

from maibot_sdk import Command, Field, MaiBotPlugin, PluginConfigBase, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType


class PluginSectionConfig(PluginConfigBase):
    """插件基础配置。"""

    __ui_label__ = "插件"
    __ui_icon__ = "package"
    __ui_order__ = 0

    enabled: bool = Field(default=False, description="是否启用插件")
    config_version: str = Field(default="1.0.0", description="配置版本")


class MyPluginConfig(PluginConfigBase):
    """插件配置。"""

    plugin: PluginSectionConfig = Field(default_factory=PluginSectionConfig)


class MyPlugin(MaiBotPlugin):
    """我的插件。"""

    config_model = MyPluginConfig

    async def on_load(self) -> None:
        """插件加载时执行。"""
        self.ctx.logger.info("插件已加载")

    async def on_unload(self) -> None:
        """插件卸载时执行。"""
        self.ctx.logger.info("插件已卸载")

    async def on_config_update(self, scope: str, config_data: dict[str, Any], version: str) -> None:
        """配置热重载时执行。"""
        del scope
        del config_data
        del version

    @Tool(
        "echo_text",
        description="复述用户提供的文本。适合测试插件是否能被 LLM 调用。",
        parameters=[
            ToolParameterInfo(
                name="text",
                param_type=ToolParamType.STRING,
                description="要复述的文本",
                required=True,
            ),
        ],
    )
    async def echo_text(self, text: str, **kwargs: Any) -> dict[str, str]:
        del kwargs
        return {"content": text}

    @Command("ping", description="测试插件是否在线", pattern=r"^/ping$")
    async def ping(self, stream_id: str = "", **kwargs: Any) -> tuple[bool, str, int]:
        del kwargs
        await self.ctx.send.text("pong", stream_id)
        return True, "pong", 2


def create_plugin() -> MyPlugin:
    """创建插件实例。"""
    return MyPlugin()
```

:::

## 组件选择

- **让 LLM 主动调用能力** → `@Tool` — 默认工具进入 deferred 池，需要被搜索发现；高频低风险工具才考虑 `core_tool=True`
- **用户输入命令触发** → `@Command` — 使用正则 `pattern` 匹配，例如 `/ping`
- **拦截或观察主流程** → `@HookHandler` — 适合消息改写、发送前审计、流程拦截
- **监听消息或生命周期事件** → `@EventHandler` — 适合统计、记录、异步辅助任务
- **给其他插件调用能力** → `@API` — 只把稳定接口设为公开
- **接入外部聊天平台** → `@MessageGateway` — 适配器类插件使用
- **维护旧插件** → `@Action` — 仅兼容旧代码，新插件不要使用

## Tool 编写要点

- `description` 要写清楚何时使用、参数含义、限制和副作用。
- 参数优先用 `ToolParameterInfo` 声明，类型来自 `ToolParamType`。
- 返回值优先使用 `dict`，把给 LLM 阅读的文字放在 `content`。
- 需要返回图片等媒体时，使用文档约定的 `content_items`，不要把 base64 直接塞进长文本。
- 默认不要设置 `core_tool=True`；过多核心工具会增加模型选择成本。
- 工具内部要处理失败并返回可读错误，不要让异常泄漏成难懂堆栈。

## 发送消息要点

- 已有 `stream_id` 时，使用 `await self.ctx.send.text(content, stream_id)` 发送文本。
- 发送图片、表情、转发、混合消息时，优先使用 `self.ctx.send` 和 `self.ctx.emoji` 提供的能力代理。
- 不要自行计算会话 ID；插件应使用上下文传入的 `stream_id` 或 SDK 提供的消息上下文。
- 用户可见文本默认使用简体中文。

## 配置要点

- 配置模型继承 `PluginConfigBase`，字段使用 `Field(default=..., description="...")`。
- 推荐保留 `[plugin]` 分组，并包含 `enabled` 与 `config_version`。
- WebUI 展示信息可以通过 `__ui_label__`、`__ui_icon__`、`__ui_order__` 补充。
- 配置读取优先使用 `self.config.<section>.<field>`；确实需要原始字典时再用 `self.get_plugin_config_data()`。
- 配置热重载逻辑放入 `on_config_update()`。
- `config_model` 是源码中的配置定义，Runner 生成的 `config.toml` 保存当前安装实例的配置值。

## AI 生成代码检查清单

要求 AI 完成后逐项自检：

- `_manifest.json` 字段完整，版本号和 URL 格式合法。
- `plugin.py` 只从标准库、第三方库和 `maibot_sdk` 导入；导入顺序符合项目规范。
- 插件类继承 `MaiBotPlugin`，并声明 `config_model`。
- 已实现 `on_load()`、`on_unload()`、`on_config_update()`。
- 已实现 `create_plugin()` 并返回插件实例。
- 新功能优先使用 `@Tool` 或 `@Command`，没有给新代码使用 `@Action`。
- 没有修改主程序代码和根目录 `.gitignore`。
- 没有硬编码 token、绝对路径、个人 QQ 号、群号或私有 URL。
- 所有网络请求都有超时和异常处理。
- 所有定时任务、后台任务、连接和文件句柄能在卸载时清理。
- 用户可见文本是简体中文。
- README 写明安装、启用、配置、命令和常见问题。

## 推荐提示词

### 生成新插件

```text
请在 plugins/<plugin-name>/ 创建一个 MaiBot 第三方插件，实现 <功能描述>。
要求：
1. 只改插件目录，不改 MaiBot 主程序。
2. 使用 maibot-plugin-sdk 和 plugin.py / _manifest.json 结构。
3. 实现 on_load、on_unload、on_config_update、create_plugin。
4. 配置用 PluginConfigBase + Field，用户可见文本使用简体中文。
5. 给出 README、完整配置模型和包含 /config.toml 的 .gitignore。
6. 完成后说明如何在 MaiBot 中启用和测试。
```

### 修改已有插件

```text
请只修改 plugins/<plugin-name>/ 内的文件，为现有插件增加 <功能描述>。
先阅读 _manifest.json、plugin.py 中的配置模型和 README，沿用现有风格。
不要重构无关代码，不要整理全仓库格式。
如果需要主程序改动，先停止并说明原因。
```

### 排查插件问题

```text
请排查 plugins/<plugin-name>/ 的加载或运行问题。
优先检查 _manifest.json 校验、依赖声明、生命周期方法、create_plugin、配置模型、日志中的异常。
请给出最小修复，不要做无关重构。
```

## 测试建议

- 静态检查：确认 `_manifest.json` 是合法 JSON，`plugin.py` 可以被 Python 解释器导入。
- 本地加载：把插件放入 `plugins/`，启动 MaiBot，观察插件加载日志。
- WebUI 检查：在插件管理中确认插件出现、可启用、配置可编辑。
- 命令测试：用 `/ping` 一类命令确认 `@Command` 可触发。
- Tool 测试：通过正常聊天让 LLM 发现并调用工具，观察工具返回是否可读。
- 卸载测试：禁用或卸载插件后，确认后台任务、连接和缓存被清理。

## 发布前检查

- 插件仓库根目录包含 `_manifest.json`、`plugin.py`、`README.md` 和 `.gitignore`，配置模型完整定义在插件代码中。
- `.gitignore` 包含 `/config.toml`，运行时配置由 Runner 根据 `config_model` 生成。
- README 包含功能说明、安装方式、配置项、命令、权限/能力说明、故障排查。
- 许可证与 `_manifest.json` 中的 `license` 一致。
- 依赖声明完整，避免要求用户手动安装未声明依赖。
- 没有提交 `.venv/`、`__pycache__/`、日志、数据库、密钥或本地配置。
- 如果准备提交到插件仓库，阅读插件仓库贡献指南并按其要求整理元信息。
