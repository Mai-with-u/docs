---
title: API 组件
---

# API 组件

`@API` 装饰器用于声明插件间通信的 API 接口。其他插件可以通过 `ctx.api.call()` 调用这些 API，实现插件间的功能互操作。

## 装饰器签名

```python
from maibot_sdk import API

@API(
    name: str,                  # API 名称（必填）
    description: str = "",      # API 描述
    version: str = "1",         # API 版本
    public: bool = False,       # 是否允许其他插件调用
    **metadata,                 # 额外元数据
)
```

## 参数说明

### name

API 的唯一标识名称。同一插件内不能有重复名称的 API。其他插件通过 `插件 ID + API 名称` 来定位和调用。

### public

| 值 | 行为 |
|----|------|
| `False`（默认） | 仅插件内部可见，其他插件无法调用 |
| `True` | 公开 API，其他插件可通过 `ctx.api.call()` 调用 |

### version

API 版本号，默认为 `"1"`。用于 API 版本管理，当需要不兼容更新时可以递增版本号。

## 静态 API 示例

通过 `@API` 装饰器在插件类上直接声明 API：

```python
from maibot_sdk import MaiBotPlugin, API


class RenderPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        self.ctx.logger.info("渲染插件已加载")

    async def on_unload(self) -> None:
        self.ctx.logger.info("渲染插件已卸载")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @API(
        "render_html",
        description="将 HTML 渲染为图片",
        version="1",
        public=True,
    )
    async def handle_render_html(self, html: str, **kwargs):
        # 调用渲染能力
        result = await self.ctx.render.html2png(html)
        return {"success": True, "image_path": result}

    @API(
        "get_stats",
        description="获取渲染统计信息",
        version="1",
        public=True,
    )
    async def handle_get_stats(self, **kwargs):
        return {
            "total_renders": 42,
            "avg_time_ms": 150,
        }
```

## 动态 API 注册

除了使用 `@API` 装饰器静态声明外，还可以在运行时动态注册和注销 API。动态 API 适合需要根据配置或运行时条件决定是否暴露 API 的场景。

### 动态 API 方法

| 方法 | 说明 |
|------|------|
| `self.register_dynamic_api(name, handler, *, description, version, public, handler_name, **metadata)` | 注册动态 API |
| `self.unregister_dynamic_api(name, *, version="1")` | 注销动态 API |
| `self.clear_dynamic_apis()` | 清空所有动态 API |
| `await self.sync_dynamic_apis(*, offline_reason="动态 API 已下线")` | 将动态 API 同步到主程序 |

### 动态注册示例

```python
from maibot_sdk import MaiBotPlugin, PluginConfigBase, Field
from typing import Any


class DynamicApiPlugin(MaiBotPlugin):
    class MyConfig(PluginConfigBase):
        enable_translate: bool = Field(default=False, description="是否启用翻译 API")

    config_model = MyConfig

    async def on_load(self) -> None:
        # 根据配置动态注册 API
        if self.config.enable_translate:
            self.register_dynamic_api(
                "translate",
                self._handle_translate,
                description="文本翻译",
                version="1",
                public=True,
                handler_name="handle_translate",
            )

            self.register_dynamic_api(
                "detect_language",
                self._handle_detect_language,
                description="语言检测",
                version="1",
                public=True,
            )

        # 同步动态 API 到主程序
        await self.sync_dynamic_apis()
        self.ctx.logger.info("动态 API 已同步")

    async def on_unload(self) -> None:
        # 清空并同步下线
        self.clear_dynamic_apis()
        await self.sync_dynamic_apis(offline_reason="插件已卸载")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    async def _handle_translate(self, text: str, target_lang: str = "en", **kwargs) -> dict[str, Any]:
        # 翻译逻辑
        return {"translated": f"[translated {text} to {target_lang}]"}

    async def _handle_detect_language(self, text: str, **kwargs) -> dict[str, Any]:
        # 语言检测逻辑
        return {"language": "zh", "confidence": 0.95}
```

### 动态注销示例

```python
class ManagedApiPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        # 批量注册
        for name, handler in [("api_a", self._a), ("api_b", self._b)]:
            self.register_dynamic_api(name, handler, public=True)
        await self.sync_dynamic_apis()

    async def disable_api_b(self) -> None:
        # 注销单个 API
        self.unregister_dynamic_api("api_b")
        await self.sync_dynamic_apis(offline_reason="API B 已禁用")

    async def on_unload(self) -> None:
        self.clear_dynamic_apis()
        await self.sync_dynamic_apis(offline_reason="插件已卸载")

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    async def _a(self, **kwargs):
        return {"result": "a"}

    async def _b(self, **kwargs):
        return {"result": "b"}
```

## 调用其他插件的 API

通过 `self.ctx.api` 代理可以查询和调用其他插件公开的 API。

### ctx.api 方法

| 方法 | 说明 |
|------|------|
| `await self.ctx.api.call(plugin_id, api_name, **kwargs)` | 调用其他插件的 API |
| `await self.ctx.api.get(plugin_id, api_name)` | 获取 API 信息 |
| `await self.ctx.api.list()` | 列出所有可用 API |
| `await self.ctx.api.replace_dynamic_apis(components, offline_reason="...")` | 替换动态 API |

### 调用示例

```python
from maibot_sdk import MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType


class CallerPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        # 列出所有可用 API
        apis = await self.ctx.api.list()
        self.ctx.logger.info("可用 API: %s", apis)

    async def on_unload(self) -> None:
        pass

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @Tool(
        "translate_text",
        brief_description="翻译文本",
        detailed_description="参数说明：\n- text：string，必填。待翻译文本。",
        parameters=[
            ToolParameterInfo(
                name="text",
                param_type=ToolParamType.STRING,
                description="待翻译文本",
                required=True,
            ),
        ],
    )
    async def handle_translate(self, text: str, **kwargs):
        # 调用其他插件的翻译 API
        result = await self.ctx.api.call(
            "com.example.translate",   # 目标插件 ID
            "translate",                # API 名称
            text=text,
            target_lang="en",
        )
        return result
```

### 查询 API 信息

```python
# 获取特定 API 的详细信息
api_info = await self.ctx.api.get("com.example.translate", "translate")
self.ctx.logger.info("API 信息: %s", api_info)
```

## API 设计建议

### 命名规范

- 使用小写字母和下划线：`render_html`、`get_stats`
- 动词开头：`get_`、`render_`、`detect_`、`translate_`
- 避免过于通用的名称，应体现功能含义

### 版本管理

- 初始版本使用 `"1"`
- 不兼容更新时递增版本号
- 同名 API 可以同时存在多个版本

### 参数设计

- API 处理器方法接收 `**kwargs`，从中提取参数
- 必要参数应以位置参数明确声明
- 返回值应为可序列化的字典

## 静态 API 与动态 API 对比

| 特性 | 静态 @API | 动态 register_dynamic_api() |
|------|-----------|---------------------------|
| 声明时机 | 类定义时 | 运行时（通常在 on_load 中） |
| 条件暴露 | 不支持 | 可根据配置动态决定 |
| 注销 | 不支持 | 可通过 unregister 动态注销 |
| 同步 | 自动 | 需调用 sync_dynamic_apis() |
| 适用场景 | 固定不变的 API | 按需启用/禁用的 API |
