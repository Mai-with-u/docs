---
title: 🔧 Error Troubleshooting FAQ
---

# 🔧 Error Troubleshooting FAQ

> ⚠️ **Network is the root cause of 80% of problems** — API can't connect, Git can't pull, plugins can't install, it's most likely a network issue.
> When encountering any error, first check if you can access the external network (`curl -I https://www.baidu.com`), if not, switch networks / enable proxy.

> Listed in order of error frequency from highest to lowest. New users should prioritize the 🔴 Extremely High Frequency section.
> If you're unsure which category your problem falls into, first check the "📋 Error Troubleshooting Flowchart" at the end.

---

## 🔴 Extremely High Frequency Errors (Inevitable for New Users)

Covers scenarios 1–6, the most common problems encountered by new users when deploying and using MaiBot for the first time.

<!-- TASK_4_CONTENT_START -->

### Scenario 1: Configuration File Not Found or Incorrect Format

#### Error Symptoms
- MaiBot crashes immediately on startup
- Terminal prints TOML parsing error, e.g. `Invalid TOML syntax`
- Or reports a missing `[inner].version`, an invalid field type, or another configuration parsing error

#### Quick Self-Check Trio
1️⃣ Do both `bot_config.toml` and `model_config.toml` exist in `config/`?
2️⃣ Is the TOML syntax correct? Strings need quotes, numbers don't, booleans are lowercase
3️⃣ Which file and field does the log identify? Do not reset both files at once

#### Solutions

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

#### Prevention Tips
- 📝 **Use WebUI to modify configuration** — WebUI validates the format when saving
- 💾 **Back up before modifying** — Back up `config/bot_config.toml` and `config/model_config.toml`
- 🔍 **Make small changes** — Only modify a few lines at a time, test if startup works after saving

---

### Scenario 2: API Key Error / Insufficient Balance

#### Error Symptoms
- Bot completely unresponsive
- Backend log shows `401 Unauthorized` / `402 Payment Required` / `403 Forbidden`
- Log prompts `API key is invalid` or `Insufficient balance`

#### Quick Self-Check Trio
1️⃣ Is the API Key filled in correctly? Check `api_key` field in `model_config.toml`
2️⃣ Is the account balance sufficient? Log into the API provider's dashboard to check balance
3️⃣ Is the model name correct? Check if `model_identifier` is in the provider's supported model list

#### Solutions

**Step 1: Check API Key Configuration**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# model_config.toml
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-your-api-key-here"    # Required! Replace with your actual key
auth_type = "bearer"
```

:::

**Step 2: Verify Key is Valid**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Test DeepSeek API
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer sk-your-api-key-here"
```

:::

**Step 3: Check Balance**
- Log into DeepSeek/OpenAI or other provider's dashboard
- Check if account balance is greater than 0
- Check if API Key has expired or been disabled

**Step 4: Confirm Model Name**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# ✅ Correct example
[[models]]
model_identifier = "deepseek-chat"   # Must be a model name supported by the API provider
name = "deepseek-chat"
api_provider = "DeepSeek"

# ❌ Incorrect example
[[models]]
model_identifier = "gpt-4"           # DeepSeek does not support GPT-4!
api_provider = "DeepSeek"
```

:::

#### Prevention Tips
- 🔑 **Don't commit Keys to Git** — Use environment variables or local configuration files
- 💰 **Set up balance alerts** — Enable low-balance email notifications in the API dashboard
- 📊 **Monitor usage** — Regularly check token consumption

---

### Scenario 3: Port Occupied

#### Error Symptoms
- Startup reports `OSError: [Errno 98] Address already in use`
- Or `[Errno 10048]` (Windows)
- Error log: `端口 8001 已被占用 (host=127.0.0.1)`

#### Quick Self-Check Trio
1️⃣ Which process is occupying the port? Check in Task Manager / Activity Monitor
2️⃣ Can you close the occupying process? End the occupying process in Task Manager
3️⃣ Can you change MaiBot's port? Edit the configuration file to use another port

#### Solutions

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

#### Prevention Tips
- 📝 **Document port assignments** — Avoid multiple services using the same port
- 🔄 **Check after restart** — Sometimes old processes aren't cleaned up, may need to manually end them after restart
- 🔧 **Verify before changing** — Use system tools to confirm the target port is free instead of guessing from its number

---

### Scenario 4: WebUI Page Won't Open

#### Error Symptoms
- Browser shows "This site can't be reached" or "Connection refused" when visiting `http://localhost:8001`
- Page is blank or times out loading
- MaiBot is running but WebUI won't open

#### Quick Self-Check Trio
1️⃣ Did MaiBot really start successfully? Check the terminal for errors
2️⃣ Is the browser address correct? Default is `http://localhost:8001`
3️⃣ Is the firewall blocking it? Windows Firewall / antivirus software may be blocking

#### Solutions

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
If the port is taken by another program, WebUI won't start. Refer to Scenario 3 for checking port occupancy.

#### Prevention Tips
- 🖥️ **Check logs after startup** — Open the browser only after seeing "WebUI server started successfully"
- 🔧 **Always use 127.0.0.1** — More stable than localhost, avoids DNS resolution issues
- 🛡️ **Temporarily disable firewall** — If you're sure it's safe, temporarily disable the firewall for testing

