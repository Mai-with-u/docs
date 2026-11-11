---
title: Configuration Overview
titleTemplate: :title · Configuration
---

# Configuration Overview

MaiBot's settings live in two directories, `config/` and `host/`: change the bot itself in `config/bot_config.toml`, change the AI models in `config/model_config.toml`, and change the host addresses and the shared model catalog under `host/`.

If you would rather not edit files by hand, the WebUI covers everything.

## Where the Config Files Live

**`config/bot_config.toml`** — Main configuration, owned by a single Bot: bot identity, personality, chat behavior, memory, emoji, logging, WebUI style, MCP, and other main settings → [Bot Configuration](/en/manual/configuration/bot-config)

**`config/model_config.toml`** — Model configuration, owned by a single Bot: which model each task uses, task parameters, and which web service is selected → [Model Configuration](/en/manual/configuration/model-config)

**`host/config.toml`** — Host configuration, shared by every Bot in the workspace: listen addresses, port, TLS, access protection, public file address

**`host/model_catalog.toml`** — Shared model catalog, shared by every Bot in the workspace: API providers, model definitions, and web services

::: tip Launch once first
These files are generated automatically **after the first launch of MaiBot**. If you cannot find them, start MaiBot once.
:::

## Configuration Topics

Beyond the main files, these topics have their own pages:

- **[Model Extra Parameters](/en/manual/configuration/model-extra-params)** — thinking modes, provider parameter templates, custom request headers, and other advanced model settings
- **[A_Memorix Configuration](/en/manual/configuration/amemorix-config)** — storage, retrieval, vectorization, and tuning for the memory engine

## Does It Take Effect Immediately

MaiBot watches both files for changes. Whether a restart is required depends on whether the setting controls runtime behavior or how a service starts.

**Applies automatically after saving** — Bot profile, personality, chat policy, reply frequency, the providers and models in the shared model catalog, task assignments, and `[response_splitter].mode` are hot-reloaded. Model changes apply to subsequent requests. Modules with reload callbacks, including A_Memorix and emoji maintenance, also receive the update.

**Hot-reloaded by the plugin runtime** — A plugin's own `config.toml` has a separate lifecycle. The runtime watches it and calls the plugin configuration-update hook. Enabling, disabling, installing, uninstalling, and source updates normally do not require restarting all of MaiBot.

**Requires a host restart** — the `[webui]` listen addresses, port, TLS, and access protection in `host/config.toml`, the whole `[maim_message]` section (services and credentials are loaded at startup), `[plugin_runtime]` binding and IPC settings, the `[log]` event-loop watchdog (`event_loop_watchdog_*`) and memory diagnostics (`memory_diagnostics_*`), and `[debug]`'s `enable_console_input` and `force_plugin_compatibility` are established at startup and are not rebound by a file reload.

::: tip How to tell
Check the log after saving: a successful config-reload message means the new value took over; for listen addresses, MCP connections, and other startup-only settings, restart MaiBot.
:::

## Configure in the WebUI

If editing files is not your thing, use the built-in web config interface:

- Default address `http://127.0.0.1:8001`, works on both phones and desktops
- The login password is printed in the first-launch log and can also be found in `host/webui.json`
- Settings are grouped by module; saving runs the same hot-reload logic

For the full WebUI feature set, see [Login and Settings](/en/manual/webui/).

## Verification and Troubleshooting

**Verify** — After starting, confirm the workspace layout is complete: the Bot directory has `config/bot_config.toml` and `config/model_config.toml`, and `host/` has `config.toml`, `model_catalog.toml`, and `registry.sqlite3`; then open `http://127.0.0.1:8001` and log in with the password from the log.

**Config files not found** — They are generated after the first launch; start MaiBot once.

**Change had no effect** — Compare with "Does It Take Effect Immediately" above: the listen addresses and port in `host/config.toml` and the whole `[maim_message]` section need a host restart; for everything else check the log for a reload message.

**WebUI does not open** — Make sure `[webui].enabled = true` in `host/config.toml`; check whether `[webui].hosts` is bound to `127.0.0.1` only (for remote access use `["0.0.0.0"]` or add the server IP, or append addresses with the `HTTP_HOST` environment variable); verify the port is not occupied or blocked by a firewall.

**Mai misbehaves after an edit** — Run a syntax self-check first: `python -c "import tomllib; tomllib.load(open('config/bot_config.toml','rb'))"` — the reported line number points at the problem; invalid field values are named directly in the startup log.
