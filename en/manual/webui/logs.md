---
title: Logs & Detailed Statistics
---

# Logs & Detailed Statistics

The **日志** (Logs) page in the top bar groups runtime logs, reasoning traces, and statistics together, switched with three tabs: "终端" (Terminal), "推理过程" (Reasoning), and "详细统计" (Detailed statistics). Each tab also has a direct URL: `/logs`, `/reasoning-process`, and `/statistics`.

## Terminal

![Terminal logs](/images/webui/logs-terminal.webp)

- **Module filter** — the left side lists log sources (`WebUI`, `webui.chat`, the chat manager, `maibot_statistic`, and so on); pick one to see only that module's output
- **Level** — choose the minimum level to show that level and above
- **Time and keywords** — filter by time range, or type keywords in the search box
- **Scrolling** — new logs scroll to the bottom automatically; scrolling back pauses it
- **Clear / Export** — clear the current view or export the logs as a TXT file

The top of the page shows the live connection status and how many log entries are loaded.

## Reasoning

"推理过程" (Reasoning) groups traces by model task and shows the input and output of every reasoning run, which helps when a reply looks odd or Mai did not reply at all.

![Reasoning](/images/webui/reasoning-process.webp)

- **Groups on the left** — the main flow is "规划器" (PLANNER) and "回复器" (REPLYER); below them are `maisaka.replyer`, `reply_supplement`, and standalone LLM requests
- **Record list** — each record shows the type, time, model, duration, and token usage; you can filter by chat stream
- **Details** — selecting a record shows "输出结果" (Output), the number of context messages actually sent, and the full "请求 Items" (Request Items)
- **Copy / Export** — copy or export the current record
- **Replay** — pick a model and click "执行重放" (Run replay) to send the same request again with the current configuration and compare the results

## Detailed Statistics

"详细统计" (Detailed statistics) summarizes model calls, tokens, cost, messages, and online time.

![Detailed statistics](/images/webui/statistics.webp)

- **Period** — since deployment, last 30 days, 7 days, 3 days, 1 day, 3 hours, 1 hour, or 15 minutes
- **Metric trends** — online time, messages, requests, tokens, and cost over time
- **Summary** — total online time, messages, replies, requests, tokens and cache hit rate, total cost, and averages per message, reply, and hour
- **Breakdowns** — by model, task group, module, or request type, with call counts, tokens, cache hit rate, cost, and duration
- **Distribution charts** — cost by source, model, module, and request type, plus message distribution and cost per chat stream
- **Refresh / Open HTML version** — re-read the statistics snapshot or open the standalone HTML report

"总回复数" (Total replies) counts `reply` tool calls, not incoming messages.

## Related Docs

- [Bot Config → Logging](../configuration/bot-config.md#logging) — log levels, file count, and retention
- [Data Management](./data-management.md) — package up logs and statistics for export