---

### Scenario 5: MCP Configuration Error

#### Error Symptoms
- Startup reports `MCP 服务器 {name} 使用 stdio 时必须填写 command`
- Or `MCP 服务器 {name} 使用 streamable_http 时必须填写 url`
- Or log shows `MCP server xxx failed to connect`

#### Quick Self-Check Trio
1️⃣ Is the server address correct? Check `mcp.servers[].url` or `command` field
2️⃣ Does the Token/Secret match? Confirm `bearer_token` matches the MCP server
3️⃣ Is the MCP service running? Confirm the server has started and is accessible

#### Solutions

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

#### Prevention Tips
- 📋 **Check each config item** — Refer to the MCP server documentation to confirm parameters
- 🔍 **Test before deploying** — Use `curl` to test connectivity before configuring in MaiBot
- 📝 **Document Token changes** — Update MaiBot configuration synchronously when Token changes

---

### Scenario 6: Bot Not Replying to Messages

#### Error Symptoms
- Message has been sent to the platform (QQ group / private chat)
- Bot has no response at all
- No errors in logs, but still no reply

#### Quick Self-Check Trio
1️⃣ Check the backend terminal output — did it show a message received prompt?
2️⃣ Was a rule matched? Check if keyword/intent rules cover this message
3️⃣ Is the LLM configuration correct? Confirm API Key and model configuration are correct (refer to Scenario 2)

#### Solutions

**Step 1: Check Terminal Output**
Restart MaiBot and observe the terminal logs, see if there are:
- `收到消息：...` (shows the message reached MaiBot)
- `正在调用 LLM...` (shows it's requesting AI)
- `发送回复：...` (shows the reply was sent)
If all of these appear, MaiBot itself is fine — it might be a platform permission or network issue.

**Step 2: Check Reply Rules**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Check keyword rules
[[keyword_reaction.keyword_rules]]
keywords = ["你好", "hello"]    # Make sure it includes the message you sent
reaction = "你好呀！"
enabled = true                  # Make sure the rule is enabled
```

:::

**Step 3: Check Speech Frequency**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[chat.reply_timing]
talk_value = 1                  # Group talk willingness (0-1); lower is quieter. Default 1
private_talk_value = 1          # Private chat talk willingness (0-1). Default 1
```

:::

**Step 4: Check Platform Permissions**
- QQ groups: Is the bot muted? Does it have permission to speak?
- Private chat: Has the bot been blocked?
- Adapter: Is NapCat connected normally?

**Step 5: Test LLM Response**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Manually test the API
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"你好"}]}'
# You should receive a reply from the API
```

:::

#### Prevention Tips
- 📊 **Monitor logs** — Regularly check logs, handle anomalies promptly
- 🧪 **Test new rules** — Test whether a rule works after adding it
- 📝 **Document configuration changes** — Record changes after modifying reply rules

<!-- TASK_4_CONTENT_END -->

---

## 🟡 High Frequency Errors (Common)

Covers scenarios 7–11, problems encountered relatively often during normal use.

### Scenario 7: Plugin Loading Failed

#### Error Symptoms
- Startup logs report a plugin loading failure, and the corresponding plugin is grayed out and unavailable in the plugin list
- Log shows `ImportError`, `ModuleNotFoundError`, or `Manifest validation failed`
- Log reports `Host version incompatible` or `SDK version incompatible` (the plugin's declared Host / SDK version range does not cover the current version)
- Plugin directory exists but no plugins are loaded

#### Quick Self-Check Trio
1️⃣ First try reinstalling the plugin with the latest version
2️⃣ Check the log for what dependencies are missing
3️⃣ Confirm Python version is ≥ 3.12 and the plugin is compatible with the MaiBot version

#### Solutions

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

When enabled, the version range check is skipped and only one warning is logged (including the declared Host / SDK range and the current version), so the load is no longer rejected; **you must restart MaiBot for the change to take effect**. This is a temporary fallback, not a recommended practice — the plugin may genuinely be incompatible, and forcing the load can cause runtime errors. Once a compatible plugin version is available, set it back to `false` and update the plugin. For a full description of this switch, see [Logging & Monitoring · Debug Configuration Items](/develop/observability#debug-configuration-items).

#### Prevention Tips
- Check the documentation before installing a plugin to confirm compatible MaiBot version
- Prioritize official plugins or popular community plugins
- Regularly update plugins and MaiBot to the latest versions
- Don't leave `[debug].force_plugin_compatibility` enabled long-term; it's only a fallback when no compatible version exists

---

### Scenario 8: Database Error

#### Error Symptoms
- Runtime reports `DatabaseError` or `OperationalError`
- Startup prompts database migration failed
- Log shows `database is locked` or `disk I/O error`

#### Quick Self-Check Trio
1️⃣ Check if multiple MaiBot instances are running simultaneously connecting to the same database
2️⃣ Check if disk space is full (open file manager to check)
3️⃣ Confirm `data/MaiBot.db` file permissions are correct (readable and writable)

#### Solutions

**Step 1: Resolve Database Locking**

If the log shows `database is locked`, it means multiple MaiBot instances may be accessing the same database file simultaneously. Close the extra MaiBot processes and keep only one running.

If it's still locked after closing, try deleting the `data/MaiBot.db` file and starting fresh (remember to back up first).

**Step 2: Repair Corrupted Database**

If you suspect database corruption (e.g., after a sudden power outage):

1. First back up: copy `data/MaiBot.db` to a safe location
2. Restart MaiBot — the program will automatically rebuild or repair the database
3. If that doesn't work, delete `data/MaiBot.db` and let the program recreate it (important prior data needs to be restored from backup)

**Step 3: Confirm No Second Instance Is Writing to the Same Database**

`database is locked` has essentially one cause: multiple MaiBot instances (or leftover processes) accessing `data/MaiBot.db` at the same time. Close the extra processes and keep only one. The database already runs in WAL mode by default — it cannot and need not be enabled through a `[database]` section.

**Step 4: Clean Up Disk Space**

Open the `logs/` folder and delete unneeded old log files. If disk space is critically low, also check other directories for large files.

#### Prevention Tips
- Avoid running multiple MaiBot instances simultaneously connecting to the same database file
- Regularly back up `data/MaiBot.db` (recommended weekly)
- Configure log rotation to prevent log files from filling up the disk

---

### Scenario 9: Network Timeout / Connection Failure

#### Error Symptoms
- LLM request returns `APIConnectionError` or `TimeoutError` after being unresponsive for a long time
- Log shows `Connection refused`, `Connection reset`, or `Read timed out`
- Bot completely unresponsive, but local features work normally

#### Quick Self-Check Trio
1️⃣ Test network connectivity (`curl -v https://api.deepseek.com`)
2️⃣ Try a different network (e.g., switch to mobile hotspot)
3️⃣ Confirm the `timeout` parameter isn't too small (recommended 60–120 seconds)

