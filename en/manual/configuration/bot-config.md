---
title: Bot Configuration
titleTemplate: :title · Configuration
---

# Bot Configuration

All of MaiBot's main settings live in a single file: `config/bot_config.toml` — bot identity, personality, chat behavior, memory, emoji, logging, WebUI, MCP, the plugin runtime, and more. The file is generated automatically after the first launch of MaiBot, and upgraded by the program afterwards — **just change the values; never add fields that do not exist**. Every field ships with a default, so **the defaults work out of the box** — change only what you actually want to tune.

::: tip Prefer not to edit files?
Every setting can also be changed in the WebUI with a few clicks (default `http://127.0.0.1:8001`), with the same effect as editing the file. See [WebUI Config Management](/en/manual/webui/config-management).
:::

After saving, most settings are **hot-reloaded** and take effect immediately; changes to `[maim_message]`, the `[http]` listen address or port, `[mcp]` server connections, `[plugin_runtime]` IPC, the `[log]` event-loop watchdog, or `[debug]`'s terminal input and forced plugin compatibility require a restart. See [Configuration Overview](./index.md#does-it-take-effect-immediately) for the full rules.

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
When connecting through an adapter such as NapCat, `qq_account` must exactly match the QQ number logged in on the adapter, otherwise Mai treats her own messages as other people's. When the adapter reports identity normally these two fields are only fallbacks, but keeping them consistent is always correct. See the [Unified QQ Connector](/en/manual/adapters/qq-local-client).
:::

### Shape the Personality

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[personality]
selected_profile = ""     # Name of the profile being edited; empty means not yet saved to the library
profiles = []             # Profile library, maintained by the WebUI; the runtime only reads the fields below
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
talk_value = 1.0             # Group talk frequency: lower is quieter; 0.3~0.5 is notably quiet
private_reply_paused = false # Pause all private replies: true = private chats only receive and store messages
inevitable_at_reply = true   # Try to reply when @-mentioned
mentioned_bot_reply = false  # Reply more easily when a message mentions Mai's name
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
selected_profile = ""     # Name of the profile being edited; empty means not yet saved to the library
profiles = []             # Profile library, maintained by the WebUI; the runtime only reads the fields below
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
- **`profiles` / `selected_profile`** — saving and switching multiple personas happens in the WebUI "Identity and Personality" page; editing the TOML by hand easily desyncs from the library. Saving or switching hot-reloads, and what is actually in effect is always the `personality`, `behavior_style`, `reply_style` and `multiple_*` fields above plus the group/private prompts in `[chat.reply_style]`

### Chat Behavior

