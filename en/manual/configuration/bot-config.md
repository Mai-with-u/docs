---
title: Bot Configuration
---

# Bot Configuration

`bot_config.toml` is MaiBot's main configuration file. It contains bot identity, personality, chat behavior, memory, expression learning, message connection, WebUI, MCP, plugin runtime, and more.

This document is organized according to `src/config/official_configs.py` and `src/config/config.py`. The configuration file is generated and upgraded by MaiBot automatically. Do not manually add fields that do not exist in the code.

## Configuration File Structure

`bot_config.toml` contains these top-level sections:

| Section | Purpose |
|------|------|
| `[bot]` | Bot identity, platform, nickname, aliases |
| `[personality]` | Character setting and reply style |
| `[visual]` | Image understanding mode and visual prompt |
| `[chat]` | Reply frequency, context, chat prompts |
| `[message_receive]` | Image parsing threshold and message filtering |
| `[memory]` | Memory retrieval, writeback, feedback correction |
| `[expression]` | Expression learning, jargon learning, expression checking |
| `[voice]` | Speech recognition |
| `[emoji]` | Emoji collection, filtering, sending |
| `[keyword_reaction]` | Keyword/regex triggered reactions |
| `[response_post_process]` | Global response post-processing switch |
| `[chinese_typo]` | Chinese typo generation |
| `[response_splitter]` | Response splitting |
| `[telemetry]` | Telemetry switch |
| `[debug]` | Debug display and tracking |
| `[maim_message]` | maim_message WebSocket/API Server |
| `[webui]` | WebUI service and security settings |
| `[database]` | Message binary data saving policy |
| `[mcp]` | MCP client and server configuration |
| `[plugin_runtime]` | Plugin runtime and browser rendering configuration |

::: tip
The `[inner] version` at the top of the configuration file is managed by the program. Users usually do not need to edit this version manually.
:::

## Basic Information [bot]

`[bot]` contains the bot's identity information. The most commonly used fields are `platform`, `qq_account`, `nickname`, and `alias_names`.

```toml
[bot]
platform = "qq"
qq_account = 123456789
platforms = []
nickname = "MaiMai"
alias_names = ["XiaoMai", "MaiZi"]
```

| Field | Type | Default | Description |
|--------|------|--------|------|
| `platform` | `str` | `""` | Main platform identifier, such as `qq` |
| `qq_account` | `int` | `0` | QQ account used by the bot, used to identify @mentions and self messages |
| `platforms` | `list[str]` | `[]` | Other platform identifiers, used in multi-platform scenarios |
| `nickname` | `str` | `"麦麦"` | Bot nickname |
| `alias_names` | `list[str]` | `[]` | Bot aliases, used when detecting mentions |

## Personality [personality]

`[personality]` controls MaiBot's character setting and language style.

```toml
[personality]
personality = "是一个大二在读女大学生，现在正在上网和群友聊天，有时有点攻击性，有时比较温柔"
reply_style = "请不要刻意突出自身学科背景。可以参考贴吧，知乎和微博的回复风格。"
multiple_reply_style = []
multiple_probability = 0.3
```

| Field | Type | Default | Description |
|--------|------|--------|------|
| `personality` | `str` | See default config | Character setting, recommended within 100 Chinese characters |
| `reply_style` | `str` | See default config | Default expression style, recommended 1-2 lines |
| `multiple_reply_style` | `list[str]` | `[]` | Optional style list; can randomly replace `reply_style` when not empty |
| `multiple_probability` | `float` | `0.3` | Probability of using `multiple_reply_style`, range `0.0-1.0` |

## Visual [visual]

`[visual]` controls how image messages are handled by the planner and replyer.

```toml
[visual]
planner_mode = "auto"
replyer_mode = "auto"
```

The image description prompt is managed by the Prompt template `prompts/<locale>/image_description.prompt`.

| Field | Type | Default | Description |
|--------|------|--------|------|
| `planner_mode` | `"text" \| "multimodal" \| "auto"` | `"auto"` | Planner visual mode. `auto` chooses based on model metadata |
| `replyer_mode` | `"text" \| "multimodal" \| "auto"` | `"auto"` | Replyer visual mode. `auto` chooses based on model metadata |

## Chat [chat]

`[chat]` controls reply frequency, context length, group/private chat prompts, and dynamic talk frequency rules.

```toml
[chat]
talk_value = 1.0
mentioned_bot_reply = false
inevitable_at_reply = true
enable_reply_quote = true
max_context_size = 30
planner_interrupt_max_consecutive_count = 2
group_chat_prompt = "..."
private_chat_prompts = "..."
chat_prompts = []
enable_talk_value_rules = true
```

