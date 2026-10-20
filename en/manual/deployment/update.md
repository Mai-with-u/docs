---
title: Package Install and Updates
---

# Package Install and Updates

**Use a package install when you do not want to maintain a Git checkout, or when you want one-click updates from the WebUI.** The package installs MaiBot into an isolated Python environment, while configuration, data, and plugins stay in an instance directory you choose.

::: tip Who this is for
- Users who run MaiBot without modifying its source
- Users who want to check for and install updates from WebUI Settings → About
- Servers without Git, or where updates should not depend on a Git checkout

To modify the source or follow a development branch, use [source deployment](./linux.md) or [Docker deployment](./docker.md).
:::

## Install the package

Python 3.12 or newer is required. Installing into an isolated tool environment with uv is recommended:

::: code-group

```bash [uv install ~vscode-icons:file-type-python~]
uv tool install maibot
```

```bash [pip install ~vscode-icons:file-type-python~]
pip install -U maibot
```

:::

Then initialize an instance directory. It can live anywhere, for example `~/MaiBot`:

::: code-group

```bash [Initialize instance ~vscode-icons:file-type-shell~]
maibot init --directory ~/MaiBot
```

:::

This creates `config/bot_config.toml`, `config/model_config.toml`, and the `data/`, `logs/`, `plugins/`, and `temp/` directories. Existing configuration files are kept and never overwritten.

Edit `~/MaiBot/config/model_config.toml` and fill in at least one API provider, one model, and the `replyer` / `planner` / `utils` tasks, then start:

::: code-group

```bash [Start ~vscode-icons:file-type-shell~]
maibot run --directory ~/MaiBot
```

:::

The WebUI listens on `http://127.0.0.1:8001` by default, and the login Token is printed in the terminal log. Model configuration and platform connections can then be completed entirely in the WebUI.

::: warning Always start with maibot run
Package-install self-update and restart rely on the instance lease held by `maibot run`. Running package modules directly with `python` does not provide self-update.
:::

## Update MaiBot

### Update from the WebUI

Open **Settings → About** and click "Check for updates":

- **Git deployment** — checks the `main` or `dev` branch through the selected source and lists pending commits. Clicking "Update" syncs code and dependencies, then restarts. If dependency sync fails, it rolls back to the previous version automatically
- **Package install** — checks PyPI (or a mirror) for a release version. The update replaces only the program; configuration, data, logs, and plugins in the instance directory are untouched

When an update is available, an update card also appears in the top-right corner of the top bar.

Back up `config/`, `data/`, and `plugins/` before updating. The update restarts MaiBot, so an in-progress reply is interrupted.

### Update sources

Git deployments can choose the source when checking for updates; package installs can use PyPI, the Tsinghua mirror, or the Aliyun mirror. When GitHub is slow, CNB or a mirror is usually faster.

## Verification and troubleshooting

**Verification** — `maibot --version` prints the version, and `maibot run --directory <instance>` starts normally and serves the WebUI. After an update, Settings → About shows the current version and the most recent update result.

**"Instance not initialized"** — `run` only accepts a directory that has been initialized. Run `maibot init --directory <instance>` first.

**The update check is blocked** — common causes: uncommitted changes, a detached HEAD, a branch other than `main` / `dev`, a change to the Python version requirement, or a missing dependency-sync tool. Follow the message on the page. Deployments with source changes should keep updating with Git manually.

**Dependency sync failed** — self-update rolls back automatically and keeps the previous version. Check the failing stage and command output in the log, confirm disk space and network access, then retry.

**The WebUI does not open after updating** — wait for the restart to finish and check the latest log under `logs/`. For a package install, run `maibot --version` to confirm the version; if needed, reinstall with `uv tool install --force maibot` or `pip install -U --force-reinstall maibot`. Instance data is preserved.