#### Context and Recall

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat]
enable_reply_at = true           # Let Mai @-mention people at the start of a reply; the model decides when
max_context_size = 50            # How many recent messages a group reply considers; more context costs more tokens
max_private_context_size = 75    # Recent messages considered for private replies
context_compaction_summary_max_chars = 6000  # [Advanced] Max characters of the rolling state summary (1000~8000), generated by the utils model
```

:::

When the context is nearly full, Mai compresses the older conversation into a rolling state summary with the utils model and always sends it with the Planner context; `context_compaction_summary_max_chars` controls the summary length. Chat recall and long-term memory are handled by A_Memorix, see [A_Memorix Configuration](./amemorix-config.md).

#### When to Speak

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing]
message_debounce_mode = "natural"          # Group message debouncing: off / fast / natural / steady
private_message_debounce_mode = "natural"  # Private message debouncing, independent of the group mode
planner_message_steering = false           # Quick reaction mode: new messages during thinking/output/wait immediately join and restart reasoning
talk_value = 1                             # Group talk frequency: 0~1, lower is quieter
private_reply_paused = false               # Pause all private replies: true = private chats only receive and store messages, without thinking
private_reply_pause_rules = []             # Per-platform and per-user overrides of the global private pause
mentioned_bot_reply = false                # Reply more easily when a message mentions Mai's name
inevitable_at_reply = true                 # Try to reply when @-mentioned
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

**Message debouncing** — `message_debounce_mode` covers group chats and `private_message_debounce_mode` covers private chats; the two do not affect each other. Each collects a batch of messages before sending it to the Planner. The four modes use fixed rules:

- **`off`** — keeps the original wait logic, including the short wait after a new message interrupts processing
- **`fast`** — quiet 1 s, active 3 s; same sender continuing 1 s, different sender 0.5 s. Misses split follow-ups more easily
- **`natural` (default)** — quiet 2 s, active 5 s; same sender continuing 2 s, different sender 0.5 s
- **`steady`** — quiet 4 s, active 7 s; same sender continuing 4 s, different sender 2 s. Gives follow-ups more time, but also waits longer when none arrive

A batch is the messages merged and sent to the Planner together. If the previous effective message is more than 30 seconds old (or there is no history), the chat is quiet; otherwise it is active. Continuation and sender changes compare only with the immediately previous message. A batch opened by a bare image waits at least 4 seconds, and stickers inside a batch cannot extend the wait. Each batch waits at most 8 seconds from the first message actually received, or at most 1 second after an @ mention or name mention. A mode change applies from the next effective message; choosing Off ends an in-progress fixed-rule wait. Private chats only have the quiet and continuation rhythms, with no sender-change rule.

**Pausing private replies** — with `private_reply_paused = true`, all private chats only receive messages and maintain history without entering thinking; `private_reply_pause_rules` overrides the global setting per platform and user, and can also be toggled per chat stream in the WebUI or set back to follow the global setting:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[chat.reply_timing.private_reply_pause_rules]]
platform = "qq"
item_id = "123456"
paused = true   # true = pause this private chat; false = keep replying here, overriding a global pause
```

:::

**Quick reaction mode** — with `planner_message_steering` enabled, the Planner is forced to use streaming requests. A new message arriving during thinking, output, or a `wait` immediately interrupts the current round and starts another request; it no longer waits for a quiet window and does not limit consecutive interruptions. Interrupted thinking and output remain in history for review.

#### How to Speak

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_style]
group_quote_frequency = "occasionally"    # Group quote frequency: "never" / "occasionally" / "often"
private_quote_frequency = "occasionally"  # Private quote frequency: same values
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

**Quote frequency** — group and private chats are configured separately: `never`, `occasionally` (default), or `often`. "Often" quotes twice as frequently as "occasionally". Group chats decide by a fixed random rule; private chats also consider how many messages the user sent in a row, the interval between them, and the position of the reply target.

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

#### Capabilities

`[capabilities]` centralizes the thinking and tool-usage enhancements; everything is off by default:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[capabilities]
files = false                          # File feature: chat attachment send/receive, storage, and text reading; see "Files"
planner_subagent = false               # Sub-agent delegation: give the Planner the subagent tool
advanced_sub_agent = false             # Advanced sub-agents: run in the background and return the conclusion as a new message (requires the previous option)
tool_result_condense = false           # Condense long tool results into a conclusion before writing them to context
tool_result_condense_threshold = 3000  # [Advanced] Character count that triggers condensing; minimum 500
```

:::

**Files** — `files = true` turns on attachment registration, model file tools, the plugin SDK file interface, and the WebUI files page; this one switch controls all of them. When off, new file operations are refused and existing originals are not deleted. Size, quota, and transfer settings live in `[files]`; see [Services and Connections](#files).

**Sub-agents** — `planner_subagent = true` gives the Planner a `subagent` tool: a self-contained research or summarization task runs in its own context, may call authorized tools over multiple rounds, and returns only its conclusion. With `advanced_sub_agent = true`, sub-agents run in the background: dispatch returns a task ID immediately and Mai can keep chatting; when the sub-agent finishes, its conclusion returns as a new message that wakes the Planner. `subagent_status` lists tasks and `subagent_stop` terminates one.

**Condensing long tool results** — with `tool_result_condense = true`, a tool result reaching `tool_result_condense_threshold` characters (default 3000, minimum 500) is first condensed by a sub-agent according to the Planner's current intent, then written to context. This reduces context usage in later rounds at the cost of one extra model request.

#### Experimental Features

The whole section is advanced; everything is off by default — opt in per feature.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[experimental]
passive_replyer = false   # Passive reply: when the Planner outputs text without calling tools, the text guides one reply

focus_mode = false        # Focus: chats in the same group share one continuously thinking Planner
focus_on_private = false  # Whether Focus also applies to private chats
focus_chat_whitelist = [] # Focus whitelist; empty = all chats matching the type switches may enter
focus_groups = []         # Focus sharing groups: same group shares the Planner and full context, different groups do not preempt

[experimental.group_attention_drift]
enabled = false                   # Group attention drift: more easily drawn to new topics, memes, and contrast
drift_level = "scattered"         # "subtle" / "active" / "scattered" / "wild"
anchor_policy = "balanced"        # How strongly to return to the current context after drifting
reaction_style = "lively"         # "reserved" / "natural" / "lively"

[experimental.private_attention_drift]
enabled = false                   # Private attention drift: same fields as group, independent switch
drift_level = "scattered"
anchor_policy = "balanced"
reaction_style = "lively"
```

