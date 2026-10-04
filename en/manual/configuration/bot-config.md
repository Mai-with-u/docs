---
title: Bot Configuration
titleTemplate: :title · Configuration
---

# Bot Configuration

All of MaiBot's main settings live in a single file: `config/bot_config.toml` — bot identity, personality, chat behavior, memory, emoji, logging, WebUI, MCP, the plugin runtime, and more. The file is generated automatically after the first launch of MaiBot, and upgraded by the program afterwards — **just change the values; never add fields that do not exist**. Every field ships with a default, so **the defaults work out of the box** — change only what you actually want to tune.

::: tip Prefer not to edit files?
Every setting can also be changed in the WebUI with a few clicks (default `http://127.0.0.1:8001`), with the same effect as editing the file. See [WebUI Config Management](/en/manual/webui/config-management).
:::

After saving, most settings are **hot-reloaded** and take effect immediately; changes to `[maim_message]`, the `[webui]` listen address or port, `[mcp]` server connections, `[plugin_runtime]` IPC, the `[log]` event-loop watchdog, or `[debug]`'s terminal input and forced plugin compatibility require a restart. See [Configuration Overview](./index.md#does-it-take-effect-immediately) for the full rules.

## Quick Start

Right after installation, most needs boil down to the 6 changes below. Each snippet is complete and copy-pasteable — edit along the trailing comments.

### Tell Mai Who It Is

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"           # Fallback primary platform: used when the adapter reports no identity, e.g. qq
qq_account = "123456789"  # Fallback QQ account: used when the adapter reports no QQ identity
nickname = "麦麦"          # The name Mai displays and calls herself
alias_names = ["小麦"]     # Names others may use for Mai, helps mention detection
platforms = []            # Fallback accounts on other platforms, format platform:account
```

:::

::: warning qq_account must match the adapter's logged-in QQ
When connecting through an adapter such as NapCat, `qq_account` must exactly match the QQ number logged in on the adapter, otherwise Mai treats her own messages as other people's. When the adapter reports identity normally these two fields are only fallbacks, but keeping them consistent is always correct. See the [NapCat Adapter](/en/manual/adapters/napcat).
:::

### Shape the Personality

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[personality]
personality = "是一个大二女大学生，现在正在上网和群友聊天。善于用人类的角度思考问题，聊天偏日常。"
behavior_style = "不会没话题硬找话题：群里聊到感兴趣的内容再插话，冷场时安静旁观，不刷屏。"
reply_style = "你的风格平淡简短，可以参考贴吧的回复风格。不滥用比喻或者生硬句子。视情况省略主语或者进行倒装，风格较为随意。"
multiple_reply_style = [
  "你的风格平淡但不失讽刺，很简短，很白话。可以参考贴吧，微博的回复风格。",
  "用1-2个字进行回复",
  "用1-2个符号进行回复",
]
multiple_probability = 0  # Chance to randomly swap in one of the alternate styles above; 0 = never
```

:::

The three prompts each cover one thing:

- **`personality`** — who she is and what she is like. One or two sentences is enough; longer dilutes the effect
- **`behavior_style`** — the action policy: when to join the chat, how to read the room, when to stay quiet
- **`reply_style`** — the speaking style: terse or chatty, gentle or snarky

### Tune Activity

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing]
talk_value = 1.0            # Group talk frequency: lower is quieter; 0.3~0.5 is noticeably quieter
private_talk_value = 1.0    # Private talk frequency: same scale
inevitable_at_reply = true  # Try to reply when @-mentioned
mentioned_bot_reply = false # Reply more easily when a message mentions Mai's name
```

:::

To adjust frequency per chat or per time of day, use `talk_value_rules` (requires `enable_talk_value_rules = true` first):

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing]
enable_talk_value_rules = true

[[chat.reply_timing.talk_value_rules]]
platform = ""            # Empty = any platform, "*" = any platform
item_id = ""             # Empty = any chat, "*" = any chat
rule_type = "group"
time = "00:00-08:59"     # Active period; empty = fallback, "*" = all day, overnight "23:00-02:00" is supported
value = 0.8              # Talk frequency during this period

[[chat.reply_timing.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "09:00-18:59"
value = 1.0
```

