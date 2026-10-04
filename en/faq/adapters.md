---
title: Adapter Connections
---

# Adapter Connections

## What should I do when an adapter disconnects?

Check the host, port, and access token on both sides. The server's listening port must match the adapter's destination. When components run on different devices or containers, `127.0.0.1` usually points back to the current component rather than the other service.

Restart both sides after changes and compare their logs to confirm the connection direction.

## NapCat is connected. Why are group messages ignored?

Check the NapCat adapter's chat filter first. In allowlist mode, group messages are discarded before reaching MaiBot unless the group is listed.

Also verify the logged-in QQ account, group ID, speaking permission, and whether MaiBot logs show the incoming message. See [NapCat Connection](../manual/adapters/napcat.md).

## Which NapCat token should I use?

Use the access token configured for the NapCat WebSocket service. It is not the NapCat WebUI login token or the MaiBot WebUI access password (shown as "Access Token" on the login page). If WebSocket authentication is disabled, the adapter field is normally empty; otherwise both sides must use exactly the same value.

## Why can SnowLuma not connect?

Check whether the plugin is enabled, SnowLuma is running, `server` and `port` target its WebSocket service, and tokens match. For separate devices, also check the bind address, firewall, and network reachability.

## How do I tell whether the adapter or MaiBot is failing?

Follow the message path in order: platform receive, adapter receive and conversion, MaiBot receive, model reply, and adapter send. The first missing step usually identifies the failing component or connection immediately before it.

