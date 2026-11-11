---
title: Model and Rule Troubleshooting
---

# Model and Rule Troubleshooting

This page covers model calls and rule matching: invalid API keys or insufficient balance, network timeouts and connection failures, invalid regular expressions, and keyword rule misconfiguration. Start here when the bot stays silent or replies unexpectedly.

## API Key Error / Insufficient Balance

**What you may see**

- Bot completely unresponsive
- Backend log shows `401 Unauthorized` / `402 Payment Required` / `403 Forbidden`
- Log prompts `API key is invalid` or `Insufficient balance`

**Check these first**

1. Is the API Key filled in correctly? Check `api_key` field in `model_config.toml`
2. Is the account balance sufficient? Log into the API provider's dashboard to check balance
3. Is the model name correct? Check if `model_identifier` is in the provider's supported model list

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
# Correct example
[[models]]
model_identifier = "deepseek-chat"   # Must be a model name supported by the API provider
name = "deepseek-chat"
api_provider = "DeepSeek"

# Incorrect example
[[models]]
model_identifier = "gpt-4"           # DeepSeek does not support GPT-4!
api_provider = "DeepSeek"
```

:::

**Prevent it next time**

- **Don't commit Keys to Git** — Use environment variables or local configuration files
- **Set up balance alerts** — Enable low-balance email notifications in the API dashboard
- **Monitor usage** — Regularly check token consumption

## Network Timeout / Connection Failure

**What you may see**

- LLM request returns `APIConnectionError` or `TimeoutError` after being unresponsive for a long time
- Log shows `Connection refused`, `Connection reset`, or `Read timed out`
- Bot completely unresponsive, but local features work normally

**Check these first**

1. Test network connectivity (`curl -v https://api.deepseek.com`)
2. Try a different network (e.g., switch to mobile hotspot)
3. Confirm the `timeout` parameter isn't too small (recommended 60–120 seconds)

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

**Prevent it next time**

- Set reasonable `timeout` (60–120 seconds) and `max_retry` (2–3, counting the first request)
- Try a different network when your network is unstable (e.g., switch to mobile hotspot)
- Configure multiple API providers as backups to avoid single points of failure
- Regularly check API provider status (follow official announcements)

## Invalid Regular Expression

**What you may see**

- Startup or saving configuration reports `re.error: bad escape` etc.
- Log prompts `Invalid regex pattern` or `正则表达式编译失败`
- Keyword rules / message filtering don't work
- Configuration page shows "Save failed: regex syntax error"

**Check these first**

1. **Check special character escaping** — Whether `\.` `\*` `\+` etc. special characters have backslashes
2. **Check bracket matching** — Whether `()` `[]` `{}` are properly paired
3. **Use online tool to test** — Verify the regex with regex101.com

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

> **Tip**: Regex in TOML files requires double backslashes `\\` for escaping because `\` itself is a TOML escape character.

**Prevent it next time**

- **Prefer keyword matching** — Simple scenarios don't need regex
- **Test complex regex separately** — Validate on regex101.com first before putting it into config
- **Add explanatory comments** — Add comments next to regex to describe what it matches, making maintenance easier

## Keyword Rule Configuration Error

**What you may see**

- Startup fails with `关键词规则必须至少包含keywords或regex中的一个`
- Or `关键词规则必须包含reaction`
- Or `无效的正则表达式`
- A message matches a rule but the reply shows no effect from the reaction prompt

**Check these first**

1. Does every rule set at least one of `keywords` or `regex`?
2. Is `reaction` filled in? It is required, not optional metadata.
3. Does the regex compile under Python's `re` syntax?

**Step 1: Use the fields the rule class actually has**
`KeywordRuleConfig` has exactly three fields. There is no `priority` or `enabled` switch:

::: code-group

```toml [config/bot_config.toml ~vscode-icons:file-type-toml~]
[keyword_reaction]

# Keyword-only rule: triggers when any keyword is found
[[keyword_reaction.keyword_rules]]
keywords = ["你好", "hello", "嗨"]
reaction = "The other side is greeting; answer in a casual tone"

# Regex-only rule: regex uses Python re syntax
[[keyword_reaction.regex_rules]]
regex = ["^早(上|安)[~！!]"]
reaction = "The other side says good morning; keep the reply short"

# Keywords and regex can coexist; either match triggers
[[keyword_reaction.keyword_rules]]
keywords = ["天气"]
regex = ["(今天|明天|后天).*(天气|气温|温度)"]
reaction = "The other side asks about weather; ask for the city first"
```

:::

`reaction` is a prompt for Mai, not a message sent verbatim. Capture groups in `regex` are substituted into matching placeholders in `reaction`.

**Step 2: When several rules match**
Every matching rule appends its `reaction` in configuration order, and the combined list goes to the Planner. There is no priority field and no "higher priority overrides lower" behavior.

To scope guidance to one chat, use `[chat.reply_style].chat_prompts`; keyword rules have no scoping fields.

**Step 3: Debug "no effect"**
- Check the match window: rules apply to the latest message and recent context, not to old history.
- Full-width and half-width punctuation differ. `你好，` and `你好,` are two different keywords; list both if you need both.
- A bad regex raises `无效的正则表达式` at startup instead of failing silently.

**Prevent it next time**

- **Prefer keywords over regex** — Keyword matching is plain substring matching: readable, and it cannot fail to compile
- **Validate regex on regex101.com with Python syntax** before pasting it into config
- **Write `reaction` as an instruction, not a script** — "keep the reply short" outperforms a hardcoded line


## Related

- [Error Troubleshooting Overview](/en/faq/error-troubleshooting) — error code quick reference, keyword index, and the troubleshooting flowchart.
- [Startup and Access Troubleshooting](/en/faq/troubleshooting-startup) — configuration files, MCP, ports, and WebUI access or login.
- [Runtime and Data Troubleshooting](/en/faq/troubleshooting-runtime) — missing replies, databases, emojis, memory, disk space, and data anomalies.
- [Plugin and Adapter Troubleshooting](/en/faq/troubleshooting-plugins-adapters) — plugin loading failures, adapter connections, and reconnects.
- [Getting Help](/en/faq/getting-help) — self-checks before asking, the issue checklist, and how to export logs.