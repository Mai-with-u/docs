---
title: Chat Management
---

# Chat Management

**Mai chat** is the chat room inside the WebUI: on one side your one-on-one conversation with Mai, on the other her observation of each chat stream. Every conversation switches in the same page.

## Session list

The left sidebar has two groups:

::: fields
- **Chat with Mai** — Your local chat room sessions, running on the `internal / owner` identity and sharing one history with the desktop pet.
- **Mai's chat streams** — Mai's real chat streams on each platform, marked **Observe**, used to read her conversations with others.
:::

The list searches by name, sorts by most recent message, and shows online or offline state. The settings button in a conversation header opens that session's chat settings.

## Local chat room

The local chat room switches identity and avatar: edit the nickname, change the avatar, or start a virtual identity conversation to simulate a different user talking to Mai.

- Virtual identity nicknames are handled separately and never touch the `internal / owner` nickname.
- In normal mode the nickname is stored centrally by the main program, so one change reaches other web pages and the desktop pet.

## Observing chat streams

A selected stream shows its history and live messages on the right. The header carries the session name, status, and run indicators; collapsing the sidebar gives the conversation more room.

Hovering a chat stream reveals the learning and usage switches for expressions and slang, the current reply frequency, run state, and recent messages.

## Per-session settings

A single chat stream's settings open from its header:

::: fields
- **Reply frequency** — Adjusted per chat stream; see [Chat scenes](../chat-scenes.md).
- **Pause replies** — Private chats only; pause this chat or follow the global setting.
- **Learning switches** — Learning and usage of expressions and slang are controlled separately.
:::

## Chat attachments

The paperclip in the composer uploads attachments sent with the message, up to four images at once (8 MiB and 25 million pixels each). Upload, download, and text reading are covered in [File capabilities](../files.md).

## Verify and troubleshoot

**Verify** — Send a message under **Chat with Mai** and Mai should reply. Switch to a group stream under **Mai's chat streams** and its history should be visible.

- **Messages do not send** — Confirm the current bot is running; the chat page is read-only while it is stopped.
- **The stream list is empty** — Confirm the bot has an adapter connected and has received messages; a fresh instance has no history.
- **A nickname change does not sync** — The main program stores it and only syncs after a successful save; check that `data/internal_chat_profile.json` is writable.
- **History messages repeat** — Refresh to re-fetch; if it persists, report it with the session ID.