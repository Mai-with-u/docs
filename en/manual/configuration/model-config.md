---
title: Model Configuration
titleTemplate: :title · Model Configuration
---

# Model Configuration

`model_config.toml` Configure the "AI brain" for Maimai — deciding which LLM models to use for different components, and how to connect to API providers.

The minimum startup requires only one LLM model and one API provider (both `models` and `api_providers` must not be empty). Full functionality also requires a VLM model (for image recognition) and an embedding model (for memory search).

## API Providers

Each `[[api_providers]]` block defines an API provider. A single configuration file can have multiple providers.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "deepseek"                          # [Required] API provider name, must be used in the api_provider field of models
base_url = "https://api.deepseek.com/v1"   # [Required] BaseURL of the API provider
api_key = "your-api-key"                   # [Required] API key. Not required if auth_type is none
client_type = "openai"                     # [Optional] Client type: openai (default) / openai_responses / google
auth_type = "bearer"                       # [Optional] Auth type: bearer (default) / header / query / none
auth_header_name = "Authorization"         # [Optional] Request header name used when auth_type is header
auth_header_prefix = "Bearer"              # [Optional] Request header prefix used when auth_type is header, leave empty to send the raw key directly
auth_query_name = "api_key"                # [Optional] Query parameter name used when auth_type is query
default_headers = {}                       # [Optional] Default HTTP headers attached to all requests
default_query = {}                         # [Optional] Default query parameters attached to all requests
# organization = "org-xxxx"                # [Optional] Optional organization for official OpenAI API
# project = "proj-xxxx"                    # [Optional] Optional project for official OpenAI API
model_list_endpoint = "/models"            # [Optional] Model list endpoint path
reasoning_parse_mode = "auto"              # [Optional] Reasoning content parse mode: auto (default) / native / think_tag / none
tool_argument_parse_mode = "auto"          # [Optional] Tool argument parse mode: auto (default) / strict / repair / double_decode
max_retry = 3                              # [Optional] Maximum number of retries
timeout = 120                              # [Optional] API call timeout in seconds (default 120)
retry_interval = 4                         # [Optional] Retry interval in seconds (default 4)
```

:::

**Key Points:**

- **Required**: `name` (provider name), `base_url` (endpoint URL), `api_key` (key, except when `auth_type = "none"`)
- **Authentication**: Default `bearer` works for most providers. Other options are `header` / `query` / `none`
- **Client**: Default is `openai`. For Google Gemini use `"google"`, see [Model Extra Params](./model-extra-params.md#gemini-native-api)
- **Responses API**: For providers supporting the OpenAI Responses protocol (e.g. DeepSeek v4 flash web search) use `"openai_responses"` (officially supported since 1.2.0), see [Model Extra Params](./model-extra-params.md#responses-api)
- **Timeout & Retry**: `timeout` defaults to 120s, `max_retry` defaults to 3 times, `retry_interval` defaults to 4s
- See comments above for other fields, all have reasonable default values


## Models

Each `[[models]]` block defines a specific LLM model, linked to an API provider.

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[models]]
model_identifier = "deepseek-v4-flash"       # [Required] Model identifier provided by the API provider
name = "deepseek-v4-flash"                   # [Required] Model name, must be used in model_task_config
api_provider = "deepseek"                    # [Required] Corresponds to the provider name configured in api_providers
price_in = 1.0                               # [Optional] Input price (the non-cache-hit portion), unit: CNY/M token
price_out = 2.0                              # [Optional] Output price, unit: CNY/M token
cache_price_in = 0.0                         # [Optional] Cache-hit input price: 0 means hits are free; left empty in WebUI it resolves to the input price
price_periods = []                           # [Optional] Time-based price list, see "Time-Based Pricing" below
# cache = false                              # [Deprecated] Legacy compatibility field, no longer participates in any billing logic
# temperature = 0.7                          # [Optional] Model-level temperature, overrides temperature in task config
# max_tokens = 4096                          # [Optional] Model-level max token count, overrides max_tokens in task config
# send_temperature = true                    # [Optional] Whether to send the MaiBot-managed temperature, true by default; set to false to stop sending model/task temperatures
force_stream_mode = false                    # [Optional] Force stream output mode, set to true if the model does not support non-streaming output
visual = false                               # [Optional] Whether it is a multimodal model (supports visual input)
extra_params = {}                            # [Optional] Extra parameters, see Model Extra Params
```

