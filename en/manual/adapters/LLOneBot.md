---
title: Connect QQ with LLOneBot (LuckyLilliaBot)
---

# Connect QQ with LLOneBot (LuckyLilliaBot)

LLOneBot (LuckyLilliaBot, "LLBot") is an NTQQ-based QQ bot protocol server that supports OneBot 11, Satori, and Milky protocols. MaiBot has no dedicated LLOneBot plugin; instead it reuses the **NapCat Adapter** to connect to LLBot's **OneBot 11 Forward WebSocket (WebSocket server)**. The adapter connects to LLBot as a client and passes messages to MaiBot through the plugin message gateway, so no separate legacy standalone adapter is needed.

This approach can sometimes help with newly registered or unstable QQ accounts. If you already have an LLBot environment, it can replace NapCat for the QQ integration.

::: info Connection direction
`LLBot WebSocket server ← NapCat adapter client → MaiBot plugin message gateway`

The plugin version does not use `[maim_message]`, and no Reverse WebSocket entry is needed in LLBot. You only need to enable OneBot 11 **Forward WebSocket** in LLBot.
:::

Adapter source: [Mai-with-u/MaiBot-Napcat-Adapter](https://github.com/Mai-with-u/MaiBot-Napcat-Adapter)
LLBot source and docs: [LLOneBot/LuckyLilliaBot](https://github.com/LLOneBot/LuckyLilliaBot) · [Official documentation](https://www.llonebot.com/guide/introduction)

::: warning Risk notice
LLBot is an unofficial QQ protocol server, and no unofficial protocol server can completely avoid account risk controls. Use a dedicated QQ side account and follow platform rules. LLBot's pure-protocol (headless) mode carries a disconnection risk; be cautious with accounts in poor health.
:::

## 1. Install and Log In to LLBot

LLBot is available as Desktop (Windows GUI), CLI (Linux / macOS), and Docker. Choose whichever fits your environment; detailed steps are in the [official installation guide](https://www.llonebot.com/guide/choice_install):

- **Desktop** — Extract the archive, run `llbot.exe`, and press start. In headed mode LLBot must launch the QQ client itself; an QQ opened manually will not be managed by LLBot.
- **CLI** — Extract and run `./start.sh`, then scan the QR code shown in the terminal or log in via the WebUI (default `http://localhost:3080`).
- **Docker** — Run the one-click install script or pull the image directly, then scan the QR code in the container log or the WebUI.

LLBot can run in two modes: **headed mode** launches the original NTQQ client and is more stable, while **headless mode** (pure protocol) does not depend on a QQ client and uses fewer resources, but carries a disconnection risk.

The QQ account you log in with is the bot's account. After a successful login, all protocol configuration is done in the LLBot WebUI (default `http://localhost:3080`).

## 2. Enable OneBot 11 Forward WebSocket

Enable the OneBot 11 protocol in LLBot and add a **Forward WebSocket (`ws`)** entry, using any of the following methods:

- **LLBot WebUI** (default `http://localhost:3080`) — create or enable the forward WS under the OneBot 11 settings, set the port and token, then save.
- **LLBot Desktop** — do the same under "Bot 配置 → OneBot11".
- **Edit the config file directly** `data/config_<your-qq>.json` (under `bin/llbot/data/` for Windows / CLI; mounted in a Docker Volume):

::: code-group

```json5 [JSON5 ~vscode-icons:file-type-json~]
{
  "ob11": {
    "enable": true,     // enable the OneBot 11 protocol
    "connect": [
      {
        "type": "ws",          // Forward WS: LLBot acts as the WebSocket server
        "enable": true,
        "port": 3001,          // listening port, commonly 3001
        "heartInterval": 60000,
        "token": "",           // access token; leave empty if none is set
        "reportSelfMessage": false,   // keep false to ignore messages sent by itself
        "reportOfflineMessage": false,
        "messageFormat": "array"
      }
    ]
  }
}
```

:::

Key points:

- **`type: "ws"`** — must be Forward WebSocket. LLBot's "Reverse WebSocket" makes LLBot act as a client that connects to an address you provide, which the plugin adapter does not need.
- **`port`** — the Forward WebSocket listening port, commonly `3001`; fill it into the adapter later.
- **`token`** — the Forward WebSocket access token. If set, enter the same token in the adapter later; leave empty if none is configured.
- **`messageFormat`** — keep `array`.
- **`reportSelfMessage`** — keep `false` so the bot does not process messages it just sent.

Do not confuse the LLBot WebUI token, MaiBot WebUI Access Token, and the OneBot WebSocket token.

::: tip Local-only listening
By default `onlyLocalhost` is `true`, so LLBot only listens on localhost. If MaiBot and LLBot run on different machines or are deployed in separate containers, set `onlyLocalhost` to `false` (so LLBot listens on an accessible network interface), use a strong token, and restrict sources in the firewall.
:::

## 3. Configure MaiBot's Bot Account

Set the platform and QQ account in WebUI basic settings, or edit `config/bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"
qq_account = "123456789"
```

:::

`qq_account` must match the QQ account actually logged in through LLBot. LLBot logs that account into QQ, while MaiBot core uses this setting to identify messages sent by the bot itself. The plugin adapter does not use `[maim_message]`, but it still requires `[bot].qq_account`.

## 4. Install and Enable the Adapter

Open **Plugin Management** in MaiBot WebUI, install **NapCat Adapter** from the plugin marketplace, and enable it manually. Its default configuration is disabled, so a successful installation alone does not start it.

If the marketplace is unavailable, clone the repository into MaiBot's `plugins/` directory:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
git clone https://github.com/Mai-with-u/MaiBot-Napcat-Adapter.git plugins/MaiBot-Napcat-Adapter
```

:::

After a manual clone, use the WebUI to enable and configure it. The actual directory name may vary by installation method, so do not use a hard-coded directory name as proof that installation succeeded.

## 5. Configure the Connection

In the NapCat Adapter settings, point the connection at LLBot:

**`napcat_server.host`** — LLBot's address. Use `127.0.0.1` when both run on the same host; otherwise use the LAN address of the machine running LLBot; use the service name `llbot` with a project Docker Compose file.

**`napcat_server.port`** — the Forward WebSocket listening port, such as `3001`; must match step 2.

**`napcat_server.token`** — the Forward WebSocket access token, or empty if none is configured.

The adapter connects to an address such as `ws://127.0.0.1:3001`. After saving, its `on_config_update` lifecycle stops the old connection and reconnects with the new settings; a full MaiBot restart is normally unnecessary.

::: warning Docker networking
When MaiBot and LLBot are in different containers, do not use `127.0.0.1` (it only points to the container itself). Use the Compose service name or `host.docker.internal` depending on your deployment.
:::

## 6. Configure Chat Lists

Chat-list filtering is enabled by default. Group and private chats both default to whitelist mode, with initially empty lists. Messages outside the lists are discarded.

You can temporarily disable filtering during testing. For regular use, keep filtering enabled and add the allowed group or QQ IDs. For example:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
enable_chat_list_filter = true
show_dropped_chat_list_messages = true
group_list_type = "whitelist"
group_list = ["your-qq-group-id"]
```

:::

## Verification and Troubleshooting

**Plugin loaded** — NapCat Adapter is enabled in the WebUI and the MaiBot log contains no load error.

**Correct direction** — LLBot runs the WebSocket server and the adapter log reports a connection to LLBot. Do not configure Reverse WebSocket in LLBot.

**Connected but no messages** — Check the group/private whitelist first and temporarily enable dropped-message logs; then confirm LLBot is logged in, the Forward WebSocket is enabled, and the port matches the adapter.

**Connection failure** — Verify the host, port, and WebSocket token. Use `127.0.0.1` only when both run on the same host; for Docker / cross-device deployments check `onlyLocalhost`, port mapping, and firewall.

**No reconnect after saving** — Check the plugin configuration-update log. Use a full MaiBot restart only as a fallback after hot reload fails.

**Frequent disconnects in headless mode** — LLBot's pure-protocol mode carries a disconnection risk. If it is severe, switch back to headed mode or use another protocol server such as [NapCat](./napcat.md).

## Related Documentation

- [Connect QQ with the NapCat Adapter](./napcat.md) — full usage of the adapter plugin used by this guide
- [Adapter Overview](./index.md) — choosing adapters for QQ and other platforms
- LLBot official docs: [Introduction](https://www.llonebot.com/guide/introduction) · [Quick Install](https://www.llonebot.com/guide/choice_install) · [Configuration](https://www.llonebot.com/guide/config) · [FAQ](https://www.llonebot.com/guide/faq)
- LLBot source: [LLOneBot/LuckyLilliaBot](https://github.com/LLOneBot/LuckyLilliaBot)