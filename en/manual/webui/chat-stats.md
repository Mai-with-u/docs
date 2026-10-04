---
title: Chat History and Statistics
---

# Chat History and Statistics

See how active MaiBot is and what it has been chatting about! The home page gives an overview, the detailed statistics page shows data, the MaiBot Chat page shows live chat streams and the MaiBot Observation timeline, and the resource pages manage stickers, expression styles, and slang.

## Home Overview

The **home page** (`/`) you land on after login shows the running overview in cards:

![WebUI home page](/images/webui/home.webp)

- **Bot status** — online status and uptime
- **Statistics overview** — messages, replies, requests, token usage
- **News** — news and announcements from official MaiBot channels (new card as of 1.3.0)
- **Trend charts** — requests, tokens, and cost over time
- **Model distribution** — usage share and details per model
- **Prompt cache** — cache hit rate and saved cost
- **Storage usage** — disk usage of the local data directory

Cards can be dragged to reorder, added, removed, and resized; the top-right corner switches between 24-hour / 7-day / 30-day time ranges.

## Detailed Statistics

Switch the top workspace to "日志" (Logs) and select the **详细统计** (Detailed Statistics) tab (`/statistics`) to open the interactive detailed statistics page:

![Detailed statistics](/images/webui/statistics.webp)

The time range can be switched at the top of the page:

- **All time / Last 30 days / Last 7 days / Last 3 days**
- **Last 24 hours / Last 3 hours / Last 1 hour / Last 15 minutes**

### Core Metrics

- **Uptime** — total running duration of the bot
- **Messages / Replies** — messages received and replies sent
- **Requests / Token Usage** — model call count and total input/output tokens
- **Cache Hits** — cache hit/miss tokens and hit rate
- **Cost** — total spend, cost per 100 messages, cost per hour, etc.

### Multi-Dimensional Analysis

Under the **Breakdowns** section you switch the analysis dimension with tabs. Every dimension renders the same detail table, whose columns are name, calls, input tokens, output tokens, total tokens, cache hit/miss tokens, cache hit rate, accumulated cost, and average latency:

- **By model** — request count, tokens, cache hit rate, cost and average latency per model
- **By task group** (as of 1.3.0) — aggregated by the task names configured under `model_task_config` in `model_config.toml`, such as `planner`, `replyer`, `vlm`, `embedding`
- **By module** — call distribution aggregated by feature module (the part before the first `.` in the request type)
- **By request type** — cost share by request type
- **Chat messages** — message volume and cost per chat flow
- **Charts / Metric Trends** — time-series changes in cost, message volume, etc.

**How is "by task group" different from the other dimensions?**

- **By model** answers "which model is burning money"; a task with several models attached is split into several rows
- **By task group** answers "which stage of the pipeline is burning money"; every model under one task is merged into a single row, so you see business stages instead of specific model names
- **By module** answers "which feature is burning money", grouping into functional areas such as message processing or memory retrieval

Use "by task group" when you want to know how much the reply stage costs in total; switch to "by model" afterwards to find which model inside that stage is the most expensive.

After upgrading to 1.3.0, the next statistics refresh re-classifies historical calls by task name. Calls recorded before `task_name` existed are grouped under "未记录" (Unrecorded) and are never inferred from the request prefix or the current configuration.

## Chat Management

As of 1.3.1 the sidebar "概览" (Overview) group no longer has a "聊天管理" (Chat Management) entry, and the former `/chat-management` route keeps only shared group management. To manage shared groups, open **麦麦设置** (MaiBot Settings, `/config/bot`) and click the ellipsis (More settings) in the top-right corner → **共享组设置** (Shared Group Settings):

![Chat management](/images/webui/chat-management.webp)

- Switch between the **表达** (Expression), **黑话** (Slang), and **记忆** (Memory) tabs
- Create shared groups, add chat streams to a group, remove a stream from a group, and delete an entire group
- Chat streams in the same shared group share one set of expression styles, slang, or long-term memory, written to `expression_groups`, `jargon_groups`, and `a_memorix.shared_memory_groups` respectively
- Once `a_memorix.global_memory_sharing_enabled` is on, memory shared groups become read-only and no longer take part in normal memory retrieval scope control
- The "添加聊天" (Add chat) dialog searches by name, platform, user, group number, or session ID, and shows at most the first 50 matches

Browsing chat stream message records, filtering by user / time / chat stream, and managing speaking frequency and learning settings all moved to the **MaiBot Chat** page; see the next section.

## MaiBot Chat

**麦麦聊天** (MaiBot Chat, `/chat`) under the "概览" (Overview) sidebar group lets you talk to MaiBot directly without any external platform, and browse the live chat streams MaiBot is observing from the same page:

![Local chat](/images/webui/chat.webp)

