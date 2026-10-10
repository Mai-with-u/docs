---
title: WebUI Pages
---

# WebUI Pages

A plugin can place a `webui.json` in its own directory to **declare** custom pages for the WebUI — a top workspace or a sidebar entry. The host renders the page, so you do not need to install Node, build a frontend, or modify the main program; edit `webui.json` and reload the plugin to take effect.

The mechanism only describes "what to show and which API to bind". A page can call **only your own** plugin APIs; it cannot inject HTML / JS / CSS or request arbitrary addresses.

## Minimal working example

`webui.json` lives in the plugin directory (next to `_manifest.json`). The example below declares a top statistics page and a sidebar settings page:

::: code-group

```json [webui.json ~vscode-icons:file-type-json~]
{
  "schema_version": 1,
  "workspace_title": "Message Stats",
  "pages": [
    {
      "id": "overview",
      "title": "Stats Overview",
      "placement": "workspace",
      "icon": "chart",
      "queries": { "summary": { "api": "summary", "version": "1" } },
      "content": [
        { "type": "stat", "label": "Messages today", "value": { "source": "summary", "field": "count" } }
      ]
    },
    {
      "id": "settings",
      "title": "Stats Settings",
      "placement": "sidebar",
      "icon": "settings",
      "actions": {
        "save": {
          "api": "save_limit",
          "version": "1",
          "parameters": {
            "limit": { "type": "integer", "required": true, "minimum": 1, "maximum": 1000 }
          },
          "confirmation": "Change the stats limit?"
        }
      },
      "content": [
        {
          "type": "card",
          "label": "Stats range",
          "children": [
            { "type": "input", "name": "limit", "label": "Limit", "value": 100 },
            { "type": "button", "label": "Save", "action": "save" }
          ]
        }
      ]
    }
  ]
}
```

:::

The APIs a page binds are registered statically with the SDK `@API` decorator on your `MaiBotPlugin` subclass:

::: code-group

```python [plugin.py ~vscode-icons:file-type-python~]
from maibot_sdk import API, MaiBotPlugin


class MyPlugin(MaiBotPlugin):
    today_count = 0

    @API("summary", description="Read-only page data", version="1")
    async def summary(self):
        return {"count": self.today_count}

    @API("save_limit", description="Save the stats limit", version="1")
    async def save_limit(self, limit: int):
        self.limit = limit
        return {"saved": True}
```

:::

## Where pages appear

- **`placement`** — `"sidebar"` puts the page in the "plugin extensions" group of the Mai workspace; `"workspace"` puts it in the plugin's own top workspace
- **`workspace_title`** — the name of the workspace that holds `workspace` pages; a plugin may have several `workspace` pages, and the first one is the default, with the rest going into the top "more" overflow menu
- **`id` / `title` / `description`** — page identifier, title, and description. The host generates the path as `/extensions/{plugin_id}/{page_id}`; a plugin cannot define arbitrary routes or override built-in entries
- **`icon`** — only the five built-in icons `puzzle`, `chart`, `settings`, `database`, and `list` are accepted
- **Entry ordering** — users can reorder entries or hide a whole plugin's entries in the "manage plugin pages" area at the bottom of the "Plugin Extensions" page (`/plugin-config`); that preference is stored only in the current browser and only affects display

::: tip Two independent channels from "plugin configuration"
`webui.json` only handles custom pages. Page declarations themselves do not need to be added to `capabilities`, and bound APIs do not need `public=True`. SDK operations such as claiming uploads still require their own manifest permissions. A plugin's `config.toml` and its auto-generated config form are still handled by the Plugin Configuration page; the two do not affect each other.
:::

The official example plugin `hello_world_plugin` ships two pages (a top `overview` and a sidebar `greeting`) as a minimal reference; see its `webui.json` for the complete declaration, with page paths like `/extensions/maibot-team.hello-world-plugin/overview`.

::: tip Local debugging
To try custom pages from source, build `dashboard` and set `MAIBOT_WEBUI_USE_LOCAL_DASHBOARD=1` before starting the main program so the WebUI uses the local build; the frontend dev server uses port 7999, and the backend needs a main-program restart the first time the extension routes are added. A normally installed `maibot-dashboard` does not update automatically with source changes.
:::