:::

### Filter Unwanted Messages

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[message_receive]
image_parse_threshold = 5   # Recognize images only when a message has at most this many
ban_words = ["广告", "抽奖"]  # Messages containing these words are dropped
ban_msgs_regex = ["^\\d+$"]  # Drop messages matching a regex, for complex rules
```

:::

::: warning Invalid regex breaks startup
Regexes in `ban_msgs_regex` are validated at startup; a broken one makes MaiBot exit with an error. Self-check with the command in "Verification and Troubleshooting" below.
:::

### Collect Emoji Stickers

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[emoji]
steal_emoji = true     # Automatically collect stickers others send in chat
max_reg_num = 64       # Keep at most 64 usable stickers
do_replace = true      # When full, new stickers replace old ones
check_interval = 10    # Check the sticker library every 10 minutes
```

:::

### Check Logs First When Debugging

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[log]
console_log_level = "INFO"   # Console log level
file_log_level = "DEBUG"     # File log level: keep DEBUG while troubleshooting
max_log_files = 30           # Keep at most 30 log files
log_cleanup_days = 30        # Retain logs for 30 days
```

:::

For the remaining fields (rotation size, third-party library noise suppression, etc.) see the [Operations and Debugging](#operations-and-debugging) group in the [Full Config Reference](#full-config-reference).

## Full Config Reference

All sections are listed below, grouped by function. Every template **includes all fields and their defaults** — paste it into `bot_config.toml` and change only the lines you care about; the rest keep their defaults. Fields marked **`[Advanced]`** in their trailing comment are collapsed in the WebUI and are usually fine at their defaults.

### Identity and Personality

#### Bot Identity

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[bot]
platform = ""            # Fallback primary platform: used when the adapter reports no identity, e.g. "qq"
qq_account = ""          # Fallback QQ account: used when the adapter reports no QQ identity
platforms = []           # Fallback accounts on other platforms, format "platform:account"; ignored when adapter identity exists
nickname = "麦麦"         # The name Mai displays and calls herself
alias_names = []         # [Advanced] Names others may use for Mai, used to help recognize mentions
```

:::

#### Personality

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[personality]
personality = "是一个大二女大学生，现在正在上网和群友聊天。善于用人类的角度思考问题，聊天偏日常。"
behavior_style = "不会没话题硬找话题：群里聊到感兴趣的内容再插话，冷场时安静旁观，不刷屏。"
reply_style = "你的风格平淡简短，可以参考贴吧的回复风格。不滥用比喻或者生硬句子。视情况省略主语或者进行倒装，风格较为随意。"
multiple_reply_style = [
  "你的风格平淡但不失讽刺，很简短,很白话。可以参考贴吧，微博的回复风格。",
  "用1-2个字进行回复",
  "用1-2个符号进行回复",
  "言辭凝練古雅，穿插《論語》經句卻不晦澀，以文言短句為基，輔以淺白語意，持長者溫和風範，全用繁體字表達，具先秦儒者談吐韻致。",
  "带点翻译腔，但不要太长",
]
multiple_probability = 0  # [Advanced] Chance to temporarily inject one alternate style per reply; 0.0~1.0
```

:::

**Key points:**

- **`multiple_reply_style`** — alternate speaking styles; once triggered it only affects that single reply. For a "random persona" effect set `multiple_probability` to 0.1~0.3
- **`multiple_probability`** — `0` never switches, `1` switches every time

### Chat Behavior

#### Context and Recall

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat]
max_context_size = 40            # How many recent messages a group reply considers; more context costs more tokens
max_private_context_size = 60    # Recent messages considered for private replies
enable_context_optimization = true  # Compress part of the context to reduce model usage; recommended
mid_term_memory = true           # Chat recall: proactively recalls what happened in recent chat
mid_term_memory_lenth = 10       # How many recall entries to keep; 0 = keep none
```

