---
title: Login & Settings
---

# Login & Settings

MaiBot ships with a browser admin panel (WebUI). Once started, visit `http://localhost:8001` to change configuration, manage memory, and view statistics. This page covers how to log in, complete first-time setup, and recover a lost password.

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

> 1.3.1 restyled the login page: a compact left-aligned card with a command-line style title prefix, and the input placeholder and help dialog now call the credential a "访问密码" (access password) instead of an "Access Token" (MaiBot Settings → WebUI Settings → Security still writes Access Token; both names refer to the same thing).

3. On first login, the setup wizard opens; the first step is setting a persistent Token

![Set login password](/images/webui/setup-token.webp)

The persistent Token must satisfy all of: at least 10 characters, at least one uppercase letter, at least one lowercase letter, and at least one special character (e.g. `MaiBot-Docs-2026!`).

![Filling in the persistent Token](/images/webui/setup-token-filled.webp)

4. After saving, the old Token is invalidated immediately; log in again with the new Token and continue the wizard

## First-Time Setup Wizard

The wizard has three steps, and any step can be skipped with **跳过向导** (Skip wizard); you can re-run it later under "MaiBot Settings → WebUI Settings → Other":

### Set Login Password

Replace the temporary Token with your own persistent Token.

### Bot Basics & Personality

Set the bot nickname, personality description, and reply style.

![Bot basics & personality](/images/webui/setup-bot-profile.webp)

![Filling in nickname and personality](/images/webui/setup-bot-profile-filled.webp)

### API & Models

Configure the model provider (API URL, key) and base models. If you don't have a key yet, skip and fill it in later under [Model Management](./config-management.md).

![API & model setup](/images/webui/setup-model.webp)

After completion you land on the dashboard home page:

![WebUI home page](/images/webui/home.webp)

## What Can You Do?

- ⚙️ **Change Configuration** - Edit `bot_config.toml` through forms, no file editing needed
- 🧠 **Manage Memory** - View, import, correct, and delete long-term memory
- 🔌 **Install Plugins** - Install and manage plugins and adapters
- 💬 **Chat Directly** - Talk to MaiBot and watch the reasoning of real group chats
- 📊 **View Statistics** - Messages, tokens, cost, and uptime

## Interface Navigation

As of 1.3.2 the sidebar has been reorganized into four groups by purpose:

- **配置管理** (Configuration) - MaiBot Settings (`bot_config.toml`), Model Management (`model_config.toml`), and Adapter Settings (accounts and allow/deny lists)
- **资源管理** (Resources) - stickers, expression styles, slang, behavior learning, and long-term memory
- **扩展集成** (Extensions) - 插件扩展 (Plugin Extensions, formerly "Plugin Management") and the plugin market
- **高级工具** (Advanced Tools) - prompt management, reply effects, data management, detailed statistics, and the log viewer

Two entry-point changes to know about:

- **WebUI Settings** is a standalone page (`/settings`): click the gear button on the right of the top bar, or find it in the top-bar menu on a phone. In 1.3.2–1.3.3 it was embedded as the third tab of MaiBot Settings, and 1.3.4 moved it back; a `/config/bot?mode=webui` bookmark from that period redirects to `/settings`
- The standalone **MCP 设置** sidebar entry is gone; MCP service management now lives in the **MCP 服务** group on the "扩展集成 → 插件扩展" page. Opening the old address `/mcp-settings` redirects to the plugin extensions page

## Basic Settings

Change WebUI settings in `bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[webui]
enabled = true                # Whether to enable WebUI
host = ["127.0.0.1", "::1"]  # Bind address list
port = 8001                   # Port number
mode = "production"           # Running mode: development or production
webui_style = 2               # UI style: 0 original / 1 future retro / 2 millennium (added in 1.3.2)
anti_crawler_mode = "basic"   # Anti-crawler mode: false / strict / loose / basic
allowed_ips = "127.0.0.1"     # IP whitelist (comma-separated)
```

:::

- Change `host` to `["0.0.0.0", "::"]` to listen on all interfaces; also configure firewall rules, access restrictions, and HTTPS
- `port` can be changed to another number to avoid conflicts

## WebUI Settings

The WebUI's own interface preferences, login Token, and maintenance actions all live under **WebUI Settings**: click the gear button on the right of the top bar (`/settings`).

- **外观** (Appearance) - theme mode (light / dark / follow system), accent color, fonts, border radius, custom CSS, and the interface style (Original Dashboard / Future Retro / Millennium)
- **安全** (Security) - change or regenerate the login Token
- **其他** (Other) - clear logs and cache, import/export settings, re-run the setup wizard, and reset
- **关于** (About) - version info, tech stack, and open-source license

![WebUI settings](/images/webui/settings.webp)

![About page](/images/webui/settings-about.webp)

### Interface Style

"界面风格" (Interface style) at the top of the Appearance tab offers three options:

- **原版 Dashboard** (Original Dashboard) - keeps the current cards, border radius, backgrounds, and custom theme capabilities; corresponds to `webui_style = 0`
- **未来复古** (Future Retro) - the same paper grain, hard outlines, and clipped panels as the one-click package shell; corresponds to `webui_style = 1`
- **千禧** (Millennium, new in 1.3.2) - cream plastic shell, keycap buttons, and a recessed screen; dark mode is a charcoal shell with the lights off. Corresponds to `webui_style = 2`. The sidebar stays open and does not collapse, and the home page charts switch to an oscilloscope look

