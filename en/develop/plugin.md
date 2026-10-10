---
title: Plugin Integration
---

# Plugin Integration

**Write a plugin when you want to add capabilities to MaiBot without touching its source code.** Plugins run in a separate Runner subprocess and talk to the main process over IPC; you only implement a `MaiBotPlugin` subclass and declare components—loading, configuration, hot reload, and WebUI are all handled by the runtime.

This page answers the "integration point of view": where a plugin can attach, where the boundaries are, and how versions line up. **For component code, decorator arguments, and the full API, see the [Plugin Development Guide](/en/plugin/).**

## When to Use a Plugin

::: fields
- **Add a command / add a tool** — a user types `/weather` to trigger it, or you let the model call a tool on its own → **plugin**.
- **Change MaiBot's behavior** — rewrite prompts, intercept messages, modify replies → **plugin** (Hook handler).
- **Connect a new chat platform** — → **adapter**, see [Adapter Integration](./adapters/).
- **Let an external program read or control MaiBot** — dashboards, monitoring, automation scripts → **HTTP API**, see [Programmatic Access](./webui-api/).
- **Let MaiBot call your external system** — if a ready-made service already exists → prefer **MCP**, see [MCP Configuration](/en/manual/configuration/mcp-config); consider writing a plugin only when you need complex logic.
:::

Plugins and adapters can coexist: platform adapters send and receive messages, plugins process them.

## Where a Plugin Can Attach

Each component type maps to a clear integration surface—pick by "what you want to affect":

::: fields
- **Tool** — a tool exposed for the model to call on its own; it attaches to the **reasoning stage**.
- **Command** — a command users type directly; it attaches to the **message entry point**.
- **Hook handler** — attached to a named Hook; it can read and write data before and after nodes such as message processing, reply generation, sending, and emoji selection, attaching to the **inside of the pipeline**.
- **Event handler** — listens for events such as `on_start` / `on_stop`; it attaches to the **lifecycle**.
- **Message gateway** — the plugin sends and receives messages for a platform on its own, which amounts to "the plugin is the adapter".
- **API component** — provides interfaces to other plugins or to your own WebUI pages; it attaches to **plugin-to-plugin** communication.
- **LLMProvider** — registers a new model client type; it attaches to the **model layer**, see [LLMProvider component](/en/plugin/llmprovider).
- **Home card / WebUI page** — presents data and actions inside MaiBot's WebUI; it attaches to the **interface**.
:::

## What a Minimal Plugin Looks Like

A working plugin is just two files. This one registers a command and a tool, and rewrites a line right before the reply is sent:

::: code-group

```json [_manifest.json ~vscode-icons:file-type-json~]
{
  "manifest_version": 2,
  "id": "com.example.hello",
  "version": "1.0.0",
  "name": "示例插件",
  "description": "演示命令、工具与 Hook 三类接入面",
  "author": { "name": "you", "url": "https://github.com/you" },
  "license": "MIT",
  "urls": { "repository": "https://github.com/you/hello" },
  "host_application": { "min_version": "1.3.0", "max_version": "1.99.99" },
  "sdk": { "min_version": "2.0.0", "max_version": "2.99.99" },
  "capabilities": ["send.text", "send.emoji", "config.get"],
  "i18n": { "default_locale": "zh-CN" }
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
from maibot_sdk import Command, HookHandler, MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType


class HelloPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        self.ctx.logger.info("hello 插件已加载")

    async def on_unload(self) -> None:
        pass

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @Command("hello", pattern=r"^/hello")
    async def handle_hello(self, **kwargs):
        await self.ctx.send.text("你好！", kwargs["stream_id"])
        return True, "你好！", 2

    @Tool(
        "greet",
        brief_description="向指定聊天流打招呼",
        detailed_description="参数 stream_id：当前聊天流 ID。",
        parameters=[ToolParameterInfo(
            name="stream_id", param_type=ToolParamType.STRING,
            description="当前聊天流 ID", required=True,
        )],
    )
    async def handle_greet(self, stream_id: str, **kwargs):
        await self.ctx.send.text("你好！", stream_id)
        return {"success": True}

    @HookHandler("send_service.after_build_message")
    async def tag_reply(self, **kwargs):
        # 在每个回复末尾加一句签名；blocking 模式才能改数据
        kwargs["processed_plain_text"] = f"{kwargs['processed_plain_text']}\n—— 来自 hello 插件"
        return {"action": "continue", "modified_kwargs": kwargs}


def create_plugin():
    return HelloPlugin()
```

