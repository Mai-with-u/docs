---
title: Action 组件（Legacy）
---

# Action 组件（Legacy）

::: danger 已废弃
`@Action` 装饰器已废弃，SDK 内部会自动将其转换为 `@Tool` 声明。**新插件应直接使用 [`@Tool`](./tools.md)**。使用 `@Action` 时会触发 `DeprecationWarning`。
:::

## 从 @Action 迁移到 @Tool

`@Action` 和 `@Tool` 的核心区别：

| 对比项 | `@Action`（旧） | `@Tool`（新） |
|--------|-----------------|---------------|
| 参数类型 | 全部为 `string` | 支持 `string`、`integer`、`boolean`、`array`、`object` 等 7 种类型 |
| 参数声明 | `action_parameters={"key": "描述"}` | `parameters=[ToolParameterInfo(...)]` |
| 参数 Schema | 无 JSON Schema 生成 | 自动生成完整 JSON Schema |
| 激活方式 | `activation_type` + `activation_keywords` | 始终可用（由 LLM 自行判断何时调用） |
| 描述机制 | 单一 `description` | `brief_description` + `detailed_description` |

### 迁移示例

**旧写法（@Action）：**

```python
from maibot_sdk import MaiBotPlugin, Action

class MyPlugin(MaiBotPlugin):
    @Action(
        "search",
        description="搜索互联网获取信息",
        activation_type="always",
        action_parameters={"query": "搜索关键词"},
    )
    async def handle_search(self, query: str, **kwargs):
        results = await self._do_search(query)
        return results
```

**新写法（@Tool）：**

```python
from maibot_sdk import MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType

class MyPlugin(MaiBotPlugin):
    @Tool(
        "search",
        brief_description="搜索互联网获取信息",
        parameters=[
            ToolParameterInfo(
                name="query",
                param_type=ToolParamType.STRING,
                description="搜索关键词",
                required=True,
            ),
        ],
    )
    async def handle_search(self, query: str, **kwargs):
        results = await self._do_search(query)
        return {"results": results}
```

## @Action 装饰器签名（参考）

以下为 `@Action` 的完整参数签名，仅供旧插件维护参考：

```python
from maibot_sdk import Action

@Action(
    name: str,                                          # Action 名称
    description: str = "",                              # Action 描述
    activation_type: ActivationType = ActivationType.ALWAYS,  # 激活类型
    activation_keywords: list[str] | None = None,       # 激活关键词
    activation_probability: float = 1.0,                # 随机激活概率
    chat_mode: ChatMode = ChatMode.NORMAL,              # 聊天模式
    action_parameters: dict[str, Any] | None = None,    # 参数定义
    action_require: list[str] | None = None,            # 使用要求
    associated_types: list[str] | None = None,          # 关联消息类型
    parallel_action: bool = False,                      # 是否可并行执行
    action_prompt: str = "",                            # LLM 提示语
    **metadata,
)
```

### ActivationType 枚举

| 枚举值 | 说明 |
|--------|------|
| `NEVER` | 从不激活 |
| `ALWAYS` | 始终作为候选工具 |
| `RANDOM` | 以一定概率随机启用 |
| `KEYWORD` | 当消息包含关键词时启用 |

### ChatMode 枚举

| 枚举值 | 说明 |
|--------|------|
| `FOCUS` | 专注模式 |
| `NORMAL` | 普通模式 |
| `PRIORITY` | 优先模式 |
| `ALL` | 所有模式 |

## 内部转换机制

SDK 内部会将 `@Action` 的所有参数转换为 `@Tool` 等价的元数据：

- `action_parameters` → 转换为 Tool 的参数 Schema（所有字段类型为 `string`）
- `activation_type` / `activation_keywords` / `activation_probability` / `chat_mode` → 保存为 Tool `metadata` 中的 `legacy_action` 标记字段
- `action_require` / `associated_types` / `action_prompt` → 合并到 Tool 的 `detailed_description` 中
- `invoke_method` 固定为 `"plugin.invoke_action"`（兼容旧调用路径）

转换后，Host 侧只维护一套 Tool 抽象，不再区分 Action 和 Tool 的调用流程。
