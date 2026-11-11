---
title: Deployment and Startup
---

# Deployment and Startup

This page covers deployment and startup: failed launches, occupied ports, an unreachable WebUI, non-persistent Docker mounts, and multi-instance conflicts.

## MaiBot fails to start — what now?

Read the first real error in the startup log, not the last line. Common causes: wrong Python or dependency version, missing or malformed config, incomplete model settings, occupied ports, insufficient directory permissions.

Do not reinstall repeatedly before you know the cause. Config and port issues: [Startup and Access Troubleshooting](/en/faq/troubleshooting-startup). Model issues: [Model and Rule Troubleshooting](/en/faq/troubleshooting-model#api-key-error-insufficient-balance).

## Where are the config files?

Source and uv installs both keep them in the workspace `config/`:

- **`config/bot_config.toml`** — Bot identity, personality, chat behavior, memory, logs, plugins.
- **`config/model_config.toml`** — Task model selection and task parameters. Providers, API keys, and model definitions live in `host/model_catalog.toml` and are shared by every Bot.
- **`host/config.toml`** — Host listen addresses, cookies, and public access URL.

All are generated on first start. Prefer WebUI for edits; it validates before saving. When editing TOML by hand: quote strings, leave numbers unquoted, write booleans as lowercase `true` / `false`.

## What if a port is already in use?

Identify the service from the log first:

- **WebUI and file transfer** — Controlled by `[webui].port` in `host/config.toml`, default `8001`.
- **NapCat in Docker** — Mapped to `6099` by default.
- **NapCat forward WebSocket** — Usually `3001`; the adapter configuration is authoritative.

Stop the process holding the port, or change both server and client to the same free port. Commands: [Port conflict](./troubleshooting-startup.md#port-occupied).

Changing `[webui].port` requires restarting the host.

## Why won't the WebUI open?

Local installs default to `http://127.0.0.1:8001`. Check in order:

1. The startup log confirms the WebUI service started.
2. `[webui].enabled = true` in `host/config.toml`.
3. `[webui].hosts` includes the address you browse. By default only `127.0.0.1` and `::1` are bound; remote access needs the server IP or `0.0.0.0`.
4. `[webui].allowed_ips` does not reject the source IP.

More: [WebUI page won't open](./troubleshooting-startup.md#webui-page-won-t-open). Docker additionally needs port mapping and bind addresses — see [Docker Deployment](../manual/deployment/docker.md).

## Docker refuses to start because a mount is not persisted

The host stores its registry, public URL, and WebUI credentials under `/MaiMBot/host`. The container entrypoint checks that this path lands on host disk; if it resolves to tmpfs or ramfs, startup is refused with a message naming the missing mount.

Fix: download the `docker-compose.yml` that matches your image version, add these three mounts, then recreate the container:

::: code-group

```yaml [docker-compose.yml ~vscode-icons:file-type-yaml~]
volumes:
  - ./data/MaiMBot-host:/MaiMBot/host                # Host registry and WebUI credentials
  - ./data/MaiMBot-bots:/MaiMBot/bots                # Bots created in WebUI
  - ./data/MaiMBot-plugin-data:/MaiMBot/data/plugins # Plugin persistent data
```

:::

If you already ran with the old mounts, back up `/MaiMBot/host` from the old container, restore it into the new host directory, then run `docker compose up -d core`. Recreating without the mounts loses WebUI credentials and Bot registration.

## What should I know before running multiple bots?

A workspace can hold several bots, with a few hard constraints:

- **Shared environment** — All bots share one Python environment. Plugin dependencies are resolved together; you cannot pin a version for a single bot.
- **No duplicate accounts** — A cloned bot copies the source configuration. Change platform accounts before starting, or two processes will connect the same QQ.
- **One listening port** — The host owns the browser-facing address and port; per-bot overrides do not exist.
- **Migration is explicit** — Old instances are not imported automatically. Use `maibot host adopt` to register or move them.

Full details: [Multiple bots](../manual/multi-bot-host.md).

## Why is a setting missing from the WebUI?

Check whether the page has an advanced toggle, then verify the version. Settings get moved, renamed, or replaced. Never paste a field from an old screenshot into TOML: the config model forbids undeclared fields, so it fails at startup or is dropped by the upgrade.
