---
title: Connect Platforms
---

# Connect Platforms

**Adapters connect messaging platforms such as QQ, email, and voice calls to MaiBot.** In MaiBot, **adapters are themselves plugins**—install, enable, and manage them in [Plugin Management](/en/manual/plugins/), then fill in the connection details in the plugin settings.

## Before Connecting QQ: Pick a Route

QQ offers two routes—pick the one that fits your setup:

- **Local client login** — use your own QQ account (NapCat and other OneBot v11 implementations) for the fullest feature set; **the OneBot Adapter is recommended**: it detects the peer implementation once connected;
- **Open platform bot** — apply for a bot on the QQ Open Platform (AppID + AppSecret), no QQ client login needed.

The two routes are not mutually exclusive—you can enable both at the same time; the open-platform route can also share data with the local-client route through unified ID binding.

::: tip Connections and Access Policy
The OneBot Adapter connects NapCat and other OneBot v11 implementations. Group and private-chat access is controlled by MaiBot's adapter policy (`config/adapter_policy.toml` or WebUI Adapter Settings).
:::

## Available Adapters

**Maintenance label** — Official: maintained by the `Mai-with-u` organization; Community: maintained by third-party authors.

### QQ (Local Client Login)

- [QQ Local Client](./qq-local-client) — Officially maintained. The OneBot Adapter: log in your own QQ account; supports NapCat and other OneBot v11 implementations and detects the peer automatically

### QQ (Open Platform Bot)

- [QQ Official Bot](./qq-official) — Officially maintained. Connect directly to the QQ Open Platform with AppID + AppSecret; supports private and group chat text, @, images, and emoji

### Telegram and WeChat

**Telegram** — Create a bot with [BotFather](https://t.me/BotFather). Open the built-in Telegram adapter in WebUI adapter management, enter `telegram.bot_token`, and enable it. If you need a proxy, set `telegram.proxy_url`, for example to `http://127.0.0.1:7890`. Send `/start` in a direct message and check the log for the Telegram gateway ready message. To receive ordinary group messages, turn off Privacy Mode in BotFather and add the bot to the group again if needed.

**WeChat ClawBot** — Enable the built-in WeChat ClawBot adapter, then open **Plugin Extensions → WeChat Account Management** and select **Add account and scan QR code**. When the status shows that WeChat direct messaging is connected, send text or an image from the WeChat bot conversation. You can manage multiple accounts separately. If a login expires, scan again from the account's card. The adapter handles ClawBot direct messages and receives voice transcripts supplied by WeChat.

### Email, iMessage & Voice Calls

- [Email](./email) — Community-maintained. IMAP inbound + SMTP replies, connect a dedicated bot mailbox to MaiBot
- [QQ Voice Call](./qq-voice-call) — Community-maintained. Adds a real-time voice call entry to QQ; Mai on the phone reuses the same persona and memory
- [iMessage](./imessage) — Community-maintained. Connect to Apple iMessage via the Photon cloud service, no Mac required

::: tip Community adapters
Community adapters are continuously maintained by their respective authors—before installing, take a look at the repository's update time and README to confirm compatibility with your MaiBot version.
:::

## How Connections Are Usually Configured

Adapters usually need two kinds of connections:

- **Platform → Adapter** — e.g. NapCat logs into QQ and pushes messages to the adapter; open-platform bots require applying for an official bot account first.
- **Adapter → MaiBot** — plugin-version adapters usually don't need extra config for this layer; only standalone versions do.

How to apply for platform accounts and which addresses/tokens to fill in are covered in each adapter's doc. If you want to **write your own adapter** (for a platform we don't cover yet), that's a development topic — see [Adapter Integration](/en/develop/adapters/).

## Set the allow scope first, then test

After connecting a new adapter, the first thing to check is the **allow scope**: MaiBot keeps a unified group / private-chat access policy in `config/adapter_policy.toml` (allowing everything by default), with visual editing in the WebUI adapter settings. **Allow one test group and one test user in the policy before testing**; when troubleshooting "no response", this layer is the first place to look. See [Adapter Management](../webui/adapter-management.md).

Neither the OneBot Adapter nor the QQ Official Bot Adapter ships a built-in chat list—the allow scope is decided by this layer alone.

## Verify and Troubleshoot

Send a test message on the corresponding platform:

- If the MaiBot backend shows the message log and can reply normally → success;
- If nothing happens, check in order: is the platform client logged in → is the adapter started → did it connect to the platform → (standalone) did it connect to MaiBot → does MaiBot's adapter policy allow that group / user → is MaiBot ready.