| Field | Type | Default | Description |
|--------|------|--------|------|
| `talk_value` | `float` | `1.0` | Chat frequency. Smaller means quieter, range `0-1` |
| `mentioned_bot_reply` | `bool` | `false` | Whether to tend to reply when the bot name is mentioned in plain text |
| `inevitable_at_reply` | `bool` | `true` | Whether to always reply when @mentioned |
| `enable_reply_quote` | `bool` | `true` | Whether to include quoted replies |
| `max_context_size` | `int` | `30` | Number of context messages sent to the model |
| `planner_interrupt_max_consecutive_count` | `int` | `2` | Maximum consecutive planner interruptions by new messages. `0` disables interruption protection |
| `group_chat_prompt` | `str` | See default config | General group chat instructions |
| `private_chat_prompts` | `str` | See default config | General private chat instructions |
| `chat_prompts` | `list[ExtraPromptItem]` | `[]` | Extra prompts by platform/chat flow |
| `enable_talk_value_rules` | `bool` | `true` | Whether to enable dynamic talk frequency rules |
| `talk_value_rules` | `list[TalkRulesItem]` | Two default rules | Adjusts `talk_value` by chat flow and time range |

### talk_value_rules

```toml
[[chat.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "00:00-08:59"
value = 0.8
```

| Field | Type | Description |
|--------|------|------|
| `platform` | `str` | Platform. Empty together with `item_id` means global |
| `item_id` | `str` | User/group ID. Empty together with `platform` means global |
| `rule_type` | `"group" \| "private"` | Chat flow type |
| `time` | `str` | Time range in `"HH:MM-HH:MM"` format. Overnight ranges are supported |
| `value` | `float` | Chat frequency value for this range, `0-1` |

### chat_prompts

```toml
[[chat.chat_prompts]]
platform = "qq"
item_id = "123456"
rule_type = "group"
prompt = "Speak more briefly in this group."
```

`platform`, `item_id`, and `prompt` must all be filled in; otherwise the extra prompt entry is invalid.

## Message Receiving [message_receive]

`[message_receive]` controls image parsing and message filtering.

| Field | Type | Default | Description |
|--------|------|--------|------|
| `image_parse_threshold` | `int` | `5` | Parse images only when image count in one message does not exceed this threshold |
| `ban_words` | `set[str]` | `set()` | Filter word list |
| `ban_msgs_regex` | `set[str]` | `set()` | Filter regex list. Invalid regex causes configuration validation failure |

## Memory [memory]

`[memory]` controls long-term memory retrieval, person fact writeback, chat summary writeback, and feedback correction.

### Common Memory Fields

| Field | Type | Default | Description |
|--------|------|--------|------|
| `global_memory` | `bool` | `false` | Whether memory retrieval can ignore the current chat flow restriction |
| `global_memory_blacklist` | `list[TargetItem]` | `[]` | Global memory blacklist, used to exclude specific chat flows |
| `enable_memory_query_tool` | `bool` | `true` | Whether to enable Maisaka's built-in long-term memory tool `query_memory` |
| `memory_query_default_limit` | `int` | `5` | Default return count for `query_memory`, range `1-20` |
| `person_fact_writeback_enabled` | `bool` | `true` | Whether to extract and write person facts after replies |
| `chat_summary_writeback_enabled` | `bool` | `true` | Whether to write chat summaries by message window |
| `chat_summary_writeback_message_threshold` | `int` | `12` | Message window threshold for chat summary writeback |
| `chat_summary_writeback_context_length` | `int` | `50` | Number of messages to look back for summary writeback, range `1-500` |

### global_memory_blacklist

```toml
[[memory.global_memory_blacklist]]
platform = "qq"
item_id = "123456"
rule_type = "group"
```

Common `TargetItem` fields:

| Field | Type | Description |
|--------|------|------|
| `platform` | `str` | Platform. Empty together with `item_id` means global |
| `item_id` | `str` | User/group ID. Empty together with `platform` means global |
| `rule_type` | `"group" \| "private"` | Chat flow type |

### Feedback Correction Fields

Feedback correction is disabled by default and is an advanced feature. It uses user feedback after `query_memory` to try correcting stale memories.

