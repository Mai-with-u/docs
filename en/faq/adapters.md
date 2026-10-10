---
title: Adapter Connections
---

# Adapter Connections

## What should I do when an adapter disconnects?

Check the host, port, and access token on both sides. The server's listening port must match the adapter's destination. When components run on different devices or containers, `127.0.0.1` usually points back to the current component rather than the other service.

Restart both sides after changes and compare their logs to confirm the connection direction.

## The QQ client is connected (NapCat / SnowLuma). Why are group messages still ignored?

Check the host adapter policy's allow scope first: everything is allowed by default, so any rule that blocks that group or user drops the message before it reaches MaiBot. Configure it under **Adapter Settings** in the WebUI sidebar ("Configuration" group, `/adapter-management`), or in `[defaults.group]` / `[defaults.private]` and `[[adapters]]` entries in `config/adapter_policy.toml`.

Also verify the logged-in QQ account, group ID, speaking permission, and whether the MaiBot backend log shows the incoming message. See [Unified QQ Connector](../manual/adapters/qq-local-client.md) for the message path.

## Which NapCat token should I use?

Use the access token configured for the NapCat WebSocket service, entered in the `token` field of the `[client]` section in `plugins/MaiBot-SnowLuma-Adapter/config.toml` (the same field is editable in the WebUI plugin settings). It is not the NapCat WebUI login token or the MaiBot WebUI access password (shown as "Access Token" on the login page). If WebSocket authentication is disabled, leave `token` empty; otherwise both sides must use exactly the same value.

## Why can't the Unified QQ Connector reach SnowLuma / NapCat?

The Unified QQ Connector (`MaiBot-SnowLuma-Adapter`) drives both client types from one plugin. Check in this order:

1. **Plugin enabled** — `MaiBot-SnowLuma-Adapter` is enabled in the WebUI **Plugin Management**, and `[plugin].enabled = true` in `plugins/MaiBot-SnowLuma-Adapter/config.toml`.
2. **Client listening** — SnowLuma or NapCat is logged into QQ with its **forward WebSocket server** enabled.
3. **Address and port match** — `server` (default `127.0.0.1`) and `port` (default `3001`) in the `[client]` section target that listener.
4. **Token matches** — `[client].token` is identical to the access token configured on the client.
5. **Separate devices or containers** — `127.0.0.1` points back to the component itself, so use the real IP and open the firewall.

Pinning `client_type` to `napcat` / `snowluma` adds a consistency check and warns when the peer differs; keep it on `auto` for everyday use. See [Unified QQ Connector](../manual/adapters/qq-local-client.md) for every option.

## How do I tell whether the adapter or MaiBot is failing?

Follow the message path in order: platform receive, adapter receive and conversion, MaiBot receive, model reply, and adapter send. The first missing step usually identifies the failing component or connection immediately before it.

