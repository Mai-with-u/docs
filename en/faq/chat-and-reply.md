---
title: Chat and Replies
---

# Chat and Replies

## What is the difference between frequency and dynamic trigger?

`[chat.reply_timing].reply_trigger_mode` decides when new messages enter the Planner:

- **`frequency` (default)** — decides whether to think based on the number of new messages; simple and predictable
- **`dynamic`** — estimates the reply likelihood of each message batch, then uses a one-hour sliding window to pull the actual reply count back to the configured target, matching real chat rhythm better than the old necessity trigger. It **only applies to group chats; private chats are not gated**. No new config option was added

The old necessity trigger (`reply_necessity`, essentially rule scoring) was replaced in 1.3.2 by this "fitted probability + closed-loop rate control" and is rewritten to `dynamic` on upgrade. After switching modes, observe for a while before deciding whether to fine-tune `talk_value`.

## How do I make MaiBot speak more or less often?

Adjust group or private-chat frequency, then check dynamic frequency rules. When dynamic rules are enabled, a matching rule may override the base value. Personality and group prompts can also affect the Planner's decision to speak.

Make small changes and observe the result instead of treating one value as universal.

## Why does the bot reply to its own messages?

Check whether the adapter feeds outgoing bot messages back into MaiBot and whether the configured bot account is correct. Then inspect plugin conflicts, message filtering, and dynamic frequency rules.

If the message path is correct but the Planner still chooses repeated replies, adjust frequency or test another Planner model. The symptom alone does not prove a model-quality issue.

## Why is only the first of several consecutive messages handled?

Whether a new message restarts Planner reasoning depends on the trigger mode and consecutive-interrupt limit. Model latency, tool calls, and context size also affect responsiveness.

Review `planner_interrupt_max_consecutive_count`, but do not copy a fixed value blindly. More permissive interruption improves responsiveness but can increase model calls and context use.

## Why are replies slow?

Use logs to identify whether time is spent on model requests, tools, image recognition, adapter delivery, or Planner waiting. Then inspect network latency, model speed, context length, and unnecessary plugins. Also review interruption settings if new messages wait for the previous turn to finish.

## Why does a reply become a very short fallback phrase?

Inspect the raw model output to distinguish model output from post-processing. When reply splitting is enabled, check `max_sentence_num` and `enable_overflow_return_all`. If disabling splitting does not resolve the issue, continue with personality, prompt, and model checks.

::: info Source note
Some symptoms and troubleshooting ideas on this page were adapted from the community [Quick FAQ / Community Tutorial](https://www.kdocs.cn/l/ctOGhVv6L8Yq). The source explicitly credits 千石可乐 for experience related to the bot replying to itself. This page rewrites that material for the current message path and configuration.
:::
