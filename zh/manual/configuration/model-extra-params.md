---
title: 模型额外参数
titleTemplate: :title · 模型高级参数
---

# 模型额外参数 (extra_params)

`model_config.toml` 中每个模型都可以设置 `extra_params` 字段，用于在 API 调用时传递服务商特有的参数。最常见的用途是控制大模型的思考模式和推理强度。

`extra_params` 不会以原样整体发送给服务商，实际请求前客户端会按规则拆分转换：

- **`headers`** — 作为请求头传入
- **`query`** — 作为 URL 查询参数传入
- **`body`** — 合并到请求体
- **其他普通键** — 作为请求体额外字段传入（OpenAI SDK 的 `extra_body`）

当 `client_type = "google"` 时，`extra_params` 不按上述规则拆分，而是由 Gemini 客户端按自身支持的字段筛选和映射到 `GenerateContentConfig`。

---

## 思考与非思考模式

很多大模型支持"思考模式"，让模型在回答前先进行深度推理，从而提升复杂问题的回答质量。MaiBot 支持两种 API 体系，配置方式不同：

- **OpenAI 兼容 API**（`client_type = "openai"`）：DeepSeek、OpenAI、阿里云百炼等
- **Gemini 原生 API**（`client_type = "google"`）：Google Gemini 系列

### WebUI 思考开关按服务商模板适配

