---
title: Multiple Bots
---

# Multiple Bots

One workspace can run several Mai instances at once. Each bot is its own process and directory with separate config, data, and plugins, while sharing one management entry and one login in the WebUI.

## Starting the first bot

The only entry point to MaiBot is the host. On startup the host decides the layout from the workspace directory:

- If `config/bot_config.toml` already exists, the host treats the directory as an existing installation and registers it in place as one bot — nothing is moved or copied.
- Otherwise it creates the first bot under `bots/<id>/`.

Workspace layout:

```
<workspace>/
  host/
    registry.sqlite3    Bot registry
    config.toml         Host config: listen address, cookies, public URL
    model_catalog.toml  Shared providers, API keys, models, web services
    webui.json          WebUI login credentials
    sessions.sqlite3    Login sessions
    run.lock            Host runtime lease
    control.json        Control channel address and credentials
  bots/<bot_id>/
    config/ data/ logs/ plugins/ temp/
```

## Managing bots

The bot switcher at the bottom of the WebUI sidebar selects the current bot. Once selected, config, chat, plugin, and resource pages all read and write that bot's data; when every bot is stopped you can still manage them from here.

The bot management page can create, start, stop, restart, rename, clone, and archive bots:

- **Rename** changes only the display name — not the bot ID, directory, or persona nickname.
- **Clone** copies the source bot's `config/` and `plugins/`. The new bot gets a new ID and starts stopped; `data/`, logs, and temporary files are not copied. Accounts and keys in the config are copied too, so change them before starting or both bots will fight over the same account.
- **Archive** stops the process, moves the whole directory to `host/archives/<bot_id>/instance`, then removes the active registration. In-place legacy bots and external directories are only stopped and unregistered; their directories stay where they are.

"Running" only means the bot process is alive — not that an account is logged in or that models and adapters are ready.

You can also manage bots from the command line:

::: code-group

```bash [Host commands ~vscode-icons:file-type-shell~]
maibot host list --directory <workspace>            # List registered bots
maibot host create-bot --directory <workspace> --name Assistant
maibot host start --directory <workspace> --bot-id <bot_id>
maibot host stop --directory <workspace> --bot-id <bot_id>
maibot host restart --directory <workspace> --bot-id <bot_id>
maibot host status --directory <workspace>          # Query each bot's state in a running host
maibot host open-webui --directory <workspace>      # Get a one-time WebUI login link
maibot host plugin-deps --directory <workspace>     # List missing dependencies; add --install to fix
maibot host shutdown --directory <workspace>        # Shut down host and all bots, keeping desired states
```

:::

The one-time link from `open-webui` is handy for opening the WebUI on a remote machine without copying a temporary login password by hand.

## Shared vs. per-bot config

`host/config.toml` holds the single host listen address, login cookies, and public URL. `[webui].public_base_url` is the externally reachable HTTP(S) address used to generate file links for every bot; leave it empty to use the host's local listen address. Set it explicitly when running behind a reverse proxy or for remote access.

`host/model_catalog.toml` is the only source of provider, API key, model, and web-service definitions; its format version is `3.0.0`. Each bot's `model_config.toml` keeps only its task model selections, web-service choices, and task parameters.

Network listeners, the public URL, HTTPS, and access protection live in **Mai Settings → Common Settings** and are written to `host/config.toml`; they take effect after a host restart. This entry point does not require any bot to be running.

Personality, chat behavior, permissions, plugin behavior, and the console input switch in `bot_config.toml` stay per bot.

## Connecting adapters

Adapters connect to the same host port and target a bot explicitly by full bot ID:

::: fields
- **Legacy protocol** — `ws://<host>:<port>/maim/<bot_id>/ws`, using that bot's `maim_message.auth_token`.
- **New API protocol** — `ws://<host>:<port>/maim/<bot_id>/api`; the target bot must also enable `enable_api_server`, and the client uses `api_server_allowed_api_keys`.
:::

A connection always belongs to the bot in the path. Unknown or not-yet-ready bots refuse the connection instead of falling back to another bot. An empty credential list rejects all connections. Bots no longer listen on their own TCP ports — the old root paths `/ws`, `/api`, and the old ports are incompatible and adapter addresses must be updated.

## Lifecycle