:::

::: tip The field name lenth is a historical typo
The field really is `mid_term_memory_lenth` — "lenth", not "length". "Fixing" the spelling turns it into an unknown field. Leave it as is.
:::

#### When to Speak

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing]
talk_value = 1                             # Group talk frequency: 0~1, lower is quieter
private_talk_value = 1                     # Private talk frequency: same scale
mentioned_bot_reply = false                # Reply more easily when a message mentions Mai's name
inevitable_at_reply = true                 # Try to reply when @-mentioned
reply_trigger_mode = "frequency"           # When new messages enter the Planner: "frequency" / "reply_necessity"
planner_interrupt_max_consecutive_count = 0  # [Advanced] How many times new messages may restart an in-progress thought; 0 = unlimited
max_consecutive_wait_count = 3             # Max consecutive wait calls by the Planner; afterwards the wait tool refuses to continue
no_action_backoff_base_seconds = 15        # After consecutive no-reply decisions, how long to wait before the next check (seconds)
no_action_backoff_cap_seconds = 300        # [Advanced] Upper bound of the backoff wait (seconds)
no_action_backoff_start_count = 2          # [Advanced] Start slowing down after this many consecutive no-replies
no_action_backoff_bypass_pending_count = 6 # [Advanced] Re-process immediately once this many new messages pile up; 0 = never bypass by count
enable_talk_value_rules = false            # Enable per-chat / per-time rules, see below
```

:::

`talk_value_rules` set the talk frequency per platform, chat stream, and time period. Two global rules ship by default:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[chat.reply_timing.talk_value_rules]]
platform = ""         # Empty = no platform limit, "*" = any platform
item_id = ""          # Group or user ID; empty = no chat limit, "*" = any chat
rule_type = "group"   # "group" / "private"
time = "00:00-08:59"  # Empty = fallback, "*" = all day, overnight "23:00-02:00" is supported
value = 0.8           # Talk frequency in this period: 0 quieter, 1 normal

[[chat.reply_timing.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "09:00-18:59"
value = 1.0
```

:::

**Key points:**

- **One specific group** — `platform = "qq"`, `item_id = "123456"`, applies only to that group
- **Global fallback** — leave both `platform` and `item_id` empty; used when no specific rule matches
- **Global wildcard** — set both to `"*"` to match any platform and any chat; in the WebUI you can pick the "global wildcard" or "fallback" mode directly

#### How to Speak

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_style]
enable_reply_quote = true  # [Advanced] Whether replies may quote related messages
```

```toml [Group/private prompts ~vscode-icons:file-type-toml~]
[chat.reply_style]
group_chat_prompt = """
你正在qq群里聊天，下面是群里正在聊的内容，聊天中包含文字，图片和表情包等消息。
回复尽量简短一些。最好一次对一个话题进行回复，但必须考虑不同群友发言之间的交互，免得啰嗦或者回复内容太乱。请注意把握聊天内容。
不要总是提及自己的身份背景，根据聊天内容自由发挥，但是要日常不浮夸，不要刻意找话题。
不用刻意回复其他人发送的表情包，只要关注表情包表达的含义。你可以适当发送表情包表达情绪。控制回复的频率，不要每个人的消息都回复，优先回复你感兴趣的或者主动提及你的，适当回复其他话题。
"""
private_chat_prompts = """
你正在聊天，下面是正在聊的内容，其中包含聊天记录和聊天中的图片。
回复尽量简短一些。请注意把握聊天内容。
请考虑对方的发言频率，想法，思考自己何时回复以及回复内容。
"""
```

:::

`chat_prompts` appends extra requirements to a specific group or private chat — add one only when you have special group rules or tone requirements; `platform`, `item_id`, and `prompt` are all required or the whole entry is invalid:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[chat.reply_style.chat_prompts]]
platform = "qq"
item_id = "123456"
rule_type = "group"
prompt = "Keep replies extra short in this group."
```

:::

#### Experimental Features