| Field | Type | Default | Description |
|--------|------|--------|------|
| `feedback_correction_enabled` | `bool` | `false` | Whether to enable feedback-driven delayed memory correction |
| `feedback_correction_window_hours` | `float` | `12.0` | Feedback window duration in hours |
| `feedback_correction_check_interval_minutes` | `int` | `30` | Polling interval in minutes |
| `feedback_correction_batch_size` | `int` | `20` | Maximum tasks per round, range `1-200` |
| `feedback_correction_auto_apply_threshold` | `float` | `0.85` | Minimum confidence for automatically applying correction, range `0-1` |
| `feedback_correction_max_feedback_messages` | `int` | `30` | Maximum feedback messages used per correction task |
| `feedback_correction_prefilter_enabled` | `bool` | `true` | Whether to enable prefiltering |
| `feedback_correction_paragraph_mark_enabled` | `bool` | `true` | Whether to mark affected paragraphs with corrected-old-fact metadata |
| `feedback_correction_paragraph_hard_filter_enabled` | `bool` | `true` | Whether to hard-filter paragraphs with stale marks in user queries |
| `feedback_correction_profile_refresh_enabled` | `bool` | `true` | Whether to enqueue affected person profiles for refresh |
| `feedback_correction_profile_force_refresh_on_read` | `bool` | `true` | Whether to force-refresh dirty profiles on read |
| `feedback_correction_episode_rebuild_enabled` | `bool` | `true` | Whether to enqueue affected sources for episode rebuild |
| `feedback_correction_episode_query_block_enabled` | `bool` | `true` | Whether to block user queries while episode sources are rebuilding |
| `feedback_correction_reconcile_interval_minutes` | `int` | `5` | Second-stage consistency polling interval |
| `feedback_correction_reconcile_batch_size` | `int` | `20` | Queue batch size for second-stage consistency |

## Expression Learning [expression]

`[expression]` controls expression learning, jargon learning, expression auto-checking, and shared expression groups.

| Field | Type | Description |
|--------|------|------|
| `learning_list` | `list[LearningItem]` | Expression learning configuration by chat flow |
| `advanced_chosen` | `bool` | Whether to enable sub-agent based second-stage expression selection |
| `expression_groups` | `list[ExpressionGroup]` | Shared expression learning groups |
| `expression_checked_only` | `bool` | Whether to select only checked and non-rejected expressions |
| `expression_self_reflect` | `bool` | Whether to enable automatic expression optimization |
| `expression_auto_check_interval` | `int` | Auto-check interval in seconds |
| `expression_auto_check_count` | `int` | Number of expressions randomly selected for each auto-check |
| `expression_auto_check_custom_criteria` | `list[str]` | Additional custom evaluation criteria |
| `all_global_jargon` | `bool` | Whether to enable global jargon mode |

### learning_list

```toml
[[expression.learning_list]]
platform = ""
item_id = ""
rule_type = "group"
use_expression = true
enable_learning = true
enable_jargon_learning = true
```

| Field | Type | Description |
|--------|------|------|
| `platform` | `str` | Platform. Empty together with `item_id` means global |
| `item_id` | `str` | User/group ID. Empty together with `platform` means global |
| `rule_type` | `"group" \| "private"` | Chat flow type |
| `use_expression` | `bool` | Whether to use learned expressions |
| `enable_learning` | `bool` | Whether to enable expression optimization learning |
| `enable_jargon_learning` | `bool` | Whether to enable jargon learning |

## Voice [voice]

| Field | Type | Default | Description |
|--------|------|--------|------|
| `enable_asr` | `bool` | See default config | Whether to enable speech recognition |

## Emoji [emoji]

| Field | Type | Description |
|--------|------|------|
| `emoji_send_num` | `int` | Number of emoji candidates to choose from when sending, maximum `64` |
| `max_reg_num` | `int` | Maximum number of registered emojis |
| `do_replace` | `bool` | Whether to replace old emojis after reaching the maximum |
| `check_interval` | `int` | Emoji check interval in minutes |
| `steal_emoji` | `bool` | Whether to collect emojis from chat |
| `content_filtration` | `bool` | Whether to enable emoji filtering |
| `filtration_prompt` | `str` | Emoji filtering requirement |

## Keyword Reaction [keyword_reaction]

```toml
[[keyword_reaction.keyword_rules]]
keywords = ["keyword"]
reaction = "reaction after trigger"

[[keyword_reaction.regex_rules]]
regex = ["^regex.*"]
reaction = "reaction after trigger"
```

| Field | Type | Description |
|--------|------|------|
| `keyword_rules` | `list[KeywordRuleConfig]` | Keyword rule list |
| `regex_rules` | `list[KeywordRuleConfig]` | Regex rule list |

`KeywordRuleConfig` fields:

| Field | Type | Description |
|--------|------|------|
| `keywords` | `list[str]` | Keyword list |
| `regex` | `list[str]` | Regex list |
| `reaction` | `str` | Reaction after keyword or regex trigger |

