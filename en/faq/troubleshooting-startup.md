---
title: Startup and Access Troubleshooting
---

# Startup and Access Troubleshooting

This page covers startup and access errors: configuration files and MCP settings that keep MaiBot from starting, occupied ports, a WebUI that won't open or won't accept your login, and failed Git operations in the WebUI. When MaiBot crashes on startup or you can't reach it, jump straight to the matching problem below.

## Configuration File Not Found or Incorrect Format

### Error Symptoms
- MaiBot crashes immediately on startup
- Terminal prints TOML parsing error, e.g. `Invalid TOML syntax`
- Or reports a missing `[inner].version`, an invalid field type, or another configuration parsing error

### Quick Self-Check Trio
1️⃣ Do both `bot_config.toml` and `model_config.toml` exist in `config/`?
2️⃣ Is the TOML syntax correct? Strings need quotes, numbers don't, booleans are lowercase
3️⃣ Which file and field does the log identify? Do not reset both files at once

### Solutions

**Method 1: Use WebUI if MaiBot still starts**

WebUI validates the format when saving, making syntax errors less likely than direct TOML editing:

1. Start MaiBot, open browser and visit `http://localhost:8001`
2. Go to the "Configuration Management" page
3. Fill in the content as prompted on the page and save

> If a parsing error prevents MaiBot from starting, WebUI will not start either. Use Method 2.

**Method 2 (cannot start): Back up the broken file and let MaiBot regenerate it**

The loader generates current defaults when the target configuration file **does not exist**; it does not overwrite an existing malformed file.

Stop MaiBot and rename only the file identified by the log:

::: code-group

```powershell [Windows PowerShell ~vscode-icons:file-type-powershell~]
# If the log points to bot_config.toml
Rename-Item config\bot_config.toml bot_config.broken.toml

# If the log points to model_config.toml
Rename-Item config\model_config.toml model_config.broken.toml
```

```bash [Bash ~vscode-icons:file-type-shell~]
# Linux / macOS: run only the matching command
mv config/bot_config.toml config/bot_config.broken.toml
mv config/model_config.toml config/model_config.broken.toml
```

:::

Start MaiBot again:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
uv run python bot.py
```

:::

MaiBot creates a missing `config/` directory and current default configuration, then continues starting. Re-enter required settings through WebUI. Use the old file only as a reference; copying it back wholesale can restore the syntax error or an obsolete structure.

::: tip Backups during automatic upgrades
When an existing configuration is upgraded or rewritten, the code first moves it to `config/old/` with a timestamp. A syntax error occurs before that rewrite path can run, so the manual rename above is still necessary.
:::

**Method 3: Repair only the TOML syntax (manual editing reference)**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# ✅ Correct examples
[bot]
nickname = "麦麦"           # Strings need quotes
port = 8001                 # Numbers don't need quotes
enabled = true              # Booleans are lowercase

# ❌ Incorrect examples
[bot]
nickname = 麦麦             # Error! No quotes
port = "8001"              # Error! Numbers shouldn't have quotes
enabled = True             # Error! Should be lowercase true
```

:::

