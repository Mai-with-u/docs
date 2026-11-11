---
title: OneBot Adapter
---

# OneBot Adapter

**Log in your own QQ account to connect (officially maintained).** The OneBot Adapter lets MaiBot reach QQ through NapCat or another OneBot v11 implementation: it detects the peer once connected and applies the matching capability profile, handles group and private messages, and supports voice, face parsing, and proactive private chat. It is an officially maintained MaiBot plugin, plugin-only, running directly inside the MaiBot process. The plugin market lists it as "OneBot 适配器"; the repository name is still `MaiBot-SnowLuma-Adapter`.

::: tip Officially maintained
The OneBot Adapter is continuously maintained by the MaiBot official team; report issues in [GitHub Issues](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter/issues).
:::

Adapter repository (officially maintained):

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="OneBot Adapter" description="The officially maintained OneBot v11 adapter plugin repository" logo="/title_img/mai.png" />

Message flow: **QQ → NapCat / another OneBot v11 implementation → adapter plugin (inside MaiBot) → MaiBot**

## Prepare a client and log in your bot QQ account

The adapter only handles the "MaiBot ↔ client" link. Deploy and log into the client per its docs, and make sure it has enabled the **forward WebSocket server**. The default connection is `ws://127.0.0.1:3001` (same machine). Only the forward WebSocket root path is supported; reverse WS, HTTP, and OneBot v12 are not.

<Linkcard url="https://doc.napneko.icu/" title="NapCat official docs" description="Install NapCat, log in to QQ, enable the forward WebSocket server" />

<Linkcard url="https://github.com/botuniverse/onebot-11" title="OneBot 11 standard" description="Standard actions, message segments, and events; use it as the reference for other implementations" />

::: warning This QQ account is the bot itself
The QQ account the client logs in with must exactly match the `qq_account` in `bot_config.toml` below, so MaiBot can recognize the bot's own messages.
:::

## Configure MaiBot's bot account

Edit the `[bot]` section of `config/bot_config.toml` so MaiBot recognizes the bot itself:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"         # Local-client adapters such as NapCat all use qq
qq_account = "YOUR_QQ"  # Must match the QQ account the client is logged in with
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — set to `"qq"`, the platform identifier for local-client adapters.
- **`qq_account`** — the QQ number the client is logged in with (as a string).

The adapter normally reports its own identity, so these two are fallbacks when reporting fails; keep them consistent so a fallback cannot pick the wrong account.

You can also set this in the WebUI under **Adapter Settings**: click **平台账号** (Platform accounts) on the right of the "全局默认规则" (Global default rules) card at the top of the page, pick platform `qq`, and enter the bot QQ number.

## Configure the adapter connection

Config file: `plugins/MaiBot-SnowLuma-Adapter/config.toml`. Here is a **complete, copy-ready** config template — edit the values per the comments; the groups in the config page follow the same order:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                      # Enable the adapter; must be true to connect
qq_face_parse_mode = "description"  # QQ face parsing: description → Chinese text / emoji → approximate Unicode emoji
enable_text_face_conversion = false # Convert /face-name text to native QQ faces when sending
enable_text_at_conversion = false   # Convert @QQ / @group-card / @nickname text in group sends to real mentions
config_version = "2.8.0"            # Config structure version; usually leave it alone

[chat_abilities]
enable_private_chat_tool = false  # Proactive private-chat tool, see "LLM tool switches"
enable_poke_tool = false          # Poke tool
enable_recall_tool = false        # Recall tool
enable_mute_tool = false          # Smart mute tool
enable_emoji_like_tool = false    # Emoji reaction tool
enable_forward_tool = false       # Merged-forward tool

[client]
client_type = "auto"        # Peer implementation: auto detects after connecting / napcat / onebot_v11
server = "127.0.0.1"        # NapCat or another OneBot v11 implementation; local loopback
port = 3001                 # Forward WebSocket port, must match the client's setting
token = ""                  # Access token; fill in the same token if the client enables auth
heartbeat_interval = 30.0   # Protocol-level ping keepalive interval (sec); must be greater than 0
reconnect_delay_sec = 5.0   # Wait before reconnecting after a disconnect (sec)
action_timeout_sec = 30.0   # Timeout when calling action APIs (sec)
connection_id = ""          # Connection ID; distinguish links in multi-instance setups, see below

