---
title: iMessage Adapter
---

# iMessage Adapter

**Connect Apple iMessage to MaiBot (community-maintained).** The iMessage adapter connects MaiBot to Apple iMessage through the **Photon Spectrum** cloud service, enabling two-way message exchange. It does **not** require your own Mac and does not depend on BlueBubbles: the plugin launches a local Node.js sidecar process that connects to the Photon cloud (cloud-hosted Mac servers) via the `spectrum-ts` SDK, and Photon relays messages to Apple iMessage.

::: info Connection direction
`MaiBot (plugin) ← local WebSocket 127.0.0.1:18763 → Node.js sidecar ← spectrum-ts SDK → Photon Cloud ←→ Apple iMessage`
:::

Adapter repository (🌐 community-maintained):

<Linkcard url="https://github.com/mayan613/MaiBot-iMessage-Adapter" title="MaiBot-iMessage-Adapter" description="mayan613's iMessage adapter plugin" />

## 1. Requirements

- **MaiBot ≥ 1.0.0** — the plugin host
- **Node.js ≥ 18** — the sidecar runtime. The plugin prefers a system-provided Node.js; if none is found, it automatically provisions one into `.nodeenv/` under the plugin directory via `nodeenv`—no manual setup needed
- **Photon account** — the iMessage cloud service; register at [app.photon.codes](https://app.photon.codes)

On first startup, the adapter automatically runs `npm install` to fetch sidecar dependencies and compiles the TypeScript sources (about 150 packages, may take 1–2 minutes). Later startups skip this step.

## 2. Get Photon credentials and phone number

1. Register at [app.photon.codes](https://app.photon.codes) and create a project;
2. In the [Photon Dashboard](https://app.photon.codes/dashboard/), obtain the **Project ID** and **Project Secret**—you will fill them into the adapter configuration;
3. Note the **iMessage phone number** Photon assigns to your project (e.g. `+10000000000`)—required when configuring the MaiBot bot account.

::: warning Free plan limitations
- The free Photon plan **only supports phone numbers**; iMessage via email addresses is not supported;
- The free plan **cannot initiate conversations**—the other party must send the first message to the Photon number via iMessage before you can reply;
- Before first use, be sure to send a message to the Photon-assigned number via iMessage, otherwise you will get `AuthenticationError: [spectrum-imessage] Target not allowed for this project`.
:::

## 3. Configure the adapter connection

Edit in the MaiBot WebUI plugin configuration page. Here is a **complete, copy-ready** config template—edit the values per the comments:

::: code-group

```toml [config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true          # Enable the adapter; false = stay idle, no sidecar, no Photon connection

[photon]
project_id = "YOUR_PROJECT_ID"      # obtained from the Photon console after creating a project
project_secret = "YOUR_PROJECT_SECRET"  # keep it safe and never expose it

[bridge]
ws_port = 18763                # local WebSocket port; listens on 127.0.0.1 only
max_retries = 3                # max automatic restarts after the sidecar exits abnormally
retry_interval = 3.0           # sidecar restart interval (sec); at least 2 is recommended
max_attachment_size_mb = 10    # max attachment size (MB); recommended 1–50
```

:::

## 4. Configure the MaiBot bot account

MaiBot Core still uses the platform account in the main config to recognize "the bot itself"; without it, sending messages will not work. Edit the `[bot]` section of `config/bot_config.toml` and add the Photon-assigned number to `platforms`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = ""                           # leave empty if you have no primary platform
qq_account = ""                         # same as above
platforms = ["imessage:+10000000000"]   # format: imessage: + Photon-assigned number
nickname = "麦麦"
```

:::

You can also set this in the WebUI: `Bot Settings → Basics → plus button next to Platform Accounts → platform `imessage`, account `+10000000000`` (replace with your own project number).

## Verify and troubleshoot

**Check connection status** — Send `/imessage_status` in a chat to view connection status, sidecar PID, and restart count.

**Manual reconnect** — Send `/imessage_reconnect` to manually reconnect the sidecar and Photon.

**Status shows not connected** — Usually the sidecar dependencies failed to set up or the build failed; the adapter automatically runs `npm install && tsc`—check the logs to confirm it succeeded.

**Photon authentication failure** — `project_id` / `project_secret` misconfigured; verify the credentials on the WebUI plugin configuration page.

**Sidecar keeps restarting** — Usually a network issue or a Photon service problem; check MaiBot log messages prefixed with `[侧车]` (sidecar).

**Can receive but not send** — The gateway is not ready yet; wait for Photon to fully connect and retry, or confirm the state with `/imessage_status`. Also make sure `platforms` in `[bot]` is filled in correctly.

**Port conflict** — If `18763` is occupied by another program, change the "Bridge port" setting in the WebUI.

::: info Unsupported message types
Limited by the Photon cloud service and MaiBot's capabilities, the following message types cannot be sent or received properly; the plugin intercepts them automatically and logs the event:
- **Voice messages (`.caf`)** — Photon's attachment service has a bug downloading iMessage voice attachments (gRPC `UNAVAILABLE`); intercepted at the sidecar layer;
- **Live Photos (`.heic` / `.heif`)** — Apple's Live Photo formats cannot be parsed; intercepted at the sidecar layer;
- **Contact cards (vCard)** — can be received as meta information, but no readable message content is generated.
:::