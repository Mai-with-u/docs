---
title: Bot 配置
---

# Bot 配置

`bot_config.toml` 是 MaiBot 的主配置文件，包含机器人身份、人设、聊天行为、记忆、表达学习、消息连接、WebUI、MCP 和插件运行时等设置。

当前文档按代码中的 `src/config/official_configs.py` 和 `src/config/config.py` 整理。配置文件由 MaiBot 自动生成和升级，不建议手动新增不存在的字段。

## 配置文件结构

`bot_config.toml` 顶层包含以下主要段落：

| 段落 | 作用 |
|------|------|
| `[bot]` | 机器人身份、平台、昵称、别名 |
| `[personality]` | 人设和回复风格 |
| `[visual]` | 图片理解模式和识图提示词 |
| `[chat]` | 回复频率、上下文、聊天提示词 |
| `[message_receive]` | 图片解析阈值、消息过滤 |
| `[memory]` | 记忆检索、写回、反馈纠错 |
| `[expression]` | 表达学习、黑话学习、表达检查 |
| `[voice]` | 语音识别 |
| `[emoji]` | 表情包收集、过滤、发送 |
| `[keyword_reaction]` | 关键词/正则触发反应 |
| `[response_post_process]` | 回复后处理总开关 |
| `[chinese_typo]` | 中文错别字生成 |
| `[response_splitter]` | 回复分割 |
| `[telemetry]` | 遥测开关 |
| `[debug]` | 调试显示和追踪 |
| `[maim_message]` | maim_message WebSocket/API Server |
| `[webui]` | WebUI 服务和安全设置 |
| `[database]` | 消息二进制数据保存策略 |
| `[mcp]` | MCP 客户端和服务器配置 |
| `[plugin_runtime]` | 插件运行时和浏览器渲染配置 |

::: tip
配置文件开头的 `[inner] version` 由程序管理。需要修改配置模板时，应更新模板版本；普通用户不需要手动改这个版本号。
:::

## 基本信息 [bot]

`[bot]` 是机器人的身份信息。最常用的是 `platform`、`qq_account`、`nickname` 和 `alias_names`。

```toml
[bot]
platform = "qq"
qq_account = 123456789
platforms = []
nickname = "麦麦"
alias_names = ["小麦", "麦子"]
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `platform` | `str` | `""` | 当前主要平台标识，例如 `qq` |
| `qq_account` | `int` | `0` | 机器人登录的 QQ 号，用于识别 @ 和自身消息 |
| `platforms` | `list[str]` | `[]` | 其他平台标识列表，多平台场景使用 |
| `nickname` | `str` | `"麦麦"` | 机器人昵称 |
| `alias_names` | `list[str]` | `[]` | 机器人别名，被提及时可参与回复判断 |

## 人格 [personality]

`[personality]` 控制 MaiBot 的人设和语言风格。

```toml
[personality]
personality = "是一个大二在读女大学生，现在正在上网和群友聊天，有时有点攻击性，有时比较温柔"
reply_style = "请不要刻意突出自身学科背景。可以参考贴吧，知乎和微博的回复风格。"
multiple_reply_style = []
multiple_probability = 0.3
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `personality` | `str` | 见默认配置 | 人格设定，建议 100 字以内，描述身份和人格特质 |
| `reply_style` | `str` | 见默认配置 | 默认表达风格，建议 1-2 行 |
| `multiple_reply_style` | `list[str]` | `[]` | 可选表达风格列表，不为空时可随机替换 `reply_style` |
| `multiple_probability` | `float` | `0.3` | 随机使用 `multiple_reply_style` 的概率，范围 `0.0-1.0` |

## 视觉 [visual]

`[visual]` 控制图片消息进入规划器和回复器时的处理模式。

```toml
[visual]
planner_mode = "auto"
replyer_mode = "auto"
```

识图提示词由 Prompt 模板 `prompts/<locale>/image_description.prompt` 管理。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `planner_mode` | `"text" \| "multimodal" \| "auto"` | `"auto"` | 规划器视觉模式，`auto` 会根据模型信息自动选择 |
| `replyer_mode` | `"text" \| "multimodal" \| "auto"` | `"auto"` | 回复器视觉模式，`auto` 会根据模型信息自动选择 |

## 聊天 [chat]

