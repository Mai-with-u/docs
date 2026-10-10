---
title: Connect Platforms
---

# Connect Platforms

**Adapters connect messaging platforms such as QQ, email, and voice calls to MaiBot.** In MaiBot, **adapters are themselves plugins**—install, enable, and manage them in [Plugin Management](/en/manual/plugins/), then fill in the connection details in the plugin settings.

## Before Connecting QQ: Pick a Route

QQ offers two routes—pick the one that fits your setup:

- **Local client login** — use your own QQ account (SnowLuma or NapCat) for the fullest feature set; **the Unified QQ Connector is recommended**: one plugin supports both client types and detects the peer automatically;
- **Open platform bot** — apply for a bot on the QQ Open Platform (AppID + AppSecret), no QQ client login needed.

The two routes are not mutually exclusive—you can enable both at the same time; the open-platform route can also share data with the local-client route through unified ID binding.

::: tip Adapter changes in 1.3.0
Since MaiBot 1.3.0, the former SnowLuma adapter and NapCat adapter have merged into the **Unified QQ Connector** (`MaiBot-SnowLuma-Adapter`), and the standalone NapCat adapter has stopped evolving and is archived. After upgrading the main program, upgrade the adapter as well; legacy configs are migrated automatically on load.

Also, the adapters' built-in group / private-chat allow/deny lists have been removed—inbound access is controlled uniformly by MaiBot's adapter policy (`config/adapter_policy.toml` + the WebUI adapter settings).
:::

## Available Adapters

**Maintenance label** — 🏛️ Official: maintained by the `Mai-with-u` organization; 🌐 Community: maintained by third-party authors.

### QQ (Local Client Login)

- [QQ Local Client](./qq-local-client) — 🏛️ officially maintained. The Unified QQ Connector: log in your own QQ account; one plugin supports SnowLuma / NapCat and detects the peer automatically
- [NapCat](./napcat) — archived. The former standalone NapCat adapter has been merged into the Unified QQ Connector; this page is kept for historical reference only

### QQ (Open Platform Bot)

- [QQ Official Bot](./qq-official) — 🏛️ officially maintained. Connect directly to the QQ Open Platform with AppID + AppSecret; supports private and group chat text, @, images, and emoji

### Email, iMessage & Voice Calls

- [Email](./email) — 🌐 community-maintained. IMAP inbound + SMTP replies, connect a dedicated bot mailbox to MaiBot
- [QQ Voice Call](./qq-voice-call) — 🌐 community-maintained. Adds a real-time voice call entry to QQ; Mai on the phone reuses the same persona and memory
- [iMessage](./imessage) — 🌐 community-maintained. Connect to Apple iMessage via the Photon cloud service, no Mac required

::: tip Community adapters
Community adapters are continuously maintained by their respective authors—before installing, take a look at the repository's update time and README to confirm compatibility with your MaiBot version.
:::

## How Connections Are Usually Configured

Adapters usually need two kinds of connections:

- **Platform → Adapter** — e.g. SnowLuma / NapCat logs into QQ and pushes messages to the adapter; open-platform bots require applying for an official bot account first.
- **Adapter → MaiBot** — plugin-version adapters usually don't need extra config for this layer; only standalone versions do.

How to apply for platform accounts and which addresses/tokens to fill in are covered in each adapter's doc. If you want to **write your own adapter** (for a platform we don't cover yet), that's a development topic — see [Adapter Integration](/en/develop/adapters/).

## Set the allow scope first, then test

After connecting a new adapter, the first thing to check is the **allow scope**: MaiBot keeps a unified group / private-chat access policy in `config/adapter_policy.toml` (allowing everything by default), with visual editing in the WebUI adapter settings. **Allow one test group and one test user in the policy before testing**; when troubleshooting "no response", this layer is the first place to look. See [Adapter Management](../webui/adapter-management.md).

Neither the Unified QQ Connector nor the QQ Official Bot Adapter ships a built-in chat list—the allow scope is decided by this layer alone.

## Verify and Troubleshoot

Send a test message on the corresponding platform:

- If the MaiBot backend shows the message log and can reply normally → success;
- If nothing happens, check in order: is the platform client logged in → is the adapter started → did it connect to the platform → (standalone) did it connect to MaiBot → does MaiBot's adapter policy allow that group / user → is MaiBot ready.
