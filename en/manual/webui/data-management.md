---
title: Data Management
---

# Data Management

The WebUI **Data Management** page packs MaiBot's configuration, data, plugins, and logs into a single zip archive you can download, and restores MaiBot from such an archive — no manual directory copying required. Open it from the sidebar under **Advanced Tools → Data Management** (URL `/data-transfer`). Since 1.3.2 the page has an **Export History** with a 24-hour retention window: once an export finishes, you can close the page or even restart MaiBot and still download it later.

The page has two columns: **Export Data** on the left (with Export History below it) and **Import Data** on the right. A **Local Cache Cleanup** tool sits at the bottom of the page (image cache, log directories, and database VACUUM — independent of data import/export).

## Exporting Data

The **Export Data** card on the left builds the archive. Its default scope already covers the most common case, so just click **Start Export**:

- **Config & Data (config / data)** — always required; the checkbox is locked, covering the `config/` and `data/` directories in the MaiBot folder
- **Installed Plugins (plugins)** — optional; includes installed plugins together with their in-directory configuration and data
- **Logs (logs)** — optional; includes runtime logs under `logs/`

Exporting is an async job. After clicking **Start Export**, a progress panel appears inside the card:

- **Current stage message** — Scanning files to export → Fixing memory graph snapshots → Writing archive → Export complete
- **Progress details** — processed files / total files, processed bytes / total bytes, plus a status badge and progress bar
- **Auto refresh** — the page polls job progress about every 1.2 seconds; no manual action needed
- **Cancel Export** — while running, click **Cancel Export**; the job status becomes `cancelled` and the **partially written archive is deleted**, leaving nothing downloadable
- **Download Archive** — appears in the progress panel once the job completes; on failure the panel shows a red error message and an "Export failed" toast pops up
- While an export job is running, the **Start Export** button is disabled — only one export job can run at a time

## Export History

Below the export progress panel is the **Export History** section, with a **Refresh** button at its top right. An empty list shows "No export records"; a failed load shows a red error. A fixed line above the list reads: **Archives are kept for 24 hours and the timer resets on each download; refreshing the page still allows re-downloading.**

Each history entry shows the filename, archive size, completion time, and "Retained until &lt;time&gt;"; once the file expires or is deleted, the row shows "File expired or deleted" and its download button is greyed out. Two buttons sit on the right of each row:

- **Download** — download the archive again
- **Delete** — remove the entry and its archive; an "Export record and archive deleted" toast confirms success

Detailed behavior:

- **24-hour retention** — archives live only in the server's system temp directory (`maibot_webui_transfer`), not a persistent directory; untouched archives are cleaned up automatically
- **Download resets the timer** — the retention window is reset to 24 hours when each download starts and again when it finishes; downloading regularly keeps an archive in the history
- **Survives restarts** — history records are persisted in the temp directory, so refreshing the page or restarting MaiBot does not remove still-valid archives
- **Periodic cleanup** — MaiBot scans the temp directory at startup and once every hour afterwards, removing leftovers of failed/cancelled jobs, archives older than 24 hours, and restart remnants; files being written or downloaded are skipped
- **Delete may return 409** — deleting a job that is still exporting or being downloaded returns 409 "The job is still processing or downloading, please delete it later" and the page pops a "Delete failed" toast; wait for the job to finish, then delete
- **Upgrade compatibility** — after upgrading from an older version, archives that were fully generated before the upgrade get history records restored automatically; partial archives never get a download entry

::: tip Archive filename
Archives are named `maibot-data-<export time>.zip` (e.g. `maibot-data-20260709-123456.zip`) and are saved to your browser under that name.
:::

## Archive Contents and Exclusions

The archive always contains a `manifest.json` at its top level, plus the selected `config/`, `data/` (and optionally `plugins/`, `logs/`) directories; paths inside the archive match the relative paths in the MaiBot folder.

`manifest.json` records the archive's metadata and is validated by the backend on import:

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

