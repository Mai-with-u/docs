---
title: Files and Attachments
---

# Files and Attachments

The WebUI **Files** page manages attachments per chat: upload, download, read text online, clear caches, and delete originals. File capabilities themselves must be enabled under **Capabilities → File capabilities**; see [File capabilities](../files.md).

## Page layout

The left side filters by real chat name; the right side holds the file list and storage usage. The list shows filename, size, type, owning chat, and last access time.

- Filtering by chat lists only files bound to that chat.
- Without a chat filter, every file in the instance is listed and administrators see cross-chat content.
- The header shows the instance's storage quota usage.

## Common actions

::: fields
- **Upload** — Pick a target chat, then upload; the file is registered to that chat.
- **Download** — Issues a one-time transfer link that expires after five minutes by default.
- **Read online** — Text files open directly, paged by characters up to 32000 per read.
- **Send to chat** — Choose a target chat and confirm to send across chats; regular tools and the plugin SDK have no such authorization.
- **Delete** — Removes the original.
:::

Removing an attachment from a chat draft never deletes the original; originals are removed here or through tools.

## Supported formats

Storage and transfer do not restrict extensions — Office, PDF, and other binaries upload, download, and send fine, but their contents are not parsed.

Online reading supports UTF-8, UTF-16 with BOM, and explicitly specified GB18030 text; document scripts and macros are never executed.

## Quotas and cleanup

::: fields
- **`max_file_mib`** — Per-file limit, default 50 MiB.
- **`max_storage_gib`** — Instance storage quota, default 10 GiB.
- **`max_text_mib`** — Text parsing limit, default 8 MiB, up to 50 MiB.
- **`cache_days`** — Days to keep platform download caches after last access, default 30.
:::

Reaching the quota rejects new files instead of deleting originals. Platform download caches are cleaned after `cache_days`; local uploads and generated content are originals kept until deleted.

## Verify and troubleshoot

**Verify** — Upload a text file in **Mai chat** and send it with a message, then filter the **Files** page by that chat: it should be listed, downloadable, and readable online.

- **The page says file capabilities are off** — Turn on `capabilities.files` under **Capabilities → File capabilities**.
- **Upload refused** — Check the per-file size and the instance's remaining quota; a transfer also starts only when the free space fits one more maximum-size file.
- **A download link fails** — Transfer tokens expire after five minutes by default; issue a new one.
- **Text will not open** — Files above `max_text_mib` do not have their body parsed, though they still download; unsupported encodings fail as well.
- **Sending to another chat is refused** — Cross-chat sending requires an administrator to pick the target chat and confirm on the page.