Millennium is only valid from 1.3.2 onward: writing `webui_style = 2` in a 1.3.1 `bot_config.toml` fails validation.

**Changing fonts in Millennium** — with Millennium selected, Appearance shows two extra groups of pixel fonts: pick one for "英文与数字" (English and digits) and one for "中文" (Chinese). The change applies immediately. The choice is stored in the current browser only, so pick again in another browser.

::: warning Custom theming only shows under the original style
Accent color, interface style tweaks (fonts, visual effects, layout, animations, backgrounds), and theme import/export only appear under **原版 Dashboard** (Original Dashboard); switching to Future Retro or Millennium hides those blocks.

The style choice is written back to `[webui].webui_style` in `bot_config.toml`, so with several browsers open at once the last switch wins and overrides the local choice elsewhere.
:::

### Pin the Settings Pages You Use Most

MaiBot Settings has many sections. Since 1.3.3 there is a **dropdown list** next to the page title that holds every section, with no more expanded/collapsed split.

Since 1.3.4 you can also pin the ones you visit often: open the dropdown and click the pin on the right of a section. It then stays to the right of the title, one click away. Click the pin again to remove it.

Pins are stored in the current browser only; pin again after switching browsers or clearing the cache.

### Live Chat Stream Quick Management

MaiBot Chat (`/chat`) moved into the "概览" (Overview) sidebar group as of 1.3.0 and no longer occupies a top workspace tab; only **麦麦** (MaiBot) and **日志** (Logs) remain there. The left conversation list has two kinds of entries:

* **与麦麦聊天** (Chat with MaiBot) - local conversations, including the default conversation and virtual identity conversations.
* **麦麦的聊天流** (MaiBot's chat streams) - real group and private chats from the database, showing the latest message preview, current stage, and online status; click one to see its MaiBot Observation timeline on the right.
* **Search box** - filters both kinds by name, and states clearly when there are no matches.

**Direct Settings Entry**: every observed chat stream has a dedicated **⚙️ Settings** gear icon on its right that opens the chat stream settings dialog **inside the current page** (before 1.3.0 it navigated to the chat management page). It contains:

* **Session basics** - session ID, platform, type, group / user ID
* **Adapter rules** - allow or block the specific adapters under this session
* **Speaking frequency rules** - configure the default frequency and dynamic frequencies per time range
* **Extra chat stream prompts** - append dedicated prompts for this session
* **Learning settings** - enablement status and corrections for expression, slang, and behavior
* **Delete chat stream** - a serious confirmation that requires typing the full `session_id`

### Local User Identity

The box on the right of the MaiBot Chat input area is the **local user identity** box (moved here from the sidebar as of 1.3.1), where both the avatar and the nickname are edited:

* **Rename** - click the pencil icon next to the nickname, type the new name, then press Enter or click **保存** (Save); saving an empty value falls back to the default nickname
* **Change avatar** - click the camera icon at the bottom-right of the avatar to upload an image; JPEG, PNG, WebP, GIF, and BMP are supported

For the full chat and statistics walkthrough see [Chat History and Statistics](./chat-stats.md).

## Forgot Your Password?

If you can still sign in, change or regenerate the Token under "MaiBot Settings → WebUI Settings → Security":

![Security settings](/images/webui/settings-security.webp)

If you can no longer sign in:

1. Shut down MaiBot
2. Delete the `data/webui.json` file
3. Restart MaiBot, log in with the new temporary Token shown in the console, and set a new persistent Token

## Verification & Troubleshooting

**Verify**: after logging in you should see the home page statistic cards and the sidebar menu, which means the WebUI is working.

**Page won't open?**

- Confirm MaiBot is running and the console printed "🌐 WebUI 服务器启动中..." (WebUI server starting) and "🌐 访问地址" (Access address)
- Confirm `[webui].enabled = true` and the port is not occupied

**Token error on login?**

- The temporary Token changes on every startup; use the value printed by the current startup
- Don't copy extra spaces or line breaks

**Locked out after setting the persistent Token?**

- The old Token is invalidated as soon as the persistent Token is saved; log in with the new Token
- As a last resort, delete `data/webui.json` to reset

**Did your bookmarked `/settings` jump to `/config/bot`?**

- Since 1.3.4 WebUI Settings is the standalone page `/settings`, opened from the gear on the right of the top bar; the old `/config/bot?mode=webui` address redirects there
- To land directly on a sub-tab use `/settings?tab=security` (`security` / `other` / `about`; no parameter means appearance); for MCP services go through "扩展集成 (Extensions) → 插件扩展 (Plugin Extensions)"

## More Features

- [Configuration Management](./config-management.md) - Change configurations in the browser
- [Adapter Management](./adapter-management.md) - Account identities and allow/deny lists
- [Command Management](./command-management.md) - Plugin commands and execution permissions
- [Memory Management](./memory-management.md) - View and manage memories
- [MCP Configuration](../configuration/mcp-config.md) - external tool services, entered via "Plugin Extensions → MCP Services"
- [Plugin Management](/en/manual/plugins/) - Install and manage plugins
- [Chat Logs](./chat-stats.md) - View chat statistics
- [Data Management](./data-management.md) (`/data-transfer`) - sidebar "高级工具 (Advanced Tools) → 数据管理 (Data Management)" packages exports and imports of the whole data set
