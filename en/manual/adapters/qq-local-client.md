---
title: Unified QQ Connector
---

# Unified QQ Connector

**Log in your own QQ account to connect (officially maintained).** The Unified QQ Connector (repository `MaiBot-SnowLuma-Adapter`; since v1.0.0 it merges the former SnowLuma adapter and the NapCat adapter) lets MaiBot connect to QQ through [SnowLuma](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter) or [NapCat](https://github.com/NapNeko/NapCatQQ): one plugin supports both client types, detects the peer automatically once connected, and handles message sending/receiving, group chats and private chats, with support for voice, emoji parsing, and proactive private messaging. It is an **officially maintained plugin** of MaiBot, plugin-only, running directly inside the MaiBot process.

::: tip Officially maintained
The Unified QQ Connector is continuously maintained by the MaiBot official team; if you encounter issues, report them in [GitHub Issues](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter/issues).
:::

::: warning Upgrading to MaiBot 1.3.0
MaiBot 1.3.0 requires the Unified QQ Connector v1.0.0 or later: the new adapter has merged the former NapCat adapter, and after upgrading you must **re-configure the allow/deny lists** (existing lists are not carried over automatically). The standalone NapCat adapter is no longer evolving and has been archived—see [NapCat Adapter (archived)](./napcat.md).
:::

Adapter repository (🏛️ officially maintained):

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="MaiBot-SnowLuma-Adapter" description="Unified QQ Connector: one plugin for both SnowLuma / NapCat clients" logo="/title_img/mai.png" />

Message flow: **QQ → SnowLuma/NapCat → adapter plugin (inside MaiBot) → MaiBot**

## Prepare a client and log in your bot QQ account

The adapter only handles the "MaiBot ↔ SnowLuma/NapCat" link. Deploy and log into the client per its docs, and make sure it has enabled the **forward WebSocket server**. Default connection `ws://127.0.0.1:3001` (same machine).

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="SnowLuma docs" description="Deploy SnowLuma, log in to QQ, enable the forward WebSocket service" />

<Linkcard url="https://doc.napneko.icu/" title="NapCat official docs" description="Install NapCat, log in to QQ, enable the forward WebSocket server" />

::: warning This QQ account is the bot itself
The QQ account the client logs in with must exactly match the `qq_account` in `bot_config.toml` below, so MaiBot can recognize the bot's own messages.
:::

## Configure MaiBot's bot account

Edit the `[bot]` section of `config/bot_config.toml` so MaiBot recognizes the bot itself:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"         # Local-client adapters such as SnowLuma / NapCat all use qq
qq_account = "YOUR_QQ"  # Must match the QQ account the client is logged in with
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — set to `"qq"`, the platform identifier for local-client adapters.
- **`qq_account`** — the QQ number the client is logged in with (as a string); the two must match exactly.

You can also set this in the WebUI: `Bot Settings → Basic → platform account`, pick platform `qq`, and enter the bot QQ number.

## Configure the adapter connection

Config file: `plugins/MaiBot-SnowLuma-Adapter/config.toml`. Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                      # Enable the adapter; must be true to connect
qq_face_parse_mode = "description"  # QQ face parsing: description → Chinese text / emoji → approximate Unicode emoji
config_version = "2.5.0"            # Config structure version; usually leave it alone

[client]
client_type = "auto"        # Peer client type: auto detects after connecting; can also pin napcat / snowluma
server = "127.0.0.1"        # SnowLuma / NapCat address; local loopback
port = 3001                 # Forward WebSocket port, must match the client's setting
token = ""                  # Access token; fill in the same token if the client enables auth
heartbeat_interval = 30.0   # Protocol-level WebSocket ping keepalive interval (sec); must be greater than 0
reconnect_delay_sec = 5.0   # Wait before reconnecting after a disconnect (sec)
action_timeout_sec = 15.0   # Timeout when calling action APIs (sec)
connection_id = ""          # Connection ID; distinguish links in multi-instance setups, see below

[chat_abilities]
enable_private_chat_tool = false  # Proactive private-chat tool, see "LLM tool switches"
enable_poke_tool = false          # Poke tool
enable_recall_tool = false        # Recall tool
enable_mute_tool = false          # Smart mute tool
enable_emoji_like_tool = false    # Emoji reaction tool
enable_forward_tool = false       # Merged-forward tool

[notice]
enabled = true                    # Route notice events to the Host; off means no notices reach it
enable_poke = true                # Poke
enable_friend_recall = true       # Friend message recall
enable_group_recall = true        # Group message recall
enable_group_ban = true           # Group ban / unban
enable_group_msg_emoji_like = true  # Emoji reactions on group messages
enable_group_upload = true        # Group file upload
enable_group_increase = true      # Member joins
enable_group_decrease = true      # Member leaves
enable_group_admin = true         # Admin changes
enable_essence = true             # Essence message changes
enable_group_name = true          # Group name changes

[filters]
ban_user_id = []                  # User blacklist (QQ IDs); their group and private messages are dropped
ban_qq_bot = false                # Block QQ official bot messages
regex_filter_enabled = false      # Enable regex message filtering
regex_filter_mode = "blacklist"   # blacklist drops matches / whitelist only allows matches
regex_filter_patterns = []        # Regex patterns, Python re syntax
regex_filter_show_dropped = false # Log messages dropped by the regex filter

[mute]
admin_users = []        # Mute protection list (QQ IDs); listed users are never muted
allowed_groups = []     # Group allowlist for muting; empty means no restriction
min_duration = 60       # Minimum mute duration (sec); lower values from the model are raised to this
max_duration = 2592000  # Maximum mute duration (sec); 30 days by default, higher values are truncated

[debug]
enable_ada_debug_raw_message_log = false       # Log inbound raw message segments; turn on when debugging structure
enable_ada_debug_raw_outbound_message_log = false  # Log the action and params actually sent outbound
ignore_self_message = false                    # Ignore messages sent by the bot itself
```

:::

::: tip Legacy config is migrated automatically
Legacy `[luma_client]` / `[napcat_server]` / `[connection]` sections from the old SnowLuma / NapCat adapters are **migrated to `[client]`** on load (`host` → `server`, `access_token` → `token`), and the legacy config version is rewritten automatically—no manual edits needed.
:::

### How to pick client_type

- **`auto`** (default) — after each connect, detects via `get_version_info` whether the peer is NapCat or SnowLuma, and applies the matching capability profile;
- **`napcat` / `snowluma`** — pins the client type; the adapter cross-checks the pin against the detected implementation, logs a warning on mismatch, and runs as declared. Useful when the peer is fixed; `auto` is recommended for everyday use.

### Multi-instance connection_id

When one MaiBot connects to multiple client links, give each link a **different `connection_id`** (e.g. `primary`, `secondary`) to use as a routing scope identifier and keep the links from interfering with each other.

## Add the allow scope first, then test

The Unified QQ Connector **no longer ships built-in group / private-chat allow/deny lists**—inbound access is controlled uniformly by the host adapter policy: the adapter settings (allow/deny rules) in the WebUI or `config/adapter_policy.toml`, which **allows everything by default** (all group messages are accepted). To restrict the scope, switch the default to deny and only allow the group IDs or users you list.

See [Adapter Management](../webui/adapter-management.md) for the visual entry; the full syntax of `config/adapter_policy.toml` is covered in the [Unified Adapter Access Policy](/en/develop/message-server-and-adapters#unified-adapter-access-policy).

::: tip Verify in a small scope first
Add just one test group and one test user to the adapter policy, confirm sending and receiving work, then widen the scope. When troubleshooting "no response", this layer is the first place to look.
:::

## Capability differences between the two clients

The adapter applies a capability profile based on the detected client type. The differences surface when you call action APIs:

- **Send actions** — the napcat profile uses `send_group_msg` / `send_private_msg`; the snowluma profile uses the generic `send_msg` + `message_type`
- **Outbound files** — the napcat profile inlines a `file` segment; the snowluma profile splits it into separate `upload_group_file` / `upload_private_file` actions
- **Merged-forward parameter key** — the napcat profile uses `message`; the snowluma profile uses `messages`
- **Voice `get_record` format** — the napcat profile returns `wav`; the snowluma profile returns `mp3` (with automatic silk transcoding as a fallback)
- **QZone APIs** — unsupported on the napcat profile (an explicit error is raised); supported on the snowluma profile
- **Token auth** — profile-agnostic: the connection carries both an `Authorization: Bearer` header and the URL `access_token` parameter (the two OneBot v11 standard methods), so each server type takes what it needs

## LLM tool switches

All tools under `[chat_abilities]` are disabled by default; the model only gains the ability after you turn it on:

- **`enable_private_chat_tool`** — proactive private chat: the model can send the first private message to a given QQ user; grant that private chat in the host adapter policy
- **`enable_poke_tool`** — poke: pokes a member of the current group in group chats, sends a friend poke in private chats
- **`enable_recall_tool`** — recall: own messages only within 2 minutes; recalling others' messages requires the bot to be a group admin
- **`enable_mute_tool`** — smart mute: mutes the sender of a message by its ID; group owners, admins, and users in `[mute].admin_users` are never muted, and the scope and duration are limited by the `[mute]` section
- **`enable_emoji_like_tool`** — emoji reaction: reacts to a message with a QQ emoji (e.g. thumbs up, heart)
- **`enable_forward_tool`** — merged forward: bundles a batch of messages into a merged forward and sends it to a specific group or private chat

## Plugin APIs (for developers)

Other plugins call the adapter APIs via the SDK's `ctx.api.call`. Both prefixes work, with `version="1"`:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
member = await self.ctx.api.call(
    "adapter.snowluma.group.get_group_member_info",
    version="1",
    group_id=123456,
    user_id=654321,
)
# Replace adapter.snowluma. above with adapter.napcat. — the call behaves identically.
```

:::

- **Two prefixes** — `adapter.napcat.*` and `adapter.snowluma.*` behave identically; a prefix does not switch the client type—the actual capabilities still depend on the currently connected client. `await self.ctx.api.list()` shows both registered namespaces.
- **Avatar API** — the public API `adapter.avatar.get` (version 1) queries user / group avatars and returns `status` / `url` / `expires_in` for the host to download and cache uniformly; it returns `unsupported` for QQ official bot OpenIDs.
- **QZone APIs** — supported only on the snowluma profile under both prefixes; calling them on napcat raises an explicit error.

## Verify and troubleshoot

**Verify the connection** — the plugin list is loaded in WebUI; the log shows a successful connection and the detected client type; @-ing the bot in an allowed group gets a reply. That means success.

**Cannot connect** — check that `client.server` / `port` match the client's forward WebSocket listening address; confirm the forward WS service is enabled, the port is not blocked by a firewall, and the machines are the same; if auth is on, confirm `token` matches the client's setting.

**client_type consistency warning** — when `napcat` / `snowluma` is pinned but the connected peer is a different type, the log warns and runs as declared; on seeing this warning, set `client_type` back to `auto` or connect to the matching client.

**Connected but @-ing the bot in a group gets no response** — first check whether the host adapter policy (WebUI adapter settings / `config/adapter_policy.toml`) allows that group or private chat; then confirm `plugin.enabled = true` and the sender is not in `[filters].ban_user_id`.

**Can receive but not send** — does the bot have permission to speak; is `action_timeout_sec` too short; confirm `qq_account` in `bot_config.toml` matches the QQ account the client is logged in with.

**The bot mistakes its own messages for someone else's** — `qq_account` in `bot_config.toml` differs from the client's logged-in QQ. Make them match and restart the host.

**Notices do not arrive (poke / recall, etc.)** — confirm `[notice].enabled = true` and the relevant type switch is on; notice types not listed are dropped by default, which is expected.
