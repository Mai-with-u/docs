---
title: 模型配置
titleTemplate: :title · 模型配置
---

# 模型配置

`model_config.toml` 给麦麦配置"AI 大脑"——决定不同组件使用什么 LLM 模型，以及如何连接 API 服务商。

最少启动只需一个 LLM 模型和一个 API 提供商（`models` 和 `api_providers` 均非空）。完整功能还需 VLM 模型（看图）和嵌入模型（记忆搜索）。

## API 提供商

每个 `[[api_providers]]` 块定义一个 API 服务商。一个配置文件可以有多个提供商。

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "deepseek"                          # [必填] API 服务商名称，在 models 的 api_provider 中需使用这个命名
base_url = "https://api.deepseek.com/v1"   # [必填] API 服务商的 BaseURL
api_key = "your-api-key"                   # [必填] API 密钥。若 auth_type 为 none 则不需要
client_type = "openai"                     # [可选] 客户端类型：openai(默认) / openai_responses / google
auth_type = "bearer"                       # [可选] 鉴权方式：bearer(默认) / header / query / none
auth_header_name = "Authorization"         # [可选] 当 auth_type 为 header 时使用的请求头名称
auth_header_prefix = "Bearer"              # [可选] 当 auth_type 为 header 时的请求头前缀，留空表示直接发送原始密钥
auth_query_name = "api_key"                # [可选] 当 auth_type 为 query 时使用的查询参数名称
default_headers = {}                       # [可选] 所有请求默认附带的 HTTP Header
default_query = {}                         # [可选] 所有请求默认附带的查询参数
# organization = "org-xxxx"                # [可选] OpenAI 官方接口可选的 organization
# project = "proj-xxxx"                    # [可选] OpenAI 官方接口可选的 project
model_list_endpoint = "/models"            # [可选] 模型列表端点路径
reasoning_parse_mode = "auto"              # [可选] 推理内容解析模式：auto(默认) / native / think_tag / none
tool_argument_parse_mode = "auto"          # [可选] 工具参数解析模式：auto(默认) / strict / repair / double_decode
max_retry = 3                              # [可选] 最大重试次数
timeout = 60                               # [可选] API 调用超时，单位秒
retry_interval = 5                         # [可选] 重试间隔，单位秒
```

:::

**要点：**

- **必填**：`name`（服务商名称）、`base_url`（端点地址）、`api_key`（密钥，`auth_type = "none"` 时除外）
- **鉴权**：默认 `bearer` 适用于绝大部分服务商。其他可选 `header` / `query` / `none`
- **客户端**：默认 `openai`。Google Gemini 用 `"google"`，见 [模型额外参数](./model-extra-params.md#gemini-原生-api)
- **Responses API**：支持 OpenAI Responses 协议的服务商（如 DeepSeek v4 flash 的联网搜索）用 `"openai_responses"`（1.2.0 起正式支持），见 [模型额外参数](./model-extra-params.md#responses-api)
- **超时与重试**：`timeout` 默认 60s，`max_retry` 默认 3 次，`retry_interval` 默认 5s
- 其余字段参见上方注释，均有合理默认值


## 模型

每个 `[[models]]` 块定义一个具体的 LLM 模型，关联到某个 API 提供商。

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[models]]
model_identifier = "deepseek-v4-flash"       # [必填] API 服务商提供的模型标识符
name = "deepseek-v4-flash"                   # [必填] 模型名称，在 model_task_config 中需使用这个命名
api_provider = "deepseek"                    # [必填] 对应 api_providers 中配置的服务商名称
price_in = 1.0                               # [可选] 输入价格，单位：元/M token
cache = false                                # [可选] 是否启用缓存计费
cache_price_in = 0.0                         # [可选] 缓存命中输入价格，仅 cache=true 时使用
price_out = 2.0                              # [可选] 输出价格，单位：元/M token
# temperature = 0.7                          # [可选] 模型级别温度，会覆盖任务配置中的 temperature
# max_tokens = 4096                          # [可选] 模型级别最大 token 数，会覆盖任务配置中的 max_tokens
force_stream_mode = false                    # [可选] 强制流式输出模式，模型不支持非流式输出时设为 true
visual = false                               # [可选] 是否为多模态模型（支持视觉输入）
extra_params = {}                            # [可选] 额外参数，详见 模型额外参数
```

