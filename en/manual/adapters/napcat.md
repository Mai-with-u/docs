---
title: NapCat Adapter
---

# NapCat Adapter

**Log in your own QQ account to connect (officially recommended).** The NapCat adapter lets MaiBot connect to QQ through [NapCat](https://github.com/NapNeko/NapCatQQ), sending and receiving messages, handling group chats and private chats, and pushing notice events. It is an **officially maintained** MaiBot plugin that connects to NapCat's **forward WebSocket server** as a client. It needs no reverse WebSocket and does not use the `[maim_message]` config section.

::: tip Officially maintained
The NapCat adapter is continuously maintained by the MaiBot team, most recently updated to v1.4.0 (2026-08-19), compatible with MaiBot ≥ 1.2.0. It supports group chats, private chats, voice, images, merged forwards, proactive private chats, and multi-instance connections. If you run into issues, report them in [GitHub Issues](https://github.com/Mai-with-u/MaiBot-Napcat-Adapter/issues).
:::

Adapter repository (🏛️ officially maintained):

<Linkcard url="https://github.com/Mai-with-u/MaiBot-Napcat-Adapter" title="MaiBot-Napcat-Adapter" description="MaiBot's officially maintained NapCat QQ adapter plugin" logo="/title_img/mai.png" />

Message flow: **QQ → NapCat → adapter plugin (inside MaiBot) → MaiBot**

## Environment requirements

- **MaiBot** — ≥ 1.2.0
- **aiohttp** — the adapter depends on it to establish the WebSocket connection; normally bundled with MaiBot. If missing, the plugin reports "depends on aiohttp, but it is not installed".
- **NapCat** — a running NapCat instance that can log in and connect to QQ (see Step 1 below)

## Install NapCat and log in your bot QQ account

The adapter only handles the "MaiBot ↔ NapCat" connection. Install, log in, and start NapCat itself per its official docs.

<Linkcard url="https://doc.napneko.icu/" title="NapCat official docs" description="Install NapCat, log in to QQ, configure the WebSocket service" />

1. Install NapCat following the official docs, and log in your bot QQ account;
2. Confirm NapCat runs normally and that QQ account is online.

::: warning This QQ account is the bot itself
The QQ account NapCat logs in with must exactly match the `qq_account` in `bot_config.toml` below, so MaiBot can recognize the bot's own messages. If they differ, the bot mistakes its own messages for someone else's.
:::

## Enable the forward WebSocket server

Enable the **forward WebSocket server** in NapCat's config, and note down the **port** and **access token** it listens on:

- **Port** — defaults to `3001`. Enter it in the adapter's `napcat_server.port`.
- **Access token** — optional. When enabled, clients must carry the same token to handshake; enter it in `napcat_server.token`.

::: tip Distinguish the three tokens
- **NapCat WebUI token** — used to log in to NapCat's own web admin UI; unrelated to this adapter.
- **NapCat forward WebSocket token** — the one set on the "forward WebSocket" service; this is the token to put in `napcat_server.token`.
- **MaiBot WebUI token** — used to log in to MaiBot's own web admin UI; unrelated to this adapter.
:::

## Configure MaiBot's bot account

Edit the `[bot]` section of `config/bot_config.toml` so MaiBot recognizes the bot itself:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"       # Local-client adapters such as NapCat / SnowLuma all use qq
qq_account = "YOUR_QQ"  # Must match the QQ account NapCat is logged in with
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — set to `"qq"`, the platform identifier for local-client adapters.
- **`qq_account`** — the QQ number NapCat is logged in with (as a string); the two must match exactly.
- **`platforms`** — NapCat uses the `qq` platform; you do not add a `qq_bot:` entry as with official bots. Leave it as is.

You can also set this in the WebUI: `Bot Settings → Basic → platform account`, pick platform `qq`, and enter the bot QQ number.

## Configure the adapter connection

The NapCat adapter connects out to NapCat as a client. Here is a **complete, copy-ready** config template — edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                    # Enable the adapter; must be true to connect
enable_private_chat_tool = false  # Proactive private-chat tool, see section 6
config_version = "0.1.0"          # Config structure version; usually leave it alone

[napcat_server]
host = "127.0.0.1"   # NapCat address; local loopback, or the service name in Docker
port = 3001          # Forward WebSocket port, must match NapCat's setting
token = ""           # Access token; fill in the same token if NapCat enables auth
heartbeat_interval = 30.0   # Heartbeat timeout interval (sec); must be greater than 0
reconnect_delay_sec = 5.0   # Wait before reconnecting after a disconnect (sec)
action_timeout_sec = 15.0   # Timeout when calling NapCat action APIs (sec)
connection_id = ""          # Connection ID; distinguish links in multi-instance setups, see section 6

[chat]
enable_chat_list_filter = true    # List filtering, enabled by default
show_dropped_chat_list_messages = false  # Log dropped messages (turn on when troubleshooting)
group_list_type = "whitelist"     # Group list mode: whitelist / blacklist
group_list = []                   # Group IDs; add your lists first, see section 5
private_list_type = "whitelist"   # Private list mode: whitelist / blacklist
private_list = []                 # User QQ IDs
ban_user_id = []                  # Globally blocked user QQ IDs; messages dropped before the Host
ban_qq_bot = false                # Block QQ official bot messages

[notice]
enabled = true            # Route notice events to the Host; off means no notices reach it
enable_poke = true        # Poke
enable_friend_recall = true   # Friend message recall
enable_group_recall = true    # Group message recall
enable_group_ban = true       # Group ban / unban
enable_group_msg_emoji_like = true  # Emoji reactions on group messages
enable_group_upload = true    # Group file upload
enable_group_increase = true  # Member joins
enable_group_decrease = true  # Member leaves
enable_group_admin = true     # Admin changes
enable_essence = true         # Essence message changes
enable_group_name = true      # Group name changes

[filters]
ignore_self_message = true        # Ignore the bot's own messages; keep it on
regex_filter_enabled = false      # Enable regex message filtering
regex_filter_mode = "blacklist"   # blacklist (drop matches) / whitelist (only allow matches)
regex_filter_patterns = []        # Regex patterns, Python re syntax
regex_filter_show_dropped = false # Log messages dropped by the regex filter
```

:::

::: tip Default behavior of notice events
Notice events are enabled by default and can be controlled per type. Types not listed here (such as the input status `notify.input_status`) are dropped by default to avoid log spam.
:::

## Add the lists first, then test

The chat list filter is **enabled by default with an empty list** — without adding anything, all group and private messages are dropped. This is the most common reason for "no response" after connecting to QQ. The right approach is to **add the groups / users you want to connect first, then test**:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = true
group_list = ["123456789"]        # your group ID
private_list = ["987654321"]      # user QQ ID for private chat
```

:::

Group and user IDs are normalized to strings and deduplicated automatically. To temporarily allow all messages while testing connectivity, you can turn the filter off:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = false   # testing only; add your lists back and re-enable when done
```

:::

::: tip There is also a main-program list layer
Besides the adapter's own `[chat]` lists, MaiBot keeps a unified group / private-chat access policy in `config/adapter_policy.toml` (default actions plus per-adapter `allow_ids` / `deny_ids`). **A message enters the conversation only when both layers allow it**, so check both when troubleshooting "no response"; see [Adapter Management](../webui/adapter-management.md).
:::

::: tip Full NapCat action API
The adapter transparently exposes most of NapCat's OneBot action APIs (System / Account / Group / Message / File namespaces) for developers. See the full list in the [NapCat API reference](https://napcat.apifox.cn/).
:::

## Optional advanced capabilities: proactive private chat, multi-instance

### Proactive private chat

`enable_private_chat_tool = false` by default. Turn it on and the model gains two tools to **send the first private message to a user** and **resolve the sender's QQ ID from a message ID**:

- **`open_private_chat`** — sends the first private message to a given QQ user; after success, that user's inbound private messages bypass the private chat list filter for **15 minutes**
- **`get_qq_by_msg_id`** — given a message ID in the current chat, returns that message's sender QQ ID, handy for confirming the target before a proactive private chat

To enable:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
enable_private_chat_tool = true
```

:::

::: tip Why `get_qq_by_msg_id` is useful
Group members may never have private-chatted the bot, so the model does not know their QQ IDs. Use this tool to fetch the sender's QQ ID from a message, then call `open_private_chat` to proactively start a private chat.
:::

### Multi-instance

When one MaiBot connects to multiple NapCat links, give each link a **different `connection_id`** (e.g. `primary`, `secondary`) to use as a routing scope identifier and keep the links from interfering with each other.

## Verification & Troubleshooting

**Verify the connection** — the plugin logs `NapCat 适配器已连接: ws://127.0.0.1:3001` (NapCat adapter connected), and @-ing the bot in an added group gets a reply. That means success.

**Cannot connect, logs keep showing "connection failed"** — check that `napcat_server.host` / `port` match NapCat's forward WebSocket listening address; confirm NapCat has the forward WS service enabled and the port is not blocked by a firewall; if auth is on, confirm `napcat_server.token` matches NapCat's setting.

**Connected but @-ing the bot in a group gets no response** — first check the chat list: confirm the group is in `group_list`; temporarily set `enable_chat_list_filter = false` or turn on `show_dropped_chat_list_messages = true` to inspect dropped logs. Then confirm `plugin.enabled = true`.

**Can receive but not send** — does the bot have permission to speak; is `action_timeout_sec` too short; confirm `qq_account` in `bot_config.toml` matches the QQ account NapCat is logged in with.

**The bot mistakes its own messages for someone else's** — `qq_account` in `bot_config.toml` differs from NapCat's logged-in QQ. Make them match and restart the host.

**Notices do not arrive (poke / recall, etc.)** — confirm `[notice].enabled = true` and the relevant type switch is on; notice types not listed are dropped by default, which is expected.
