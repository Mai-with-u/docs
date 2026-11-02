---
title: Personality Library & Import
---

# Personality Library & Import

The personality library keeps several personas on hand and switches between them on demand. Switching keeps whatever you are currently editing, hot-reloads after saving, and the next reply uses the new persona.

## Saving and Switching

On the WebUI "Identity and Personality" page, fill in personality, behavior style, reply style, and the group/private prompts — saving writes them into the current persona. Use "Save as Profile" to store it in the library; from the list you can rename, delete, or press "Switch".

Before switching, Mai saves your current edits back into the persona they belong to; if the current edits were never saved to the library, they are archived as a "Profile before switch" so nothing is lost. Switching writes the config file and hot-reloads — once it succeeds the next reply uses the new persona; messages already sent do not change.

The group and private prompts travel with the persona and are written to `chat.reply_style.group_chat_prompt` and `chat.reply_style.private_chat_prompts` respectively.

## Importing JSON

Press "Import" to paste a JSON document, optionally wrapped in a Markdown json code block. It is validated and previewed automatically; "Continue Editing" lets you adjust every field, and "Create Profile" stores it in the library. Importing never switches the current persona automatically, and a profile with the same name must be renamed first.

::: code-group

```json [Personality JSON ~vscode-icons:file-type-json~]
{
  "format": "maibot.personality",
  "version": 1,
  "profile": {
    "name": "Gentle Mai",
    "personality": "Gentle and curious, loves sharing daily life with friends.",
    "behavior_style": "Joins chats naturally, listens carefully, never forces topics.",
    "reply_style": "Short and natural, with a warm tone.",
    "group_chat_prompt": "Watch how group members interact and join in occasionally; no need to answer everything.",
    "private_chat_prompts": "Focus on what the other person is thinking; keep the one-on-one flow natural.",
    "multiple_reply_style": ["Occasionally reply with a playful line"],
    "multiple_probability": 0.1
  }
}
```

:::

`format` must be `maibot.personality` and `version` the number `1`. The first six fields of `profile` (including the group and private prompts) are required strings and the name cannot be all whitespace; `multiple_reply_style` is an optional string array defaulting to empty, and `multiple_probability` is a 0–1 number defaulting to `0`. Extra fields, automatic type conversion, and remote resources are not accepted; a document holds at most 65,536 characters.

## Opening the Import from a Web Page

An external page can send users straight to the import card of their logged-in WebUI with a link:

```text
{WEBUI_ORIGIN}/config/bot?tab=bot#personality-import={URL-encoded full JSON}
```

This is a browser navigation interface, not an HTTP API for writing config: no token, no CORS setup, and the JSON sits in the fragment, so it is never sent to the server. Users still log in normally; the same tab keeps the pending import temporarily and returns to the import card after login, clearing it on cancel or save.

::: code-group

```js [Building the import link ~vscode-icons:file-type-js~]
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

URL length is limited by browsers and external platforms; for long personas, copy the JSON instead. The interface targets a WebUI instance that is already reachable — it does not start a MaiBot that is not running.

## Switching Personas from a Plugin

After declaring `personality.list`, `personality.get_current`, and `personality.switch`, a plugin can read the library and switch by name. The full interface is in the [Plugin API Reference](/en/plugin/api-reference#personality).

## Verification and Troubleshooting

**Verify** — save two personas and switch between them; the log shows a successful reload and the style of new replies changes. Reopening "Identity and Personality" shows the current profile name.

**Style did not change after switching** — personas only affect newly generated replies; confirm the log has no hot-reload errors. If the config was changed by something else mid-switch, you are asked to re-read the current persona.

**Import rejected** — check that `format`, `version`, and all six required fields are present, that `multiple_probability` is within 0–1, and that there are no extra fields.

**Name conflict** — the library distinguishes profiles by name; rename before importing a same-named persona.

**External link opens without the card** — confirm the user is logged in to that WebUI; the JSON travels in the fragment, so very long personas should use paste import instead.