`[chat]` 控制回复频率、上下文长度、群聊/私聊提示词，以及按时间和聊天流动态调整发言频率。

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

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `talk_value` | `float` | `1.0` | 聊天频率，越小越沉默，范围 `0-1` |
| `mentioned_bot_reply` | `bool` | `false` | 是否在普通文本提到机器人名字时倾向回复 |
| `inevitable_at_reply` | `bool` | `true` | 是否在被 @ 时必回复 |
| `enable_reply_quote` | `bool` | `true` | 回复时是否附带引用回复 |
| `max_context_size` | `int` | `30` | 发送给模型的上下文消息数量 |
| `planner_interrupt_max_consecutive_count` | `int` | `2` | Planner 连续被新消息打断的最大次数，`0` 表示不启用打断保护 |
| `group_chat_prompt` | `str` | 见默认配置 | 群聊通用注意事项 |
| `private_chat_prompts` | `str` | 见默认配置 | 私聊通用注意事项 |
| `chat_prompts` | `list[ExtraPromptItem]` | `[]` | 按平台/聊天流附加的额外提示词 |
| `enable_talk_value_rules` | `bool` | `true` | 是否启用动态发言频率规则 |
| `talk_value_rules` | `list[TalkRulesItem]` | 两条默认规则 | 按聊天流和时间段调整 `talk_value` |

### talk_value_rules

```toml
[[chat.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "00:00-08:59"
value = 0.8
```

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `platform` | `str` | 平台；和 `item_id` 一起留空表示全局 |
| `item_id` | `str` | 用户/群 ID；和 `platform` 一起留空表示全局 |
| `rule_type` | `"group" \| "private"` | 聊天流类型 |
| `time` | `str` | 时间段，格式 `"HH:MM-HH:MM"`，支持跨夜 |
| `value` | `float` | 该时间段的聊天频率，范围 `0-1` |

### chat_prompts

```toml
[[chat.chat_prompts]]
platform = "qq"
item_id = "123456"
rule_type = "group"
prompt = "这个群里说话要更简短。"
```

`platform`、`item_id` 和 `prompt` 都需要填写，否则该条额外提示词无效。

## 消息接收 [message_receive]

`[message_receive]` 控制图片解析和消息过滤。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `image_parse_threshold` | `int` | `5` | 单条消息图片数量不超过该阈值时解析图片，超过时跳过解析 |
| `ban_words` | `set[str]` | `set()` | 过滤词列表 |
| `ban_msgs_regex` | `set[str]` | `set()` | 过滤正则表达式列表；正则非法会导致配置校验失败 |

## 记忆 [memory]

`[memory]` 控制长期记忆检索、人物事实写回、聊天摘要写回，以及反馈纠错系统。

### 常用记忆配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `global_memory` | `bool` | `false` | 是否允许记忆检索忽略当前聊天流限制，仅对相关检索工具生效 |
| `global_memory_blacklist` | `list[TargetItem]` | `[]` | 全局记忆黑名单，启用全局记忆时排除特定聊天流 |
| `enable_memory_query_tool` | `bool` | `true` | 是否启用 Maisaka 内置长期记忆检索工具 `query_memory` |
| `memory_query_default_limit` | `int` | `5` | `query_memory` 默认返回条数，范围 `1-20` |
| `person_fact_writeback_enabled` | `bool` | `true` | 回复后是否自动提取并写回人物事实 |
| `chat_summary_writeback_enabled` | `bool` | `true` | 聊天过程中是否按消息窗口自动写回聊天摘要 |
| `chat_summary_writeback_message_threshold` | `int` | `12` | 触发聊天摘要写回的消息窗口阈值 |
| `chat_summary_writeback_context_length` | `int` | `50` | 写回聊天摘要时回看的消息条数，范围 `1-500` |

### global_memory_blacklist

```toml
[[memory.global_memory_blacklist]]
platform = "qq"
item_id = "123456"
rule_type = "group"
```

`TargetItem` 通用字段：

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `platform` | `str` | 平台；和 `item_id` 一起留空表示全局 |
| `item_id` | `str` | 用户/群 ID；和 `platform` 一起留空表示全局 |
| `rule_type` | `"group" \| "private"` | 聊天流类型 |

### 反馈纠错配置

