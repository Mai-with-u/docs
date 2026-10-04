---
title: LLMProvider Component
---

# LLMProvider Component

`@LLMProvider` is used to declare that a plugin provides a new LLM Provider `client_type`. The main program will register this `client_type` into the LLM client registry, so existing `LLMService` and model task configurations do not need to change their invocation method—as long as the `api_providers[].client_type` in the model configuration points to the value declared in the plugin, the request will be initiated via the plugin Provider.

::: warning Both Declarations Must Match
An LLM Provider must satisfy both of the following declarations; neither can be omitted:

1. Statically declared in the `client_type` within the top-level `llm_providers` `_manifest.json`
2. Use the `@LLMProvider("同一个 client_type")` decorator to modify the handling method in the plugin code

The Runner will verify that the manifest and the results collected by the decorator are completely consistent. If either side is missing, there is a spelling inconsistency, or there are duplicate declarations within the same plugin, the plugin will be refused to load. When different plugins declare the same `client_type`, both conflicting parties will be prevented from loading.
:::

## Decorator Signature

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import LLMProvider

@LLMProvider(
    client_type: str,          # 客户端类型标识（必填）
    *,
    name: str = "",            # Provider 展示名称
    description: str = "",     # Provider 描述
    version: str = "1.0.0",    # Provider 实现版本
    **metadata,                # 额外元数据
)
```

:::

### Parameter Description

- **`client_type`** `str` · Required — Client type identifier, corresponding to `api_providers[].client_type` in the model configuration. Cannot be empty.
- **`name`** `str` · Default `""` — Provider display name. If left blank, `client_type` is used.
- **`description`** `str` · Default `""` — Provider description information.
- **`version`** `str` · Default `"1.0.0"` — Provider implementation version number.
- **`**metadata`** `Any` — Additional metadata key-value pairs.

## Manifest Declaration

The `_manifest.json` top-level must contain the `llm_providers` array, which corresponds one-to-one with the `@LLMProvider` in the code:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "llm_providers": [
    {
      "client_type": "example.provider",
      "name": "Example Provider",
      "description": "示例 LLM Provider",
      "version": "1.0.0"
    }
  ]
}
```

:::

### llm_providers Field Description

- **`client_type`** `str` · Required — Provider client type, must be consistent with the model configuration `api_providers[].client_type`.
- **`name`** `str` · Default `""` — Provider display name.
- **`description`** `str` · Default `""` — Provider description.
- **`version`** `str` · Default `"1.0.0"` — Provider implementation version.

::: danger
Do not write `handler_name` or `metadata` in the `llm_providers` of the manifest—the handling functions are automatically collected by the `@LLMProvider` decorator and do not need to be specified manually.
:::

## Operation Types

Handling methods distinguish request types via the `operation` parameter. The three operations correspond to different LLM capabilities:

- **`response`** — LLM text/tool response. Main request fields: `message_list`, `tool_options`, `max_tokens`, `temperature`, `response_format`, `extra_params`, `model_info`, `api_provider`. Return fields: `content` / `response`, `reasoning_content`, `tool_calls`, `usage`.
- **`embedding`** — Text vectorization. Main request fields: `embedding_input`, `extra_params`, `model_info`, `api_provider`. Return fields: `embedding`.
- **`audio_transcription`** — Speech recognition. Main request fields: `audio_base64`, `max_tokens`, `extra_params`, `model_info`, `api_provider`. Return fields: `content`.

Requests for all three operations will include the following common fields:

- **`model_info`** `dict` — Model information for the current request.
- **`api_provider`** `dict` — API Provider configuration for the current request.
- **`extra_params`** `dict` — Additional parameters.

## Request and Return Fields

### Handling Method Parameters

- **`operation`** `str` — Request type: `response`, `embedding`, `audio_transcription`.
- **`request`** `dict[str, Any]` — Request content serialized by the Host.

### Return Value Fields

The return value must be a serializable dictionary. The Host will recognize the following fields and restore them into a unified response:

- **`content` / `response`** `str` — Text response or audio transcription text.
- **`reasoning_content` / `reasoning`** `str` — Reasoning content.
- **`embedding`** `list[float]` — Embedding vector.
- **`tool_calls`** `list` — Tool call snapshot.
- **`usage`** `dict` — Token usage dictionary.
- **`raw_data`** `dict` — Raw response data.

## Basic Usage

### Method 1: Manual Dispatch (Simple Scenarios)

Within the handling method, use `if/elif` to judge the `operation` type and handle them separately:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import Any

from maibot_sdk import LLMProvider, MaiBotPlugin


class MyLLMPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        return None

    async def on_unload(self) -> None:
        return None

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @LLMProvider("my.provider", name="My Provider", description="自定义 LLM Provider")
    async def handle_llm(self, operation: str, request: dict[str, Any]) -> dict[str, Any]:
        if operation == "response":
            return {"content": "你好，我来自插件 Provider"}
        if operation == "embedding":
            return {"embedding": [0.0, 0.1, 0.2]}
        if operation == "audio_transcription":
            return {"content": "音频转写结果"}
        raise ValueError(f"不支持的 LLM Provider 操作类型: {operation}")


def create_plugin():
    return MyLLMPlugin()
```

:::

### Method 2: LLMProviderBase Base Class (Recommended for Complex Logic)

Inherit from `LLMProviderBase` and delegate the dispatch logic to the `dispatch()` method of the base class. Subclasses only need to implement the operation methods they care about; unimplemented methods will throw `NotImplementedError`:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import Any

from maibot_sdk import LLMProvider, LLMProviderBase, MaiBotPlugin


class MyProvider(LLMProviderBase):
    """自定义 Provider，只实现 response 能力。"""

    async def get_response(self, request: dict[str, Any]) -> dict[str, Any]:
        # request 包含 message_list、tool_options、model_info 等
        return {"content": "来自 Provider 类的响应"}


class MyLLMPlugin(MaiBotPlugin):
    def __init__(self) -> None:
        super().__init__()
        self.provider = MyProvider()

    async def on_load(self) -> None:
        return None

    async def on_unload(self) -> None:
        return None

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @LLMProvider("my.provider")
    async def handle_llm(self, operation: str, request: dict[str, Any]) -> dict[str, Any]:
        return await self.provider.dispatch(operation, request)


def create_plugin():
    return MyLLMPlugin()
```

:::

`LLMProviderBase` provides the following methods for subclasses to override:

- **`get_response()`** · operation `response` — Generate text or multimodal responses (abstract method, must be implemented).
- **`get_embedding()`** · operation `embedding` — Generate text embeddings (throws `NotImplementedError` by default).
- **`get_audio_transcriptions()`** · operation `audio_transcription` — Generate audio transcription (throws `NotImplementedError` by default).

::: tip
`LLMProviderBase` is only a recommended base class and does not participate in registration. The actual registration entry is always the `@LLMProvider` decorator.
:::

## Complete Example

Below is a complete minimum viable plugin, including the manifest declaration and Python code.

**_manifest.json**:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "id": "com.example.llm-provider",
  "name": "Example LLM Provider",
  "version": "1.0.0",
  "description": "示例 LLM Provider 插件",
  "author": "example",
  "llm_providers": [
    {
      "client_type": "example.provider",
      "name": "Example Provider",
      "description": "示例 LLM Provider",
      "version": "1.0.0"
    }
  ]
}
```

:::

**main.py**:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import Any

from maibot_sdk import LLMProvider, LLMProviderBase, MaiBotPlugin


class ExampleProvider(LLMProviderBase):
    """示例 Provider，实现 response 和 embedding 两种能力。"""

    async def get_response(self, request: dict[str, Any]) -> dict[str, Any]:
        model_info = request.get("model_info", {})
        message_list = request.get("message_list", [])
        # 此处接入实际的 LLM API
        return {
            "content": "来自 example.provider 的响应",
            "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
        }

    async def get_embedding(self, request: dict[str, Any]) -> dict[str, Any]:
        embedding_input = request.get("embedding_input", "")
        # 此处接入实际的 Embedding API
        return {"embedding": [0.1, 0.2, 0.3]}


class ExampleLLMPlugin(MaiBotPlugin):
    def __init__(self) -> None:
        super().__init__()
        self.provider = ExampleProvider()

    async def on_load(self) -> None:
        self.ctx.logger.info("Example LLM Provider 插件已加载")

    async def on_unload(self) -> None:
        self.ctx.logger.info("Example LLM Provider 插件已卸载")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @LLMProvider("example.provider", name="Example Provider", description="示例 LLM Provider")
    async def handle_llm(self, operation: str, request: dict[str, Any]) -> dict[str, Any]:
        return await self.provider.dispatch(operation, request)


def create_plugin():
    return ExampleLLMPlugin()
```

:::

## Uninstallation and Fallback

When a Provider plugin is uninstalled, disabled, or fails to hot-reload, the Host will deregister the `client_type` owned by that plugin. Subsequently, new requests will attempt the next available model according to the main program's model fallback strategy.

::: info
Plugin Providers currently do not support custom streaming handlers or response parsers on the Host side.
:::