[filters]
ban_user_id = []                  # User blacklist (QQ IDs); their group and private messages are dropped
ban_qq_bot = false                # Block QQ official bot messages
regex_filter_enabled = false      # Enable regex message filtering
regex_filter_mode = "blacklist"   # blacklist drops matches / whitelist only allows matches
regex_filter_patterns = []        # Regex patterns, Python re syntax
regex_filter_show_dropped = false # Log messages dropped by the regex filter

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

[debug]
enable_ada_debug_raw_message_log = false       # Log inbound raw message segments; on only when debugging structure
enable_ada_debug_raw_outbound_message_log = false  # Log the action and params actually sent outbound
ignore_self_message = false                    # Ignore messages sent by the bot itself

[mute]
admin_users = []        # Mute protection list (QQ IDs); listed users are never muted
allowed_groups = []     # Group allowlist for muting; empty means no restriction
min_duration = 60       # Minimum mute duration (sec); lower values from the model are raised to this
max_duration = 2592000  # Maximum mute duration (sec); 30 days by default, higher values are truncated
```

:::

::: tip Legacy config is migrated automatically
Legacy `[luma_client]` / `[napcat_server]` / `[connection]` sections are merged into `[client]` on load (`host` → `server`, `access_token` → `token`), and the config version is rewritten automatically — no manual edits needed.
:::

### How to pick client_type

- **`auto`** (default) — after each connect it calls `get_version_info` and reads the peer's self-reported `app_name`; a recognized NapCat gets the NapCat profile, an unrecognized one falls back to standard OneBot v11 mode.
- **`napcat`** — pins the NapCat profile. The adapter still probes once, logs a warning on a mismatch, and keeps running as declared instead of silently switching.
- **`onebot_v11`** — pins standard mode: only OneBot v11 standard actions and message segments. See "Differences between the two profiles" below. Pick it for implementations other than NapCat; its behavior is the most predictable.

Pin the value when the peer is fixed; otherwise keep `auto`.

### Multi-instance connection_id

When one MaiBot connects to multiple client links, give each link a **different `connection_id`** (e.g. `primary`, `secondary`) to use as a routing scope identifier and keep the links from interfering with each other.

## Add the allow scope first, then test

The OneBot Adapter uses the host adapter policy to control inbound access: the adapter settings (allow/deny rules) in the WebUI or `config/adapter_policy.toml`, which **allows everything by default** (all group messages are accepted). To restrict the scope, switch the default to deny and only allow the group IDs or users you list.

See [Adapter Management](../webui/adapter-management.md) for the visual entry; the full syntax of `config/adapter_policy.toml` is covered in the [Access Policy and Account Routing](/en/develop/adapters/policy).

::: tip Verify in a small scope first
Add just one test group and one test user to the adapter policy, confirm sending and receiving work, then widen the scope. When troubleshooting "no response", this layer is the first place to look.
:::

## Client profiles and standard mode

The adapter applies a capability profile based on the detected implementation: NapCat gets its dedicated profile, while an unrecognized implementation or a pinned `onebot_v11` gets standard mode. Both profiles take the same values on these five points, so switching implementations needs no config change:

- **Send actions** — both use `send_group_msg` / `send_private_msg`
- **Outbound files** — both inline a `file` segment
- **Merged-forward parameter key** — both use `message`
- **Voice `get_record` format** — both receive `wav`
- **QZone APIs** — unsupported on both; calls raise an explicit error

Standard mode adds exactly one thing on top: an admission check.

- **Action allowlist** — only OneBot v11 standard actions pass; vendor extensions (QZone, `set_input_status`, `nc_get_packet_status`, and the like) raise an error instead of being tried
- **Segment allowlist** — outbound messages accept standard segments only; string messages are parsed as CQ codes and checked segment by segment, and a non-standard segment raises an error
- **Integer IDs** — string `user_id` / `group_id` / `message_id` values from the Host are converted to integers before sending
- **No extension tools** — in standard mode, `enable_poke_tool` and `enable_emoji_like_tool` do not enable their tools even when on, and the chat-stream and merged-forward tools behind `enable_forward_tool` are the same

Token auth is profile-agnostic: the connection carries both an `Authorization: Bearer` header and the URL `access_token` parameter (the two OneBot v11 standard methods), so each server type takes what it needs.

## LLM tool switches

All tools under `[chat_abilities]` are disabled by default; the model only gains the ability after you turn it on:

- **`enable_private_chat_tool`** — proactive private chat: the model can send the first private message to a given QQ user; grant that private chat in the host adapter policy
- **`enable_poke_tool`** — poke: pokes a member of the current group in group chats, sends a friend poke in private chats; not enabled in standard mode
- **`enable_recall_tool`** — recall: own messages only within 2 minutes; recalling others' messages requires the bot to be a group admin
- **`enable_mute_tool`** — smart mute: mutes the sender of a message by its ID; group owners, admins, and users in `[mute].admin_users` are never muted, and the scope and duration are limited by the `[mute]` section
- **`enable_emoji_like_tool`** — emoji reaction: reacts to a message with a QQ emoji (e.g. thumbs up, heart); not enabled in standard mode
- **`enable_forward_tool`** — merged forward: bundles a batch of messages into a merged forward and sends it to a specific group or private chat; not enabled in standard mode

## Plugin APIs (for developers)

Other plugins call the adapter APIs via the SDK's `ctx.api.call` with `version="1"`. The registered name is `adapter.napcat.*`, and a fully equivalent `adapter.onebot.*` alias is provided:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
member = await self.ctx.api.call(
    "adapter.onebot.group.get_group_member_info",
    version="1",
    group_id=123456,
    user_id=654321,
)
# Replace adapter.onebot. above with adapter.napcat. — the call behaves identically.
```