反馈纠错默认关闭，属于高级功能。它会基于 `query_memory` 后一段时间内的用户反馈，尝试纠正旧记忆。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `feedback_correction_enabled` | `bool` | `false` | 是否启用反馈驱动的延迟记忆纠错任务 |
| `feedback_correction_window_hours` | `float` | `12.0` | 反馈窗口时长，单位小时 |
| `feedback_correction_check_interval_minutes` | `int` | `30` | 纠错任务轮询间隔，单位分钟 |
| `feedback_correction_batch_size` | `int` | `20` | 每轮最大处理任务数，范围 `1-200` |
| `feedback_correction_auto_apply_threshold` | `float` | `0.85` | 自动应用纠错动作的最低置信度，范围 `0-1` |
| `feedback_correction_max_feedback_messages` | `int` | `30` | 每个纠错任务最多使用的反馈消息数 |
| `feedback_correction_prefilter_enabled` | `bool` | `true` | 是否启用纠错前置预筛 |
| `feedback_correction_paragraph_mark_enabled` | `bool` | `true` | 是否为受影响 paragraph 写入已纠正旧事实标记 |
| `feedback_correction_paragraph_hard_filter_enabled` | `bool` | `true` | 查询时是否硬过滤带 stale 标记的 paragraph |
| `feedback_correction_profile_refresh_enabled` | `bool` | `true` | 纠错后是否将受影响人物画像加入刷新队列 |
| `feedback_correction_profile_force_refresh_on_read` | `bool` | `true` | 读取脏人物画像时是否强制刷新 |
| `feedback_correction_episode_rebuild_enabled` | `bool` | `true` | 纠错后是否将受影响 source 加入 episode 重建队列 |
| `feedback_correction_episode_query_block_enabled` | `bool` | `true` | episode source 重建期间是否屏蔽用户侧查询 |
| `feedback_correction_reconcile_interval_minutes` | `int` | `5` | 二阶段一致性后台协调任务轮询间隔 |
| `feedback_correction_reconcile_batch_size` | `int` | `20` | 二阶段一致性每轮处理队列大小 |

## 表达学习 [expression]

`[expression]` 控制表达方式学习、黑话学习、表达方式自动检查和互通组。

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `learning_list` | `list[LearningItem]` | 按聊天流配置表达学习 |
| `advanced_chosen` | `bool` | 是否启用基于子代理的二次表达方式选择 |
| `expression_groups` | `list[ExpressionGroup]` | 表达学习互通组 |
| `expression_checked_only` | `bool` | 是否仅选择已检查且未拒绝的表达方式 |
| `expression_self_reflect` | `bool` | 是否启用自动表达优化 |
| `expression_auto_check_interval` | `int` | 表达方式自动检查间隔，单位秒 |
| `expression_auto_check_count` | `int` | 每次自动检查随机选取的表达方式数量 |
| `expression_auto_check_custom_criteria` | `list[str]` | 额外自定义评估标准 |
| `all_global_jargon` | `bool` | 是否开启全局黑话模式 |

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

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `platform` | `str` | 平台；和 `item_id` 一起留空表示全局 |
| `item_id` | `str` | 用户/群 ID；和 `platform` 一起留空表示全局 |
| `rule_type` | `"group" \| "private"` | 聊天流类型 |
| `use_expression` | `bool` | 是否使用表达学习结果 |
| `enable_learning` | `bool` | 是否启用表达优化学习 |
| `enable_jargon_learning` | `bool` | 是否启用黑话学习 |

## 语音 [voice]

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enable_asr` | `bool` | 见默认配置 | 是否启用语音识别，启用后可识别语音消息 |

## 表情包 [emoji]

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `emoji_send_num` | `int` | 一次从多少个表情包中选择发送，最大 `64` |
| `max_reg_num` | `int` | 表情包最大注册数量 |
| `do_replace` | `bool` | 达到最大注册数量时是否替换旧表情包 |
| `check_interval` | `int` | 表情包检查间隔，单位分钟 |
| `steal_emoji` | `bool` | 是否收集聊天中的表情包 |
| `content_filtration` | `bool` | 是否启用表情包过滤 |
| `filtration_prompt` | `str` | 表情包过滤要求 |

## 关键词反应 [keyword_reaction]

```toml
[[keyword_reaction.keyword_rules]]
keywords = ["关键词"]
reaction = "触发后的反应"

[[keyword_reaction.regex_rules]]
regex = ["^正则.*"]
reaction = "触发后的反应"
```

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `keyword_rules` | `list[KeywordRuleConfig]` | 关键词规则列表 |
| `regex_rules` | `list[KeywordRuleConfig]` | 正则表达式规则列表 |

`KeywordRuleConfig` 字段：

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `keywords` | `list[str]` | 关键词列表 |
| `regex` | `list[str]` | 正则表达式列表 |
| `reaction` | `str` | 关键词或正则触发后的反应 |

## 回复后处理

### response_post_process

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enable_response_post_process` | `bool` | 是否启用回复后处理，包括错别字生成器和回复分割器 |