The whole section is advanced; everything is off by default — opt in per feature.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[experimental]
enable_behavior_learning = false  # Learn "how to respond when" experience from chat
enable_rich_reply = false         # The reply action may attach pictures, stickers, or @
replyer_retro_prompt = false      # Organize the Replyer prompt the legacy (0.12.x) way, with all instructions in a single template
emotion_trait = "neutral"         # Experimental emotion trait: "rational_calm" / "neutral" / "sentimental"
behavior_learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
behavior_groups = []              # Multiple chats share learned behavior experience

focus_mode = false                # Focus on a single chat stream at a time; good for livestreams
focus_on_private = false          # Whether Focus also applies to private chats
focus_chat_whitelist = []         # Focus whitelist; empty = all chats matching the type switches may enter
focus_groups = []                 # Focus sharing groups: same group shares Focus, different groups do not preempt
focus_cool_time = 120             # Seconds without progress before the focused chat can be woken by others

[experimental.attention_drift]
enabled = false                   # Attention drift: more easily drawn to new topics, memes, and contrast
drift_level = "scattered"         # "subtle" / "active" / "scattered" / "wild"
anchor_policy = "balanced"        # How strongly to return to the current context after drifting
reaction_style = "lively"         # "reserved" / "natural" / "lively"
```

:::

**Retro reply prompt** — with `replyer_retro_prompt = true`, the Replyer prompt is organized the legacy (0.12.x) way: all reply instructions live in a single complete template sent as one `user` message, and the dialogue history is rendered as plain text into template placeholders instead of being sent as image Items. Group chat, "short reply", private chat, and "private chat replying to Mai herself" each use their own template (`retro_replyer`, `retro_replyer_light`, `retro_private_replyer`, `retro_private_replyer_self`); they appear under **Prompt Management** collapsed as "advanced" and can be edited or given custom versions. Changes hot-reload.

#### Message Receiving

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[message_receive]
image_parse_threshold = 5   # [Advanced] Recognize images only when a message has at most this many
ban_words = []              # Messages containing these words are filtered, e.g. ["ads", "giveaway"]
ban_msgs_regex = []         # Filter messages by regex; invalid regex fails config validation
```

:::

#### Keyword Reactions

When a keyword or regex matches, Mai receives an extra **reaction prompt** — note it is an instruction for Mai, not a message sent directly:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[keyword_reaction.keyword_rules]]
keywords = ["早上好"]          # Match any one to trigger; at least one of keywords/regex is required
reaction = "现在是早晨，愉快地打招呼"  # Required: the reaction hint shown to Mai

[[keyword_reaction.regex_rules]]
regex = ["^早(上|安)[~！!]"]   # For complex text rules, Python re syntax
reaction = "对方在问早，简短回应即可"
```

:::

**Key points:**

- Every rule must satisfy all of: at least one of `keywords`/`regex` present, `reaction` filled, and all regexes valid — otherwise startup fails.

### Learning Systems

#### Expression Learning

Mai learns ways of speaking from chat and reuses them in later replies:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[expression]
expression_checked_only = true        # Only use expressions that were manually curated
expression_self_reflect = true        # Let an AI review entries before writing, less weird content
expression_selection_mode = "legacy"  # "legacy" quick pick / "vector_intent" intent + vector recall (needs an embedding model)
expression_vector_index_path = "data/expression_selection/expression_vector_index.json"  # [Advanced]
expression_vector_candidate_pool_size = 50  # [Advanced] Candidates handed to the LLM after vector recall, hard cap 50
max_expression_learner = 3            # [Advanced] Learning tasks running at the same time
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
expression_groups = []                # Multiple chats share learned expressions
```

:::

**Key points:**

- **`expression_selection_mode`** — switch to `"vector_intent"` once an embedding model is configured; selection quality improves significantly. The old `"vector"` mode has been removed; on first launch after upgrading it is migrated to `"vector_intent"` and written back automatically
- **`learning_list`** — empty `platform`/`item_id` means a global rule; `type` accepts `"group"`/`"private"`; `use` controls whether learned content is used, `learn` whether learning continues

