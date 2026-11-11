---
title: Linux Deployment
---

# Linux Deployment

On Linux and macOS, [Install with uv](./uv-tool) installs MaiBot and its WebUI directly. This page covers source deployment for working on the code. You can also use [Docker Deployment](./docker) or hand the [installation prompt](./installation-agent) to an AI assistant.

If you do not want to maintain a Git checkout, or want one-click updates from the WebUI, use [Install with uv](./uv-tool.md).

## Prepare the Environment

MaiBot needs [Python](https://www.python.org/downloads/) 3.12, [Git](https://git-scm.com/downloads), and at least 2GB of available memory.

First, verify your environment:

::: code-group

```bash [~vscode-icons:file-type-shell~]
python3 --version
git --version
```

:::

If the versions don't meet the requirements, install them for your distribution:

::: code-group

```bash [Ubuntu / Debian ~vscode-icons:file-type-shell~]
sudo apt update && sudo apt install -y python3.12 python3-pip git
```

```bash [Fedora / RHEL ~vscode-icons:file-type-shell~]
sudo dnf install -y python3.12 git
```

```bash [Arch Linux ~vscode-icons:file-type-shell~]
sudo pacman -S python git
```

:::

::: tip
MaiBot requires Python 3.12 or higher. If your system ships an older version, upgrade using pyenv or the latest package provided by your distribution.
:::

## Source Deployment

### Install uv

We recommend using uv to manage dependencies. It's much faster than traditional pip.

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

:::

::: tip
If your terminal says `uv: command not found` after installation, run `source $HOME/.local/bin/env` to refresh environment variables, or simply open a new terminal window.
:::

### Download MaiBot

::: code-group

```bash [~vscode-icons:file-type-git~]
git clone https://github.com/Mai-with-u/MaiBot.git
```

:::

Enter the folder and install dependencies:

::: code-group

```bash [uv sync ~vscode-icons:file-type-python~]
uv sync
```

```bash [pip install ~vscode-icons:file-type-python~]
pip install -r requirements.txt
```

:::

### Start

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
uv run bot.py
```

:::

On first launch, a user agreement prompt will appear. Type **同意** (agree) in the terminal to continue.

Once started, you can chat with MaiBot directly in the terminal: `[debug].enable_console_input` is on by default, so in an interactive terminal you can type plain messages as well as management commands like `/clear`, `/pm`, `/offline`, and `/online`; typing `exit()` closes only the terminal input while the bot keeps running. When running under systemd or with output redirected to a file, stdin is not an interactive terminal, so terminal input is skipped and one extra warning is logged — MaiBot runs normally regardless.

## Accessing WebUI

After starting, MaiBot automatically launches the WebUI service. Open your browser and visit the following address (replace `本机IP` with your server address; use `localhost` if running locally):

```
http://本机IP:8001
```

On first launch, the terminal prints the WebUI address and a temporary login password, like this:

```text
MaiBot 宿主已启动：/MaiMBot
WebUI：http://127.0.0.1:8001/?token=...（登录链接一分钟内有效）
WebUI 临时登录密码：QSwgc2VucGFp...
可用 maibot host status/start/stop/restart 管理 Bot；Ctrl+C 关闭宿主。
```

Click the link in the log to enter the WebUI directly, or open http://127.0.0.1:8001 and paste the temporary password. The program generates that password and stores it in the `access_token` field of `host/webui.json`; set a fixed password once in the WebUI to replace it.

Once in WebUI, follow the configuration wizard to set up models and connect platforms.

For the next steps on configuring models and connecting to QQ, refer to [Model Configuration](/en/manual/configuration/model-config) and [Adapters](/en/manual/adapters/).

## Verification and Troubleshooting

**Verify** — after startup the terminal prints the WebUI address and a temporary login password; open `http://localhost:8001`, log in with it, and send a line in the terminal to get a reply.

**`uv: command not found`** — run `source $HOME/.local/bin/env` or open a new terminal.

**Python is older than 3.12** — upgrade with pyenv or your distribution's newer package, then run `uv sync` again.

**Dependency installation fails** — check network access and disk space, then retry. On slow networks, configure a PyPI mirror for uv.

**WebUI does not open** — confirm `[webui].enabled = true`, port 8001 is free, and the firewall allows it when accessing remotely.
