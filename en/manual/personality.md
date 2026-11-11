---
title: Personality
---

# Personality

Personality decides who MaiBot is: how she understands herself, how she talks, and what she pays attention to in group chats versus private messages. The WebUI keeps multiple profiles, switches between them at any time, and can import one from JSON or an external web page.

## Profile fields

A profile is made of these fields, stored under `[personality]` in `bot_config.toml`:

::: fields
- **`name`** — Profile name, unique within the library and not entirely whitespace.
- **`personality`** — Identity and character, the core paragraph.
- **`behavior_style`** — Behavioral style: how to join a conversation, whether to force topics.
- **`reply_style`** — Expression style: sentence length, tone, word choice.
- **`group_chat_prompt`** — Group chat prompt for group-specific guidance.
- **`private_chat_prompts`** — Private chat prompt for one-on-one guidance.
- **`multiple_reply_style`** — Alternate expression styles, empty by default.
- **`multiple_probability`** — Trigger probability for alternate styles, 0-1, default `0`.
:::

The group and private prompts are saved and switched together with the profile, written to `chat.reply_style.group_chat_prompt` and `chat.reply_style.private_chat_prompts`.

## Keeping several profiles

Write a profile in **Mai Settings → Identity & Personality**, then save it to the library. Repeat with a different name for other variants. Switch on the same page: the saved edits of the current profile stay in the library, the target profile is written and hot-reloaded, and replies already being generated are not cancelled.

While the current profile is not yet in the library, `selected_profile` is an empty string. Changes take effect only after saving to the config file and hot-reloading; unsaved browser edits are never read by a switch.

## Importing JSON

Paste the JSON below into the **Import** card of **Identity & Personality**. Wrapping it in a Markdown json code block also works. The content is validated and previewed, **Continue editing** lets you adjust every field, and **Create profile** saves it to the library.

::: code-group

```json [maibot.personality ~vscode-icons:file-type-json~]
{
  "format": "maibot.personality",
  "version": 1,
  "profile": {
    "name": "Gentle Mai",
    "personality": "Gentle and curious; loves sharing everyday life with friends.",
    "behavior_style": "Join conversations naturally, listen carefully, never force a topic.",
    "reply_style": "Short and natural, with a warm tone.",
    "group_chat_prompt": "Watch how group members interact and join when it fits; no need to answer every message.",
    "private_chat_prompts": "Care about what the other person thinks; keep one-on-one talk natural and coherent.",
    "multiple_reply_style": ["Occasionally answer with a witty one-liner"],
    "multiple_probability": 0.1
  }
}
```

:::

Import rules:

::: fields
- **`format`** — Must be `maibot.personality`.
- **`version`** — Must be the number `1`.
- **Required** — The first six `profile` fields, including both chat prompts, must be strings, and the name cannot be all whitespace.
- **Optional** — `multiple_reply_style` defaults to `[]`; `multiple_probability` defaults to `0` and accepts 0-1.
- **Rejected input** — Extra fields, automatic type coercion, and remote resources. One document is capped at 65536 JavaScript characters.
:::

Importing never switches the active profile. Rename a profile before saving if the name already exists.

## Importing from an external page

An external site can let the user enter their own instance address and then build a preview link:

```text
{WEBUI_ORIGIN}/config/bot?tab=bot#personality-import={URL-encoded JSON}
```

This is a browser navigation interface, not an HTTP API that writes config: no auth token, cross-origin call, or CORS setup is involved. The JSON sits in the URL fragment and is never sent to the server with the request. The user still logs in to the WebUI normally; the tab holds the pending import and returns to the import card after login, and cancelling or saving clears it.

::: code-group

```js [Build the import link ~vscode-icons:file-type-typescript~]
function personalityImportUrl(webuiOrigin, document) {
  const base = new URL(webuiOrigin)
  if (!['http:', 'https:'].includes(base.protocol)) {
    throw new Error('The WebUI address must be HTTP or HTTPS')
  }
  const url = new URL('/config/bot?tab=bot', base.origin)
  url.hash = new URLSearchParams({
    'personality-import': JSON.stringify(document),
  }).toString()
  return url.href
}
```

:::

URL length is bounded by the browser and the external platform, so long profiles are easier to import by copying the JSON. The interface targets reachable HTTP(S) instances and does not start a MaiBot that is not running.

## Switching profiles from a plugin

Plugins read and switch profiles through `ctx.personality`, declaring the matching capabilities in the manifest:

::: code-group

```json [_manifest.json ~vscode-icons:file-type-json~]
{
  "capabilities": [
    "personality.list",
    "personality.get_current",
    "personality.switch"
  ]
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
available = await self.ctx.personality.list()
names = [profile["name"] for profile in available["profiles"]]
current = await self.ctx.personality.get_current()
result = await self.ctx.personality.switch("Gentle Mai")
```

:::

::: fields
- **`list()` / `personality.list`** — Returns `{"profiles": [profile, ...]}`.
- **`get_current()` / `personality.get_current`** — Returns the current profile.
- **`switch(name)` / `personality.switch`** — Switches by exact name across all conversations and returns `{"changed": true, "current": profile}`.
:::

A profile object contains every field listed above; `name` is an empty string when the current profile has no name. Listing and current-profile queries read a runtime snapshot, so the latest content is visible only after the WebUI save and hot reload finish.

Switching to the current name does not overwrite current edits and returns `changed: false`. Unknown profiles, missing capability authorization, invalid arguments, write failures, and hot-reload failures raise a capability call exception. When hot reload fails the config may already be on disk — the exception message says so, and you can query the current state and retry.

## Verify and troubleshoot

**Verify** — Save a new profile in **Identity & Personality** and switch to it, then ask "who are you" in **Mai chat**. The reply should reflect the new profile's character and tone.

- **Import reports a format error** — Check that `format` is `maibot.personality`, `version` is the number `1`, and all six required `profile` fields are strings.
- **Saving a duplicate name fails** — Profile names are unique; rename before saving.
- **Nothing changes after switching** — Switching relies on hot reload; check the log for a successful reload message. Unsaved browser edits never take effect.
- **A plugin reads an outdated profile** — Plugins read the runtime snapshot; query again after the WebUI save and hot reload complete.
