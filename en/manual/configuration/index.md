---
title: Configuration Overview
titleTemplate: :title · Configuration
---

# Configuration Overview

All of MaiBot's settings live in two TOML files under `config/`: change the bot itself in `bot_config.toml`, change the AI models in `model_config.toml`. If you would rather not edit files by hand, the WebUI covers everything.

## The Two Config Files

**`bot_config.toml`** — The main configuration file: bot identity, personality, chat behavior, memory, emoji, logging, WebUI, MCP, and all other main settings → [Bot Configuration](/en/manual/configuration/bot-config)

**`model_config.toml`** — Model configuration: API providers, model list, and which model each task uses → [Model Configuration](/en/manual/configuration/model-config)

::: tip Launch once first
Both files are generated automatically **after the first launch of MaiBot**. If you cannot find them, start MaiBot once.
:::

## Does It Take Effect Immediately

MaiBot watches both files for changes. Whether a restart is required depends on whether the setting controls runtime behavior or how a service starts.

**Applies automatically after saving** — Bot profile, personality, chat policy, reply frequency, model providers, models, task assignments, the `[experimental]` retro reply prompt (`replyer_retro_prompt`), and `[response_splitter].mode` are hot-reloaded. Model changes apply to subsequent requests. Modules with reload callbacks, including A_Memorix and emoji maintenance, also receive the update.

**Hot-reloaded by the plugin runtime** — A plugin's own `config.toml` has a separate lifecycle. The runtime watches it and calls the plugin configuration-update hook. Enabling, disabling, installing, uninstalling, and source updates normally do not require restarting all of MaiBot.

**Requires a full MaiBot restart** — `[webui]` and `[maim_message]` listen addresses and ports, `[mcp]` server connections, `[plugin_runtime]` binding and IPC settings, the `[log]` event-loop watchdog (`event_loop_watchdog_*`), and `[debug].force_plugin_compatibility` are established at startup and are not rebound by a file reload.

::: tip How to tell
Check the log after saving: a successful config-reload message means the new value took over; for listen addresses, MCP connections, and other startup-only settings, restart MaiBot.
:::

## Configure in the WebUI

If editing files is not your thing, use the built-in web config interface (built in since 1.0.0):

- Default address `http://127.0.0.1:8001`, works on both phones and desktops
- The login token is printed in the first-launch log and can also be found in `data/webui.json`
- Settings are grouped by module; saving runs the same hot-reload logic

For the full WebUI feature set, see [Login and Settings](/en/manual/webui/).

## Verification and Troubleshooting

**Verify** — After starting MaiBot, confirm both `.toml` files exist under `config/`, and that `http://127.0.0.1:8001` opens in a browser and accepts the token from the log.

**Config files not found** — They are generated after the first launch; start MaiBot once.

**Change had no effect** — Compare with "Does It Take Effect Immediately" above: listen addresses, ports, and MCP connections need a restart; for everything else check the log for a reload message.

**WebUI does not open** — Make sure `[webui] enabled = true` in `bot_config.toml`; check whether `host` is bound to `127.0.0.1` only (change the bind or use port forwarding on remote servers); verify the port is not occupied or blocked by a firewall.

**Mai misbehaves after an edit** — Run a syntax self-check first: `python -c "import tomllib; tomllib.load(open('config/bot_config.toml','rb'))"` — the reported line number points at the problem; invalid field values are named directly in the startup log.
