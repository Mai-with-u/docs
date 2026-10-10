---
title: Login & Settings
---

# Login & Settings

After starting MaiBot, open `http://localhost:8001` to access the WebUI.

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

## WebUI Settings

You can change some basic WebUI settings in `bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[webui]
enabled = true                # Enable WebUI
host = ["127.0.0.1", "::1"]  # Bind address list
port = 8001                   # Port
mode = "production"           # Mode: development or production
webui_style = 2               # Style: 0 original / 1 future retro / 2 millennium (available since 1.3.2)
anti_crawler_mode = "basic"   # Anti-crawler mode: false / strict / loose / basic
allowed_ips = "127.0.0.1"     # IP allowlist (comma-separated)
```

:::

![About page](/images/webui/settings-about.webp)

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
- [MCP Configuration](../configuration/mcp-config.md) - external tool services, entered via "Plugin Extensions → MCP Services"
- [Plugin Management](/en/manual/plugins/) - Install and manage plugins
- [Data Management](./data-management.md) (`/data-transfer`) - sidebar "高级工具 (Advanced Tools) → 数据管理 (Data Management)" packages exports and imports of the whole data set
