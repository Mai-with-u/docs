---
title: Chat Scenes
---

# Chat Scenes

MaiBot behaves differently in group chats and private chats: in groups she reads the room and paces how often she speaks, in private she tracks one person's rhythm. This page covers how to tune each side.

## Talk frequency

How often MaiBot speaks up in groups is controlled by **Group talk frequency**, a value from 0 to 1 where lower is quieter, default `1` (normal frequency). It only affects groups; private chats have their own pause switch.

## Dynamic talk rule groups

Give different groups different talk frequencies by scenario. Rule groups can be created, copied, and switched, each holding several rules; only rules enabled in the active group take part in matching.

::: fields
- **`enabled`** — When off, the rule is kept but never matches.
- **`platform`** — Platform the rule applies to; empty means any platform, `*` means every platform.
- **`item_id`** — Group number or user ID; empty means any chat, `*` means every chat.
- **`rule_type`** — `group` or `private`.
- **`time`** — Time window; empty is the fallback, `*` is all day, or a range like `23:00-02:00`.
- **`value`** — Talk frequency for this rule; `0` is quieter, `1` is normal.
:::

Group rules must name a platform or a group ID. To change the default for every group, use **Group talk frequency** instead of a wildcard rule.

Rule group names cannot be empty, cannot have leading or trailing whitespace, and must be unique. The active group must exist — otherwise config validation fails immediately.

## Message debouncing

Debouncing decides how long a batch of messages waits before being evaluated. Groups and private chats have independent levels, both defaulting to **Natural**:

::: fields
- **Off** — New messages never wait; they go straight to evaluation.
- **Fast** — Quiet 1s, active 3s; in groups, same-sender follow-ups 1s, sender change 0.5s.
- **Natural** — Default: quiet 2s, active 5s; in groups, same-sender follow-ups 2s, sender change 0.5s.
- **Steady** — Quiet 4s, active 7s; in groups, same-sender follow-ups 4s, sender change 2s.
:::

A new batch picks its initial wait from the gap since the last valid message: more than 30 seconds counts as quiet, otherwise active. Shared limits across all levels: an image-only opener waits at least 4s, pure sticker messages inside a batch do not extend the wait, a batch is capped at 8s, and an @mention or name mention caps the wait at 1s. Caps take priority over every other waiting rule.

Changing levels applies from the next valid message and never resets the batch or mention caps; choosing Off ends an in-progress wait. These waits exclude model generation and send time.

## Quick reaction

**Quick reaction mode** is off by default and applies to groups only: the Planner is forced to stream, and a new message arriving during thinking or output interrupts it immediately and re-requests with the new message attached. Private chats and wait wake-ups are unaffected.

Interrupted thinking and output stay in history and can be inspected in Mai Observation.

## Pausing private replies

With **Pause private replies** on, every private chat only receives messages and maintains history — nothing enters thinking. Individual chats override the global setting through pause rules keyed by platform and user ID, toggled from chat stream settings or set back to follow the global value.

## Focus

Focus lets chats in the same group share one continuously thinking Planner: messages from all members enter the same context, and tools name their target through `session_id`.

::: fields
- **`focus_mode`** — Master switch, off by default.
- **`focus_on_private`** — Whether Focus also covers private chats, off by default.
- **`focus_groups`** — Sharing groups. Chats in one group share the Planner and full context; different groups run independently, and chats matching no group keep the normal mode. Empty means every chat uses the normal mode.
- **`focus_chat_whitelist`** — Further narrows the scope inside matching sharing groups; empty means no extra restriction, and group membership is still required.
:::

Focus still checks admission through each scene's own rules. After long waits, MaiBot is prompted to extend the wait or close the conversation herself.

## Reply templates and creative mode

**Chat → Chat settings → Creative mode** maps to `chat.creative_mode` and is on by default. When off, the regular multi-message template is used; when on, the general retro template is used: persona, group notes, and attention hints go into system, while the chat log and reply requirements are assembled into a single user message.

Expression habits, keyword reactions, attachment references, duplicate-reply reminders, and plugin requirements are all preserved in either template.

When the model name or ID contains `mai_replier` / `mai-replier`, or equals `v2p1-contract` / `v2p1-raw`, that generation uses the Mai Replier adapter, independent of the creative-mode switch and without switching output language. Plugin-specified models, candidate model switching, and regeneration all re-evaluate this.

## Quote frequency

Group and private quotes (replies that carry the original message) each have their own level: never, occasionally, or often, defaulting to occasionally. Often is twice as likely as occasionally.

Groups decide by a fixed random rule; private chats decide from the user's consecutive message count, message spacing, and the position of the reply target.

## Verify and troubleshoot

**Verify** — Set **Group talk frequency** to `0.2` in one group and save. Over half an hour MaiBot should speak up noticeably less; setting it back to `1` restores the normal rate.

- **A rule has no effect** — Confirm the rule's group is the active group and the rule itself is enabled.
- **Saving reports an error** — Check for empty, whitespace-padded, or duplicate rule group names, and that group rules name a platform or group ID.
- **Too noisy or too quiet** — Adjust **Group talk frequency** first, then split by group with dynamic talk rule groups. Debounce levels change waiting time, not talk frequency.
- **Private chats get no replies at all** — Check whether **Pause private replies** is on and whether a pause rule matches that user.
