---
title: Deployment Overview
---

# MaiBot Deployment Overview

**MaiBot is a personified intelligent agent** that can chat with you, continuously learn about you, collect information, and extend its abilities through plugins or MCP.

MaiBot can talk through the local command line, or connect to different IM platforms or arbitrary clients through adapter plugins.

Currently the QQ (NapCat) platform is the most used and best supported platform, so this guide uses QQ as the example.

## Deployment Preparation

📱 **A QQ side account** (used to log in to the NapCat client)

🔑 **An AI model API key (requires access to a vision model and an embedding model)**

## 📦 Choose Your Deployment Method

MaiBot offers 2 installation methods, choose either one:

| Method | Suitable For |
|------|---------|
| [Source Installation](./installation.md) | Users who want to tinker and control details |
| [Docker Deployment (documentation needs updating)](./docker.md) | Users who want one-click deployment or server deployment |

::: tip 💡 How to connect QQ
First time using it? Recommended order:

1. **Install MaiBot first and start it once**
2. **Then connect to QQ (or another IM platform)** → [NapCat Adapter (documentation needs updating)](../adapters/napcat.md)
3. **Finally configure the AI model and fine-tuning settings** → [Configuration Guide](../configuration/index.md)
:::

## 3-Minute Quick Start

If you already have Python environment and AI API ready, you can start right away:

```bash
# 1. Download MaiBot
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot

# 2. Install dependencies
uv sync

# 3. Launch!
uv run python bot.py
```
