---
title: Windows Deployment
---

# Windows Deployment

## System Requirements

Windows 10 or later, at least 2GB of available memory.

## One-Click Package

Recommended for most users. The one-key package is a desktop app that automatically manages MaiBot installation, updates, startup, and configuration.

<Linkcard url="https://github.com/Mai-with-u/MaiBotOneKey/releases" title="MaiBot OneKey" description="Download the latest one-key package from GitHub" logo="/title_img/mai.png" />

You can also join a QQ group and get it from the group files — see [Community Groups](/en/about/community).

After downloading, double-click the installer and follow the prompts. On first launch, the one-key package will automatically set up the Python environment and install dependencies, then walk you through a configuration wizard.

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

On first launch, you'll be asked to agree to the user agreement. Type "agree" in the terminal to proceed.

Once started, you can chat with MaiBot directly in the terminal: `[debug].enable_console_input` is on by default since 1.3.0, so in an interactive terminal you can type plain messages as well as management commands like `/clear`, `/pm`, `/offline`, and `/online`; typing `exit()` closes only the terminal input while the bot keeps running. When launched from the one-click package's own console panel or with output redirected to a file, stdin is not an interactive terminal, so terminal input is skipped and one extra warning is logged — MaiBot runs normally regardless.

## Accessing WebUI

After starting, MaiBot automatically launches the WebUI service. Open your browser and visit:

```
http://localhost:8001
```

On first launch, the terminal will print the WebUI login Token, like this:

```
07-30 18:53:45 [WebUI] WebUI 配置文件不存在，正在创建: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] WebUI 配置已保存到: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] 新的 WebUI Token 已生成: QSwgc2Vu...
07-30 18:53:45 [WebUI应用] 🔑 WebUI 登录 Token: QSwgc2VucGFp77yBQ2lhbGxv772eKOKIoOODu8+JPCAp4oyS4piF
07-30 18:53:45 [WebUI应用] 💡 请使用此 Token 登录 WebUI
07-30 18:53:45 [WebUI服务] 🌐 WebUI 服务器启动中...
```

Copy the Token from the log and paste it into the browser login page to access WebUI. You can later view or modify the Token in `data/webui.json`.

Once in WebUI, follow the configuration wizard to set up models and connect platforms.

For detailed steps on configuring models and connecting to QQ, see [Model Configuration](/en/manual/configuration/model-config) and [Adapters](/en/manual/adapters/).

## Verification & Troubleshooting

**Verify**: after startup the terminal prints "WebUI 服务器启动中" (WebUI server starting), and opening `http://localhost:8001` in a browser shows the login page — deployment succeeded.

**`uv: command not found`?**

- Close and reopen the terminal, or add uv's install directory to PATH and retry

**Dependency installation fails?**

- Confirm `python --version` is 3.12 or later
- If you see `No module named ...`, go back to the project directory and run `uv sync` again

**Port 8001 is already in use?**

- Find the occupying process ID with `netstat -ano | findstr :8001`, stop it, and restart

**Stuck on the user agreement?**

- Type 同意 (agree) in the terminal and press Enter — not `yes` or `y`

**The one-click package is blocked by antivirus?**

- Add the MaiBot install directory and `data/` to your antivirus allowlist and retry