## Response Post-Processing

### response_post_process

| Field | Type | Description |
|--------|------|------|
| `enable_response_post_process` | `bool` | Whether to enable response post-processing, including typo generation and response splitting |

### chinese_typo

| Field | Type | Description |
|--------|------|------|
| `enable` | `bool` | Whether to enable Chinese typo generation |
| `error_rate` | `float` | Single-character replacement probability |
| `min_freq` | `int` | Minimum character frequency threshold |
| `tone_error_rate` | `float` | Tone error probability |
| `word_replace_rate` | `float` | Whole-word replacement probability |

### response_splitter

| Field | Type | Description |
|--------|------|------|
| `enable` | `bool` | Whether to enable response splitting |
| `max_length` | `int` | Maximum allowed response length |
| `max_sentence_num` | `int` | Maximum allowed sentence count |
| `enable_kaomoji_protection` | `bool` | Whether to protect kaomoji |
| `enable_overflow_return_all` | `bool` | Whether to return all content when sentence count exceeds the limit |

## Telemetry and Debug

### telemetry

| Field | Type | Description |
|--------|------|------|
| `enable` | `bool` | Whether to enable telemetry |

### debug

| Field | Type | Description |
|--------|------|------|
| `enable_maisaka_stage_board` | `bool` | Whether to enable the Maisaka stage board |
| `show_maisaka_thinking` | `bool` | Whether to show replyer reasoning |
| `fold_maisaka_thinking` | `bool` | Whether to fold the Maisaka prompt display entry |
| `show_jargon_prompt` | `bool` | Whether to show jargon-related prompts |
| `show_memory_prompt` | `bool` | Whether to show memory retrieval prompts |
| `enable_reply_effect_tracking` | `bool` | Whether to enable reply effect score tracking |

## Message Service [maim_message]

`[maim_message]` contains both the legacy WebSocket service and the additional new API Server configuration.

| Field | Type | Default | Description |
|--------|------|--------|------|
| `ws_server_host` | `str` | `127.0.0.1` | Legacy WebSocket server host |
| `ws_server_port` | `int` | `8080` | Legacy WebSocket server port |
| `auth_token` | `list[str]` | `[]` | Legacy API auth tokens. Empty means no auth |
| `enable_api_server` | `bool` | See default config | Whether to enable the additional new API Server |
| `api_server_host` | `str` | See default config | New API Server host |
| `api_server_port` | `int` | See default config | New API Server port |
| `api_server_use_wss` | `bool` | See default config | Whether the new API Server uses WSS |
| `api_server_cert_file` | `str` | `""` | SSL certificate file path |
| `api_server_key_file` | `str` | `""` | SSL key file path |
| `api_server_allowed_api_keys` | `list[str]` | `[]` | Allowed API key list. Empty allows all connections |

## WebUI [webui]

| Field | Type | Default | Description |
|--------|------|--------|------|
| `enabled` | `bool` | `true` | Whether to enable WebUI |
| `host` | `str` | `127.0.0.1` | WebUI bind host |
| `port` | `int` | `8001` | WebUI bind port |
| `mode` | `"development" \| "production"` | `"production"` | WebUI running mode |
| `anti_crawler_mode` | `"false" \| "strict" \| "loose" \| "basic"` | `"basic"` | Anti-crawler mode |
| `allowed_ips` | `str` | `127.0.0.1` | IP whitelist, comma-separated; supports exact IP, CIDR, and wildcard |
| `trusted_proxies` | `str` | `""` | Trusted proxy IP list |
| `trust_xff` | `bool` | `false` | Whether to parse `X-Forwarded-For` |
| `secure_cookie` | `bool` | `false` | Whether to enable secure cookies, HTTPS only |
| `enable_paragraph_content` | `bool` | `false` | Whether to load full paragraph content in the knowledge graph; uses extra memory |

## Database [database]

| Field | Type | Default | Description |
|--------|------|--------|------|
| `save_binary_data` | `bool` | `false` | Whether to save binary data such as voice as independent files. Only affects newly stored messages |

## MCP [mcp]

`[mcp]` controls MaiBot's MCP client host capabilities and external MCP server connections.

| Field | Type | Description |
|--------|------|------|
| `enable` | `bool` | Whether to enable MCP |
| `client` | `MCPClientConfig` | MCP client host capability configuration |
| `servers` | `list[MCPServerItemConfig]` | MCP server configuration list |

### mcp.client

