---
title: Edit Configuration in Your Browser
---

## MaiBot Settings

Open **麦麦设置** (MaiBot Settings). There are two tabs and an ellipsis menu at the top:

![MaiBot settings](/images/webui/config-bot.webp)

- **详细设置** (Detailed Settings) — the full form, organized by section
- **命令管理** (Command Management) — plugin commands and execution permissions
- **⋮ 更多设置** (More Settings) — manual save, shared groups, and source file editing

### Detailed Settings

The full form covers every section of `bot_config.toml`, including chat, memory, stickers, voice, and MCP. Hover over an option for an explanation if you are unsure.

![Detailed settings](/images/webui/config-bot-detail.webp)

### Pin Frequently Used Settings at the Top

MaiBot Settings has many sections, all listed in the **dropdown** beside the page title. To pin a frequently used section, open the dropdown and click the pin beside it. It will appear to the right of the title.

### Command Management

View all registered plugin commands and configure execution permissions; see [Command Management](./command-management.md).

### Shared Groups

**共享组设置** (Shared Groups) in the ellipsis menu groups chat streams so they share expression styles, jargon, or long-term memory:

- **Expression** groups write `expression_groups`, **jargon** groups write `jargon_groups`, and **memory** groups write `a_memorix.shared_memory_groups`
- Create groups, add chats, remove individual chats, or delete entire groups
- Enabling `a_memorix.global_memory_sharing_enabled` makes memory shared groups read-only

### Source File Editing

**源文件编辑** (Source File Editing) in the ellipsis menu edits the raw `bot_config.toml`, for users familiar with TOML:

![Source file editing](/images/webui/config-bot-source.webp)

## Model Management

The Model Management page manages providers, models, and task assignments:

![Model management](/images/webui/config-model.webp)

- **模型设置** (Model Settings) — select a provider on the left, then edit its API URL, key, and model list on the right; click "测试连接" (Test Connection) to verify
- **功能分配** (Task Assignment) — assign thinking, replying, vision, and other tasks to specific models

![Task assignment](/images/webui/config-model-tasks.webp)

- **配置副本** (Configuration Copies) — save the current configuration and manage previous copies for rollback

### Time-Based Pricing

Besides default input, output, and cache prices, models can use different prices for daily time periods (since 1.3.0):

- Expand **分时价格** (Time-Based Pricing) when editing a model and click "添加时段" (Add Period)
- Each row takes a **start time**, **end time** (`HH:MM`, server local time), and **input**, **output**, and **cache** prices (CNY per million tokens)
- An end time earlier than the start crosses midnight; "次日" (Next Day) appears beside the end time
- Periods include their start and exclude their end; unmatched times use default prices. Periods cannot overlap, and start and end cannot be equal

### Thinking Controls

The "启用思考" (Enable Thinking) switch in the model editor appears according to the provider template:

- `thinking.type` (Zhipu / Kimi / MiniMax / Doubao, etc.) — can be enabled or disabled; disabling writes `disabled`
- `enable_thinking` (Bailian / SiliconFlow, etc.)
- `reasoning_effort` (Step / OpenAI / xAI reasoning models, etc.) — thinking is always on; only the effort level can be adjusted

Doubao and Qwen support a thinking budget. See [Model Extra Parameters](../configuration/model-extra-params.md) for parameter names, effort levels, and budget fields.

### Model Testing

Click a model's lightning icon to test its availability with a test request. This does not measure its response speed in actual tasks: longer contexts and more complex tasks may take more time.

## Suggested Changes

### For Beginners

- Start with the **bot nickname** and **personality** under "基础 → 身份与人格" (Basic → Identity & Personality) to give your bot character
- Adjust **reply speed** — neither too fast nor too slow
- Try different **personality settings** to make the bot more interesting

### Advanced Options

- Configure **multiple AI models** for different tasks
- Set **keyword replies** to make the bot smarter
- Adjust **memory parameters** to remember more chat content

## Related Docs

- [Command Management](./command-management.md) — plugin commands and execution permissions
- [Adapter Management](./adapter-management.md) — adapter accounts and access policies
- [Memory Management](./memory-management.md) — viewing and maintaining long-term memory
- [Data Management](./data-management.md) — exporting and importing the whole data set
- [MCP Config](../configuration/mcp-config.md) — MCP services, entered via "Plugin Extensions → MCP Services"
- [Model Config](../configuration/model-config.md) — full `model_config.toml` reference
- [Model Extra Parameters](../configuration/model-extra-params.md) — thinking mode and reasoning effort parameters
- [Bot Config](../configuration/bot-config.md) — full `bot_config.toml` reference
