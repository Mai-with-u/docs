---
title: Adapter Management
---

# Adapter Management

Adapters connect messaging platforms such as QQ, email, and iMessage to MaiBot. The WebUI **适配器设置** (Adapter Settings) page (under the "配置管理" (Configuration) group in the sidebar, `/adapter-management`) lets you view and manage all connected adapters and their account identities in one place.

![Adapter management](/images/webui/adapter-management.webp)

## View Discovered Accounts

Once an adapter connects, it reports the platform account identity it actually holds to MaiBot. Click the **平台账号** (Platform accounts) collapse button on the right of the "全局默认规则" (Global default rules) card at the top of the Adapter Management page to see these **discovered accounts** in a popover:

- **Account identity** — the account ID / nickname actually reported by the adapter (persisted since 1.2.0 as the adapter's stable identity)
- **Owning adapter** — which adapter instance each account belongs to
- **Online status** — whether the account is currently online and the adapter connection is healthy
- **Identity source** — distinguishes "adapter-discovered accounts" from "fallback platform accounts", so they are never confused

Adapter-discovered accounts render as compact cards showing the platform name, account ID, an "在线 / 离线" (Online / Offline) badge, and the last report time. Manually entered platform / account rows use the same card style with pencil (edit) and trash (delete) icons, and a row whose platform or account is incomplete stays in edit mode instead of showing an empty card.

::: tip Difference from fallback configuration
Since 1.2.0, MaiBot trusts the identity **actually reported by the adapter**. The platform account you fill in the configuration is used only as a fallback when no adapter identity exists. Both can be distinguished in this popover.
:::

## Deleting Account Records / Restoring Accounts

The trash icon on an account card is **删除账号记录** (Delete account record):

- **Delete account record** — hard-deletes this account record from the database; it is not a soft disable. The adapter rediscovers the account the next time it reports its identity (the button's tooltip reads "适配器再次上报时会重新发现" / rediscovered when the adapter reports again)
- **恢复身份** (Restore identity) — previously excluded accounts are collapsed under "已排除账号" (Excluded accounts); click the restore icon there to bring an account back into identity resolution

Before 1.3.1 this button was an eye icon labeled "排除身份" (Exclude identity), a soft disable where the account stopped receiving inbound messages while the connection stayed up. As of 1.3.2 it deletes the record outright, so make sure the account is a false report or already offline before clicking it.

The "保存备用账号" (Save fallback accounts) button at the bottom of the popover writes only `bot.platform`, `bot.qq_account`, and `bot.platforms`, so it never clobbers settings such as the nickname.

## Auto ID Discovery

Since 1.2.0, adapters can **auto-discover and report their own ID**, no need to fill it in the configuration manually. The Adapter Management page shows the auto-discovered IDs and identity information, helping you confirm each adapter instance's identity is correctly recognized.

## Access Policy Entry

The **group / private chat access policy** (who an adapter is allowed to serve) has two entry points in the WebUI:

- **The "全局默认规则" (Global default rules) card at the top of the Adapter Management page** — sets the default action (**接收消息** / Receive messages vs **不接收** / Don't receive) for group and private chats when no specific rule matches, with the subtitle "所有适配器的默认规则" (Default rules for all adapters). Before 1.3.1 it was called "麦豆默认策略" with "放行 / 拒绝" (Allow / Block) buttons. To the right of the card is the **平台账号** (Platform accounts) popover entry; the platform account editor moved here from MaiBot Settings in 1.3.2
- **The "黑白名单规则" (Allow/deny rules) tab on an adapter plugin's config page** — only shown for plugins with `plugin_type = adapter`, configuring per-instance `allow_ids` / `deny_ids`

### Allow/Deny Rules Panel

The "黑白名单规则" panel opens after selecting an adapter:

- **Mode hint** — a line under each list states the current mode, e.g. "黑名单模式：接收所有群聊消息，只需在『不接收消息的聊天ID』中添加要屏蔽的群号" (Blacklist mode: receive all group messages, just add the groups to block under "Chat IDs that don't receive messages") or the whitelist equivalent
- **Inactive lists are dimmed** — when the default is "接收所有消息" (Receive all messages) the "接收消息的聊天ID" (Chat IDs that receive messages) block is dimmed and its input is disabled while empty; when the default is "默认不接收消息" (Don't receive messages by default) the "不接收消息的聊天ID" block is dimmed the same way, so you never fill in a list that has no effect
- **Current account badge** — the toolbar shows "当前账号 ID：xxx" (Current account ID: xxx); when this adapter instance has no dedicated rules it shows "无专属规则，按全局默认生效" (No dedicated rules, governed by the global defaults)
- **Account switch notice** — rules are keyed by account ID. After signing in with a different account an alert explains that the current account will get its own new rules while the historical accounts' rules stay in the configuration but no longer apply
- **Toolbar placement** — the current account badge, save status, and "保存" (Save) button render on the same row as the tab, so you no longer have to scroll to the top of the panel

The panel **autosaves 2 seconds after you stop editing**, and you can still press Save to submit immediately; the status next to the save button reads "Unsaved changes / Autosaving / Saved HH:MM:SS". To keep the "current account" from going stale, the panel refreshes itself every 30 seconds.

The underlying configuration file is `config/adapter_policy.toml`. See [Connect Platforms](../adapters/index.md). These rules live on the MaiBot main-program side.

Since 1.3.0, adapter plugins can use this built-in allow/deny list directly, and the adapter management page reads and writes the rule that **actually takes effect at runtime** (the most specific match wins), so edits no longer land on an entry hidden by a higher-priority rule.

Since 1.3.2, the "Allow/deny rules" panel **shows group avatars and known group names after the group number**: the group name comes from registered chat streams, and the avatar is provided by the adapter's avatar interface and cached under `data/avatar/` (available avatars are cached for 24 hours; a miss is retried after about 5 minutes). Group names only cover groups MaiBot **already has a chat stream for** — groups it has never chatted in show only the avatar. Turning off "获取并显示用户头像" (Fetch and display user avatars) in the "Other" tab of **WebUI Settings** (`/settings`, opened from the gear on the right of the top bar) leaves only the default icon. When the adapter does not implement the avatar interface or the platform does not support it, a placeholder avatar marked "unsupported" is shown, without affecting list editing.

## Verification & Troubleshooting

**Verify**: after connecting an adapter, its account appears on the Adapter Management page with a healthy online status.

**Account not showing?**

- Confirm the adapter is connected and logged in to the platform
- When an adapter reports no identity, the page falls back to the fallback account from the configuration

**A deleted account record came back?**

- Deleting only removes the record; the adapter rediscovers the account the next time it reports its identity, which is expected

**Your allow/deny changes have no effect?**

- Read the mode hint below each list first: a dimmed list currently has no effect
- Rules are keyed by account ID, so after switching accounts you need a separate set for the current account
- When several rules match, the most specific one wins — make sure no higher-priority rule is shadowing your edit

## Related Docs

- [Connect Platforms](../adapters/index.md) — choosing, installing and connecting adapters
- [Bot Config](../configuration/bot-config.md) — platform account and other configuration items
