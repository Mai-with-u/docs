---
title: Backup and Migration
---

# Backup and Migration

## What should I back up before migration or reinstallation?

At minimum, back up:

**`data/`** — Databases, memory, emojis, and runtime data.

**`config/`** — Bot, model, and other main configuration.

**`plugins/`** — Installed plugins and plugin-local configuration or data.

Also back up adapter or package settings stored outside the MaiBot directory. The `plugins` directory is not inside `config`.

To skip copying whole directories by hand, use the one-click WebUI export; see "Exporting with the WebUI Data Management page" below.

## Exporting with the WebUI Data Management page

Export a zip from the WebUI **Data Management** page: open **Advanced Tools → Data Management** in the sidebar (URL `/data-transfer`). Export runs as an async job with live progress; when it finishes, download the zip straight from the browser. `config` + `data` are always included, and the remaining two parts are opt-in:

**`plugins`** — optional; includes installed plugins together with their in-directory configuration and data.

**`logs`** — optional; includes runtime logs.

The archive contains a `manifest.json` (export time, MaiBot version, and per-part file statistics). On import, the backend restores the `config` / `data` / `plugins` / `logs` parts you select.

### Export history and 24-hour retention

Below the export card sits the **Export History** list: each row shows the filename, archive size, completion time, and "Retained until &lt;time&gt;".

- Archives live only in the server temp directory and are **retained for 24 hours**; each download restarts the clock.
- Within that window you can **re-download after refreshing the page or restarting MaiBot** — history records persist in the temp directory and are restored when you reopen the page.
- Past the retention window the file is cleaned up automatically, the row shows "File expired or deleted", and the download button is disabled.
- **Delete** removes a single record and its archive. If the job is still exporting or downloading, deletion returns 409; wait until it settles and retry.

### What is never archived

- The memory runtime locks `data/.a_memorix_runtime_writer.lock` and `data/a-memorix/.a_memorix_runtime_writer.lock`; on Windows, reading them under lock also raises PermissionError.
- The reasoning preview image directory `data/prompt_imgs/`; copy that directory manually if you want it backed up.
- Partial output: cancelling an export deletes the half-written archive too. The task becomes `cancelled` and never gains a download entry.

## How do I move MaiBot to another device or directory?

1. Stop MaiBot, adapters, and launchers.
2. Back up the complete directory and record the current version.
3. Prepare a compatible version and runtime at the destination.
4. Restore `data`, `config`, `plugins`, and external adapter settings.
5. Check absolute paths, ports, permissions, and network addresses.
6. Start and review configuration upgrades, database migrations, and plugin logs.

Remove the old copy only after the new location is verified.

When restoring from a WebUI-exported archive, the bundled `manifest.json` already records the export time, MaiBot version, and per-part file statistics. On import the backend validates the manifest and restores the `config` / `data` / `plugins` / `logs` parts, rejecting symlinks, `..` path traversal, and top-level directories outside the whitelist before unpacking.

## Why does a restored backup fail to start?

Check version compatibility, configuration upgrades, database migration failures, plugin compatibility, file permissions, and stale absolute paths. Never delete a database or overwrite the original backup without making another copy first.

## Why is a local model URL rejected as non-public?

This is the WebUI outbound URL safety check. After confirming that the target is a trusted local or private-network model service, you can disable `enforce_public_outbound_url`. Doing so permits private addresses and reduces protection against server-side request forgery.

For Docker or remote services, also confirm that `127.0.0.1` is not incorrectly pointing to the current container.

