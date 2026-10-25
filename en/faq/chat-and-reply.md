---
title: Chat and Replies
---

# Chat and Replies

## How does MaiBot decide whether to reply?

New messages first go through debouncing, then the Planner decides whether to respond. The reply tendency is mainly tuned by the frequency settings `talk_value` and `talk_value_rules`: Mai tries to reply when @-mentioned and replies more easily when named. After several consecutive no-reply decisions, the check pace automatically slows down via `no_action_backoff_*`.

After changing the frequency, observe for a while before fine-tuning further.

## How do I make MaiBot speak more or less often?

Adjust group or private-chat frequency, then check the per-chat and per-time rules (`talk_value_rules`). When rules are enabled, a matching rule may override the base value. Personality and group prompts can also affect the Planner's decision to speak.

Make small changes and observe the result.

## Why does the bot reply to its own messages?

Check whether the adapter feeds outgoing bot messages back into MaiBot and whether the configured bot account is correct. Then inspect plugin conflicts, message filtering, and frequency rules.

If the message path is correct but the Planner still chooses repeated replies, adjust frequency or test another Planner model. The symptom alone does not prove a model-quality issue.

## Why is only the first of several consecutive messages handled?

First check whether the messages were merged into one batch by debouncing; model latency, tool calls, and context size also slow down a single turn.

To let new messages arriving during thinking, output, or waiting join immediately and restart reasoning, enable quick reaction mode (`[chat.reply_timing].planner_message_steering`).

## Why are replies slow?

Use logs to identify whether time is spent on model requests, tools, image recognition, adapter delivery, or Planner waiting. Then inspect network latency, model speed, context length, and unnecessary plugins. If new messages always wait for the previous turn to finish, enable quick reaction mode (`planner_message_steering`) so they join immediately.

## Why does a reply become a very short fallback phrase?

Inspect the raw model output to distinguish model output from post-processing. When reply splitting is enabled, check `max_sentence_num` and `enable_overflow_return_all`. If disabling splitting does not resolve the issue, continue with personality, prompt, and model checks.

::: info Source note
Some symptoms and troubleshooting ideas on this page were adapted from the community [Quick FAQ / Community Tutorial](https://www.kdocs.cn/l/ctOGhVv6L8Yq). The source explicitly credits 千石可乐 for experience related to the bot replying to itself. This page rewrites that material for the current message path and configuration.
:::