#### Solutions

**Step 1: Test Network Connectivity**

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Test if the API endpoint is reachable
curl -v https://api.deepseek.com
```

:::
If it connects (returning HTTP 200 or 401 both count as connected), the network is fine.
If it times out or can't connect, your network route to the API provider is blocked — try a different network.

**Step 2: Increase Timeout**

If the network is poor, set a longer timeout:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-your-api-key-here"
timeout = 120              # Single request timeout (seconds), can be set to 180 on poor networks
max_retry = 3              # Number of retries on failure
retry_interval = 8         # Retry interval (seconds)
```

:::

**Step 3: Try a Different API Provider**

If DeepSeek is unstable, add a backup API in the configuration:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-key-1"

[[api_providers]]
name = "Backup"
base_url = "https://api.openai.com/v1"  # Replace with another API
api_key = "sk-your-backup-key"
```

:::

#### Prevention Tips
- Set reasonable `timeout` (60–120 seconds) and `max_retry` (2–3 times)
- Try a different network when your network is unstable (e.g., switch to mobile hotspot)
- Configure multiple API providers as backups to avoid single points of failure
- Regularly check API provider status (follow official announcements)

---

### Scenario 10: Emoji System Error

#### Error Symptoms
- Sending emoji commands has no effect
- Emoji registration fails, logs report exceeding the quantity limit
- Emoji registration fails because the `data/emojis/` directory is unwritable

#### Quick Self-Check Trio
1️⃣ Check whether `[emoji]`'s `content_filtration` is filtering too aggressively
2️⃣ Confirm whether `[emoji]`'s `emoji_send_num` / `max_reg_num` are set too low
3️⃣ Ensure `data/emojis/` directory is writable (correct permissions)

#### Solutions

**Step 1: Adjust Emoji Filtering Rules**

If emojis are being falsely filtered, first disable filtering to confirm whether it's a rule issue:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[emoji]
content_filtration = false   # Temporarily disable filtering to check if it's a rule issue
```

:::

**Step 3: Check Directory Permissions**

Ensure the `data/emojis/` directory is writable. If permissions are wrong, right-click and set read/write permissions in the file manager.

**Step 4: Adjust Emoji Quantity Limit**

If prompted that the registration quantity has exceeded the limit:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[emoji]
emoji_send_num = 25          # Number of candidates sent at once (1-64)
max_reg_num = 64             # Maximum number of registered emojis
do_replace = true            # Replace old emojis when limit is reached
```

:::

#### Prevention Tips
- Enable `content_filtration` cautiously to avoid false filtering of normal emojis
- Regularly clean the `data/emojis/` directory, remove unused emojis
- Set a reasonable `max_reg_num` to avoid taking up too much storage space

---

### Scenario 11: Memory System Error

#### Error Symptoms
- Bot replies "I don't remember" or "No relevant information found"
- Log reports long-term memory loading failed
- Memory added but cannot be retrieved

#### Quick Self-Check Trio
1️⃣ Run the index rebuild in WebUI's "Memory" page (paragraph and vector each have their own entry)
2️⃣ Check whether the `data/a-memorix/` directory is writable and intact
3️⃣ Confirm `plugin.enabled` under `[a_memorix]` is `true`

#### Solutions

**Step 1: Rebuild Memory Index**

Both the paragraph index and the vector index of long-term memory are rebuilt in WebUI's "Memory" page. 1.3.1 has no standalone command-line rebuild tool. Open WebUI → Memory page and run the corresponding rebuild entry as prompted.

**Step 2: Check the Memory Data Directory**

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# View the memory data directory (configured under [a_memorix] as storage.data_dir; defaults to data/a-memorix)
ls -la data/a-memorix/

# Confirm the directory is writable and has no leftover .lock / .tmp files
```

