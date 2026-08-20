---
title: Adapter Overview
---

# Adapter Overview

Adapters are responsible for connecting messaging platforms such as QQ, Telegram, WeChat, and Discord to MaiBot. Different adapters support different platforms, have different runtime methods, and have different maintenance statuses. For your first deployment, it is recommended to prioritize adapters that are actively maintained and have complete documentation.

## Choose an Adapter

**QQ platform** — Recommended for first deployment
- [NapCat](./napcat.md) (Recommended) — The QQ adapter officially maintained by MaiBot, supporting both the plugin version and the standalone version. The plugin version is the currently recommended solution.
- [GoCQ](./gocq.md) (Available, outdated) — QQ adaptation solution based on go-cqhttp / AstralGocq, suitable for existing GoCQ environments or specific needs.
- [SnowLuma](./snowluma.md) (Available, in testing) — Next-generation QQ adaptation solution.

**Other platforms** — Community adaptations
- [Telegram](./telegram.md) — Telegram platform adaptation solution
- [Discord](./discord.md) — Discord platform adaptation solution

**More community adapters**
- [Desktop Pet Adapter](https://github.com/MaiM-with-u/MaiM-desktop-pet) — Integrates MaiBot into desktop pet interaction scenarios
- [WeChat - wxauto Adapter](https://github.com/Angela459/WeMai) — WeChat platform adaptation solution based on wxauto
- More third-party adapters — follow the [MaiBot GitHub Organization](https://github.com/Mai-with-u) or community groups for information

When deploying for the QQ platform for the first time, it is recommended to use the **NapCat plugin version**. It runs directly as a MaiBot plugin, requires less configuration, and eliminates the need to maintain the network connection between the adapter and MaiBot separately.

## Legacy / Community Adapter List (May not be maintained promptly)

The following adapters are mostly legacy or community projects, and some may not be compatible with the current version of MaiBot. Before using them, it is recommended to check the update time, README, and Issues of the corresponding repository.

- [Nonebot Adapter](https://github.com/MaiM-with-u/nonebot-plugin-maibot-adapters)
- [Milky Protocol Adapter](https://github.com/ShinKanji/MaiBot-Milky-Adapter)

::: warning 注意兼容性
Some community adapters may be legacy projects and are not necessarily compatible with the current MaiBot. Before installing, it is recommended to check the repository's update time, README, and Issues.
:::

### Plugin Version Adapters

If an adapter provides a plugin version, it is typically installed following this process:

1. Download or clone the adapter project.
2. Make sure to switch to the plugin branch required by the adapter.
3. Place the adapter directory into MaiBot's `plugins/` directory.
4. Start MaiBot and let the plugin system automatically load the adapter.

Plugin version adapters run inside MaiBot, so typically you only need to configure the "messaging platform to adapter" connection.

### Standalone Version Adapters

If an adapter is a standalone version, it is typically installed following this process:

1. Download or clone the adapter project.
2. Install dependencies according to the adapter's documentation.
3. Fill in the adapter's own configuration file.
4. Start the adapter process separately.

Standalone version adapters need to connect to both the messaging platform and MaiBot, so when troubleshooting, you need to check both connections separately.

## Configure Connections

Adapters typically require configuring two types of connections:

**Messaging Platform → Adapter** — For example, NapCat connects to QQ and pushes QQ messages to the adapter
**Adapter → MaiBot** — Standalone version adapters need to connect to MaiBot; plugin version adapters usually do not require additional configuration for this layer

When using a plugin version adapter, primarily confirm that the adapter can correctly connect to the messaging platform.

When using a standalone version adapter, you also need to confirm that the adapter can connect to MaiBot's messaging service address.

If you are unsure what address to fill in, first run it using the default local machine configuration from the corresponding adapter's documentation, and then consider cross-machine or Docker network deployment.

## Confirm Successful Connection

Once configuration is complete, send a test message to the corresponding platform.

If you can see the corresponding message logs in the MaiBot backend, and MaiBot can reply normally, it means the adapter has connected successfully.

If no messages are received, check in this order:

1. Whether the messaging platform client has successfully logged in.
2. Whether the adapter has started normally.
3. Whether the adapter has successfully connected to the messaging platform.
4. Whether the standalone version adapter has successfully connected to MaiBot.
5. Whether MaiBot has completed initialization and is running normally.

## Adapter Accounts and Identity

Since 1.2.0, MaiBot **persists the platform account identity actually reported by the adapter**, instead of relying only on the account you manually fill in the configuration:

- **Identity source** — The platform account reported by the adapter on connection (account ID, nickname, etc.) is persisted as the stable identity of that adapter instance
- **Multi-account recognition** — When one MaiBot instance serves multiple accounts on the same platform, each account is reliably recognized as "itself", without confusion
- **Auto ID discovery** — Adapters can auto-discover and report their own ID, no need to fill it in the configuration manually
- **Fallback value** — The platform account originally configured is still kept and used only as a fallback when the adapter has not reported an identity

The distinction between the adapter-reported identity and the fallback configuration can be viewed in the WebUI settings page: the discovered account list shows online status and supports soft disable / restore. See [WebUI Adapter Management](./../webui/adapter-management.md).

## Group / Private Chat Access Policy {#adapter-access-policy}

Since 1.2.0, MaiBot provides a **unified adapter chat-list policy** that controls group and private chat admission independently:

- **Default action** — Group and private chats each have their own default action, both defaulting to "allow", and can be changed to "block"
- **List rules** — `allow_ids` / `deny_ids` whitelist and blacklist can be configured per adapter to precisely control which groups / private chats an adapter can serve
- **Configuration file** — The policy lives in a separate `config/adapter_policy.toml`; when the file is absent, everything is allowed by default. It can be maintained via the WebUI adapter management page or the chat management page

::: tip Compatibility note
To stay compatible with existing adapters, the default action for both group and private chats remains "allow". Access control only tightens when you explicitly change the default action or add list rules.
:::

## Related Docs

- [WebUI Adapter Management](./../webui/adapter-management.md) — Discovered accounts, online status, soft disable / restore
- [Message Server and Adapter Integration](../../develop/message-server-and-adapters.md) — Implementation details of identity persistence, auto ID discovery and the access policy
