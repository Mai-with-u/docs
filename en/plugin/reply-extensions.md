---
title: Reply Extensions
---

# Reply Extensions

A reply extension (`@ReplyExtension`, plugin SDK 2.10.0+) lets a plugin take part directly in MaiBot's `reply` flow: the plugin registers a set of **namespaced parameters**, the Planner can pass them when calling the reply tool, and the plugin uses them to add extra requirements **before generation** or transform the whole outgoing message group **before sending** (for example, turning text into voice).

If you need lower-level intervention points (arbitrary hooks, global message rewriting), use [Hook Handlers](./hooks.md) instead; for "inject parameters into a reply / rewrite reply content" needs, a reply extension is simpler: sending, history, monitoring, and failure handling are all managed by the main program.

## Decorator Signature

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import ReplyExtension

@ReplyExtension(
    name: str,                                  # Component name (last segment of the namespace)
    description: str = "",                      # What the Planner sees: when to enable it
    parameters: dict | list[ToolParameterInfo], # Parameter declaration, same as Tool
    *,
    priority: int = 0,                          # Processing order across extensions, ascending
    timeout_ms: int = 60000,                    # Per-call timeout (milliseconds)
    chat_scope: str = "all",                    # all / group / private
    allowed_session: list[str] | None = None,   # Restrict to specific chat streams
    enabled: bool = True,
)
```

:::

`parameters` accepts a list of `ToolParameterInfo`, a property dict, or a full object JSON Schema; the main program validates types, required fields, enums, and defaults. `chat_scope` / `allowed_session` and the component enable switch follow the common component mechanism.

## How the Parameters Appear in the reply Tool

Once registered, the reply tool gains a `plugin_options` parameter, where each extension is keyed by `plugin ID.component name`:

::: code-group

```json [Planner calling reply ~vscode-icons:file-type-json~]
{
  "msg_id": "m123",
  "set_quote": true,
  "plugin_options": {
    "voice_plugin.voice": { "attach_voice": true, "keep_text": false }
  }
}
```

:::

- When a plugin is disabled or uninstalled, its parameters are removed from the reply declaration immediately; a reply currently being generated fails explicitly if its extension is unloaded or reloaded
- Omitting a key inside `plugin_options` = not invoking that extension; two plugins never conflict even if their parameters share a name
- Defaults are only filled in when the model selects the extension; declaring parameters does not enable the plugin automatically
- Parameter schemas do not support `$ref` / `$dynamicRef` — declare them inline; unknown top-level parameters are rejected by default

## Handler Protocol

The handler receives these keyword arguments:

- **`phase`** — `prepare` (before generation) or `before_send` (after post-processing and attachments, before any message is sent)
- **`reply_id`** — unique ID of this reply, identical across both phases; concurrent replies each have their own
- **`call_id`** — the original reply tool call ID
- **`session_id` / `reply_message_id`** — chat stream ID / target message ID
- **`chat`** — platform, is_group_chat, group_id, user_id, session_id, stream_id
- **`parameters`** — parameters of this extension only, already validated and defaulted
- **`text`** — empty in `prepare`; the final text after generation and hooks in `before_send`
- **`messages`** — empty in `prepare`; the whole outgoing message group in `before_send`

Return values:

- **`prepare`** — return `{"extra_prompt": "extra requirements"}` or `{}`; the requirement goes to the Replyer and is visible in the generation hook's `extra_prompt`
- **`before_send`** — return `{"messages": [...]}` or `{}` (keep as-is)

## Message Group Format

Each message is written as `{"segments": [...], "quote_previous": false}` in send order; segments follow the send protocol's dict format: `text`, `image`, `emoji`, `voice`, `at`, `reply`, `file`, `forward`, `dict`.

- The first message keeps the reply's `set_quote`; later messages quote the previous one when `quote_previous=true`
- When editing text, keep unrelated image, @, emoji segments and `quote_previous` to avoid losing original attachments
- New images / stickers / voice must carry Base64 data; existing images and stickers may keep their hash
- Audio synthesis is up to the plugin (the SDK has no built-in TTS); a voice segment must carry valid, non-empty Base64 audio

Multiple extensions are processed by ascending `priority`, then dictionary order of the full component name; each extension's output is handed to the next one.

## Constraints and Failure Behavior

- Do not send the reply group yourself from the extension; sending, history, monitoring, and failure handling are all managed by the main program
- An empty message group, invalid return values, plugin errors, and timeouts all fail this reply; a failure before sending sends no messages at all
- A released plugin should require `maibot-plugin-sdk>=2.10.0` in its dependency declaration; see [Manifest System](./manifest.md)

## Full Example: Voice Reply

Put the following method into your own `MaiBotPlugin` subclass; `self.synthesize_voice(text)` is the plugin's own async TTS method returning audio bytes supported by the adapter.

::: code-group

```python [Python ~vscode-icons:file-type-python~]
import base64

from maibot_sdk import MaiBotPlugin, ReplyExtension


class VoicePlugin(MaiBotPlugin):
    @ReplyExtension(
        "voice",
        description="需要语音回复时启用，可选择同时保留文字",
        parameters={
            "attach_voice": {"type": "boolean", "default": False, "description": "是否合成语音"},
            "keep_text": {"type": "boolean", "default": True, "description": "是否同时发送文字"},
        },
        timeout_ms=60000,
    )
    async def reply_voice(self, *, phase, parameters, text, messages, **context):
        if not parameters["attach_voice"]:
            return {}
        if phase == "prepare":
            return {"extra_prompt": "这次回复会转成语音，请使用适合朗读的自然口语。"}

        audio = await self.synthesize_voice(text)
        result = []
        for message in messages:
            segments = [
                segment
                for segment in message["segments"]
                if parameters["keep_text"] or segment["type"] != "text"
            ]
            if segments:
                result.append({"segments": segments, "quote_previous": message["quote_previous"]})

        voice = {
            "segments": [{
                "type": "voice",
                "data": text,
                "binary_data_base64": base64.b64encode(audio).decode("ascii"),
            }],
            "quote_previous": False,
        }
        result.append(voice)
        return {"messages": result}


def create_plugin():
    return VoicePlugin()
```

:::

## Verification & Troubleshooting

**Verify** — After registering, reload the plugin and let the Planner need a reply in MaiBot Chat: `plugin ID.component name` should appear in the reply tool's `plugin_options`; once the Planner selects it, both phases of this reply show up on the monitor timeline.

**My parameters don't show up in reply?**

- Check the plugin is enabled and `chat_scope` / `allowed_session` match the current session
- Disabling or uninstalling removes the parameters immediately; re-enable and reload to bring them back

**The reply was not sent?**

- Any extension failing before sending fails the whole reply; search the plugin logs for the error against the matching `reply_id`, fix it, and trigger a new reply

**Voice / images won't send?**

- Check the Base64 data is non-empty and the audio format is supported by the target adapter