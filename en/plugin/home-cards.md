---
title: Home Cards
---

# Home Cards

Plugins can add extension cards to the WebUI home page with the SDK `@HomeCard` decorator. Cards are registered while the plugin is loaded and disappear automatically when the plugin is disabled, unloaded, or reloaded.

## Basic Example

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
        title="Plugin Status",
        description="Shows a plugin runtime summary",
        content=[
            {"type": "markdown", "content": "**Running**, last sync succeeded."},
            {"type": "stat", "label": "Tasks today", "value": "12", "detail": "0 failures"},
            {"type": "actions", "actions": [{"label": "Open config", "url": "/plugin-config?plugin=demo.status"}]},
        ],
        link_url="/plugin-config?plugin=demo.status",
        link_label="Plugin config",
        width="medium",
        order=100,
    )
    async def home_card_marker(self) -> None:
        return None
```

:::

## Parameters

**`name`** `str` (required) — Card component name, unique within the plugin
**`title`** `str` (required) — Title shown on the home page
**`content`** `str \| dict \| list[dict]` (default `""`) — Card content. Strings render as Markdown; lists render as content blocks
**`description`** `str` (default `""`) — Card description
**`link_url`** `str` (default `""`) — Optional link. Supports WebUI internal paths, `http(s)`, and `mailto`
**`link_label`** `str` (default `""`) — Link button label
**`icon`** `str` (default `""`) — Optional icon name for WebUI extensions
**`width`** `str` (default `"medium"`) — Card width: `small` = 2/10, `medium` = 3/10, `large` = 5/10, `wide` = 7/10, `full` = 10/10
**`order`** `int` (default `1000`) — Default order. Lower values appear earlier

## Content Blocks

Recommended content blocks:

- `{"type": "markdown", "content": "..."}`
- `{"type": "text", "content": "..."}`
- `{"type": "stat", "label": "...", "value": "...", "detail": "..."}`
- `{"type": "key_value", "entries": {"Key": "Value"}}`
- `{"type": "list", "items": ["..."]}`
- `{"type": "actions", "actions": [{"label": "...", "url": "/path"}]}`

## WebUI Management

Users can click "Edit cards" on the WebUI home page:

- Drag cards to reorder them.
- Hide built-in or plugin cards.
- Restore hidden cards.
- Add local custom Markdown cards.

The layout is stored locally in the browser and is not written to plugin config. A plugin card's default position uses `order`, but user layout wins after the user edits it.

## Security Boundaries

- The WebUI does not execute HTML, JavaScript, or inline events provided by plugins. HTML inside Markdown is treated as normal text.
- Links are checked by both Host and WebUI. Only internal paths, `http(s)`, and `mailto` are allowed.
- Host truncates oversized text and content block lists so plugins cannot push excessively large arbitrary JSON into the home page.
