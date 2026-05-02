---
title: 💬 QQ Bot Connection Guide
---

# 💬 QQ Bot Connection Guide

Want MaiBot to chat with you in QQ groups? NapCat makes it super easy!

## What is NapCat? 🤔

NapCat is like a "translator" that helps MaiBot and QQ chat:
- ✅ No need to install full QQ client
- ✅ Stable, fast, and resource-efficient  
- ✅ Supports group and private chats
- ✅ Auto-connects, no hassle

Simply put: NapCat lets MaiBot "understand" QQ messages and "speak" back to QQ!

## Adapter Repository 📦

The NapCat adapter source is at: [Mai-with-u/MaiBot-Napcat-Adapter](https://github.com/Mai-with-u/MaiBot-Napcat-Adapter)

This adapter is cloned into the `MaiBot-Napcat-Adapter/` directory in this project.

> 💡 **Branch Difference**: The adapter has **two branches** for different running modes:
> - `main` branch → **Standalone Mode** (adapter runs as a separate program)
> - `plugin` branch → **Plugin Mode** (adapter runs as a MaiBot plugin)
>
> Make sure to switch to the correct branch for your chosen mode after cloning!

## Two Running Modes ⚡

NapCat adapter supports two running modes, pick whichever suits you!

### 🌟 Plugin Mode (Recommended)

The adapter runs directly inside MaiBot, like a "built-in translator":
- Only one network hop (NapCat → Adapter)
- Adapter and MaiBot communicate internally, no network needed
- **More stable**: Fewer connection points, less chance of disconnection
- **Simpler**: No need to configure connection between adapter and MaiBot
- **Lower latency**: Messages take one less network hop, faster replies

Message flow: **QQ → NapCat → Adapter Plugin (inside MaiBot) → MaiBot**

💡 **WebSocket Roles**: NapCat acts as WebSocket server (Forward WebSocket), adapter acts as WebSocket client connecting to NapCat.

### 🔧 Standalone Mode

The adapter runs as a separate program, like a "middleman":
- Requires two network hops (NapCat → Adapter, Adapter → MaiBot)
- Needs an extra WebSocket connection between adapter and MaiBot
- Suitable for scenarios requiring separate deployment or special needs

Message flow: **QQ → NapCat → Adapter → MaiBot**

💡 **WebSocket Roles**: Adapter acts as WebSocket server (Reverse WebSocket), NapCat acts as WebSocket client connecting to adapter.

### Let's Compare ✨

| Feature | Plugin Mode 🌟 | Standalone Mode 🔧 |
|--------|---------------|-------------------|
| Network Hops | 1 hop | 2 hops |
| Latency | Lower ✅ | Higher |
| Setup Difficulty | Simple ✅ | Requires extra config |
| Stability | Higher ✅ | Extra connection point might fail |
| Installation | Drop in plugins/ folder ✅ | Needs separate running |

💡 **Tip**: If you're just starting out, go with plugin mode! If you have special needs (like adapter and MaiBot on different machines), then consider standalone mode.

## Plugin Mode Guide 🚀

### Step 1: Install the Adapter

Plugin mode uses the `plugin` branch:

1. Clone or switch to the plugin branch:
```bash
# Clone the plugin branch
git clone -b plugin https://github.com/Mai-with-u/MaiBot-Napcat-Adapter.git

# Or if already cloned, switch to plugin branch
cd MaiBot-Napcat-Adapter
git checkout plugin
```

2. Put the adapter directory into MaiBot's `plugins/` folder

Or, you can install the plugin through MaiBot's WebUI interface - even easier!

### Step 2: Configure NapCat Connection

In plugin mode, the adapter already runs inside MaiBot, so no need to configure connection between adapter and MaiBot. You only need to configure connection between adapter and NapCat - fill in NapCat's address and port in the adapter's config file. In plugin mode, the adapter's config tells it WHERE to find NapCat's forward WebSocket server. This is the address the adapter connects TO, not a listening address.

> 💡 **Plugin Config Location**: The adapter's config file is at `plugins/MaiBot-Napcat-Adapter/config.toml`, which contains NapCat connection address, port, token, and other settings.

### Step 3: Configure NapCat

1. Open NapCat's web interface
2. Find "Forward WebSocket" settings
3. Enable the Forward WebSocket server, default listening port is `3001`

For detailed configuration, please refer to [NapCat official documentation](https://napneko.github.io/guide/boot/Shell).

💡 **Tip**: Forward WebSocket server default port is `3001`. Make sure this port matches the `napcat_server.port` setting in your adapter's configuration file.

### Step 4: Start Up

Just start MaiBot and the adapter will auto-load! No need to start adapter separately 🎉

### ⚠️ Important: Plugin is Disabled by Default

The NapCat adapter plugin is **disabled by default** after installation. You must manually enable it before it can connect to QQ.

#### Method 1: Edit Config File (Recommended)

Edit `plugins/MaiBot-Napcat-Adapter/config.toml` and set `enabled` to `true`:

```toml
[plugin]
enabled = true   # Change to true
config_version = "0.1.0"

[napcat_server]
host = "127.0.0.1"    # NapCat WebSocket address
port = 3001           # NapCat WebSocket port
token = ""            # NapCat access token (fill in if set)
```

Then restart MaiBot.

#### Method 2: Enable via WebUI

1. Open browser at `http://127.0.0.1:8001`, log in with Access Token
2. Click **"Plugin Management"** in the left menu
3. Find **"NapCat Adapter"**, click the enable toggle
4. Save config and restart MaiBot (or wait for hot reload)

> 💡 **How to verify it's enabled**: After starting MaiBot, check the logs. If you see `plugin maibot-team.napcat-adapter ... activated`, it's enabled. If you see `plugin ... disabled, skipping activation`, it's still disabled.

## Standalone Mode Guide 🔧

If you need to run the adapter independently, follow these steps.

Uses the `main` branch:

```bash
# Clone main branch (default)
git clone https://github.com/Mai-with-u/MaiBot-Napcat-Adapter.git

# Or if already cloned, make sure you're on main branch
cd MaiBot-Napcat-Adapter
git checkout main
```

### Configure MaiBot

Add this to `config/bot_config.toml`:

```toml
[bot]
platform = "qq"           # Use QQ platform
qq_account = 123456789    # Your bot's QQ number
nickname = "MaiMai"       # Bot nickname
```

Still in `config/bot_config.toml`, set connection parameters:

```toml
[maim_message]
ws_server_host = "127.0.0.1"   # Server address (use this for local)
ws_server_port = 8080           # Port number (default 8080)
auth_token = []                 # Auth token, leave empty
```

| Setting | What It Means | How to Fill |
|--------|---------------|-------------|
| `ws_server_host` | Server address | Use `127.0.0.1` locally, actual IP for servers |
| `ws_server_port` | Port number | Default `8080`, remember if you change it |
| `auth_token` | Password verification | Leave empty, don't worry about it |

💡 **Note**: The `ws_server_port = 8080` is for MaiBot's legacy maim_message service, NOT used by the adapter. The adapter connects to MaiBot's MMC on `[maim_message].ws_server_port` (default 8000) in `config/bot_config.toml`. Make sure your adapter's config.toml `maibot_server.port` matches MaiBot's `ws_server_port`.

### Install NapCat

Please refer to [NapCat official documentation](https://napneko.github.io/guide/boot/Shell) to install NapCat.

**Docker users**: If you use the project's built-in `docker-compose.yml`, NapCat is already included as the `napcat` service and can be started together with MaiBot:

```bash
docker compose up -d
```

### Set Up NapCat Connection

1. Open NapCat's web interface
2. Find "Reverse WebSocket" settings
3. Fill in adapter address: `ws://127.0.0.1:8095`

For detailed configuration, please refer to [NapCat official documentation](https://napneko.github.io/guide/boot/Shell).

💡 **Tip**: In standalone mode, the adapter runs a WebSocket server that NapCat connects to as a reverse WebSocket client. The adapter listens on port 8095 by default. If NapCat and adapter both run in Docker Compose, make sure the adapter's listening address is reachable from the container network.

### Login to QQ

After starting NapCat, you need to login. For login methods, please refer to [NapCat official documentation](https://napneko.github.io/guide/boot/Shell).

⚠️ **Important Reminders**:
- Recommend using secondary account to reduce ban risk
- Login info is saved, no need to re-login after restart
- Follow QQ rules, don't spam

### Connection Steps

Recommended startup order:

1. **Start NapCat** → Wait for QQ login success
2. **Start MaiBot** → Wait for WebSocket service startup
3. **Start Adapter** → NapCat connects to Adapter (reverse WebSocket), and Adapter connects to MaiBot
4. **Auto-connect** → NapCat automatically connects to adapter as WebSocket client

```bash
# Docker one-click startup (recommended)
docker compose up -d

# Manual startup
# Terminal 1: Start NapCat
# Terminal 2: Start Adapter (run in adapter directory)
# Terminal 3: uv run python bot.py
```

## Verify Connection ✅

How to know it's connected? Check these:

**Plugin Mode**:
1. **WebUI Plugin List**: Can see NapCat adapter plugin loaded
2. **MaiBot logs**: See adapter plugin loaded message
3. **Test message**: @bot in QQ group, see if it replies

**Standalone Mode**:
1. **MaiBot logs**: See "WebSocket service started successfully"
2. **NapCat logs**: See "Reverse WebSocket connection successful"
3. **Adapter logs**: See connection successful
4. **Test message**: @bot in QQ group, see if it replies

## Common Issues 🤔

### Plugin Mode vs Standalone Mode - How to Choose?

- **Most cases choose plugin mode**: Simpler, more stable, lower latency
- **Choose standalone mode when**: Adapter and MaiBot deployed on different machines, or other special needs

### How to Know Which Mode I'm Using?

- **Plugin mode**: Can see NapCat adapter in MaiBot's WebUI plugin list
- **Standalone mode**: Adapter is separate program with its own terminal/process

### Can't Connect?

**Check these**:
- Are address and port correct?
- Is firewall blocking?
- Are NapCat and MaiBot on same machine?
- Any error messages in logs?

### Not Receiving Messages?

**Possible causes**:
- Wrong QQ number? Must match NapCat login
- Is NapCat itself receiving messages? Check NapCat logs
- Network connection OK?

### Can't Send Messages?

**Troubleshooting**:
- Does bot have speaking permissions? (Need permissions in groups)
- Any errors in MaiBot logs?
- Multiple programs using same QQ number?

### Other Issues

- **Version compatibility**: Latest NapCat usually works fine
- **Network issues**: Check firewall and network settings
- **Permission issues**: Ensure bot has necessary permissions

### How to Update NapCat?

For Docker deployment, update with:

```bash
docker compose pull napcat
docker compose up -d napcat
```

## Need Other Platforms?

If you need to connect to other platforms (such as GoCQ, WeChat, Discord, Telegram, etc.), check out:

- [GoCQ Adapter](./gocq) — QQ adapter based on go-cqhttp
- [Community Adapter List](./#community-third-party-adapters) — WeChat, Discord, Telegram, etc.

## Security Reminders 🔒

- Don't expose WebSocket port to public internet
- Using `127.0.0.1` is safer
- Regularly update NapCat version
- Pay attention to QQ usage rules

## Getting Help 💬

If you encounter problems:
- Check NapCat and MaiBot logs
- Join MaiBot community groups to ask
- Submit issues on GitHub
- Search for related tutorials

Good luck with your connection, let MaiBot chat with you in QQ! 🎉