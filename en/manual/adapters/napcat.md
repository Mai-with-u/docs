---
title: NapCat Adapter (Archived)
---

# NapCat Adapter (Archived)

::: warning This standalone adapter is archived
The standalone NapCat adapter (repository `MaiBot-Napcat-Adapter`) has **stopped evolving and is marked archived**, and all of its capabilities have been merged into the **Unified QQ Connector** (repository `MaiBot-SnowLuma-Adapter`, which has supported both SnowLuma and NapCat clients since v1.0.0). New users should switch to the [Unified QQ Connector](./qq-local-client.md); this page is kept for historical reference only and is no longer updated.
:::

Only the standalone adapter repository is archived—**the NapCat client itself is still maintained**. The preparation steps for connecting NapCat through the Unified QQ Connector are the same as on this page, so the content below remains usable.

## Install NapCat and log in your bot QQ account

The adapter only handles the "MaiBot ↔ NapCat" connection. Install, log in, and start NapCat itself per its official docs.

<Linkcard url="https://doc.napneko.icu/" title="NapCat official docs" description="Install NapCat, log in to QQ, configure the WebSocket service" />

1. Install NapCat following the official docs, and log in your bot QQ account;
2. Confirm NapCat runs normally and that QQ account is online.

::: warning This QQ account is the bot itself
The QQ account NapCat logs in with must exactly match the `qq_account` in `bot_config.toml`, so MaiBot can recognize the bot's own messages. If they differ, the bot mistakes its own messages for someone else's.
:::

## Enable the forward WebSocket server

Enable the **forward WebSocket server** in NapCat's config, and note down the **port** and **access token** it listens on:

- **Port** — defaults to `3001`. Enter it in the Unified QQ Connector's `client.port`.
- **Access token** — optional. When enabled, clients must carry the same token to handshake; enter it in `client.token`.

::: tip Distinguish the three tokens
- **NapCat WebUI token** — used to log in to NapCat's own web admin UI; unrelated to the adapter.
- **NapCat forward WebSocket token** — the one set on the "forward WebSocket" service; this is the token to put in `client.token`.
- **MaiBot WebUI token** — used to log in to MaiBot's own web admin UI; unrelated to the adapter.
:::

## Configure MaiBot's bot account

Edit the `[bot]` section of `config/bot_config.toml` so MaiBot recognizes the bot itself:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"        # Local-client adapters such as SnowLuma / NapCat all use qq
qq_account = "YOUR_QQ"  # Must match the QQ account NapCat is logged in with
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — set to `"qq"`, the platform identifier for local-client adapters.
- **`qq_account`** — the QQ number NapCat is logged in with (as a string); the two must match exactly.

You can also set this in the WebUI under **Adapter Settings**: click **平台账号** (Platform accounts) on the right of the "全局默认规则" (Global default rules) card at the top of the page, pick platform `qq`, and enter the bot QQ number.

## Switch to the Unified QQ Connector

After installing the Unified QQ Connector, fill in the connection details in the `[client]` section of `plugins/MaiBot-SnowLuma-Adapter/config.toml`:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true           # Enable the adapter; must be true to connect
config_version = "2.5.0" # Config structure version; usually leave it alone

[client]
client_type = "napcat"   # Connect to NapCat; leave "auto" to detect after connecting
server = "127.0.0.1"     # NapCat address; local loopback, or the service name in Docker
port = 3001              # Forward WebSocket port, must match NapCat's setting
token = ""               # Access token; fill in the same token if NapCat enables auth
```

:::

Changes compared with the old standalone adapter:

- **Built-in lists removed** — the old `[chat]` group / private lists are gone; inbound access is controlled uniformly by the host adapter policy (WebUI adapter settings or `config/adapter_policy.toml`), which allows everything by default;
- **Tool switches regrouped** — switches such as the proactive private-chat tool moved to the `[chat_abilities]` section, all disabled by default;
- **Config section renamed** — the old `[napcat_server]` (with its `host` field) is migrated to `[client]` (with the `server` field) on load—no manual edits needed.

For the full configuration reference, capability differences, and troubleshooting, see the [Unified QQ Connector](./qq-local-client.md).

## Legacy standalone adapter reference (historical)

- **Repository** — `Mai-with-u/MaiBot-Napcat-Adapter`, last version v1.4.0 (2026-08-19), compatible with MaiBot ≥ 1.2.0; the repository is marked archived and no longer releases new versions.
- **Historical capabilities** — supported group chats, private chats, voice, images, merged forwards, proactive private chats, and multi-instance connections, and transparently exposed most NapCat OneBot action APIs.
- **Historical note** — old Issues can still be browsed, but please report problems to the Unified QQ Connector repository.

## Verify and troubleshoot

**Verify the connection** — the plugin log shows a successful connection, and @-ing the bot in an allowed group gets a reply. That means success.

**Cannot connect, logs keep showing "connection failed"** — check that `client.server` / `port` match NapCat's forward WebSocket listening address; confirm NapCat has the forward WS service enabled and the port is not blocked by a firewall; if auth is on, confirm `client.token` matches NapCat's setting.

**Connected but @-ing the bot in a group gets no response** — check whether the host adapter policy (WebUI adapter settings / `config/adapter_policy.toml`) allows that group or private chat; confirm `plugin.enabled = true`.

**The bot mistakes its own messages for someone else's** — `qq_account` in `bot_config.toml` differs from NapCat's logged-in QQ. Make them match and restart the host.

For other troubleshooting items, see "Verify and troubleshoot" in the [Unified QQ Connector](./qq-local-client.md).
