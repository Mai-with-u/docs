---
title: "Experimental: One-Key Package on Linux Desktop"
---

# Experimental: One-Key Package on Linux Desktop

Run MaiBot on a Linux desktop with a few clicks: the one-key package (MaiBot OneKey Linux) is a graphical deployment tool that takes you from installing the core to configuring models and connecting QQ without touching a terminal. Daily start/stop, updates and logs all live in the same window.

::: warning Experimental
The package is community-maintained (a Linux port of [MaiBotOneKey](https://github.com/Mai-with-u/MaiBotOneKey), not an official distribution) and the full flow has been verified on Ubuntu 22.04+ / Debian 12+ (x86_64). Other environments may run into uncovered issues — feel free to report them on the [repo's Issues](https://github.com/Schaled/MaiBot-OneKey-Linux/issues) page.
:::

## What it does for you

::: fields
- **Embedded Python 3.12** — bundled with the environment; the system Python is neither needed nor touched.
- **Automatic MaiBot install** — the first launch installs the latest stable release from PyPI; versions can be switched or rolled back inside the package.
- **SnowLuma backend on demand** — downloaded on first use with sha256 verification, via a GitHub acceleration proxy first and official releases as fallback.
- **Process supervision** — service start/stop, health checks, crash recovery, plus an embedded terminal and WebUI.
- **Same core as the Windows package** — the orchestration core is shared with the official Windows one-key package, so the experience carries over.
:::

<Linkcard url="https://github.com/Schaled/MaiBot-OneKey-Linux" title="MaiBot-OneKey-Linux" description="Linux port of MaiBot OneKey — source code and release notes" logo="/title_img/mai.png" />

::: tip
Running a server without a desktop environment? The same project ships a headless CLI mode — see [docs/linux.md](https://github.com/Schaled/MaiBot-OneKey-Linux/blob/main/docs/linux.md) in the repository.
:::

Prefer the command line or containers? Use [Install with uv](./uv-tool), [Linux source deployment](./linux) or [Docker deployment](./docker).

## Requirements

- **System** — x86_64 with glibc ≥ 2.35: verified on Ubuntu 22.04+ / Debian 12+; no arm64 builds.
- **Desktop environment** — any graphical session; acceptance testing was done on KDE (X11), other desktops are not individually verified.
- **Git** — not bundled with the package; install it with your system package manager if missing.
- **Resources** — at least 2 GB of free memory and 2 GB of free disk; the first launch downloads MaiBot and the backend over the network.

Verify your environment first:

::: code-group

```bash [~vscode-icons:file-type-shell~]
ldd --version | head -1   # glibc version, must be ≥ 2.35
git --version
```

:::

## Deployment steps

::: steps

1. **Download the package**

   Two forms to choose from: the AppImage is portable — make it executable and run; the deb installs into the system and suits Debian / Ubuntu families. Check the releases page for the current version number:

   <Linkcard url="https://github.com/Schaled/MaiBot-OneKey-Linux/releases" title="MaiBot-OneKey-Linux Releases" description="Download the latest AppImage / deb and SHA256SUMS file" logo="/title_img/mai.png" />

   ::: code-group

   ```bash [AppImage ~vscode-icons:file-type-shell~]
   chmod +x MaiBot-OK-0.7.3-linux.AppImage
   ./MaiBot-OK-0.7.3-linux.AppImage
   ```

   ```bash [deb ~vscode-icons:file-type-shell~]
   sudo dpkg -i MaiBot-OK-0.7.3-linux.deb
   ```

   :::

   The releases page also provides a `SHA256SUMS` file to verify the download with `sha256sum`.

2. **First launch and license confirmation**

   Open the package from the app menu (deb) or run the AppImage directly, accept the license agreement and you land on the main screen.

3. **Wait for the environment to be ready**

   The package automatically does three things: creates an isolated Python environment (embedded Python 3.12) → installs the latest stable MaiBot from PyPI → downloads the SnowLuma backend on first use. When done, the MaiBot WebUI setup wizard opens automatically.

   ::: tip
   On mainland networks, switch the Python package index to a domestic mirror in the package settings under "General" first — the install will be much faster.
   :::

4. **Configure models in the WebUI wizard**

   Follow the wizard and fill in your model API keys; detailed field explanations are in [Model Config](/en/manual/configuration/model-config).

5. **Add a message platform and log in to QQ**

   The default backend is SnowLuma, no Docker required. With no platform added yet, the main screen shows a single "Message Platforms" card — click "Add Platform":

   - After saving the SnowLuma connection config, the package automatically syncs the connection details to the built-in [Unified QQ Connector](/en/manual/adapters/qq-local-client) in MaiBot and starts the backend;
   - Open `http://127.0.0.1:5099` (the SnowLuma WebUI; the login password is visible in the package's backend settings) and scan the QR code with the bot's QQ account.

   ::: warning
   This QQ number is the bot itself — it must match the bot account configured in the WebUI.
   :::

6. **Verify the deployment**

   Back in the WebUI (`http://127.0.0.1:8001`), open the "Chat" page and send a greeting — a normal reply means the deployment is done. From then on, start/stop, logs and the terminal are all operated from the package window.

:::

## Data and updates

Instance data lives in `~/.local/share/maibot-onekey/instance` (`config/`, `data/`, `plugins/`, `logs/`), and the package runtime in `~/.local/share/maibot-onekey/payload`. For general backup and migration steps, see [Backup & Migration](/en/faq/backup-and-migration); for one-key-package questions such as moving the instance directory or switching from NapCat to SnowLuma, see the [One-click Package FAQ](/en/faq/one-key).

- **Update MaiBot** — pick a new version from PyPI in the package's update window; if an update fails, use "Restore previous environment" to roll back — config, database and plugins are restored together with the environment.
- **Upgrade the package** — no automatic update source is configured yet; download the new release from the releases page and replace the old one. Instance data is kept.

## Known limitations

::: fields
- **Architecture** — x86_64 only, no arm64 builds.
- **NapCat** — Docker route only on Linux (requires Docker permissions); the default SnowLuma is unaffected.
- **Self-update** — the launcher has no update source configured; upgrade by manually replacing it with a new release.
- **Real-account login** — QQ QR-code login and message delivery are not covered by automated acceptance testing; report issues to the repository.
:::

## Verify and troubleshoot

**Verify** — `http://127.0.0.1:8001` opens the WebUI, the package status page shows both MaiBot and the backend running, and sending a message gets a reply.

**The package won't start** — run the AppImage from a terminal to see the error output; confirm glibc ≥ 2.35 and that system Git is installed.

**Environment setup stalls or MaiBot install fails** — usually a network issue: switch the Python package index to a domestic mirror and retry, or use the package's built-in check & repair to reinstall the environment.

**SnowLuma download fails** — the package tries a GitHub acceleration proxy first and falls back to official releases; if it keeps failing, check network and disk space.

**No messages after QR login** — confirm the bot's QQ number matches the account configured in the WebUI; for connection issues follow the [Unified QQ Connector](/en/manual/adapters/qq-local-client) troubleshooting steps.

**Port conflicts (8001 / 5099)** — stop the process occupying the port and restart the package.