:::

Each of the three integration surfaces gets its own decorator: `@Command` owns the message entry point, `@Tool` is what the model can call, and `@HookHandler` edits data inside the pipeline. All three lifecycle methods are mandatory — the runtime refuses to load a plugin without them.

Hooks are the broadest category: 22 named Hooks span the chat, send service, emoji, learning, and reasoning pipelines, and support two modes—blocking (can modify data, can abort) and observe-only—with timeout and circuit-breaker protection. For the Hook list and the return contract, see the [Plugin Development Guide · Hook Handler](/en/plugin/hooks).

## Plugin Runtime Boundaries

Understanding the boundaries saves a lot of debugging:

::: fields
- **Separate process** — third-party plugins run in a Runner subprocess, so a main-process crash and a plugin crash do not affect each other; a single RPC times out after 30 seconds by default, and component calls after 60 seconds.
- **No importing the main program** — plugin code can only use `maibot_sdk` and must not reference `src.*`. Request the capabilities you need through the `self.ctx` capability proxies.
- **Capabilities must be declared** — which capabilities you can call is decided by the manifest's `capabilities` list; calling an undeclared capability is rejected.
- **Data has fixed locations** — plugin-specific directories are `data/plugins/{plugin ID}` and `temp/plugins/{plugin ID}`; do not write anywhere else.
- **No sandbox** — there is no general file/network isolation, and a plugin is code running with the main program's privileges; install only plugins from sources you trust.
- **Hot reload** — changes to the plugin source or its `config.toml` reload automatically; a failed reload rolls back to the previous version.
:::

## Version Compatibility

Whether a plugin can be installed into the current MaiBot is decided by two ranges in the manifest:

::: fields
- **`host_application`** — host version range. Below the lower bound it is rejected outright; above the upper bound with the same major and minor version it is allowed with a warning.
- **`sdk`** — plugin SDK version range; anything outside it is always rejected. The SDK that matches the current release is the `maibot-plugin-sdk` 2.9 series.
:::

During debugging you can temporarily skip validation with `debug.force_plugin_compatibility`, but that is a fallback—forcing a genuinely incompatible plugin to load will fail at runtime.

## Where to Start

::: steps
1. Get a minimal plugin running first: read the [Plugin Development Guide](/en/plugin/), then install the SDK and write `_manifest.json` and `plugin.py` as described.

2. Decide which integration surface to attach to: tool, command, or Hook—pick one from the list above.

3. Look up APIs as needed: the capability proxies cover sending, models, configuration, database, sessions, messages, persons, emoji, statistics, and more; see the [API Reference](/en/plugin/api-reference) for the full list.

4. If you need a UI, declare the page in `webui.json`; see [WebUI Pages](/en/plugin/webui-pages).

5. To publish to the plugin market, see [Publish a Plugin](/en/plugin/submission).
:::

## Verification and Troubleshooting

**Acceptance check** — after the plugin loads, the WebUI plugin page shows it as loaded, and the commands / tools you declared can be triggered.

- **The plugin was not loaded** — check the manifest: `manifest_version` must be `2`, `id` must contain at least one `.` or `-` separator, `capabilities` and `i18n` are required, and extra unknown fields are rejected outright.
- **Loading reports a version incompatibility** — compare the `host_application` / `sdk` ranges with the current versions; the plugin SDK and the main program are upgraded separately.
- **Component registration failed** — registration is all-or-nothing: if one component's type or Hook name is invalid, the whole plugin fails to register, and the log points at the specific one.
- **A capability call was rejected** — it is not declared in `capabilities`; add it by capability name and reload.
- **Code changes have no effect** — confirm the file really is inside the plugin directory; a failed reload rolls back automatically, and the rollback is visible in the log.
- **Model / send calls fail without an exception** — plugin component exceptions are reported in the response payload as `success: false`, so remember to check the return value.
