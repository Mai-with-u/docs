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

## 🔍 Common Problems

### First startup says config file not found?

Some versions may not auto-generate config files on first startup, showing:

```
FileNotFoundError: [Errno 2] No such file or directory: 'config/bot_config.toml'
```

**Solution**: Manually create the `config/` directory and a minimal config file, then restart. The program will detect the old version and upgrade to the full config.

```bash
mkdir -p config
echo -e '[inner]\nversion = "0.0.1"' > config/bot_config.toml
echo -e '[inner]\nversion = "0.0.1"' > config/model_config.toml
uv run python bot.py
```

The program will show "config file updated" and exit. Start again to load properly.

### "Model list cannot be empty" error on startup?

`model_config.toml` must contain at least one model configuration. If auto-upgrade fails, manually create the model config file with:
- At least one API provider (`[[api_providers]]`)
- At least one text model (`[[models]]`)
- One vision model (`[[models]]`, set `visual = true`)
- One embedding model (`[[models]]`)
- Corresponding task assignments (`[model_task_config.xxx]`)

See the [Model Configuration docs](../configuration/model-config.md) for setup.

### uv command not found?

After installing uv, add it to your PATH:

```bash
# Linux/macOS
source $HOME/.local/bin/env

# Or reopen your terminal

# Verify
uv --version
```

### How to accept EULA in non-interactive environments?

On servers or headless environments without a terminal, use environment variables to skip the prompt:

```bash
# Method 1: Use the hash values shown in terminal (may differ each time)
export EULA_AGREE=<hash shown in terminal>
export PRIVACY_AGREE=<hash shown in terminal>

# Method 2: Run once to see the hash, then restart with env vars
uv run python bot.py  # Shows required environment variables
```

### How to check if the adapter plugin is enabled?

Check the logs after starting MaiBot:
- ✅ Enabled: `plugin maibot-team.napcat-adapter ... activated`
- ❌ Disabled: `plugin ... disabled, skipping activation`

Plugins are disabled by default — you need to enable them manually. See the [NapCat Adapter Guide](../adapters/napcat.md#⚠️-important-plugin-is-disabled-by-default).

### Want to restart the bot?

Just Ctrl+C to stop, then run `uv run python bot.py` again. The bot will automatically resume state.