Since 1.2.0, the expression vector index is maintained online: inserts, backfill, and failure recovery allocate incrementally from the nearest cluster center, and a corrupted index file is rebuilt automatically instead of crashing in a loop. This runs by itself, no configuration needed.

#### Jargon Learning

Fields are identical to the `learning_list` of [expression](#expression-learning), but the learning target is group slang and memes:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[jargon]
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
jargon_groups = []  # Multiple chats share learned jargon
```

:::

### Output and Persona

#### Vision

Controls how image messages enter the planner and replyer:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[visual]
planner_mode = "auto"                  # "auto" pick by model / "text" text and recognition results only / "multimodal" send images to the model
replyer_mode = "auto"                  # Same options, for the reply stage
max_image_num = 128                    # [Advanced] Max images per multimodal request
wait_image_recognize_max_time = 10     # Longest wait for image recognition, seconds; 0 = no wait
handle_oversized_images = true         # Automatically compress or drop oversized images
max_image_size_mb = 30.0               # Images above this size count as oversized; 0 = unlimited
oversized_image_handle_method = "compress"  # "compress" then keep using / "discard" drop it

[visual.image_cache_cleanup]
enabled = true                 # Automatically clean up long-unused image caches
check_interval_hours = 6.0     # Check interval in hours
image_file_retention_days = 14    # Days an unused image file is kept
no_file_result_retention_days = 30  # Days the recognition result outlives the deleted file
```

:::

#### Emoji Stickers

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[emoji]
emoji_send_num = 25        # [Advanced] Pick one sticker out of this many candidates per send (not 25 sent at once)
max_reg_num = 64           # Max number of usable stickers kept
do_replace = true          # [Advanced] When full, new stickers replace old ones; off = stop collecting
check_interval = 10        # Check the sticker library every N minutes
steal_emoji = true         # Automatically collect stickers others send in chat
max_emoji_size_mb = 5.0    # [Advanced] Size limit for collected stickers; 0 = unlimited
content_filtration = false # [Advanced] Only keep stickers with suitable content

[emoji.cache_cleanup]
enabled = true                  # Clean up unregistered sticker caches (registered ones are never deleted)
check_interval_hours = 6.0      # Check interval in hours
emoji_file_retention_days = 30  # Days an unused unregistered sticker file is kept
no_file_record_retention_days = 30  # Days the description record outlives the deleted file
```

:::

#### Speech Recognition

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[voice]
enable_asr = false  # Transcribe voice messages to text; needs the voice task model in model_config
```

:::

#### Response Post-processing

The master switch for typo generation and response splitting:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[response_post_process]
enable_response_post_process = true  # Master switch; off disables both typos and splitting
typing_speed = 1.0                   # [Advanced] Simulated typing speed: 0 fastest / 1 default / 2 slower (0~2)
```

:::

#### Chinese Typos

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chinese_typo]
enable = true                       # Occasional typos make chat feel more human
enable_correction_quote = true      # When correcting, quote the message that contained the typo
correction_quote_probability = 1.0  # [Advanced] Chance for correction messages to quote the original (0~1)
error_rate = 0.01                   # [Advanced] Chance a single character becomes a typo (0~1)
min_freq = 9                        # [Advanced] Only try typos on characters at least this common
tone_error_rate = 0.1               # [Advanced] Chance of a similar-tone typo (0~1)
word_replace_rate = 0.006           # [Advanced] Chance a whole word is replaced (0~1)
```

:::

#### Response Splitting

Splits overlong replies into several messages, more like a human flooding the chat:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[response_splitter]
mode = "rule"                     # Splitting mode: "rule" splits by rules / "llm" splits by meaning with an LLM
enable = true                     # Split overlong replies into several messages
max_length = 512                  # Max length per message (characters)
max_sentence_num = 8              # Max sentences per message
max_split_num = 3                 # Max messages one reply may be split into
enable_kaomoji_protection = false # [Advanced] Avoid splitting kaomoji in half
enable_overflow_return_all = false # [Advanced] Keep the full reply when there are too many sentences, instead of cutting
```

:::

**Key points:**

- **`mode = "rule"` (default)** — mechanical sentence splitting by punctuation; fast, with no extra model calls
- **`mode = "llm"`** — semantic splitting by an LLM through the `utils` model task: each reply costs one more model call, raising both latency and cost, so **`utils` must already have a working model, and a failure does not fall back automatically** (the reply is marked as failed)
- The `llm` splitting prompt is built into the program, is not in the Prompt Management page, and cannot be customized; kaomoji protection is not applied either
- A `response.splitter` request type appears in statistics, which you can use to observe the extra calls

### Services and Connections

#### Message Service

`maim_message` is the message service external programs (adapters, third-party clients) connect to. **Changing it requires a restart**:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[maim_message]
ws_server_host = "127.0.0.1"  # Legacy WebSocket listen address; keep default unless you know better
ws_server_port = 8000         # Legacy WebSocket port
auth_token = []               # Legacy auth tokens; empty = no verification

enable_api_server = false     # New API Server: lets external programs call Mai
api_server_host = "0.0.0.0"   # New API listen address; 0.0.0.0 = open to external access
api_server_port = 8090        # New API listen port
api_server_use_wss = false    # Whether to use encrypted WebSocket
api_server_cert_file = ""     # WSS certificate file path
api_server_key_file = ""      # WSS private key file path
api_server_allowed_api_keys = []  # API keys allowed to access; empty = unrestricted
```

:::

::: warning Add auth before exposing to the public internet
`api_server_host = "0.0.0.0"` exposes the new API on every network interface. When serving the public internet, always configure `api_server_allowed_api_keys`; when enabling WSS, turn on `secure_cookie` as well.
:::

#### WebUI

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[webui]
enabled = true            # Whether to start the WebUI
host = ["127.0.0.1", "::1"]  # Listen addresses; for external access use ["0.0.0.0", "::"]
port = 8001               # Access port
mode = "production"       # "production" for daily use / "development" for debugging
webui_style = 1           # Interface style: 0 old / 1 retro-future

anti_crawler_mode = "basic"  # Anti-crawler: "basic" log only / "strict" / "loose" block more / "false" off
allowed_ips = "127.0.0.1"    # IPs allowed to access, comma separated, CIDR and wildcards supported
trusted_proxies = ""         # Trusted reverse-proxy IPs, comma separated
trust_xff = false            # Whether to trust the real visitor IP from X-Forwarded-For
secure_cookie = false        # Send the login cookie only over HTTPS; do not enable without HTTPS
enforce_public_outbound_url = true  # Restrict WebUI outbound URLs, lowering intranet-access risk
enable_paragraph_content = false    # Load full paragraph text in the knowledge graph; more complete but memory-hungry
```

:::

::: warning Listen address and port are read at startup only
Restart MaiBot after changing `host` / `port`. When opening external access, tighten `allowed_ips` at the same time.
:::

#### MCP

The `[mcp]` section only holds the master switch; the server list, Sampling, Roots, and more are documented in **[MCP Configuration](/en/manual/configuration/mcp-config)**:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[mcp]
enable = true  # Whether to enable MCP tool integration
```

:::

::: tip MCP server connections need a restart
Connections under `[mcp]` are established at startup only; a file reload does not reconnect. Restart MaiBot after changing server config.
:::

#### Plugin Management

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]  # Users allowed to manage plugins via chat commands, format platform:QQ
```

:::

#### Plugin Runtime

Process management for the new plugin system. **Binding and IPC settings take effect at startup only**:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[plugin_runtime]
enabled = true                   # Whether to enable the new plugin runtime
health_check_interval_sec = 30.0 # Check plugin health every N seconds
max_restart_attempts = 3         # Max automatic restarts after a Runner crash
runner_spawn_timeout_sec = 30.0  # Longest wait for a Runner to start (seconds)
hook_blocking_timeout_sec = 60   # Longest a single blocking hook may run (seconds)
ipc_socket_path = ""             # Custom IPC socket path; empty = generated automatically

[plugin_runtime.render]
enabled = true                   # Allow plugins to use browser rendering (page screenshots, etc.)
browser_ws_endpoint = ""         # Debug address of an existing Chrome/Chromium; empty = launch one
executable_path = ""             # Browser executable path; empty = locate automatically
browser_install_root = "data/playwright-browsers"  # Where auto-downloaded browsers are stored
headless = true                  # Run the browser without a window
launch_args = ["--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"]
concurrency_limit = 2            # Max render tasks running at the same time
startup_timeout_sec = 20.0       # Longest wait for browser startup or connection (seconds)
render_timeout_sec = 15.0        # Longest wait for a single render task (seconds)
auto_download_chromium = true    # Auto-download Chromium when no browser is found
download_connection_timeout_sec = 120.0  # Connection timeout for the browser download (seconds)
restart_after_render_count = 200 # Restart the browser after N renders; 0 = never
```