**Method 4: Online Validation**
If you've manually edited the file and aren't sure about the format, use an [online TOML validator](https://toml.io/en/) to check.

### Prevention Tips
- 📝 **Use WebUI to modify configuration** — WebUI validates the format when saving
- 💾 **Back up before modifying** — Back up `config/bot_config.toml` and `config/model_config.toml`
- 🔍 **Make small changes** — Only modify a few lines at a time, test if startup works after saving

## Port Occupied

### Error Symptoms
- Startup reports `OSError: [Errno 98] Address already in use`
- Or `[Errno 10048]` (Windows)
- Error log: `端口 8001 已被占用 (host=127.0.0.1)`

### Quick Self-Check Trio
1️⃣ Which process is occupying the port? Check in Task Manager / Activity Monitor
2️⃣ Can you close the occupying process? End the occupying process in Task Manager
3️⃣ Can you change MaiBot's port? Edit the configuration file to use another port

### Solutions

**Method 1: End the Occupying Process**
Find the process occupying the port in Task Manager (Windows) or Activity Monitor (macOS) and end it. If you don't know which process is occupying it, simply restarting your computer can also free up the port.

**Method 2: Change MaiBot's Port**

Change only the service identified by the log. Do not copy both examples at once.

If WebUI's default port `8001` is occupied:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[webui]
port = 8002             # Change to 8002 or another available port
```

:::

If you actually use legacy `maim_message` and its default port `8000` is occupied:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[maim_message]
ws_server_port = 18000  # Example; any port confirmed to be free is valid
```

:::

Ports `8001` and `8002` do not conflict. Port `8001` must not be suggested for another service in this scenario because an external process has already been confirmed to occupy it. The NapCat plugin adapter does not use `[maim_message]`.

Restart MaiBot after changing a listening port so the service binds to the new value.

### Prevention Tips
- 📝 **Document port assignments** — Avoid multiple services using the same port
- 🔄 **Check after restart** — Sometimes old processes aren't cleaned up, may need to manually end them after restart
- 🔧 **Verify before changing** — Use system tools to confirm the target port is free instead of guessing from its number

## WebUI Page Won't Open

### Error Symptoms
- Browser shows "This site can't be reached" or "Connection refused" when visiting `http://localhost:8001`
- Page is blank or times out loading
- MaiBot is running but WebUI won't open

### Quick Self-Check Trio
1️⃣ Did MaiBot really start successfully? Check the terminal for errors
2️⃣ Is the browser address correct? Default is `http://localhost:8001`
3️⃣ Is the firewall blocking it? Windows Firewall / antivirus software may be blocking

### Solutions

**Step 1: Confirm MaiBot is Running**
Check the terminal window where MaiBot is running, look for a log message like this:
```
WebUI 服务器 启动成功: http://127.0.0.1:8001
```
If you don't see this, MaiBot hasn't fully started yet. Resolve the startup error first.

**Step 2: Check Address and Port**
- Default address: `http://127.0.0.1:8001` (recommend using 127.0.0.1 instead of localhost)
- If you changed the port, use your modified port
- If deploying on a remote server, replace `127.0.0.1` with the server's IP

**Step 3: Check Firewall**
- **Windows**: Open "Windows Security" → "Firewall & network protection" → "Allow an app through firewall", ensure Python is allowed
- **macOS**: System Settings → Network → Firewall, check if Python is blocked
- **Linux**: Check iptables or ufw rules

**Step 4: Check if Port is Occupied**
If the port is taken by another program, WebUI won't start. Refer to [Port Occupied](#port-occupied) for checking port occupancy.

### Prevention Tips
- 🖥️ **Check logs after startup** — Open the browser only after seeing "WebUI server started successfully"
- 🔧 **Always use 127.0.0.1** — More stable than localhost, avoids DNS resolution issues
- 🛡️ **Temporarily disable firewall** — If you're sure it's safe, temporarily disable the firewall for testing

## MCP Configuration Error

### Error Symptoms
- Startup reports `MCP 服务器 {name} 使用 stdio 时必须填写 command`
- Or `MCP 服务器 {name} 使用 streamable_http 时必须填写 url`
- Or log shows `MCP server xxx failed to connect`

### Quick Self-Check Trio
1️⃣ Is the server address correct? Check `mcp.servers[].url` or `command` field
2️⃣ Does the Token/Secret match? Confirm `bearer_token` matches the MCP server
3️⃣ Is the MCP service running? Confirm the server has started and is accessible

### Solutions

**Step 1: Check MCP Configuration**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml

[mcp]
enable = true

# STDIO type (local process communication)
[[mcp.servers]]
name = "local-filesystem"
enabled = true
transport = "stdio"
command = "node"                          # Required! Startup command
args = ["/path/to/mcp-server/index.js"]   # Command arguments

# HTTP type (remote service)
[[mcp.servers]]
name = "remote-search"
enabled = true
transport = "streamable_http"
url = "https://mcp-search.example.com/sse"    # Required! HTTP endpoint

[mcp.servers.authorization]
mode = "bearer"
bearer_token = "your-bearer-token-here"       # Required! Authentication token
```

:::

**Step 2: Verify MCP Service is Accessible**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Test HTTP type MCP
curl -v https://mcp-search.example.com/sse \
  -H "Authorization: Bearer your-bearer-token-here"

# Test STDIO type MCP
node /path/to/mcp-server/index.js
# You should see the MCP service startup log
```

:::

**Step 3: Check Common Errors**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# ❌ Error example 1: stdio mode missing command
[[mcp.servers]]
transport = "stdio"
command = ""              # Error! Must specify startup command

# ❌ Error example 2: HTTP mode missing url
[[mcp.servers]]
transport = "streamable_http"
url = ""                  # Error! Must specify HTTP endpoint

# ❌ Error example 3: Bearer auth missing Token
[mcp.servers.authorization]
mode = "bearer"
bearer_token = ""         # Error! Must specify Token
```

:::

### Prevention Tips
- 📋 **Check each config item** — Refer to the MCP server documentation to confirm parameters
- 🔍 **Test before deploying** — Use `curl` to test connectivity before configuring in MaiBot
- 📝 **Document Token changes** — Update MaiBot configuration synchronously when Token changes

## WebUI Login Failed / Token Expired

### Error Symptoms
- Opening WebUI page automatically redirects back to login page
- After pasting the Token, prompts "Login failed" or "Invalid Token"
- API requests return `401 Unauthorized` error
- Browser console shows `Token expired` or `Invalid session`

### Quick Self-Check Trio
1️⃣ **Clear browser cache** — Cookie/LocalStorage may have expired or become corrupted
2️⃣ **Check if the Token is correct** — Confirm uppercase/lowercase, special characters, and that no extra space was copied
3️⃣ **Check WebUI service status** — Confirm the service is running and hasn't been restarted

### Solutions

**Method 1: Clear Cookies and Re-login**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Browser operations:
# 1. Press F12 to open Developer Tools
# 2. Go to Application → Cookies
# 3. Delete all MaiBot-related Cookies
# 4. Refresh the page and re-login
```

:::

**Method 2: Restart WebUI Service**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# After changing the Token in data/webui.json, restart the service
# Docker deployment
docker restart maibot

# Source deployment
# First stop the current process (Ctrl+C), then restart
uv run bot.py
```

:::

**Method 3: Verify the Login Token**
The WebUI login Token is stored in the `access_token` field of `data/webui.json`, not in `bot_config.toml`:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "access_token": "your-access-token-here",
  "token_source": "configured"
}
```

:::

Restart MaiBot after changing the Token for it to take effect. The terminal also prints the current Token on every startup — just copy that one. The Token generated on first launch is temporary; replacing it with your own fixed Token is more convenient.

> ⚠️ **Note**: The browser keeps the Token in the `maibot_session` Cookie as its login state, so changing the Token invalidates all logged-in sessions and requires re-login.

### Prevention Tips
- **Switch to a fixed Token** — After first launch, replace the temporary Token with your own and pin it in `data/webui.json`
- **Don't change the Token frequently** — Otherwise you'll have to re-login each time
- **Use browser bookmarks** — Save the page after logging in to avoid re-entering the Token

## Git Operation Failed (WebUI)

### Error Symptoms
- Knowledge base sync / Git mirror operation fails in WebUI
- Log shows `Git clone failed` or `Permission denied`
- SSH Key verification fails with `Host key verification failed`
- Git LFS files are too large causing timeout

### Quick Self-Check Trio
1️⃣ **First check network** — Can you access GitHub/Gitee?
2️⃣ **Try a public repository** — Does a repo that doesn't require login work?
3️⃣ **Is the repository too large?** — Large files can cause timeout

### Solutions

**Step 1: Confirm Network Connectivity**
Check if you can open GitHub or Gitee websites. If not, there's a network issue — resolve that first.

**Step 2: Try a Repository That Doesn't Require Login**
If you get a permission error (Permission denied), try a public repository (one that doesn't need SSH Key) in WebUI. If the public repository syncs normally, it's an SSH permission configuration issue — check your SSH Key settings on GitHub/Gitee.

**Step 3: Adjust Git Timeout**
Git mirror sources are maintained in WebUI's "Git Mirror" page, and settings such as the timeout are configured together with each mirror source — not in `bot_config.toml`. For large repositories, increase the timeout for that mirror source in WebUI, or exclude the large files/directories you don't need synced.

### Prevention Tips
- **Test with a public repository first** — Switch to a private repo only after confirming sync works
- **Avoid large files** — Don't put large binary files in the repository

## Related

- [Error Troubleshooting Overview](/en/faq/error-troubleshooting) — error code quick reference, keyword index, and the troubleshooting flowchart.
- [Model and Rule Troubleshooting](/en/faq/troubleshooting-model) — API keys, network timeouts, regular expressions, and keyword rules.
- [Runtime and Data Troubleshooting](/en/faq/troubleshooting-runtime) — missing replies, databases, emojis, memory, disk space, and data anomalies.
- [Plugin and Adapter Troubleshooting](/en/faq/troubleshooting-plugins-adapters) — plugin loading failures, adapter connections, and reconnects.
- [Getting Help](/en/faq/getting-help) — self-checks before asking, the issue checklist, and how to export logs.
