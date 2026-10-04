---
title: 首页卡片
---

# 首页卡片

插件可以通过 SDK 的 `@HomeCard` 装饰器向 WebUI 首页添加扩展卡片。卡片会随插件加载注册，插件禁用、卸载或重载后自动从首页候选卡片中移除。

## 基本示例

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import HomeCard, MaiBotPlugin


class StatusCardPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        return None

    async def on_unload(self) -> None:
        return None

    async def on_config_update(self, scope: str, config_data: dict[str, object], version: str) -> None:
        del scope
        del config_data
        del version

    @HomeCard(
        "status",
        title="插件状态",
        description="展示插件运行摘要",
        content=[
            {"type": "markdown", "content": "**运行中**，最近一次同步成功。"},
            {"type": "stat", "label": "今日任务", "value": "12", "detail": "失败 0 次"},
            {"type": "actions", "actions": [{"label": "打开配置", "url": "/plugin-config?plugin=demo.status"}]},
        ],
        link_url="/plugin-config?plugin=demo.status",
        link_label="插件配置",
        width="medium",
        order=100,
    )
    async def home_card_marker(self) -> None:
        return None
```

:::

## 参数

**`name`** `str`（必填）— 卡片组件名称，同一插件内唯一
**`title`** `str`（必填）— 首页显示标题
**`content`** `str \| dict \| list[dict]`（默认 `""`）— 卡片内容。字符串按 Markdown 渲染；列表按内容块渲染
**`description`** `str`（默认 `""`）— 卡片描述
**`link_url`** `str`（默认 `""`）— 可选跳转链接，支持 WebUI 内部路径、`http(s)`、`mailto`
**`link_label`** `str`（默认 `""`）— 跳转按钮文案
**`icon`** `str`（默认 `""`）— 可选图标名，供 WebUI 展示扩展
**`width`** `str`（默认 `"medium"`）— 卡片宽度：`small` = 2/10、`medium` = 3/10、`large` = 5/10、`wide` = 7/10、`full` = 10/10
**`order`** `int`（默认 `1000`）— 默认排序值，越小越靠前

## 内容块

推荐使用以下内容块：

- `{"type": "markdown", "content": "..."}`
- `{"type": "text", "content": "..."}`
- `{"type": "stat", "label": "...", "value": "...", "detail": "..."}`
- `{"type": "key_value", "entries": {"键": "值"}}`
- `{"type": "list", "items": ["..."]}`
- `{"type": "actions", "actions": [{"label": "...", "url": "/path"}]}`

## WebUI 管理

用户可以在 WebUI 首页点击"编辑卡片"进入编辑模式：

- 拖拽卡片调整顺序。
- 隐藏内置卡片或插件卡片。
- 恢复已隐藏卡片。
- 新增本地自定义 Markdown 卡片。

布局保存在浏览器本地，不会写入插件配置。插件卡片的默认顺序由 `order` 决定，但用户调整后以本地布局为准。

## 安全边界

- WebUI 不执行插件提供的 HTML、JavaScript 或内联事件；Markdown 中的 HTML 会按普通文本处理。
- 链接会被 Host 和 WebUI 双重校验，仅允许内部路径、`http(s)` 和 `mailto`。
- Host 会裁剪过长文本和过大的内容块列表，避免插件向首页塞入过大的任意 JSON。
