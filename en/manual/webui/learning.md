---
title: Learning Management
---

# Learning Management

The **学习** (Learning) page (`/resource/learning`) under "资源管理" (Resources) in the sidebar manages what Mai has learned from chats, split into three tabs: "表达方式" (Expressions), "黑话" (Jargon), and "表情包" (Emoji stickers).

## Expressions

Mai learns how people talk in chats: which situation calls for which style, and which sentences were actually used. The list groups entries by situation and shows the situation, style, and curated status.

![Expressions](/images/webui/expression.webp)

- **Chat scope** — filter by chat stream or shared group on the left; "全部" (All) shows every source, and each scope has "学习" (Learn) and "使用" (Use) switches
- **Sorting** — "最近活跃" (Recently active) orders by last use; "仅精选" (Curated only) shows expressions marked as curated
- **New / Edit / Delete** — add expressions by hand or fix ones learned incorrectly
- **Export** — export the expressions in the current scope for backup or migration
- **Card review** — swipe through expressions to approve or reject them one by one: only approved expressions are used, and rejected ones are deleted immediately; "AI审核记录" (AI review history) sits alongside
- **Clusters** — "聚类" in the "更多操作" (More actions) menu browses expressions by semantic similarity

## Jargon

The jargon tab records slang and abbreviations used in the group, along with their meanings and occurrence counts.

![Jargon](/images/webui/jargon.webp)

- The top shows the total count, confirmed jargon, and completed inferences
- Each row shows the term, meaning, source chat, whether it was added manually, and how often it was seen
- "新增黑话" (New jargon) adds an entry by hand; "查看/编辑" (View/Edit) fixes the meaning; "删除" (Delete) removes it
- "导出黑话" (Export jargon) exports the current scope

## Emoji Stickers

The emoji tab manages the stickers Mai can send: upload, review, block, and delete.

![Emoji stickers](/images/webui/emoji.webp)

- **Status filter** — registered, pending · recognized, pending · unrecognized, disabled, or all
- **Format and sorting** — filter by format, sort by registration or upload time, and switch card size
- **Upload** — add a new sticker; its content is recognized automatically and it lands in "pending · recognized" or "pending · unrecognized" based on the result
- **Card actions** — edit the description, block it (stop sending), or delete it

## Learning Scope

Expression and jargon learning scopes are controlled by `[expression].learning_list` and `[jargon].learning_list`; each chat stream can also turn learning and use on or off in its settings. See [Bot Config → Learning Systems](../configuration/bot-config.md#learning-systems) for the scope and blocklist syntax.

## Related Docs

- [Bot Config → Learning Systems](../configuration/bot-config.md#learning-systems) — `learning_list`, `learning_blacklist`, and shared groups
- [Bot Config → Emoji Stickers](../configuration/bot-config.md#emoji-stickers) — sticker sending, review, and cache cleanup
- [Chatting with Mai](./chat.md) — turn learning and use on or off in chat stream settings