:::

**Key Points:**

- **Required**: `model_identifier` (API identifier), `name` (custom name), `api_provider` (associated provider)
- **Pricing**: `price_in` / `price_out` used for statistics, unit is CNY/million tokens. The cache-hit price is decided by `cache_price_in`: set it to `0` for free hits, and the non-hit portion is billed at `price_in`; the legacy `cache` field is deprecated, and whether a provider returns cache usage is auto-detected from the response
- **Time-Based Pricing**: when a provider bills by time slot, use `price_periods` to override the default unit prices, see "Time-Based Pricing" below
- **Model-level Override**: `temperature` / `max_tokens` can override task config; if not set, task defaults are used
- **Temperature Send Switch**: `send_temperature` defaults to `true`; set it to `false` (or turn off "Send temperature parameter" in the WebUI model advanced settings) to stop MaiBot from sending any MaiBot-managed temperature for this model (model-level, task-level, and extra parameters), compatible with models that reject this parameter
- **Vision**: `visual = true` indicates support for image input, used for `vlm` tasks
- **`extra_params`**: Provider-specific parameters (thinking mode, reasoning intensity, etc.), see [Model Extra Params](./model-extra-params.md)


## Time-Based Pricing

When a provider offers discounted pricing in certain slots, use `price_periods` to configure per-model price slots that repeat daily by **server local time**. Billing is decided by the slot that the start time of a successful request falls into.

::: code-group

```toml [model_config.toml ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash"
# ... other fields omitted

# Discount price every day 00:30–08:30 (a slot includes the start and excludes the end)
[[models.price_periods]]
start_time = "00:30"
end_time = "08:30"
price_in = 0.5
price_out = 1.0
cache_price_in = 0.0

# Slot crossing midnight: 22:00 to 06:00 the next day
[[models.price_periods]]
start_time = "22:00"
end_time = "06:00"
price_in = 0.8
price_out = 1.6
cache_price_in = 0.0
```

:::

**Key Points:**

- Times must be `HH:MM` in 24-hour form (server local time)
- A slot **includes the start time and excludes the end time**; `start_time` later than `end_time` means the slot crosses midnight
- When no slot matches, fall back to the model's default `price_in` / `price_out` / `cache_price_in`; `price_periods = []` means the default price all day
- Slots of the same model must not overlap, and a single slot's `start_time` must not equal its `end_time`, or config validation fails
- `cache_price_in` inside a slot follows the same "0 means cache hits are free" rule


## Task Configuration

Assign different models to each task based on task characteristics to achieve optimal performance and efficiency.

Maimai categorizes model calls into three roles: **Planner** is the strategic core, deciding when to speak and which tools to call (requires strong reasoning ability to orchestrate MCP and toolchains); **Replyer** is responsible for converting the information gathered by the Planner into the final reply text, focusing on language quality; other auxiliary tasks use low-cost flash models to prioritize speed. A typical "receive message -> send reply" trigger involves 3~6 LLM calls.

::: code-group

```toml [replyer（智能模型） ~vscode-icons:file-type-toml~]
# [必填] 回复器：将 Planner 收集的信息转为最终回复文本。追求语言质量和表达风格，推荐 pro 模型 + 思考模式。
[model_task_config.replyer]
model_list = ["deepseek-v4-pro-think"]        # [必填] 模型名称列表
max_tokens = 8192                             # [可选] 最大输出 token 数
temperature = 1.0                             # [可选] 模型温度，0.3 保守 / 0.7 有创意 / 1.0 随机
selection_strategy = "random"                 # [可选] 模型选择策略：balance / random / sequential
hard_timeout = 240.0                          # [可选] 硬超时（秒）
```

