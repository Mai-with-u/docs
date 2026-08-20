---
title: Bot Configuration
titleTemplate: :title · Configuration
---

# Bot Configuration

`bot_config.toml` is MaiBot's main configuration file. It contains bot identity, personality, chat behavior, memory, learning, emoji, WebUI, MCP, plugin runtime, and all other main settings.

The configuration file is generated and upgraded automatically by MaiBot. It is not recommended to manually add fields that do not exist.

---

# Basics

Bot identity information, including platform, account, nickname, etc.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[bot]
platform = ""
qq_account = ""
platforms = []
nickname = "麦麦"
alias_names = []
```

:::

**`platform`** — Platform identifier. **Type**: `str`. **Default**: `""`. Fill in the platform name, e.g. `qq`.

**`qq_account`** — QQ account. **Type**: `str`. **Default**: `""`. The QQ number the bot logs in with (string format), used to recognize @-mentions and its own messages.

**`platforms`** — Other platform list. **Type**: `list[str]`. **Default**: `[]`. Fill in for multi-platform deployments.

**`nickname`** — Bot nickname. **Type**: `str`. **Default**: `"麦麦"`. The name shown in chat.

**`alias_names`** — Alias list. **Type**: `list[str]`. **Default**: `[]`. Used to decide whether to reply when the bot is mentioned.

---

# Personality

Controls MaiBot's persona and language style.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[personality]
personality = "你是一个大二女大学生，现在正在上网和群友聊天。"
reply_style = "你的风格平淡简短。可以参考贴吧，知乎和微博的回复风格。不浮夸不长篇大论，不要过分修辞和复杂句。尽量回复的简短一些，平淡一些"
multiple_reply_style = [
  "你的风格平淡但不失讽刺，很简短，很白话。可以参考贴吧，微博的回复风格。",
  "用 1-2 个字进行回复",
  "用 1-2 个符号进行回复",
  "言辭凝練古雅，穿插《論語》經句卻不晦澀，以文言短句為基，輔以淺白語意，持長者溫和風範，全用繁體字表達，具先秦儒者談吐韻致。",
  "带点翻译腔，但不要太长",
]
multiple_probability = 0
```

:::

**`personality`** — Persona setting. **Type**: `str`. **Default**: `"你是一个大二女大学生，现在正在上网和群友聊天。"`. Recommended within 200 characters, using second person to describe personality traits and identity.

**`reply_style`** — Default expression style. **Type**: `str`. **Default**: see the configuration above. Describes the speaking style and habits; recommended 1-2 lines.

**`multiple_reply_style`** — Backup expression style list. **Type**: `list[str]`. **Default**: contains 5 default styles. Randomly selects one for temporary injection with probability `multiple_probability`.

**`multiple_probability`** — Style replacement probability. **Type**: `float`. **Default**: `0`. Range: `0.0-1.0`. The probability of randomly replacing with a backup style for each reply. `0` means never replace, `1` means always replace.

---

# Visual

Controls how image messages are handled when entering the planner and the replyer.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[visual]
planner_mode = "auto"
replyer_mode = "auto"
max_image_num = 128
wait_image_recognize_max_time = 10
handle_oversized_images = true
max_image_size_mb = 30.0
oversized_image_handle_method = "compress"