:::

### Operations and Debugging

#### Logging

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[log]
date_style = "m-d H:i:s"        # Log timestamp format
log_level_style = "lite"        # Level display style: "lite" / "compact" / "full"; cosmetic only
color_text = "full"             # Console color range: "none" / "title" / "full"
log_level = "INFO"              # Global minimum level: "DEBUG" / "INFO" / "WARNING" / "ERROR" / "CRITICAL"
console_log_level = "INFO"      # Console minimum level
file_log_level = "DEBUG"        # File minimum level; keep DEBUG while troubleshooting
log_file_max_bytes = 5242880    # Rotate a log file once it exceeds this size (5MB)
max_log_files = 30              # Max main log files kept
log_cleanup_days = 30           # Days before main logs are cleaned up

llm_request_snapshot_limit = 128      # Max failed-request snapshots kept
maisaka_prompt_preview_limit = 256    # Max prompt preview groups kept per chat
maisaka_reply_effect_limit = 256      # Max reply-effect records kept per chat

event_loop_watchdog_enabled = false    # [Advanced] Record event-loop stalls, for diagnosing UI/main-loop freezes
event_loop_watchdog_warn_seconds = 0.5 # [Advanced] Log a warning once the event loop wake-up delay exceeds this many seconds

suppress_libraries = ["faiss", "httpx", "urllib3", "asyncio", "websockets", "httpcore", "requests", "sqlalchemy", "openai", "uvicorn", "jieba"]  # [Advanced] Third-party libraries whose logs are fully hidden
library_log_levels = { aiohttp = "WARNING", PIL = "WARNING" }  # [Advanced] Lower the log level of specific libraries
```

:::

**Event-loop watchdog** — when enabled, it checks once per second how far the main loop and the WebUI loop wake up later than they should; a lag above `event_loop_watchdog_warn_seconds` logs a warning such as `事件循环卡顿: loop=main 迟到=1.23s (告警阈值 0.50s)`, helping you tell whether UI stutter or message delay comes from a blocked main thread. Both fields **require a restart** to take effect; the default is off because normal operation also produces a few harmless lag logs.

#### Debugging

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[debug]
enable_console_input = true           # Enable local message and command input in an interactive terminal (on by default)
show_maisaka_thinking = true          # Show Mai's thinking process in logs or the UI
enable_clear_context_command = false  # Allow /clear to wipe a chat stream's short-term context
enable_reply_effect_tracking = false  # Record reply-effect scores to observe quality
force_plugin_compatibility = false    # Skip the plugin-declared Host/SDK version check and load directly; takes effect after a restart
keep_prompt_preview_json_base64 = false  # [Advanced] Keep image base64 in prompt previews; reproducible but large
record_tool_structured_content = false   # [Advanced] Save structured tool results; grows the database
enable_llm_cache_stats = false           # [Advanced] Record prompt-cache statistics, for performance debugging
```