| Field | Type | Description |
|--------|------|------|
| `client_name` | `str` | MCP client implementation name |
| `client_version` | `str` | MCP client implementation version |
| `roots.enable` | `bool` | Whether to expose Roots capability to MCP servers |
| `roots.items` | `list[MCPRootItemConfig]` | Roots list |
| `sampling.enable` | `bool` | Whether to declare Sampling capability |
| `sampling.task_name` | `str` | Main model task name used for Sampling requests |
| `sampling.include_context_support` | `bool` | Whether to declare support for non-`none` `includeContext` semantics |
| `sampling.tool_support` | `bool` | Whether to declare support for continuing to use tools in Sampling |
| `elicitation.enable` | `bool` | Whether to declare Elicitation capability |
| `elicitation.allow_form` | `bool` | Whether to allow form-mode Elicitation |
| `elicitation.allow_url` | `bool` | Whether to allow URL-mode Elicitation |

### mcp.servers

```toml
[[mcp.servers]]
name = "example"
enabled = true
transport = "stdio"
command = "uvx"
args = ["some-mcp-server"]
env = {}
```

| Field | Type | Description |
|--------|------|------|
| `name` | `str` | Server name, must be unique |
| `enabled` | `bool` | Whether to enable this server |
| `transport` | `"stdio" \| "streamable_http"` | Transport mode |
| `command` | `str` | Command used to start the server in `stdio` mode |
| `args` | `list[str]` | Command arguments in `stdio` mode |
| `env` | `dict[str, str]` | Extra environment variables in `stdio` mode |
| `url` | `str` | MCP endpoint in `streamable_http` mode |
| `headers` | `dict[str, str]` | Extra HTTP headers |
| `http_timeout_seconds` | `float` | HTTP request timeout |
| `read_timeout_seconds` | `float` | Session read timeout |
| `authorization.mode` | `"none" \| "bearer"` | HTTP authorization mode |
| `authorization.bearer_token` | `str` | Bearer Token, only used when `mode = "bearer"` |

## Plugin Runtime [plugin_runtime]

`[plugin_runtime]` controls the plugin runner and plugin runtime browser rendering capability.

| Field | Type | Description |
|--------|------|------|
| `enabled` | `bool` | Whether to enable the plugin system |
| `health_check_interval_sec` | `float` | Health check interval |
| `max_restart_attempts` | `int` | Maximum auto-restarts after runner crash |
| `runner_spawn_timeout_sec` | `float` | Timeout waiting for runner subprocess startup and registration |
| `hook_blocking_timeout_sec` | `float` | Global timeout for blocking hook steps |
| `ipc_socket_path` | `str` | Custom IPC socket path, Linux/macOS only; empty means auto-generated |

### plugin_runtime.render

| Field | Type | Description |
|--------|------|------|
| `enabled` | `bool` | Whether to enable browser rendering in plugin runtime |
| `browser_ws_endpoint` | `str` | Existing Chromium CDP address to reuse first |
| `executable_path` | `str` | Browser executable path; empty means auto-detect |
| `browser_install_root` | `str` | Playwright-managed browser directory |
| `headless` | `bool` | Whether to launch browser in headless mode |
| `launch_args` | `list[str]` | Browser launch arguments |
| `concurrency_limit` | `int` | Maximum concurrent rendering tasks |
| `startup_timeout_sec` | `float` | Browser connection or startup timeout |
| `render_timeout_sec` | `float` | Default timeout for a single render |
| `auto_download_chromium` | `bool` | Whether to automatically download Playwright Chromium if no browser is found |
| `download_connection_timeout_sec` | `float` | Connection timeout when automatically downloading Chromium |
| `restart_after_render_count` | `int` | Rebuild local browser after this many renders; `0` disables this policy |

## Common Examples

### Beginner Minimal Configuration

```toml
[bot]
platform = "qq"
qq_account = 123456789
nickname = "MaiMai"
alias_names = ["XiaoMai"]

[chat]
talk_value = 0.7
inevitable_at_reply = true
max_context_size = 30

[memory]
global_memory = false
enable_memory_query_tool = true
person_fact_writeback_enabled = true
chat_summary_writeback_enabled = true
```

### Connect an Adapter

```toml
[maim_message]
ws_server_host = "127.0.0.1"
ws_server_port = 8080
auth_token = []
```

If the adapter runs in a Docker network or on another machine, adjust the listen address and port according to your deployment.

## Next Steps

- Configure models: see [Model Configuration](./model-config.md)
- Connect QQ: see [NapCat Adapter](../adapters/napcat.md)
- Manage WebUI: see [WebUI Configuration Management](../webui/config-management.md)