:::

**要点：**

- **必填**：`model_identifier`（API 标识符）、`name`（自定义名称）、`api_provider`（归属服务商）
- **价格**：`price_in` / `price_out` 用于统计，单位 元/百万 token。开启 `cache` 后可单独设置 `cache_price_in`
- **模型级覆盖**：`temperature` / `max_tokens` 可覆盖任务配置，不设则使用任务默认值
- **视觉**：`visual = true` 表示支持图像输入，用于 `vlm` 任务
- **`extra_params`**：服务商特有参数（思考模式、推理强度等），详见 [模型额外参数](./model-extra-params.md)


## 任务配置

根据任务特点给每个任务分配不同模型，实现最优表现和效率。

麦麦将模型调用分为三类角色：**Planner** 是战略核心，决定何时说话、调用哪些工具（需较强推理能力来调度 MCP 和工具链）；**Replyer** 负责将 Planner 收集的信息转化为最终回复文本，追求语言质量；其余辅助任务用低价 flash 模型追求速度。一次典型的「收到消息 → 发出回复」触发 3~6 次 LLM 调用。

::: code-group

```toml [replyer（智能模型） ~vscode-icons:file-type-toml~]
# [必填] 回复器：将 Planner 收集的信息转为最终回复文本。追求语言质量和表达风格，推荐 pro 模型 + 思考模式。
[model_task_config.replyer]
model_list = ["deepseek-v4-pro-think"]        # [必填] 模型名称列表
max_tokens = 4096                             # [可选] 最大输出 token 数
temperature = 1.0                             # [可选] 模型温度，0.3 保守 / 0.7 有创意 / 1.0 随机
slow_threshold = 120.0                        # [可选] 慢请求阈值（秒）
selection_strategy = "random"                 # [可选] 模型选择策略：balance / random / sequential
hard_timeout = 240.0                          # [可选] 硬超时（秒）
```

```toml [planner（快模型） ~vscode-icons:file-type-toml~]
# [必填] 规划器：战略核心——决定何时说话、回复谁、调用哪些工具（MCP/插件）。需较强推理和 tool 调用能力。
[model_task_config.planner]
model_list = ["deepseek-v4-flash"]            # [必填] 模型名称列表
max_tokens = 8000                             # [可选] 最大输出 token 数
temperature = 0.7                             # [可选] 模型温度
slow_threshold = 12.0                         # [可选] 慢请求阈值（秒）
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 180.0                          # [可选] 硬超时（秒）
```

```toml [utils（快模型） ~vscode-icons:file-type-toml~]
# [必填] 组件模型：表情包分析、学习分析、取名、关系模块、情绪变化等。麦麦必须的模型。
[model_task_config.utils]
model_list = ["deepseek-v4-flash"]            # [必填] 模型名称列表
max_tokens = 4096                             # [可选] 最大输出 token 数
temperature = 0.5                             # [可选] 模型温度
slow_threshold = 15.0                         # [可选] 慢请求阈值（秒）
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [memory（长期记忆） ~vscode-icons:file-type-toml~]
# [可选] 长期记忆：记忆总结、抽取、写回等高质量任务（A_Memorix 子系统）。
# 默认 model_list 为空（不自动回退），未配置时调用方按需处理。
[model_task_config.memory]
model_list = []                               # [可选] 模型名称列表
max_tokens = 8192                             # [可选] 最大输出 token 数
temperature = 0.5                             # [可选] 模型温度
slow_threshold = 30.0                         # [可选] 慢请求阈值（秒）
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 240.0                          # [可选] 硬超时（秒）
```

```toml [mid_memory（中期摘要） ~vscode-icons:file-type-toml~]
# [可选] 中期摘要：上下文裁切时将历史聊天压缩为摘要。留空时自动回退到 planner。
[model_task_config.mid_memory]
model_list = []                               # [可选] 模型名称列表（→回退 planner）
max_tokens = 8000                             # [可选] 最大输出 token 数
temperature = 0.7                             # [可选] 模型温度
slow_threshold = 12.0                         # [可选] 慢请求阈值（秒）
selection_strategy = "random"                 # [可选] 模型选择策略
hard_timeout = 180.0                          # [可选] 硬超时（秒）
```

