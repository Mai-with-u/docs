---
title: Adapter Management
---

# Adapter Management

Adapters connect messaging platforms such as QQ, email, and iMessage to MaiBot. The WebUI **适配器设置** (Adapter Settings) page (under the "麦麦配置编辑" group in the sidebar, `/adapter-management`) lets you view and manage all connected adapters and their account identities in one place.

![Adapter management](/images/webui/adapter-management.webp)

## View Discovered Accounts

Once an adapter connects, it reports the platform account identity it actually holds to MaiBot. The Adapter Management page shows these **discovered accounts**:

- **Account identity** — the account ID / nickname actually reported by the adapter (persisted since 1.2.0 as the adapter's stable identity)
- **Owning adapter** — which adapter instance each account belongs to
- **Online status** — whether the account is currently online and the adapter connection is healthy
- **Identity source** — distinguishes "adapter-reported identity" from the "fallback account in the configuration", so they are never confused

::: tip Difference from fallback configuration
Since 1.2.0, MaiBot trusts the identity **actually reported by the adapter**. The platform account you fill in the configuration is used only as a fallback when no adapter identity exists. Both can be distinguished on this page.
:::

## Soft Disable / Restore Accounts

You can **soft disable** any discovered account:

- **Soft disable** — the account stops receiving inbound messages, but the adapter connection stays up, which is handy for troubleshooting
- **Restore** — cancels the soft disable and the account resumes receiving inbound messages

Soft disable is a new operation from 1.2.0, more granular than disabling an entire adapter — you can disable only the problematic account without affecting other accounts on the same instance.

## Auto ID Discovery

Since 1.2.0, adapters can **auto-discover and report their own ID**, no need to fill it in the configuration manually. The Adapter Management page shows the auto-discovered IDs and identity information, helping you confirm each adapter instance's identity is correctly recognized.

## Access Policy Entry

The **group / private chat access policy** (who an adapter is allowed to serve) has two entry points in the WebUI:

- **The "Mai default policy" card at the top of the Adapter Management page** — sets the default action (allow / block) for group and private chats when no specific rule matches
- **The "Allow/deny rules" tab on an adapter plugin's config page** — only shown for plugins with `plugin_type = adapter`, configuring per-instance `allow_ids` / `deny_ids`

The "Allow/deny rules" panel now **autosaves 2 seconds after you stop editing**, and you can still press Save to submit immediately; the page shows status such as "Unsaved changes / Autosaving / Saved HH:MM:SS".

The underlying configuration file is `config/adapter_policy.toml`. See [Connect Platforms](../adapters/index.md). These rules live on the MaiBot main-program side.

Since 1.3.0, adapter plugins can use this built-in allow/deny list directly, and the adapter management page reads and writes the rule that **actually takes effect at runtime** (the most specific match wins), so edits no longer land on an entry hidden by a higher-priority rule.

## Verification & Troubleshooting

**Verify**: after connecting an adapter, its account appears on the Adapter Management page with a healthy online status.

**Account not showing?**

- Confirm the adapter is connected and logged in to the platform
- When an adapter reports no identity, the page falls back to the fallback account from the configuration

**Soft disable not taking effect?**

- Soft disable only affects inbound messages; the adapter connection stays up
- Make sure you operated on the target account, not another account on the same instance

## Related Docs

- [Connect Platforms](../adapters/index.md) — choosing, installing and connecting adapters
- [Bot Config](../configuration/bot-config.md) — platform account and other configuration items