The registry records a desired state per bot (`desired_state`: running / stopped). On startup the host starts bots one at a time in that order, waiting for each to become ready or fail first, so several large bots don't migrate simultaneously.

::: fields
- **starting** — Process launched, not yet ready.
- **migrating** — Worker is migrating data; progress is reported.
- **running** — Worker reports ready and HTTP is available.
- **stopping / stopped** — Stopping / stopped as requested.
- **failed** — Startup failed or the process exited abnormally.
- **crash_loop** — Repeated crashes after becoming ready; auto-restart stopped.
:::

A crash after becoming ready triggers exponential-backoff restarts (from 1 second, capped at 5 minutes); five crashes within 10 minutes enter `crash_loop`. Failures before readiness (config errors, migration failures) mark the bot `failed` with no automatic retry.

## Adopting an existing instance

Existing data is never migrated automatically:

::: code-group

```bash [Adopt an existing instance ~vscode-icons:file-type-shell~]
# Register the path only; the directory stays where it is
maibot host adopt --directory <workspace> --from <old instance> --mode register

# Move into bots/<id>/ on the same filesystem; cross-drive moves are refused
maibot host adopt --directory <workspace> --from <old instance> --mode move

# Undo a registration or roll back a move
maibot host adopt --directory <workspace> --undo <bot_id>
```

:::

`register` is zero-cost: the host never deletes, moves, or rewrites such a directory, it only starts it. `move` requires the old instance's instance lock and records steps in `host/migrations/<bot_id>.json`; rerun the same command to resume after an interruption. When it finishes, `MOVED_TO_WORKSPACE.txt` is left at the old location. Neither mode converts data formats — format migration still runs on the bot's first startup.

## Console input

When the host starts in an interactive terminal and exactly one bot has console input enabled, that bot is selected automatically. With several bots, use `/bots` to list names, IDs, and states, then `/use <name or ID prefix>` to select the target.

The target bot must be ready and have `debug.enable_console_input` on. `/host-help` lists host commands, `/help` lists bot commands, `exit()` or EOF closes input while the bot keeps running, and Ctrl+C shuts down the host.

## Plugin dependencies

All bots share one Python environment. Before startup the host reads the dependency declarations of every enabled plugin across initialized bots. Installing or enabling plugins at runtime makes the Worker submit a preparation request; the host performs the maintenance, and the Worker never imports plugins with missing dependencies or edits the environment itself.

Incompatible declarations are reported directly. When packages are missing, the full declaration, the main program's dependencies, and the current environment versions go to the installer for a joint dry-run; only a clean resolution stops bots, re-reads the declarations, and installs. The installer pins installed versions and never upgrades or downgrades shared libraries. Afterwards bots resume their registered desired states.

## Data import and export

Transfers are provided by the host and remain available while the target bot is stopped. Job records, downloaded files, and temporary directories are isolated per bot ID, so switching bots never reuses another bot's job.

An import only replaces files provided in the package for the selected categories and leaves other files in the target instance alone. Overwritten files are backed up to the target bot's `temp/data-import/<transaction id>/backup/`, and failures roll back through the transaction log. Exported config includes the models, providers, and web services the current bot uses; importing an old config merges definitions into the shared model catalog.

## Verify and troubleshoot

**Verify** — `maibot host list --directory <workspace>` shows the registered bots; the bot switcher at the bottom of the WebUI sidebar lets you select and start the target bot, and chat receives replies.

- **New bot can't connect to the platform** — A cloned bot carries the source bot's accounts and keys. Edit the config before starting, otherwise both bots compete for the same account.
- **Adapter can't connect** — The address needs both the bot ID and the protocol (`/maim/<bot_id>/ws` or `/maim/<bot_id>/api`). The host only forwards once the bot is ready: 1008 means the bot ID or protocol name in the path is invalid, and 1013 means that bot does not exist, is stopped, is not ready yet, or has the message protocol disabled.
- **Data seems missing after starting the old instance** — A directory moved with `adopt --mode move` leaves `MOVED_TO_WORKSPACE.txt` behind; starting from the old location is refused with a pointer to the new one.
- **Update is blocked** — The host refuses updates when there are uncommitted changes, a diverged branch, or other running workspaces in the same Python environment.
- **Missing plugin dependencies** — Check and install them from the plugin page. All bots pause during installation and then resume their prior run states.