## Data and actions

Each page declares the APIs it calls through `queries` (read-only) and `actions` (writes):

- API names are the **short names of your own plugin's APIs**; `version` defaults to `"1"` when omitted and must match the version registered with `@API` exactly
- `queries` run **in order** when the page opens and refreshes; after an `actions` call succeeds, queries run again to refresh the data
- APIs must belong to the current plugin and be enabled; cross-plugin calls, dynamic APIs, and arbitrary request addresses are unsupported (`public=True` does not automatically expose an API to the WebUI)
- Action parameters are taken from the current form fields according to `parameters`; optional fields left empty are not sent. Parameter types are `string` / `integer` / `number` / `boolean`, with optional `required`, `max_length` (default 4000, maximum 65536), `minimum`, `maximum`, and `choices`; there is **no implicit type conversion**, and undeclared parameters are rejected
- **Dangerous actions must declare a `confirmation` message** (so must buttons with `variant: "danger"`), and the host shows a confirm dialog. Confirmation prevents misclicks; the plugin API must still enforce authorization and business validation

::: tip Keep queries read-only
The host cannot tell whether a Python method has side effects, so it relies on the declaration. Put anything with side effects in `actions`, or refreshing the page will repeat the write.
:::

## Components

A page is a component tree under `content`. All colors, spacing, fonts, dark mode, and dashboard styling are controlled by the host; components **do not accept** `className`, `style`, or HTML slots:

- **`stack`** — vertical layout, attributes `label`, `children`
- **`grid`** — grid layout, attributes `label`, `columns` (1–4 columns, single column on mobile), `children`
- **`card`** — host card container, attributes `label`, `children`
- **`tabs`** — tab pages; every child node must have a `label`
- **`text`** — plain text, attributes `label`, `value`; HTML is not executed
- **`stat`** — stat card, attributes `label`, `value`
- **`table`** — table, attributes `label`, `value`, `columns`. `columns` looks like `[{ "field": "name", "label": "Name" }]`; it binds an array of objects, 50 rows per page
- **`chart`** — line or bar chart, attributes `label`, `value`, `chart_type` (`line` / `bar`), `x`, `y`. It binds an array of objects, where x is a string or number, y is a number, and there are at most 2000 rows
- **`input`** — text or number input, attributes `name`, `label`, `value`; a numeric default renders a number input
- **`date`** — date input, attributes `name`, `label`, `value`
- **`select`** — dropdown, attributes `name`, `label`, `value`, `options`. `options` looks like `[{ "label": "Week", "value": "week" }]`, and `value` must be a non-empty string
- **`switch`** — toggle, attributes `name`, `label`, `value`; `value` must be a boolean
- **`button`** — button, attributes `label`, `action`, `variant` (`primary` / `danger` / `muted`)

**`value` may be a scalar or a data reference** `{ "source": "query alias", "field": "totals.count" }`: `source` must be an alias declared in this page's `queries`, and an empty `field` means the query's full return value. Tables and charts must use data references; computed expressions and scripts are unsupported.

**Data validation before rendering** (done by the frontend; when it fails the whole page shows an `invalidData` error):

- `table` binds an array of objects, 50 rows per page
- `chart` binds an array of objects, at most 2000 rows; `x` must be a string or number and `y` must be a number; `chart_type` is `line` / `bar`
- `switch`'s `value` must be a boolean

## Upload and interaction capabilities

Declare top-level `required_capabilities` in `webui.json` when using uploads or new interaction controls. `file_upload` means file uploads are supported; `interactive_controls` means the newer controls are supported. These check frontend feature compatibility; SDK permissions are declared in the manifest’s `capabilities`. Capability names have no version suffix. Existing declarations may omit the field. Upgrade both the host and dashboard if a required capability is missing; updating the Python SDK alone does not add frontend controls.

