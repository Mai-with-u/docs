---
title: Login & Settings
---

# Login & Settings

After starting MaiBot, open `http://localhost:8001` to access the WebUI.

## Manage multiple bots

Use host management in the WebUI to create, switch, start, stop, rename, clone, or archive bots. Check which bot is selected before editing its chat, plugin, or persona settings. Shared settings hold model providers, model definitions, and web services. Each bot selects its models in the task assignment panel.

Ask a question in Mai Observation to open a dedicated help conversation. Reopen a conversation from its history to continue it. To change plugin settings, authorize writes for the current turn and review the changes shown in the conversation.

## Get the Login Password

When starting MaiBot for the first time, the console prints a temporary Token:

```
🔑 WebUI 登录 Token: e37fd618051f802816dc3bf32067583294b2648aff233a2d4caee0f67ebfdfcb
💡 请使用此 Token 登录 WebUI
```

This Token is only for the first login of the current startup. After signing in, the setup wizard requires you to set a persistent Token. A temporary Token is regenerated on the next startup.

## Log In

1. Open `http://localhost:8001` in your browser to reach the login page
2. Enter the Token shown in the console and click **登录** (Log in)

![WebUI login page](/images/webui/login.webp)

3. On first login, the setup wizard opens; the first step is setting a persistent Token

![Set login password](/images/webui/setup-token.webp)

The persistent Token must satisfy all of: at least 10 characters, at least one uppercase letter, at least one lowercase letter, and at least one special character (e.g. `MaiBot-Docs-2026!`).

![Filling in the persistent Token](/images/webui/setup-token-filled.webp)

4. After saving, the old Token is invalidated immediately; log in again with the new Token and continue the wizard

## First-Time Setup Wizard

Once the password is set, two wizard steps remain; finish them and you can start chatting.

**Basics and Persona** — fill in the platform, account, nickname, and aliases, then confirm the persona preset. Pick the platform that matches your adapter (QQ, email, and so on); for a custom adapter, choose "其他平台" (Other platform) and enter its name. The nickname is the name MaiBot uses in public; aliases are the other names people in the group might call it.

![Basics and persona](/images/webui/setup-bot-profile.webp)

![Basics and persona, filled in](/images/webui/setup-bot-profile-filled.webp)

**Model Setup** — enter the provider's Base URL and Key, then assign a model identifier such as `deepseek-chat` to both "规划思考" (planning) and "回复发言" (replying). Once both are filled in and the Key is valid, the dropdown lists the models the provider returns; tick "启用视觉" (enable vision) if that model can see images.

![Model setup](/images/webui/setup-model.webp)

Click "完成配置" (Finish setup) to enter the WebUI. To run the wizard again later, look for the entry in **WebUI Settings → 常规** (General); to change settings item by item, use [Configuration Management in the Browser](./config-management.md).

## WebUI Settings

You can change some basic WebUI settings in `bot_config.toml`. The listen address and port live in the `[http]` section, shared by the WebUI and file transfers:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[http]
host = ["127.0.0.1", "::1"]  # Bind address list; use ["0.0.0.0", "::"] for remote access
port = 8001                   # Port shared by the WebUI and file transfers

[webui]
enabled = true                # Enable WebUI
mode = "production"           # Mode: development or production
webui_style = 2               # Style: 0 original / 1 future retro / 2 millennium
anti_crawler_mode = "basic"   # Anti-crawler mode: false / strict / loose / basic
allowed_ips = "127.0.0.1"     # IP allowlist (comma-separated)
```

:::

Changes to `[http]` take effect only after restarting MaiBot.

![WebUI settings](/images/webui/settings.webp)

![About page](/images/webui/settings-about.webp)

## Updating MaiBot

**Settings → About** checks for and installs main-program updates. When a new version is found, an update card appears in the top-right corner of the top bar, with the version and pending commits:

- **Git deployment** — syncs code and dependencies, then restarts; a dependency sync failure rolls back automatically
- **Package install** — updates the program from PyPI or the selected mirror; configuration, data, and plugins in the instance directory are untouched

See [Install with uv](../deployment/uv-tool.md) for details and troubleshooting.

## Forgot Your Password?

If you can still sign in, change or regenerate the Token in the "Security" tab of **WebUI Settings** (`/settings`, opened from the gear on the right of the top bar):

![Security settings](/images/webui/settings-security.webp)

If you can no longer sign in:

1. Shut down MaiBot
2. Delete the `data/webui.json` file
3. Restart MaiBot, log in with the new temporary Token shown in the console, and set a new persistent Token

## Common Questions

**Page won't open?**

- Confirm MaiBot is running and the console printed "🌐 WebUI 服务器启动中..." (WebUI server starting) and "🌐 访问地址" (Access address)
- Confirm `[webui].enabled = true` and the port is not occupied

**Token error on login?**

- The temporary Token changes on every startup; use the value printed by the current startup
- Don't copy extra spaces or line breaks

**Locked out after setting the persistent Token?**

- The old Token is invalidated as soon as the persistent Token is saved; log in with the new Token
- As a last resort, delete `data/webui.json` to reset

## More Features

- [Configuration Management](./config-management.md) - Change configurations in the browser
- [Adapter Management](./adapter-management.md) - Account identities and allow/deny lists
- [Command Management](./command-management.md) - Plugin commands and execution permissions
- [Memory Management](./memory-management.md) - View and manage memories
- [Plugin Management](/en/manual/plugins/) - Install and manage plugins
- [Data Management](./data-management.md) (`/data-transfer`) - sidebar "高级工具 (Advanced Tools) → 数据管理 (Data Management)" packages exports and imports of the whole data set
