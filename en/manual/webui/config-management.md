---
title: Modify Configuration in the Browser
---

# Modify Configuration in the Browser

No need to edit files — change MaiBot's settings with a few clicks in the WebUI. **麦麦设置** (MaiBot Settings, `/config/bot`) under the "麦麦配置编辑" (MaiBot Config Editing) sidebar group edits `bot_config.toml`; **模型管理** (Model Management, `/config/model`) edits `model_config.toml`.

## MaiBot Settings

Open the MaiBot Settings page; the top now has only the **详细设置** (Detailed Settings) and **命令管理** (Command Management) tabs, with everything else moved behind the ellipsis (更多设置 / More settings) button in the top-right corner as of 1.3.1:

![MaiBot settings](/images/webui/config-bot.webp)

- **详细设置** (Detailed Settings) — the complete sectioned form
- **命令管理** (Command Management) — plugin commands and execution permissions
- **⋮ 更多设置** (More settings) — manual save, shared group settings, and source file editing

The former four tabs (核心设置 / Core Settings, 详细设置 / Detailed Settings, 命令管理 / Command Management, 源文件 / Source File) became two tabs plus an ellipsis menu, and the "Core Settings" page was deleted, with "Shared Group Settings" taking its place.

### Detailed Settings

A complete sectioned form covering all sections of `bot_config.toml` (chat, memory, emoji, voice, MCP, etc.). Hover over an option you are unsure about to see its description.

![Detailed settings](/images/webui/config-bot-detail.webp)

### Command Management

View all registered plugin commands and configure execution permissions; see [Command Management](./command-management.md).

### Shared Group Settings

**共享组设置** (Shared Group Settings) in the ellipsis menu groups several chat streams together so they share one set of expression styles, slang, or long-term memory:

- **表达** (Expression) shared groups write `expression_groups`, **黑话** (Slang) shared groups write `jargon_groups`, and **记忆** (Memory) shared groups write `a_memorix.shared_memory_groups`
- Create a shared group, add chats, remove a single chat, and delete an entire shared group
- Once `a_memorix.global_memory_sharing_enabled` is on, memory shared groups become read-only
- From "Detailed Settings" you can also reach it with the **共享组设置** button next to the `a_memorix` shared memory group field; the link looks like `/config/bot?mode=groups&kind=memory`

See [Chat Management](./chat-stats.md) for the page layout and the "Add chat" dialog details.

### Source File Editing

**源文件编辑** (Source File Editing) in the ellipsis menu edits the raw `bot_config.toml` text, for users familiar with TOML:

![Source file editing](/images/webui/config-bot-source.webp)

The system validates the format on save and reports errors; after a successful save, the rules below apply.

### Manual Save

The first item in the ellipsis menu is **手动保存** (Manual Save). Form edits auto-save about 2 seconds after you stop typing, so this item is disabled and shows "已保存" (Saved) when there is nothing pending — you rarely need to click it.

You must save before switching modes: with unsaved changes, clicking "Shared Group Settings" or "Source File Editing" pops up a "切换失败 / 请先保存当前更改" (Switch failed / Please save your changes first) notice.

## Model Management

The Model Management page manages model providers, models, and task assignment:

![Model management](/images/webui/config-model.webp)

- **模型设置** (Model settings) - select a provider on the left, edit API URL, key, and model list on the right; click **测试连接** (Test connection) to verify
- **功能分配** (Task assignment) - assign thinking, replying, vision, and other tasks to specific models

![Task assignment](/images/webui/config-model-tasks.webp)

- **配置副本** (Config snapshots) - save and manage config snapshots for easy rollback

Under "Task assignment", selecting the `planner` or `replyer` task shows a runtime summary line below the card: the visual mode (text / multimodal / auto) and the thinking switch state of the currently effective models.

### Time-Based Pricing

Besides the default input / output / cache unit prices, model prices can be billed per time range of the day (as of 1.3.0):

- While editing a model, expand the **分时价格** (Time-based pricing) section and click **添加时段** (Add period) to add a row
- Each row takes a **开始时间** (Start time) and **结束时间** (End time) in `HH:MM` server-local time, plus that period's **输入价格** (Input price), **输出价格** (Output price), and **缓存价格** (Cache price) in ¥/M tokens
- An end time earlier than the start time means the period crosses midnight, and "次日" (next day) appears next to the end time
- Periods are billed inclusively at the start and exclusively at the end; the default price applies outside any matched period. Periods must not overlap, and start and end must differ
- The price columns in model cards and lists are now labeled "默认输入价格 / 默认输出价格" (Default input / Default output price), and models with periods also show "N 个价格时段" (N price periods)

