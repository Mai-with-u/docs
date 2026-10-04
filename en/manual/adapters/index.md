---
title: Connect Platforms
---

# Connect Platforms

**Adapters connect messaging platforms such as QQ, email, and voice calls to MaiBot.** In MaiBot, **adapters are themselves plugins**—install, enable, and manage them in [Plugin Management](/en/manual/plugins/), then fill in the connection details in the plugin settings.

## Before Connecting QQ: Pick a Route

QQ offers two routes—pick the one that fits your setup:

- **Local client login** — use your own QQ account (NapCat or SnowLuma) for the fullest feature set; **NapCat is recommended**;
- **Open platform bot** — apply for a bot on the QQ Open Platform (AppID), no QQ client login needed.

The two routes are not mutually exclusive—you can enable both at the same time.

::: tip Adapter changes in 1.3.0
MaiBot 1.3.0 requires the latest SnowLuma adapter — the new adapter has merged the NapCat adapter, so upgrade the adapter alongside the main program and **re-configure the allow/deny lists**.

Also, since 1.3.0 adapter plugins can use MaiBot's built-in group / private-chat allow/deny lists directly (`config/adapter_policy.toml`).
:::

## Available Adapters

**Maintenance label** — 🏛️ Official: maintained by the `Mai-with-u` organization; 🌐 Community: maintained by third-party authors.

### QQ (Local Client Login)

- [NapCat](./napcat) — 🏛️ officially recommended. Log in your own QQ account, connect via NapCat forward WebSocket, minimal configuration
- [SnowLuma](./snowluma) — 🏛️ officially maintained. Log in your own QQ account, connect via SnowLuma, supports voice and proactive private messaging

### QQ (Open Platform Bot)

- [QQ Official](./qq-official) — 🌐 community-maintained. Connect to the QQ official bot with AppID + AppSecret, supports private chats, group chats, guild text channels, and guild direct messages
- [QQBot](./qqbot) — 🌐 community-maintained. Connect to the QQ official Bot API with AppID + AppSecret, supports private (C2C) and group chats

### Email, iMessage & Voice Calls

- [Email](./email) — 🌐 community-maintained. IMAP inbound + SMTP replies, connect a dedicated bot mailbox to MaiBot
- [QQ Voice Call](./qq-voice-call) — 🌐 community-maintained. Adds a real-time voice call entry to QQ; Mai on the phone reuses the same persona and memory
- [iMessage](./imessage) — 🌐 community-maintained. Connect to Apple iMessage via the Photon cloud service, no Mac required

::: tip Community adapters
Community adapters are continuously maintained by their respective authors—before installing, take a look at the repository's update time and README to confirm compatibility with your MaiBot version.
:::

## How Connections Are Usually Configured

Adapters usually need two kinds of connections:

- **Platform → Adapter** — e.g. NapCat logs into QQ and pushes messages to the adapter; open-platform bots require applying for an official bot account first.
- **Adapter → MaiBot** — plugin-version adapters usually don't need extra config for this layer; only standalone versions do.

How to apply for platform accounts and which addresses/tokens to fill in are covered in each adapter's doc.

## Verify and Troubleshoot

Send a test message on the corresponding platform:

- If the MaiBot backend shows the message log and can reply normally → success;
- If nothing happens, check in order: is the platform client logged in → is the adapter started → did it connect to the platform → (standalone) did it connect to MaiBot → is MaiBot ready.