```toml [learner（学习） ~vscode-icons:file-type-toml~]
# [可选] 学习模型：表达方式学习和黑话学习。留空时自动回退到 utils。
[model_task_config.learner]
model_list = []                               # [可选] 模型名称列表（→回退 utils）
max_tokens = 4096                             # [可选] 最大输出 token 数
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [expression_use（表达选择） ~vscode-icons:file-type-toml~]
# [可选] 表达方式选择模型。留空时自动回退到 utils。
[model_task_config.expression_use]
model_list = []                               # [可选] 模型名称列表（→回退 utils）
max_tokens = 1024                             # [可选] 最大输出 token 数
temperature = 0.3                             # [可选] 模型温度
slow_threshold = 15.0                         # [可选] 慢请求阈值（秒）
selection_strategy = "balance"                # [可选] 模型选择策略
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [emoji（表情包选择） ~vscode-icons:file-type-toml~]
# [可选] 表情包选择：从候选表情包中选出合适的一张发送。
# 选择优先级：emoji 有模型→用 emoji，planner 全视觉→用 planner，否则→用 vlm
[model_task_config.emoji]
model_list = []                               # [可选] 模型名称列表
max_tokens = 4096                             # [可选] 最大输出 token 数
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [vlm（看图） ~vscode-icons:file-type-toml~]
# [强烈建议] 看图说话：理解图片内容。需 visual=true 的多模态模型。
[model_task_config.vlm]
model_list = ["qwen-vl"]                      # [必填] 模型名称列表，需 visual=true 的多模态模型
max_tokens = 4096                             # [可选] 最大输出 token 数
hard_timeout = 240.0                          # [可选] 硬超时（秒）
```

```toml [voice（语音识别） ~vscode-icons:file-type-toml~]
# [可选] 语音识别：语音转文字。
[model_task_config.voice]
model_list = []                               # [可选] 模型名称列表
max_tokens = 4096                             # [可选] 最大输出 token 数
hard_timeout = 120.0                          # [可选] 硬超时（秒）
```

```toml [embedding（嵌入模型） ~vscode-icons:file-type-toml~]
# [强烈建议] 嵌入模型：生成文本向量，用于长期记忆的语义搜索。
# 推荐专门的嵌入模型（如 text-embedding-3-small）。未配置时记忆搜索不可用。
[model_task_config.embedding]
model_list = ["text-embedding-3-small"]       # [必填] 模型名称列表，推荐专门的嵌入模型
max_tokens = 4096                             # [可选] 最大输出 token 数
hard_timeout = 60.0                           # [可选] 硬超时（秒）
```

:::

**要点：**

- **三个必配**：`replyer`、`planner`、`utils` 配好即可运行，其余留空自动回退
- **Planner 是战略核心**：决定何时说话、调用哪些工具（MCP/插件），需要一定的推理能力，建议用能力均衡的模型
- **Replyer 追求语言质量**：将 Planner 收集的信息转为最终回复，推荐 pro 模型 + 思考模式
- **视觉**：`vlm` 需 `visual = true` 的多模态模型，推荐 `qwen-vl`
- **嵌入**：`embedding` 推荐专门嵌入模型（如 `text-embedding-3-small`），未配置则记忆搜索不可用
- 模型配置中的 `temperature` / `max_tokens` 会覆盖此处设置

### 回退规则

部分任务的 `model_list` 为空时，自动复用其他任务：

```
         ┌──────────┐
         │  planner │◄──── mid_memory（留空时回退）
         └──────────┘
              ▲
              │
         ┌──────────┐
         │  utils   │◄──── learner（留空时回退）
         │          │◄──── expression_use（留空时回退）
         └──────────┘

memory · emoji · vlm · voice · embedding → 留空不自动回退，调用方会跳过或报错

emoji 特殊逻辑：emoji 有模型→用 emoji，planner 全视觉→用 planner，否则→用 vlm
```

## 下一步

- 模型高级参数（思考模式、推理强度）：[模型额外参数](./model-extra-params.md)
- 配置机器人：看 [Bot 配置](./bot-config.md)
- 连接 QQ：[NapCat 适配器](../adapters/napcat.md)
- 管理 WebUI：[WebUI 配置管理](../webui/config-management.md)
