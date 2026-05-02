---
title: FAQ
---

# FAQ

This document summarizes common problems and solutions during MaiBot usage, organized by category, each containing symptoms, causes, and solution steps.

## Startup Issues

### EULA Not Confirmed on Startup

**Symptom**: MaiBot exits immediately after startup, console outputs agreement confirmation prompt, program won't continue initialization.

**Cause**: First use or after EULA/privacy agreement update, MaiBot requires users to explicitly agree to agreement content. System calculates MD5 hash values of `EULA.md` and `PRIVACY.md`, compares with records in `eula.confirmed` and `privacy.confirmed` files.

**Solution**:
1. Run `uv run python bot.py`, input `同意` or `confirmed` in console prompt to confirm agreement
2. After confirmation, generates `eula.confirmed` and `privacy.confirmed` files in project root directory
3. Can also skip confirmation through environment variables: set `EULA_AGREE` and `PRIVACY_AGREE` to corresponding file MD5 hash values
4. First access through WebUI, setup wizard will also guide through EULA confirmation

### Configuration File Not Found / config Directory Doesn't Exist

**Symptom**: Startup error prompts `bot_config.toml` or `model_config.toml` doesn't exist, or cannot create configuration directory.

**Cause**: MaiBot's configuration files are located in `config/` directory, will automatically create this directory on first startup. If directory permissions are insufficient or path is abnormal, configuration files cannot be loaded.

**Solution**:
1. Confirm `config/` directory exists in project root directory, MaiBot will automatically create it at startup (`CONFIG_DIR.mkdir(parents=True, exist_ok=True)`)
2. Configuration file paths are `config/bot_config.toml` and `config/model_config.toml`
3. MaiBot will automatically generate default configuration files on first startup
4. If automatic generation fails, check directory write permissions

### Python Version Incompatibility

**Symptom**: Startup error prompts syntax error (like `match` statement error), module missing or `TypeError`.

**Cause**: MaiBot requires Python 3.10 or higher (project Badge shows `Python-3.10+`), lower Python versions don't support `match-case` syntax and some type annotation features.

**Solution**:
1. Use `python --version` to check current version, ensure >= 3.10
2. Recommended to use `uv` to manage dependencies and Python version:
   ```bash
   uv sync
   uv run python bot.py
   ```
3. If using system Python, please upgrade or use tools like `pyenv` to manage multiple versions

### Runner/Worker Process Startup Exception

**Symptom**: Program exits immediately after startup, or repeatedly restarts in Runner process.

**Cause**: MaiBot uses Runner (daemon process) + Worker (work process) architecture. Runner process starts Worker through `subprocess.Popen`, if Worker startup fails it will repeatedly retry. When Worker exit code is 42 (`RESTART_EXIT_CODE`), Runner will automatically restart.

**Solution**:
1. View specific error information output to console
2. If Worker exits due to configuration error, Runner will automatically restart after fixing
3. Use `Ctrl+C` to stop Runner process

## Configuration Issues

### Model Unavailable / API Call Failed

**Symptom**: Maimai cannot reply to messages, logs show model call errors (like connection timeout, 401, 403, etc.).

**Cause**: API configuration in `model_config.toml` is incorrect, or API service is unavailable.

**Solution**:
1. Check `[[api_providers]]` configuration in `model_config.toml`, confirm API address (`base_url`) and key (`api_key`) are correct
2. Confirm `api_key` is valid and has sufficient call quota
3. Check network connection, ensure model API endpoint is accessible
4. Confirm `api_provider` name referenced in `[[models]]` configuration matches `name` in `[[api_providers]]`
5. Model configuration loading will validate: `api_providers` cannot be empty, names cannot duplicate, each model's `api_provider` must exist
6. Check model configuration for validation errors in WebUI configuration management page

### API Key Error

**Symptom**: Logs show 401 or 403 errors.

**Cause**: API key is invalid, expired or has insufficient permissions.

**Solution**:
1. Confirm API Key has no extra spaces or line breaks
2. Check if API Key has expired or been revoked
3. Confirm API Key has access permissions for corresponding models
4. Note `api_key` field in `model_config.toml` is sensitive information (`repr=False`), don't leak to public network

### Configuration File Format Error

**Symptom**: Startup reports `TypeError` or `ValueError`, prompts configuration parsing failed.

