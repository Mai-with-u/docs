---
title: Data Management
---

# Data Management

Data management packages config, data, plugins, and logs into a zip for download, or restores them from a zip. Open it from **Advanced tools → Data management** in the sidebar.

## Export

Pick a scope and start the export. Exports run in the background with one job at a time; the archive is staged in the system temp directory, expires automatically, and its retention is reset to 24 hours whenever a download starts or finishes.

The archive is named `maibot-data-<export time>.zip`, for example `maibot-data-20260709-123456.zip`.

## Archive layout

The top level always contains `manifest.json`, plus `config/`, `data/`, and optionally `plugins/` and `logs/` per the selected scope. Paths inside match the instance directory's relative paths.

::: code-group

```json [manifest.json ~vscode-icons:file-type-json~]
{
  "format": "maibot-data-archive",
  "format_version": 1,
  "created_at": "2026-07-09T12:34:56.789012+00:00",
  "maibot_version": "1.3.2",
  "included": ["config", "data"],
  "parts": {
    "config": { "file_count": 12, "total_bytes": 1048576 },
    "data": { "file_count": 3456, "total_bytes": 209715200 }
  }
}
```

:::

The backend validates this metadata on import.

## Behaviour with multiple bots

Transfers are provided by the host and remain available while the target bot is stopped. The host stops the target process and holds the instance process lock first, then restores the previous desired state; upload, compression, and disk transactions stay off the WebUI event loop.

::: fields
- **Job isolation** — Job records, downloaded files, and temporary directories are isolated per bot ID, so switching bots never reuses a previous bot's job.
- **Import scope** — Only files provided in the package for the selected categories are replaced; other files in the target instance are left alone.
- **Database replacement** — Replacing a SQLite database clears the target's old WAL, SHM, and journal so stale transactions cannot pollute the new one.
- **Rejected input** — Path traversal, symbolic links, and duplicate paths are refused.
:::

Overwritten files are backed up to the target bot's `temp/data-import/<transaction id>/backup/`, with `backup-manifest.json` recording original paths; failures roll back through the transaction log, and an interrupted process resumes recovery the next time the workspace opens.

Exported config includes the models, providers, and web services the current bot uses. Importing an old config merges those definitions into the shared model catalog: a same-named but different definition keeps the existing shared entry, the imported one gets a new name, and the current bot's task references are updated while other bots' references stay untouched. Network addresses plus cache and log retention policies from old packages never overwrite the host's shared config.

Config history backups are not part of the export and are not restored from old packages.

## Backup advice

Import overwrites existing files. Back up current data first — export another copy here for a safety net — and confirm the version recorded in `manifest.json` matches. After importing, restart the bot before verifying.

When no migration is needed, stopping the instance and copying the whole instance directory is a valid backup too.

## Verify and troubleshoot

**Verify** — Export a full package and confirm the downloaded zip contains `manifest.json`; import it, restart the bot, and chats and config should be back.

- **The export button does nothing** — Only one export job runs at a time; wait for the current one to finish.
- **A download link expired** — Retention resets to 24 hours whenever a download starts or finishes; export again after it lapses.
- **Files are missing after import** — Import only replaces files the package contains and deletes nothing else; missing content means that scope was not selected on export.
- **Import is refused** — Check the package for path traversal, symbolic links, or duplicate paths — all three are rejected outright.
- **Config is unchanged after import** — Old packages never overwrite the host's shared network and retention settings; that is expected. Models and web services are merged into the shared model catalog.
