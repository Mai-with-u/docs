---
title: Models and APIs
---

# Models and APIs

This page covers model access: authentication errors, providers without keys, intranet services, parameter semantics, and vision or embedding model setup.

## API key returns 401 / 402 / 403

Fix by status code, one at a time:

- **401** — Key truncated, wrong provider, disabled, or `auth_type` does not match `base_url`.
- **402** — Out of balance; top up in the provider console.
- **403** — The account lacks access to that model, or the key is restricted by IP or model scope.

Redact keys before pasting logs anywhere.

## Can I connect a provider that has no API key?

Yes. Leave `api_key` empty, or set `auth_type = "none"` explicitly. This fits Ollama, vLLM, and LAN gateways that skip authentication.

::: code-group

```toml [model_config.toml ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "local"
base_url = "http://127.0.0.1:11434/v1"
api_key = ""              # Empty means unauthenticated mode
client_type = "openai"
auth_type = "none"        # bearer / header / query / none
timeout = 120
max_retry = 3
```

:::

When the service runs on another machine or container, point `base_url` at an address reachable from MaiBot's own environment. WebUI blocks LAN addresses by default; turn off `enforce_public_outbound_url` under common settings to save it.

## How do I configure a local or LAN model service?

Same flow as a public provider, with `base_url` pointing inside your network:

1. Confirm the service is up: `curl <base_url>/models` returns a model list.
2. Create a provider on the WebUI model page and set `base_url` (OpenAI-compatible services usually need `/v1`).
3. Leave `api_key` empty or use whatever value the server expects; pick `auth_type` to match.
4. On the Models tab, fetch the list and select models. If fetching fails, type `model_identifier` manually.
5. Under Task configuration, point `planner` and `replyer` at those models.

The WebUI connection test must reach the same address; if a LAN address is blocked, disable `enforce_public_outbound_url` first.

## My model is missing from the dropdown

Fill in `model_identifier` manually. The display name is free-form, but `model_identifier` must match exactly what the provider accepts, including case and version suffix.

If it still returns `model not found`, confirm the account has access to that model in the provider console.

## How many attempts does `max_retry` mean?

It counts **total requests, including the first**. The default `3` means two retries after a failure; `0` or `1` disables retries.

Retry spacing is `retry_interval` (default 4s) and per-request timeout is `timeout` (default 120s). When the upstream queues or rate-limits frequently, raising `timeout` helps more than raising `max_retry`.

## How do I configure a vision model?

The model must accept image input and have `visual` enabled in its model entry. Then point the `vlm` task at it.

A name containing `vision` or `vl` proves nothing — check actual call results. Whether images go to the model directly depends on task configuration: only when every model configured for a task such as `planner` has `visual = true` does multi-modal input run; otherwise MaiBot falls back to plain text plus image descriptions.

## What temperature should I use?

Start from the provider's recommendation. Lower is steadier, higher is more varied, but some reasoning models ignore `temperature` or expect a control such as `reasoning_effort` inside `extra_params`.

Temperature has three layers, most specific first: task-level `[model_task_config.<task>].temperature` → model-level `temperature` → a temperature inside `extra_params`. With `send_temperature = false`, none of them are sent.

## The thinking toggle is missing or cannot be turned off

The WebUI thinking toggle comes from the provider template: no thinking metadata means no toggle. `reasoning_effort` models keep thinking on and only expose an effort level.

Some models are hard-limited — thinking-only, no `thinking` parameter, or plain unsupported. Follow the on-page hint, or write `extra_params` by hand.

## Embedding requests fail

Check in order:

1. The model entry has `model_type = "embedding"`, not an LLM type.
2. `model_identifier`, `api_key`, and `base_url` are correct.
3. OpenAI-compatible services use the `/v1/embeddings` endpoint.
4. Input stays within the model's length limit.
5. Returned vector dimensions match the existing memory store.
6. Proxies and regional restrictions are not blocking the request.

Text embedding uses the `embedding` task and image embedding uses `image_embedding`; they cannot be swapped. After changing models with a different dimension, rebuild vectors with the memory maintenance tools.

## How do I configure an image embedding model?

Image memory encodes the image itself, so `image_embedding` needs its own task:

1. Add an embedding model that supports image-to-vector (`model_type = "image_embedding"`) with its provider.
2. Put it under `[model_task_config.image_embedding].model_list`.
3. Open "Long-term memory → Image memory" in WebUI and confirm retrieval is available.

Gotchas:

- An empty `image_embedding` does **not** fall back to `embedding`; image retrieval simply stops.
- Only a single model is supported; `selection_strategy` does not apply.
- MaiBot adapts the request shape for DashScope, SiliconFlow, and Volcengine, but the provider address must use HTTPS. Plain HTTP is allowed only for loopback addresses such as `localhost` / `127.0.0.1`.
- An unavailable model is retried on the `[a_memorix.image_memory].probe_retry_seconds` interval and never silently replaced.

## Why does a coding plan return 401?

Coding-plan credentials (Zhipu GLM Coding Plan, Volcengine Ark Coding Plan, StepFun Step Plan) are not interchangeable with pay-as-you-go API keys, and some plans use per-account base URLs.

Confirm the plan-specific endpoint and key in the provider console, then create a provider from the matching template.

::: info Source note
The embedding and multi-modal embedding troubleshooting ideas were adapted from the community [Quick FAQ](https://www.kdocs.cn/l/ctOGhVv6L8Yq), credited to ARC in the original. Endpoints and scope here follow the current implementation.
:::
