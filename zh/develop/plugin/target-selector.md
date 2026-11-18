---
title: 目标选择
---

# 目标选择

给配置字段加上 `x-widget: target`，WebUI 就会渲染成搜索式多选框：用户从宿主已知的群或用户里挑，不用手抄 ID。

## 字段声明

字段类型写成 `List[目标模型]`，目标模型继承 `PluginConfigBase`，四个字段固定：

::: fields
- **`platform`** — 平台，默认值用于限制搜索；空字符串表示不限平台。
- **`type`** — `Literal["group"]` 或 `Literal["user"]`，必须有对应默认值。
- **`id`** — 目标在平台上的真实 ID。
- **`name`** — 显示名称，可选，不参与身份或权限判断。
:::

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from typing import List, Literal

from maibot_sdk import Field, PluginConfigBase


class GroupTarget(PluginConfigBase):
    platform: Literal["qq"] = "qq"
    type: Literal["group"] = "group"
    id: str = ""
    name: str = ""


class MyPluginConfig(PluginConfigBase):
    allowed_groups: List[GroupTarget] = Field(
        default_factory=list,
        json_schema_extra={"x-widget": "target", "label": "允许群"},
    )
```

:::

SDK 已支持透传 `x-widget` 和列表元素定义，不需要扩展 SDK 协议。`label` 与 `hint` 是可选元数据，分别作为字段标题和说明显示。

## 搜索与匹配

群从已有 `ChatSession` 去重查询；用户直接查询 `PersonInfo`，包含没有私聊的用户。搜索在服务端执行，每次最多显示 50 项，继续输入名称可以缩小范围。尚未被宿主记录的目标不会出现。

保存的每一项都是完整的目标模型。读取配置后应校验列表中的 ID 非空，并按 `platform`、`type`、`id` 三者匹配；`name` 仅供展示，改名或被别人复用都不影响权限判断。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
def is_allowed(self, platform: str, group_id: str) -> bool:
    for target in self.config.allowed_groups:
        if not target.id.strip():
            continue
        if target.platform and target.platform != platform:
            continue
        if target.type == "group" and target.id == group_id:
            return True
    return False
```

:::

## 边界

该目标表示平台群或账号，不表示某个机器人的投递路由，不能用它替代包含 `account_id`、`scope` 的会话身份。同一个群可能由多个账号投递，投递路由由平台适配器决定；目标选择只回答「允许哪个群 / 哪个用户」。

## 验证与排错

**验证**：打开 WebUI 插件配置页，字段应显示为搜索框而不是文本输入；输入已知群名或用户昵称能出现候选项，多选保存后 `config.toml` 里写入带 `platform`、`type`、`id`、`name` 的结构化条目。

- **字段仍然是普通文本框** — 字段类型不是 `List[目标模型]`，或 `json_schema_extra` 没写成 `{"x-widget": "target"}`；改动模型后需要重载插件让 Runner 重新生成 Schema。
- **搜不到某个群** — 宿主只展示已经产生过 `ChatSession` 的群；先让机器人收到该群的一条消息。
- **搜不到某个用户** — 用户直接查 `PersonInfo`，包含没有私聊的用户；确实没有记录说明宿主从未见过该用户。
- **保存后权限不生效** — 插件按 `name` 而不是 `platform`、`type`、`id` 匹配；`name` 只是显示名称。
- **把目标当成了会话身份** — 需要区分具体机器人账号或投递范围时，改用包含 `account_id`、`scope` 的会话身份。