```toml [planner（快模型） ~vscode-icons:file-type-toml~]
# [必填] 规划器：战略核心——决定何时说话、回复谁、调用哪些工具（MCP/插件）。需较强推理和 tool 调用能力。
[model_task_config.planner]
model_list = ["deepseek-v4-flash"]            # [必填] 模型名称列表
max_tokens = 16384                            # [可选] 最大输出 token 数
temperature = 0.7                             # [可选] 模型温度
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 180.0                          # [可选] 硬超时（秒）
```

```toml [utils（快模型） ~vscode-icons:file-type-toml~]
# [必填] 组件模型：表情包分析、学习分析、取名、关系模块、情绪变化等。麦麦必须的模型。
[model_task_config.utils]
model_list = ["deepseek-v4-flash"]            # [必填] 模型名称列表
max_tokens = 8192                             # [可选] 最大输出 token 数
temperature = 0.5                             # [可选] 模型温度
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [memory（长期记忆） ~vscode-icons:file-type-toml~]
# [可选] 长期记忆：记忆总结、抽取、写回等高质量任务（A_Memorix 子系统）。
# 默认 model_list 为空（不自动回退），未配置时调用方按需处理。
[model_task_config.memory]
model_list = []                               # [可选] 模型名称列表
max_tokens = 8192                             # [可选] 最大输出 token 数
temperature = 0.3                             # [可选] 模型温度
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 240.0                          # [可选] 硬超时（秒）
```

```toml [mid_memory（中期摘要） ~vscode-icons:file-type-toml~]
# [可选] 中期摘要：上下文裁切时将历史聊天压缩为摘要。留空时自动回退到 planner。
[model_task_config.mid_memory]
model_list = []                               # [可选] 模型名称列表（→回退 planner）
max_tokens = 8192                             # [可选] 最大输出 token 数
temperature = 0.7                             # [可选] 模型温度
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 180.0                          # [可选] 硬超时（秒）
```

```toml [learner（学习） ~vscode-icons:file-type-toml~]
# [可选] 学习模型：表达方式学习和黑话学习。留空时自动回退到 utils。
[model_task_config.learner]
model_list = []                               # [可选] 模型名称列表（→回退 utils）
max_tokens = 8192                             # [可选] 最大输出 token 数
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [expression_use (expression selection) ~vscode-icons:file-type-toml~]
# [Optional] Expression selection model. Falls back to utils when empty.
[model_task_config.expression_use]
model_list = []
max_tokens = 8192
temperature = 0.3
selection_strategy = "balance"
hard_timeout = 120.0
```

```toml [emoji（表情包选择） ~vscode-icons:file-type-toml~]
# [可选] 表情包选择：从候选表情包中选出合适的一张发送。
# 选择优先级：emoji 有模型→用 emoji，planner 全视觉→用 planner，否则→用 vlm
[model_task_config.emoji]
model_list = []                               # [可选] 模型名称列表
max_tokens = 8192                             # [可选] 最大输出 token 数
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [vlm（看图） ~vscode-icons:file-type-toml~]
# [强烈建议] 看图说话：理解图片内容。需 visual=true 的多模态模型。
[model_task_config.vlm]
model_list = ["qwen-vl"]                      # [必填] 模型名称列表，需 visual=true 的多模态模型
max_tokens = 8192                             # [可选] 最大输出 token 数
hard_timeout = 240.0                          # [可选] 硬超时（秒）
```

```toml [voice（语音识别） ~vscode-icons:file-type-toml~]
# [可选] 语音识别：语音转文字。
[model_task_config.voice]
model_list = []                               # [可选] 模型名称列表
max_tokens = 8192                             # [可选] 最大输出 token 数
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [embedding（文本嵌入） ~vscode-icons:file-type-toml~]
# [强烈建议] 嵌入模型：生成文本向量，用于长期记忆的语义搜索。
# 推荐专门的嵌入模型（如 text-embedding-3-small）。未配置时记忆搜索不可用。
[model_task_config.embedding]
model_list = ["text-embedding-3-small"]       # [必填] 模型名称列表，推荐专门的嵌入模型
max_tokens = 4096                             # [可选] 最大输出 token 数
hard_timeout = 60.0                           # [可选] 硬超时（秒）
```