- Type a message and press Enter to send, Shift + Enter for a newline
- Attach images and send your own stickers
- Message history is saved automatically
- The top search box filters both local conversations and observed chat streams by name
- "与麦麦聊天" (Chat with MaiBot) on the left holds local conversations (with MaiBot or a virtual identity); "麦麦的聊天流" (MaiBot's chat streams) holds real group and private chats

![Sending a message in local chat](/images/webui/chat-message.webp)

### Local User Identity

The box on the right of the input area is the **local user identity** box (moved here from the sidebar as of 1.3.1):

- Click the pencil icon next to the nickname to rename it, then press Enter or click **保存** (Save); saving an empty value falls back to the default nickname
- Click the camera icon at the bottom-right of the avatar to upload a new one; JPEG, PNG, WebP, GIF, and BMP are supported
- Avatars for virtual identities are managed separately in the conversation list

### Settings for Observed Chat Streams

Every session under "麦麦的聊天流" (MaiBot's chat streams) has a gear icon on its right that opens the **in-page** chat stream settings dialog (as of 1.3.0 it no longer navigates to the chat management page). It contains:

- **Session basics** — session ID, platform, type, group / user ID
- **Adapter rules** — allow or block the specific adapters under this session
- **Speaking frequency rules** — configure the default frequency and dynamic frequencies per time range
- **Extra chat stream prompts** — append dedicated prompts for this session
- **Learning settings** — enablement status and corrections for expression, slang, and behavior
- **Delete chat stream** — a serious confirmation that requires typing the full `session_id`, cleaning up messages, expression learning, slang links, tool call records, and statistics data

## MaiBot Observation

Select any session under "麦麦的聊天流" (MaiBot's chat streams) on the MaiBot Chat page and the **MaiBot Observation** timeline for that session appears on the right. MaiBot Observation has been merged into the chat workspace and no longer has its own sidebar entry.

- **Stage status** — the status bar at the top shows the current stage (Planner, replier, etc.), the round, and the agent state
- **Live reasoning** — as soon as Planner returns, the thinking content and tool execution state appear, and each tool result updates **in place inside the same card**; you no longer wait for the whole round to finish. Repeated pushes for the same round (cycle / run) also refresh only the original position
- **Stable ordering** — entries follow the actual broadcast / write order, fixing the issue where a new round overwrote old cards after a restart
- **Find previous** — click **上条** (Previous) to jump up to the nearest MaiBot-sent message above the viewport and highlight it; if there are none left you get a notice. The neighboring **底部** (Bottom) returns to the newest entry

### Stats Popover

Click **统计** (Stats) on the status bar to expand the usage popover for the current session:

- **上下文容量** (Context capacity) — takes the real input tokens of the latest Planner request, then splits them by the character share of each section and renders a stacked bar with a legend: messages, system prompt, instant notice, builtin tools, plugin tools, MCP tools, and other tools. Shows "暂无数据" (No data) until there has been a Planner request
- **平均缓存命中率** (Average cache hit rate) — the accumulated cache hit / miss token ratio for the current session; shows `—` when there is no cache data
- **累计输入 / 输出** (Accumulated input / output) — accumulated prompt and completion tokens for the current session
- **消息 / 循环 / 工具调用** (Messages / rounds / tool calls) — event counts for the current session

The section shares are estimates converted from character counts, useful for quickly spotting what is filling up the context; for exact token counts rely on "accumulated input / output" and the Reasoning Process page.

### Tool Cards

- **Builtin tools get their own icons** — `reply`, `wait`, `fetch_history`, `query_memory`, `query_image_memory`, `query_person_profile`, `send_emoji`, `send_image`, `switch_chat`, `tool_search`, and `view_forward_message`; everything else uses a wrench
- **Status badges** — a running tool shows "执行中" (Running), a queued one shows "等待执行" (Pending), and a finished one shows "执行成功" (Succeeded) or "执行失败" (Failed)
- **`tool_search` is shown separately** (as of 1.3.1) — the query appears as "搜索工具" followed by the search term, and after a successful run the "激活工具" (Activated tools) list shows whether each tool was "本次新发现" (Newly discovered) or "此前已发现" (Previously discovered); when nothing matches it shows "未找到匹配工具" (No matching tools)
- **`wait` is collapsed** — only "等待 x 秒" (Wait x seconds) is shown, without the arguments, JSON, or execution result
- **Merged source badge** — when every tool call in a batch shares one source, the source badge appears only once at the card's top-right; for a single tool the name, latency, and reasoning entry are merged into the card title row
- **Reasoning entry** — when a matching reasoning record exists, a "推理" (Reasoning) button appears on the card and jumps to the Reasoning Process page

## Stickers

The **表情包** (Stickers) page (`/resource/emoji`) manages collected stickers:

![Stickers](/images/webui/emoji.webp)

- Usage frequency statistics and popular stickers
- Upload new ones and disable inappropriate ones

Stickers in the WebUI are uniformly displayed in four states:

- **认识** (Known): has a description, but is not registered or banned
- **不认识** (Unknown): no description yet, and not registered or banned
- **据为己用** (Claimed): already registered and available for MaiBot to use
- **丢弃** (Discarded): already banned and no longer used

Stickers manually uploaded via the WebUI are directly marked as "据为己用" (Claimed). The tag list filled in during upload is merged into the sticker description; if the image already exists in the database, the original record is reused, the description is updated, the ban is lifted, and it is marked as registered. Deleting unregistered stickers synchronously deletes the database record and local file; deleting registered stickers first unloads them from the available sticker library, then deletes the database record and file.

## Expression Styles

The **表达方式** (Expression Styles) page (`/resource/expression`) manages the speaking styles MaiBot has learned:

![Expression styles](/images/webui/expression.webp)

- Formal/casual, lively/serene, humorous/serious, and other styles
- Manually confirm or reject them

## Slang

The **黑话** (Slang) page (`/resource/jargon`) manages the internet slang learned by the bot:

![Slang](/images/webui/jargon.webp)

- New and trending words, memes and jokes, niche community terms
- Manually confirm or reject them

## Reply Effect Evaluation {#reply-effect-evaluation}

Reply effect evaluation measures how good each of MaiBot's replies is — whether it responded to the user and whether it responded appropriately. It's an important reference for tuning prompts or comparing model performance.

### Enabling

Enable it in the `[debug]` section of `bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[debug]
enable_reply_effect_tracking = true
```

:::

Once enabled, a **回复效果** (Reply Effects) page (`/reply-effects`) appears under the "高级工具" (Advanced Tools) group in the WebUI sidebar.

![Reply effects](/images/webui/reply-effects.webp)

### Scoring Semantics (currently v6)

The evaluation standard has been upgraded over several rounds; the current implementation is **v6**:

- **Responsiveness** — measures whether the reply responds to the user; "how fast the user replied" is no longer used as evidence, and the remaining responsiveness evidence is normalized by its original weight ratio
- **Total score** — the raw total score without clear semantics has been removed; only per-dimension evidence is shown
- **No related info** — when no info related to the reply is found, no confidence is generated and the record is marked "completed / no info"
- **Incomplete records** — records that haven't finished the observation window (still watching subsequent feedback) are marked "incomplete" and excluded from scoring and aggregate stats
- **Failure retry** — records that failed during evaluation (e.g. prompt truncation) are automatically retried after a restart

### Viewing and Operations

- **Score distribution** — scores are shown as a per-sample scatter plot, clearly exposing zero-score clustering, outliers and within-model fluctuation
- **Delete / clear scores** — you can delete a single score record, or clear all score data for a chat / globally
- **Record limit** — each chat keeps at most `maisaka_reply_effect_limit` records (default 256); older records are cleaned up automatically

## Reasoning Process Token Display

In the **推理过程** (Reasoning Process) page (`/reasoning-process`), the log list and details show the following for each LLM request:

![Reasoning process](/images/webui/reasoning-process.webp)

- **Input tokens** — tokens sent to the model in the request
- **Output tokens** — tokens returned by the model
- **Total tokens** — input + output

This makes the reasoning cost of a single reply easy to evaluate, especially cost growth in high-activity group chats.

## Log Viewer

Switch the top workspace to "日志" (Logs) and select the **终端** (Terminal) tab (`/logs`) to watch MaiBot's runtime logs in real time:

![Log viewer](/images/webui/logs-terminal.webp)

- Filter by level (DEBUG / INFO / WARNING / ERROR / CRITICAL)
- Keyword search, auto-scroll, and log export

## Usage Recommendations

### Daily Checks

- Check statistics daily to understand activity levels
- Monitor cost changes to avoid overspending
- Review user feedback to improve the bot

### Data Analysis

- Analyze peak hours to schedule maintenance appropriately
- Observe user preferences to adjust the bot's personality
- Track popular topics to add relevant content

### Optimization Tips

- Response too slow? Check configuration
- Costs too high? Switch to a cheaper model
- Too few users? Increase promotion

## Verification & Troubleshooting

**Verify**: after sending a message, the message count on the home statistics overview increases and the record appears on the detailed statistics page.

**Statistics are empty?**

- A fresh deployment with no messages yet has empty data, which is normal
- Make sure the time range is correct (default "All time")
- Seeing many "未记录" (Unrecorded) rows under "by task group" is expected for calls recorded before 1.3.0, which had no task name

**Detailed statistics failed to load?**

- Retry later; statistics are collected periodically by background tasks
- The legacy static report is still available at `maibot_statistics.html`

**A chat stream is missing from MaiBot Observation?**

- The "麦麦的聊天流" list comes from the real chat streams in the database; a stream only appears once the bot has spoken in it
- If the list fails to load a red hint appears; refresh the page and retry

**Can't find the "Chat Management" entry?**

- As of 1.3.1 the sidebar entry is gone; shared group management moved to "MaiBot Settings → More settings → Shared Group Settings"
- Chat stream browsing and settings are handled entirely on the "MaiBot Chat" page

**How to reduce usage costs?**

- Choose cheaper models, reduce unnecessary calls, and optimize prompts
- Watch the prompt cache hit rate; a low rate means the context changes frequently
- Start with "by task group" to locate the most expensive stage, then switch to "by model" to find the most expensive model inside it
