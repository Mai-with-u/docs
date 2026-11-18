---
title: Chat Scenes
---

# Chat Scenes

MaiBot behaves differently in group chats and private chats: in groups she decides batch by batch whether to look at the chat, in private she tracks one person's rhythm. This page covers how to tune each side.

## Group viewing frequency

Whether a batch of group messages enters the Planner is decided by **Group viewing frequency**, a value from 0 to 1, default `1`. It is the base probability for each batch, not the share of messages that actually get replies — after viewing there is still a decision about whether and how much to say. `0` never looks proactively; `1` looks at the full probability. How many batches in a row she actually looks at is set by the decay below.

Once she looks, an internal frequency starts from that value and drops by 1/16 on every effective Planner run. Until it reaches zero the viewing probability stays at 1, and no new activation happens during the decay. After it hits zero a recovery phase runs, restoring the base probability over 16 decisions; looking again during recovery restarts the decay. Thus the base probability sets how many batches in a row she can look at right after activating: about 16 rounds at `1`, about 8 at `0.5`. A frequency change does not terminate a Planner loop already running.

MaiBot also predicts the next message from the average receive interval of external messages in the current and previous context, and runs a probability check when no message arrives by then. The value affects group chats only; private chats have their own pause switch.

## Dynamic viewing rule groups

Give different groups different viewing probabilities by scenario. Rule groups can be created, copied, and switched, each holding several rules; only rules enabled in the active group take part in matching.

::: fields
- **`enabled`** — When off, the rule is kept but never matches.
- **`platform`** — Platform the rule applies to; empty means any platform, `*` means every platform.
- **`item_id`** — Group number or user ID; empty means any chat, `*` means every chat.
- **`rule_type`** — `group` or `private`.
- **`time`** — Time window; empty is the fallback, `*` is all day, or a range like `23:00-02:00`.
- **`value`** — External viewing probability under this rule, from 0 to 1; `0` never looks proactively.
:::

Group rules must name a platform or a group ID — a wildcard target fails config validation outright. Use **Group viewing frequency** for the default that applies to every group.

Rule group names cannot be empty, cannot have leading or trailing whitespace, and must be unique. The active group must exist — otherwise config validation fails immediately.

## Message debouncing

Debouncing decides how long a batch of messages waits before being evaluated. Groups and private chats have independent levels, both defaulting to **Natural**:

::: fields
- **Off** — New messages never wait; they go straight to evaluation.
- **Fast** — Quiet 1s, active 3s; same-sender follow-ups 1s, sender change 0.5s in groups.
- **Natural** — Default. Groups: quiet 2.5s, active 6s, same-sender follow-ups 2.5s, sender change 1s. Private: quiet 2s, active 5s, follow-ups 2s.
- **Steady** — Groups: quiet 5s, active 9s, same-sender follow-ups 5s, sender change 3s. Private: quiet 4s, active 7s, follow-ups 4s.
:::

A new batch picks its initial wait from the gap since the last valid message: more than 30 seconds counts as quiet, otherwise active. Rules shared across all levels: an image-only opener waits at least 4s and later messages still recompute by the follow-up rule; pure sticker messages inside a batch cannot extend the wait but can end it early. Counted from the first message actually received, a group batch waits at most 8, 10, or 12 seconds under fast, natural, and steady, and at most 1, 2, or 3.5 seconds after an @ or name mention with consecutive mentions taking the earliest cap; a private batch waits at most 8 seconds and a private mention ends the wait immediately. Caps take priority over every other waiting rule.

Changing levels applies from the next valid message and never resets the batch or mention caps; choosing Off ends an in-progress wait. These waits exclude model generation and send time.

## Quick reaction

**Quick reaction mode** is off by default and applies to groups only: the Planner is forced to stream, and a new message arriving during thinking or output interrupts it immediately and re-requests with the new message attached. Private chats and wait wake-ups are unaffected.

Interrupted thinking and output stay in history and can be inspected in Mai Observation.

## Pausing private replies

With **Pause private replies** on, every private chat only receives messages and maintains history — nothing enters thinking. Individual chats override the global setting through pause rules keyed by platform and user ID, toggled from chat stream settings or set back to follow the global value.

## Private Planner templates

