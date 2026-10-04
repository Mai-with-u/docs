---
title: Model Extra Parameters
titleTemplate: :title · Model Parameters
---

# Model Extra Parameters (extra_params)

Every model in `model_config.toml` accepts an `extra_params` field for passing provider-specific parameters in API calls. The most common use is controlling a model's thinking mode and reasoning intensity.

`extra_params` is not sent to the provider as-is. Before the request, the client splits and converts it by rule:

- **`headers`** — passed as HTTP request headers
- **`query`** — passed as URL query parameters
- **`body`** — merged into the request body
- **Other plain keys** — passed as extra request-body fields (the OpenAI SDK's `extra_body`)

When `client_type = "google"`, `extra_params` is not split by the rules above. Instead, the Gemini client filters the fields it supports and maps them to `GenerateContentConfig`.

---

## Thinking and Non-thinking Modes

Many large models support a "thinking mode" — deep reasoning before answering, improving response quality on complex questions. MaiBot supports two API families, each configured differently:

- **OpenAI-compatible API** (`client_type = "openai"`): DeepSeek, OpenAI, Alibaba Cloud Bailian, etc.
- **Gemini native API** (`client_type = "google"`): the Google Gemini family

### WebUI Thinking Switch Adapts to Provider Templates

The thinking switch in the default-parameter area of the "Edit Model" dialog **does not hard-code a parameter name**. When you save a model, MaiBot matches the provider's `base_url` against the built-in provider templates, then writes the matching parameter into `extra_params` according to the template's thinking-format metadata. DeepSeek gets its own dedicated switch (including the Responses client and web search) — see [DeepSeek Dedicated Switch](#deepseek-dedicated-switch). Every other provider falls into one of three write formats:

- **`thinking_type`** — Zhipu, Kimi, MiniMax, Doubao: writes `thinking.type`. The "on" value differs per provider; templates that allow disabling write `disabled` when off
- **`enable_thinking`** — Alibaba Cloud Bailian, SiliconFlow: writes the boolean `enable_thinking = true` / `false`
- **`reasoning_effort`** — StepFun, OpenAI, xAI: reasoning models always think, so the switch cannot be turned off — only the effort level can be changed

When the Base URL matches no built-in template (a custom endpoint), no thinking switch is shown and you have to write `extra_params` by hand as described below.

Thinking effort (`reasoning_effort`) and thinking budget (`thinking_budget`) are two independent parameters: the effort selector appears only on templates that define effort levels, and the budget field appears only on templates that define a budget parameter. Leaving the budget empty means "use the provider default". Both only apply to OpenAI-compatible APIs; Gemini uses [`thinking_config`](#gemini-native-api).

> The `model_identifier` values below are placeholders — replace them with the actual model IDs you use.

#### thinking_type: Zhipu / Kimi / MiniMax / Doubao

All four write `thinking.type`, but the "on" value differs:

- **Zhipu (GLM)** — on value `enabled`; effort parameter `reasoning_effort` with levels `max` / `xhigh` / `high` / `medium` / `low` / `minimal` / `none`, default `max`. Turning the switch on also writes the default level if no effort is set yet
- **Kimi (Moonshot)** — on value `enabled`, no effort levels
- **MiniMax (Hailuo AI)** — on value `adaptive`, letting the model decide; can be turned off
- **Doubao** — on value `auto`, letting the model decide; can be turned off; supports the thinking budget `thinking_budget`

::: code-group

```toml [Zhipu (on + effort) ~vscode-icons:file-type-toml~]
[[models]]
name = "zhipu-think"
model_identifier = "glm-5"
api_provider = "zhipu"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

```toml [Kimi (on) ~vscode-icons:file-type-toml~]
[[models]]
name = "kimi-think"
model_identifier = "kimi-k3"
api_provider = "moonshot"
visual = false
extra_params = {thinking = {type = "enabled"}}
```

```toml [MiniMax (on) ~vscode-icons:file-type-toml~]
[[models]]
name = "minimax-think"
model_identifier = "MiniMax-M3"
api_provider = "minimax"
visual = false
extra_params = {thinking = {type = "adaptive"}, reasoning_split = true}
```

```toml [Doubao (on + budget) ~vscode-icons:file-type-toml~]
[[models]]
name = "doubao-think"
model_identifier = "doubao-pro"
api_provider = "doubao"
visual = false
extra_params = {thinking = {type = "auto"}, thinking_budget = 8192}
```

:::

**Key points:**

- Turning thinking off writes `thinking.type = "disabled"` and **also removes the effort parameter** (meaningless once thinking is off). The budget parameter is kept
- MiniMax chain-of-thought content is only returned in `reasoning_content` when `reasoning_split = true` is set
- `thinking_budget` only accepts a non-negative integer; a negative number or a string is rejected by the switch as a configuration error

#### enable_thinking: Bailian / SiliconFlow

These two use a boolean switch, with no `thinking` object:

- **Alibaba Cloud Bailian (Qwen)** — `enable_thinking = true/false`, plus the thinking budget `thinking_budget`. Hybrid-thinking models also accept a `/think` or `/no_think` prompt suffix to switch temporarily
- **SiliconFlow** — `enable_thinking = true/false`, plus the thinking budget `thinking_budget`

::: code-group

```toml [Bailian (on + budget) ~vscode-icons:file-type-toml~]
[[models]]
name = "qwen-think"
model_identifier = "qwen-plus"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = true, thinking_budget = 8192}
```

```toml [Bailian (off) ~vscode-icons:file-type-toml~]
[[models]]
name = "qwen-nothink"
model_identifier = "qwen-plus"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = false}
```

```toml [SiliconFlow (on) ~vscode-icons:file-type-toml~]
[[models]]
name = "silicon-think"
model_identifier = "Qwen/Qwen3-32B"
api_provider = "siliconflow"
visual = false
extra_params = {enable_thinking = true}
```

:::

**Key points:**

- `enable_thinking` only accepts a boolean; a string such as `"true"` is rejected with "enable_thinking can only be true or false"
- `/think` and `/no_think` are one-off prompt suffixes — they affect the current turn only and never change the model configuration

#### reasoning_effort: StepFun / OpenAI / xAI

These three templates have effort levels only and **no switch**: reasoning models always think, so the enable-thinking switch is greyed out and only the level can be changed. The allowed levels and defaults differ:

- **StepFun** — `low` / `medium` / `high`, default `medium`
- **OpenAI** — `minimal` / `low` / `medium` / `high`, default `medium`
- **xAI (Grok)** — `low` / `high`, no default (the first level is used)

::: code-group

```toml [OpenAI ~vscode-icons:file-type-toml~]
[[models]]
name = "openai-reason"
model_identifier = "gpt-5"
api_provider = "openai"
visual = false
extra_params = {reasoning_effort = "minimal"}
```

```toml [xAI ~vscode-icons:file-type-toml~]
[[models]]
name = "grok-reason"
model_identifier = "grok-4"
api_provider = "xai"
visual = false
extra_params = {reasoning_effort = "low"}
```

```toml [StepFun ~vscode-icons:file-type-toml~]
[[models]]
name = "step-reason"
model_identifier = "step-3"
api_provider = "stepfun"
visual = false
extra_params = {reasoning_effort = "high"}
```

:::

**Key points:**

- An effort outside the allowed levels makes the WebUI report "reasoning_effort can only be …". When editing `model_config.toml` by hand, follow each provider's level list, otherwise the provider rejects the call
- The WebUI only lists the levels configured in the template. OpenAI itself also accepts `none` and `xhigh` (see [OpenAI-compatible APIs](#openai-compatible-apis) below); you can write them by hand, they are just not shown in the UI
- Not being able to turn thinking off does not mean you cannot save tokens: drop to the lowest level (`minimal` on OpenAI, `low` on xAI) — that is the cheapest setting

#### DeepSeek Dedicated Switch

DeepSeek's two clients differ too much to fit the three general formats, so the model config page renders a dedicated block for it:

- **Enable thinking** — writes `thinking.type` for the `openai` client, and `reasoning.effort` for the `openai_responses` client
- **Thinking effort** — `low` / `high` / `max`; greyed out while thinking is off
- **Enable web search** — only available with the `openai_responses` client; writes DeepSeek's native `web_search` tool and keeps any other tools already in `tools`

::: code-group

```toml [Chat Completions ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-think"
model_identifier = "deepseek-chat"
api_provider = "deepseek"
client_type = "openai"
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

```toml [Responses (web search) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-web"
model_identifier = "deepseek-chat"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "high"}, tools = [{type = "web_search"}]}
```

:::

**Key points:**

- Do not write `reasoning` on the `openai` client, and do not write `thinking` or `reasoning_effort` on the `openai_responses` client — mixing them is rejected with an "extra parameter conflict" error
- The web-search tool may only be configured once, and configuring `web_search` on the `openai` client is rejected outright; switch to `openai_responses` instead
- Full syntax: see [Responses API](#responses-api) below

#### Per-provider Limits and Pitfalls

These limits come from the providers themselves — violating them returns a 400 error. Check them before configuring:

- **Kimi k2.7-code** — only supports thinking enabled; writing `thinking.type = "disabled"` fails
- **Kimi k3 series** — does not accept the `thinking` parameter; only `reasoning_effort` can tune the level, so do not write `thinking`
- **MiniMax M2.x** — thinking cannot be turned off; `disabled` only works on M3
- **Zhipu GLM-5.3 series** — does not support turning thinking off, and the effort levels narrow to `low` / `high` / `max` (default `max`). GLM Coding Plan is a separate template and is not affected
- **Volcano Ark Coding Plan** — plan credentials are not interchangeable with pay-as-you-go API keys; the console may show an account-specific Base URL that differs from the template, so follow the console

The matching `extra_params` writes:

::: code-group

```toml [Kimi k2.7-code (on only) ~vscode-icons:file-type-toml~]
[[models]]
name = "kimi-k27-code"
model_identifier = "kimi-k2.7-code"
api_provider = "moonshot"
visual = false
extra_params = {thinking = {type = "enabled"}}
```

```toml [Kimi k3 (effort only) ~vscode-icons:file-type-toml~]
[[models]]
name = "kimi-k3"
model_identifier = "kimi-k3"
api_provider = "moonshot"
visual = false
extra_params = {reasoning_effort = "high"}
```

```toml [MiniMax M3 (can disable) ~vscode-icons:file-type-toml~]
[[models]]
name = "minimax-m3"
model_identifier = "MiniMax-M3"
api_provider = "minimax"
visual = false
extra_params = {thinking = {type = "disabled"}, reasoning_split = true}
```

```toml [GLM-5.3 (cannot disable) ~vscode-icons:file-type-toml~]
[[models]]
name = "glm-53"
model_identifier = "glm-5.3"
api_provider = "zhipu"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

:::

::: warning Note
The four blocks above show **hand-written** `extra_params`. The WebUI switch only checks the template for whether disabling is allowed; per-model limits appear as small print below the switch (for example Kimi k2.7-code and MiniMax M2.x). Zhipu GLM-5.3 is a restriction the template applies per model identifier, so its switch is greyed out directly. Writing `disabled` in the source file for a model that does not support it makes saving report "the current model does not support turning thinking off".
:::

#### New Plan-based Provider Templates

MaiBot 1.3.1 adds three subscription-plan provider templates. Their thinking switches match the corresponding pay-as-you-go templates:

- **GLM Coding Plan** — `https://open.bigmodel.cn/api/coding/paas/v4`
- **StepFun Step Plan** — `https://api.stepfun.com/step_plan/v1`
- **Volcano Ark Coding Plan** — `https://ark.cn-beijing.volces.com/api/coding/v3`

::: code-group

```toml [GLM Coding Plan ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "zhipu-coding"
base_url = "https://open.bigmodel.cn/api/coding/paas/v4"
api_key = "your-glm-coding-plan-key"
client_type = "openai"
```

```toml [StepFun Step Plan ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "stepfun-plan"
base_url = "https://api.stepfun.com/step_plan/v1"
api_key = "your-step-plan-key"
client_type = "openai"
```

```toml [Volcano Ark Coding Plan ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "ark-coding"
base_url = "https://ark.cn-beijing.volces.com/api/coding/v3"
api_key = "your-ark-coding-plan-key"
client_type = "openai"
```

:::

**Key points:**

- **Plan credentials are not interchangeable with pay-as-you-go keys** — plan templates need the key issued by the plan subscription; filling in a pay-as-you-go API key fails authentication
- **The Base URL may differ per account** — the Volcano Ark Coding Plan console sometimes issues an account-specific address; use that address instead of copying the template
- Switch behaviour matches the corresponding pay-as-you-go template: GLM Coding Plan uses `thinking_type` + `reasoning_effort`, Step Plan uses `reasoning_effort`, and Ark Coding Plan uses `thinking_type` (on value `auto`) + `thinking_budget`

### OpenAI-compatible APIs

The `thinking` object is a thinking-mode switch shared by several providers. **DeepSeek**, **Kimi (Moonshot)**, and **GLM (Zhipu)** all use this format in exactly the same way. `reasoning_effort` is optional; omit it to use the default intensity. Some third-party platforms (e.g. Alibaba Cloud Bailian / DashScope) use the `enable_thinking` parameter format instead. The WebUI switch writes exactly the parameters described in this section, so hand-written configuration follows the same rules:

::: code-group

```toml [Official (thinking) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-think"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

```toml [Official (non-thinking) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-nothink"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
visual = false
extra_params = {thinking = {type = "disabled"}}
```

```toml [Official (max) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-max"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "max"}
```

```toml [Third-party (thinking) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-think"
model_identifier = "deepseek-v4-flash"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = true}
```

```toml [Third-party (non-thinking) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-nothink"
model_identifier = "deepseek-v4-flash"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = false}
```

:::

**Key points:**

- DeepSeek V4's `reasoning_effort` only supports two valid levels: `high` (default) and `max` (maximum reasoning). `low`/`medium` map to `high`, and `xhigh` maps to `max`
- Compared with OpenAI: OpenAI's `reasoning_effort` supports 6 independent levels (`none`/`minimal`/`low`/`medium` (default)/`high`/`xhigh`), each effective on its own — unlike DeepSeek V4's 2 valid levels. Note that `o1-mini` does not support this parameter
- **Multi-turn rule**: if a thinking turn contains no tool calls, there is no need to send the thinking content back; if there are tool calls, it must be sent back
- **Limitations**: in thinking mode `temperature` and `top_p` are silently ignored, and `tool_choice` causes a 400 error
- Third-party platforms (e.g. Alibaba Cloud Bailian / DashScope) control thinking mode with the `enable_thinking` boolean, which differs from the native `thinking` object. Confirm which format your platform supports before configuring

### Responses API

Some providers (e.g. DeepSeek v4 flash web search) use OpenAI's **Responses protocol** and require `client_type = "openai_responses"` in the provider configuration. The Responses API parameter format differs slightly from Chat Completions:

- **Thinking mode**: use `reasoning = {effort = "..."}` instead of `thinking`/`reasoning_effort`; `effort` accepts `none` / `low` / `high` / `max`
- **Web search**: add the native `web_search` tool to the `tools` list to enable it

::: code-group

```toml [Responses (thinking) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-responses-think"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "high"}}
```

```toml [Responses (non-thinking) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-responses-nothink"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "none"}}
```

```toml [Responses (web search) ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-responses-web"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "high"}, tools = [{type = "web_search"}]}
```

:::

**Key points:**

- In the Responses client, do not write `thinking` or `reasoning_effort`; always use `reasoning.effort`, otherwise the request is rejected by validation
- `reasoning.effort` has one more level than Chat Completions: `none` (fully disables thinking)
- The `web_search` tool is passed via `extra_params.body.tools` (fields in the `body` group are merged into the request body together with other plain keys — see [Custom HTTP Requests](#custom-http-requests))
- DeepSeek's Chat Completions endpoint does not support native web search; using web search requires the `openai_responses` client
- The Maisaka monitoring page and logs show a web-search summary for the turn (queries, actions, status, and source count)

### Gemini Native API

When `client_type = "google"`, `extra_params` is not processed by the OpenAI `headers/query/body` rules. The Gemini client filters the fields it supports and maps them to `GenerateContentConfig`.

#### Gemini 2.5 (thinking_budget)

The Gemini 2.5 family controls the thinking budget with `thinking_budget` (an integer):

::: code-group

```toml [Enable thinking ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-2.5-flash-think"
model_identifier = "gemini-2.5-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_budget = 4096, include_thoughts = true}}
```

```toml [Disable thinking ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-2.5-flash-nothink"
model_identifier = "gemini-2.5-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_budget = 0}}
```

```toml [Auto budget ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-2.5-pro-think"
model_identifier = "gemini-2.5-pro"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_budget = -1, include_thoughts = true}}
```

:::

**Key points:**

- `thinking_budget`: `-1` = automatic allocation, `0` = thinking disabled, `N` = a token budget
- `include_thoughts`: whether the response includes the thinking process
- Known issue: on Flash Preview 04-17, setting `thinking_budget = 0` may fail

#### Gemini 3.0+ (thinking_level)

Gemini 3.0 and later control thinking intensity with `thinking_level` (an enum):

::: code-group

```toml [High-intensity thinking ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-3-flash-high"
model_identifier = "gemini-3-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_level = "high", include_thoughts = true}}
```

```toml [Low-intensity thinking ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-3-flash-low"
model_identifier = "gemini-3-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_level = "low", include_thoughts = true}}
```

:::

**Key points:**

- `thinking_level` accepts: `minimal`, `low`, `medium`, `high`
- Do not combine `thinking_budget` and `thinking_level` — it causes a 400 error
- Multi-turn conversations need thought signatures to preserve context

#### Gemini Overview

- **Gemini 2.5** — controls the thinking budget via `thinking_budget`, range: `-1` (auto) / `0` (off) / `N` (budget); disable with `budget = 0`. Budget and level cannot be combined
- **Gemini 3.0+** — controls the thinking level via `thinking_level`, range: `minimal` / `low` / `medium` / `high`; disabled by leaving it unset or using `minimal`. No token-level budget control

Gemini 2.5 controls intensity indirectly by token count (`-1` = automatic), while Gemini 3.0+ sets the level directly with an enum value.

> Google APIs are not directly accessible from mainland China; a proxy is required.

## Custom HTTP Requests

`extra_params` supports three special keys for precise control over API requests:

- **`headers`** — adds HTTP request headers, e.g. `{headers = {"X-Custom" = "value"}}`
- **`query`** — adds URL query parameters, e.g. `{query = {"key" = "value"}}`
- **`body`** — fields inside it go into the request body along with other plain keys; it exists only to group entries by purpose in the config

::: warning Note
`body` does not create a separate request channel. Fields inside `body` and **all plain keys** outside `headers`/`query` are merged and sent together in the request body.
:::

For example:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[models]]
name = "custom-model"
model_identifier = "custom-model-v1"
api_provider = "custom"
visual = false
extra_params = {
  headers = {"X-API-Version" = "2024-06", "X-Priority" = "high"},
  query = {version = "2024-01-01"},
  body = {metadata = {source = "maibot"}},
  enable_thinking = false
}
```

:::

The actual effect after the client splits it:

**`headers`** — HTTP request headers: `X-API-Version: 2024-06`, `X-Priority: high`

**`query`** — URL query parameters: `?version=2024-01-01`

**`body` fields + other plain keys** — request body JSON: `{"metadata": {"source": "maibot"}, "enable_thinking": false}`

So `extra_params = {enable_thinking = "false"}` is equivalent to `extra_params = {body = {enable_thinking = "false"}}` — both send `enable_thinking` as a request-body JSON field to the provider, rather than a nested `{"extra_params": {"enable_thinking": "false"}}`.

## Image Embedding Models

Image-memory retrieval needs the `image_embedding` task to use a model that "takes an image and returns a vector". The request shapes differ per provider, so with `client_type = "openai"` two template fields in `extra_params` adapt them:

- **`image_embedding_input`** — the image input template, `"{data_uri}"` by default. Placeholders `{base64}`, `{data_uri}`, and `{mime_type}` are replaced at request time
- **`image_embedding_body`** — the request-body template (an object). Its `input` key overrides the input template above; all other keys are merged into the request body

When an official address is matched, MaiBot switches protocols automatically — no manual template needed:

- **Alibaba Cloud Bailian, Volcano Ark (Doubao)** — automatically switches to each provider's native multimodal embedding endpoint (Bailian `/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding`, Ark `<Base URL>/embeddings/multimodal`) and builds the body per the native protocol
- **SiliconFlow** — still uses `/embeddings`, with the `{"image": "{data_uri}"}` image input template filled in automatically
- **Other addresses** — nothing is guessed; you must write `image_embedding_input` or `image_embedding_body` yourself, otherwise the call fails

::: code-group

```toml [Generic OpenAI-compatible endpoint ~vscode-icons:file-type-toml~]
[[models]]
name = "vl-embed"
model_identifier = "vl-embed-v1"
api_provider = "custom-openai"
visual = false
extra_params = {image_embedding_input = "{data_uri}"}
```

```toml [Bailian (native protocol) ~vscode-icons:file-type-toml~]
[[models]]
name = "qwen-vl-embed"
model_identifier = "multimodal-embedding-v1"
api_provider = "dashscope"
visual = false
extra_params = {dimensions = 1024}
```

:::

**Key points:**

- Under the Bailian/Ark native protocols, `model` and `input` (plus `encoding_format` on Ark) are reserved fields that `extra_params` must not override — writing them fails
- Under the Bailian native protocol, the vector dimension can be written as top-level `dimensions` or as `parameters.dimension`; writing both with different values fails
- Since 1.3.1, an `image_embedding` task with no model configured fails immediately, telling you to specify an image-embedding-capable model under `image_embedding`, instead of failing only at request time
- The `embedding` and `image_embedding` tasks ignore `selection_strategy` and always take the first available model in `model_list` order — the vector space must stay consistent, since mixing embedding models corrupts the vector store

## Advanced Auth Configuration

- **`auth_header_name`** — Header auth name. Default `Authorization`
- **`auth_header_prefix`** — Header auth prefix. Default `Bearer`
- **`auth_query_name`** — Query auth parameter name. Default `api_key`

## Other Advanced Parameters

### Model-level Parameter Overrides

- **`temperature`** — model-level temperature, overrides the task config. Optional, e.g. `0.7`
- **`max_tokens`** — model-level max tokens, overrides the task config. Optional, e.g. `4096`
- **`force_stream_mode`** — forces streaming output; set `true` when a model does not support non-streaming. Off by default
- **`extra_params`** — extra-parameter dictionary. Empty by default

### Priority Rules

`temperature` and `max_tokens` can be written inside `extra_params` as model-level defaults, but prefer the standalone fields of the same name in the model config:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
temperature = 0.7
max_tokens = 4096
```

:::

The intent is clearer, and it avoids confusion with same-named fields in the provider's request body.

When the same parameter exists in multiple places, the effective priority is:

1. The value explicitly passed by the caller for this request
2. The standalone field in the current model config (e.g. `temperature`, `max_tokens`)
3. The same-named field in the current model's `extra_params`
4. The default value in the current task config

### API Provider Advanced Configuration

- **`default_headers`** — default HTTP headers. Empty by default
- **`default_query`** — default query parameters. Empty by default
- **`organization`** — OpenAI organization (optional). None by default
- **`project`** — OpenAI project (optional). None by default
- **`model_list_endpoint`** — model-list endpoint. Default `/models`
- **`reasoning_parse_mode`** — reasoning-content parse mode. Default `auto`
- **`tool_argument_parse_mode`** — tool-argument parse mode. Default `auto`

### Runtime Configuration

- **`timeout`** — request timeout. 60 seconds recommended
- **`max_retry`** — failed-request retries. 3 retries recommended
- **`retry_interval`** — retry interval. 5 seconds recommended

## Quick Parameter Reference

### OpenAI-compatible APIs

- **`thinking`** — thinking-mode control, contains `type`. `enabled` for Zhipu/Kimi, `adaptive` for MiniMax, `auto` for Doubao, `disabled` to turn off
- **`enable_thinking`** — boolean thinking switch. Applies to Alibaba Cloud Bailian, SiliconFlow
- **`reasoning_effort`** — reasoning-intensity level. DeepSeek only low/high/max, OpenAI six levels, xAI only low/high, StepFun low/medium/high, Zhipu seven levels (default `max`)
- **`reasoning`** — Responses API thinking control, contains `effort` (none/low/high/max). Applies to DeepSeek (Responses client)
- **`reasoning_split`** — MiniMax chain-of-thought split switch; with `true` the thinking content goes into `reasoning_content`
- **`thinking_budget`** — thinking budget (tokens). Applies to Doubao, Qwen/Bailian, SiliconFlow
- **`tools`** — native tool list, e.g. `{type = "web_search"}` enables web search. Applies to the DeepSeek Responses client
- **`image_embedding_input` / `image_embedding_body`** — image-embedding request templates. Applies to the `image_embedding` task
- **`headers`** — custom HTTP request headers. Applies to all
- **`query`** — custom URL query parameters. Applies to all
- **`body`** — custom request-body fields. Applies to all

### Gemini Native API

- **`thinking_config`** — thinking configuration, contains `thinking_budget` or `thinking_level`. Applies to the whole Gemini family
- **`thinking_budget`** — thinking budget (-1 auto / 0 off / N specified). Applies to Gemini 2.5
- **`thinking_level`** — thinking level (minimal/low/medium/high). Applies to Gemini 3.0+
- **`include_thoughts`** — whether the response includes the thinking process. Applies to the whole Gemini family

> Parameters are passed to the LLM API verbatim — make sure they match your provider's documentation, otherwise calls may fail.

## Verification and Troubleshooting

After configuring, run a capability test with the "Test model" button in the model list on the model config page: a thinking model returns text on success, and the test details show the reasoning content. If no reasoning content appears, check the thinking parameters in `extra_params` first.

- Saving reports "the current model does not support turning thinking off" → the template tightened the disable capability for that model identifier (typically Zhipu GLM-5.3). Kimi k2.7-code and MiniMax M2.x are per-model limits whose switch is not greyed out, so avoid writing `disabled` when configuring by hand
- Saving reports "reasoning_effort can only be …" → the level is outside that provider's range; fix it against the level lists above (xAI only has `low`/`high`)
- Saving reports "enable_thinking can only be true or false" → you wrote a string; change it back to a boolean
- A call returns 400 and the payload mentions `thinking` or `reasoning_effort` → the client type and the parameter are mixed up: DeepSeek with `openai_responses` only accepts `reasoning.effort`, while DeepSeek with `openai` only accepts `thinking` + `reasoning_effort`
- Image-memory retrieval stays unavailable → confirm `[model_task_config.image_embedding]` points to a model that accepts image input; for addresses other than Bailian, SiliconFlow, or Ark you must write `image_embedding_input` or `image_embedding_body` yourself

---

For details, rely on each provider's official documentation: [DeepSeek thinking mode](https://api-docs.deepseek.com/guides/thinking_mode), [OpenAI reasoning guide](https://platform.openai.com/docs/guides/reasoning), [Google Gemini thinking config](https://cloud.google.com/vertex-ai/generative-ai/docs/thinking), [Alibaba Cloud Bailian](https://help.aliyun.com/zh/model-studio/developer-reference/), [Kimi thinking mode](https://platform.kimi.com/docs/guide/use-kimi-k2-thinking-model), [GLM thinking mode](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode).
