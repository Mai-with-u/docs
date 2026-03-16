# 📦 Installation Guide

This guide will help you deploy the MaiBot chat robot. We recommend using [uv](https://docs.astral.sh/uv/) as the Python package manager, which offers faster package installation and better dependency management. The traditional pip method is also available.

## Installation and Running

### Prerequisites
- [Python](https://www.python.org/) - Version 3.10 or higher
- [Git](https://git-scm.com/) - (Optional) For easier MaiBot updates
- [uv](https://docs.astral.sh/uv/) - (Optional) Python package manager
- **Memory and Disk Space**: Please reserve at least 2GB of memory and 2GB of disk space

### Download

You can obtain MaiBot in two ways:

**Method 1: Download from Releases (Recommended for beginners)**

Visit the [GitHub Releases](https://github.com/MaiM-with-u/MaiBot/releases) page, download the latest version source code archive, and extract it to use.

**Method 2: Clone with Git**

```bash
git clone https://github.com/MaiM-with-u/MaiBot.git
```

::: tip Domestic Mirror Acceleration
If cloning is slow, you can use a mirror site for acceleration:
```bash
git clone https://gh-proxy.com/https://github.com/MaiM-with-u/MaiBot.git
```
:::

### Create Virtual Environment

:::tabs key:platform-venv
== Windows

```bash
# uv
uv venv
# pip 
python -m venv venv
```

== Linux

```bash
# uv
uv venv
# pip 
python3 -m venv venv
```

== macOS

```bash
# uv
uv venv
# pip 
python3 -m venv venv
```
:::

### Activate Virtual Environment

:::tabs key:platform-activate
== Windows

```bash
.\venv\Scripts\activate
```

== Linux

```bash
source ./venv/bin/activate
```

== macOS

```bash
source ./venv/bin/activate
```
:::

::: tip
When using the **uv** method, you don't need to manually activate the virtual environment; the `uv run` command handles it automatically.
:::

### Install Dependencies

:::tabs key:platform-deps
== Windows

```bash
# uv
uv pip install -r requirements.txt
# pip 
pip install -r requirements.txt
```

== Linux

```bash
# uv
uv pip install -r requirements.txt
# pip 
pip install -r requirements.txt
```

== macOS

```bash
# uv
uv pip install -r requirements.txt
# pip 
pip install -r requirements.txt
```

> The `quick-algo` package may require manual compilation on macOS. See [LPMM Knowledge Base](/en/manual/configuration/lpmm/lpmm) for details.
:::

### Run

:::tabs key:platform-run
== Windows

```bash
# uv
uv run python bot.py
# pip 
python bot.py
```

== Linux

```bash
# uv
uv run python3 bot.py
# pip 
python3 bot.py
```

== macOS

```bash
# uv
uv run python bot.py
# pip 
python bot.py
```
:::

## Configuration

MaiBot supports configuration through WebUI:

1. After starting the program, open `http://localhost:8001` in your browser (default port)
2. Complete bot configuration, model configuration, and adapter configuration through WebUI, for detailed tutorial see [WebUI Configuration Guide](/en/manual/configuration/config_windows_onekey_withwebui).
3. For QQ integration, go to [Adapters Documentation](/en/manual/adapters/).

::: tip
For manual configuration, refer to the [Configuration Guide](/en/manual/configuration/index)
:::

## Background Running (Linux)

```bash
# Install screen (if not installed)
sudo apt install screen

# Start
screen -S maibot
uv run python bot.py
# Press Ctrl+a, then d to exit screen, program runs in background
```

## Common Issues

- [Windows Common Issues](/en/manual/faq/windows)
- [Linux Common Issues](/en/manual/faq/linux)
- [macOS Common Issues](/en/manual/faq/macos)

---

Having issues? Please refer to the FAQ or join the [MaiBot Community](/en/manual/other/group) for help.