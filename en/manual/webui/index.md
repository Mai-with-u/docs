---
title: WebUI
---

# WebUI

The WebUI is MaiBot's management page: after signing in you can edit config, chat with Mai, watch her thinking, and manage plugins and data in the browser instead of touching TOML files.

## First login

After the host starts, the terminal prints the WebUI address and a temporary login password for this run:

```text
MaiBot 宿主已启动：/MaiMBot
WebUI：http://127.0.0.1:8001/bots#ticket=...（登录链接一分钟内有效）
WebUI 临时登录密码：3f2c9a5b...
可用 maibot host status/start/stop/restart 管理 Bot；Ctrl+C 关闭宿主。
```

Click the link in the log to go straight in, or open `http://127.0.0.1:8001/` and paste that temporary login password. The first login enters the setup wizard, one step of which asks for a fixed password.

::: fields
- **Temporary login password** — Regenerated on every start and valid only for the current host run; once a fixed password is set, the log stops printing this line.
- **Login link** — Carries a one-time ticket and is valid for one minute; after it expires, type the password on the login page instead.
- **Fixed password** — At least 10 characters with an uppercase letter, a lowercase letter, and a special symbol, for example `MaiBot-Docs-2026!`.
- **After saving** — The old password stops working immediately; sign in with the new password to continue the wizard.
:::

Login sessions last 8 hours. With a fixed password, a session survives a host restart and the original Cookie signs you back in automatically, but the restart does not extend expiry. Browsers store only a random ticket; the database stores a digest bound to the current password. Signing out revokes the current session; changing or resetting the password revokes every session, including other browsers.

On a remote machine where copying the password is awkward, run `maibot host open-webui --directory <workspace>` for a one-time login link valid for 60 seconds.

## Layout

The WebUI organizes pages in a sidebar with these groups: Overview, Configuration, Resources, Extensions, Advanced tools.

::: fields
- **Home** — Click the logo at the top of the sidebar to return home, which summarizes run state, usage, and shortcuts.
- **Switch bot** — The entry point sits at the bottom of the sidebar. The selected bot is what config, chat, plugin, and resource pages read and write; when every bot is stopped you can still manage them here.
- **Layout** — Choose **Classic** or **Mai Observation** under WebUI Settings → Appearance. Classic keeps the top bar and card home; Mai Observation drops the top bar, puts settings in the upper sidebar and all conversations below, and uses a run-state panel as home. Desktop widths only.
:::

The other item at the bottom of the sidebar is the update entry, which shows a notice when a new version exists.

## Common pages

::: fields
- **Mai chat** — Talk to Mai or observe her other chat streams; see [Chat management](./chat-management.md).
- **Mai settings** — Sectioned forms for `bot_config.toml`; see [Edit config in the browser](./config-management.md).
- **Model management** — Providers, models, and task assignment; see [Model configuration](../configuration/model-config.md).
- **Adapter settings** — Account identity, allowlists, and denylists; see [Adapter management](./adapter-management.md).
- **Detailed statistics** — Model calls, tokens, cost, and message counts; see [Statistics and observation](./statistics.md).
- **Reasoning process** — Prompt stages and tool call records for each Planner and Replyer run.
- **Files** — Attachment upload, download, and text reading; see [Files and attachments](./files.md).
- **Plugin extensions / Plugin market** — Install and manage plugins; see [Plugins](../plugins/).
- **Data management** — Package export and import; see [Data management](./data-management.md).
:::

The composer on the **Mai Observation** page switches between **Chat** and **Ask** modes; see [Mai Help](./ai-help.md).

## Network and login settings

The WebUI's listen address, port, and login policy live in `[webui]` of the host config `host/config.toml`, and changes require a host restart:

::: code-group

```toml [host/config.toml ~vscode-icons:file-type-toml~]
[webui]
enabled = true                       # Enable the WebUI
hosts = ["127.0.0.1", "::1"]         # Listen addresses; use ["0.0.0.0", "::"] for remote access
port = 8001                          # Shared by the WebUI and file transfer
public_base_url = ""                 # Externally reachable HTTP(S) URL for file links; empty uses the local address
ssl_certfile = ""                    # HTTPS certificate path; must be set together with ssl_keyfile
ssl_keyfile = ""                     # HTTPS private key path
secure_cookie = false                # Only send login cookies over HTTPS
anti_crawler_mode = "basic"          # false off / basic log only / loose lenient / strict strict blocking
allowed_ips = "127.0.0.1"            # IPs exempt from anti-crawler protection, comma-separated, CIDR and wildcards allowed
trusted_proxies = ""                 # Trusted reverse proxy IPs, comma-separated
trust_xff = false                    # Honor X-Forwarded-For only when the direct address is in trusted_proxies
```

:::

These are also editable under **Mai Settings → Common Settings**, and still require a host restart. The first time a legacy instance enters the host, the listen address, port, certificates and file-transfer address from its config are read to generate this host config.

The port is owned by the host and shared by every bot; file-transfer addresses always come from the host's `webui.public_base_url`, and `bot_config.toml` holds no listen-related settings.

## Forgotten password

While you can still sign in: open **WebUI Settings** (the gear in the sidebar) → **Security** and change or regenerate the access password there.

When you can no longer sign in:

::: steps
1. Stop the host.
2. Delete `host/webui.json` in the workspace.
3. Start the host again, sign in with the newly printed temporary login password, and set a fixed password in the wizard.
:::

## Updating the main program

**Settings → About** checks for and installs updates. When a new version exists, an update card appears at the bottom of the sidebar.

::: fields
- **Source deployment** — Fast-forwards the official branch; uncommitted changes or a diverged branch block the update.
- **Package install** — Updates the program from PyPI or a chosen mirror; config, data, and plugins in the instance directory are unaffected.
:::

The update stops every bot first, keeps the registered desired states, and shuts down the host; afterwards bots resume their previous states. A failed precheck never interrupts bots, and a failed update uses the updater's rollback. See [uv install](../deployment/uv-tool.md) for details.

## Verify and troubleshoot

**Verify** — `http://127.0.0.1:8001/` shows the login page; signing in with the temporary login password printed in the terminal reveals the full sidebar groups and the bot switcher at the bottom.

- **The page will not open** — Confirm the host is running and printed its access address; check `[webui].enabled` in `host/config.toml` and whether the port is taken.
- **Password rejected** — Temporary login passwords change on every start; use the one printed by this run and copy it without spaces or newlines.
- **Locked out after setting a fixed password** — The old password dies immediately on save and other browsers are signed out; sign in with the new password. If all else fails, delete `host/webui.json` to reset.
- **Signed out after a while** — Sessions last 8 hours and are invalidated on expiry or auth state changes; sign in again.
- **A listen-address change has no effect** — `[webui]` addresses and ports need a host restart; hot reload does not rebind listeners.