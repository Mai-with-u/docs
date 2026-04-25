---
title: Installation Guide
---

# 📦 MaiBot Installation Guide

This guide will walk you through installing and starting MaiBot, like assembling a smart toy!

## 📥 Download MaiBot

Download from [GitHub Release](https://github.com/Mai-with-u/MaiBot/releases/), or clone the repository directly:

::: code-group

```bash [Stable (Recommended)]
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
```

```bash [Development (Beta)]
git clone -b dev https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
```

:::

::: warning ⚠️ Note
The `dev` branch has new features but may be unstable. First-time users should choose the `main` branch.
:::

## 🔧 Install Dependencies

MaiBot uses [uv](https://github.com/astral-sh/uv) to manage dependencies (like pip, but faster and better).

### Install uv (Like installing a new tool for your computer)

::: code-group

```bash [Windows]
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

```bash [macOS / Linux]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

:::

### Install Project Dependencies (Install parts for the robot)

::: code-group

```bash [Recommended: uv]
uv sync
```

```bash [Backup: pip]
pip install -r requirements.txt
```

:::

`uv sync` will automatically install all needed components, including database, Web interface, etc.

## ⚙️ Configure Your Bot

MaiBot's configuration files are in the `config/` directory, like the robot's "brain settings":

| File | Purpose | See Here |
|------|------|------|
| `bot_config.toml` | Basic bot info | [Configuration Overview](../configuration/index.md) |
| `model_config.toml` | AI model settings | [Model Configuration](../configuration/model-config.md) |

On first startup, MaiBot will automatically generate default configs. You need to change two things:

1. **Set QQ Account**: Fill in `qq_account` in `bot_config.toml` (your bot's QQ number)
2. **Set AI Model**: Fill in `api_key` in `model_config.toml` (your AI service key)

## 🚀 Start Your Bot

```bash
uv run python bot.py
```

## ✅ User Agreement Confirmation

First startup will ask you to agree to the user agreement, it's simple:

**Just type "agree" in the terminal!** No need to remember any hash values.

## 🔍 Common Problems (Don't be scared, beginners)

### Wrong Python Version?

MaiBot needs Python 3.10 or above. Check version:

```bash
python --version
```

::: tip 💡 Not sure which version to pick?
Choose the latest Python 3.13 and you'll be fine!
:::

### Dependencies won't install?

```bash
# Clear cache and reinstall
uv sync --reinstall
```

### Startup stuck?

- Check if configuration files are filled correctly
- See if it's a network issue
- Try restarting: Ctrl+C to stop, then run again

### Want to restart the bot?

Just Ctrl+C to stop, then run `uv run python bot.py` again. The bot will automatically resume state.