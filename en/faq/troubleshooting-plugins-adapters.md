---
title: Plugin and Adapter Troubleshooting
---

# Plugin and Adapter Troubleshooting

This page covers plugin and adapter errors: plugins that fail to load, adapters that are not connected or whose accounts are unavailable, and adapter WebSocket disconnect reconnect loops.

## Plugin Loading Failed

**What you may see**

- Startup logs report a plugin loading failure, and the corresponding plugin is grayed out and unavailable in the plugin list
- Log shows `ImportError`, `ModuleNotFoundError`, or `Manifest validation failed`
- Log reports `Host version incompatible` or `SDK version incompatible` (the plugin's declared Host / SDK version range does not cover the current version)
- Plugin directory exists but no plugins are loaded

**Check these first**

1. First try reinstalling the plugin with the latest version
2. Check the log for what dependencies are missing
3. Confirm Python version is ≥ 3.12 and the plugin is compatible with the MaiBot version

**Step 1: Try a Different Version**
Re-download the plugin and choose a version compatible with your MaiBot version. Prioritize official plugins or popular community plugins — they have better compatibility.

**Step 2: Install Missing Dependencies**
Check the log for errors like `No module named 'xxx'`. If found, the plugin is missing dependencies. Run the following in the plugin directory:
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
cd plugins/your-plugin-directory
uv sync
```

:::

**Step 3: Read the Full Error Log**
When starting MaiBot, pay attention to the complete error information in the terminal, look for prompts like:
```
No module named 'requests'
```
Install whatever is indicated as missing.

**Step 4: Fallback for Version Incompatibility**
If the log says `Host version incompatible` or `SDK version incompatible` (the plugin's declared version range does not cover the current MaiBot / SDK version), first follow Step 1 and switch to another plugin version. If no compatible version exists, you can temporarily enable forced compatibility:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[debug]
# Skip the plugin's declared Host / SDK version range check and load it directly
force_plugin_compatibility = true
```

:::

When enabled, the version range check is skipped and only one warning is logged (including the declared Host / SDK range and the current version), so the load is no longer rejected; **you must restart MaiBot for the change to take effect**. Use this switch temporarily to diagnose version compatibility; forcing an incompatible plugin to load can cause runtime errors. Once a compatible plugin version is available, set it back to `false` and update the plugin. For a full description of this switch, see [Bot Configuration · Debug](../manual/configuration/bot-config.md#debugging).

**Prevent it next time**

- Check the documentation before installing a plugin to confirm compatible MaiBot version
- Prioritize official plugins or popular community plugins
- Regularly update plugins and MaiBot to the latest versions
- Don't leave `[debug].force_plugin_compatibility` enabled long-term; it's only a fallback when no compatible version exists

## Adapter Not Connected or Account Unavailable

**What you may see**

- Messages cannot be sent on a platform (e.g., QQ)
- No adapter identity / connection information appears in the logs
- Adapter is connected but bot is unresponsive
- Message sending fails, returns `400 Bad Request`

**Check these first**

1. **Check the adapter connection** — Is the relevant adapter started and connected to MaiBot?
2. **Verify account credentials** — Confirm the QQ number logged into the adapter is healthy and not banned or offline
3. **Check adapter logs** — Look for adapter-related records in the WebUI log panel or terminal

**Step 1: Confirm the Adapter Is Connected**
Platform accounts are maintained on the adapter side and are not filled into `bot_config.toml`. First confirm that the relevant adapter is started and connected to MaiBot according to the [Adapters](/en/manual/adapters/) documentation.

**Step 2: Check Adapter Connection Status**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# View adapter records in MaiBot logs
# Docker deployment
docker logs maibot | grep -i adapter

# Source deployment
# Observe terminal output, look for adapter connection and identity reporting logs
```

:::

**Step 3: Verify Account Credentials**
- **QQ platform** — Confirm the QQ number logged into the adapter is online and not muted or banned
- **Other platforms** — Refer to the corresponding adapter's documentation to confirm login status

**Prevent it next time**

- **Use a secondary account** — Avoid the risk of your main account being banned
- **Check adapter status regularly** — Re-login promptly after it goes offline
- **Keep adapters updated** — An outdated adapter version may fail to connect to a newer MaiBot

## Adapter WebSocket Disconnect Reconnect Loop

**What you may see**

Adapter logs continuously:
```
[WebSocket] Connection closed, reconnecting...
[WebSocket] Reconnecting in 3s...
[WebSocket] Connection established
[WebSocket] Connection closed, reconnecting...
```
Message sending and receiving is unstable, sometimes works and sometimes doesn't.

**Check these first**

1. Is the host address and port filled into the adapter correct? The host exposes one HTTP port, default `8001`
2. Is the network stable? (Between host and client)
3. Is the MaiBot process running normally? Does the terminal report port conflicts or startup failures?

**Confirm the host-side connection address**
External adapters connect to the host's single HTTP port and are routed by a path that carries the Bot ID:

```text
ws://<host>:<host-port>/maim/<bot_id>/ws
```

The Bot ID in the path must exist in `maibot host list`. Unknown or not-yet-ready bots reject the connection instead of falling back to another bot. The host port is `[webui].port` in `host/config.toml`, default `8001`. The OneBot Adapter is a plugin adapter that runs inside the main program, so it needs no address at this layer.

::: warning Legacy root paths no longer work
The old `/ws` and `/api` root paths and the separate port are gone. Adapter addresses must use the new Bot-ID path.
:::

**Adjust the Reconnect Interval on the Adapter Side**
The reconnect interval is configured on the adapter side; increasing it reduces frequent reconnections:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Open the adapter's own configuration file and increase the reconnect interval (e.g. 5 seconds)
# Refer to your adapter's documentation for the exact field name
```

:::

**Check Server Status**
Check the host terminal output to confirm the process runs and the port is free (see [Port Occupied](/en/faq/troubleshooting-startup#port-occupied) for conflicts). The host port is `[webui].port` in `host/config.toml`; restart the host after changing it.

**Enable Heartbeat Keepalive (Advanced)**
If the network environment is poor, enable WebSocket heartbeat keepalive on the adapter side — refer to your adapter's documentation for the exact fields.

**Prevent it next time**

- **Ensure network stability** — The network between server and adapter should be reliable
- **Enable heartbeat detection** — Recommended for long connections to keep alive
- **Monitor logs** — Investigate promptly if frequent reconnection is detected
- **Consider using process management** — systemd/supervisor can automatically restart services

## Related

- [Error Troubleshooting Overview](/en/faq/error-troubleshooting) — error code quick reference, keyword index, and the troubleshooting flowchart.
- [Startup and Access Troubleshooting](/en/faq/troubleshooting-startup) — configuration files, MCP, ports, and WebUI access or login.
- [Model and Rule Troubleshooting](/en/faq/troubleshooting-model) — API keys, network timeouts, regular expressions, and keyword rules.
- [Runtime and Data Troubleshooting](/en/faq/troubleshooting-runtime) — missing replies, databases, emojis, memory, disk space, and data anomalies.
- [Getting Help](/en/faq/getting-help) — self-checks before asking, the issue checklist, and how to export logs.
