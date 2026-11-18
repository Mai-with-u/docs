---
title: Target Selection
---

# Target Selection

Add `x-widget: target` to a config field and the WebUI renders it as a searchable multi-select: users pick from groups or users the host already knows instead of copying IDs by hand.

## Field declaration

Declare the field as `List[target model]`, where the target model inherits `PluginConfigBase` and always has four fields:

::: fields
- **`platform`** — Platform; the default value constrains the search. An empty string means any platform.
- **`type`** — `Literal["group"]` or `Literal["user"]`, and it must have a matching default.
- **`id`** — The target's real ID on that platform.
- **`name`** — Display name, optional, never used for identity or permission checks.
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
        json_schema_extra={"x-widget": "target", "label": "Allowed groups"},
    )
```

:::

The SDK already passes `x-widget` and list element definitions through, so no SDK protocol change is needed. `label` and `hint` are optional metadata used as the field title and description.

## Search and matching

Groups are queried deduplicated from existing `ChatSession` records; users are queried directly from `PersonInfo`, including users with no private chat. Search runs on the server, shows at most 50 items per request, and narrows as you keep typing a name. Targets the host has not recorded yet never appear.

Every saved entry is a complete target model. After reading the config, validate that each ID is non-empty and match on `platform`, `type`, and `id`; `name` is display only, so renaming or reusing a name never changes permission decisions.

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

## Boundaries

A target is a platform group or account, not a delivery route for a particular bot, so it cannot replace a session identity that carries `account_id` and `scope`. One group may be delivered by several accounts and the delivery route belongs to the platform adapter; target selection only answers which group or user is allowed.

## Verify and troubleshoot

**Verification** — open the plugin config page in the WebUI: the field should render as a search box rather than a text input, typing a known group name or user nickname should list candidates, and saving a multi-selection should write structured entries with `platform`, `type`, `id`, and `name` into `config.toml`.

- **The field is still a plain text box** — the field type is not `List[target model]`, or `json_schema_extra` is not `{"x-widget": "target"}`; reload the plugin so the Runner regenerates the Schema after you change the model.
- **A group cannot be found** — the host only lists groups that already produced a `ChatSession`; let the bot receive one message in that group first.
- **A user cannot be found** — users come straight from `PersonInfo` and include users with no private chat; if there is no record, the host has never seen that user.
- **Permissions do not apply after saving** — the plugin matches on `name` instead of `platform`, `type`, and `id`; `name` is only a display name.
- **A target was treated as a session identity** — when you need to distinguish a specific bot account or delivery scope, use a session identity that carries `account_id` and `scope` instead.