Claiming uploads requires SDK 2.11.0+ and the upload-enabled host introduced in the MaiBot 1.3.6 development version. Before SDK 2.11.0 is published, local development can point `MAIBOT_PLUGIN_SDK_PATH` to the SDK source. Separately declare `webui.claim_upload` in the plugin manifest's `capabilities`; this grants API access and is distinct from page compatibility.

This page puts file selection and identity selection in one dialog. Files are sent only after clicking the upload button:

::: code-group

```json [webui.json ~vscode-icons:file-type-json~]
{
  "schema_version": 1,
  "required_capabilities": [
    "file_upload",
    "interactive_controls"
  ],
  "pages": [
    {
      "id": "images",
      "title": "Image library",
      "actions": {
        "add": {
          "api": "add_image",
          "parameters": {
            "upload_id": {
              "type": "string",
              "required": true
            },
            "identity": {
              "type": "string",
              "required": true,
              "choices": [
                "self",
                "other"
              ]
            }
          }
        }
      },
      "content": [
        {
          "type": "button",
          "label": "Upload images",
          "detail": "upload"
        },
        {
          "type": "dialog",
          "label": "Upload images",
          "children": [
            {
              "type": "select",
              "name": "identity",
              "label": "Image identity",
              "value": "self",
              "options": [
                {
                  "label": "Bot",
                  "value": "self"
                },
                {
                  "label": "Not Bot",
                  "value": "other"
                }
              ],
              "presentation": "buttons"
            },
            {
              "type": "upload",
              "label": "Choose images",
              "action": "add",
              "manual_upload": true,
              "image_max_edge": 4000
            }
          ],
          "name": "upload"
        }
      ]
    }
  ]
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
from maibot_sdk import API, MaiBotPlugin


class MyPlugin(MaiBotPlugin):
    @API("add_image", version="1")
    async def add_image(self, upload_id: str, identity: str):
        claimed = await self.ctx.webui.claim_upload(upload_id)
        # claimed["path"] is inside this plugin's data directory.
        # Validate identity, deduplicate, and save labels here.
        # Move blocking work to a worker thread.
        return {"received": True, "identity": identity}
```

:::

The host receives each file through an authenticated multipart endpoint. Ordinary JSON/RPC carries only `upload_id` and scalar arguments. The host stages files and issues plugin-owned tokens that expire after one hour and can be claimed only once, never by another plugin. After claiming a file, the plugin manages retention or deletion. The upload action must accept a required string `upload_id` and cannot declare `confirmation`; additional fields such as identity use ordinary parameter validation.

Accepted formats are JPEG, PNG, and static WebP; animations and archives are rejected. The host enforces 20 MiB per file and 40 million decoded pixels. `image_max_edge: 4000` makes the browser proportionally shrink oversized images before upload; files over 20 MiB are compressed to JPEG, transparency is filled with white, and local originals are preserved. This edge limit is a component setting; the host still validates the actual uploaded file.

**`upload`** — Multiple files, per-file progress and errors, with cancellation and retries for failed or unsent files. Retries use the original batch parameters. Closing the dialog cancels unfinished requests; files already received by the server remain saved. `manual_upload: true` enables drag-and-drop, previews, removal, and explicit start; arguments are frozen for the batch when it starts. Without this setting, selection starts uploading immediately. `submit_label` changes the start button's text.

**Upload dialogs** — Compose an ordinary `button` with a top-level `dialog`. The button’s `detail` references the dialog’s `name`; place `select` and `upload` inside. A button must declare exactly one of `action` or `detail`.

**`select.presentation`** — Defaults to `dropdown`; `buttons` displays the same `name`, `value`, and `options` as option buttons. For modal selection, put the select inside an ordinary dialog.

**`progress`** — `value` is a finite number from 0 to 100 or a data reference; shows a percentage and progress bar.

**Unavailable controls** — Inputs, buttons and uploads accept `disabled_when` using the same condition format as `when`. Matching conditions disable controls; buttons display `disabled_reason`. Use disabling to keep an unavailable action visible; `when` still controls visibility.

**Upload messages** — A plugin may return a scalar string `message` for per-file feedback. The host does not interpret plugin-specific duplicate-image fields; selection counts use generic items.

