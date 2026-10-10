---
title: Data Management
---

# Data Management

Use the WebUI's **Data Management** page to download MaiBot's configuration, data, plugins, and logs as a zip archive for migration. Open **高级工具 → 数据管理** (Advanced Tools → Data Management) in the sidebar.

## Export Data

- The "导出数据" (Export Data) card on the left creates an archive. The default selection covers the most common configuration and data; click **开始导出** (Start Export)
- Export runs as a background task. A progress area appears in the card after you start
- "Start Export" is disabled while an export is running; only one export can run at a time
- Export archives are stored in the system temporary directory and automatically cleaned up if they are not downloaded before expiration
- Each download resets the retention period to 24 hours when it starts and when it finishes

::: tip Archive Filename
Archives are named `maibot-data-<export-time>.zip`, for example `maibot-data-20260709-123456.zip`.
:::

## Archive Contents

The archive always contains a top-level `manifest.json`. The rest consists of `config/` and `data/`, plus optional `plugins/` and `logs/`, according to your selection. Paths inside the archive match the relative paths in the MaiBot directory.

`manifest.json` records archive metadata, which the backend validates during import:

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

## Import and Restore

The "导入数据" (Import Data) card on the right restores an archive:

1. Select a `.zip` archive using the file picker; only archives exported by this feature are accepted
2. Choose the parts to restore: **configuration (`config`)** and **data (`data`)** are selected by default; **plugins (`plugins`)** and **logs (`logs`)** are optional. Select at least one part
3. Click **开始导入** (Start Import)

::: warning Import Overwrites Existing Files
Back up your current data first (you can export another copy on this page) and confirm the versions match: `manifest.json` records the MaiBot version used for export. Restart MaiBot after importing, then verify that it runs correctly.
:::

## Related Docs

- [Data and Migration](/en/faq/backup-and-migration) — what to back up before migration and how to copy the entire directory manually
- [Configuration Management](./config-management.md) — edit configuration in your browser
- [Data and Memory API](/en/develop/webui-api/data-and-memory-api) — full reference for `data-transfer` endpoints
