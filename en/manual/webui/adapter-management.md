---
title: Adapter Management
---

# Adapter Management

Adapters connect messaging platforms such as QQ, Telegram, and Discord to MaiBot. The WebUI **Adapter Management** page (under the "Bot Configuration" group in the sidebar) lets you view and manage all connected adapters and their account identities in one place.

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

The **group / private chat access policy** (who an adapter is allowed to serve) can also be maintained in the WebUI:

- View the current default action for group and private chats (allow / block)
- Configure whitelist / blacklist (`allow_ids` / `deny_ids`) per adapter

The underlying configuration file is `config/adapter_policy.toml`. See [Adapter Overview · Group / Private Chat Access Policy](../adapters/index.md#adapter-access-policy).

## Related Docs

- [Adapter Overview](../adapters/index.md) — choosing, installing and connecting adapters
- [Bot Config](../configuration/bot-config.md) — platform account and other configuration items
