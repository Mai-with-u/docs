---
title: QQBot Adapter
---

# QQBot Adapter

**Connect through the QQ Open Platform Bot API, no QQ client login needed (community-maintained).** The QQBot Adapter connects MaiBot to QQ through the **QQ Open Platform** official Bot API (WebSocket + REST), enabling two-way private (C2C) and group messaging. Unlike adapters that rely on a local client such as NapCat, it authenticates directly against Tencent's servers with an **AppID + AppSecret**, and identities are based on openids.

::: info Connection direction
`QQ Open Platform (api.sgroup.qq.com) ⇄ QQBot Adapter → MaiBot plugin message gateway`

The adapter dials out as a client: the WSS channel receives event dispatches and maintains heartbeat/reconnect, while the REST channel sends messages and uploads media. No local port needs to be opened, and `[maim_message]` is not used.
:::

Adapter repository (🌐 community-maintained):

<Linkcard url="https://github.com/mayan613/MaiBot-QQBot-Adapter" title="MaiBot-QQBot-Adapter" description="mayan613's QQBot adapter plugin" />

## 1. Apply for a QQ bot application

The QQBot Adapter connects to an **official QQ bot**, not a regular QQ account. You need to create an application on the QQ Open Platform first:

1. Visit the [QQ Open Platform](https://q.qq.com) and log in;
2. Create a bot application, and obtain the **AppID** and **AppSecret** under "开发设置" (Development settings);
3. Enable the event subscriptions you need under "功能配置" (Feature configuration), such as C2C private messages and group @ mentions—otherwise the platform will not push those events.

::: warning Requirements

**MaiBot** — ≥ 1.0.0 (plugin host).

**aiohttp** — ≥ 3.8, used for WebSocket and REST communication; usually already bundled in the MaiBot environment.

:::

::: tip Official bot vs. the NapCat approach
An official bot **has no QQ number**; its identity is AppID + openid. For privacy reasons the official API does not provide user nicknames, so the "name" shown in private chats degrades to the user openid (a long hexadecimal string)—this is expected.
:::

## 2. Configure the MaiBot bot account

Since an official bot has no QQ number, the MaiBot core needs the platform account `qq_bot:AppID` to recognize the bot itself. Edit the `[bot]` section of `config/bot_config.toml` and add the entry to `platforms`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"                # Keep your existing platform unchanged (NapCat / SnowLuma local-client adapters all use qq)
qq_account = "111111"          # 跟你原来配置保持一致
platforms = [
    "qq_bot:xxxxxxxxxx",       # 格式为 "qq_bot:AppID"，冒号后填你的 AppID
]
nickname = "麦麦"
alias_names = []
```

:::

::: warning
The platform prefix must be `qq_bot` (this plugin's platform name, distinct from NapCat's `qq`), followed by your **AppID**. The AppID must be identical in both places: the adapter's `app_id` and the `qq_bot:AppID` entry here. Without it, MaiBot will mistake its own messages for someone else's.
:::

You can also set this in the WebUI: `麦麦设置 → 基础 → 平台账号右侧的加号 → 平台填 qq_bot，账号填你的 AppID` (MaiBot Settings → Basic → plus button next to platform accounts → platform `qq_bot`, account = your AppID).

## 3. Configure the adapter connection

Edit the following settings in the QQBot Adapter's plugin settings in the MaiBot WebUI. Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[qqbot]
app_id = "YOUR_APP_ID"
app_secret = "YOUR_APP_SECRET"
use_sandbox = false        # sandbox environment (sandbox.api.sgroup.qq.com), disable before going live
intents = 33554432         # subscribed event intents (bitfield); default = C2C private + group @
shard_count = 1            # total shard count; keep 1 for a single instance
shard_index = 0            # current shard index (0-based); keep 0 for a single instance
heartbeat_interval = 30.0  # heartbeat timeout detection interval (sec); must be greater than 0
reconnect_delay_sec = 5.0  # wait before reconnecting after a disconnect (sec)
action_timeout_sec = 15.0  # timeout for REST API calls such as sending messages (sec)
token_refresh_before_sec = 300.0  # refresh access_token this many sec before expiry; token lasts 7200 sec
connection_id = ""         # optional connection identifier for multiple QQ Bot links

[chat]
enable_chat_list_filter = true    # list filtering, enabled by default
show_dropped_chat_list_messages = false  # log dropped messages (turn on when troubleshooting)
group_list_type = "whitelist"     # group list mode: whitelist / blacklist
group_list = []                   # group openids
private_list_type = "whitelist"   # private list mode: whitelist / blacklist
private_list = []                 # user openids
ban_user_id = []                  # globally blocked user openids; dropped before entering the Host
```

:::

::: tip
The lists take **openids**, not QQ numbers or group numbers. Whitelist filtering is on by default with empty lists, so all messages are dropped; for testing, temporarily turn off filtering or turn on `show_dropped_chat_list_messages` to observe dropped-message logs.
:::

## 4. Platform limits and message degradation

Be aware of these QQ Open Platform limits before use:

- **Full group messages require permission** — `GROUP_MESSAGE_CREATE` (non-@ group messages) is only pushed by the server after the bot becomes a group admin or gains active-speaker permission; `GROUP_AT_MESSAGE_CREATE` (group @) is always available
- **Passive reply window** — after receiving a user message, the passive reply window is 60 minutes for C2C private chats and 5 minutes for group chats, with at most 5 replies per message
- **Proactive messages are restricted** — proactively pushed messages are heavily limited by the platform; this plugin mainly relies on passive replies

Limited by the official Bot API and MaiBot's capabilities, the following outbound message segments are degraded:

- **Outbound @ (`at`)** — the official API does not support outbound @; converted to `@name` text
- **Voice (`voice`)** — converted to a `[语音]` text marker
- **Merged forward (`forward`)** — converted to a text hint
- **Reply (`reply`)** — mapped to the `msg_id` parameter to implement quoting

For images: inbound images are downloaded immediately while the temporary rkey in the URL is still valid and backfilled as binary; outbound images go through a two-step "upload media → send media" flow.

## Verify and troubleshoot

**Confirm the connection** — the plugin log shows `QQ Bot access_token 已更新`, `QQ Bot WSS 已连接`, and `QQ Bot Ready (session=...)` in sequence, meaning authentication and connection both succeeded.

**Confirm messaging** — send a private message to the bot or @ it in a group; the message should enter the MaiBot message pipeline and get a reply.

**Log shows `op=9 Invalid Session` with 4013/4014** — invalid or unauthorized intents; enable the corresponding event subscriptions on the QQ Open Platform and check the `intents` value.

**Disconnects quickly after connecting, no READY** — wrong AppSecret or token fetch failure; verify `app_id` / `app_secret` and check whether token retrieval succeeded in the logs.

**Disconnect log shows `close_code=4914/4915`** — the bot has been taken down / banned; check the application status on the QQ Open Platform.

**"Heartbeat timeout" before a disconnect** — network problem or the server did not ACK; check the network—the plugin reconnects automatically.

**"加载图片二进制失败" (failed to load image binary)** — the image rkey expired or the download failed; this is occasional and degrades to `[图片]` text—check connectivity to `multimedia.nt.qq.com.cn`.

**Private chat name is a long hexadecimal string** — the official API does not provide nicknames; this is the user openid and is expected.

**MaiBot treats its own messages as others'** — `bot_config.toml` is missing `qq_bot:AppID`; add `qq_bot:yourAppID` to `platforms` and restart the main program.