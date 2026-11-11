---
title: Mai Help
---

# Mai Help

Mai Help is the help agent built into the WebUI: ask in plain language where a setting lives or how a plugin works, and it searches the official docs, the WebUI index, and the plugin market to return an answer you can follow directly.

## Opening it

On the **Mai Observation** page, switch the composer mode to **Ask** and press Enter. Answers carry source links and follow-up suggestions, and the right-hand panel shows the working progress: the current plan and the loaded skills.

Help conversations are saved automatically. **Help history** lists recent question sessions, and opening one continues the same conversation.

## What it can look up

::: fields
- **WebUI index** — Page paths and config fields, answering "where is this entry point".
- **Official docs** — Searches and reads pages on docs.maibot.chat, answering "how do I configure this".
- **Local config** — Reads the `bot_config.toml` and `model_config.toml` values actually in effect, with keys and tokens hidden.
- **Plugin market** — Looks up plugin details and READMEs, compares compatibility, and prepares installs.
:::

The agent loads skills by question type, at most two per turn: setup and configuration, troubleshooting, plugin usage, and plugin development.

## Allowing plugin config writes

By default the agent is read-only. To let it actually change plugin config in the current turn, tick **Allow plugin config writes** (`allow_plugin_config_write`) next to the composer: it applies to this question only, and the agent may save plugin config as the question requires.

Writes touch plugin config only — never the main program config, model keys, or chat data. Changes are shown in the conversation; check the values actually displayed on the page after saving.

## Verify and troubleshoot

**Verify** — Switch to Ask mode in **Mai Observation** and ask where to enable file capabilities. The answer should point to **Capabilities → File capabilities** plus a documentation link.

- **Answers are vague** — Name the concrete object, for example "where does the QQ Official adapter's bot_token go".
- **Plugin config edits do not stick** — Confirm **Allow plugin config writes** was ticked and check the changes shown in the conversation; the permission resets on the next question.
- **A past session is missing** — Only the 50 most recent sessions are listed. Start a new session and ask again.
- **The answer quotes outdated docs** — Help reads the online official docs, which update with a delay. When they disagree with the WebUI, trust the WebUI.