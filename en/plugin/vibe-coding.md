---
title: Vibe Coding Plugin Development Guide
---

# Vibe Coding Plugin Development Guide

This guide is for developers using AI to help write MaiBot plugins. The goal is to break down plugin requirements into units that are easy for AI to understand and verify without accidentally modifying the core program.

## AI Task Brief

Use the following as the initial context for the AI, then add your specific requirements:

```text
你正在为 MaiBot 编写第三方插件。插件必须放在 plugins/<plugin-name>/ 下，不要修改 MaiBot 主程序代码，除非我明确许可。请使用 maibot-plugin-sdk，入口文件为 plugin.py，元信息文件为 _manifest.json。必须实现 on_load、on_unload、on_config_update 和 create_plugin。优先使用 @Tool、@Command、@HookHandler、@EventHandler、@API、@MessageGateway；不要给新插件使用 @Action。所有用户可见文本优先使用简体中文。请保持改动边界清晰，并给出测试方式。
```

## Development Boundaries

- The plugin directory is fixed to `plugins/<plugin-name>/`. Store plugin-specific ignore rules in its `.gitignore`, including `/config.toml`.
- The plugin entry point is fixed at `plugin.py`, and the factory function is fixed at `create_plugin()`.
- `_manifest.json` declares plugin metadata, `config_model` in `plugin.py` declares the configuration structure and defaults, and the Runner generates the runtime `config.toml`.
- New plugins should not modify core program directories such as `src/`, `dashboard/`, `config/`; if core program capabilities are truly needed, explain the reason, impact, and alternatives first before requesting permission.
- Do not commit local experimental data, logs, temporary scripts, personal keys, tokens, cookies, or database files to the plugin.
- Dependencies follow the `dependencies` in `_manifest.json`; only sync `pyproject.toml` and `requirements.txt` when maintaining MaiBot core program dependencies.

## Minimum Directory Structure

```text
plugins/my-plugin/
├── _manifest.json
├── plugin.py
├── README.md
└── .gitignore          # Includes /config.toml
```

On first load, the Runner generates `config.toml` from `config_model` in the installed plugin directory and fills in newly added fields as the configuration model evolves.

Recommended additional additions:

```text
plugins/my-plugin/
├── tests/
├── docs/
└── assets/
```

## Manifest Key Points

`_manifest.json` is used by the Host to validate the plugin before loading. When generating, the AI must note:

- `manifest_version` is currently fixed to `2`.
- `id` uses lowercase reverse domains or author prefixes, e.g., `com.example.my-plugin`.
- `version` uses strict three-part semantic versioning, e.g., `1.0.0`.
- URLs `author.url` and `urls.repository` must start with `http://` or `https://`.
- `host_application` and `sdk` must both declare `min_version` and `max_version`.
- Python package dependencies are written in `dependencies`, with type `python_package`.
- Inter-plugin dependencies are written in `dependencies`, type `plugin`.
- `capabilities` only declares strictly necessary capabilities.
- `i18n.default_locale` recommends using `zh-CN`.

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

## Code Skeleton

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

## Component Selection

- **Let the LLM proactively call capabilities** → `@Tool` — default tools enter the deferred pool and need to be searched/discovered; only high-frequency, low-risk tools should consider `core_tool=True`.
- **Triggered by user input commands** → `@Command` — use regex `pattern` for matching, e.g., `/ping`.
- **Intercept or observe main flow** → `@HookHandler` — suitable for message rewriting, pre-sending audits, and process interception.
- **Listen to messages or lifecycle events** → `@EventHandler` — suitable for statistics, logging, and asynchronous auxiliary tasks.
- **Provide capabilities to other plugins** → `@API` — only expose stable interfaces as public.
- **Connect to external chat platforms** → `@MessageGateway` — used for adapter-type plugins.
- **Maintain legacy plugins** → `@Action` — only for legacy compatibility; do not use for new plugins.

## Tool Writing Key Points

