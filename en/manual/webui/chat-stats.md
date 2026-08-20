---
title: Chat History and Statistics
---
# Chat Logs and Statistics

See how active MaiBot is and what it has been chatting about!

## Chat Statistics

### 📊 Data Overview
Open the "Chat Statistics" page to view:
- **Total Messages** - How many messages the bot received
- **Replies** - How many messages the bot replied to
- **Uptime** - How long the bot has been running
- **Average Response** - How fast the bot replies

### 💰 Cost Statistics
You can also view spending details:
- **Total Cost** - Total amount spent
- **Hourly Cost** - Average cost per hour
- **Token Usage** - How much text the AI processed
- **Cost by Model** - How much was spent on each AI model

### 📈 Trend Charts
Intuitive charts display:
- **24 Hours** - Activity over the last day
- **7 Days** - Trends over the last week
- **Peak Hours** - When the bot is most active

## Detailed Statistics Page

The "Statistics" entry in the sidebar (`/statistics`) opens an interactive native detailed statistics page, replacing the traditional static HTML report (the old report remains available at `maibot_statistics.html`). The time range can be switched at the top of the page:

- **All time / Last 30 days / Last 7 days / Last 3 days**
- **Last 24 hours / Last 3 hours / Last 1 hour / Last 15 minutes**

### Core Metrics

- **Uptime** - Total running duration of the bot
- **Messages / Replies** - Messages received and replies sent
- **Requests / Token Usage** - Model call count and total input/output tokens
- **Cache Hits** - Cache hit/miss tokens and hit rate
- **Cost** - Total spend, cost per 100 messages, cost per hour, etc.

### Multi-Dimensional Analysis

Detailed statistics can be broken down by:

- **Model** - Request count, tokens, cache hit rate, cost and average latency per model
- **Module** - Call distribution aggregated by feature module
- **Request Type** - Cost share by request type
- **Chat Flow** - Message volume and cost per chat flow
- **Trends** - Time-series changes in cost, message volume, etc.
- **Performance Metrics** - Key metrics such as cost per 100 messages and tokens per hour

## Chat Logs

### View Logs
View detailed chat history:
- Who said what
- How the bot replied
- When the conversation took place
- In which group chat

### Search Logs
Looking for specific content?
- Filter by user
- Search by time range
- Filter by group chat

### Log Management
- **Clean Logs** - Delete old records
- **Backup Important Chats** - Save interesting conversations

## User Management

### User List
Displays all users who have chatted:
- User nickname and avatar
- How long they have been known
- Chat frequency
- Platform where they were met

### User Profiles
Click on a user to view:
- Personality traits
- Interests and hobbies
- Chatting habits
- Interaction history

### User Statistics
- **Total Users** - How many users are known
- **Active Users** - How many chat frequently
- **Platform Distribution** - Counts for QQ, WeChat, etc.

## Expression Styles

### Speaking Style
MaiBot learns different expression styles:
- Formal/Casual
- Lively/Serene
- Humorous/Serious
- Various internet slang

### Slang Management
Internet slang learned by the bot:
- New and trending words
- Memes and jokes
- Niche community terms
- Can be manually approved or rejected

### Stickers
Collected stickers:
- Usage frequency statistics
- Popular stickers
- Ability to upload new ones
- Ability to disable inappropriate ones

Stickers in the WebUI are uniformly displayed in four states:
- **Known**: Has a description, but is not registered or banned
- **Unknown**: No description yet, and not registered or banned
- **Claimed**: Already registered and available for MaiBot to use
- **Discarded**: Already banned and no longer used

Stickers manually uploaded via the WebUI are directly marked as "Claimed". The tag list filled in during upload is merged into the sticker description; if the image already exists in the database, the original record is reused, the description is updated, the ban is lifted, and it is marked as registered. Deleting unregistered stickers synchronously deletes the database record and local file; deleting registered stickers first unloads them from the available sticker library, then deletes the database record and file.

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

Once enabled, a **Reply Effects** page (`/reply-effects`) appears under the "Advanced Tools" group in the WebUI sidebar.

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

In the **Reasoning Process** page (`/reasoning-process`), the log list and details now show the following for each LLM request:

- **Input tokens** — tokens sent to the model in the request
- **Output tokens** — tokens returned by the model
- **Total tokens** — input + output

This makes the reasoning cost of a single reply easy to evaluate, especially cost growth in high-activity group chats.

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

## Frequently Asked Questions

**Q: How often are statistics updated?**
A: Real-time updates; you can see the latest data anytime

**Q: How long are logs saved?**
A: Saved indefinitely by default; automatic cleanup can be configured

**Q: Can data be exported?**
A: Export functionality is not currently supported but will be added in future versions

**Q: How to reduce usage costs?**
A: Choose cheaper models, reduce unnecessary calls, and optimize prompts

## Practical Tips

### Monitor Bot Health
- Response time suddenly increased? There may be an issue
- Costs increased abnormally? Check for potential attacks
- Active users declined? Check if something inappropriate was said

### Improve User Experience
- Analyze user profiles for personalized replies
- Track popular topics to prepare relevant content
- Record user feedback for continuous improvement

### Save Costs
- Choose cost-effective models
- Set reasonable call frequencies
- Avoid repeated calls that waste tokens