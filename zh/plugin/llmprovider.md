---
title: LLMProvider 组件
---

# LLMProvider 组件

`@LLMProvider` 用于声明插件提供新的 LLM Provider `client_type`。主程序会将该 `client_type` 注册到 LLM 客户端注册表中，因此现有 `LLMService` 和模型任务配置不需要改调用方式——只要模型配置里的 `api_providers[].client_type` 指向插件声明的值，请求就会通过插件 Provider 发起。

::: warning 双重声明必须一致
LLM Provider 必须同时满足两处声明，缺一不可：

1. `_manifest.json` 顶层 `llm_providers` 中静态声明 `client_type`
2. 插件代码中使用 `@LLMProvider("同一个 client_type")` 修饰处理方法

Runner 会校验 manifest 与装饰器收集结果完全一致。任意一边漏写、拼写不一致或同一插件内重复声明，插件都会拒绝加载。不同插件声明同一个 `client_type` 时，冲突双方都会被阻止加载。
:::

## 装饰器签名

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

### 参数说明

- **`client_type`** `str` · 必填 — 客户端类型标识，对应模型配置中的 `api_providers[].client_type`。不能为空
- **`name`** `str` · 默认 `""` — Provider 展示名称。留空时使用 `client_type`
- **`description`** `str` · 默认 `""` — Provider 描述信息
- **`version`** `str` · 默认 `"1.0.0"` — Provider 实现版本号
- **`**metadata`** `Any` — 额外元数据键值对

## Manifest 声明

`_manifest.json` 顶层必须包含 `llm_providers` 数组，与代码中的 `@LLMProvider` 一一对应：

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

### llm\_providers 字段说明

- **`client_type`** `str` · 必填 — Provider 客户端类型，必须与模型配置 `api_providers[].client_type` 一致
- **`name`** `str` · 默认 `""` — Provider 展示名称
- **`description`** `str` · 默认 `""` — Provider 描述
- **`version`** `str` · 默认 `"1.0.0"` — Provider 实现版本

::: danger
不要在 manifest 的 `llm_providers` 中写 `handler_name` 或 `metadata`——处理函数由 `@LLMProvider` 装饰器自动收集，不需要手动指定。
:::

## Operation 类型

处理方法通过 `operation` 参数区分请求类型。三种 operation 分别对应不同的 LLM 能力：

- **`response`** — LLM 文本/工具响应。主要请求字段：`message_list`、`tool_options`、`max_tokens`、`temperature`、`response_format`、`extra_params`、`model_info`、`api_provider`。返回字段：`content` / `response`、`reasoning_content`、`tool_calls`、`usage`
- **`embedding`** — 文本向量化。主要请求字段：`embedding_input`、`extra_params`、`model_info`、`api_provider`。返回字段：`embedding`
- **`audio_transcription`** — 语音识别。主要请求字段：`audio_base64`、`max_tokens`、`extra_params`、`model_info`、`api_provider`。返回字段：`content`

三种 operation 的请求中都会包含以下公共字段：

- **`model_info`** `dict` — 当前请求的模型信息
- **`api_provider`** `dict` — 当前请求的 API Provider 配置
- **`extra_params`** `dict` — 额外参数

## 请求与返回字段

### 处理方法参数

- **`operation`** `str` — 请求类型：`response`、`embedding`、`audio_transcription`
- **`request`** `dict[str, Any]` — Host 序列化后的请求内容

### 返回值字段

返回值必须是可序列化字典。Host 会识别以下字段并恢复为统一响应：

- **`content` / `response`** `str` — 文本响应或音频转写文本
- **`reasoning_content` / `reasoning`** `str` — 推理内容
- **`embedding`** `list[float]` — 嵌入向量
- **`tool_calls`** `list` — 工具调用快照
- **`usage`** `dict` — token 使用量字典
- **`raw_data`** `dict` — 原始响应数据

## 基本用法

### 方式一：手动分发（简单场景）

在处理方法内通过 `if/elif` 判断 `operation` 类型分别处理：

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

### 方式二：LLMProviderBase 基类（推荐，逻辑较多时）

继承 `LLMProviderBase`，将分发逻辑交给基类的 `dispatch()` 方法。子类只需实现关心的 operation 方法，未实现的方法会抛出 `NotImplementedError`：

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

`LLMProviderBase` 提供以下方法供子类覆写：

- **`get_response()`** · operation `response` — 生成文本或多模态响应（抽象方法，必须实现）
- **`get_embedding()`** · operation `embedding` — 生成文本嵌入（默认抛出 `NotImplementedError`）
- **`get_audio_transcriptions()`** · operation `audio_transcription` — 生成音频转写（默认抛出 `NotImplementedError`）

::: tip
`LLMProviderBase` 只是推荐基类，不参与注册。真正的注册入口始终是 `@LLMProvider` 装饰器。
:::

## 完整示例

下面是一个完整的最小可用插件，包含 manifest 声明和 Python 代码。

**\_manifest.json**：

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

**main.py**：

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

## 卸载与回退

当 Provider 插件卸载、禁用或热重载失败时，Host 会注销该插件拥有的 `client_type`。此后新请求会按主程序的模型回退策略尝试下一个可用模型。

::: info
插件 Provider 暂不支持 Host 侧自定义流式处理器或响应解析器。
:::
