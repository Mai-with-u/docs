---
title: QQ Official Adapter
---

# QQ Official Adapter

**Connect through the QQ Open Platform bot, no QQ client login needed (community-maintained).** The QQ Official Bot Adapter lets MaiBot send and receive text, images, stickers, voice, video, and files through the official QQ Open Platform WebSocket gateway and OpenAPI, in QQ private chats, QQ group chats, guild text channels, and guild direct messages. It authenticates with **AppID + AppSecret** and needs no QQ client online.

::: info Connection Direction
`QQ Official WebSocket Gateway ← QQ Official Bot Adapter (wss client) → MaiBot Plugin Message Gateway`

The adapter exchanges the AppID + AppSecret for an access_token, then requests `/gateway/bot` from the QQ OpenAPI (`https://api.sgroup.qq.com`) to obtain a `wss` address and connects outbound. No public callback URL is required, and `[maim_message]` is not used.
:::

Adapter repository (🌐 community-maintained):

<Linkcard url="https://github.com/WhiteCloudOL/qq-official-adapter" title="qq-official-adapter" description="WhiteCloudOL's QQ official bot adapter plugin" />

## 1. Apply for an Official QQ Bot Account

1. Open the [QQ Bot Open Platform](https://q.qq.com/qqbot/openclaw/) and create a bot.
2. On the bot management page (`https://q.qq.com`), securely save the `AppID` and `AppSecret`.

::: warning AppSecret is the bot's password
Do not leak it, and never commit your local `config.toml` or its backups. If you suspect a leak, rotate it immediately on the open platform.
:::

Which scenarios are actually available depends on the permissions granted to the bot on the open platform: quickly created personal bots are usually only usable by their creator. Whether group chats, guilds, and full message access are supported is subject to what the open platform page shows.

### Full Group Message Scope

To use group chat features, the **group owner** must open the QQ group settings, select the bot, and set "message scope accessible to the bot" to "receive all messages in the group". Without this, the bot only receives messages within the platform-allowed scope and cannot fully participate in group chats. This setting can only be changed by the group owner and must be configured separately for every group that uses the bot.

## 2. Requirements

- **MaiBot core** — version 1.0.6 or later (1.x)
- **MaiBot Plugin SDK** — 2.7.0 or later
- **Python** — 3.11 or later
- **aiohttp** — 3.8.0 or later, a dependency declared in the plugin manifest and handled automatically by MaiBot; no manual work needed

## 3. Configure the adapter connection

Adapter settings are filled in the MaiBot WebUI plugin configuration page (backed by the `config.toml` in the plugin directory). Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[credentials]
appid = "AppID shown on the open platform"
app_secret = "AppSecret paired with the AppID"
sandbox = false   # sandbox environment (sandbox.api.sgroup.qq.com), debugging only

[chat]
enable_chat_list_filter = false   # list filtering, disabled by default
show_dropped_chat_list_messages = false  # log dropped messages (turn on when troubleshooting)
group_list_type = "whitelist"     # group list mode: whitelist / blacklist
group_list = []                   # group openids
private_list_type = "whitelist"   # private list mode: whitelist / blacklist
private_list = []                 # user openids
ban_user_id = []                  # globally blocked user openids; dropped before the Host
```

:::

::: warning The lists take OpenIDs
The lists take QQ official **OpenIDs** (usually unreadable strings), **not** numeric QQ numbers or group numbers—fill in the OpenIDs exactly as shown in the logs.
:::

List filtering is disabled by default; with no configuration, the adapter receives every message within the bot's permission scope. When disabled, the lists are ignored and only the global block rule remains.

## 4. Set the MaiBot main account

The platform name remains `qq`. Let the adapter connect once first, then find the following line in the logs:

```
QQ 官方 WebSocket 已就绪: ... self_id=机器人自身ID
```

Then fill in MaiBot's `config/bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"
qq_account = "the self_id from the ready log"
```

:::

::: warning
`qq_account` takes the bot's own ID from QQ official events (the OpenID system)—**not** the AppID, a numeric QQ number, or a OneBot v11 bot QQ number. The MaiBot core uses it to mark messages sent by the bot itself. The bot's display nickname is read automatically from `bot.nickname`, and mentions in group chats are kept in the chat context as `@nickname`; there is no need to repeat the bot ID in the plugin configuration.
:::

## Verify and troubleshoot

**Confirm a successful connection** — Restart MaiBot and confirm the log shows "QQ 官方 WebSocket 已就绪" (QQ official WebSocket ready). Recommended tests in order: send plain text in a private chat; mention the bot in a group chat with text; send a plain image and a QQ sticker; have MaiBot reply with an image-only, sticker-only, and mixed text-image message.

**Mentioning the bot in a group is not recognized** — Confirm the debug log received a `GROUP_AT_MESSAGE_CREATE` or `GROUP_MESSAGE_CREATE` event. The adapter determines whether it was mentioned by combining the event type, its own WebSocket ID, structured mentions, and message elements, and it automatically learns the bot's OpenID within group chats—no manual bot ID configuration is needed.

**Recognized but unable to reply** — Check that `qq_account` in `config/bot_config.toml` equals the `self_id` in the ready log.

**Not receiving group or guild messages** — Confirm the bot has been granted the permissions for the scenario and that full group messages are enabled. If the quick-creation page shows "group chats not supported", the plugin cannot bypass the platform restriction.

**401 or authentication failures** — Verify the AppID and AppSecret belong to the same bot. After resetting the AppSecret, update the plugin configuration accordingly and restart.

**"Thinking but no reply"** — Check the `ERROR` logs for the same time period first; per-message send/receive details are recorded at the `DEBUG` level and do not occupy the default info log.