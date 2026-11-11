---
title: Adapter Connections
---

# Adapter Connections

This page covers adapters that will not connect: unreachable adapters, no replies after the QQ client logs in, wrong tokens, and failed Telegram or WeChat ClawBot setups.

## An adapter shows as disconnected — what now?

Host, port, and token must match on both sides. Across containers or devices, `127.0.0.1` points back to the component itself, so use the real IP.

Restart both the adapter and MaiBot after changes, then compare logs to confirm the connection direction.

## The QQ client is connected but groups get no replies

Check the adapter policy scope first: everything is allowed by default, so any rule blocking that group or user drops the message before it reaches the Planner. Configure it under "Adapter settings" in WebUI (`/adapter-management`), or in `[defaults.group]` / `[defaults.private]` and `[[adapters]]` entries of `config/adapter_policy.toml`.

Also verify the logged-in QQ account, the target group ID, Mai's speaking permission in that group, and whether the log actually recorded the incoming message. Message path: [OneBot Adapter](../manual/adapters/qq-local-client.md).

## Which NapCat token do I use?

Use the access token configured on NapCat's WebSocket service, entered in `[client].token` of `plugins/MaiBot-SnowLuma-Adapter/config.toml` (the same field is editable in WebUI plugin settings).

Leave it empty when WebSocket auth is off; when it is on, both sides must match exactly.

## Why can't the OneBot Adapter reach NapCat?

The OneBot Adapter (repository `MaiBot-SnowLuma-Adapter`) links MaiBot to NapCat and other OneBot v11 implementations. Check in order:

1. **Plugin enabled** — the OneBot Adapter is enabled in WebUI plugin management and `[plugin].enabled = true`.
2. **Client listening** — NapCat is logged into QQ with its forward WebSocket server enabled.
3. **Address and port match** — `[client].server` (default `127.0.0.1`) and `[client].port` (default `3001`) target that listener.
4. **Token matches** — `[client].token` equals the access token set on the client.
5. **Separate devices or containers** — Use the real IP and open the firewall.

Keep `client_type` at `auto`; the peer type is detected once the connection is established. See [OneBot Adapter](../manual/adapters/qq-local-client.md).

## How do I connect the QQ official bot?

The QQ Open Platform route needs no QQ client login:

1. Create a bot on the [QQ Open Platform](https://q.qq.com/) and copy its AppID and AppSecret.
2. Enable the QQ official bot adapter in WebUI plugin management.
3. Fill `qq_official.app_id` and `qq_official.app_secret` in the plugin settings, then enable it.
4. Add the bot to the target group on the Open Platform and @-mention it there to verify.

To share chat context with the local-client route, set `qq_official.unified_account_id` to that QQ number. See [QQ Official Bot](../manual/adapters/qq-official).

## How do I connect Telegram and WeChat?

Both are built-in adapters — enable them, no extra download needed:

**Telegram** — Create a bot with [BotFather](https://t.me/BotFather), fill `telegram.bot_token` in WebUI plugin settings, and enable it. Set `telegram.proxy_url` when a proxy is required. Send `/start` in a private chat to verify. To receive ordinary group messages, disable Privacy Mode in BotFather.

**WeChat ClawBot** — Enable the built-in WeChat ClawBot adapter, open "Plugin extensions → WeChat account management", and click "Add account and scan". Once the status reads "Connected: WeChat private chat", send a message from WeChat to verify. Multiple accounts are supported; when a login expires, click "Scan again" on that account card.

## Is the adapter or MaiBot failing?

Walk the message path in the log: platform receive → adapter receive and convert → MaiBot receive → model reply → adapter send.

The first step that breaks identifies the failing component or the connection right before it.

## The adapter is installed but missing from the WebUI

Plugin-based adapters appear in the connection list only after being installed and enabled in plugin management. The three built-ins (QQ official, Telegram, WeChat ClawBot) ship with the program — just enable them. Community adapters must be installed from the plugin market or Git.

Check the log for "plugin load failed" or version-incompatibility records: [Plugin and Adapter Troubleshooting](./troubleshooting-plugins-adapters.md#plugin-loading-failed).