模型配置页「编辑模型」弹窗默认参数区的思考开关**不写死参数名**：保存模型时，MaiBot 按提供商 `base_url` 命中内置服务商模板，再按模板的思考格式元数据决定往 `extra_params` 里写哪个参数。命中 DeepSeek 走专用开关（含 Responses 客户端与联网搜索），见 [DeepSeek 专用开关](#deepseek-专用开关)；其余服务商分三种写入格式：

- **`thinking_type`** — 智谱、Kimi、MiniMax、豆包：写入 `thinking.type`，开启值各家不同，可关闭的模板在关闭时写入 `disabled`
- **`enable_thinking`** — 阿里云百炼、硅基流动：写入布尔值 `enable_thinking = true` / `false`
- **`reasoning_effort`** — 阶跃星辰、OpenAI、xAI：推理模型思考常开，开关不可关闭，只调力度档位

Base URL 没有命中任何内置模板（自定义端点）时不显示思考开关，需要按本文后面的写法手写 `extra_params`。

思考力度（`reasoning_effort`）和思考预算（`thinking_budget`）是两类独立参数：力度只在配了力度档位的模板出现，预算只在配了预算参数的模板出现；预算留空表示用服务商默认。两者都只作用于 OpenAI 兼容 API，Gemini 用 [`thinking_config`](#gemini-原生-api)。

> 下面示例中的 `model_identifier` 是占位写法，请换成控制台里你要用的实际模型 ID。

#### thinking_type：智谱 / Kimi / MiniMax / 豆包

四家都写 `thinking.type`，但开启值不一样：

- **智谱（GLM）** — 开启值 `enabled`；力度参数 `reasoning_effort`，档位 `max` / `xhigh` / `high` / `medium` / `low` / `minimal` / `none`，默认 `max`。打开开关时若还没写力度，会一并写入默认档位
- **Kimi（月之暗面）** — 开启值 `enabled`，不带力度档位
- **MiniMax（海螺 AI）** — 开启值 `adaptive`，交给模型自行决定；可关闭
- **豆包（Doubao）** — 开启值 `auto`，交给模型自行决定；可关闭；带思考预算 `thinking_budget`

::: code-group

```toml [智谱（开启 + 力度） ~vscode-icons:file-type-toml~]
[[models]]
name = "zhipu-think"
model_identifier = "glm-5"
api_provider = "zhipu"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

```toml [Kimi（开启） ~vscode-icons:file-type-toml~]
[[models]]
name = "kimi-think"
model_identifier = "kimi-k3"
api_provider = "moonshot"
visual = false
extra_params = {thinking = {type = "enabled"}}
```

```toml [MiniMax（开启） ~vscode-icons:file-type-toml~]
[[models]]
name = "minimax-think"
model_identifier = "MiniMax-M3"
api_provider = "minimax"
visual = false
extra_params = {thinking = {type = "adaptive"}, reasoning_split = true}
```

```toml [豆包（开启 + 预算） ~vscode-icons:file-type-toml~]
[[models]]
name = "doubao-think"
model_identifier = "doubao-pro"
api_provider = "doubao"
visual = false
extra_params = {thinking = {type = "auto"}, thinking_budget = 8192}
```

:::

**要点：**

- 关闭思考时 WebUI 写入 `thinking.type = "disabled"`，并**顺手删掉力度参数**（思考关闭后力度没有意义），预算参数保留
- MiniMax 的思维链内容要配合 `reasoning_split = true` 才会返回到 `reasoning_content`
- `thinking_budget` 只能填非负整数，写负数或字符串会被开关判定为配置错误

#### enable_thinking：百炼 / 硅基流动

这两家用布尔值开关，没有 `thinking` 对象：

- **阿里云百炼（Qwen）** — `enable_thinking = true/false`，另支持思考预算 `thinking_budget`；混合思考模型还能在 prompt 末尾追加 `/think`、`/no_think` 临时切换
- **硅基流动（SiliconFlow）** — `enable_thinking = true/false`，另支持思考预算 `thinking_budget`

::: code-group

```toml [百炼（开启 + 预算） ~vscode-icons:file-type-toml~]
[[models]]
name = "qwen-think"
model_identifier = "qwen-plus"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = true, thinking_budget = 8192}
```

```toml [百炼（关闭） ~vscode-icons:file-type-toml~]
[[models]]
name = "qwen-nothink"
model_identifier = "qwen-plus"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = false}
```

```toml [硅基流动（开启） ~vscode-icons:file-type-toml~]
[[models]]
name = "silicon-think"
model_identifier = "Qwen/Qwen3-32B"
api_provider = "siliconflow"
visual = false
extra_params = {enable_thinking = true}
```

:::

**要点：**

- `enable_thinking` 只接受布尔值，写 `"true"` 这类字符串会被开关拒绝并提示「enable_thinking 只能是 true 或 false」
- `/think`、`/no_think` 是一次性的 prompt 后缀，只影响当轮，不会改模型配置

#### reasoning_effort：阶跃 / OpenAI / xAI

这三种模板只有力度档位，**没有开关**：推理模型思考常开，界面上的启用思考开关是置灰的，只能调档。档位值域和默认值各不一样：

- **阶跃星辰（StepFun）** — `low` / `medium` / `high`，默认 `medium`
- **OpenAI** — `minimal` / `low` / `medium` / `high`，默认 `medium`
- **xAI（Grok）** — `low` / `high`，无默认值（取第一个档位）

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

```toml [阶跃星辰 ~vscode-icons:file-type-toml~]
[[models]]
name = "step-reason"
model_identifier = "step-3"
api_provider = "stepfun"
visual = false
extra_params = {reasoning_effort = "high"}
```

:::

**要点：**

- 力度值不在值域内时，WebUI 会提示「reasoning_effort 只能是 …」；手改 `model_config.toml` 也要按对应服务商的值域写，否则服务商会报错
- WebUI 只列出模板里配置的档位。OpenAI 官方另外还支持 `none` 和 `xhigh`（见下文 [OpenAI 兼容 API](#openai-兼容-api)），手写配置时可以写，只是界面上不显示
- 关不掉思考不代表不能省 token：把档位调到最低（OpenAI 用 `minimal`、xAI 用 `low`）才是最省的一档

#### DeepSeek 专用开关

DeepSeek 因为两种客户端格式差异大，不走上面三种通用格式，模型配置页为它单独渲染一组控件：

- **启用思考** — `openai` 客户端写入 `thinking.type`，`openai_responses` 客户端写入 `reasoning.effort`
- **思考力度** — `low` / `high` / `max`，思考关闭时置灰
- **启用联网搜索** — 仅在 `openai_responses` 客户端可操作，写入 DeepSeek 原生 `web_search` 工具，并保留 `tools` 里的其他工具

::: code-group

```toml [Chat Completions ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-think"
model_identifier = "deepseek-chat"
api_provider = "deepseek"
client_type = "openai"
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

```toml [Responses（联网搜索） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-web"
model_identifier = "deepseek-chat"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "high"}, tools = [{type = "web_search"}]}
```

:::

**要点：**

- `openai` 客户端里不要写 `reasoning`，`openai_responses` 客户端里不要写 `thinking` 或 `reasoning_effort`，混用会被校验拒绝并提示「额外参数配置冲突」
- 联网搜索工具只能配一次；`openai` 客户端配 `web_search` 会被直接拒绝，必须换 `openai_responses`
- 完整写法见下面的 [Responses API](#responses-api)

#### 各家限制与易错点

这些限制来自各家服务商自身，踩了就是 400 报错，配置前先对一眼：

- **Kimi k2.7-code** — 仅支持开启思考，写 `thinking.type = "disabled"` 会报错
- **Kimi k3 系列** — 不收 `thinking` 参数，只能用 `reasoning_effort` 调档，不要写 `thinking`
- **MiniMax M2.x** — 思考无法关闭，`disabled` 仅对 M3 生效
- **智谱 GLM-5.3 系列** — 不支持关闭思考，力度值域收窄为 `low` / `high` / `max`（默认 `max`）；GLM Coding Plan 套餐是独立模板，不受这个限制
- **火山方舟编程套餐** — 套餐凭证与按量付费 API Key 不通用；控制台给出的专属 Base URL 可能和模板里的不一样，以控制台为准

对应的 `extra_params` 写法：

::: code-group

```toml [Kimi k2.7-code（只开不关） ~vscode-icons:file-type-toml~]
[[models]]
name = "kimi-k27-code"
model_identifier = "kimi-k2.7-code"
api_provider = "moonshot"
visual = false
extra_params = {thinking = {type = "enabled"}}
```

```toml [Kimi k3（只调档） ~vscode-icons:file-type-toml~]
[[models]]
name = "kimi-k3"
model_identifier = "kimi-k3"
api_provider = "moonshot"
visual = false
extra_params = {reasoning_effort = "high"}
```

```toml [MiniMax M3（可关） ~vscode-icons:file-type-toml~]
[[models]]
name = "minimax-m3"
model_identifier = "MiniMax-M3"
api_provider = "minimax"
visual = false
extra_params = {thinking = {type = "disabled"}, reasoning_split = true}
```

```toml [GLM-5.3（不可关） ~vscode-icons:file-type-toml~]
[[models]]
name = "glm-53"
model_identifier = "glm-5.3"
api_provider = "zhipu"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

:::

::: warning 注意
上面四段是**手写** `extra_params` 的参考。WebUI 开关只按模板判断能不能关闭，模型个体的限制写在开关下方的小字里（例如 Kimi k2.7-code、MiniMax M2.x）；智谱 GLM-5.3 是模板按模型标识单独收紧的限制，开关会直接置灰。在源文件里给不支持的模型写了 `disabled`，保存时会报「当前模型不支持关闭思考」。
:::

#### 新增的服务商套餐模板

MaiBot 1.3.1 新增三个套餐制服务商模板，思考开关与对应按量付费模板一致：

- **智谱编程套餐（GLM Coding Plan）** — `https://open.bigmodel.cn/api/coding/paas/v4`
- **阶跃 Step Plan** — `https://api.stepfun.com/step_plan/v1`
- **火山方舟编程套餐（Ark Coding Plan）** — `https://ark.cn-beijing.volces.com/api/coding/v3`

::: code-group

```toml [智谱编程套餐 ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "zhipu-coding"
base_url = "https://open.bigmodel.cn/api/coding/paas/v4"
api_key = "your-glm-coding-plan-key"
client_type = "openai"
```

```toml [阶跃 Step Plan ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "stepfun-plan"
base_url = "https://api.stepfun.com/step_plan/v1"
api_key = "your-step-plan-key"
client_type = "openai"
```

```toml [火山方舟编程套餐 ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "ark-coding"
base_url = "https://ark.cn-beijing.volces.com/api/coding/v3"
api_key = "your-ark-coding-plan-key"
client_type = "openai"
```

:::

**要点：**

- **套餐凭证与按量付费 Key 不通用**：套餐模板要用套餐订阅给的 Key，把按量付费的 API Key 填进去会认证失败
- **Base URL 可能因账号而异**：火山方舟编程套餐控制台有时会给出账号专属地址，拿到后请改用专属地址，不要照抄模板
- 思考开关的行为与对应的按量付费模板相同：GLM Coding Plan 走 `thinking_type` + `reasoning_effort`，Step Plan 走 `reasoning_effort`，Ark Coding Plan 走 `thinking_type`（开启值 `auto`）+ `thinking_budget`

### OpenAI 兼容 API

`thinking` 对象是多家服务商通用的思考模式开关，**DeepSeek**、**Kimi（月之暗面）**、**GLM（智谱）** 等均采用此格式，配置方式完全一致。`reasoning_effort` 为可选参数，不填则使用默认强度。部分第三方平台（如阿里云百炼/DashScope）则使用 `enable_thinking` 参数格式。上面 WebUI 开关写入的就是这一节的参数，手写配置时按同一套规则来：

::: code-group

```toml [官方（思考） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-think"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "high"}
```

```toml [官方（非思考） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-nothink"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
visual = false
extra_params = {thinking = {type = "disabled"}}
```

```toml [官方（极限） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-max"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
visual = false
extra_params = {thinking = {type = "enabled"}, reasoning_effort = "max"}
```

```toml [第三方（思考） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-think"
model_identifier = "deepseek-v4-flash"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = true}
```

```toml [第三方（非思考） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-nothink"
model_identifier = "deepseek-v4-flash"
api_provider = "dashscope"
visual = false
extra_params = {enable_thinking = false}
```

:::

**要点：**

- DeepSeek V4 的 `reasoning_effort` 仅支持 `high`（默认）和 `max`（极限推理）两个有效等级。`low`/`medium` 映射为 `high`，`xhigh` 映射为 `max`
- 对比 OpenAI：OpenAI 的 `reasoning_effort` 支持 6 个独立等级（`none`/`minimal`/`low`/`medium`（默认）/`high`/`xhigh`），各自独立生效，与 DeepSeek V4 只有 2 个有效等级不同。注意 `o1-mini` 不支持此参数
- **多轮对话规则**：如果思考轮次没有工具调用，不需要把思考内容回传；如果有工具调用，必须回传
- **限制**：思考模式下 `temperature` 和 `top_p` 会被静默忽略，`tool_choice` 会导致 400 错误
- 第三方平台（如阿里云百炼/DashScope）使用 `enable_thinking`（布尔值）控制思考模式，与原生 `thinking` 对象写法不同。配置前请确认你使用的平台支持哪种参数格式

### Responses API

部分服务商（如 DeepSeek v4 flash 联网搜索）使用 OpenAI 的 **Responses 协议**，需要在服务商配置中设置 `client_type = "openai_responses"`。Responses API 的参数格式与 Chat Completions 略有不同：

- **思考模式**：使用 `reasoning = {effort = "..."}` 而不是 `thinking`/`reasoning_effort`，`effort` 可选 `none` / `low` / `high` / `max`
- **联网搜索**：把 `web_search` 原生工具写入 `tools` 列表即可启用

::: code-group

```toml [Responses（思考） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-responses-think"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "high"}}
```

```toml [Responses（非思考） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-responses-nothink"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "none"}}
```

```toml [Responses（联网搜索） ~vscode-icons:file-type-toml~]
[[models]]
name = "deepseek-v4-flash-responses-web"
model_identifier = "deepseek-v4-flash"
api_provider = "deepseek"
client_type = "openai_responses"
extra_params = {reasoning = {effort = "high"}, tools = [{type = "web_search"}]}
```

:::

**要点：**

- Responses 客户端中不要再写 `thinking` 或 `reasoning_effort`，请统一使用 `reasoning.effort`，否则会被校验拒绝
- `reasoning.effort` 比 Chat Completions 多一个 `none`（完全关闭思考）
- `web_search` 工具通过 `extra_params.body.tools` 传入（`body` 分组的字段与其他普通键会合并进请求体，见 [自定义 HTTP 请求](#自定义-http-请求)）
- DeepSeek 的 Chat Completions 端点不支持原生联网搜索，使用联网搜索必须选择 `openai_responses` 客户端
- Maisaka 监控页与日志会展示联网搜索摘要（本轮查询、动作、状态和来源数量）

### Gemini 原生 API

当 `client_type = "google"` 时，`extra_params` 不按 OpenAI 的 `headers/query/body` 规则处理，而是由 Gemini 客户端按自身支持的字段筛选和映射到 `GenerateContentConfig`。

#### Gemini 2.5（thinking_budget）

Gemini 2.5 系列通过 `thinking_budget`（整数）控制思考预算：

::: code-group

```toml [开启思考 ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-2.5-flash-think"
model_identifier = "gemini-2.5-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_budget = 4096, include_thoughts = true}}
```

```toml [关闭思考 ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-2.5-flash-nothink"
model_identifier = "gemini-2.5-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_budget = 0}}
```

```toml [自动预算 ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-2.5-pro-think"
model_identifier = "gemini-2.5-pro"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_budget = -1, include_thoughts = true}}
```

:::

**要点：**

- `thinking_budget`：`-1` = 自动分配，`0` = 关闭思考，`N` = 指定 token 预算
- `include_thoughts`：是否在响应中包含思考过程
- 已知问题：Flash Preview 04-17 版本设置 `thinking_budget = 0` 可能失败

#### Gemini 3.0+（thinking_level）

Gemini 3.0 及更新版本通过 `thinking_level`（枚举值）控制思考强度：

::: code-group

```toml [高强度思考 ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-3-flash-high"
model_identifier = "gemini-3-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_level = "high", include_thoughts = true}}
```

```toml [低强度思考 ~vscode-icons:file-type-toml~]
[[models]]
name = "gemini-3-flash-low"
model_identifier = "gemini-3-flash"
api_provider = "google-gemini"
visual = true
client_type = "google"
extra_params = {thinking_config = {thinking_level = "low", include_thoughts = true}}
```

:::

**要点：**

- `thinking_level` 可选：`minimal`、`low`、`medium`、`high`
- 不要同时使用 `thinking_budget` 和 `thinking_level`，会导致 400 错误
- 多轮对话中需要使用 thought signatures 保持上下文

#### Gemini 总览

- **Gemini 2.5** — 通过 `thinking_budget` 控制思考预算，值域：`-1`（自动）/ `0`（关闭）/ `N`（预算），关闭方式为 `budget = 0`。budget 和 level 不可混用
- **Gemini 3.0+** — 通过 `thinking_level` 控制思考等级，值域：`minimal` / `low` / `medium` / `high`，关闭方式为不设置或 `minimal`。不支持 token 级预算控制

Gemini 2.5 使用 token 数量间接控制强度，`-1` 为自动分配。Gemini 3.0+ 使用枚举值直接指定等级。

> Google API 在国内无法直接访问，需要代理。

## 自定义 HTTP 请求

`extra_params` 支持三个特殊 key 来精确控制 API 请求：

- **`headers`** — 添加 HTTP 请求头，如 `{headers = {"X-Custom" = "value"}}`
- **`query`** — 添加 URL 查询参数，如 `{query = {"key" = "value"}}`
- **`body`** — 其中的字段与其他普通键一起进入请求体，仅用于在配置中按用途分组

::: warning 注意
`body` 并不创建独立的请求通道。`body` 内的字段和 `headers`/`query` 之外的**所有普通键**会合并后一起发送到请求体中。
:::

例如：

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

客户端拆分后的实际效果：

**`headers`** — HTTP 请求头：`X-API-Version: 2024-06`，`X-Priority: high`

**`query`** — URL 查询参数：`?version=2024-01-01`

**`body` 内字段 + 其他普通键** — 请求体 JSON：`{"metadata": {"source": "maibot"}, "enable_thinking": false}`

所以 `extra_params = {enable_thinking = "false"}` 等价于 `extra_params = {body = {enable_thinking = "false"}}`，都会把 `enable_thinking` 作为请求体 JSON 字段发给服务商，而不是发送嵌套的 `{"extra_params": {"enable_thinking": "false"}}`。

## 图片嵌入模型

图片记忆检索用的 `image_embedding` 任务需要"吃图片、吐向量"的模型。这类模型的请求形状各服务商都不一样，`client_type = "openai"` 时靠 `extra_params` 的两个模板字段适配：

- **`image_embedding_input`** — 图片输入模板，默认 `"{data_uri}"`。可用占位符 `{base64}`、`{data_uri}`、`{mime_type}`，会在请求时替换
- **`image_embedding_body`** — 请求体模板（对象）。其中 `input` 键会覆盖上面的输入模板，其余键并入请求体

命中官方地址时 MaiBot 会自动切换协议，不用手写模板：

- **阿里云百炼、火山方舟（豆包）** — 自动切到各自的原生多模态嵌入端点（百炼 `/api/v1/services/embeddings/multimodal-embedding/multimodal-embedding`，方舟 `<Base URL>/embeddings/multimodal`），请求体按原生协议构造
- **硅基流动** — 仍走 `/embeddings`，自动填入 `{"image": "{data_uri}"}` 图片输入模板
- **其他地址** — 不会自动猜测，必须自己写 `image_embedding_input` 或 `image_embedding_body`，否则调用时报错

::: code-group

```toml [通用 OpenAI 兼容端点 ~vscode-icons:file-type-toml~]
[[models]]
name = "vl-embed"
model_identifier = "vl-embed-v1"
api_provider = "custom-openai"
visual = false
extra_params = {image_embedding_input = "{data_uri}"}
```

```toml [百炼（自动走原生协议） ~vscode-icons:file-type-toml~]
[[models]]
name = "qwen-vl-embed"
model_identifier = "multimodal-embedding-v1"
api_provider = "dashscope"
visual = false
extra_params = {dimensions = 1024}
```

:::

**要点：**

- 走百炼/方舟原生协议时，`model`、`input`（方舟再加 `encoding_format`）是保留字段，不允许通过 `extra_params` 覆盖，写了会报错
- 百炼原生协议下，向量维度既可以写顶层 `dimensions`，也可以写 `parameters.dimension`，两处都写且值不同会报错
- 1.3.1 起 `image_embedding` 任务没配模型时会立刻报错，提示你在 `image_embedding` 里指定支持图片嵌入的模型，不会再一路拖到请求阶段才失败
- `embedding` 和 `image_embedding` 两个嵌入任务会忽略 `selection_strategy`，始终按 `model_list` 配置顺序取第一个可用模型——向量空间必须保持一致，多个嵌入模型混用会污染向量库

## 高级鉴权配置

- **`auth_header_name`** — Header 鉴权名称。默认 `Authorization`
- **`auth_header_prefix`** — Header 鉴权前缀。默认 `Bearer`
- **`auth_query_name`** — Query 鉴权参数名。默认 `api_key`

## 其他高级参数

### 模型级参数覆盖

- **`temperature`** — 模型级温度，覆盖任务配置。可选，如 `0.7`
- **`max_tokens`** — 模型级最大 token，覆盖任务配置。可选，如 `4096`
- **`force_stream_mode`** — 强制流式输出，不支持非流式时设为 `true`。默认关闭
- **`extra_params`** — 额外参数字典。默认为空

### 优先级说明

`temperature` 和 `max_tokens` 可以写在 `extra_params` 中作为模型级默认值，但更推荐使用模型配置里的同名独立字段：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
temperature = 0.7
max_tokens = 4096
```

:::

这样配置意图更清楚，也能避免和服务商请求体中的同名字段混淆。

当多处存在同名参数时，生效优先级为：

1. 调用方本次请求显式传入的值
2. 当前模型配置里的独立字段（如 `temperature`、`max_tokens`）
3. 当前模型 `extra_params` 中的同名字段
4. 当前任务配置中的默认值

### API 提供商高级配置

- **`default_headers`** — 默认 HTTP 头。默认为空
- **`default_query`** — 默认查询参数。默认为空
- **`organization`** — OpenAI 组织（可选）。默认无
- **`project`** — OpenAI 项目（可选）。默认无
- **`model_list_endpoint`** — 模型列表端点。默认 `/models`
- **`reasoning_parse_mode`** — 推理内容解析模式。默认 `auto`
- **`tool_argument_parse_mode`** — 工具参数解析模式。默认 `auto`

### 运行时配置

- **`timeout`** — 超时时间。推荐 60 秒
- **`max_retry`** — 失败重试次数。推荐 3 次
- **`retry_interval`** — 重试间隔。推荐 5 秒

## 常用参数速查

### OpenAI 兼容 API

- **`thinking`** — 思考模式控制，含 `type`。智谱/Kimi 写 `enabled`、MiniMax 写 `adaptive`、豆包写 `auto`，关闭写 `disabled`
- **`enable_thinking`** — 布尔思考开关。适用阿里云百炼、硅基流动
- **`reasoning_effort`** — 推理强度等级。DeepSeek 仅 low/high/max，OpenAI 六档，xAI 仅 low/high，阶跃 low/medium/high，智谱七档（默认 max）
- **`reasoning`** — Responses API 思考控制，含 `effort`（none/low/high/max）。适用 DeepSeek（Responses 客户端）
- **`reasoning_split`** — MiniMax 思维链拆分开关，`true` 时思考内容进 `reasoning_content`
- **`thinking_budget`** — 思考预算（token）。适用豆包、Qwen/百炼、硅基流动
- **`tools`** — 原生工具列表，如 `{type = "web_search"}` 开启联网搜索。适用 DeepSeek Responses 客户端
- **`image_embedding_input` / `image_embedding_body`** — 图片嵌入请求模板。适用 `image_embedding` 任务
- **`headers`** — 自定义 HTTP 请求头。适用全部
- **`query`** — 自定义 URL 查询参数。适用全部
- **`body`** — 自定义请求体字段。适用全部

### Gemini 原生 API

- **`thinking_config`** — 思考配置，含 `thinking_budget` 或 `thinking_level`。适用 Gemini 全系
- **`thinking_budget`** — 思考预算（-1 自动 / 0 关闭 / N 指定）。适用 Gemini 2.5
- **`thinking_level`** — 思考等级（minimal/low/medium/high）。适用 Gemini 3.0+
- **`include_thoughts`** — 响应是否包含思考过程。适用 Gemini 全系

> 参数会原样传递给 LLM API，务必与你使用的服务商文档一致，否则可能导致调用失败。

## 验证与排错

配完之后用模型配置页模型列表里的「测试模型」按钮跑一次能力测试：思考模型通过时会返回文本，测试详情里能看到「推理内容」；没看到推理内容先检查 `extra_params` 里的思考参数。

- 保存模型时提示「当前模型不支持关闭思考」→ 这是模板按模型标识收紧了关闭能力（典型是智谱 GLM-5.3）；Kimi k2.7-code、MiniMax M2.x 属于个别型号的限制，界面上不会置灰，手写配置时注意别写 `disabled`
- 保存模型时提示「reasoning_effort 只能是 …」→ 档位不在该服务商的值域内，按上文各家值域改；xAI 只有 `low`/`high`
- 保存模型时提示「enable_thinking 只能是 true 或 false」→ 写成了字符串，改回布尔值
- 调用返回 400 且报文提到 `thinking` 或 `reasoning_effort` → 客户端类型和参数写混了：DeepSeek 用 `openai_responses` 时只能写 `reasoning.effort`，用 `openai` 时只能写 `thinking` + `reasoning_effort`
- 图片记忆检索一直不可用 → 确认 `[model_task_config.image_embedding]` 配了支持图片输入的模型；非百炼/硅基流动/方舟地址必须手写 `image_embedding_input` 或 `image_embedding_body`

---

更多细节以服务商官方文档为准：[DeepSeek 思考模式](https://api-docs.deepseek.com/guides/thinking_mode)、[OpenAI 推理指南](https://platform.openai.com/docs/guides/reasoning)、[Google Gemini 思考配置](https://cloud.google.com/vertex-ai/generative-ai/docs/thinking)、[阿里云百炼](https://help.aliyun.com/zh/model-studio/developer-reference/)、[Kimi 思考模式](https://platform.kimi.com/docs/guide/use-kimi-k2-thinking-model)、[GLM 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode)。
