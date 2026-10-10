---
title: Adapter Management
---

# Adapter Management

Adapters connect messaging platforms such as QQ, email, and iMessage to MaiBot. The WebUI **适配器设置** (Adapter Settings) page (under the "配置管理" (Configuration) group in the sidebar, `/adapter-management`) lets you view and manage all connected adapters and their account identities in one place.

![Adapter management](/images/webui/adapter-management.webp)

## View Discovered Accounts

Once an adapter connects, it reports the platform account identity it actually holds to MaiBot. View these **discovered accounts** under "适配器设置 → 平台账号" (Adapter Settings → Platform accounts):

- **Account identity** — the account ID / nickname actually reported by the adapter
- **Owning adapter** — which adapter instance each account belongs to
- **Online status** — whether the account is currently online and the adapter connection is healthy
- **Identity source** — distinguishes "adapter-discovered accounts" from "fallback platform accounts", so they are never confused

## Auto ID Discovery

Adapters can **auto-discover and report their own ID**, no need to fill it in the configuration manually. The Adapter Management page shows the auto-discovered IDs and identity information, helping you confirm each adapter instance's identity is correctly recognized.

## Access Policy Entry

The **group / private chat access policy** (who an adapter is allowed to serve) has two entry points in the WebUI:

- **The "全局默认规则" (Global default rules) card at the top of the Adapter Management page** — sets the default action (**接收消息** / Receive messages or **不接收** / Don't receive) for group and private chats when no specific rule matches.

### Allow/Deny Rules Panel

The "黑白名单规则" panel opens after selecting an adapter:

- **Mode hint** — a line under each list states the current mode, e.g. "黑名单模式：接收所有群聊消息，只需在『不接收消息的聊天ID』中添加要屏蔽的群号" (Blacklist mode: receive all group messages, just add the groups to block under "Chat IDs that don't receive messages") or the whitelist equivalent
- **Inactive lists are dimmed** — when the default is "接收所有消息" (Receive all messages) the "接收消息的聊天ID" (Chat IDs that receive messages) block is dimmed and its input is disabled while empty; when the default is "默认不接收消息" (Don't receive messages by default) the "不接收消息的聊天ID" block is dimmed the same way, so you never fill in a list that has no effect
- **Account switch notice** — rules are keyed by account ID. After signing in with a different account an alert explains that the current account will get its own new rules while the historical accounts' rules stay in the configuration but no longer apply

### Policy Groups

Rules for the same adapter can now be saved as **multiple policy groups** and switched per scenario (for example, one set each for "daily / testing / maintenance"):

- **Switching groups** — the dropdown on the toolbar shows the active group; switching saves and takes effect immediately, and the draft you are editing is written into its group first so nothing is lost
- **New group** — click "+" to create a group: it inherits the global settings by default with empty lists, and its name must not duplicate an existing group; switch to it from the dropdown after creating it
- **Copy current group** — click "copy" to create a new group with all the rules of the current one; you stay on the current group after creating it
- **Manage groups** — click "manage" to open the group list and delete groups you no longer need; **the active group cannot be deleted** — switch to another group first
- **Default group** — rules from before the upgrade are kept as a group named "默认分组" (Default group), so there is nothing to reconfigure

## Related Docs

- [Connect Platforms](../adapters/index.md) — choosing, installing and connecting adapters
- [Bot Config](../configuration/bot-config.md) — platform account and other configuration items