Time-based prices are written to `price_periods` in `model_config.toml`; see [Model Config](../configuration/model-config.md) for the field reference.

### Thinking Switch

The "启用思考" (Enable thinking) switch in the model editing dialog is shown dynamically per provider template (as of 1.3.0): templates that declare no thinking parameter show no switch at all, while DeepSeek keeps its own dedicated section. Different templates write different parameters:

- `thinking.type` format (Zhipu / Kimi / MiniMax / Doubao, etc.) — switchable on and off, with `disabled` written when off
- `enable_thinking` format (Bailian / SiliconFlow, etc.)
- `reasoning_effort` format (StepFun / OpenAI / xAI reasoning models, etc.) — thinking is always on and only the effort level can be changed, never turned off

Doubao and Qwen also support a thinking budget. For parameter names, effort levels, and budget fields see [Model Extra Params](../configuration/model-extra-params.md).

### Model Testing

"Test connection" picks its test path based on the model type (improved as of 1.3.0):

- Models detected as embedding models (name or identifier containing `embed`, or attached to the `embedding` / `image_embedding` task) are tested through the embedding interface instead of the chat interface
- Text embedding tests return the vector dimension and compare two cosine similarities: "similar text × similar text" and "similar text × unrelated text"
- Image embedding tests (the `image_embedding` task, or names/identifiers containing `vision` or `vl-embedding`) send test images and compare the similarity of identical and different images

`embedding` and `image_embedding` are single-select tasks: pick one model from a dropdown, no model-list polling, and no selection strategy — the vector space must stay consistent.

A failed save raises a toast in the bottom-right corner instead of silently dropping your changes.

## Saving and Taking Effect

Form edits are auto-saved (about 2 seconds debounce); you can also click **手动保存** (Manual Save) in the ellipsis menu. The file is written and MaiBot's configuration watcher reloads it.

**Used automatically by subsequent work** — personality, chat policy, reply frequency, model providers, models, and task assignments.

**Requires a full MaiBot restart** — WebUI enable/bind/port settings, `maim_message` listeners and authentication, MCP connections, and process-level plugin-runtime settings.

A plugin's own configuration is managed by the plugin lifecycle and normally hot-reloads. See the [Config Files](../configuration/) for the complete boundary.

## Modification Suggestions

### Beginner Recommendations

- First change the **bot name** and **signature** to give the bot some personality
- Adjust the **reply speed**, neither too fast nor too slow is good
- Try the **personality settings** to make the bot more interesting

### Advanced Tips

- Configure **multiple AI models** for different tasks
- Set up **keyword replies** to make the bot smarter
- Adjust **memory parameters** to remember more chat content

## Verification & Troubleshooting

**Verify**: change a setting (e.g. the bot nickname), save, and refresh the page — the value persists if the write succeeded.

**Save failed?**

- A failed auto-save raises a toast in the bottom-right corner stating the reason; retry with **手动保存** (Manual Save) in the ellipsis menu
- In source mode, check the TOML format and use the error message to locate the line
- In form mode, look at the red hints next to fields and fix accordingly

**Switching modes says "Please save your changes first"?**

- You cannot switch modes with unsaved changes; click **手动保存** (Manual Save) in the ellipsis menu first
- Or switch back to "Detailed Settings" and wait two seconds for auto-save to finish

**Changes not taking effect?**

- Runtime settings apply on the next operation or request; wait a moment and retry
- Listener ports, MCP connections, and other startup-only settings require a full MaiBot restart

**Messed up the settings?**

- In source mode, change the value back and save again
- Or edit `config/bot_config.toml` directly to restore

**Time-based pricing rejected on save?**

- Confirm the times use `HH:MM` (00:00–23:59)
- Confirm start and end differ and that periods do not overlap; write a midnight-crossing period as "22:00 → 02:00"

**Model testing keeps failing?**

- Embedding models cannot be tested through the chat interface; make sure the model name or identifier is recognized as an embedding model
- Image embedding models must support an image-input-to-vector protocol; plain text embedding models never take the image test path

## Related Docs

- [Command Management](./command-management.md) - plugin commands and execution permissions
- [Adapter Management](./adapter-management.md) - adapter accounts and access policies
- [Chat Management](./chat-stats.md) - shared groups and chat stream management
- [Model Config](../configuration/model-config.md) - full `model_config.toml` reference
- [Model Extra Params](../configuration/model-extra-params.md) - thinking mode and reasoning effort parameters
- [Bot Config](../configuration/bot-config.md) - full `bot_config.toml` reference