:::

**Key points:**

- **Terminal input** — `enable_console_input` is on by default: in an interactive terminal you can type ordinary messages or manage chats and adapters with `/clear`, `/pm`, `/offline`, `/online`, `/help`, and type `exit()` to close it. A non-interactive terminal (systemd, nohup, `docker run` without `-it`) only logs one extra warning and is otherwise unaffected; changing this requires a restart
- **Force plugin compatibility** — `force_plugin_compatibility = true` skips the Host/SDK version-range checks declared by a plugin manifest and loads it anyway; it is **only a temporary fallback** and may load plugins that are in fact incompatible. It logs a single warning and does not affect the plugin market's version compatibility filtering. Requires a restart

#### Telemetry

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[telemetry]
enable = true  # Send anonymous usage statistics; turning it off does not affect functionality
```

:::

#### Database

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[database]
save_binary_data = false  # [Advanced] Keep binary source files such as voice; more disk, easier re-recognition. Affects newly stored messages only
```

:::

#### Long-term Memory

A_Memorix is a standalone long-term memory subsystem with 12 subsections — see **[A_Memorix Configuration](/en/manual/configuration/amemorix-config)** for the full reference. The minimal enable is two lines:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[a_memorix]

[a_memorix.plugin]
enabled = true  # Enable the long-term memory system; make sure an embedding model works first
```

:::

::: info About the [inner] section
The `[inner]` block at the top of the file records the config structure version. It is managed by the program during upgrades — do not edit it by hand.
:::

## Verification and Troubleshooting

**Verify the config** — run a syntax self-check after editing (MaiBot requires Python 3.12, which ships `tomllib`):

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
python -c "import tomllib; tomllib.load(open('config/bot_config.toml','rb')); print('TOML OK')"
```