**Cause**: Manual editing of TOML files introduced syntax errors, or configuration item types don't match.

**Solution**:
1. MaiBot uses `tomlkit` to parse TOML files, has strict format requirements
2. Modifying configuration through WebUI will automatically save in correct format, recommended to use WebUI modification
3. When manually editing note: strings need quotes, numbers don't need quotes, booleans use `true/false`
4. If configuration file version doesn't match current version, MaiBot will automatically update configuration and backup old files to `config/old/` directory
5. Configuration files must contain `[inner]` section and `version` field

### Configuration Changes Not Taking Effect

**Symptom**: Modified configuration but behavior hasn't changed.

**Cause**: Some configuration modifications require restart, some support hot reload.

**Solution**:
1. MaiBot has built-in file watcher (`FileWatcher`), will automatically hot reload after modifying `bot_config.toml` or `model_config.toml`
2. Hot reload has debounce mechanism (600ms), frequent modifications will wait for stability before reloading
3. If hot reload times out (20 seconds) or continuously fails, manual restart is needed
4. Some deep configurations (like database path, port binding) require restart to take effect

## Connection Issues

### NapCat WebSocket Connection Failed

**Symptom**: NapCat cannot connect to adapter/MaiBot, or connection frequently drops.

**Cause**: NapCat and adapter/MaiBot WebSocket configurations don't match, depending on running mode.

**Solution**:
1. Confirm `platform` in `[bot]` section of `bot_config.toml` is set to `"qq"`
2. Confirm `qq_account` matches NapCat login QQ number
3. **Plugin Mode**: Check adapter's `napcat_server.host` and `napcat_server.port` settings. Adapter connects to NapCat's Forward WebSocket server (typically `ws://127.0.0.1:3001`). Verify NapCat has Forward WebSocket server enabled on the correct port.
4. **Standalone Mode**: Check adapter's `napcat_server.host` and `napcat_server.port` (default `localhost:8095`). NapCat should connect to the adapter via Reverse WebSocket at `ws://127.0.0.1:8095`. Also verify the adapter's `maibot_server.port` matches MaiBot's `[maim_message].ws_server_port` in `config/bot_config.toml` (default `8000`).
5. Confirm firewall doesn't block WebSocket connection
6. Check if NapCat version is compatible with current MaiBot version
7. View NapCat, adapter, and MaiBot logs for specific connection error information

### Port Occupied

**Symptom**: Startup prompts port binding error (`OSError: [Errno 98] Address already in use`).

**Cause**: MaiBot used ports conflict with other services in system.

**Solution**:
1. Message server port: modify `ws_server_port` in `[maim_message]` section (default 8080)
2. WebUI port: modify `port` in `[webui]` section (default 8001)
3. API Server port: modify `api_server_port` in `[maim_message]` section (default 8090)
4. Find and close processes occupying ports:
   ```bash
   # Linux/macOS
   lsof -i :8080
   # Windows
   netstat -ano | findstr :8080
   ```
5. MaiBot will automatically detect if ports are available at startup, and prompt corresponding configuration item locations

### Message Send/Receive Exception

**Symptom**: Can receive messages but cannot send, or vice versa.

**Cause**: Platform IO routing configuration or NapCat permission issues.

**Solution**:
1. Check robot permissions in group chat (whether muted)
2. Confirm NapCat login status is normal (not disconnected or frozen)
3. View Platform IO routing parsing logs in MaiBot logs
4. Check if multiple instances are simultaneously connecting to same QQ number
5. Check MaiBot logs for any message sending errors

## Runtime Issues

### Database Error / Database Locked

**Symptom**: MaiBot reports `database is locked` or other SQLite errors.

**Cause**: SQLite doesn't support multi-process concurrent writes, multiple instances simultaneously accessing same database will conflict.

**Solution**:
1. Confirm no other MaiBot processes are running simultaneously
2. Ensure only one instance accesses database file
3. If lock files remain due to unexpected exit, delete `.lock` files or `-wal` files in `data/` directory
4. Database configuration is in `[database]` section, `save_binary_data` controls whether to save voice and other binary data as separate files

### High Memory Usage

**Symptom**: MaiBot memory keeps growing after running for a while.

**Cause**: Chat context, long-term memory index, embedding vectors and other data will occupy memory.

