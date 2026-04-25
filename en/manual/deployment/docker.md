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

| Service | Purpose | Simple Explanation |
|------|------|----------|
| `core` | MaiBot core | The robot's brain 🧠 |
| `napcat` | QQ connector | Lets the robot get on QQ 📱 |
| `sqlite-web` | Database tool | View what the robot remembers 📊 |

## ⚙️ Environment Variables (Advanced Usage)

### Core Service Settings

| Variable | Purpose | Example |
|------|------|------|
| `TZ` | Timezone | `Asia/Shanghai` |
| `EULA_AGREE` | Skip agreement confirmation | Advanced usage, usually don't worry about it |

### QQ Service Settings

| Variable | Purpose |
|------|------|
| `NAPCAT_UID` | User ID (usually use default) |
| `NAPCAT_GID` | User group ID (usually use default) |

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

| Service | Port | Purpose |
|------|------|------|
| Web interface | 18001 | Open http://localhost:18001 in browser |
| QQ connection | 6099 | Used for robot to connect to QQ |
| Database tool | 8120 | Used to view robot data |

## 📋 Complete Steps (Step by Step)

```bash
# 1. Download
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot

# 2. First startup (will generate config files)
docker compose up -d

# 3. Change config (important!)
# Open ./docker-config/mmc/bot_config.toml and fill in QQ number
# Open ./docker-config/mmc/model_config.toml and fill in API key

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