:::

**Step 3: Enable the Memory System**

Confirm long-term memory is enabled in the configuration file:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[a_memorix.plugin]
enabled = true                 # Master switch for the long-term memory system; default false
```

:::

**Step 4: Rebuild the Vector Index When Corrupted**

If newly added memories cannot be retrieved, first run the vector rebuild in WebUI's "Memory" page. If that still doesn't work, back up `data/a-memorix/`, stop MaiBot, delete the directory and let the system recreate it (historical memories must be restored from the backup).

#### Prevention Tips
- Periodically check memory index status in WebUI and rebuild promptly when retrieval fails
- Back up the `data/a-memorix/` directory — it's the only storage location for long-term memory
- Use WebUI's memory management features; don't manually edit files inside `data/a-memorix/`

---

## 🟢 Medium Frequency Errors (Specific Scenarios)

Covers scenarios 12–17, problems encountered only in specific operations or configuration scenarios.

### Scenario 12: WebUI Login Failed / Token Expired

#### Error Symptoms
- Opening WebUI page automatically redirects back to login page
- After pasting the Token, prompts "Login failed" or "Invalid Token"
- API requests return `401 Unauthorized` error
- Browser console shows `Token expired` or `Invalid session`

#### Quick Self-Check Trio
1️⃣ **Clear browser cache** — Cookie/LocalStorage may have expired or become corrupted
2️⃣ **Check if the Token is correct** — Confirm uppercase/lowercase, special characters, and that no extra space was copied
3️⃣ **Check WebUI service status** — Confirm the service is running and hasn't been restarted

#### Solutions

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

#### Prevention Tips
- **Switch to a fixed Token** — After first launch, replace the temporary Token with your own and pin it in `data/webui.json`
- **Don't change the Token frequently** — Otherwise you'll have to re-login each time
- **Use browser bookmarks** — Save the page after logging in to avoid re-entering the Token

---

### Scenario 13: Adapter Not Connected or Account Unavailable

#### Error Symptoms
- Messages cannot be sent on a platform (e.g., QQ)
- No adapter identity / connection information appears in the logs
- Adapter is connected but bot is unresponsive
- Message sending fails, returns `400 Bad Request`

#### Quick Self-Check Trio
1️⃣ **Check the adapter connection** — Is NapCat or another adapter started and connected to MaiBot
2️⃣ **Verify account credentials** — Confirm the QQ number logged into the adapter is healthy and not banned or offline
3️⃣ **Check adapter logs** — Look for adapter-related records in the WebUI log panel or terminal

#### Solutions

**Step 1: Confirm the Adapter Is Connected**
In 1.3.1, platform accounts are maintained on the adapter side and are not filled into `bot_config.toml`. First confirm that NapCat (or another adapter) is started and connected to MaiBot according to the [Adapters](/en/manual/adapters/) documentation.

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

#### Prevention Tips
- **Use a secondary account** — Avoid the risk of your main account being banned
- **Check adapter status regularly** — Re-login promptly after it goes offline
- **Keep adapters updated** — An outdated adapter version may fail to connect to a newer MaiBot

---

### Scenario 14: Invalid Regular Expression

#### Error Symptoms
- Startup or saving configuration reports `re.error: bad escape` etc.
- Log prompts `Invalid regex pattern` or `正则表达式编译失败`
- Keyword rules / message filtering don't work
- Configuration page shows "Save failed: regex syntax error"

#### Quick Self-Check Trio
1️⃣ **Check special character escaping** — Whether `\.` `\*` `\+` etc. special characters have backslashes
2️⃣ **Check bracket matching** — Whether `()` `[]` `{}` are properly paired
3️⃣ **Use online tool to test** — Verify the regex with regex101.com

#### Solutions

**Method 1: Use Online Regex Testing Tool**
```text
# Visit https://regex101.com/
# 1. Enter your regex pattern on the left
# 2. Enter test text below
# 3. Check if there are errors and adjust
```

**Method 2: Escape Special Characters**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Error example: not escaped
ban_msgs_regex = ["\d{17}[\dXx"]  # Square brackets not closed

# Correct example: escaped and closed
ban_msgs_regex = [
    "\\d{17}[\\dXx]",            # ID number (double backslash required in TOML)
    "1[3-9]\\d{9}",              # Phone number
    "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",  # Email
]
```

:::

**Method 3: Use Plain Strings Instead of Regex**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# If complex matching isn't needed, plain strings are safer
ban_words = ["广告", "加微信", "兼职"]  # Simple keywords, no regex needed

