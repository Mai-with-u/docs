---
title: Internal Chat
---

# Internal Chat

The web chat room and the desktop pet speak in the same "owner" conversation: both share one identity and one chat history, and a nickname changed on the web is used by the pet immediately.

## How identity is defined

::: fields
- **`platform`** — Always `internal`.
- **`user_id`** — Always `owner`, meaning you.
- **Bot account** — `self`.
:::

An existing chat stream is reused; otherwise the normal session creation path creates one. Legacy `webui` private chats keep their original ownership — they are not migrated or merged and are not read as an alias of `internal`. Startup neither backs up the database nor writes a migration task for this. Virtual group chats keep their own platform and group identity.

## Nickname

The display nickname is stored centrally by the main program in `data/internal_chat_profile.json`. The first time a browser connects to normal web chat, its existing nickname is adopted; after that the server-side value wins.

Changing the nickname next to the composer syncs to other web pages, and the desktop pet reads the same nickname on every message. Virtual identities handle nicknames separately.

## Relationship with the desktop pet

Desktop pet chat, todos, and exploration all use this `internal / owner` conversation, so replies to the owner appear in both the pet and the web page.

Messages submitted from the desktop pet keep an interface-origin marker and do not carry protected command permissions. The pet shows itself when the owner's chat stream has new activity; if the chat panel is collapsed it pops a message bubble, and clicking the bubble opens the history.

## How plugins join in

Plugins query the identity and speak through the SDK 2.17.0 interfaces — never compute `session_id` themselves:

::: fields
- **`ctx.internal_chat.identity()`** — Query the current internal chat identity.
- **`ctx.internal_chat.send(text)`** — Start a real chat as the owner; it may trigger a MaiBot reply and enters chat history.
:::

To show a hint in the pet without a model call, use `ctx.desktop_pet.say(text)`: it only displays text in a desktop bubble and never enters chat history, learning, or memory.

## Local SDK debugging

To work against a local SDK, point an environment variable at the checkout before starting the main program:

::: code-group

```powershell [Windows PowerShell ~vscode-icons:file-type-powershell~]
$env:MAIBOT_PLUGIN_SDK_PATH = (Resolve-Path ../maibot-plugin-sdk).Path
uv run bot.py
```

```bash [Linux / macOS ~vscode-icons:file-type-shell~]
export MAIBOT_PLUGIN_SDK_PATH="$(cd ../maibot-plugin-sdk && pwd)"
uv run bot.py
```

:::

The runner and version checks explicitly use the local SDK. Main-program base dependencies still tolerate older SDKs; plugins using new capabilities should declare the required SDK version in their manifest, and an unsatisfied version is reported as incompatible.

## Verify and troubleshoot

**Verify** — Send a message in the web chat room, then open the chat panel in the desktop pet: both sides show the same conversation. Change the nickname on the web, and the pet's next message should use the new one.

- **Web and pet histories disagree** — Confirm both connect to the same bot; different bots keep separate chat data.
- **Nickname change does not reach the pet** — The nickname is stored centrally by the main program and the save must succeed; check that `data/internal_chat_profile.json` is writable.
- **Old chat history is gone** — Legacy `webui` private chats are neither migrated nor merged; start a new conversation.
- **Plugin message gets no reply** — Plugins should use `ctx.internal_chat.send(text)`. `ctx.desktop_pet.say()` only shows a desktop hint and never triggers chat.
