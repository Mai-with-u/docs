---
title: Models and APIs
---

# Models and APIs

## What should I do about API key or balance errors?

For `401`, `402`, or `403` responses, verify that the key is complete and belongs to the selected provider, the account has balance, the key is active, and `base_url` and authentication settings are correct. Never expose the full key in shared logs.

## What if the model is missing from the dropdown?

Enter the provider's model identifier manually. The display name can be customized, but `model_identifier` must exactly match the provider API, including case and version suffixes. If the API returns `model not found`, verify account access in the provider console.

## How do I configure a vision model?

The model must support image input and be marked as visual in the MaiBot model list. A name containing `vision` or `vl` does not by itself prove API compatibility; check provider documentation and an actual request.

## What temperature should I use?

Lower values are generally more stable and higher values more varied, but support differs between models and reasoning modes. Some models ignore temperature or use other sampling parameters. Start with the provider's recommended value and adjust gradually.

## What should I check when embedding requests fail?

1. Confirm that the selected model is an embedding model.
2. Verify its identifier, API key, and `base_url`.
3. Standard OpenAI-compatible services usually expose `/v1/embeddings`.
4. Keep input within the model limit.
5. Ensure returned dimensions match the existing vector store.
6. Check network, proxy, and regional restrictions.

Text embeddings use the `embedding` task, while image embeddings use a separate `image_embedding` task; the two are not interchangeable. Changing to a model with different dimensions may require rebuilding vectors through the memory maintenance tools.

## How do I configure an image embedding model?

Image memory encodes images themselves into vectors, so it needs its own `[model_task_config.image_embedding]`:

1. Add an embedding model that supports "image input to vector" to the model list and give it a provider
2. Put it in the `image_embedding` task's `model_list`
3. After saving, open **Long-term memory → Image memory** in the WebUI and confirm the retrieval state becomes available

Common pitfalls:

- Image and text embeddings are **two separate tasks**; leaving `image_embedding` empty does **not** fall back to `embedding`, and image search simply becomes unavailable
- `image_embedding` accepts a single model and does not rotate through `selection_strategy`
- MaiBot automatically adapts the image-embedding request shape for Bailian, SiliconFlow, and Volcano, but the provider address must use HTTPS
- When the model is unavailable, MaiBot retries at the configured interval and clearly shows "model unavailable" rather than silently switching to another model

## Why is the thinking switch missing, or why can't I turn it off?

The thinking switch on the WebUI model config page is driven by the provider template: when a template declares no thinking metadata, no switch is shown; `reasoning_effort`-style reasoning models always think and only let you adjust the effort tier. Some models have extra restrictions — for example, Kimi k2.7-code only supports enabling thinking, the k3 series does not use a `thinking` parameter, and MiniMax M2.x cannot disable thinking. Follow the on-page note, or write the parameter manually through `extra_params`.

## Why do I get a 401 with a Coding Plan?

Credentials for Zhipu Coding Plan (GLM Coding Plan), Volcano Ark Coding Plan, and StepFun Step Plan are **not interchangeable** with pay-as-you-go API keys, and some plans use an account-specific base URL. Confirm the plan's dedicated address and key in the provider console, then create the provider from the matching template.

::: info Source note
Some embedding compatibility and multimodal-embedding troubleshooting ideas were adapted from the community [Quick FAQ / Community Tutorial](https://www.kdocs.cn/l/ctOGhVv6L8Yq), where the relevant notes are explicitly credited to ARC. This page corrects the endpoint and scope for the current implementation.
:::