:::

**Rich replies** — Replies can include images. @-mentions follow [`[chat].enable_reply_at`](#context-and-recall), and stickers follow [`[emoji].use_new_send_logic`](#emoji-stickers).

**Passive reply** — with `passive_replyer = true`, when the Planner outputs text without calling a tool, that text becomes natural-language guidance for one reply: length, style preferences, and plugin-related needs go straight into the guidance, while quotes and attachments are arranged by the parallel reply supplementer. When off, the original `reply` tool is used. Toggles take effect from the next round of thinking; Focus is unaffected.

**Attention drift** — group and private chats each have a full set of settings; the switch, level, anchor policy, and reaction style are independent. `drift_level` sets the drift amplitude (`subtle` most restrained, `wild` most active), `anchor_policy` how strongly the topic is pulled back, and `reaction_style` the density of short reactions and interjections.

**Focus** — `focus_mode = true` lets chats in the same group share one continuously thinking Planner: all messages enter a shared context, tools address a target through `session_id`, sessions collaborate, waits are unified, and an @ mention wakes the thinking early. `focus_groups` splits chats into sharing groups that do not preempt each other; unmatched chats each form their own group. `focus_chat_whitelist` limits which chats enter Focus; empty means all chats matching the type switches may enter.

**Learning rules are not in this section** — expression and jargon learning scopes are configured in `[expression].learning_list` / `[jargon].learning_list`; see [Learning Systems](#learning-systems). The old `[experimental]` learning fields have been removed.

#### Message Receiving

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[message_receive]
ban_words = []              # Messages containing these words are filtered, e.g. ["ads", "giveaway"]
ban_msgs_regex = []         # Filter messages by regex; invalid regex fails config validation
```

:::

#### Keyword Reactions

When a keyword or regex matches, Mai receives an extra **reaction prompt**, used as an instruction for generating a reply:

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
expression_checked_only = false       # Only use manually curated expressions; when off, uncurated ones are used too
expression_self_reflect = true        # Let an AI review entries before writing, less weird content
use_vector_expression = false         # Expression selection: false = fast (default) / true = fine (needs an embedding model)
expression_vector_index_path = "data/expression_selection/expression_vector_index.json"  # [Advanced]
expression_vector_candidate_pool_size = 50  # [Advanced] Candidates handed to the LLM after vector recall, hard cap 50
max_expression_learner = 3            # [Advanced] Learning tasks running at the same time
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
expression_groups = []                # Multiple chats share learned expressions
learning_blacklist = []               # Sources to skip, matched exactly by platform and user ID
```

:::

**Key points:**

- **`use_vector_expression`** — expression selection has two modes: `false` fast (default), which injects a weighted random pick directly without an extra model call; `true` fine, which uses expression intent and embedding recall followed by LLM filtering, and needs an embedding model. The retro reply mode does not use expression selection.
- **`expression_checked_only`** — defaults to `false`, so expressions you have not curated are used as well; set it to `true` if Mai should only use expressions you have reviewed
- **`learning_list`** — each rule covers one scope: `use` controls whether learned content is used, `learn` whether learning continues, and `type` accepts `"group"`/`"private"`. There are three ways to write the scope, and the most specific one wins:
  - **A specific chat** — fill in `item_id` (group number or user ID); `platform` is optional
  - **Platform default** — fill in only `platform` and leave `item_id` empty; covers chats on that platform with no rule of their own
  - **Global default** — leave both empty; used when nothing above matched

  `item_id` does not support the `"*"` wildcard; leave it empty for default rules.

- **`learning_blacklist`** — matched exactly by platform and user ID; messages from listed users are not learned as expressions, while chat context is kept as usual. Both `platform` and `user_id` are required:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[expression.learning_blacklist]]
platform = "qq"
user_id = "123456789"   # This user's messages will not be learned as expressions
```

:::

The expression vector index automatically handles new data, backfill, and failure recovery. Corrupted index files are rebuilt automatically; no configuration is needed.

#### Jargon Learning

Fields are identical to the `learning_list` and `learning_blacklist` of [expression](#expression-learning), but the learning target is group slang and memes:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[jargon]
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
jargon_groups = []  # Multiple chats share learned jargon
learning_blacklist = []  # Do not learn from these users' messages

[[jargon.learning_blacklist]]
platform = "qq"
user_id = "123456789"
```

:::

### Output and Persona

#### Vision

Controls how image messages enter the planner and replyer. **Whether images are sent directly is decided automatically by model capability**: multimodal input is enabled only when every model configured for a task (such as `planner`) has `visual = true`; otherwise it degrades to plain text plus recognition results.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[visual]
image_quality = "normal"               # Image quality: "normal" (longest edge 512) / "high" (longest edge 1024)
max_image_num = 64                     # [Advanced] Max images per multimodal request
wait_image_recognize_max_time = 32     # Longest wait for image recognition, seconds; 0 = no wait
handle_oversized_images = true         # Automatically compress or drop oversized images
max_image_size_mb = 16.0               # Images above this size count as oversized; 0 = unlimited
oversized_image_handle_method = "compress"  # "compress" then keep using / "discard" drop it

[visual.image_cache_cleanup]
enabled = true                 # Automatically clean up long-unused image caches
check_interval_hours = 6.0     # Check interval in hours
image_file_retention_days = 14    # Days an unused image file is kept
no_file_result_retention_days = 30  # Days the recognition result outlives the deleted file
```

:::

**Image quality** — `image_quality` controls the quality of ordinary chat images sent to the planner and replyer: Normal keeps a longest edge of 512 pixels, High 1024 pixels with more detail and higher usage. Images are scaled proportionally, never upscaled, and original images and stickers are untouched.

#### Emoji Stickers

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[emoji]
use_new_send_logic = false # New sending mode: the thinking model looks at the stickers itself and picks one, sent after the text reply; the thinking model must support vision
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

#### HTTP Service

File transfers and the WebUI share one backend HTTP listener. **Changing this requires a restart**:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[http]
host = ["127.0.0.1", "::1"]  # Listen addresses; for external access use ["0.0.0.0", "::"]
port = 8001                  # Port shared by file transfers and the WebUI
```

:::

The `HTTP_HOST` environment variable appends listen addresses; Docker deployments still using the old `WEBUI_HOST` name are recognized automatically. `webui.enabled = false` only turns off the management pages and management API; public file transfers keep using this listener. Port `7999` is for front-end development only, not the WebUI entry point.

#### WebUI

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[webui]
enabled = true            # Whether to load the WebUI and its management API
mode = "production"       # "production" for daily use / "development" for debugging
webui_style = 2           # Interface style: 0 old / 1 retro-future / 2 millennium

anti_crawler_mode = "basic"  # Anti-crawler: "basic" log only / "strict" / "loose" block more / "false" off
allowed_ips = "127.0.0.1"    # IPs allowed to access, comma separated, CIDR and wildcards supported
trusted_proxies = ""         # Trusted reverse-proxy IPs, comma separated
trust_xff = false            # Whether to trust the real visitor IP from X-Forwarded-For
secure_cookie = false        # Send the login cookie only over HTTPS; do not enable without HTTPS
enforce_public_outbound_url = true  # Restrict WebUI outbound URLs, lowering intranet-access risk
```

:::

::: warning The listen address and port live elsewhere
`host` / `port` have moved to `[http]`; restart MaiBot after changing them. When opening external access, tighten `allowed_ips` at the same time.
:::

#### Files

`[files]` controls attachment storage and transfers; the master switch is `[capabilities].files`, and both must be on. All fields hot-reload:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[files]
max_file_mib = 50              # Per-file size cap (MiB), checked against received bytes
max_storage_gib = 10           # Instance storage quota (GiB), covering downloads, originals, and upload reserves
max_text_mib = 8               # Text parsing cap (MiB); larger files can still be sent and downloaded
cache_days = 30                # Days to keep platform download caches after last access; local uploads and generated originals are never auto-deleted
max_concurrent_transfers = 4   # Max simultaneous uploads and downloads
transfer_timeout = 120         # Per-transfer timeout in seconds
transfer_base_url = ""         # Backend address the QQ client can reach; empty = the local [http] address
trusted_download_origins = []  # Intranet adapter origins allowed for downloads, exact http(s)://host:port
```

:::

**`transfer_base_url`** — required when the QQ client and the main program run on different machines; fill in an HTTP(S) address the client can reach, and set up reverse proxy and firewall rules accordingly. **`trusted_download_origins`** — only needed when a platform hands out private-network download URLs; write exact origins, wildcards are not accepted.

#### Desktop Pet

The desktop pet is built into the main program and supports Windows only. The settings hot-reload; turning the switch off closes the window:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[desktop_pet]
enabled = false              # Show Mai on the local Windows desktop
chat_tools_enabled = false   # Let the owner chat query other chat streams and hand off tasks
skin_id = "builtin"          # Current skin; builtin is the bundled Mai, declarative skin packs can be imported
```

:::

**`chat_tools_enabled`** — applies only to the `internal / owner` session shared by the pet and the web chat room; ordinary group chats never get these two tools, and sending images is unaffected. See [Desktop Pet](../desktop-pet.md) for skins, animations, and plugin extension buttons.

#### Computer

`[computer]` is the shared sandbox computer, independent of the external connections in `[agent]`:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[computer]
enabled = false            # Offer the shared sandbox computer and WebUI takeover view to the Planner, sub-agents, and external Agents
networking = true          # Allow sandbox networking; applies on the next sandbox start
memory_mb = 4096           # [Advanced] Sandbox memory (MB), applies on next start
startup_timeout = 120      # [Advanced] Seconds to wait for sandbox startup
request_timeout = 60       # [Advanced] Seconds to wait for a proxy reply
screenshot_max_edge = 1600 # [Advanced] Longest screenshot edge in pixels; 0 = original resolution
```

:::

While a human is taking over, all autonomous input is refused. The sandbox computer works without enabling the external Agent.

#### MCP

The `[mcp]` section only holds the master switch; the server list, Sampling, Roots, and more are documented in **[MCP Configuration](/en/manual/configuration/mcp-config)**:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[mcp]
enable = true  # Whether to enable MCP tool integration
```

:::

::: tip MCP server connections are rebuilt automatically
After you save a change to `[mcp]`, MaiBot rebuilds the MCP connections with the new configuration — no restart needed, and the result is logged exactly as it is at startup. A few fields outside the reload signature (such as the whole `elicitation` section) still require a restart; see [MCP Configuration](./mcp-config.md).
:::

#### Agent Connection

`[agent]` has two uses that share one set of ACP connection settings: an external Agent running in parallel with normal chat, and letting the Planner of selected chat streams use an external Agent for decisions (experimental). Models and credentials always come from the external Agent's own configuration. The sandboxed desktop belongs to `[computer]` and is unrelated to this section.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[agent]
enabled = false                # Enable the external Agent interface (runs in parallel with normal chat)
planner_enabled = false        # [Experimental] External Planner master switch
planner_sessions = []          # [Advanced] session_id list of chats using the external Planner
connection = "dsh"             # "dsh" dsh CLI / "dsh_desktop" dsh Desktop / "custom" custom ACP
acp_command = "dsh"            # Executable of the external Agent; on Windows use dsh.cmd
acp_cwd = ""                   # Host directory where the external process starts; empty = data/agent/workspace
acp_remote_cwd = ""            # [Advanced] Absolute path of an existing remote session directory; empty = local working directory
desktop_manifest = ""          # [Advanced] dsh Desktop bridge file; empty = ~/.dsh/maibot-desktop.json
mcp_port = 0                   # [Advanced] Tool call-back port; 0 = auto-assign a loopback port
```

:::

- **dsh CLI / dsh Desktop** — dsh CLI starts automatically with `--profile acp`; dsh Desktop connects to the running desktop app and requires the dsh-maibot-bridge plugin installed in Desktop first. The same session appears on both sides
- **Custom ACP** — with `connection = "custom"`, pass arguments item by item via `acp_args`, extend the environment with `acp_env`, and pick a model option with `acp_model`; `acp_timeout` bounds handshake and shutdown waits
- **External Planner** — with `planner_enabled = true`, only chats listed in `planner_sessions` are affected; `enabled` is not required. A failed connection raises an error instead of falling back to the built-in Planner; clearing a chat resets its session
- **Remote connections** — across machines, set `acp_remote_cwd` to an absolute path that already exists on the remote host, fix `mcp_port` and forward it yourself over SSH; keep `0` when several chats share the external Planner. Full steps in [External Agent Connections](/en/develop/agent-connections)

#### Plugin Management

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]  # Users allowed to manage plugins via chat commands, format platform:QQ
silent_permission_denied = false  # Silently block unauthorized commands instead of sending a notice
disabled_commands = []         # Disabled command IDs, format plugin_id.command_name; the built-in one is core.clear
```

:::

- **`permission`** — users allowed to manage plugins through chat commands
- **`silent_permission_denied`** — when on, unauthorized commands are silently blocked and only logged, with no reply notice; useful for groups where you do not want to expose management hints
- **`disabled_commands`** — commands disabled on the command-management page; for example `["core.clear"]` turns off the built-in context-clear command, and `["my-plugin.some_command"]` disables a plugin command

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

memory_diagnostics_enabled = true             # [Advanced] Standalone memory diagnostics log; at most four 5 MiB files, restart to apply
memory_diagnostics_deep_enabled = false       # [Advanced] tracemalloc allocation-site comparison (every ten minutes); extra overhead, restart to apply
memory_diagnostics_interval_seconds = 60.0    # [Advanced] Lightweight memory diagnostics interval (seconds, min 10), restart to apply

event_loop_watchdog_enabled = false    # [Advanced] Record event-loop stalls, for diagnosing UI/main-loop freezes
event_loop_watchdog_warn_seconds = 0.5 # [Advanced] Log a warning once the event loop wake-up delay exceeds this many seconds

suppress_libraries = ["faiss", "httpx", "httpx2", "urllib3", "asyncio", "websockets", "httpcore", "httpcore2", "requests", "sqlalchemy", "openai", "uvicorn", "jieba"]  # [Advanced] Third-party libraries whose logs are fully hidden
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
save_maisaka_reasoning = true         # Save full reasoning records of the Planner, tool calls, and chat recall for the WebUI
replyer_retro_prompt = false          # Organize the Replyer prompt the legacy (0.12.x) way, with all instructions in a single template
force_plugin_compatibility = false    # Skip the plugin-declared Host/SDK version check and load directly; takes effect after a restart
keep_prompt_preview_json_base64 = false  # [Advanced] Keep image base64 in prompt previews; reproducible but large
record_tool_structured_content = false   # [Advanced] Save structured tool results; grows the database
enable_llm_cache_stats = false           # [Advanced] Record prompt-cache statistics, for performance debugging
```