### chinese_typo

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enable` | `bool` | 是否启用中文错别字生成器 |
| `error_rate` | `float` | 单字替换概率 |
| `min_freq` | `int` | 最小字频阈值 |
| `tone_error_rate` | `float` | 声调错误概率 |
| `word_replace_rate` | `float` | 整词替换概率 |

### response_splitter

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enable` | `bool` | 是否启用回复分割器 |
| `max_length` | `int` | 回复允许的最大长度 |
| `max_sentence_num` | `int` | 回复允许的最大句子数 |
| `enable_kaomoji_protection` | `bool` | 是否启用颜文字保护 |
| `enable_overflow_return_all` | `bool` | 句子数量超出上限时是否一次性返回全部内容 |

## 遥测与调试

### telemetry

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enable` | `bool` | 是否启用遥测 |

### debug

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enable_maisaka_stage_board` | `bool` | 是否启用 Maisaka 阶段看板 |
| `show_maisaka_thinking` | `bool` | 是否显示回复器推理 |
| `fold_maisaka_thinking` | `bool` | 是否折叠 Maisaka prompt 展示入口 |
| `show_jargon_prompt` | `bool` | 是否显示黑话相关提示词 |
| `show_memory_prompt` | `bool` | 是否显示记忆检索相关 prompt |
| `enable_reply_effect_tracking` | `bool` | 是否开启回复效果评分追踪 |

## 消息服务 [maim_message]

`[maim_message]` 同时包含旧版 WebSocket 服务和额外新版 API Server 的配置。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `ws_server_host` | `str` | `127.0.0.1` | 旧版 WebSocket 服务器主机地址 |
| `ws_server_port` | `int` | `8080` | 旧版 WebSocket 服务器端口 |
| `auth_token` | `list[str]` | `[]` | 旧版 API 验证令牌，为空则不启用验证 |
| `enable_api_server` | `bool` | 见默认配置 | 是否启用额外新版 API Server |
| `api_server_host` | `str` | 见默认配置 | 新版 API Server 主机地址 |
| `api_server_port` | `int` | 见默认配置 | 新版 API Server 端口 |
| `api_server_use_wss` | `bool` | 见默认配置 | 新版 API Server 是否启用 WSS |
| `api_server_cert_file` | `str` | `""` | SSL 证书文件路径 |
| `api_server_key_file` | `str` | `""` | SSL 密钥文件路径 |
| `api_server_allowed_api_keys` | `list[str]` | `[]` | 允许的 API Key 列表，为空则允许所有连接 |

## WebUI [webui]

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enabled` | `bool` | `true` | 是否启用 WebUI |
| `host` | `str` | `127.0.0.1` | WebUI 绑定主机地址 |
| `port` | `int` | `8001` | WebUI 绑定端口 |
| `mode` | `"development" \| "production"` | `"production"` | WebUI 运行模式 |
| `anti_crawler_mode` | `"false" \| "strict" \| "loose" \| "basic"` | `"basic"` | 防爬虫模式 |
| `allowed_ips` | `str` | `127.0.0.1` | IP 白名单，逗号分隔，支持精确 IP、CIDR 和通配符 |
| `trusted_proxies` | `str` | `""` | 信任的代理 IP 列表 |
| `trust_xff` | `bool` | `false` | 是否启用 `X-Forwarded-For` 代理解析 |
| `secure_cookie` | `bool` | `false` | 是否启用安全 Cookie，仅 HTTPS 传输 |
| `enable_paragraph_content` | `bool` | `false` | 是否在知识图谱中加载段落完整内容，会占用额外内存 |

## 数据库 [database]

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `save_binary_data` | `bool` | `false` | 是否将语音等二进制数据保存为独立文件；只影响新存储的消息 |

## MCP [mcp]

`[mcp]` 控制 MaiBot 的 MCP 客户端宿主能力和外部 MCP 服务器连接。

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enable` | `bool` | 是否启用 MCP |
| `client` | `MCPClientConfig` | MCP 客户端宿主能力配置 |
| `servers` | `list[MCPServerItemConfig]` | MCP 服务器配置列表 |