**`button.value`** — Binds dynamic button text; `label` remains required.

**`image` / `gallery`** — `image` shows one image without layout controls; `gallery` shows a list. Previews use bounded JPEG/PNG/WebP base64 data URLs, not file paths, remote image URLs, or SVG. Each image is limited to 24000 characters in the frontend, and responses remain limited to 512 KiB.

**`repeat` / `card`** — `repeat` binds an array and declares the current item with `name`; nested references use `scope: "item"`. `card` accepts `compact: true` for compact image/action cards.

**`multi_select` / `checkbox`** — `multi_select` binds the current page's image rows, each with a string `id`, and names a selection group using `selection`. A repeated `checkbox` binds an image ID in that group. Controls select/deselect the current page or clear all selections. Selections persist across pages, are capped at 1000 items, and clear when leaving the page. An action's `arguments` can reference `{ "scope": "selection", "source": "batch", "field": "ids" }` for comma-separated IDs. The plugin must validate count, format, and existence. `clear_selection: "batch"` clears after success; failures preserve selection. Delete-all requires a plugin-wide operation, not just current-page IDs.

**`dialog` / `collapsible` / `pagination`** — Details, expandable technical information, and pagination. Pagination `name` matches the query's page parameter; `value` binds an object containing `page` and `pages`.

An action can return `{"navigate_page":"images","navigate_params":{"job_id":"task-id"}}` to open a declared page in the same plugin, useful for reports or misclassified images. Arbitrary URLs and cross-plugin navigation are rejected. `navigate_params` accepts only scalar parameters declared by the target page queries. These are stored in the current page URL rather than global plugin settings, so each browser tab keeps its own selection. Long tasks should immediately return an ID and run in the background. `poll_interval_seconds: 5` polls queries every 5 seconds (allowed 3–60, default 0 disables polling). Polling stops when leaving the page and skips busy operations; successful polling neither clears action errors nor disables action buttons. Starting an action cancels unfinished background queries to prevent old results from overwriting new data.

## Limits and lifecycle

- `webui.json` may be at most 128 KiB, and the host registration payload at most 512 KiB; out-of-bounds paths and symlinked files are rejected
- At most 20 pages per plugin; at most 200 components, 8 nesting levels, 10 queries, and 20 actions per page
- At most 30 scalar parameters per binding; at most two in-flight WebUI requests per plugin, so a page's `queries` run **in order** and the page data is replaced with the new snapshot only when all of them succeed
- API calls time out after 10 seconds, and responses may be at most 512 KiB, 12 levels deep, and 20000 elements. **A timeout does not mean the write did not happen**; implement idempotency in your own API if you need it
- If a declaration is invalid or references an unregistered API, that plugin's registration fails for this load and the reason is logged; plugins without `webui.json` are unaffected
- Pages and entries go offline when the plugin is uninstalled or disabled; browser navigation updates within 30 seconds, or refresh manually

## Verification & troubleshooting

**Verify** — put `webui.json` in the plugin directory and reload the plugin; an entry appears under "plugin extensions" in the sidebar or in the top workspace. If the page opens with data, the API bindings are correct.

**No entry visible?**

- Confirm the plugin is loaded and enabled and that the log has no registration failure for its WebUI declaration
- A `workspace` page lives in the plugin's own top workspace — do not look only in the sidebar

**Page errors or empty data?**

- Check that the API short names and `version` in `queries` / `actions` match the `@API` registration exactly
- Check that the `value` data reference's `source` is an alias declared on this page and that the `field` path exists in the return value

**Button does nothing?**

- Check that `action` points to an alias in this page's `actions` and that the parameters satisfy `parameters` types and ranges
- Dangerous actions must declare `confirmation`, or the declaration fails to register

**Uploads or new controls unsupported?**

- Check `required_capabilities` uses `file_upload` / `interactive_controls`, and deploy matching host and frontend builds
- Confirm the SDK supports `ctx.webui.claim_upload()` and the manifest declares `webui.claim_upload`; expired or already claimed tokens require uploading again