# Avoid writing complex regexes
# ban_msgs_regex = ["(今天 | 明天 | 后天).*(天气 | 气温)"]  # Error-prone
# Use keyword matching instead
ban_words = ["天气", "气温", "温度"]
```

:::

> 💡 **Tip**: Regex in TOML files requires double backslashes `\\` for escaping because `\` itself is a TOML escape character.

#### Prevention Tips
- **Prefer keyword matching** — Simple scenarios don't need regex
- **Test complex regex separately** — Validate on regex101.com first before putting it into config
- **Add explanatory comments** — Add comments next to regex to describe what it matches, making maintenance easier

---

### Scenario 15: Keyword Rule Configuration Error

#### Error Symptoms
- Message matches the wrong reply rule
- Rule doesn't take effect at all, bot doesn't reply
- Priority conflicts, high-priority rules override low-priority ones
- Mixed Chinese/English punctuation causing matching failure

#### Quick Self-Check Trio
1️⃣ **Check rule priority** — Higher `priority` rules override lower ones
2️⃣ **Confirm rule is enabled** — Is `enabled = true` set?
3️⃣ **Test punctuation** — Full-width / half-width symbol differences can affect matching

#### Solutions

**Step 1: Check Keyword Rule Configuration**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Edit config/bot_config.toml
[keyword_reaction]

# Pure keyword rules
[[keyword_reaction.keyword_rules]]
keywords = ["你好", "hello", "嗨"]
regex = []
reaction = "你好呀！有什么可以帮你的吗？"
priority = 10                    # Priority, higher number = higher priority
enabled = true                   # Ensure rule is enabled

# Pure regex rules
[[keyword_reaction.regex_rules]]
keywords = []
regex = ["(早安 | 早上好 | 早 [上啊].*)"]
reaction = "早上好！今天又是美好的一天~"
priority = 20
enabled = true

# Keyword + regex mixed rules
[[keyword_reaction.keyword_rules]]
keywords = ["天气"]
regex = ["(今天 | 明天 | 后天).*(天气 | 气温 | 温度)"]
reaction = "让我看看天气预报..."
priority = 15
enabled = true
```

:::

**Step 2: Adjust Priorities**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Priority examples:
# priority = 30 — Highest priority (exact match)
# priority = 20 — Medium priority (regex match)
# priority = 10 — Default priority (normal keywords)
# priority = 1  — Lowest priority (fallback rule)

# Ensure important rules have higher priority than general rules
[[keyword_reaction.keyword_rules]]
keywords = ["帮助", "help"]
reaction = "我可以帮你..."
priority = 30                    # High priority, ensure preferential matching

[[keyword_reaction.keyword_rules]]
keywords = ["吗", "呢", "吧"]     # General question words, lower priority
reaction = "这个嘛..."
priority = 5
```

:::

**Step 3: Test Punctuation Differences**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Full-width punctuation (Chinese input method)
keywords = ["你好，", "你好，"]   # Different commas

# Half-width punctuation (English input method)
keywords = ["hello,", "hello!"]

# Recommended to configure both types of punctuation
keywords = ["你好，", "你好，", "hello", "hello!"]
```

:::

#### Prevention Tips
- **Add comments to rules** — Comment the purpose next to each rule
- **Hierarchical priority management** — Exact match > Regex match > Normal keywords > Fallback rule
- **Test rules regularly** — Send test messages in the group to verify matching
- **Use debug mode** — Enable `DEBUG` logging to see the actual matching chain

---

### Scenario 16: Git Operation Failed (WebUI)

#### Error Symptoms
- Knowledge base sync / Git mirror operation fails in WebUI
- Log shows `Git clone failed` or `Permission denied`
- SSH Key verification fails with `Host key verification failed`
- Git LFS files are too large causing timeout

#### Quick Self-Check Trio
1️⃣ **First check network** — Can you access GitHub/Gitee?
2️⃣ **Try a public repository** — Does a repo that doesn't require login work?
3️⃣ **Is the repository too large?** — Large files can cause timeout

#### Solutions

**Step 1: Confirm Network Connectivity**
Check if you can open GitHub or Gitee websites. If not, there's a network issue — resolve that first.

