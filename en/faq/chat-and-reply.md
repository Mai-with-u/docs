---
title: Chat and Replies
---

# Chat and Replies

This page covers reply behavior: whether Mai responds at all, talking too much or too little, slow replies, and messages that seem to be dropped.

## How does MaiBot decide whether to reply?

A new message passes debouncing first, then the Planner decides whether to respond, whom to address, and which tools to call.

Settings that shape that decision:

- **`[chat.reply_timing].talk_value`** — Group viewing rate, the base probability that a batch of messages reaches the Planner. 0 never looks proactively, 1 looks at every batch.
- **`[chat.reply_timing].inevitable_at_reply`** — Reply to @-mentions when possible. On by default.
- **`[chat.reply_timing].mentioned_bot_reply`** — Replies more readily when the message names the bot.
Change one value, observe for a while, then decide the next step.

## How do I make MaiBot speak more or less often?

Tune from broadest to narrowest:

**Overall rate** — Change `[chat.reply_timing].talk_value`. 0.3–0.5 is noticeably quieter. It is the probability that a batch reaches the Planner, not the actual reply ratio: once the bot starts a round of reasoning, the chance of looking again rises several times, and after a quiet stretch it falls back to the base probability.

**One group or time window** — Use viewing-rate rule groups. `[chat.reply_timing.talk_rule_groups].active_group` picks the active group, and rules inside it match on platform, chat ID, and time:

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
value = 0.3              # Viewing probability for this group during this window; 0 never looks
```

:::

Create, copy, and switch groups in WebUI; individual rules can be disabled on their own. Chats matching no rule fall back to `talk_value`.

**Prompt level** — `behavior_style` in the personality and `[chat.reply_style].group_chat_prompt` also shape the Planner's decision to speak.

## Why does the bot reply to its own messages?

First check whether the adapter feeds the bot's own outgoing messages back as inbound, and whether the bot account configured in the adapter is correct.

Then check plugins that may intercept and resend messages, the filters under `[message_receive]`, and the viewing-rate settings. If the message path is correct but the Planner keeps replying to itself, compare with another Planner model. Do not conclude from this symptom alone that the model is bad.

## Several messages in a row — why is only the first handled?

By default they are merged into one batch by debouncing. The window is set by `[chat.reply_timing].message_debounce_mode` for groups and `private_message_debounce_mode` for private chats, with four levels:

- **`off`** — No merging; keeps the original wait logic.
- **`fast`** — 1s when quiet, 3s when active. Fastest, but easily misses follow-up fragments.
- **`natural`** — Default. 2.5s when quiet, 6s when active.
- **`steady`** — 5s when quiet, 9s when active, leaving more room for follow-ups.

The whole-batch cap grows with the level: 8s for fast, 10s for natural, 12s for steady; an @-mention or name drop caps the wait at 1s, 2s, and 3.5s respectively.

To interrupt the current reasoning and restart as soon as a message arrives, turn on `[chat.reply_timing].planner_message_steering` (quick reaction mode, group chats only).

## Why are replies slow?

Use the log to see where time goes: model request, tool calls, image recognition, adapter delivery, or a Planner wait action.

Common causes, roughly by impact:

- `max_context_size` / `max_private_context_size` too large, pushing too many messages into each turn; the token cap (`use_token_limit` with `max_context_tokens`) trims older history by actual input usage instead.
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
