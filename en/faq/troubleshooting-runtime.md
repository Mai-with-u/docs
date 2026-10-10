---
title: Runtime and Data Troubleshooting
---

# Runtime and Data Troubleshooting

This page covers runtime anomalies and data problems: the bot not replying to messages, database errors, emoji system errors, memory system errors, oversized log files and a full disk, and person or user system data anomalies.

## Bot Not Replying to Messages

### Error Symptoms
- Message has been sent to the platform (QQ group / private chat)
- Bot has no response at all
- No errors in logs, but still no reply

### Quick Self-Check Trio
1️⃣ Check the backend terminal output — did it show a message received prompt?
2️⃣ Was a rule matched? Check if keyword/intent rules cover this message
3️⃣ Is the LLM configuration correct? Confirm API Key and model configuration are correct (refer to [API Key Error / Insufficient Balance](/en/faq/troubleshooting-model#api-key-error-insufficient-balance))

### Solutions

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

### Prevention Tips
- 📊 **Monitor logs** — Regularly check logs, handle anomalies promptly
- 🧪 **Test new rules** — Test whether a rule works after adding it
- 📝 **Document configuration changes** — Record changes after modifying reply rules

## Database Error

### Error Symptoms
- Runtime reports `DatabaseError` or `OperationalError`
- Startup prompts database migration failed
- Log shows `database is locked` or `disk I/O error`

### Quick Self-Check Trio
1️⃣ Check if multiple MaiBot instances are running simultaneously connecting to the same database
2️⃣ Check if disk space is full (open file manager to check)
3️⃣ Confirm `data/MaiBot.db` file permissions are correct (readable and writable)

### Solutions

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

### Prevention Tips
- Avoid running multiple MaiBot instances simultaneously connecting to the same database file
- Regularly back up `data/MaiBot.db` (recommended weekly)
- Configure log rotation to prevent log files from filling up the disk

## Emoji System Error

### Error Symptoms
- Sending emoji commands has no effect
- Emoji registration fails, logs report exceeding the quantity limit
- Emoji registration fails because the `data/emojis/` directory is unwritable

### Quick Self-Check Trio
1️⃣ Check whether `[emoji]`'s `content_filtration` is filtering too aggressively
2️⃣ Confirm whether `[emoji]`'s `emoji_send_num` / `max_reg_num` are set too low
3️⃣ Ensure `data/emojis/` directory is writable (correct permissions)

### Solutions

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

### Prevention Tips
- Enable `content_filtration` cautiously to avoid false filtering of normal emojis
- Regularly clean the `data/emojis/` directory, remove unused emojis
- Set a reasonable `max_reg_num` to avoid taking up too much storage space

## Memory System Error

### Error Symptoms
- Bot replies "I don't remember" or "No relevant information found"
- Log reports long-term memory loading failed
- Memory added but cannot be retrieved

### Quick Self-Check Trio
1️⃣ Run the index rebuild in WebUI's "Memory" page (paragraph and vector each have their own entry)
2️⃣ Check whether the `data/a-memorix/` directory is writable and intact
3️⃣ Confirm `plugin.enabled` under `[a_memorix]` is `true`

### Solutions

**Step 1: Rebuild Memory Index**

Both the paragraph index and the vector index of long-term memory are rebuilt in WebUI's "Memory" page. Open WebUI → Memory page and run the corresponding rebuild entry as prompted.

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

### Prevention Tips
- Periodically check memory index status in WebUI and rebuild promptly when retrieval fails
- Back up the `data/a-memorix/` directory — it's the only storage location for long-term memory
- Use WebUI's memory management features; don't manually edit files inside `data/a-memorix/`

## Log Files Too Large / Disk Space Full

### Error Symptoms
- System running slowly or crashing
- Log rotation fails with `No space left on device`
- Disk usage 100%, cannot write new files
- MaiBot startup fails, prompting database locked or write failure

### Quick Self-Check Trio
1️⃣ **Check disk space** — Open file manager to see how much space is left
2️⃣ **Check log file size** — See how large the `logs/` folder is
3️⃣ **Check log level** — `DEBUG` level generates a large amount of logs

### Solutions

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

Log rotation and cleanup are enabled by default; adjust these three values to control size and retention. For finer tuning, see [Bot Configuration · Logging](../manual/configuration/bot-config.md#logging).

**Step 3: Clean Up Other Junk Files**
- Docker users: Clean up unused images and containers to free space
- Check `~/.cache/` directory, delete any unneeded cache files

**Step 4: If Still Not Working, Use a Different Drive**
If the current disk is indeed too small, consider moving MaiBot's logs and data directories to a larger disk.

### Prevention Tips
- **Use INFO level in production** — Avoid excessive DEBUG logs
- **Configure log rotation** — Limit log file size and count
- **Regular cleanup** — Set up crontab to automatically clean old logs weekly
- **Mount to separate disk** — Mount the log directory to a separate disk partition
- **Monitor disk space** — Set up alerts, notify when usage exceeds 80%

## Person/User System Data Anomaly

### Error Symptoms
- User profile loading fails in WebUI, shows blank or error
- Character card information lost, previously set personality/background is gone
- When binding accounts, prompts "User already exists" or "Foreign key constraint failed"

### Quick Self-Check Trio
1️⃣ Did you directly modify the SQLite database file?
2️⃣ Is the JSON format of character cards in `data/persons/` folder correct?
3️⃣ Are there multiple MaiBot instances accessing the same database simultaneously?

### Solutions
**Rebuild the Person Index**
When character card information is abnormal, first refresh or rebuild the index in WebUI's person/user management page.

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

### Prevention Tips
- 🖥️ **Use WebUI for management** — Don't modify the database file directly
- 💾 **Back up regularly** — `data/persons/` and `data/MaiBot.db` are important
- 🔒 **Avoid concurrent access** — Don't start multiple MaiBot instances connecting to the same database

## Related

- [Error Troubleshooting Overview](/en/faq/error-troubleshooting) — error code quick reference, keyword index, and the troubleshooting flowchart.
- [Startup and Access Troubleshooting](/en/faq/troubleshooting-startup) — configuration files, MCP, ports, and WebUI access or login.
- [Model and Rule Troubleshooting](/en/faq/troubleshooting-model) — API keys, network timeouts, regular expressions, and keyword rules.
- [Plugin and Adapter Troubleshooting](/en/faq/troubleshooting-plugins-adapters) — plugin loading failures, adapter connections, and reconnects.
- [Getting Help](/en/faq/getting-help) — self-checks before asking, the issue checklist, and how to export logs.