**Solution**:
1. Adjust `max_context_size` in `[chat]` section (default 30), reduce context length
2. Adjust `[memory]` related configurations, reduce memory retrieval range
3. If `[webui]`'s `enable_paragraph_content` (knowledge graph paragraph full content) is enabled, will additionally increase memory usage, recommended to enable only when needed
4. Plugins will start subprocesses when running, each plugin has independent memory space, pay attention to controlling plugin count

### Large Reply Delay

**Symptom**: Message response time is too long.

**Cause**: Model API delay, context too long, multiple tasks processed serially, etc.

**Solution**:
1. Check model API response speed, choose service providers with lower latency
2. Appropriately reduce `max_context_size` in `[chat]` section
3. Check if there's additional delay caused by MCP tool calls (timeout settings in `[mcp]` configuration)
4. Adjust `planner_interrupt_max_consecutive_count` in `[chat]` section, avoid Planner being frequently interrupted
5. View time consumption of each step in logs to locate bottlenecks

## WebUI Issues

### WebUI Cannot Be Accessed

**Symptom**: Browser cannot open WebUI page.

**Cause**: WebUI not enabled, network configuration error or security policy restrictions.

**Solution**:
1. Confirm WebUI is enabled (`enabled = true` in `[webui]` section of `bot_config.toml`)
2. Check if access address is correct (default `http://127.0.0.1:8001`)
3. If binding is `0.0.0.0`, ensure firewall allows external access
4. Check if IP whitelist is enabled (`allowed_ips` configuration, default `127.0.0.1`), confirm client IP is in whitelist
5. If strict anti-crawler mode is enabled (`anti_crawler_mode`), confirm browser UA is not in block list
6. WebUI's `mode` supports `development` and `production`, production environment should use `production`

### Token Authentication Failed / Forgot Token

**Symptom**: Cannot login to WebUI, prompts Token invalid or not found.

**Cause**: Token is saved in `data/webui.json`, generated at first startup.

**Solution**:
1. Token is generated at first startup and output to console, view startup logs
2. Token is saved in `data/webui.json` file, can directly read
3. If still cannot obtain, delete `data/webui.json` and restart MaiBot, system will regenerate Token
4. Note: deleting `webui.json` will reset authentication status and first setup flag

### WebUI Port Binding Failed

**Symptom**: WebUI startup fails, logs prompt port binding error.

**Cause**: 8001 port is occupied by other services.

**Solution**:
1. Modify `port` in `[webui]` section of `bot_config.toml` to other port
2. Find and close processes occupying 8001 port
3. If using reverse proxy, ensure frontend configuration points to correct port
4. WebUI default binding is `127.0.0.1:8001`, external access needs to modify `host` to `0.0.0.0`

### Cookie Expired Needs Re-login

**Symptom**: After using for a while, WebUI requires re-entering Token.

**Cause**: Cookie validity expires, or security configuration doesn't match.

**Solution**:
1. Cookie default validity is 7 days, needs re-verification after expiration
2. If using HTTPS, ensure `secure_cookie = true` configuration is correct
3. Clear browser Cookie and re-login
4. Production environment recommends configuring reverse proxy and enabling HTTPS

## Plugin Issues

### Plugin Installation Failed

**Symptom**: Error when installing plugins through WebUI.

**Cause**: Git unavailable, network issues or plugin repository format incorrect.

**Solution**:
1. Confirm Git is installed and Git command is available (`git --version`)
2. Check network connection, ensure access to GitHub or configured mirror sources
3. If in GitHub restricted areas, configure mirror sources (WebUI → Plugin Management → Mirror Source Management)
4. Confirm plugin repository address is correct, and repository contains `_manifest.json` file
5. View installation progress and error information pushed through WebSocket
6. Plugin installation executes through `git clone`, ensure Git security configuration is correct

### Plugin Loaded But No Effect

**Symptom**: Plugin shows installed but doesn't produce expected effect.

**Cause**: Plugin not enabled, version incompatible or configuration incorrect.

**Solution**:
1. Check if `enabled` field in plugin configuration is `true`
2. View and modify plugin status through WebUI's plugin configuration page
3. View if there are plugin loading errors in MaiBot logs
4. Confirm plugin version is compatible with current MaiBot version
5. Try resetting plugin configuration through WebUI and check effect
6. Plugins have independent subprocesses and logs when running, check Runner and Worker health status