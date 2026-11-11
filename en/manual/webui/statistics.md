---
title: Statistics and Observation
---

# Statistics and Observation

The WebUI has two panels for watching what happens: **home and detailed statistics** answer "how much was spent and used", and **Mai Observation** answers "what was Mai thinking just now".

## Detailed statistics

**Advanced tools → Detailed statistics** in the sidebar (`/statistics`). The header shows the cutoff time and the reporting window, which you can switch:

::: fields
- **Model calls** — Model, task, and duration for each request.
- **Tokens and cost** — Distributed by model, task group, and time.
- **Messages and uptime** — Sent and received counts plus running time.
- **Cache** — Hits versus misses.
:::

Charts switch dimensions and the detail table expands; when there is no data the page shows "no data in the current window".

The cards on the home page summarize the same data — click one to jump into detailed statistics.

## Mai Observation

**Mai Observation** in the sidebar (`/observation`; live monitoring at `/monitor`). It shows Mai's thinking and replies per chat stream:

::: fields
- **Thinking** — Planner reasoning, tool calls, and results, grouped by turn and collapsible.
- **Replies** — The actual text, images, stickers, and quotes sent.
- **Waiting and debounce** — Whether the stream is waiting and how long debouncing has left.
- **Context trimming** — Records of what was trimmed when context overflowed.
- **Tool status** — Hover to inspect each tool's status and duration.
:::

The composer switches between **Chat** and **Ask** modes; see [Mai Help](./ai-help.md) for the latter.

## Reasoning process

**Reasoning process** in the sidebar (`/reasoning-process`) stores each turn's records:

::: fields
- **Record list** — Newest first, filterable by chat stream.
- **Stage detail** — The actual prompt stages of each Planner and Replyer run.
- **Tool call records** — Arguments and results tied to a specific turn.
- **Replay** — Replays a stored turn.
- **Import** — Imports reasoning records from a file for troubleshooting.
:::

Records consume disk space and grow with history, so watch instance space on long-running deployments.

## What the panels tell you

::: fields
- **Mai does not reply** — Check whether the stream is waiting, whether debouncing merged the message, or whether access policy filtered it out.
- **Replies go off track** — Expand that turn's thinking and see whether memory retrieval, a tool result, or a plugin rewrote the reply.
- **Model errors** — Locate the exact request in tool calls and stage detail, then compare against [model configuration](../configuration/model-config.md).
- **Unexpected spend** — Break down detailed statistics by model and task group to see which kind of request is growing.
:::

## Verify and troubleshoot

**Verify** — Send a message in **Mai chat**, then open Mai Observation: the turn's thinking, tool calls, and final reply should be visible, and the model call count in detailed statistics should increase.

- **No new records** — Confirm the page is connected to the current bot; after switching bots, pick the chat stream again.
- **Statistics show zero** — Switch the reporting window; statistics are written from task records, so a fresh start may have no data yet.
- **Reasoning records take too much space** — Clean old records periodically or lower how much is kept.
- **Home cards disagree with detailed statistics** — Their windows may differ; align the windows before comparing.
