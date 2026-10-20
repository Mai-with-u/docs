---
title: Install with uv
---

# Install with uv

**Install MaiBot with uv, create a directory for its configuration and data, and chat through the WebUI.** This works on Windows, Linux, and macOS, with the WebUI and Python dependencies installed together. For changes to the application code, use [Windows source deployment](./windows) or [Linux source deployment](./linux). The [OneKey launcher](./windows) remains available.

## Install uv

Install uv, then open a new terminal. See the [official uv installation guide](https://docs.astral.sh/uv/getting-started/installation/) for other methods.

::: code-group

```powershell [Windows PowerShell ~vscode-icons:file-type-shell~]
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

```bash [Linux / macOS ~vscode-icons:file-type-shell~]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

:::

## Install MaiBot

The following commands install the stable package from PyPI. MaiBot requires Python 3.12+; these commands select Python 3.13. uv downloads the requested Python if needed.

::: code-group

```bash [uv ~vscode-icons:file-type-python~]
uv tool install --python 3.13 maibot
maibot --version
```

:::

If `maibot` cannot be found, run `uv tool update-shell`, then open a new terminal.

## Create an instance

Open a terminal where you want to store configuration and chat data, then create an instance directory:

::: code-group

```bash [Initialize ~vscode-icons:file-type-shell~]
mkdir my-maibot
cd my-maibot
maibot init
```

:::

`maibot init` uses the current directory by default and creates `config`, `data`, `logs`, `plugins`, and `temp`. Running it again preserves existing configuration.

Edit `config/model_config.toml` with your provider, API key, model names, and task assignments. See [Model Config](/en/manual/configuration/model-config) for examples. Set MaiBot's nickname, personality, and listening ports in `config/bot_config.toml`.

## Start and sign in

Start MaiBot in the instance directory:

::: code-group

```bash [Start ~vscode-icons:file-type-shell~]
maibot run
```

:::

On first launch, read and confirm the agreements as prompted. Open `http://127.0.0.1:8001/`, enter the temporary token printed in the terminal, set a permanent access password, and complete the initial setup. Open "麦麦聊天" (Chat with MaiBot) and send a greeting asking what one plus one equals. Confirm that a reply arrives. See [WebUI Login & Settings](/en/manual/webui/) for login instructions.

For QQ and other platforms, follow [Connect Platforms](/en/manual/adapters/) to install an adapter. Third-party plugins live in the instance's `plugins` directory.

When starting from another directory, specify the instance path. Run the following commands from the parent directory of `my-maibot`:

::: code-group

```bash [Instance directory ~vscode-icons:file-type-shell~]
maibot init --directory "./my-maibot"
maibot run --directory "./my-maibot"
```

:::

## Data and upgrades

Configuration, databases, logs, third-party plugins, and custom prompts stay in the instance directory. Upgrading or uninstalling the tool does not delete it. Stop the instance before copying the entire directory as a backup.

Before upgrading, stop all instances using this uv tool environment and back up their directories, then run:

::: code-group

```bash [Upgrade ~vscode-icons:file-type-python~]
uv tool upgrade maibot
```

:::

Run `maibot run` again in the original instance directory. Instances sharing a tool environment share the application version and upgrade together. Use uv to upgrade the installed package; the WebUI's Git updater serves source deployments.

To pin a stable version, specify its version number:

::: code-group

```bash [Pin a version ~vscode-icons:file-type-python~]
uv tool install --force --python 3.13 "maibot==1.3.8"
```

:::

The normal upgrade command keeps that version constraint. To follow stable releases again, run `uv tool install --force --python 3.13 maibot`. An upgraded database may not work with an older application; restore the pre-upgrade backup when downgrading.

## Use existing data

Stop your source instance and back up its entire directory. You can then use the original repository directory as the installed package's instance directory. Replace the path below with its actual location:

::: code-group

```bash [Reuse an instance ~vscode-icons:file-type-shell~]
maibot init --directory "/path/to/existing/MaiBot"
maibot run --directory "/path/to/existing/MaiBot"
```

:::

`init` creates only missing configuration files and preserves `config`, `data`, and `plugins`. Normal startup checks configuration and database versions and runs the existing upgrade process. You can also copy the original instance files to a new directory. Do not run the source and installed versions against the same data directory simultaneously. Third-party plugins must support the current MaiBot version.

## Verify and troubleshoot

**Verify**: `maibot --version` prints a version. After startup, the WebUI home page shows the application and WebUI versions, and Chat with MaiBot receives an actual model reply.

- **Command not found**: Run `uv tool update-shell` and open a new terminal. See the [uv tools guide](https://docs.astral.sh/uv/guides/tools/).
- **Instance not initialized**: Run `maibot init` in the instance directory. When starting elsewhere, pass `--directory` pointing to that same directory.
- **Port occupied**: In the instance's `config/bot_config.toml`, set `webui.port` to a free port such as `18001`. If the message service's `8000` port is also occupied, set `maim_message.ws_server_port` to `18000`. Restart and visit the new WebUI port.
- **No Windows console when running in the background**: Set `enable_console_input` to `false` in the instance configuration's `[debug]` section, restart, and chat through the WebUI.
- **Login works but no reply arrives**: Check the instance's `logs` and your API keys, model identifiers, and task assignments. See [Model Config](/en/manual/configuration/model-config).
