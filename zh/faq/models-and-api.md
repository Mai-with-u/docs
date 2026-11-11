---
title: 模型与 API
---

# 模型与 API

这页解决模型接入问题：鉴权报错、无鉴权服务、内网模型、参数语义、视觉与嵌入模型配置。

## API Key 报 401 / 402 / 403 怎么办？

对着状态码修，不要一起改：

- **401** — Key 不完整、不属于当前服务商、被禁用，或 `auth_type` 与 `base_url` 对不上。
- **402** — 余额不足，去服务商后台充值。
- **403** — 账号没有该模型的调用权限，或 Key 被限定了 IP / 模型范围。

日志里贴 Key 前先脱敏。

## 服务商没有 API Key，能接入吗？

能。把 `api_key` 留空，或者显式设 `auth_type = "none"`，适配本机 Ollama、vLLM、内网网关这类不做鉴权的服务。

::: code-group

```toml [model_config.toml ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "local"
base_url = "http://127.0.0.1:11434/v1"
api_key = ""              # 留空即无鉴权模式
client_type = "openai"
auth_type = "none"        # bearer / header / query / none
timeout = 120
max_retry = 3
```

:::

服务在另一台机器或容器里时，把 `base_url` 换成 MaiBot 所在环境能访问到的地址。WebUI 默认禁止访问内网地址，需要在公共设置里关掉 `enforce_public_outbound_url` 才能保存成功。

## 本机或内网模型服务怎么配？

流程和公网服务商一样，只是 `base_url` 填内网地址：

1. 确认服务已经跑起来，`curl <base_url>/models` 能返回模型列表。
2. 在 WebUI 的模型页新建服务商，填 `base_url`（OpenAI 兼容服务通常带 `/v1`）。
3. `api_key` 留空或填服务端要求的任意值；`auth_type` 按服务端要求选。
4. 在「模型」里点获取列表，选中要用的模型；取不到就手动填 `model_identifier`。
5. 到「任务配置」把 `planner` 和 `replyer` 指到这些模型上。

WebUI 测试连接也要能用同样的地址访问；内网地址被拦时先关 `enforce_public_outbound_url`。

## 下拉列表里找不到想用的模型？

手动填 `model_identifier`。显示名称可以随便起，但 `model_identifier` 必须与服务商接口实际接受的字符串完全一致，包括大小写和版本后缀。

填完还报 `model not found`，去服务商控制台确认账号有没有该模型的权限。

## `max_retry` 到底算几次？

算**总共请求几次**，包含第一次。默认 `3` 意味着失败后再试 2 次；填 `0` 或 `1` 表示不重试。

重试间隔由 `retry_interval` 控制（默认 4 秒），单次请求超时由 `timeout` 控制（默认 120 秒）。上游经常排队或限流时，把 `timeout` 调大比调 `max_retry` 更有效。

## 视觉模型怎么配？

模型本身必须支持图片输入，并在模型配置里打开 `visual`。然后把 `vlm` 任务指向它。

名称里带 `vision`、`vl` 不代表接口兼容，以实际调用结果为准。图片能不能直接发给模型由任务配置决定：`planner` 下配的模型全部是 `visual = true` 时才走多模态输入，否则退化为纯文本加识图结果。

## 温度该设多少？

先看服务商推荐值。温度低更稳定，高更多样，但部分推理模型会忽略 `temperature`，或要求用 `extra_params` 里的 `reasoning_effort` 之类的参数控制。

MaiBot 里温度有三层，越具体越优先：任务配置 `[model_task_config.<task>].temperature` → 模型级 `temperature` → `extra_params` 里的温度。`send_temperature = false` 时这三层都不发送。

## 思考开关不显示或关不掉？

WebUI 的思考开关由服务商模板决定：模板没声明思考元数据就不显示；`reasoning_effort` 类推理模型思考常开，只能调力度档位。

个别模型还有硬限制，例如只支持开启思考、不认 `thinking` 参数、无法关闭思考。以页面提示为准，或者直接用 `extra_params` 手写。

## embedding 请求失败怎么办？

按顺序查：

1. 模型在列表里是 `model_type = "embedding"`，不是 LLM。
2. `model_identifier`、`api_key`、`base_url` 正确。
3. OpenAI 兼容服务的端点是 `/v1/embeddings`。
4. 输入没超过模型长度上限。
5. 返回向量维度与现有记忆库一致。
6. 代理、地区限制没有阻断请求。

文本嵌入用 `embedding` 任务，图片嵌入用 `image_embedding` 任务，不能混用。换模型后维度变了，要按记忆系统的维护功能重建向量。

## 图片嵌入模型怎么配？

图片记忆要把图片本身编码成向量，必须单独配 `image_embedding`：

1. 在模型列表加一个支持「图片输入到向量」的嵌入模型（`model_type = "image_embedding"`），配好所属服务商。
2. 把它填进 `[model_task_config.image_embedding].model_list`。
3. 到 WebUI 的「长期记忆 → 图片记忆」确认检索状态变为可用。

几个坑：

- `image_embedding` 留空**不会**回退到 `embedding`，图片检索直接不可用。
- 只支持单选模型，不按 `selection_strategy` 轮询。
- MaiBot 自动适配百炼、硅基流动、火山的图片嵌入请求形状，但服务商地址必须是 HTTPS；只有本机回环地址（`localhost`、`127.0.0.1`）允许用 HTTP。
- 模型不可用时按 `[a_memorix.image_memory].probe_retry_seconds` 定期重试，不会静默切换模型。

## 用了编程套餐为什么返回 401？

智谱 GLM Coding Plan、火山方舟 Ark Coding Plan、阶跃 Step Plan 这类套餐的凭证与按量付费 API Key 不通用，部分套餐的 Base URL 还按账号区分。

去服务商控制台确认套餐专用地址和套餐 Key，再按对应服务商模板新建提供商。

::: info 内容来源
embedding 与多模态 embedding 的部分排查思路来自社区协作文档[《麦麦教程-常见问题速查/社区教程》](https://www.kdocs.cn/l/ctOGhVv6L8Yq)，原文相关说明署名 ARC。本站已按当前实现修正端点和适用范围。
:::
