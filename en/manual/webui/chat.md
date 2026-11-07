---
title: Chatting with Mai
---

# Chatting with Mai

The **麦麦聊天** (Chat) page (`/chat`) under "概览" (Overview) in the sidebar is the WebUI's built-in chat window. It does not go through a platform adapter such as QQ: messages go straight into MaiBot's internal chat stream, which is handy before you connect a platform or when you just want to try out reply behavior.

![Chatting with Mai](/images/webui/chat.webp)

## Local Chat Room

"与麦麦聊天" (Chat with Mai) on the left is the local chat room, showing Mai's avatar and connection status. It connects automatically when the page opens; type in the box at the bottom to send a message.

- **Sending** — press Enter to send, Shift + Enter for a new line
- **Identity** — "以「人类」发送" (Send as "Human") above the input lets you change your nickname and avatar in this room
- **Images** — "添加图片" (Add image) attaches pictures to the next message
- **Attachments** — the paperclip button sends files; enable [file features](../configuration/bot-config.md#files) first
- **Emoji stickers** — pick one from "用户表情包" (User stickers) to send to Mai
- **Header actions** — "会话信息" (Conversation info) shows the message count and connection status; "清空当前显示" (Clear display) only clears the messages shown on the page and keeps the history

The local chat room uses the planner and replyer models too; Mai will not answer until models are configured.

## Observing Real Chat Streams

"麦麦的聊天流" (Mai's chat streams) lists every chat stream Mai has created, including the internal private chat and group/private chats on each platform, sorted by recent activity. Each entry shows a preview of the last message and the current status.

Clicking a stream opens **observe mode**: you watch Mai's reasoning, tool calls, and outgoing messages for that stream in real time, but nothing is sent to the platform. Use it to find out why Mai did not reply, or to watch how it behaves in a group.

The gear on the right of each stream opens settings for that stream:

- **Conversation info** — Session ID, platform, type (group/private), group number or user ID
- **Adapter rules** — the adapter access rules matched by this stream and the global defaults
- **Frequency rules** — global default frequency plus time-based rules; you can add rules specific to this stream
- **Chat prompt** — the group/private prompt for this stream, plus an extra prompt that applies only here
- **Expression and jargon** — separate "use" and "learn" switches, with the matched learning scope
- **Delete chat stream** — removes all messages, learned content, tool records, and statistics for the stream; requires typing the full session_id to confirm

## Related Docs

- [Learning Management](./learning.md) — expressions, jargon, and emoji stickers
- [Viewing & Managing Memory](./memory-management.md) — what Mai remembers
- [Command Management](./command-management.md) — plugin commands and execution permissions
