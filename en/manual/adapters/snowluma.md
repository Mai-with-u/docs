---
title: SnowLuma Adapter
---

# SnowLuma Adapter

**Log in your own QQ account to connect (officially maintained).** The SnowLuma adapter lets MaiBot connect to QQ through [SnowLuma](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter), sending and receiving messages and handling group and private chats, with support for voice, emoji parsing, and proactive private messaging. It is an **officially maintained plugin** of MaiBot, plugin-only, running directly inside the MaiBot process.

::: tip Officially maintained
The SnowLuma adapter is continuously maintained by the MaiBot official team; if you encounter issues, report them in [GitHub Issues](https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter/issues).
:::

::: warning Upgrading to MaiBot 1.3.0
MaiBot 1.3.0 requires the latest SnowLuma adapter: the new adapter has merged the NapCat adapter, and after upgrading you must **re-configure the allow/deny lists** (existing lists are not carried over automatically).
:::

Adapter repository (🏛️ officially maintained):

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="MaiBot-SnowLuma-Adapter" description="MaiBot's officially maintained SnowLuma QQ adapter plugin" logo="/title_img/mai.png" />

Message flow: **QQ → SnowLuma → adapter plugin (inside MaiBot) → MaiBot**

## 1. Prepare SnowLuma and log in your bot QQ account

The adapter only handles the "MaiBot ↔ SnowLuma" link. Deploy and log into SnowLuma per its docs, and make sure it has enabled the **forward WebSocket server**. Default connection `ws://127.0.0.1:3001` (same machine).

<Linkcard url="https://github.com/Mai-with-u/MaiBot-SnowLuma-Adapter" title="SnowLuma docs" description="Deploy SnowLuma, log in to QQ, enable the forward WebSocket service" />

::: warning This QQ account is the bot itself
The QQ account SnowLuma logs in with must exactly match the `qq_account` in `bot_config.toml` below, so MaiBot can recognize the bot's own messages.
:::

## 2. Configure MaiBot's bot account

Edit the `[bot]` section of `config/bot_config.toml` so MaiBot recognizes the bot itself:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"       # Local-client adapters such as NapCat / SnowLuma all use qq
qq_account = "YOUR_QQ"  # Must match the QQ account SnowLuma is logged in with
nickname = "麦麦"
alias_names = []
```

:::

- **`platform`** — set to `"qq"`, the platform identifier for local-client adapters.
- **`qq_account`** — the QQ number SnowLuma is logged in with (as a string); the two must match exactly.

You can also set this in the WebUI: `Bot Settings → Basic → platform account`, pick platform `qq`, and enter the bot QQ number.

## 3. Configure the adapter connection

Config file: `plugins/MaiBot-SnowLuma-Adapter/config.toml`. Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true          # Enable the adapter; must be true to connect
config_version = "1.0.6"  # Config structure version; usually leave it alone

[luma_client]
server = "127.0.0.1"   # SnowLuma address; local loopback
port = 3001            # Forward WebSocket port, must match SnowLuma's setting
token = ""             # Access token; fill in the same token if SnowLuma enables auth
connection_id = ""     # Connection ID; distinguish links in multi-instance setups, see end of this section
reconnect_delay_sec = 5.0   # Wait before reconnecting after a disconnect (sec)
action_timeout_sec = 10.0   # Timeout when calling action APIs (sec)

[chat]
enable_chat_list_filter = true    # List filtering, enabled by default
show_dropped_chat_list_messages = true  # Log dropped messages (turn on when troubleshooting)
group_list_type = "whitelist"     # Group list mode: whitelist / blacklist
group_list = []                   # Group IDs; add your lists first, see section 4
private_list_type = "whitelist"   # Private list mode: whitelist / blacklist
private_list = []                 # User IDs
ban_user_id = []                  # Globally blocked user IDs; messages dropped before the Host
ban_qq_bot = false                # Block QQ official bot messages
```

:::

### Multi-instance `connection_id`

When one MaiBot connects to multiple SnowLuma links, give each link a **different `connection_id`** (e.g. `primary`, `secondary`) to use as a routing scope identifier and keep the links from interfering with each other.

## 4. Add the lists first, then test

The chat list filter is **enabled by default with an empty list**—without adding anything, all group and private messages are dropped. This is the most common reason for "no response" after connecting to QQ. The right approach is to **add the groups / users you want to connect first, then test**:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = true
group_list = ["123456789"]        # your group ID
private_list = ["987654321"]      # user ID for private chat
```

:::

To temporarily allow all messages while testing connectivity, you can turn the filter off:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = false   # testing only; add your lists back and re-enable when done
```

:::

::: tip There is also a main-program list layer
Besides the adapter's own `[chat]` lists, MaiBot keeps a unified group / private-chat access policy in `config/adapter_policy.toml`. **A message enters the conversation only when both layers allow it**, so check both when troubleshooting "no response"; see [Adapter Management](../webui/adapter-management.md).
:::

## Verify and troubleshoot

**Verify the connection** — the plugin list is loaded in WebUI; the log shows `SnowLuma WebSocket 已连接` (SnowLuma WebSocket connected); @-ing the bot in a group gets a reply. That means success.

**Cannot connect** — check that `luma_client.server` / `port` match SnowLuma's forward WebSocket listening address; confirm the forward WS service is enabled, the port is not blocked by a firewall, and the machines are the same; if auth is on, confirm `token` matches SnowLuma's setting.

**Connected but @-ing the bot in a group gets no response** — first check the chat list: confirm the group is in `group_list`; temporarily set `enable_chat_list_filter = false` or turn on `show_dropped_chat_list_messages` to inspect dropped logs. Then confirm `plugin.enabled = true`.

**Can receive but not send** — does the bot have permission to speak; is `action_timeout_sec` too short; confirm `qq_account` in `bot_config.toml` matches the QQ account SnowLuma is logged in with.

**The bot mistakes its own messages for someone else's** — `qq_account` in `bot_config.toml` differs from SnowLuma's logged-in QQ. Make them match and restart the host.