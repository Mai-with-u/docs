---
title: Model and Rule Troubleshooting
---

# Model and Rule Troubleshooting

This page covers model calls and rule matching: invalid API keys or insufficient balance, network timeouts and connection failures, invalid regular expressions, and keyword rule misconfiguration. Start here when the bot stays silent or replies unexpectedly.

## API Key Error / Insufficient Balance

### Error Symptoms
- Bot completely unresponsive
- Backend log shows `401 Unauthorized` / `402 Payment Required` / `403 Forbidden`
- Log prompts `API key is invalid` or `Insufficient balance`

### Quick Self-Check Trio
1️⃣ Is the API Key filled in correctly? Check `api_key` field in `model_config.toml`
2️⃣ Is the account balance sufficient? Log into the API provider's dashboard to check balance
3️⃣ Is the model name correct? Check if `model_identifier` is in the provider's supported model list

### Solutions

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

### Prevention Tips
- 🔑 **Don't commit Keys to Git** — Use environment variables or local configuration files
- 💰 **Set up balance alerts** — Enable low-balance email notifications in the API dashboard
- 📊 **Monitor usage** — Regularly check token consumption

## Network Timeout / Connection Failure

### Error Symptoms
- LLM request returns `APIConnectionError` or `TimeoutError` after being unresponsive for a long time
- Log shows `Connection refused`, `Connection reset`, or `Read timed out`
- Bot completely unresponsive, but local features work normally

### Quick Self-Check Trio
1️⃣ Test network connectivity (`curl -v https://api.deepseek.com`)
2️⃣ Try a different network (e.g., switch to mobile hotspot)
3️⃣ Confirm the `timeout` parameter isn't too small (recommended 60–120 seconds)

### Solutions

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
max_retry = 3              # Total attempts, first request included
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

### Prevention Tips
- Set reasonable `timeout` (60–120 seconds) and `max_retry` (2–3, counting the first request)
- Try a different network when your network is unstable (e.g., switch to mobile hotspot)
- Configure multiple API providers as backups to avoid single points of failure
- Regularly check API provider status (follow official announcements)

## Invalid Regular Expression

### Error Symptoms
- Startup or saving configuration reports `re.error: bad escape` etc.
- Log prompts `Invalid regex pattern` or `正则表达式编译失败`
- Keyword rules / message filtering don't work
- Configuration page shows "Save failed: regex syntax error"

### Quick Self-Check Trio
1️⃣ **Check special character escaping** — Whether `\.` `\*` `\+` etc. special characters have backslashes
2️⃣ **Check bracket matching** — Whether `()` `[]` `{}` are properly paired
3️⃣ **Use online tool to test** — Verify the regex with regex101.com

### Solutions

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

### Prevention Tips
- **Prefer keyword matching** — Simple scenarios don't need regex
- **Test complex regex separately** — Validate on regex101.com first before putting it into config
- **Add explanatory comments** — Add comments next to regex to describe what it matches, making maintenance easier

## Keyword Rule Configuration Error

### Error Symptoms
- Message matches the wrong reply rule
- Rule doesn't take effect at all, bot doesn't reply
- Priority conflicts, high-priority rules override low-priority ones
- Mixed Chinese/English punctuation causing matching failure

### Quick Self-Check Trio
1️⃣ **Check rule priority** — Higher `priority` rules override lower ones
2️⃣ **Confirm rule is enabled** — Is `enabled = true` set?
3️⃣ **Test punctuation** — Full-width / half-width symbol differences can affect matching

### Solutions

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
keywords = ["你好，", "你好,"]   # Different commas

# Half-width punctuation (English input method)
keywords = ["hello,", "hello!"]

# Recommended to configure both types of punctuation
keywords = ["你好，", "你好,", "hello", "hello!"]
```

:::

### Prevention Tips
- **Add comments to rules** — Comment the purpose next to each rule
- **Hierarchical priority management** — Exact match > Regex match > Normal keywords > Fallback rule
- **Test rules regularly** — Send test messages in the group to verify matching
- **Use debug mode** — Enable `DEBUG` logging to see the actual matching chain

## Related

- [Error Troubleshooting Overview](/en/faq/error-troubleshooting) — error code quick reference, keyword index, and the troubleshooting flowchart.
- [Startup and Access Troubleshooting](/en/faq/troubleshooting-startup) — configuration files, MCP, ports, and WebUI access or login.
- [Runtime and Data Troubleshooting](/en/faq/troubleshooting-runtime) — missing replies, databases, emojis, memory, disk space, and data anomalies.
- [Plugin and Adapter Troubleshooting](/en/faq/troubleshooting-plugins-adapters) — plugin loading failures, adapter connections, and reconnects.
- [Getting Help](/en/faq/getting-help) — self-checks before asking, the issue checklist, and how to export logs.