:::

- **Two prefixes** — `adapter.onebot.*` and `adapter.napcat.*` share one handler, the same parameters, return values, and capability checks; a prefix does not switch the client mode, and the actual capabilities still depend on the active profile. `await self.ctx.api.list()` shows the registered names.
- **Avatar API** — the public API `adapter.avatar.get` (version 1) queries user / group avatars and returns `status` / `url` / `expires_in` for the host to download and cache uniformly; it returns `unsupported` for QQ official bot OpenIDs. See [Avatar API](/en/develop/adapters/avatar-api) for the full protocol.
- **QZone APIs** — unsupported under both prefixes; calls raise an explicit error.

## Verify and troubleshoot

**Verify** — the plugin list is loaded in the WebUI; the log shows a successful connection and the active profile; @-ing the bot in an allowed group gets a reply. That means success.

**Cannot connect** — check that `client.server` / `port` match the client's forward WebSocket listening address; confirm the forward WS service is enabled, the port is not blocked by a firewall, and the machines are the same; if auth is on, confirm `token` matches the client's setting.

**client_type consistency warning** — when `napcat` is pinned but the connected peer is not NapCat, the log warns and runs as declared; on seeing this warning, set `client_type` back to `auto` or connect to the matching client.

**Client-type probe fails** — when the log reports a failed `get_version_info` probe, the adapter does not activate the message gateway, and pinning `client_type` does not skip that step. Confirm the peer implements this standard action and returns `app_name`.

**The peer's `app_name` is unrecognized** — when the probe succeeds but `app_name` matches no known implementation, `auto` falls back to standard OneBot v11 mode; to pin it explicitly, set `client_type = "onebot_v11"`.

**Connected but @-ing the bot in a group gets no response** — first check whether the host adapter policy (WebUI adapter settings / `config/adapter_policy.toml`) allows that group or private chat; then confirm `plugin.enabled = true` and the sender is not in `[filters].ban_user_id`.

**Can receive but not send** — does the bot have permission to speak; is `action_timeout_sec` too short; confirm `qq_account` in `bot_config.toml` matches the QQ account the client is logged in with.

**The bot mistakes its own messages for someone else's** — `qq_account` in `bot_config.toml` differs from the client's logged-in QQ. Make them match and restart the host.

**A tool or extension call errors in standard mode** — standard mode allows only OneBot v11 standard actions and segments, so QZone, vendor poke, emoji reactions, file upload, and merged forward are rejected. Switch back to `client_type = "auto"` or `napcat` when you need them.

**Notices do not arrive (poke / recall, etc.)** — confirm `[notice].enabled = true` and the relevant type switch is on; notice types not listed are dropped by default, which is expected.