[visual.image_cache_cleanup]
enabled = true
check_interval_hours = 6.0
image_file_retention_days = 14
no_file_result_retention_days = 30
```

:::

**`planner_mode`** — Planner vision mode. **Type**: `str` (enum). **Default**: `"auto"`. **Options**:
- `"auto"` — Automatically choose based on model info
- `"text"` — Text-only mode, no visual input sent
- `"multimodal"` — Multimodal mode, visual input sent

**`replyer_mode`** — Replyer vision mode. **Type**: `str` (enum). **Default**: `"auto"`. Options are the same as above.

**`max_image_num`** — Maximum number of images carried per multimodal request. **Type**: `int`. **Default**: `128`.

**`wait_image_recognize_max_time`** — Max wait for image recognition. **Type**: `float`. **Default**: `10`. **Unit**: seconds. Max seconds to wait for image recognition before a non-visual planner request; `0` means don't wait.

**`handle_oversized_images`** — Handle oversized images. **Type**: `bool`. **Default**: `true`.

**`max_image_size_mb`** — Max image size. **Type**: `float`. **Default**: `30.0`. **Unit**: MB. `0` means no limit.

**`oversized_image_handle_method`** — Method for handling oversized images. **Type**: `str` (enum). **Default**: `"compress"`. **Options**:
- `"compress"` — Compress and continue processing
- `"discard"` — Discard that image component

## Image Cache Cleanup

**`image_cache_cleanup.enabled`** — Whether to automatically clean up long-unused image caches. Enabled by default.

**`image_cache_cleanup.check_interval_hours`** — Cleanup check interval in hours. Default `6.0`.

**`image_cache_cleanup.image_file_retention_days`** — Retention days for image files. Default `14`.

**`image_cache_cleanup.no_file_result_retention_days`** — Retention days for recognition results after the image file is deleted. Default `30`.

---

# Chat

Controls reply frequency, context length, group/private chat prompts, the no_action backoff strategy, and dynamic talk-value rules.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chat]
self_message_special_mark = true
max_context_size = 40
max_private_context_size = 60
enable_context_optimization = true
mid_term_memory = true
mid_term_memory_lenth = 10

[chat.reply_timing]
talk_value = 1.0
private_talk_value = 1.0
mentioned_bot_reply = false
inevitable_at_reply = true
reply_trigger_mode = "frequency"
planner_interrupt_max_consecutive_count = 0
max_consecutive_wait_count = 3
no_action_backoff_base_seconds = 15
no_action_backoff_cap_seconds = 300
no_action_backoff_start_count = 2
no_action_backoff_bypass_pending_count = 6
enable_talk_value_rules = false
talk_value_rules = [
  { platform = "", item_id = "", rule_type = "group", time = "00:00-08:59", value = 0.8 },
  { platform = "", item_id = "", rule_type = "group", time = "09:00-18:59", value = 1.0 },
]

[chat.reply_style]
enable_reply_quote = true
group_chat_prompt = "你正在 qq 群里聊天，下面是群里正在聊的内容..."
private_chat_prompts = "你正在聊天，下面是正在聊的内容..."
chat_prompts = []
```

:::

## Field Reference

**`talk_value`** — Group chat frequency. **Type**: `float`. **Default**: `1`. Range: `0-1`. Lower means more silent.

**`private_talk_value`** — Private chat frequency. **Type**: `float`. **Default**: `1`. Range: `0-1`.

**`mentioned_bot_reply`** — Reply when mentioned. **Type**: `bool`. **Default**: `false`.

**`inevitable_at_reply`** — Reply on @-mention. **Type**: `bool`. **Default**: `true`.

**`self_message_special_mark`** — Special mark for own messages. **Type**: `bool`. **Default**: `true`. Further emphasizes which messages were sent by the bot itself, reducing misidentification.

**`max_context_size`** — Group chat context length. **Type**: `int`. **Default**: `40`. In messages.

**`max_private_context_size`** — Private chat context length. **Type**: `int`. **Default**: `60`. In messages.

**`enable_context_optimization`** — Optimize context. **Type**: `bool`. **Default**: `true`. Saves about 50% of Planner context consumption; may affect caching.

**`mid_term_memory`** — Mid-term chat summary. **Type**: `bool`. **Default**: `true`. Generates a mid-term summary when trimming context, keeping it as expandable complex messages. Fallback model is `planner`.

**`mid_term_memory_lenth`** — Number of mid-term summaries to keep. **Type**: `int`. **Default**: `10`. Oldest summaries are removed beyond this.

**`enable_reply_quote`** — Enable quoted replies. **Type**: `bool`. **Default**: `true`.

