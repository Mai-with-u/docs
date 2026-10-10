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
- **The "黑白名单规则" (Allow/Deny Rules) tab in adapter plugin settings** — available for plugins with `plugin_type = adapter`; configures per-instance `allow_ids` and `deny_ids`

### Allow/Deny Rules Panel

Select an adapter to configure group and private chat lists:

- When messages are accepted by default, fill in the chat IDs to block; when rejected by default, fill in the chat IDs to allow
- Rules are stored by account ID. Switching accounts uses the new account’s rules while retaining the original account’s rules in the configuration

### Policy Groups

Rules for the same adapter can be saved as **multiple policy groups** and switched per scenario (for example, one set each for "daily / testing / maintenance"):

- **Switch groups** — saves and takes effect immediately; the current draft is saved to its original group first
- **New group** — inherits global settings with empty lists and requires a unique name; switch to it manually after creation
- **Copy current group** — copies all rules and leaves the original group active
- **Delete groups** — switch away from the active group before deleting it

## Related Docs

- [Connect Platforms](../adapters/index.md) — choosing, installing and connecting adapters
- [Bot Config](../configuration/bot-config.md) — platform account and other configuration items