A regular private chat uses `maisaka_chat_private`; with passive replies enabled it uses `maisaka_chat_private_passive`. Both templates decide around the current user's messages, unfinished requests, and the ongoing conversation, taking their output protocol from the `reply` tool and from natural-language reply guidance respectively. Private chat notes, memory query rules, attention drift, and tool permissions are still injected per private scene.

Groups and unbound sessions use `maisaka_chat` / `maisaka_chat_passive`, and Focus uses `maisaka_chat_focus`; private chats in the same Focus group also follow Focus's unified protocol. The Chinese, English, and Japanese private templates can each be edited on the Prompt management page, and existing general Planner custom templates do not automatically apply to the new private templates.

## Focus

Focus lets chats in the same group share one continuously thinking Planner: messages from all members enter the same context, and tools name their target through `session_id`.

::: fields
- **`focus_mode`** — Master switch, off by default.
- **`focus_on_private`** — Whether Focus also covers private chats, off by default.
- **`focus_groups`** — Members of each Focus group. Chats in one group share the Planner and full context; different groups run independently, and chats matching no group keep the normal mode. Empty means every chat uses the normal mode.
- **`focus_chat_whitelist`** — Further narrows the scope inside matching groups; empty means no extra restriction, and group membership is still required.
:::

Focus still checks admission through each scene's own rules. After long waits, MaiBot is prompted to extend the wait or close the conversation herself.

## One-off chat schedules

Groups, private chats, and Focus share the same `schedule` tool: MaiBot can set herself a one-time task to run at a chosen moment and picks it up in the original chat when it expires.

::: code-group

```json [Add a schedule ~vscode-icons:file-type-json~]
{"action": "add", "text": "Remind everyone to submit their homework", "delay_seconds": 600}
```

:::

You can also give `due_at` (ISO 8601, preferably with a time zone), which cannot be combined with `delay_seconds`. The tool supports `list`, `update`, `cancel`, and `complete`; call `list` first to get the real `todo_id` before changing anything. Focus must also pass the group's real `session_id`; other modes bind the current chat automatically.

The core process persists schedules and checks every second, independent of whether the desktop pet is running. When one expires, an internal task is delivered to the original chat and the Planner wakes—including Focus groups that are waiting on a timer. The Planner executes with the latest context and archives the task when done. A schedule only returns to its original chat; it never posts to other groups, and cross-group items never enter the owner chat's persistent to-do context. Creating a schedule does not pause the current turn, and it does not mean the expiry message has already been sent.

The desktop pet panel, the owner's `desktop_pet_todo`, and `schedule` share one item file and its attachments: the pet is a management entry point, and the core process is the only writer. After a restart, expired tasks that were not yet acknowledged are delivered again; status `triggered` only means delivered, `failed` keeps the error, and a task retries only after being rescheduled to a future time. If the process exits between a successful delivery and writing the acknowledgement, a task may be delivered twice, so strict exactly-once execution is not guaranteed.

Cancelling keeps the record and completing archives it; `list(include_completed=true)` returns completed and cancelled history.

## Quote frequency

Group and private quotes (replies that carry the original message) each have their own level: never, occasionally, or often, defaulting to occasionally. Often is twice as likely as occasionally.

Groups decide by a fixed random rule; private chats decide from the user's consecutive message count, message spacing, and the position of the reply target.

## Verify and troubleshoot

**Verify** — Set **Group viewing frequency** to `0.2` in one group and save. Over half an hour MaiBot should enter thinking noticeably less; setting it back to `1` makes her look much more often, though after a dozen or so consecutive looks she pauses for a while on her own.

- **A rule has no effect** — Confirm the rule's group is the active group and the rule itself is enabled.
- **Saving reports an error** — Check for empty, whitespace-padded, or duplicate rule group names, and that group rules name a platform or group ID.
- **Too noisy or too quiet** — Adjust **Group viewing frequency** first, then split by group with dynamic viewing rule groups. Debounce levels change waiting time, not viewing probability.
- **Context is trimmed too early** — Check whether the token limit is on; a low threshold cuts old history while messages are still few. You can also raise the group or private context size.
- **Private chats get no replies at all** — Check whether **Pause private replies** is on and whether a pause rule matches that user.