**`reply_trigger_mode`** — The trigger mode for new messages entering the Planner. **Type**: `str` (enum). **Default**: `"frequency"`. Options: `"frequency"` or `"reply_necessity"`.

**`planner_interrupt_max_consecutive_count`** — Planner consecutive interrupt limit. **Type**: `int`. **Default**: `0`. How many times the Planner re-thinks when new messages arrive; `0` means unlimited.

**`max_consecutive_wait_count`** — Planner consecutive `wait` call limit. **Type**: `int`. **Default**: `3`. No more waiting is allowed this turn beyond this.

## no_action Backoff Strategy

When MaiBot stays silent (no_action) consecutively, it automatically gradually increases the wait interval to avoid frequent meaningless polling.

**`no_action_backoff_base_seconds`** — Backoff base seconds. **Type**: `float`. **Default**: `15`. `0` disables backoff.

**`no_action_backoff_cap_seconds`** — Backoff cap seconds. **Type**: `float`. **Default**: `300`.

**`no_action_backoff_start_count`** — Backoff start point. **Type**: `int`. **Default**: `2`. The nth consecutive no_action after which backoff starts.

**`no_action_backoff_bypass_pending_count`** — Backoff bypass pending count. **Type**: `int`. **Default**: `6`. During backoff, if pending messages reach this count, bypass directly; `0` means never bypass by message count.

**`group_chat_prompt`** — Group chat prompt. **Type**: `str`. **Default**: a longer default text. General notes for group chats.

**`private_chat_prompts`** — Private chat prompt. **Type**: `str`. **Default**: a longer default text. General notes for private chats.

**`chat_prompts`** — Extra prompt list. **Type**: `list[ExtraPromptItem]`. **Default**: `[]`. Extra prompts attached by platform / chat stream.

**`enable_talk_value_rules`** — Enable dynamic talk-value rules. **Type**: `bool`. **Default**: `false`.

## talk_value_rules