- `description` must clearly state when to use, parameter meanings, constraints, and side effects.
- Prioritize declaring using `ToolParameterInfo`, with types from `ToolParamType`.
- Prioritize returns using `dict`, placing text for LLM reading in `content`.
- When returning images or media, use the agreed-upon `content_items`; do not stuff base64 strings directly into long text.
- By default, do not set `core_tool=True`; too many core tools increase model selection costs.
- Tools must handle failures internally and return readable errors; do not let exceptions leak as cryptic stacks.

## Message Sending Key Points

- When `stream_id` exists, use `await self.ctx.send.text(content, stream_id)` to send text.
- When sending images, emojis, forwards, or mixed messages, prioritize using proxy capabilities provided by `self.ctx.send` and `self.ctx.emoji`.
- Do not calculate session IDs manually; plugins should use the `stream_id` passed via context or SDK-provided message context.
- User-visible text defaults to Simplified Chinese.

## Configuration Key Points

- Configuration inherits `PluginConfigBase`, fields use `Field(default=..., description="...")`.
- Recommended to keep the `[plugin]` group, including `enabled` and `config_version`.
- WebUI display information can be supplemented via `__ui_label__`, `__ui_icon__`, and `__ui_order__`.
- Prioritize reading config via `self.config.<section>.<field>`; use `self.get_plugin_config_data()` only when a raw dictionary is strictly needed.
- Put config hot reload logic in `on_config_update()`.
- `config_model` is the source configuration definition, while the Runner-generated `config.toml` stores values for the current installation.

## AI Generated Code Checklist

Self-check each item after the AI completes:

- `_manifest.json` field is complete, and version number/URL formats are valid.
- `plugin.py` only imports from standard library, third-party libraries, and `maibot_sdk`; import order follows project standards.
- Plugin class inherits `MaiBotPlugin` and declares `config_model`.
- Implemented `on_load()`, `on_unload()`, and `on_config_update()`.
- Implemented `create_plugin()` and returns the plugin instance.
- New features prioritize using `@Tool` or `@Command`; no use of `@Action` for new code.
- No modifications made to core program or the root directory `.gitignore`.
- No hardcoded tokens, absolute paths, personal QQ numbers, group numbers, or private URLs.
- All network requests have timeouts and exception handling.
- All scheduled tasks, background tasks, connections, and file handles can be cleaned up upon unloading.
- User-visible text is in Simplified Chinese.
- README specifies installation, enabling, configuration, commands, and FAQs.

## Recommended Prompts

### Generate New Plugin

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

### Modify Existing Plugin

```text
请只修改 plugins/<plugin-name>/ 内的文件，为现有插件增加 <功能描述>。
先阅读 _manifest.json、plugin.py 中的配置模型和 README，沿用现有风格。
不要重构无关代码，不要整理全仓库格式。
如果需要主程序改动，先停止并说明原因。
```

### Troubleshoot Plugins

```text
请排查 plugins/<plugin-name>/ 的加载或运行问题。
优先检查 _manifest.json 校验、依赖声明、生命周期方法、create_plugin、配置模型、日志中的异常。
请给出最小修复，不要做无关重构。
```

## Testing Suggestions

- Static check: confirm `_manifest.json` is valid JSON and `plugin.py` is importable.
- Local loading: place plugin in `plugins/`, start MaiBot, and observe loading logs.
- WebUI check: verify plugin appears in management, can be enabled, and config is editable.
- Command testing: use `/ping` type commands to confirm `@Command` is triggered.
- Tool testing: let the LLM discover and call tools through normal chat; observe if tool returns are readable.
- Uninstall testing: disable or uninstall the plugin and confirm background tasks, connections, and cache are cleared.

## Pre-release Checklist

- Plugin root contains `_manifest.json`, `plugin.py`, `README.md`, and `.gitignore`, with the complete configuration model defined in plugin code.
- `.gitignore` includes `/config.toml`, and the Runner generates runtime configuration from `config_model`.
- README includes function description, installation, configuration, commands, permissions/capabilities, and troubleshooting.
- License is consistent with `_manifest.json` in `license`.
- Dependency declarations are complete, avoiding requiring users to manually install undeclared dependencies.
- No committed `.venv/`, `__pycache__/`, logs, databases, keys, or local configs.
- If submitting to a plugin repository, read the repository's contribution guide and organize metadata accordingly.