:::

**Key points:**

- **Terminal input** — `enable_console_input` is on by default: in an interactive terminal you can type ordinary messages or manage chats and adapters with `/clear`, `/pm`, `/offline`, `/online`, `/help`, and type `exit()` to close it. A non-interactive terminal (systemd, nohup, `docker run` without `-it`) only logs one extra warning and is otherwise unaffected; changing this requires a restart
- **Force plugin compatibility** — `force_plugin_compatibility = true` skips the Host/SDK version-range checks declared by a plugin manifest and loads it anyway; it is **only a temporary fallback** and may load plugins that are in fact incompatible. It logs a single warning and does not affect the plugin market's version compatibility filtering. Requires a restart
- **The `/clear` command** — `/clear` is a built-in command available by default; to disable it, use `[plugin].disabled_commands = ["core.clear"]`
- **Retro reply prompt** — with `replyer_retro_prompt = true`, the Replyer prompt is organized the legacy (0.12.x) way: all reply instructions live in a single complete template sent as one `user` message, and the dialogue history is rendered as plain text into template placeholders instead of being sent as image Items. Group chat, "short reply", private chat, and "private chat replying to Mai herself" each use their own template (`retro_replyer`, `retro_replyer_light`, `retro_private_replyer`, `retro_private_replyer_self`); they appear under **Prompt Management** collapsed as "advanced" and can be edited or given custom versions. Changes hot-reload

