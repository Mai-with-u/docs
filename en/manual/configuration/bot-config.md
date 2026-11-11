---
title: Bot Configuration
titleTemplate: :title · Configuration
---

# Bot Configuration

All of MaiBot's main settings live in a single file: `config/bot_config.toml` — bot identity, personality, chat behavior, memory, emoji, logging, WebUI, MCP, the plugin runtime, and more. The file is generated automatically after the first launch of MaiBot, and upgraded by the program afterwards — **just change the values; never add fields that do not exist**. Every field ships with a default, so **the defaults work out of the box** — change only what you actually want to tune.

::: tip Prefer not to edit files?
Every setting can also be changed in the WebUI with a few clicks (default `http://127.0.0.1:8001`), with the same effect as editing the file. See [WebUI Config Management](/en/manual/webui/config-management).
:::

After saving, most settings are **hot-reloaded** and take effect immediately. Listen addresses, ports, TLS, and access protection live in `host/config.toml`, and changing them requires restarting the host. See [Configuration Overview](./index.md#does-it-take-effect-immediately) for the full rules.

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
When using the OneBot Adapter, `qq_account` must exactly match the QQ number logged in on the adapter, otherwise Mai treats her own messages as other people's. When the adapter reports identity normally these two fields are only fallbacks, but keeping them consistent is always correct. See the [OneBot Adapter](/en/manual/adapters/qq-local-client).
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
mentioned_bot_reply = true   # Reply more easily when a message mentions Mai's name
```

:::

Use speaking-rate rule groups to set a frequency for a specific chat and time window. For example, drop QQ group 123456 to 0.3 overnight:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing.talk_rule_groups]
active_group = "Night"

[[chat.reply_timing.talk_rule_groups.groups]]
name = "Night"

[[chat.reply_timing.talk_rule_groups.groups.rules]]
platform = "qq"
item_id = "123456"
rule_type = "group"
time = "23:00-02:00"
value = 0.3
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
creative_mode = true             # Build the prompt once per reply to keep expression varied and cut stock AI phrasing; disabling may raise cache hit rate
enable_reply_at = true           # Let Mai @-mention people at the start of a reply; the model decides when
max_context_size = 50            # How many recent messages a group reply considers; more context costs more tokens
max_private_context_size = 75    # Recent messages considered for private replies
```

:::

When the context is nearly full, Mai compresses the older conversation into a state summary and always sends it with the Planner context. Summary length comes from a built-in policy with no setting. Chat recall and long-term memory are handled by A_Memorix, see [A_Memorix Configuration](./amemorix-config.md).

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
mentioned_bot_reply = true                 # Reply more easily when a message mentions Mai's name
inevitable_at_reply = true                 # Try to reply when @-mentioned
no_action_backoff_base_seconds = 15        # After consecutive no-reply decisions, how long to wait before the next check (seconds)
no_action_backoff_cap_seconds = 300        # [Advanced] Upper bound of the backoff wait (seconds)
no_action_backoff_start_count = 2          # [Advanced] Start slowing down after this many consecutive no-replies
no_action_backoff_bypass_pending_count = 6 # [Advanced] Re-process immediately once this many new messages pile up; 0 = never bypass by count
```

:::

**Speaking-rate rule groups** — `active_group` selects the group in effect; rules inside it match on platform, chat, and time window, and chats matching no rule fall back to `talk_value`. Create, copy, and switch groups in WebUI.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing.talk_rule_groups]
active_group = "Night"   # Group in effect; a single group named "默认" exists by default

[[chat.reply_timing.talk_rule_groups.groups]]
name = "Night"

[[chat.reply_timing.talk_rule_groups.groups.rules]]
enabled = true           # Disabled rules stay but no longer match
platform = "qq"          # Empty = any platform; "*" = any platform
item_id = "123456"       # Empty = any chat; "*" = any chat
rule_type = "group"      # group / private
time = "23:00-02:00"     # Empty = fallback, "*" = all day, overnight windows supported
value = 0.3              # Rate under this rule: 0 is quieter, 1 is the normal rate
```

:::

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
tool_result_condense = false           # Condense long tool results into a conclusion before writing them to context
tool_result_condense_threshold = 3000  # [Advanced] Character count that triggers condensing; minimum 500
```

:::

**Files** — `files = true` turns on attachment registration, model file tools, the plugin SDK file interface, and the WebUI files page; this one switch controls all of them. When off, new file operations are refused and existing originals are not deleted. Size, quota, and transfer settings live in `[files]`; see [Services and Connections](#files).

**Sub-agents** — `planner_subagent = true` gives the Planner a `subagent` tool: a self-contained research or summarization task runs in its own context and calls authorized tools over multiple rounds in the background. Dispatch returns a task ID immediately so Mai can keep chatting; when the sub-agent finishes, its conclusion returns as a new message that wakes the Planner, and tools for checking task status and terminating a task come with it.

**Condensing long tool results** — with `tool_result_condense = true`, a tool result reaching `tool_result_condense_threshold` characters (default 3000, minimum 500) is first condensed by a sub-agent according to the Planner's current intent, then written to context. This reduces context usage in later rounds at the cost of one extra model request.

#### Experimental Features

The whole section is advanced; everything is off by default — opt in per feature.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[experimental]
passive_replyer = false               # Passive reply: when the Planner outputs text without calling tools, the text guides one reply
reply_cache = false                   # Reuse this round's Planner request prefix and append only the creative reply, cutting repeated cost
super_creative_mode = false           # Super creative: the Replyer first writes in the chosen language, then the same model translates back to Chinese
super_creative_language = "ja-JP"     # Language used for super creative generation: "ja-JP" / "ru-RU" / "fr-FR" / "zh-classical"
desktop_pet_exploration_enabled = false  # Let the desktop pet start exploration tasks and reuse what it learned in the owner's chat

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

**Rich replies** — Replies can carry images, quotes, stickers, and @ mentions directly: @ mentions follow [`[chat].enable_reply_at`](#context-and-recall), and the model for sticker sending is chosen by `[model_task_config].emoji`.

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
max_reg_num = 64           # Max number of usable stickers kept
do_replace = true          # [Advanced] When full, new stickers replace old ones; off = stop collecting
check_interval = 10        # Check the sticker library every N minutes
steal_emoji = true         # Scan the sticker directory periodically and register candidates; when off, chat stickers are still cached for recognition
max_emoji_size_mb = 5.0    # [Advanced] Size limit for collected stickers; 0 = unlimited
content_filtration = false # [Advanced] Only keep stickers with suitable content

[emoji.cache_cleanup]
enabled = true                  # Clean up unregistered sticker caches (registered ones are never deleted)
check_interval_hours = 6.0      # Check interval in hours
emoji_file_retention_days = 30  # Days an unused unregistered sticker file is kept
no_file_record_retention_days = 30  # Days the description record outlives the deleted file
```

:::

**The model that picks stickers** — stickers are chosen by `[model_task_config].emoji`; when left empty, the selection falls back to "use the planner if it is fully visual, otherwise use vlm".

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

Typos are handled by the built-in "Mai's Toolkit" plugin and configured in that plugin's own `config.toml`, not in `bot_config.toml`:

::: code-group

```toml [plugins/chinese_typo/config.toml ~vscode-icons:file-type-toml~]
[plugin]
enabled = true                    # Enable Mai's Toolkit
config_version = "1.0.0"          # Plugin config version, managed by the program

[typo]
mode = "rule"                     # Generation mode: "rule" builds typos from pinyin and character frequency / "dictionary" uses only the bundled confusable pairs
dictionary_probability = 0.1      # Dictionary mode only: typo chance per reply
enable_correction_quote = true    # Quote the typo message when correcting it
correction_quote_probability = 1.0  # [Advanced] Chance a correction message quotes the original
error_rate = 0.01                 # [Advanced] Rule mode only: chance a single character becomes a typo
min_freq = 9                      # [Advanced] Rule mode only: only build typos on characters at least this common
tone_error_rate = 0.1             # [Advanced] Rule mode only: chance of a similar-tone typo
word_replace_rate = 0.006         # [Advanced] Rule mode only: chance a whole word is replaced
```

:::

The plugin config hot-reloads, so no host restart is needed.

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

`[maim_message]` keeps only the message protocol itself:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[maim_message]
enabled = true                    # Master switch; off stops both the legacy WS and the new API, plugin adapters are unaffected
auth_token = []                   # Auth tokens for the classic protocol; empty = reject every connection
enable_api_server = false         # Turn on the new API Server so external programs can call Mai
api_server_allowed_api_keys = []  # API key allowlist for the new API; empty = reject every connection
```

:::

Listen addresses and ports are not here. The host opens a single HTTP port (`[webui].port` in `host/config.toml`) and external adapters pick their target Bot by path:

```text
ws://<host-address>:<host-port>/maim/<bot_id>/ws     # classic protocol
ws://<host-address>:<host-port>/maim/<bot_id>/api    # new API; the target Bot also needs enable_api_server = true
```

`bot_id` must be a 32-character hexadecimal string and the protocol segment can only be `ws` or `api`; an invalid path closes with 1008, and an unknown or not-ready Bot closes with 1013. The old root paths `/ws`, `/api`, and separate ports are no longer compatible.

::: warning Add auth before exposing to the public internet
Both credential lists reject every connection when empty. Serving external clients means configuring `auth_token` or `api_server_allowed_api_keys`.
:::

#### Host Networking

The browser access address, the file transfer address, and the login cookie belong to host config, not `bot_config.toml`, and changing them restarts the host:

::: code-group

```toml [host/config.toml ~vscode-icons:file-type-toml~]
[webui]
enabled = true                    # When off, the management pages and management API stop responding; file transfers still work
hosts = ["127.0.0.1", "::1"]      # Listen addresses; for remote access use ["0.0.0.0"] or add the server IP
port = 8001                       # Port shared by browser access and file transfers
public_base_url = ""              # Public address external clients use to fetch files; empty = local address
ssl_certfile = ""                 # HTTPS certificate path; must be set together with ssl_keyfile
ssl_keyfile = ""                  # HTTPS private key path
secure_cookie = false             # Send the login cookie only over HTTPS; leave off without HTTPS
anti_crawler_mode = "basic"       # Anti-crawler: "false" off / "basic" log only / "loose" loose blocking / "strict" strict blocking
allowed_ips = "127.0.0.1"         # Sources exempt from anti-crawler rules, comma separated, CIDR and wildcards supported
trusted_proxies = ""              # Trusted reverse-proxy IPs, used together with trust_xff
trust_xff = false                 # Whether to take the real visitor IP from X-Forwarded-For
```

:::

The `HTTP_HOST` environment variable appends listen addresses (the old `WEBUI_HOST` name still works and Docker relies on it to listen on the container interface). `enabled = false` only turns off the management pages and management API; public file transfers keep using this listener. Port `7999` is for front-end development only, not the WebUI entry point.

::: warning Interface style and outbound checks live in bot_config.toml
`[webui]` in `bot_config.toml` still has two fields: `webui_style` (interface style) and `enforce_public_outbound_url` (restrict WebUI access to intranet URLs). Listen-related fields exist only in `host/config.toml`.
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
transfer_timeout = 120         # Per-transfer timeout in seconds; 10~3600
trusted_download_origins = []  # Intranet adapter origins allowed for downloads, exact http(s)://host:port
```

:::

**Cross-machine access** — when the QQ client and the main program run on different machines, set `[webui].public_base_url` in host config to an HTTP(S) address the client can reach, and set up reverse proxy and firewall rules accordingly; this one field generates file links for every Bot.

**`trusted_download_origins`** — only needed when a platform hands out download URLs on the intranet; write exact origins, wildcards are not accepted, and never list a service users can control.

#### Desktop Pet

The desktop pet is built into the main program; the settings hot-reload, and turning the switch off closes the window:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[desktop_pet]
enabled = false                    # Turn on the local desktop pet, or accept remote desktop-pet connections
mode = "local"                     # local opens the window on this Windows machine / remote waits for a Windows client
skin_id = "builtin"                # Current skin ID; builtin is the bundled Mai and hot-swaps
chat_tools_enabled = false         # Let the owner session query other chat streams and wake them to relay a message
show_current_task = false          # Show the current action caption at the bottom; requires a working fast_model
proactive_wake_enabled = false     # Wake the owner chat stream periodically to explore on its own; calls models
proactive_wake_interval_minutes = 30  # Wake interval, 1~1440 minutes
screen_read_enabled = false        # Let a screenshot of the primary screen go to the chat model; off by default
screen_read_interval_seconds = 10  # Delivery interval for changed frames, 2~3600 seconds, at most 6 frames per batch
screen_sample_interval_seconds = 2 # Screenshot sampling interval, 0.5~30 seconds
screen_change_threshold = 0.015    # Changed-pixel ratio threshold; lower is more sensitive, 0.015 means 1.5%
```

:::

- **`mode`** — `local` opens a window on this machine; `remote` waits for a standalone Windows client to connect, so the server can run Linux. One pet at a time.
- **`chat_tools_enabled`** — applies only to the `internal / owner` session shared by the pet and the web chat room; ordinary group chats never get these two tools, and sending images is unaffected.
- **`screen_read_*`** — screenshots may contain private information on screen, so this is off by default and grants no mouse or keyboard control.
- **`proactive_wake_*`** — the timer restarts after a reboot or a desktop pet config change and does not catch up on cycles missed while offline.

#### MCP

The `[mcp]` section controls whether MCP is enabled.

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[mcp]
enable = true  # Whether to enable MCP tool integration
```

:::

::: tip MCP server connections are rebuilt automatically
After you save a change to `[mcp]`, MaiBot rebuilds the MCP connections with the new configuration — no restart needed, and the result is logged exactly as it is at startup. A few fields outside the reload signature (such as the whole `elicitation` section) still require a restart.
:::

#### Agent Connection

`[agent]` has two uses that share one set of ACP connection settings: an external Agent running in parallel with normal chat, and letting the Planner of selected chat streams use an external Agent for decisions (experimental). Models and credentials always come from the external Agent's own configuration.

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
allow_users = []               # Private chat allowlist, format platform:user_id; group chats cannot be told apart by member
allow_groups = []              # Group chat allowlist, format platform:group_id
acp_args = []                  # [Advanced] Custom ACP only: pass arguments item by item; {mcp_port} is replaced with this run's port
acp_env = {}                   # [Advanced] Extra or overridden environment variables for the external process
acp_model = ""                 # [Advanced] Model option value for the external Agent; empty = use its own config
acp_timeout = 60               # [Advanced] Seconds to wait for the handshake, session restore, and cancel acknowledgement
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
enable_console_input = true           # Enable local message and command input in an interactive terminal
show_maisaka_thinking = false         # Show the thinking box in the terminal; does not affect saved reasoning or the WebUI
save_maisaka_reasoning = true         # Save full reasoning records of the Planner, tool calls, and chat recall for the WebUI
gemini_reply_compatibility = false    # Tolerate explicit thinking tags and Gemini's non-standard separators in reply text
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
- **Reasoning records** — `save_maisaka_reasoning` saves the full reasoning of the Planner, tool calls, and chat recall for viewing in the WebUI; `show_maisaka_thinking` only adds a box in the terminal, and the two are independent

#### Telemetry

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[telemetry]
enable = true  # Send anonymous usage statistics; turning it off does not affect functionality
```

:::

#### Long-term Memory

A_Memorix is a standalone long-term memory subsystem split into storage, integration, embedding, retrieval, thresholds, filtering, episodes, person profiles, memory evolution, advanced runtime, and web operations — see **[A_Memorix Configuration](/en/manual/configuration/amemorix-config)** for the full reference. The minimal enable is two lines:

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

**Change had no effect** — the section you touched may be startup-only: listen addresses, ports, TLS, and access protection in `host/config.toml`, `[maim_message].enabled`, `[plugin_runtime]` IPC, `[log]`'s `event_loop_watchdog_*` and `memory_diagnostics_*`, `[debug]`'s `enable_console_input` and `force_plugin_compatibility`. Restart the host. For everything else see [Configuration Overview](./index.md#does-it-take-effect-immediately).

**Mai ignores people** — check in order: does the host adapter policy allow this group (see "Add the allow scope first, then test" in the [OneBot Adapter](/en/manual/adapters/qq-local-client)); is `talk_value` set too low; does `qq_account` match the adapter's logged-in QQ.

**Mai floods the chat** — lower `talk_value` (e.g. 0.3), or use a speaking-rate rule group to lower this one chat's rate; `response_splitter.max_sentence_num` and `max_split_num` cap the messages in a single reply.

**Manually added fields disappear** — the config file is upgraded by the program, and unknown or misspelled fields (e.g. `max_context_size` misspelled as `max_context_len`) are cleaned back to defaults on the next start. Launch once to let the program generate/upgrade the file, then edit the generated fields.

**Personality change feels ineffective** — personality only affects newly generated replies; messages already sent stay unchanged. After confirming the reload message in the log, observe a few more rounds; for occasional style swings try `multiple_reply_style` + `multiple_probability`.

## Next Steps

- Configure models: [Model Configuration](/en/manual/configuration/model-config)
- Advanced model parameters (thinking mode, etc.): [Model Extra Parameters](/en/manual/configuration/model-extra-params)
- Long-term memory in depth: [A_Memorix Configuration](/en/manual/configuration/amemorix-config)
- Connect QQ: [OneBot Adapter](/en/manual/adapters/qq-local-client)
- Configure in the browser: [WebUI Config Management](/en/manual/webui/config-management)