### mcp.client

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `client_name` | `str` | MCP 客户端实现名称 |
| `client_version` | `str` | MCP 客户端实现版本 |
| `roots.enable` | `bool` | 是否向 MCP 服务器暴露 Roots 能力 |
| `roots.items` | `list[MCPRootItemConfig]` | Roots 列表 |
| `sampling.enable` | `bool` | 是否启用 Sampling 能力声明 |
| `sampling.task_name` | `str` | Sampling 请求使用的主程序模型任务名 |
| `sampling.include_context_support` | `bool` | 是否声明支持 `includeContext` 非 `none` 语义 |
| `sampling.tool_support` | `bool` | 是否声明支持在 Sampling 中继续使用工具 |
| `elicitation.enable` | `bool` | 是否启用 Elicitation 能力声明 |
| `elicitation.allow_form` | `bool` | 是否允许表单模式 Elicitation |
| `elicitation.allow_url` | `bool` | 是否允许 URL 模式 Elicitation |

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

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `name` | `str` | 服务器名称，必须唯一 |
| `enabled` | `bool` | 是否启用当前服务器 |
| `transport` | `"stdio" \| "streamable_http"` | 传输方式 |
| `command` | `str` | `stdio` 模式下启动服务器的命令 |
| `args` | `list[str]` | `stdio` 模式下的命令参数 |
| `env` | `dict[str, str]` | `stdio` 模式下附加的环境变量 |
| `url` | `str` | `streamable_http` 模式下的 MCP 端点 |
| `headers` | `dict[str, str]` | HTTP 模式下附加请求头 |
| `http_timeout_seconds` | `float` | HTTP 请求超时时间 |
| `read_timeout_seconds` | `float` | 会话读取超时时间 |
| `authorization.mode` | `"none" \| "bearer"` | HTTP 认证模式 |
| `authorization.bearer_token` | `str` | Bearer Token，仅在 `mode = "bearer"` 时使用 |

## 插件运行时 [plugin_runtime]

`[plugin_runtime]` 控制插件 Runner 和插件运行时浏览器渲染能力。

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enabled` | `bool` | 是否启用插件系统 |
| `health_check_interval_sec` | `float` | 健康检查间隔 |
| `max_restart_attempts` | `int` | Runner 崩溃后最大自动重启次数 |
| `runner_spawn_timeout_sec` | `float` | 等待 Runner 子进程启动并注册的超时时间 |
| `hook_blocking_timeout_sec` | `float` | Hook 阻塞步骤的全局超时上限 |
| `ipc_socket_path` | `str` | 自定义 IPC Socket 路径，仅 Linux/macOS 生效；留空自动生成 |

### plugin_runtime.render

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `enabled` | `bool` | 是否启用插件运行时浏览器渲染能力 |
| `browser_ws_endpoint` | `str` | 优先复用的现有 Chromium CDP 地址 |
| `executable_path` | `str` | 浏览器可执行文件路径，留空自动探测 |
| `browser_install_root` | `str` | Playwright 托管浏览器目录 |
| `headless` | `bool` | 是否以无头模式启动浏览器 |
| `launch_args` | `list[str]` | 浏览器启动参数 |
| `concurrency_limit` | `int` | 同时允许进行的最大渲染任务数 |
| `startup_timeout_sec` | `float` | 浏览器连接或启动超时时间 |
| `render_timeout_sec` | `float` | 单次渲染默认超时时间 |
| `auto_download_chromium` | `bool` | 未检测到可用浏览器时是否自动下载 Playwright Chromium |
| `download_connection_timeout_sec` | `float` | 自动下载 Chromium 时的连接超时时间 |
| `restart_after_render_count` | `int` | 累计渲染指定次数后自动重建浏览器，`0` 表示关闭 |

## 常用配置示例

### 新手最小配置

```toml
[bot]
platform = "qq"
qq_account = 123456789
nickname = "麦麦"
alias_names = ["小麦"]

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

### 连接适配器

```toml
[maim_message]
ws_server_host = "127.0.0.1"
ws_server_port = 8080
auth_token = []
```

如果适配器运行在 Docker 网络或其他机器上，需要结合部署方式调整监听地址和端口。

## 下一步

- 配置模型：看 [模型配置](./model-config.md)
- 连接 QQ：看 [NapCat 适配器](../adapters/napcat.md)
- 管理 WebUI：看 [WebUI 配置管理](../webui/config-management.md)