- **format** — always `maibot-data-archive`
- **format_version** — always `1`
- **created_at** — export time (UTC, ISO 8601)
- **maibot_version** — the MaiBot version at export time
- **included** — list of parts actually included
- **parts** — per-part file count (`file_count`) and byte total (`total_bytes`)

The following are **never** packed into the archive:

- **Memory runtime locks** — `data/.a_memorix_runtime_writer.lock` and `data/a-memorix/.a_memorix_runtime_writer.lock`. Lock files are not business data, and reading them while held also triggers PermissionError on Windows
- **Reasoning preview images** — the entire `data/prompt_imgs/` directory. These images only exist for reviewing past reasoning in the WebUI and are excluded from business data exports by default; copy the directory manually if you need to back it up
- **Symbolic links** — skipped during export

Two internal behaviors worth knowing: memory graph snapshots are copied to a temp directory before compression, so an old generation cannot be rotated away mid-compression; and if a single file fails to read, the error message carries the specific path, like:

```
Export failed (data/mai.db): The process cannot access the file because it is being used by another process
```

## Importing and Restoring

The **Import Data** card on the right restores from an archive:

1. Click the file picker and select a `.zip` archive (only archives produced by this feature are accepted)
2. Check the parts to restore: **Config (config)** and **Data (data)** are checked by default; **Plugins (plugins)** and **Logs (logs)** are optional; at least one must be selected
3. Click **Start Import**

Import runs in two steps: the archive is first uploaded to the server (an upload percentage is shown), then a background job restores the selected parts. The progress panel shows stage messages (Validating archive → Importing files → Import complete), file counts, byte totals, and a status badge, with the specific error on failure.

The backend validates the archive before and during import:

- A `manifest.json` must be present with a correct `format` / `format_version`, otherwise you get "Archive is missing manifest.json", "manifest.json is not valid JSON", or "Unsupported archive format"
- Archives containing symbolic links are rejected with "Archives must not contain symbolic links"
- `..` path traversal is rejected ("Archive contains an illegal path"), as are top-level directories other than the four parts ("Archive contains an unsupported top-level directory")
- Files that pass validation are written back to their corresponding locations under the MaiBot directory

::: warning Import overwrites existing files
Back up your current data before importing (you can export a fresh copy from this page), and keep versions consistent: `manifest.json` records the MaiBot version at export time, so after restoring across major versions check config upgrades, database migrations, and plugin compatibility. Restart MaiBot after the import finishes and verify it runs correctly.
:::

## Verification & Troubleshooting

**Verify**: click **Start Export**, wait for progress to reach 100%, then click **Download** in Export History; unzipping the downloaded file should show `manifest.json` plus the `config/` and `data/` directories, which means the export worked.

**Export failed?**

- Check the red error message in the progress panel: file-level failures carry the specific path (`Export failed (<path in archive>): <reason>`) — check whether that file is readable
- Insufficient disk space: `logs/` and `plugins/` can be large; export with only the default `config`+`data` first, or free up disk space and retry
- On Windows the memory runtime locks are already excluded by default; if you still hit PermissionError, check whether another program is holding the data files open

**The download button in Export History is greyed out?**

- That entry went 24 hours without a download, so its archive was cleaned up; the row shows "File expired or deleted" — export again
- Every download resets the retention window to 24 hours

**Delete says the job is still processing or downloading?**

- 409 means the export job is still running or the archive is currently being downloaded; wait for the progress panel to finish and the download to complete, then delete

**Import errors?**

- "Please upload a .zip archive" — only `.zip` is supported
- "Archive is missing manifest.json" / "Unsupported archive format" — the archive was not produced by this feature
- "Archive contains an unsupported top-level directory" / "Archive contains an illegal path" / "Archives must not contain symbolic links" — the archive was modified; retry with the original export
- The page prompts "Please select at least one part to import" when no part is checked

## Related Docs

- [Backup & Migration](/en/faq/backup-and-migration) — what to back up before migrating, and manual full-directory backups
- [Config Management](./config-management.md) — editing configuration in the browser
- [Data & Memory API](/en/develop/webui-api/data-and-memory-api) — full reference for the `data-transfer` endpoints
