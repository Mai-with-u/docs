---
title: Docker Deployment
---

# 🐳 Docker Deployment Guide

Docker is like a big box that packages MaiBot and everything it needs together, ready to run with one click!

## 📋 Preparation

You need to install:
- [Docker](https://docs.docker.com/get-docker/) (like installing a virtual machine)
- [Docker Compose](https://docs.docker.com/compose/install/) (Docker's helper)

## 🚀 5-Minute Quick Deployment

### 1. Download MaiBot

```bash
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
```

### 2. One-Click Start!

```bash
docker compose up -d
```

First startup will automatically generate configuration files, then stop and wait for you to configure.

## 📦 What's in Docker?

Docker will start several services at once, like a team:

- **`core`** — MaiBot core, the robot's brain 🧠
- **`napcat`** — QQ connector, lets the robot get on QQ 📱
- **`sqlite-web`** — Database tool, view what the robot remembers 📊

## ⚙️ Environment Variables (Advanced Usage)

### Core Service Settings

- **`TZ`** — Timezone, e.g. `Asia/Shanghai`
- **`EULA_AGREE`** — Skip agreement confirmation (advanced, usually don't worry about it)

### QQ Service Settings

- **`NAPCAT_UID`** — User ID (usually use default)
- **`NAPCAT_GID`** — User group ID (usually use default)

## 💾 Where is Data Saved?

Docker will save important data in these locations on your computer:

### Bot Data
- **Config files**: `./docker-config/mmc/` (robot settings)
- **Runtime data**: `./data/MaiMBot/` (chat history, memories, etc.)
- **Plugins**: `./data/MaiMBot/plugins/` (extra features)
- **Logs**: `./data/MaiMBot/logs/` (operation records)

### QQ Data
- **QQ config**: `./docker-config/napcat/`
- **Login info**: `./data/qq/` (no need to log in again next startup)

## 🔌 Port Information

- **Web interface** — Port 18001, open http://localhost:18001 in browser
- **NapCat Web UI** — Port 6099, NapCat web configuration panel
- **Database tool** — Port 8120, used to view robot data

## 🔗 Connect NapCat

`docker compose up -d` only starts the MaiBot and NapCat containers. You still need to finish NapCat login, WebSocket setup, and adapter configuration before MaiBot can actually receive QQ messages.

1. Open the NapCat Web UI: `http://localhost:6099`
2. Log in to the NapCat Web UI. If a token is required, check the `token` field in `./docker-config/napcat/webui.json`.
3. Log in to your QQ bot account in the NapCat Web UI.
4. In NapCat network settings, enable **Forward WebSocket** or **WebSocket Server**, set host to `0.0.0.0` or `::`, and usually use `3001` as the listening port.
5. Enable the **NapCat Adapter** in MaiBot WebUI plugin management, or edit `./data/MaiMBot/plugins/MaiBot-Napcat-Adapter/config.toml` on the host:

```toml
[plugin]
enabled = true

[napcat_server]
host = "napcat"
port = 3001
token = ""
```

::: warning Docker Network Address
In Docker Compose, the MaiBot container should access the NapCat container by using the service name `napcat`. Therefore, `napcat_server.host` in the adapter configuration is usually `napcat`, not `127.0.0.1`.
`127.0.0.1` inside a container only means the current container itself.
:::

### Group messages are not received

The NapCat Adapter enables chat list filtering by default, and group chats use whitelist mode by default. If the group ID is not in the whitelist, group messages will be dropped directly by the adapter, which can look like NapCat is connected but MaiBot does not respond.

Edit the `[chat]` section in `./data/MaiMBot/plugins/MaiBot-Napcat-Adapter/config.toml`:

```toml
[chat]
enable_chat_list_filter = true
show_dropped_chat_list_messages = true
group_list_type = "whitelist"
group_list = ["your QQ group ID"]
```

For local testing, you can also temporarily disable chat list filtering:

```toml
[chat]
enable_chat_list_filter = false
```

Restart the core container after changing the configuration:

```bash
docker compose restart core
```

::: tip WebUI Configuration Location
The WebUI enabled state, listening address, and container port are now configured in the `[webui]` section of `./docker-config/mmc/bot_config.toml`, instead of a separate WebUI config file or environment variables.
:::

By default, `docker-compose.yml` maps host port `18001` to container port `8001`:

```yaml
ports:
  - "18001:8001"
```

For Docker deployment, it is recommended to confirm that the WebUI configuration in `./docker-config/mmc/bot_config.toml` is:

```toml
[webui]
enabled = true
host = "0.0.0.0"
port = 8001
```

::: warning ⚠️ host must be changed to 0.0.0.0
The default WebUI `host` value is `127.0.0.1` (only listening on the loopback address). **Inside a Docker container, this means only the container itself can access WebUI, and the host machine cannot reach it through port mapping**. For Docker deployment, make sure to set `host` to `0.0.0.0`; otherwise the browser will not be able to open WebUI.
:::

- `host` is the address WebUI binds to inside the container. For Docker deployment, `0.0.0.0` is recommended so host port mapping can access WebUI.
- `port` is the port WebUI listens on inside the container. It must match the right side of the port mapping in `docker-compose.yml`. For example, in `18001:8001`, it is `8001`.
- If you want to change the browser access port, usually you only need to change the left side of the port mapping. For example, change `18001:8001` to `28001:8001`, then visit `http://localhost:28001`.

## 📋 Complete Steps (Step by Step)

```bash
# 1. Download
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot

# 2. First startup (will generate config files)
docker compose up -d

# 3. Change config (important!)
# Open ./docker-config/mmc/bot_config.toml and fill in QQ number
# WebUI configuration is also in the [webui] section of ./docker-config/mmc/bot_config.toml
# Open ./docker-config/mmc/model_config.toml and fill in API key
# Open http://localhost:6099, log in to NapCat, and enable Forward WebSocket
# Enable the NapCat Adapter and set the adapter's napcat_server.host to napcat
# For group chats, add the group ID to the NapCat Adapter group_list, or disable chat list filtering

# 4. Restart to apply config
docker compose restart core

# 5. View logs
docker compose logs -f core
```

## 🔧 Common Problems

### Container exits immediately after starting?

Check logs for the reason:
```bash
docker compose logs core
```

90% of the time it's because:
- Config files not filled correctly (especially API key)
- QQ number filled wrong

### Not enough memory?

Docker uses quite a bit of memory, recommend at least 2GB free memory.

### Want to stop the bot?

```bash
docker compose down
```

### Want to restart?

```bash
docker compose restart
```

### Command error: `unknown shorthand flag: 'd' in -d`?

This means your server has the **Standalone** version of Docker Compose installed. Replace the space in the command with a hyphen:
```bash
docker-compose up -d
```
Similarly, all later commands in this document written as `docker compose command` need to be written as `docker-compose command` on your server, such as `docker-compose restart core`.
