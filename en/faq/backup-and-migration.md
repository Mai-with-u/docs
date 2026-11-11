---
title: Backup and Migration
---

# Backup and Migration

This page covers moving your data: which directories to back up, how to export and restore, and how to re-register a Bot on a new machine.

## What must I back up before migrating or reinstalling?

Copy four directories whole:

- **`config/`** — Every setting: `bot_config.toml`, `model_config.toml`, `adapter_policy.toml`, `builtin_plugins/`.
- **`host/`** — Host settings `config.toml`, Bot registry `registry.sqlite3`, shared model catalog `model_catalog.toml`, WebUI credentials `webui.json`.
- **`data/`** — Database, long-term memory, files, emoji cache.
- **`plugins/`** — Installed third-party plugins with their config and data.

Losing `host/webui.json` means resetting the WebUI password; losing `host/registry.sqlite3` means re-registering every bot in the workspace from its directory. Anything an adapter or one-key package stores outside the MaiBot directory needs a separate backup too.

## Export from the WebUI data page

Sidebar → "Advanced tools → Data management" (`/data-transfer`). Export runs as a background task with live progress and downloads as a zip when done. `config` + `data` are always included; the other two are optional:

**`plugins`** — Installed plugins with their config and data.

**`logs`** — Runtime logs.

The archive carries a `manifest.json` recording export time, MaiBot version, and per-section file counts. Import restores by the four sections `config` / `data` / `plugins` / `logs`.

### Export history and the 24-hour window

Below the export card is the history list showing filename, size, completion time, and the exact timestamp the file is kept until.

- Archives live in a server temp directory and are kept for **24 hours**; each download click restarts the clock.
- Within that window you can download again after refreshing or restarting MaiBot — history persists in the temp directory.
- After expiry the row shows "File expired or deleted" and the download button is disabled.
- Deleting while a task is exporting or downloading returns 409; retry after it finishes.

### What is not included

Runtime locks such as `data/.a_memorix_runtime_writer.lock`, and the `data/prompt_imgs/` inference preview directory — copy that one manually. Cancelling an export deletes the partial archive too.

## How do I migrate to another machine?

1. Stop the host, adapters, and launcher.
2. Back up the whole workspace directory and note the current version.
3. Install the same or a newer MaiBot version and runtime on the target machine.
4. Put `config`, `host`, `data`, `plugins`, and `bots` back into the workspace.
5. Check absolute paths, ports, file permissions, and network addresses.
6. Watch the config upgrade, database migration, and plugin load logs on startup.

Delete the old copy only after the new location works. When restoring a WebUI zip, the backend validates the manifest and rejects symlinks, `..` traversal, and top-level directories outside the allowlist before unpacking.

## `maibot host adopt` vs. copying the directory

`adopt` registers an existing instance into the workspace without converting data:

- **`--mode register`** — Register the path only; the directory stays where it is. Zero cost.
- **`--mode move`** — Rename the directory into `bots/<id>/` on the same filesystem; cross-device moves are refused. Steps are recorded in `host/migrations/<bot_id>.json`, so re-running the same command after an interruption resumes.

Copying a directory by hand writes no registry entry, so the workspace will not know the bot. Use `adopt` for existing instances — see [Multiple bots](../manual/multi-bot-host.md#adopting-an-existing-instance).

## Restored a backup and it will not start

Check in order: source and target version compatibility, whether config needs upgrading, whether database migration failed, whether plugins support the current version, and whether permissions and absolute paths still resolve.

Never delete the database or overwrite the original backup without an additional copy.

## A local model is blocked as a non-public address

That is the WebUI outbound URL check (`[webui].enforce_public_outbound_url`, default `true`). Once you have confirmed the target is a trusted local or LAN service, turn it off under common settings in WebUI.

Disabling it lets WebUI reach LAN addresses and also weakens server-side request forgery protection. If the model service runs in Docker or on another device, point MaiBot at an address reachable from its own environment.

## Does restoring a read-only backup corrupt host settings?

No. Importing a user-mode backup restores only the bot's own business configuration. Host listen addresses, credentials, and retention policy in `host/config.toml` are never overwritten from a backup package, and the shared model catalog is merged rather than replaced. The host owns those; they do not travel with a single bot.
