---
title: Logs
---

# Logs

The Logs page (`/logs`) collects MaiBot's runtime logs in one place: filter by module and level, search by keyword, and export to a file. The "Reasoning" and "Detailed statistics" tabs on the same page are covered in [Statistics and Observation](./statistics.md).

## Terminal

![Terminal logs](/images/webui/logs-terminal.webp)

- **Module filter** — the left side lists log sources (`WebUI`, `webui.chat`, the chat manager, `maibot_statistic`, and so on); pick one to see only that module's output
- **Level** — choose the minimum level to show that level and above
- **Time and keywords** — filter by time range, or type keywords in the search box
- **Scrolling** — new logs scroll to the bottom automatically; scrolling back pauses it
- **Clear / Export** — clear the current view or export the logs as a TXT file

The top of the page shows the live connection status and how many log entries are loaded.

## Verification and Troubleshooting

**Verify**: set the level to `ERROR` — the panel should immediately show only errors; export a TXT and open it to confirm the content is complete.

- **No new logs** — check the connection status at the top of the page; the page needs to reconnect after the host restarts.
- **Logs scroll too fast to read** — narrow the module filter or time range; logs are also written to the instance's `logs/` directory, so you can read the files directly.
- **Keyword search finds nothing** — switch the module filter back to "All" first; the module filter applies to search results too.

## Related Docs

- [Bot Config → Check Logs First When Debugging](../configuration/bot-config.md#check-logs-first-when-debugging) — log levels, file count, and retention
- [Statistics and Observation](./statistics.md) — reasoning traces and detailed statistics
- [Data Management](./data-management.md) — package up logs and statistics for export
