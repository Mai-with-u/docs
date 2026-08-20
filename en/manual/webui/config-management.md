---
title: Modify Configuration in the Browser
---

# Modify Configuration in the Browser

No need to edit files, just click around to change MaiBot's settings!

## Two Modification Methods

### 1. Form Mode (Recommended)

Modify configuration like filling out a questionnaire, simple and intuitive:

- Each setting has descriptive text
- Dropdown menus, switches, input boxes for easy operation
- Automatically checks if the format is correct

### 2. Advanced Mode

Edit the configuration file directly, suitable for tech-savvy users:

- View the complete configuration file
- Freely modify any content
- Requires knowledge of TOML format

## What Settings Can Be Modified?

### 🤖 Bot Settings
- **Basic Profile** - Name, avatar, signature
- **Chat Behavior** - Reply speed, message length
- **Personality Traits** - Character, speaking style

### 💬 Message Settings
- **Reply Rules** - When to reply, who to reply to
- **Emoji Usage** - Whether to use emojis/stickers frequently
- **Typos** - Whether to intentionally make typos

### 🧠 Intelligence Settings
- **Memory System** - How much to remember, how long to remember
- **Model Selection** - Which AI model to use
- **API Configuration** - Model provider settings

## Modification Steps

### Form Mode

1. Open the WebUI and click "Configuration Management" on the left
2. Select the category to modify (e.g., "Bot Settings")
3. Find the item to change and enter the new value
4. Click **Save**. The file is written and MaiBot's configuration watcher reloads it

### Advanced Mode

1. Click the "Raw Configuration" tab
2. Edit the text content directly
3. Click "Save", the system will check the format
4. Errors are reported; after a successful save, the hot-reload rules below apply

## When Saved Changes Take Effect

**Used automatically by subsequent work** — Personality, chat policy, reply frequency, model providers, models, and task assignments.

**Requires a full MaiBot restart** — WebUI enable/bind/port settings, `maim_message` listeners and authentication, MCP connections, and process-level plugin-runtime settings.

A plugin's own configuration is managed by the plugin lifecycle and normally hot-reloads. See the [Configuration Overview](../configuration/) for the complete boundary.

## Modification Suggestions

### Beginner Recommendations
- First change the **bot name** and **signature** to give the bot some personality
- Adjust the **reply speed**, neither too fast nor too slow is good
- Try the **personality settings** to make the bot more interesting

### Advanced Tips
- Configure **multiple AI models** for different tasks
- Set up **keyword replies** to make the bot smarter
- Adjust **memory parameters** to remember more chat content

## Precautions

⚠️ **Important Reminder**:
- Incorrect settings may cause the bot to malfunction
- Check the documentation first for options you are unsure about
- It is recommended to back up important configurations first

📝 **Tips**:
- Hover the mouse over a setting item for an explanation
- Remember to click save after making changes
- You can reset to default settings if there are problems

## Model Config & Adapter Accounts (1.7.0)

- **Improved model config layout** — the model configuration page has been reworked with a clearer layout for editing providers, models and task assignment; the issue where local models could not be tested has also been fixed. See [Model Config](../configuration/model-config.md).
- **Adapter accounts** — the settings page shows the discovered adapter account list with online status and supports soft disable / restore. These capabilities are documented in [Adapter Management](./adapter-management.md).

## FAQ

**Q: What if I mess up the settings?**
A: You can reset to default settings, or manually change the values back

**Q: Why did the save fail?**
A: The format might be incorrect, check the error message

**Q: How long does it take for modifications to take effect?**
A: Runtime settings normally apply to the next operation or request. Listener ports, MCP connections, and other startup-only settings require a full MaiBot restart.