#### Telemetry

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[telemetry]
enable = true  # Send anonymous usage statistics; turning it off does not affect functionality
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

**Change had no effect** — the section you touched may be startup-only: `[http]` and `[maim_message]` listen addresses and ports, `[plugin_runtime]` IPC, `[log]`'s `event_loop_watchdog_*`, `[debug]`'s `enable_console_input` and `force_plugin_compatibility`. Restart MaiBot. For everything else see [Configuration Overview](./index.md#does-it-take-effect-immediately).

**Mai ignores people** — check in order: does the host adapter policy allow this group (see "Add the allow scope first, then test" in the [Unified QQ Connector](/en/manual/adapters/qq-local-client)); is `talk_value` set too low; does `qq_account` match the adapter's logged-in QQ.

**Mai floods the chat** — lower `talk_value` (e.g. 0.3); cap messages per reply with `response_splitter.max_sentence_num` and `max_split_num`; note that `emoji_send_num` is only the candidate pool size — lowering it does not reduce talk frequency.

**Manually added fields disappear** — the config file is upgraded by the program, and unknown or misspelled fields (e.g. `max_context_size` misspelled as `max_context_len`) are cleaned back to defaults on the next start. Launch once to let the program generate/upgrade the file, then edit the generated fields.

**Personality change feels ineffective** — personality only affects newly generated replies; messages already sent stay unchanged. After confirming the reload message in the log, observe a few more rounds; for occasional style swings try `multiple_reply_style` + `multiple_probability`.

## Next Steps

- Configure models: [Model Configuration](/en/manual/configuration/model-config)
- Advanced model parameters (thinking mode, etc.): [Model Extra Parameters](/en/manual/configuration/model-extra-params)
- Long-term memory in depth: [A_Memorix Configuration](/en/manual/configuration/amemorix-config)
- External tools: [MCP Configuration](/en/manual/configuration/mcp-config)
- Connect QQ: [Unified QQ Connector](/en/manual/adapters/qq-local-client)
- Configure in the browser: [WebUI Config Management](/en/manual/webui/config-management)