Configure talk value by chat stream / time of day; 2 global rules by default:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[chat.reply_timing.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "00:00-08:59"
value = 0.8

[[chat.reply_timing.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "09:00-18:59"
value = 1.0
```

:::

**`platform`** — Platform. **Type**: `str`. **Default**: `""`. Empty together with `item_id` means global fallback; since 1.2.0 you can also use `"*"` for a global wildcard (equivalent to global fallback).

**`item_id`** — User / group ID. **Type**: `str`. **Default**: `""`. Since 1.2.0 you can use `"*"` as a wildcard matching any ID.

**`rule_type`** — Chat stream type. **Type**: `str` (enum). **Default**: `"group"`. **Options**: `"group"` / `"private"`.

**`time`** — Time range. **Type**: `str`. Format: `"HH:MM-HH:MM"`, supports crossing midnight.

**`value`** — Talk value. **Type**: `float`. Range: `0-1`.

Since 1.2.0, `talk_value_rules` supports two special matching modes:

- **Global wildcard** — `platform = "*"`, `item_id = "*"`, applies to any platform / any group or private chat
- **Default fallback** — `platform = ""`, `item_id = ""`, used as the default frequency when no specific rule matches

When editing frequency rules in the WebUI Bot config, you can directly choose the "global wildcard" or "default fallback" mode instead of filling in a specific platform and ID.

## chat_prompts

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[chat.reply_style.chat_prompts]]
platform = "qq"
item_id = "123456"
rule_type = "group"
prompt = "这个群里说话要更简短。"
```

:::

`platform`, `item_id`, `rule_type`, and `prompt` all need to be filled in, otherwise the entry is invalid.

---

# Experimental Features

Experimental features, all off by default.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[experimental]
enable_behavior_learning = false
enable_rich_reply = false
emotion_trait = "neutral"
behavior_learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
behavior_groups = []
focus_mode = false
focus_on_private = false
focus_chat_whitelist = []
focus_groups = []
focus_cool_time = 120

[experimental.attention_drift]
enabled = false
drift_level = "scattered"
anchor_policy = "balanced"
reaction_style = "lively"
```

:::

**`enable_behavior_learning`** — Enable behavior learning. **Type**: `bool`. **Default**: `false`. When off, no longer extracts or writes behavior experience from trimmed history.

**`enable_rich_reply`** — Rich reply capability. **Type**: `bool`. **Default**: `false`. Allows the `reply` action to attach images, stickers, or @-mentions.

**`emotion_trait`** — Experimental emotion trait. **Type**: `str` (enum). **Default**: `"neutral"`. Options: `"rational_calm"`, `"neutral"`, `"sentimental"`.

**`behavior_learning_list`** / **`behavior_groups`** — The chat scope and interop groups for behavior learning. The former defaults to one global group-chat rule; the latter defaults to empty.

**`focus_mode`** — Focus mode. **Type**: `bool`. **Default**: `false`. When on, only one Maisaka is in active focus at a time, ignoring chat frequency control.

**`focus_on_private`** — Enable Focus in private chats. **Type**: `bool`. **Default**: `false`. When off, Focus only applies to group chats.

**`focus_chat_whitelist`** — Focus chat whitelist. Leave empty to allow all chat streams matching the chat-type switches.

**`focus_groups`** — Focus interop groups. **Type**: `list[ChatStreamGroup]`. **Default**: `[]`. Without configuration, all Focus-enabled chats share one Focus; with groups, chats in the same group interop, and different groups can Focus at the same time.

**`focus_cool_time`** — Focus cooldown. **Type**: `int`. **Default**: `120`. **Unit**: seconds. If Focus has not entered its loop for longer than this, a new message from another chat can wake it once.

**`attention_drift`** — Attention drift experimental config. `enabled` is the master switch; other fields control drift strength, the strategy for returning to context, and short reaction style.

---

# Message Receiving

Controls image parsing and message filtering.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[message_receive]
image_parse_threshold = 5
ban_words = []
ban_msgs_regex = []
```

:::

**`image_parse_threshold`** — Image parse threshold. **Type**: `int`. **Default**: `5`. Image parsing is enabled when the number of images in a message does not exceed this value, and skipped otherwise.

**`ban_words`** — Filter word list. **Type**: `set[str]`. **Default**: `{}`. Messages containing these words are filtered.

**`ban_msgs_regex`** — Filter regex list. **Type**: `set[str]`. **Default**: `{}`. Invalid regex causes configuration validation failure.

---

# Memory

A_Memorix is MaiBot's long-term memory system, responsible for memory storage, vectorization, retrieval, person profiles, memory evolution, and Web operations.

Full documentation (12 sub-sections) → **[A_Memorix Configuration Details](./amemorix-config.md)**

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# Quick enable
[a_memorix]

[a_memorix.plugin]
enabled = true
```

:::

---

# Expression Learning

Controls expression learning, AI review, and interop groups.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[expression]
expression_checked_only = true
expression_self_reflect = true
expression_selection_mode = "legacy"
expression_vector_index_path = "data/expression_selection/expression_vector_index.json"
expression_vector_candidate_pool_size = 50
max_expression_learner = 3
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
expression_groups = []
```

:::

**`expression_checked_only`** — Only select manually reviewed expressions. **Type**: `bool`. **Default**: `true`.

**`expression_self_reflect`** — Expression learning AI review. **Type**: `bool`. **Default**: `true`. AI review before writing.

**`expression_selection_mode`** — Expression selection strategy. **Type**: `str` (enum). **Default**: `"legacy"`. Options: `"legacy"`, `"vector"`, `"vector_intent"`.

**`expression_vector_index_path`** — Expression vector index path. Relative paths resolve against the project root.

**`expression_vector_candidate_pool_size`** — Number of vector candidates handed to the expression selection model; hard cap is `50`.

Since 1.2.0, **online maintenance** of the expression vector index has been improved: additions, historical backfill, content changes and failure recovery are all assigned incrementally by the nearest cluster center, combined with optimized k-means++, background computation and lock-free atomic writes, avoiding full-library recomputation on small-batch learning; even if the index JSON is corrupted, it is rebuilt automatically instead of repeatedly restarting with errors. This process requires no configuration and runs automatically.

**`max_expression_learner`** — Max expression learning batch count. **Type**: `int`. **Default**: `3`. A chat stream only ever allows one batch at a time.

**`learning_list`** — Expression learning configuration list. **Type**: `list[LearningItem]`. Defaults to one global group-chat rule.

**`expression_groups`** — Expression learning interop groups. **Type**: `list[ChatStreamGroup]`. **Default**: `[]`. Expression learning results are shared within a group.

### learning_list

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[expression.learning_list]]
platform = ""
item_id = ""
type = "group"
use = true
learn = true
```

:::

`platform` / `item_id` empty means a global rule. `type` can be `"group"` / `"private"`.

---

# Jargon

Controls jargon learning and interop groups. `platform` or `item_id` may use the `*` wildcard.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[jargon]
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
jargon_groups = []
```

:::

**`learning_list`** — Jargon learning configuration list. **Type**: `list[LearningItem]`. Defaults to one global group-chat rule.

**`jargon_groups`** — Jargon learning interop groups. **Type**: `list[ChatStreamGroup]`. **Default**: `[]`.

### learning_list

Field meanings are the same as [expression.learning_list](#expression-learning).

---

# Voice

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[voice]
enable_asr = false
```

:::

**`enable_asr`** — Enable speech recognition. **Type**: `bool`. **Default**: `false`.

---

# Emoji

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[emoji]
emoji_send_num = 25
max_reg_num = 64
do_replace = true
check_interval = 10
steal_emoji = true
content_filtration = false
```

:::

**`emoji_send_num`** — Number of sticker candidates for sending. **Type**: `int`. **Default**: `25`. Range: `1-64`.

**`max_reg_num`** — Max sticker registrations. **Type**: `int`. **Default**: `64`.

**`do_replace`** — Replace old stickers when full. **Type**: `bool`. **Default**: `true`. When off, stops collecting once the limit is reached.

**`check_interval`** — Sticker check interval. **Type**: `int`. **Default**: `10`. **Unit**: minutes.

**`steal_emoji`** — Steal stickers from chats. **Type**: `bool`. **Default**: `true`.

**`content_filtration`** — Sticker filtering. **Type**: `bool`. **Default**: `false`.

---

# Keyword Reaction

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[keyword_reaction.keyword_rules]]
keywords = ["关键词"]
reaction = "触发后的反应"

[[keyword_reaction.regex_rules]]
regex = ["^正则.*"]
reaction = "触发后的反应"
```

:::

Each rule contains a `keywords` / `regex` list and a `reaction` trigger reply.

---

# Response Post-Processing

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[response_post_process]
enable_response_post_process = true
```

:::

**`enable_response_post_process`** — Master switch for response post-processing. **Type**: `bool`. **Default**: `true`. When off, neither the typo generator nor the response splitter works.

---

# Chinese Typos

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[chinese_typo]
enable = true
error_rate = 0.01
min_freq = 9
tone_error_rate = 0.1
word_replace_rate = 0.006
```

:::

**`enable`** — Enable typo generation. **Type**: `bool`. **Default**: `true`.

**`error_rate`** — Single-character replacement probability. **Type**: `float`. **Default**: `0.01`. Range: `0-1`.

**`min_freq`** — Minimum character frequency threshold. **Type**: `int`. **Default**: `9`.

**`tone_error_rate`** — Tone error probability. **Type**: `float`. **Default**: `0.1`. Range: `0-1`.

**`word_replace_rate`** — Whole-word replacement probability. **Type**: `float`. **Default**: `0.006`. Range: `0-1`.

---

# Response Splitting

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[response_splitter]
enable = true
max_length = 512
max_sentence_num = 8
max_split_num = 3
enable_kaomoji_protection = false
enable_overflow_return_all = false
```

:::

**`enable`** — Enable response splitting. **Type**: `bool`. **Default**: `true`.

**`max_length`** — Max characters per reply. **Type**: `int`. **Default**: `512`.

**`max_sentence_num`** — Max sentences per reply. **Type**: `int`. **Default**: `8`.

**`max_split_num`** — Max split parts. **Type**: `int`. **Default**: `3`.

**`enable_kaomoji_protection`** — Kaomoji protection. **Type**: `bool`. **Default**: `false`. When on, protects kaomoji from being split during splitting.

**`enable_overflow_return_all`** — Return everything at once when over the limit. **Type**: `bool`. **Default**: `false`.

---

# Logging

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[log]
date_style = "m-d H:i:s"
log_level_style = "lite"
color_text = "full"
log_level = "INFO"
console_log_level = "INFO"
file_log_level = "DEBUG"
log_file_max_bytes = 5242880
max_log_files = 30
log_cleanup_days = 30
llm_request_snapshot_limit = 128
maisaka_prompt_preview_limit = 256
maisaka_reply_effect_limit = 256
suppress_libraries = ["faiss", "httpx", "urllib3", "asyncio", "websockets", "httpcore", "requests", "sqlalchemy", "openai", "uvicorn", "jieba"]
library_log_levels = {"aiohttp" = "WARNING", "PIL" = "WARNING"}
```

:::

**`date_style`** — Date format. **Type**: `str`. **Default**: `"m-d H:i:s"`.

**`log_level_style`** — Log level display style. **Type**: `str` (enum). **Default**: `"lite"`. **Options**: `"lite"` / `"compact"` / `"full"`.

**`color_text`** — Console color mode. **Type**: `str` (enum). **Default**: `"full"`. **Options**: `"none"` / `"title"` / `"full"`.

**`log_level`** — Global log level. **Type**: `str` (enum). **Default**: `"INFO"`.

**`console_log_level`** — Console log level. **Type**: `str` (enum). **Default**: `"INFO"`.

**`file_log_level`** — File log level. **Type**: `str` (enum). **Default**: `"DEBUG"`.

**`log_file_max_bytes`** — Max bytes per log file. **Type**: `int`. **Default**: `5242880` (5MB).

**`max_log_files`** — Max main log files kept. **Type**: `int`. **Default**: `30`.

**`log_cleanup_days`** — Retention days for main log files. **Type**: `int`. **Default**: `30`.

**`llm_request_snapshot_limit`** — Max snapshots kept for failed requests. **Type**: `int`. **Default**: `128`.

**`maisaka_prompt_preview_limit`** — Max Maisaka prompt preview groups kept per session. **Type**: `int`. **Default**: `256`.

**`maisaka_reply_effect_limit`** — Max reply effect records kept per session. **Type**: `int`. **Default**: `256`.

**`suppress_libraries`** — Third-party libraries with logs fully suppressed. **Type**: `list[str]`. **Default**: contains 11 libraries.

**`library_log_levels`** — Per-library log levels for specific third-party libraries. **Type**: `dict[str, str]`. **Default**: `{"aiohttp" = "WARNING", "PIL" = "WARNING"}`.

---

# Telemetry

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[telemetry]
enable = true
```

:::

**`enable`** — Enable telemetry. **Type**: `bool`. **Default**: `true`.

---

# Debug

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[debug]
enable_console_input = false
show_maisaka_thinking = true
enable_reply_effect_tracking = false
keep_prompt_preview_json_base64 = false
record_tool_structured_content = false
enable_llm_cache_stats = false
```

:::

**`enable_console_input`** — Enable the interactive local management console. **Type**: `bool`. **Default**: `false`. When on, you can send local messages in the terminal running MaiBot and use admin commands like `/clear`, `/offline`, `/online`, and `/pm`. See [Management Console](../features/management-console.md).

**`show_maisaka_thinking`** — Show replyer reasoning. **Type**: `bool`. **Default**: `true`.

**`enable_reply_effect_tracking`** — Reply effect scoring tracking. **Type**: `bool`. **Default**: `false`.

**`keep_prompt_preview_json_base64`** — Keep image base64 in prompt preview JSON. **Type**: `bool`. **Default**: `false`. When on it makes requests easier to reproduce but noticeably increases storage usage.

**`record_tool_structured_content`** — Save structured content returned by tools. **Type**: `bool`. **Default**: `false`. For debugging, but increases database size.

**`enable_llm_cache_stats`** — Record LLM prompt cache statistics. **Type**: `bool`. **Default**: `false`.

---

# Message Service

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[maim_message]
ws_server_host = "127.0.0.1"
ws_server_port = 8000
auth_token = []
enable_api_server = false
api_server_host = "0.0.0.0"
api_server_port = 8090
api_server_use_wss = false
api_server_cert_file = ""
api_server_key_file = ""
api_server_allowed_api_keys = []
```

:::

**`ws_server_host`** — Legacy WS server host. **Type**: `str`. **Default**: `"127.0.0.1"`.

**`ws_server_port`** — Legacy WS server port. **Type**: `int`. **Default**: `8000`.

**`auth_token`** — Auth token list. **Type**: `list[str]`. **Default**: `[]`. Empty means authentication is disabled.

**`enable_api_server`** — Enable the new API Server. **Type**: `bool`. **Default**: `false`.

**`api_server_host`** — New API Server host. **Type**: `str`. **Default**: `"0.0.0.0"`.

**`api_server_port`** — New API Server port. **Type**: `int`. **Default**: `8090`.

**`api_server_use_wss`** — Enable WSS. **Type**: `bool`. **Default**: `false`.

**`api_server_cert_file`** — SSL certificate path. **Type**: `str`. **Default**: `""`.

**`api_server_key_file`** — SSL key path. **Type**: `str`. **Default**: `""`.

**`api_server_allowed_api_keys`** — Allowed API key list. **Type**: `list[str]`. **Default**: `[]`. Empty allows all connections.

---

# WebUI

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[webui]
enabled = true
host = ["127.0.0.1", "::1"]
port = 8001
mode = "production"
webui_style = 1
anti_crawler_mode = "basic"
allowed_ips = "127.0.0.1"
trusted_proxies = ""
trust_xff = false
secure_cookie = false
enforce_public_outbound_url = true
enable_paragraph_content = false
```

:::

**`enabled`** — Enable the WebUI. **Type**: `bool`. **Default**: `true`.

**`host`** — Bind host list. **Type**: `list[str]`. **Default**: `["127.0.0.1", "::1"]`. For manual external access, use `["0.0.0.0", "::"]`.

**`port`** — Bind port. **Type**: `int`. **Default**: `8001`.

**`mode`** — Run mode. **Type**: `str` (enum). **Default**: `"production"`. **Options**: `"development"` / `"production"`.

**`webui_style`** — WebUI style number. **Type**: `int`. **Default**: `1`. `0` is the old style, `1` is the futuristic-retro style.

**`anti_crawler_mode`** — Anti-crawler mode. **Type**: `str`. **Default**: `"basic"`. **Options**: `false` / `"strict"` / `"loose"` / `"basic"`.

**`allowed_ips`** — IP whitelist. **Type**: `str`. **Default**: `"127.0.0.1"`. Comma-separated, supports CIDR and wildcards.

**`trusted_proxies`** — Trusted proxy IPs. **Type**: `str`. **Default**: `""`. Comma-separated.

**`trust_xff`** — Enable X-Forwarded-For. **Type**: `bool`. **Default**: `false`.

**`secure_cookie`** — Enable secure cookies. **Type**: `bool`. **Default**: `false`. HTTPS transport only.

**`enforce_public_outbound_url`** — Enforce public outbound URL validation. **Type**: `bool`. **Default**: `true`. When off, internal / TUN proxy addresses are allowed.

**`enable_paragraph_content`** — Load full paragraph content. **Type**: `bool`. **Default**: `false`. Uses extra memory.

---

# Database

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[database]
save_binary_data = false
```

:::

**`save_binary_data`** — Save binary data. **Type**: `bool`. **Default**: `false`. When on, binary data such as voice in messages is saved as separate files — re-recognition works but the data folder grows. Only affects newly stored messages.

---

# MCP

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[mcp]
enable = true
```

:::

**`enable`** — Enable MCP. **Type**: `bool`. **Default**: `true`.

Full documentation (server config, Sampling, Roots, Elicitation) → **[MCP Configuration Details](./mcp-config.md)**

---

# Plugin Management

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
permission = []
```

:::

**`permission`** — Plugin management permission list. **Type**: `list[str]`. **Default**: `[]`. Format: `platform:id`, e.g. `"qq:123456789"`.

---

# Plugin Runtime

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin_runtime]
enabled = true
health_check_interval_sec = 30.0
max_restart_attempts = 3
runner_spawn_timeout_sec = 30.0
hook_blocking_timeout_sec = 60
ipc_socket_path = ""
```

:::

**`enabled`** — Enable the plugin system. **Type**: `bool`. **Default**: `true`.

**`health_check_interval_sec`** — Health check interval. **Type**: `float`. **Default**: `30.0`. **Unit**: seconds.

**`max_restart_attempts`** — Max automatic restarts after Runner crashes. **Type**: `int`. **Default**: `3`.

**`runner_spawn_timeout_sec`** — Runner startup timeout. **Type**: `float`. **Default**: `30.0`. **Unit**: seconds.

**`hook_blocking_timeout_sec`** — Global blocking timeout for hooks. **Type**: `float`. **Default**: `60`. **Unit**: seconds.

**`ipc_socket_path`** — Custom IPC socket path. **Type**: `str`. **Default**: `""`. Only effective on Linux/macOS; leave empty to auto-generate.

---

## Configuration File Structure

The top level of `bot_config.toml` contains the following sections (grouped by top-level key):

- **`[bot]`** — Bot identity, platform, nickname, aliases
- **`[personality]`** — Persona and reply style
- **`[visual]`** — Image understanding mode and recognition prompts
- **`[chat]`** — Reply frequency, context, chat prompts, backoff strategy
- **`[experimental]`** — Experimental features (behavior learning, Focus mode)
- **`[message_receive]`** — Image parse threshold, message filtering
- **`[a_memorix]`** — Long-term memory system → [see A_Memorix configuration](./amemorix-config.md)
- **`[expression]`** — Expression learning, expression checking, interop groups
- **`[jargon]`** — Jargon learning, jargon interop groups
- **`[voice]`** — Speech recognition
- **`[emoji]`** — Sticker collection, filtering, sending
- **`[keyword_reaction]`** — Keyword / regex triggered reactions
- **`[response_post_process]`** — Master switch for response post-processing
- **`[chinese_typo]`** — Chinese typo generation
- **`[response_splitter]`** — Response splitting
- **`[log]`** — Log levels, format, file retention policy
- **`[telemetry]`** — Telemetry switch
- **`[debug]`** — Debug display and tracking
- **`[maim_message]`** — maim_message WebSocket / API Server
- **`[webui]`** — WebUI service and security settings
- **`[database]`** — Message binary data saving policy
- **`[mcp]`** — MCP client and server configuration → [see MCP configuration](./mcp-config.md)
- **`[plugin]`** — Plugin management permissions
- **`[plugin_runtime]`** — Plugin runtime and browser rendering configuration

::: tip
The `[inner] version` at the top of the configuration file is managed by the program; regular users don't need to modify it manually.
:::

---

## Next Steps

- Configure models: see [Model Configuration](./model-config.md)
- Model advanced parameters: see [Model Extra Parameters](./model-extra-params.md)
- Connect to QQ: see [NapCat Adapter](../adapters/napcat.md)
- Manage WebUI: [WebUI Configuration Management](../webui/config-management.md)
- Memory system details: [A_Memorix Configuration](./amemorix-config.md)
- MCP configuration details: [MCP Configuration](./mcp-config.md)