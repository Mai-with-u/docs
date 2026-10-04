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

## How do I move MaiBot to another device or directory?

1. Stop MaiBot, adapters, and launchers.
2. Back up the complete directory and record the current version.
3. Prepare a compatible version and runtime at the destination.
4. Restore `data`, `config`, `plugins`, and external adapter settings.
5. Check absolute paths, ports, permissions, and network addresses.
6. Start and review configuration upgrades, database migrations, and plugin logs.

Remove the old copy only after the new location is verified.

## Why does a restored backup fail to start?

Check version compatibility, configuration upgrades, database migration failures, plugin compatibility, file permissions, and stale absolute paths. Never delete a database or overwrite the original backup without making another copy first.

## Why is a local model URL rejected as non-public?

This is the WebUI outbound URL safety check. After confirming that the target is a trusted local or private-network model service, you can disable `enforce_public_outbound_url`. Doing so permits private addresses and reduces protection against server-side request forgery.

For Docker or remote services, also confirm that `127.0.0.1` is not incorrectly pointing to the current container.

