---
title: QQ Official Bot Adapter
---

# QQ Official Bot Adapter

**Connect through the QQ Open Platform bot, no QQ client login needed (officially maintained).** The QQ Official Bot Adapter lets MaiBot connect directly to the [QQ Open Platform](https://q.qq.com/): it authenticates with **AppID + AppSecret**, exchanges private and group messages over the official WebSocket gateway and OpenAPI, and supports outbound text, @, images, and emoji—no QQ client needs to be online.

::: info Connection direction
`QQ Open Platform ← QQ Official Bot Adapter (wss client) → MaiBot plugin message gateway`

The adapter exchanges the AppID + AppSecret for an access_token, then requests a gateway address from the QQ OpenAPI (`https://api.bot.qq.com` by default) and connects outbound. All connections are initiated by the adapter—no public callback URL is required, and the `[maim_message]` config section is not used.
:::

Adapter repository (🏛️ officially maintained):

<Linkcard url="https://github.com/Mai-with-u/MaiBot-QQ-Adapter" title="MaiBot-QQ-Adapter" description="MaiBot's officially maintained QQ official bot adapter plugin, connecting directly to the QQ Open Platform" logo="/title_img/mai.png" />

## Apply for an official QQ bot account

1. Open the [QQ Open Platform](https://q.qq.com/), complete developer registration, and create a bot;
2. Get the **AppID** and **AppSecret (ClientSecret)** in the console;
3. Enable group-chat and private-chat capabilities for the bot in the console.

::: warning AppSecret is the bot's password
Do not leak it, and never commit your local `config.toml` or its backups. If you suspect a leak, rotate it immediately on the open platform.
:::

::: warning OpenID is not a QQ number
OpenIDs on the QQ Open Platform are not interchangeable with real QQ numbers (they are usually unreadable strings). What appears in logs, lists, and tool parameters may be an OpenID; when you need messages to be attributed to real QQ numbers, use the [unified ID binding commands](#unified-id-binding-commands) below.
:::

### Enable full group message scope

To use group chat features, the **group owner** must open the QQ group settings, select the bot, and set "message scope accessible to the bot" to "receive all messages in the group". Without this, the bot only receives messages within the platform-allowed scope and cannot fully participate in group chats. This setting can only be changed by the group owner and must be configured separately for every group that uses the bot.

## Install the adapter

1. Install "QQ Official Bot Adapter" from the plugin store in the MaiBot WebUI, or download the zip from the GitHub repository and extract it into `plugins/`;
2. Enable the adapter in the plugin list.

::: info Dependencies are handled automatically
The adapter depends on `aiohttp` (>= 3.14.3), which is declared in the plugin manifest and handled by MaiBot automatically—no manual installation needed.
:::

## Configure the adapter connection

Config file: `plugins/qq_official_adapter/config.toml`. You can also fill it in the WebUI under "QQ Official Bot Adapter → QQ Open Platform". Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true            # Enable the adapter; must be true to connect
config_version = "0.4.1"  # Config structure version; usually leave it alone

[qq_official]
app_id = "AppID shown on the open platform"
app_secret = "AppSecret paired with the AppID"
api_base_url = "https://api.bot.qq.com"  # QQ Open Platform API address; usually leave it alone
reconnect_delay_sec = 5.0                # Reconnect delay after a disconnect (sec)
unified_account_id = ""   # Optional: unified account ID (e.g. the NapCat bot QQ number); set it to share chat streams with other qq adapters
assign_admin_ids = []     # Optional: users allowed to run binding commands (unified ID or OpenID); empty means no restriction

[mute]
enabled = true            # Enable the mute tool; see "LLM tools"
allowed_groups = []       # Groups where muting is allowed (unified group number or group_openid); empty means no restriction

[recall]
enabled = true            # Enable the recall_message tool
allowed_groups = []       # Groups where recalling is allowed (unified group number or group_openid); empty means no restriction; private chats are exempt
```

:::

## Verify the connection and allow the platform

1. After saving the config, restart MaiBot and confirm from the logs that the adapter has connected;
2. In a configured test group, **@ the bot with a plain-text message**, or have a test user start a private chat and send plain text, and check whether MaiBot creates a chat stream and replies;
3. In the "adapter policy" section of the WebUI chat page, confirm the `qq` platform is allowed.

::: tip Bot identity is reported automatically
The adapter reports its identity to MaiBot automatically once connected: it uses the bot's own OpenID by default, or follows `unified_account_id` when that is set. The `[bot].qq_account` in `config/bot_config.toml` normally needs no manual entry—it only acts as a fallback before the adapter reports its identity.
:::

## Outbound message capabilities

- **Supported content** — text, @ (sent as markdown when an @ is included, so a real @ renders), images and emoji (jpg / png / gif / webp / bmp);
- **Splitting rules** — an official message can only carry one kind of content; mixed messages are split into multiple messages in order, each taking one passive-reply slot, with **at most 5 passive replies per inbound group message**;
- **Image upload** — images / emoji are uploaded through the official chunked upload to obtain `file_info` before sending; no manual work needed;
- **Not supported yet** — outbound voice and files; such calls fail directly with a send error.

## Unified ID binding commands

OpenIDs on the QQ Open Platform are not interchangeable with real QQ numbers. To attribute messages to real QQ numbers (unifying data with NapCat-family adapters), send binding commands in a chat:

- **`/assign_group_id <group number>`** — binds the current group's `group_openid` to the given group number; available in group chats;
- **`/assign_id <QQ number>`** — binds the sender's OpenID to the given QQ number;
- **`/assign_id @someone <QQ number>`** — binds a mentioned user.

Bindings take effect immediately and persist to `data/plugins/<plugin ID>/id_map.json`: inbound group / user IDs are replaced by the mapped values (the original OpenID is kept in the message routing info), and outbound sends look the OpenID back up automatically to call the official API. Command messages do not enter the chat stream; binding results come back as a reply receipt.

::: tip When unified_account_id is needed
With only group / user bindings, ID data (statistics, expression learning, etc.) can align with other adapters, but chat streams are still distinguished by this adapter's own account ID. To **fully merge chat streams**, fill in `unified_account_id` to specify the same account ID—outbound messages of that chat stream then match the route precisely and are preferentially sent to the other adapter.
:::

## LLM tools

### Mute tool

Controlled by `[mute].enabled` (on by default). Parameters are `msg_id`, `duration`, and `reason`; it mutes the sender of a message by its ID, resolving the group from that message and calling the official group mute API. Constraints:

- **`allowed_groups`** — groups where muting is allowed (unified group number or `group_openid`); empty means no restriction;
- **`admin_users`** — protection list (unified QQ numbers or OpenIDs); listed users are never muted;
- **`min_duration` / `max_duration`** — duration limits (sec), defaulting to 60 / 2592000; the platform caps at 30 days and rate-limits the API to 60 QPM.

Platform limits: only regular members can be muted (group owners, admins, and the bot cannot be muted); the target user must resolve to an OpenID—messages received through this adapter carry it automatically, otherwise bind it first with `/assign_id`.

### Recall tool

Controlled by `[recall].enabled` (on by default). Parameter is `msg_id`, with the group / private chat resolved from that message. `allowed_groups` restricts which groups can be recalled; empty means no restriction, and private chats are exempt.

Platform limits: messages sent more than 2 minutes ago cannot be recalled; in group chats, if the bot is a group admin it can recall its own and regular members' messages, otherwise it can only recall its own; in private chats the bot can only recall its own messages.

::: tip Default behavior when tools are unconfigured
When tool settings are absent or `allowed_groups` is empty, the tools are enabled and unrestricted; an explicit `enabled = false` in existing settings still disables the corresponding tool.
:::

## Avatar API (for developers)

Provides the public API `adapter.avatar.get` (version `1`), using the same avatar protocol as the Unified QQ Connector. Parameters are `platform`, `target_id`, and `target_type` (`user` or `group`, defaulting to `user`), and it accepts `account_id` and `scope` passed by the host.

- Numeric QQ numbers and group numbers return an avatar URL and `expires_in = 86400`; images are downloaded and cached by the host uniformly;
- When an OpenID has been bound to a real numeric ID via `/assign_id` or `/assign_group_id`, the bound value is used to look up the avatar;
- Unbound OpenIDs, non-numeric bound values, and non-`qq` platforms return `status = "unsupported"`.

::: warning Poke is not supported yet
The QQ Open Platform official API does not currently provide a poke interface, so this adapter does not support it.
:::

## Verify and troubleshoot

**Verify the connection** — restart MaiBot and confirm the log shows a successful connection; @ the bot with a plain-text message in a test group, or have a test user start a private chat and send plain text, and check that MaiBot creates a chat stream and replies. That means success.

**401 or authentication failures** — verify the AppID and AppSecret belong to the same bot. After resetting the AppSecret, update the plugin configuration accordingly and restart.

**Not receiving group or private messages** — confirm the bot has been granted the permissions for the scenario and that full group messages are enabled. If the quick-creation page shows "group chats not supported", the plugin cannot bypass the platform restriction.

**Mentioning the bot in a group is not recognized** — in the "adapter policy" section of the WebUI chat page, confirm the `qq` platform is allowed; confirm the group's "message scope accessible to the bot" is set to all messages.

**Mute / recall failures** — check the `ERROR` logs for the same time period: confirm `[mute].enabled` / `[recall].enabled` are `true` and the target group is within the `allowed_groups` scope; the official API is rate-limited to 60 QPM and fails when exceeded; messages older than 2 minutes cannot be recalled.

**"Thinking but no reply"** — group chats allow at most 5 passive replies per inbound message, and splitting mixed messages consumes reply slots; once exhausted, wait for the next inbound message. Also check the `ERROR` logs for the same time period to locate the failure.