**Step 2: Try a Repository That Doesn't Require Login**
If you get a permission error (Permission denied), try a public repository (one that doesn't need SSH Key) in WebUI. If the public repository syncs normally, it's an SSH permission configuration issue — check your SSH Key settings on GitHub/Gitee.

**Step 3: Adjust Git Timeout**
Git mirror sources are maintained in WebUI's "Git Mirror" page, and settings such as the timeout are configured together with each mirror source — not in `bot_config.toml`. For large repositories, increase the timeout for that mirror source in WebUI, or exclude the large files/directories you don't need synced.

#### Prevention Tips
- **Test with a public repository first** — Switch to a private repo only after confirming sync works
- **Avoid large files** — Don't put large binary files in the repository

---

### Scenario 17: Log Files Too Large / Disk Space Full

#### Error Symptoms
- System running slowly or crashing
- Log rotation fails with `No space left on device`
- Disk usage 100%, cannot write new files
- MaiBot startup fails, prompting database locked or write failure

#### Quick Self-Check Trio
1️⃣ **Check disk space** — Open file manager to see how much space is left
2️⃣ **Check log file size** — See how large the `logs/` folder is
3️⃣ **Check log level** — `DEBUG` level generates a large amount of logs

#### Solutions

**Step 1: Clean Up Log Files**
Open the `logs/` folder and delete unneeded old log files. Generally, only the last few days of logs need to be kept — previous ones can be deleted directly.

**Step 2: Configure Log Rotation**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Edit config/bot_config.toml
[log]
log_level = "INFO"             # Global log level; use INFO for production, DEBUG for debugging
log_file_max_bytes = 10485760  # Rotate once a single log file exceeds 10MB
max_log_files = 30             # Maximum number of main log files to retain
log_cleanup_days = 30          # Automatically clean up log files older than this many days
```

:::

Log rotation and cleanup are enabled by default; adjust these three values to control size and retention. For finer tuning, see [Logging & Monitoring](/develop/observability).

**Step 3: Clean Up Other Junk Files**
- Docker users: Clean up unused images and containers to free space
- Check `~/.cache/` directory, delete any unneeded cache files

**Step 4: If Still Not Working, Use a Different Drive**
If the current disk is indeed too small, consider moving MaiBot's logs and data directories to a larger disk.

#### Prevention Tips
- **Use INFO level in production** — Avoid excessive DEBUG logs
- **Configure log rotation** — Limit log file size and count
- **Regular cleanup** — Set up crontab to automatically clean old logs weekly
- **Mount to separate disk** — Mount the log directory to a separate disk partition
- **Monitor disk space** — Set up alerts, notify when usage exceeds 80%

---

## ⚪ Low Frequency Errors (Rare)

Covers scenarios 18–19, problems rarely encountered but may appear in special operations.

### Scenario 18: Person/User System Data Anomaly

#### Error Symptoms
- User profile loading fails in WebUI, shows blank or error
- Character card information lost, previously set personality/background is gone
- When binding accounts, prompts "User already exists" or "Foreign key constraint failed"

#### Quick Self-Check Trio
1️⃣ Did you directly modify the SQLite database file?
2️⃣ Is the JSON format of character cards in `data/persons/` folder correct?
3️⃣ Are there multiple MaiBot instances accessing the same database simultaneously?

#### Solutions
**Rebuild the Person Index**
When character card information is abnormal, first refresh or rebuild the index in WebUI's person/user management page; 1.3.1 has no standalone command-line rebuild tool.

**Check Character Card Format**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Enter the character card directory
cd data/persons/

# Validate JSON format (using a character as an example)
python -m json.tool "character-name.json" > /dev/null
```

:::

**Repair Database (Proceed with Caution)**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Backup database
cp data/MaiBot.db data/MaiBot.db.bak

# Use WebUI to manage users, do not operate on the database directly
```

:::

#### Prevention Tips
- 🖥️ **Use WebUI for management** — Don't modify the database file directly
- 💾 **Back up regularly** — `data/persons/` and `data/MaiBot.db` are important
- 🔒 **Avoid concurrent access** — Don't start multiple MaiBot instances connecting to the same database

---

### Scenario 19: Adapter WebSocket Disconnect Reconnect Loop

#### Error Symptoms
Adapter logs continuously:
```
[WebSocket] Connection closed, reconnecting...
[WebSocket] Reconnecting in 3s...
[WebSocket] Connection established
[WebSocket] Connection closed, reconnecting...
```
Message sending and receiving is unstable, sometimes works and sometimes doesn't.

#### Quick Self-Check Trio
1️⃣ Is the MaiBot address and port filled into the adapter correct? The legacy WebSocket service on the MaiBot side defaults to port `8000` (`[maim_message].ws_server_port`)
2️⃣ Is the network stable? (Between server and adapter)
3️⃣ Is the MaiBot process running normally? Does the terminal report port conflicts or startup failures?

#### Solutions
**Confirm the Connection Address on the MaiBot Side**
The WebSocket address in the adapter (e.g. NapCat) is maintained by the adapter's own configuration file, not in `bot_config.toml`. It connects to MaiBot's `8000` port by default:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Only needed if you actually enabled the legacy maim_message WebSocket service
[maim_message]
ws_server_port = 8000
```

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
Check MaiBot's terminal output to confirm the process is running normally and the port isn't occupied (see Scenario 3 for port conflicts). The legacy WebSocket service's listening port is controlled by `[maim_message].ws_server_port` (default `8000`), and changing it requires restarting MaiBot.

**Enable Heartbeat Keepalive (Advanced)**
If the network environment is poor, enable WebSocket heartbeat keepalive on the adapter side — refer to your adapter's documentation for the exact fields.

#### Prevention Tips
- 🌐 **Ensure network stability** — The network between server and adapter should be reliable
- 🔔 **Enable heartbeat detection** — Recommended for long connections to keep alive
- 📊 **Monitor logs** — Investigate promptly if frequent reconnection is detected
- 🔄 **Consider using process management** — systemd/supervisor can automatically restart services

---

## ⚡ Error Code Quick Reference

> Quickly locate the corresponding scenario by common keywords in error logs.

<!-- TASK_8_CONTENT_START -->

### HTTP Status Code Quick Reference

**HTTP 400 Bad Request** 🟧 Severe → [Scenario 13: Adapter Not Connected or Account Unavailable](#scenario-13-adapter-not-connected-or-account-unavailable) — Request parameter error, message sending failed

**HTTP 401 Unauthorized** 🟥 Fatal → [Scenario 2: API Key Error / Insufficient Balance](#scenario-2-api-key-error-insufficient-balance) — API Key invalid or missing

**HTTP 401 Unauthorized** 🟧 Severe → [Scenario 12: WebUI Login Failed / Token Expired](#scenario-12-webui-login-failed-token-expired) — Session expired or Token invalid

**HTTP 402 Payment Required** 🟧 Severe → [Scenario 2: API Key Error / Insufficient Balance](#scenario-2-api-key-error-insufficient-balance) — Account balance insufficient

**HTTP 403 Forbidden** 🟥 Fatal → [Scenario 2: API Key Error / Insufficient Balance](#scenario-2-api-key-error-insufficient-balance) — API Key insufficient permissions

**HTTP 429 Too Many Requests** 🟧 Severe → [Scenario 9: Network Timeout / Connection Failure](#scenario-9-network-timeout-connection-failure) — Request frequency too high, rate limited

**HTTP 500 Internal Server Error** 🟧 Severe → [Scenario 9: Network Timeout / Connection Failure](#scenario-9-network-timeout-connection-failure) — API server internal error

**HTTP 502 Bad Gateway** 🟧 Severe → [Scenario 9: Network Timeout / Connection Failure](#scenario-9-network-timeout-connection-failure) — Gateway error, upstream service unreachable

**HTTP 503 Service Unavailable** 🟧 Severe → [Scenario 9: Network Timeout / Connection Failure](#scenario-9-network-timeout-connection-failure) — Service temporarily unavailable (overload/maintenance)

### Common Error Keyword Index

**`Address already in use`** / **`[Errno 98]`** / **`[Errno 10048]`** 🟧 Severe → [Scenario 3: Port Occupied](#scenario-3-port-occupied) — Port is already in use by another process

**`APIConnectionError`** 🟧 Severe → [Scenario 9: Network Timeout / Connection Failure](#scenario-9-network-timeout-connection-failure) — API connection failed

**`Connection refused`** / **`无法访问此网站`** 🟥 Fatal → [Scenario 4: WebUI Page Won't Open](#scenario-4-webui-page-won-t-open) — WebUI service not started or port unreachable

**`database is locked`** 🟧 Severe → [Scenario 8: Database Error](#scenario-8-database-error) — Database locked by multiple processes

**`DatabaseError`** / **`OperationalError`** 🟧 Severe → [Scenario 8: Database Error](#scenario-8-database-error) — Database operation exception

**`FileNotFoundError`** 🟥 Fatal → [Scenario 1: Configuration File Not Found or Incorrect Format](#scenario-1-configuration-file-not-found-or-incorrect-format) — Configuration file does not exist

**`Host version incompatible`** / **`SDK version incompatible`** 🟧 Severe → [Scenario 7: Plugin Loading Failed](#scenario-7-plugin-loading-failed) — The plugin's declared version range does not cover the current version

**`ImportError`** / **`ModuleNotFoundError`** 🟧 Severe → [Scenario 7: Plugin Loading Failed](#scenario-7-plugin-loading-failed) — Plugin dependency missing

**`No space left on device`** 🟧 Severe → [Scenario 17: Log Files Too Large / Disk Space Full](#scenario-17-log-files-too-large-disk-space-full) — Disk space insufficient

**`PluginConfigVersionError`** 🟧 Severe → [Scenario 7: Plugin Loading Failed](#scenario-7-plugin-loading-failed) — Plugin configuration version not supported

**`re.error`** / **`bad escape`** 🟨 Warning → [Scenario 14: Invalid Regular Expression](#scenario-14-invalid-regular-expression) — Regex syntax error

**`TimeoutError`** 🟧 Severe → [Scenario 9: Network Timeout / Connection Failure](#scenario-9-network-timeout-connection-failure) — Request timeout

**`Token expired`** 🟨 Warning → [Scenario 12: WebUI Login Failed / Token Expired](#scenario-12-webui-login-failed-token-expired) — Login session expired

**`TOML syntax error`** 🟥 Fatal → [Scenario 1: Configuration File Not Found or Incorrect Format](#scenario-1-configuration-file-not-found-or-incorrect-format) — Configuration file format error

**`ValueError`** 🟥 Fatal → [Scenario 5: MCP Configuration Error](#scenario-5-mcp-configuration-error) — MCP server configuration parameter invalid

**Emoji registration failed** 🟨 Warning → [Scenario 10: Emoji System Error](#scenario-10-emoji-system-error) — Quantity limit exceeded or `data/emojis/` is unwritable

**Memory loading failed** 🟧 Severe → [Scenario 11: Memory System Error](#scenario-11-memory-system-error) — Memory index corrupted or memory directory unwritable

**`Session 过期`** 🟨 Warning → [Scenario 12: WebUI Login Failed / Token Expired](#scenario-12-webui-login-failed-token-expired) — Browser session expired

<!-- TASK_8_CONTENT_END -->

---

## 🆘 Getting Help Guide

<!-- TASK_9_CONTENT_START -->

### 🤔 Self-Check Before Asking

Before asking for help, take 2 minutes to do the following checks — most problems can be resolved on your own:

**`📖 1. Consult the Official Documentation`**
: Your problem has likely already been answered in various scenarios of this document. Search through it first — it saves time and effort.

**`🔍 2. Check the Error Logs`**
: The logs will specify the specific error cause and stack trace — this is the primary clue for locating the problem. Don't know how to export them? See "How to Get Logs" below.

**`⚙️ 3. Review Recent Changes`**
: Think back to what configuration you recently changed, what plugins you installed, or what versions you updated. Try reverting to the last working state to confirm if something was changed incorrectly.

**`🌐 4. Search Known Issues`**
: Use error keywords to search [GitHub Issues](https://github.com/Mai-with-u/docs/issues) or search engines to see if others have encountered the same problem.

### 📋 Information Checklist for Submitting an Issue

When submitting an Issue on GitHub, please be sure to include the following information. Issues missing key information may be delayed:

**`🖥️ System and Environment`**
: Operating system type and version, deployment method (source/Docker), Python version (for source deployment)

**`🔢 MaiBot Version`**
: Run `git log --oneline -1` to view the current commit, or get the version number from the bottom of WebUI

**`📄 Complete Error Logs`**
: Log snippets containing the stack trace (traceback) — don't just screenshot a small portion. See "How to Get Logs" below

**`⚙️ Related Configuration`**
: Configuration content related to the problem (be sure to redact sensitive information like API Keys)

**`🎯 Reproduction Steps`**
: Specific steps from startup to error occurrence — the more detailed, the better

### 🌐 Community Support Channels

**`💬 QQ Group`**
: Join the MaiBot user community to exchange experiences with other users. Group number: `[Please fill in group number]`

**`🐱 GitHub Issues`**
: If you've confirmed it's a bug or feature suggestion, please submit at [GitHub Issues](https://github.com/Mai-with-u/docs/issues). Remember to search first to avoid duplicates

**`📖 Official Documentation Site`**
: For the latest and most comprehensive documentation, visit [MaiBot Documentation Site](https://docs.mai-mai.org/)

**`💬 GitHub Discussions`**
: For feature discussions and technical questions, visit [GitHub Discussions](https://github.com/Mai-with-u/docs/discussions) to join the community conversation

### 📝 How to Get Logs

Depending on your deployment method, the way to get logs differs:

**`🐍 Source Deployment`**
: The terminal output where MaiBot is running is the most direct log. If the terminal has been closed, check the log files as follows:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# View the latest log file (JSONL format, one entry per line)
cat logs/$(ls -t logs/app_*.log.jsonl | head -1)
```

:::

If you need more detailed logs, enable DEBUG level in `config/bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[log]
log_level = "DEBUG"
```

:::

**`🐳 Docker Deployment`**
: Use the `docker logs` command to view container logs:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# View all logs
docker logs maibot

# Continuously follow log output
docker logs -f maibot

# View only the last 100 lines
docker logs --tail 100 maibot
```

:::

**`🪟 Windows Deployment`**
: Log files are located in the `logs\` directory by default:

::: code-group

```powershell [PowerShell ~vscode-icons:file-type-powershell~]
# View the latest log file (JSONL format, one entry per line)
type logs\app_*.log.jsonl

# Or using PowerShell
Get-ChildItem logs\app_*.log.jsonl | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content
```

:::

> 💡 **Tip**: After getting the logs, wrap them in a ` ``` ` code block and paste them into the Issue. If the logs are very long, only include the section from the last startup to the error — don't paste thousands of lines of complete logs.

<!-- TASK_9_CONTENT_END -->

---

## 📋 Error Troubleshooting Flowchart

> Not sure which category your problem falls into? Follow the flowchart to find the corresponding section.

<!-- TASK_FLOWCHART_START -->

```mermaid
graph TD
    A[❓ What's the problem?] --> B{Crashes/exits on startup?}
    B -->|Yes| C[🔴 Extremely High Frequency Errors]
    B -->|No| D{Starts normally but functions abnormal?}
    D -->|Yes| E{Which function?}
    E -->|No message reply| F[Scenario 6: Bot Not Replying]
    E -->|Emojis| G[Scenario 10: Emoji System]
    E -->|Memory/Knowledge| H[Scenario 11: Memory System]
    E -->|Plugins| I[Scenario 7: Plugin Loading]
    D -->|No| J{WebUI related?}
    J -->|Yes| K{Can WebUI be accessed?}
    K -->|Can't access| L[Scenario 4: WebUI Page Won't Open]
    K -->|Can access but login fails| M[🟢 Medium Frequency Errors]
    J -->|No| N{Platform message send/receive?}
    N -->|Yes| O{Specific symptoms?}
    O -->|Can't send messages| P[Scenario 13: Adapter/Account]
    O -->|Frequent disconnection| Q[Scenario 19: Adapter Reconnection]
    N -->|No| R{Runtime performance/storage?}
    R -->|Yes| S[Scenario 17: Disk Full]
    R -->|No| T[⚪ Low Frequency Errors]

    click C "scenario-1"
    click F "scenario-6"
    click G "scenario-10"
    click H "scenario-11"
    click I "scenario-7"
    click L "scenario-4"
    click M "scenario-12"
    click P "scenario-13"
    click Q "scenario-19"
    click S "scenario-17"
```

<!-- TASK_FLOWCHART_END -->


