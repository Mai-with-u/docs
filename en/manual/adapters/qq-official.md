---
title: QQ Official Bot Adapter
---

# QQ Official Bot Adapter

**Connect through the QQ Open Platform bot, no QQ client login needed (officially maintained).** The QQ Official Bot Adapter lets MaiBot connect directly to the [QQ Open Platform](https://q.qq.com/): it authenticates with **AppID + AppSecret**, exchanges private and group messages over the official WebSocket gateway and OpenAPI, and supports text, @, images, emoji, voice, video, and files—no QQ client needs to be online.

::: info Connection direction
`QQ Open Platform ← QQ Official Bot Adapter (wss client) → MaiBot plugin message gateway`

The adapter exchanges the AppID + AppSecret for an access_token, then requests a gateway address from the QQ OpenAPI (`https://api.bot.qq.com` by default) and connects outbound. All connections are initiated by the adapter—no public callback URL is required, and the `[maim_message]` config section is not used.
:::

Adapter repository (officially maintained):

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

## Enable the built-in adapter

Open **QQ Official Bot Adapter** in WebUI adapter management, enter its connection settings, and enable it. Upgrades migrate the old configuration and retain existing data. The old installation is backed up under `plugins/.builtin-backups/`. The adapter is updated with MaiBot.

## Configure the adapter connection

Config file: `config/builtin_plugins/qq_official_adapter/config.toml`. You can also fill it in the WebUI under "QQ Official Bot Adapter → QQ Open Platform". Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true             # Enable the adapter; must be true to connect
config_version = "0.5.3"   # Config structure version, managed by the program

[qq_official]
app_id = "AppID shown on the open platform"
app_secret = "AppSecret paired with the AppID"
api_base_url = "https://api.bot.qq.com"  # QQ Open Platform API address; usually leave it alone
unified_account_id = ""    # Linked QQ number: chat streams belong to this ID and share context with other qq adapters
enable_mapping = false     # Enable mapping: switch linked user IDs from OpenID to QQ numbers; see "Enable mapping"
silent_user_sync = true    # Match QQ numbers, nicknames, and group cards against the linked account silently in bound groups; requires the linked QQ number
snowluma_identity_only = false  # While the official connection is ready, let the linked account collect identity only, avoiding double sending

[mute]
enabled = true             # Enable the set_mute tool; see "LLM tools"
allowed_groups = []        # Groups where muting is allowed (list of target objects); empty means no restriction; see "Allowed groups and protection lists"
admin_users = []           # Mute protection list (list of target objects); listed users are never muted
min_duration = 60          # Shortest mute duration in seconds; a positive integer
max_duration = 2592000     # Longest mute duration in seconds; the official cap is 30 days

[recall]
enabled = true             # Enable the recall_message tool
allowed_groups = []        # Groups where recalling is allowed (list of target objects); empty means no restriction; private chats are exempt

[kick]
enabled = false            # Enable the kick_member tool; requires the official "remove group member" API permission
allowed_groups = []        # Groups where kicking is allowed (list of target objects); empty means no restriction
admin_users = []           # Kick protection list (list of target objects); listed users are never removed

[filter]
ignore_other_bots = true   # Ignore messages sent by other bots

[advanced]
show_debug_info = false    # Log each message as active or passive sending; passive sending also shows the target message ID and reply index
reconnect_delay_sec = 5.0  # Reconnect delay after a disconnect in seconds, 1~300
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

- **Text and @** — plain text is sent as a normal message; when a text run contains an @ it switches to markdown, since only markdown renders a real @;
- **Images and emoji** — jpg / png / gif / webp / bmp, detected by file header;
- **Voice** — SILK, MP3, WAV, and OGG, also detected by file header, with the extension filled in by the adapter; a single clip is capped at 20 MB, and invalid data, unrecognized formats, or oversized audio is rejected instead of sent;
- **Video and files** — video must be MP4, and video and files are each capped at 100 MiB; regular files can use a host-issued `file_ref` or raw Base64;
- **Splitting rules** — an official message can only carry one kind of content; mixed messages are split into multiple messages in order, each taking one passive-reply slot, with **at most 5 passive replies per inbound group message**;
- **Upload** — images, emoji, voice, video, and files all go through the official chunked upload to obtain `file_info` before sending; no manual work needed.

::: tip Where the audio comes from
The adapter only pushes audio out through the official API; it does not synthesize speech. To make the bot talk, produce the audio with a TTS plugin or reply extension and hand it to the send path as a `voice` segment.
:::

## Message identity and profiles

Official messages carry identity information of their own, and the adapter fills in as much of it as it can before handing the message to MaiBot:

- **Nickname and group card** — in group events, the official nickname and the in-group nickname map to `user_nickname` and `user_cardname`, and take priority over silently synced profiles;
- **Group name** — message events usually carry no group name, so the adapter looks it up for the `group_openid`; when the lookup fails the chat stream keeps the group name it already recorded, so an existing name is never overwritten with an empty one;
- **Avatar** — the avatar delivered with the message is preferred, and the adapter falls back to a per-user query; it is kept in the adapter process and rebuilt after a restart;
- **Role and cross-app identifiers** — group member role, Union OpenID, Union group OpenID, and the original @ objects are written into the message's `additional_config` for plugins and debugging.

## Unified ID binding commands

OpenIDs on the QQ Open Platform are not interchangeable with real QQ numbers. To attribute messages to real QQ numbers (sharing data with the OneBot Adapter), send binding commands in a chat:

- **`/assign_group_id <group number>`** — binds the current group's `group_openid` to the given group number; available in group chats;
- **`/assign_id <QQ number>`** — binds the sender's OpenID to the given QQ number;
- **`/assign_id @someone <QQ number>`** — binds a mentioned user.

To bring the old number's existing memory across to a new number, binding alone is not enough—it only records the association while historical data stays under the old ID. Use [Person migration](/en/manual/webui/person-migration) to merge the person profile and long-term memory over.

Bindings take effect immediately and persist to `data/plugins/<plugin ID>/id_map.json`. Group bindings always apply: inbound group IDs are replaced by the mapped values, and outbound sends look the `group_openid` back up automatically. User bindings only record the association; whether a user ID becomes a QQ number is decided by the switch below. Command messages do not enter the chat stream; binding results come back as a reply receipt.

::: tip Enable mapping
`[qq_official].enable_mapping` defaults to off. While it is off, user IDs stay as raw OpenIDs, and existing user bindings and silently synced profiles are kept as-is; once it is on, linked users appear as QQ numbers in later messages. Switching modes does not migrate historical data, so the same person may show up as a different user or private chat.

You can also flip it in the WebUI under "Other source sync → Enable mapping", or with the mode toggle at the top right of the QQ Official Adapter page.
:::

::: tip When unified_account_id is needed
With only group / user bindings, ID data (statistics, expression learning, etc.) can align with other adapters, but chat streams are still distinguished by this adapter's own account ID. To **fully merge chat streams**, fill in `unified_account_id` to specify the same account ID—outbound messages of that chat stream then match the route precisely and are preferentially sent to the other adapter.
:::

## LLM tools

The three group-management tools are configured on the adapter config page under "Mute tool", "Recall tool", and "Kick tool". After saving, the adapter reconnects to the gateway with the new settings; MaiBot itself needs no restart.

### Mute tool set_mute

Controlled by `[mute].enabled` (on by default). Parameters are `msg_id`, `duration`, and `reason`; it mutes the sender of a message by its ID, resolving the group from that message and calling the official group mute API. `duration = 0` lifts the mute, and a positive integer is the number of seconds to mute.

- **`allowed_groups`** — groups where muting is allowed; empty means no restriction;
- **`admin_users`** — mute protection list; listed users are never muted, though it does not block lifting a mute;
- **`min_duration` / `max_duration`** — duration limits (sec), defaulting to 60 / 2592000. A positive duration is clamped into that range, and lifting a mute is not subject to `min_duration`; the platform caps at 30 days and rate-limits the API to 60 QPM.

Platform limits: only regular members can be muted (group owners, admins, and the bot cannot be muted); the target user must resolve to an OpenID—messages received through this adapter carry it automatically, otherwise bind it first with `/assign_id`.

### Recall tool recall_message

Controlled by `[recall].enabled` (on by default). Parameter is `msg_id`, with the group / private chat resolved from that message. `allowed_groups` restricts which groups can be recalled; empty means no restriction, and private chats are exempt.

Platform limits: messages sent more than 2 minutes ago cannot be recalled; in group chats, if the bot is a group admin it can recall its own and regular members' messages, otherwise it can only recall its own; in private chats the bot can only recall its own messages.

### Kick tool kick_member

Controlled by `[kick].enabled`, which is **off by default**. Parameters are `msg_id` and an optional `reason`; it resolves the group and user from a message the target member sent, calls the official remove-group-member API to remove that one member, and **does not add them to the group blocklist**. `reason` only goes into the operation log and has no effect on the platform side.

- **`allowed_groups`** — groups where kicking is allowed; empty means no restriction;
- **`admin_users`** — kick protection list; listed users are never removed.

Preconditions: the bot needs group admin permission and the open platform must have granted it the "remove group member" API—flipping the switch without that permission makes the call fail. The tool also guards itself: it refuses to remove the bot, and refuses a `msg_id` that points at a private-chat message or resolves to no official OpenID.

### Allowed groups and protection lists

`allowed_groups` and `admin_users` are both **lists of target objects**, and each entry has four fields:

::: fields
- **`platform`** — `qq`, a fixed value.
- **`type`** — `group` or `user`, determined by the field itself; you never edit it by hand.
- **`id`** — The real ID on the platform: a unified group number / QQ number, or a `group_openid` / OpenID. An empty value fails at load time.
- **`name`** — Display name, never used for matching; renaming or reusing it changes nothing about permissions.
:::

In the WebUI these two fields render as searchable multi-selects: type a group name or a user nickname and pick from the groups and users the host already knows—no copying IDs by hand. Only targets the host has recorded show up: a group must have produced a chat stream, and a user must exist in the person profiles.

When writing TOML by hand, each array element is a full target:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[mute]
allowed_groups = [
  { platform = "qq", type = "group", id = "123456789", name = "Main group" },
]
admin_users = [
  { platform = "qq", type = "user", id = "1026294844", name = "On-call moderator" },
]

[recall]
allowed_groups = [
  { platform = "qq", type = "group", id = "123456789", name = "Main group" },
]

[kick]
enabled = true
allowed_groups = [
  { platform = "qq", type = "group", id = "123456789", name = "Main group" },
]
admin_users = [
  { platform = "qq", type = "user", id = "1026294844", name = "On-call moderator" },
]
```

:::

Legacy string lists (`allowed_groups = ["123456789"]`) are converted to target objects at load time: `platform` becomes `qq`, `type` is filled in as `group` or `user` per field, and `name` stays empty. Saving the config writes the structured list back. Empty strings are dropped, and an entry whose `id` is still empty after conversion fails immediately.

What the protection list matches depends on the mapping switch: with mapping off, only the OpenID is compared, so put OpenIDs in the list; with mapping on, linked QQ numbers, Union IDs, and OpenIDs all match.

::: tip Default behavior when tools are unconfigured
When tool settings are absent or `allowed_groups` is empty, the tools do not restrict groups; an explicit `enabled = false` in existing settings still disables the corresponding tool. Mute and recall are on by default, kick is off by default and needs the switch in the WebUI or `[kick].enabled = true`.
:::

## Avatar API (for developers)

Provides the public API `adapter.avatar.get` (version `1`), using the same [avatar protocol](/en/develop/adapters/avatar-api) as the OneBot Adapter. Parameters are `platform`, `target_id`, and `target_type` (`user` or `group`, defaulting to `user`), and it accepts `account_id` and `scope` passed by the host.

- **Numeric IDs** — QQ numbers and group numbers use the official qlogo URL and return `expires_in = 86400`; images are downloaded and cached by the host uniformly. An OpenID bound to a numeric ID with `/assign_id` or `/assign_group_id` takes this path using the bound value, regardless of the mapping switch;
- **User OpenIDs** — the avatar recorded when the message arrived is preferred; with no record, the adapter builds the OpenID avatar route from AppID + OpenID, so an AppID must be configured;
- **The bot itself** — the avatar comes from the `/users/@me` detail call;
- **Group OpenIDs** — `status = "unsupported"`, because the platform has no group-avatar lookup by group OpenID; use the numeric group number for those groups;
- **Non-`qq` platforms** — `status = "unsupported"`.

::: warning Poke is not supported yet
The QQ Open Platform official API does not currently provide a poke interface, so this adapter does not support it.
:::

## Verify and troubleshoot

**Verify the connection** — restart MaiBot and confirm the log shows a successful connection; @ the bot with a plain-text message in a test group, or have a test user start a private chat and send plain text, and check that MaiBot creates a chat stream and replies. That means success.

**Verify the tools and lists** — on the WebUI adapter config page, "Allowed groups" should be a search box rather than a text field; after picking a group and saving, the matching field in `config.toml` holds an entry with `platform`, `type`, `id`, and `name`.

**401 or authentication failures** — verify the AppID and AppSecret belong to the same bot. After resetting the AppSecret, update the plugin configuration accordingly and restart.

**Not receiving group or private messages** — confirm the bot has been granted the permissions for the scenario and that full group messages are enabled. If the quick-creation page shows "group chats not supported", the plugin cannot bypass the platform restriction.

**Mentioning the bot in a group is not recognized** — in the "adapter policy" section of the WebUI chat page, confirm the `qq` platform is allowed; confirm the group's "message scope accessible to the bot" is set to all messages.

**User ID is still an OpenID after binding** — a binding only records the association; "Enable mapping" must also be on. Mapping being off is the current setting, not a failed binding.

**A group or user cannot be found in the picker** — the picker only lists targets the host knows: a group must have produced a chat stream, and a user must exist in the person profiles. Such targets can still be written into `config.toml` by hand.

**Mute / recall / kick failures** — check the `ERROR` logs for the same time period and confirm each item: whether `[mute].enabled` / `[recall].enabled` / `[kick].enabled` are `true`, whether the target group is within the matching `allowed_groups`, and whether the target member is on `admin_users`; the official API is rate-limited to 60 QPM and fails when exceeded; messages older than 2 minutes cannot be recalled.

**Kick reports no API permission** — when the log shows `QQ 接口 batch_remove_members 失败: HTTP 4xx code=11253` (`11253` is the open platform's "no API access permission"), the platform has not granted the bot "remove group member" and no tool switch can work around it; also confirm the bot itself has group admin permission.

**Voice will not send** — check the audio header is one of SILK, MP3, WAV, or OGG (AAC and similar formats count as unsupported), and whether it exceeds 20 MB. The adapter does not synthesize speech, so a `voice` segment must carry valid audio data.

**"Thinking but no reply"** — group chats allow at most 5 passive replies per inbound message, and splitting mixed messages consumes reply slots; once exhausted, wait for the next inbound message. Also check the `ERROR` logs for the same time period to locate the failure.
