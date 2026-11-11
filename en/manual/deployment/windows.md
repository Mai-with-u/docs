---
title: Windows Deployment
---

# Windows Deployment

For a command-line installation of MaiBot and its WebUI, use [Install with uv](./uv-tool). This page covers OneKey and source deployment.

## System Requirements

Windows 10 or later, at least 2GB of available memory.

## One-Click Package

Recommended for most users. The one-key package is a desktop app that automatically manages MaiBot installation, updates, startup, and configuration.

<Linkcard url="https://github.com/Mai-with-u/MaiBotOneKey/releases" title="MaiBot OneKey" description="Download the latest one-key package from GitHub" logo="/title_img/mai.png" />

You can also join a QQ group and get it from the group files — see [Community Groups](/en/about/community).

If you'd rather not babysit every step, hand the [installation prompt](./installation-agent) to an AI assistant and let it follow the source deployment flow for you.

If you do not want to maintain a Git checkout, or want one-click updates from the WebUI, use [Install with uv](./uv-tool.md).

::: tip
If you run into issues, check the [FAQ](/en/faq/) first — most common situations are covered there.
:::

## Source Deployment

If you prefer the command line or want to contribute to development, deploy from source.

You'll need [Python](https://www.python.org/downloads/) 3.12+ and [Git](https://git-scm.com/downloads) first.

Install uv:

::: code-group

```powershell [PowerShell ~vscode-icons:file-type-shell~]
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

:::

Clone the repository:

::: code-group

```bash [~vscode-icons:file-type-git~]
git clone https://github.com/Mai-with-u/MaiBot.git
```

:::

Navigate into the folder and install dependencies:

::: code-group

```bash [uv sync ~vscode-icons:file-type-python~]
uv sync
```

```bash [pip install ~vscode-icons:file-type-python~]
pip install -r requirements.txt
```

:::

Launch:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
uv run bot.py
```

:::

On first launch, you'll be asked to agree to the user agreement. Type **同意** (agree) in the terminal to proceed.

## Accessing WebUI

After starting, MaiBot automatically launches the WebUI service. Open your browser and visit:

```
http://localhost:8001
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

For detailed steps on configuring models and connecting to QQ, see [Model Configuration](/en/manual/configuration/model-config) and [Adapters](/en/manual/adapters/).

## Verification and Troubleshooting

**Verify** — after startup the terminal prints the WebUI address and a temporary login password; open `http://localhost:8001`, log in with it, and send a line in the terminal to get a reply.

**`uv: command not found`** — reopen PowerShell, or add `%USERPROFILE%\.local\bin` to PATH as the uv installer suggests.

**Python is older than 3.12** — install a newer Python and run `uv sync` again.

**Dependency installation fails** — check network access and disk space, then retry. On slow networks, configure a PyPI mirror for uv.

**WebUI does not open** — confirm `[webui].enabled = true`, port 8001 is free, and Windows Firewall allows it when accessing remotely.