:::

Then watch the log or the WebUI: once the file is saved, a successful config-reload message means the hot reload took effect.

**Startup fails immediately** — a TOML syntax error or an invalid field value (broken regex in `ban_msgs_regex`, a keyword rule missing `reaction`, an incomplete `chat_prompts` entry). Run the command above to locate syntax problems; field-validation errors name the offending field directly.

**Change had no effect** — the section you touched may be startup-only: `[webui]` and `[maim_message]` listen addresses and ports, `[mcp]` server connections, `[plugin_runtime]` IPC, `[log]`'s `event_loop_watchdog_*`, `[debug]`'s `enable_console_input` and `force_plugin_compatibility`. Restart MaiBot. For everything else see [Configuration Overview](./index.md#does-it-take-effect-immediately).

**Mai ignores people** — check in order: is the group in the adapter's chat list (see "Add lists first, then test" in the [NapCat Adapter](/en/manual/adapters/napcat)); is `talk_value` set too low; does `qq_account` match the adapter's logged-in QQ.

**Mai floods the chat** — lower `talk_value` (e.g. 0.3); cap messages per reply with `response_splitter.max_sentence_num` and `max_split_num`; note that `emoji_send_num` is only the candidate pool size — lowering it does not reduce talk frequency.

**Manually added fields disappear** — the config file is upgraded by the program, and unknown or misspelled fields (e.g. `mid_term_memory_lenth` renamed to `length`) are cleaned back to defaults on the next start. Launch once to let the program generate/upgrade the file, then edit the generated fields.

**Personality change feels ineffective** — personality only affects newly generated replies; messages already sent stay unchanged. After confirming the reload message in the log, observe a few more rounds; for occasional style swings try `multiple_reply_style` + `multiple_probability`.

## Next Steps

- Configure models: [Model Configuration](/en/manual/configuration/model-config)
- Advanced model parameters (thinking mode, etc.): [Model Extra Parameters](/en/manual/configuration/model-extra-params)
- Long-term memory in depth: [A_Memorix Configuration](/en/manual/configuration/amemorix-config)
- External tools: [MCP Configuration](/en/manual/configuration/mcp-config)
- Connect QQ: [NapCat Adapter](/en/manual/adapters/napcat)
- Configure in the browser: [WebUI Config Management](/en/manual/webui/config-management)
