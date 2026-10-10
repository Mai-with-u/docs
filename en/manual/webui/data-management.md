---
title: Data Management
---

# Data Management

Use the WebUI's **Data Management** page to download MaiBot's configuration, data, plugins, and logs as a zip archive for migration. Open **高级工具 → 数据管理** (Advanced Tools → Data Management) in the sidebar.

## Export Data

Choose the scope under "导出数据" (Export Data) and start the export. Configuration and data are selected by default.

- Export runs in the background; only one export can run at a time
- Archives are stored in the system temporary directory and cleaned up when they expire
- Each download resets retention to 24 hours when it starts and finishes

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

Under "导入数据" (Import Data), select a `.zip` archive exported by this feature, choose the restoration scope, and start the import. Configuration and data are selected by default; plugins and logs are optional. Select at least one part.

::: warning Import Overwrites Existing Files
Back up your current data first (you can export another copy on this page) and confirm the versions match: `manifest.json` records the MaiBot version used for export. Restart MaiBot after importing, then verify that it runs correctly.
:::

## Related Docs

- [Data and Migration](/en/faq/backup-and-migration) — what to back up before migration and how to copy the entire directory manually
- [Configuration Management](./config-management.md) — edit configuration in your browser
- [Data and Memory API](/en/develop/webui-api/data-and-memory-api) — full reference for `data-transfer` endpoints
