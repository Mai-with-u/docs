---
title: Chat and Replies
---

# Chat and Replies

This page covers reply behavior: whether Mai responds at all, talking too much or too little, slow replies, and messages that seem to be dropped.

## How does MaiBot decide whether to reply?

A new message passes debouncing first, then the Planner decides whether to respond, whom to address, and which tools to call.

Settings that shape that decision:

- **`[chat.reply_timing].talk_value`** — Group speaking rate. 0 is quietest, 1 is the normal rate.
- **`[chat.reply_timing].inevitable_at_reply`** — Reply to @-mentions when possible. On by default.
- **`[chat.reply_timing].mentioned_bot_reply`** — Replies more readily when the message names the bot.
- **`no_action_backoff_*`** — After several consecutive no-reply decisions the check pace slows down; new messages wake it early.

Change one value, observe for a while, then decide the next step.

## How do I make MaiBot speak more or less often?

Tune from broadest to narrowest:

**Overall rate** — Change `[chat.reply_timing].talk_value`. 0.3–0.5 is noticeably quieter.

**One group or time window** — Use speaking-rate rule groups. `[chat.reply_timing.talk_rule_groups].active_group` picks the active group, and rules inside it match on platform, chat ID, and time:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing.talk_rule_groups]
active_group = "Night"   # Active rule group

[[chat.reply_timing.talk_rule_groups.groups]]
name = "Night"

[[chat.reply_timing.talk_rule_groups.groups.rules]]
platform = "qq"          # Empty = any platform
item_id = "123456"       # Empty = any chat
rule_type = "group"      # group / private
time = "23:00-02:00"     # Empty = fallback, "*" = all day
value = 0.3              # Quieter for this group during this window
```

:::

Create, copy, and switch groups in WebUI; individual rules can be disabled on their own. Chats matching no rule fall back to `talk_value`.

**Prompt level** — `behavior_style` in the personality and `[chat.reply_style].group_chat_prompt` also shape the Planner's decision to speak.

## Why does the bot reply to its own messages?

First check whether the adapter feeds the bot's own outgoing messages back as inbound, and whether the bot account configured in the adapter is correct.

Then check plugins that may intercept and resend messages, the filters under `[message_receive]`, and the speaking-rate settings. If the message path is correct but the Planner keeps replying to itself, compare with another Planner model. Do not conclude from this symptom alone that the model is bad.

## Several messages in a row — why is only the first handled?

By default they are merged into one batch by debouncing. The window is set by `[chat.reply_timing].message_debounce_mode` for groups and `private_message_debounce_mode` for private chats, with four levels:

- **`off`** — No merging; keeps the original wait logic.
- **`fast`** — 1s when quiet, 3s when active. Fastest, but easily misses follow-up fragments.
- **`natural`** — Default. 2s when quiet, 5s when active.
- **`steady`** — 4s when quiet, 7s when active, leaving more room for follow-ups.

To interrupt the current reasoning and restart as soon as a message arrives, turn on `[chat.reply_timing].planner_message_steering` (quick reaction mode, group chats only).

## Why are replies slow?

Use the log to see where time goes: model request, tool calls, image recognition, adapter delivery, or a Planner wait action.

Common causes, roughly by impact:

- `max_context_size` / `max_private_context_size` too large, pushing too many messages into each turn.
- A slow model, or provider-side queueing.
- "Condense long tool results" (`[capabilities].tool_result_condense`) adds one extra model request.
- A plugin Hook blocking; look for warnings near `[plugin_runtime].hook_blocking_timeout_sec`.

If new messages always wait for the previous turn, enable quick reaction mode.

## Why does a reply collapse into a short fallback phrase?

Check the raw model output first to separate model output from post-processing. With reply splitting enabled, inspect `max_sentence_num`, `max_split_num`, and `enable_overflow_return_all` under `[response_splitter]`.

If the problem persists with splitting off, check personality, group prompts, and the model itself.

::: info Source note
Some symptoms and troubleshooting ideas here were adapted from the community [Quick FAQ](https://www.kdocs.cn/l/ctOGhVv6L8Yq); the self-reply notes were credited to 千石可乐 in the original. This page has been rewritten against the current message path and configuration.
:::