```toml [image_embedding（图片嵌入） ~vscode-icons:file-type-toml~]
# [可选] 图片嵌入模型：把图片编码成向量，用于图片记忆的以图搜图和相似召回。
# 需要实现"图片输入到向量"协议的嵌入模型；留空时不启用图片嵌入，图片记忆降级为不可检索。
[model_task_config.image_embedding]
model_list = []                               # [可选] 模型名称列表，需支持图片输入的嵌入模型
max_tokens = 4096                             # [可选] 最大输出 token 数
hard_timeout = 60.0                           # [可选] 硬超时（秒）
```

:::

**Key Points:**

- **Three Must-Configures**: Set up `replyer`, `planner`, `utils` to run; leave the rest empty for automatic fallback
- **Planner is the Strategic Core**: Decides when to speak and which tools to call (MCP/plugins), requires some reasoning ability, a balanced model is recommended
- **Replyer Focuses on Language Quality**: Converts Planner's gathered info into the final reply, pro model + thinking mode recommended
- **Vision**: `vlm` requires a multimodal model from `visual = true`, `qwen-vl` recommended
- **Embedding**: `embedding` recommends a dedicated embedding model (e.g., `text-embedding-3-small`); if not configured, memory search will be unavailable
- **Image Embedding**: `image_embedding` requires an embedding model that supports image input, used by image memory; when unconfigured, image assets are still saved, but the retrieval status shows the model as unavailable
- **No more slow-request threshold**: the legacy `slow_threshold` in task config has been removed, and slow requests are now observed via logs and statistics; the field is ignored automatically on upgrade
- `temperature` / `max_tokens` in model config will override settings here

### Standalone Model Provider Saving (v1.2.5+)

In earlier versions, attempting to save a provider with an empty model list was blocked by frontend form validation. Starting with MaiBot v1.2.5 (WebUI v1.7.4), providers and models are decoupled during configuration:

* **Support Saving Without Models**: Navigate to **Model Management → Add/Edit Provider**. After filling in the basic provider details (Name, API Base URL, API Key), you can click **Save Provider** immediately even if no specific models have been added yet.
* **Deferred Model Addition**: Once the provider is saved, you can add models at any time under its provider card—either by clicking **Add Model** manually or by using the auto-detection feature to fetch available models from the endpoint.

::: tip Preventing Configuration Deadlock
This change resolves the deadlock where setting up custom or local LLM providers without pre-existing model lists prevented saving provider credentials.
:::

### Fallback Rules

When `model_list` for some tasks is empty, other tasks are automatically reused:

```
         ┌──────────┐
         │  planner │◄──── mid_memory (falls back when empty)
         └──────────┘
              ▲
              │
         ┌──────────┐
         │  utils   │◄──── learner (falls back when empty)
         │          │◄──── expression_use (falls back when empty)
         └──────────┘

memory · emoji · vlm · voice · embedding · image_embedding → No automatic fallback when empty, caller will skip or throw an error

emoji special logic: emoji has model -> use emoji, planner is full visual -> use planner, otherwise -> use vlm
```

**Two special rules for embedding models**: `embedding` and `image_embedding` **ignore `selection_strategy`** and always take the first available model in `model_list` order — this keeps the vector space consistent and never rotates between models; in WebUI these two tasks are also rendered as **single-select model pickers**. When `image_embedding` is left empty, image memory directly shows "model unavailable" and does not fall back to the text embedding model.

## Next Steps

- Advanced model parameters (thinking mode, reasoning intensity): [Model Extra Params](./model-extra-params.md)
- Configure the bot: see [Bot Configuration](./bot-config.md)
- Connect to QQ: [NapCat Adapter](../adapters/napcat.md)
- Manage WebUI: [WebUI Configuration Management](../webui/config-management.md)
