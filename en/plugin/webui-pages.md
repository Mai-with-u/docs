---
title: WebUI Pages
---

Add `webui.json` to your plugin directory to expose data and actions in the WebUI. Use predefined components for simple pages and write HTML/CSS/JS for complex interfaces. Both modes call static `@API` methods owned by the plugin.

This page describes the in-development `schema_version: 2` protocol and requires matching host and dashboard builds. Updating the Python SDK alone does not update the page protocol. A plugin can mix both modes:

::: fields
- **`declarative` components** — Overviews, simple settings, and single-row table actions. The plugin declares components, data, and business APIs; the host manages appearance, forms, query refresh, confirmation, and details.
- **`custom` HTML** — Galleries, batch editors, complex state, and custom layouts. The plugin provides a single HTML file and manages interaction and refresh; the host provides the isolated frame, API bridge, confirmation, and image reception.
:::

Use HTML for loops, multiple selection, dragging, complex dialogs, or specialized layouts. The host does not recognize plugin IDs, business fields, or private CSS classes. Both modes share identity checks, API bindings, argument validation, concurrency limits, and error handling.

## Registration and navigation

Reload the plugin after changing its declaration. The Runner reads files in a worker thread, and the Host independently validates and stores a snapshot. Unloading revokes its endpoints immediately; browser entries follow registry refreshes, including manual refresh.

Deploy matching host and dashboard builds. For local development, build `dashboard` in the MaiBot source repository and set `MAIBOT_WEBUI_USE_LOCAL_DASHBOARD=1` before startup to use `dashboard/dist`. Source edits do not update the installed `maibot-dashboard` package. The frontend development server uses port 7999.

- Use `schema_version: 2`. Version 1 declarations are rejected explicitly; removed components and fields are not converted.
- `required_capabilities` accepts `declarative_basic`, `custom_pages`, `image_upload`, and `structured_arguments`. The last three are required when using HTML, image uploads, and array/object parameters respectively. The registry reports server capabilities and the dashboard checks its own support. An unsupported extension does not block other extensions.
- `placement: "sidebar"` adds an entry to the MaiBot workspace. `"workspace"` creates a plugin workspace and requires `workspace_title`; its workspace pages appear in that workspace's sidebar.
- Icons are limited to `puzzle`, `chart`, `settings`, `database`, and `list`. The host generates `/extensions/{plugin_id}/{page_id}`; plugins cannot override built-in routes.
- Entries can be hidden and reordered in plugin management. Browser display preferences do not grant backend permissions.
- Invalid plugin configuration can still be repaired through host configuration management, while business components and plugin pages remain inactive.

Each plugin may declare up to 20 pages; `webui.json` is limited to 128 KiB. Unknown fields, invalid references, and type errors reject the declaration. The host's `WebUIExtension.model_json_schema()` provides the full JSON Schema.

## Shared API protocol

Each page maps local aliases in `queries` and `actions` to static APIs belonging to the same plugin. The API must be enabled and match the exact registered version. Dynamic APIs, cross-plugin calls, and arbitrary URLs are unavailable. `public=True` does not grant WebUI access, and a page API does not need to be public to other plugins.

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "api": "save_limit",
  "version": "1",
  "parameters": {
    "limit": {"type": "integer", "required": true, "minimum": 1, "maximum": 1000}
  },
  "confirmation": "确认保存？"
}
```

:::

- `version` defaults to `"1"`. Parameters are optional unless declared required. Unknown or missing required arguments fail validation. Values are not coerced; `null` differs from an omitted argument.
- Scalar types are `string`, `integer`, `number`, and `boolean`. Constraints include `max_length` (default 4000, maximum 65536), `minimum`, `maximum`, and `choices`.
- HTML bindings also support `array` (required `items`, default/maximum `max_items` of 1000) and `object` (`properties` declares fixed fields and each field's `required` flag). Objects reject undeclared fields.
- A binding accepts at most 30 parameters. Arguments must be finite JSON, limited to 64 KiB of UTF-8, depth 12, and 20000 elements. Non-finite numbers, file objects, and class instances are rejected.
- Results follow the same JSON rules with a 512 KiB limit. A successful HTTP response is `{"success":true,"result":...}`; browser helpers return the plugin's `result` directly.
- **Business results are opaque to the host.** Fields such as `result.success`, `message`, and `navigate_page` do not trigger host errors, messages, or navigation. Raise an exception for a failed API call, or handle a business result in HTML. Declarative pages do not interpret business results.
- Only actions accept `confirmation`. The host displays it and the backend requires `confirmed`. Confirmation prevents accidental actions; it does not replace authorization. Queries must remain read-only.
- Each plugin has at most two active WebUI API calls with a 10-second execution budget. Start long work in the background, return a task ID, and query its status. The host does not automatically retry writes; cancellation or timeout does not roll back submitted work.

A structured parameter can be declared as follows:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "type": "object",
  "required": true,
  "properties": {
    "ids": {"type": "array", "required": true, "max_items": 100, "items": {"type": "integer"}},
    "enabled": {"type": "boolean", "required": true}
  }
}
```

:::

## Predefined components

This complete `webui.json` expects `summary` to return `{"count":123}` and `save_limit` to accept integer `limit`:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "schema_version": 2,
  "workspace_title": "统计",
  "pages": [{
    "id": "overview", "title": "统计概览", "placement": "workspace", "mode": "declarative",
    "queries": {"summary": {"api": "summary"}},
    "actions": {
      "save": {
        "api": "save_limit",
        "parameters": {"limit": {"type": "integer", "required": true, "minimum": 1, "maximum": 1000}},
        "confirmation": "确认保存统计上限？"
      }
    },
    "content": [
      {"type": "stat", "label": "今日消息", "value": {"source": "summary", "field": "count"}},
      {"type": "input", "name": "limit", "label": "上限", "value": 100},
      {"type": "button", "label": "保存", "action": "save"}
    ]
  }]
}
```

:::

Declarative bindings accept scalar parameters only. Input names map to parameter names, and unfilled `null` values are omitted. Display references use `{"source":"queryAlias","field":"totals.count"}`; an empty field selects the entire result. Expressions and scripts are unavailable.

::: fields
- **`stack`, `card`** — Vertical layout or a themed card. Fields: `children`, optional `label`.
- **`grid`** — One to four columns, a single column on mobile. Fields: `children`, `columns`.
- **`tabs`** — Every child requires a `label`. Field: `children`.
- **`collapsible`** — Collapsed by default. Fields: `label`, `children`, `default_open`.
- **`text`** — Plain text; `format: "log"` provides a read-only, scrollable, selectable log field using the host input theme. Fields: `value`, `format`.
- **`stat`** — A scalar statistic. Fields: `label`, `value`.
- **`progress`** — A finite number from 0 to 100 or a reference. Field: `value`.
- **`image`** — A referenced JPEG/PNG/WebP base64 data URL up to 24000 characters. `null` means no image. Field: `value`.
- **`table`** — An object array, 50 rows per page. Fields: a `value` reference and `columns` containing `{field,label}`.
- **`dialog`** — Table row details only, declared at the top level of content. Fields: `name`, `label`, `children`.
- **`chart`** — Line or bar chart, up to 2000 rows; scalar x and numeric y. Fields: a `value` reference, `x`, `y`, `chart_type`.
- **`pagination`** — References `{page,pages,total}`; page/pages start at 1. Updates its named input. Fields: `name`, a `value` reference.
- **`input`** — Numeric input when the default value is numeric; otherwise text. Fields: `name`, `value`.
- **`date`** — A date string input. Fields: `name`, `value`.
- **`select`** — Standard dropdown with `{label,value}` options and non-empty string option values. Fields: `name`, `value`, `options`.
- **`switch`** — Boolean input. Fields: `name`, `value`.
- **`button`** — A fixed label and action; primary/danger/muted variants. A danger action requires confirmation. Fields: `label`, `action`, `variant`.
:::

Components accept only their defined fields, without style, className, or HTML slots. Each page is limited to 200 components and depth 8; a container has at most 50 children.

Opening or manually refreshing a page runs queries sequentially and replaces the data snapshot only after every query succeeds. Successful actions trigger another refresh. `auto_refresh: true` queries when an input changes and resets other pagination inputs to 1. `poll_interval_seconds` is 3–60, or 0 to disable polling. Background polling leaves actions available; writes cancel obsolete queries, and leaving the page stops polling. Errors are displayed without fabricated default data.

### Single-row actions

Set `selection: "record"` on a table to select one row. Adding `detail: "details"` opens the top-level dialog named details. A selection reference is `{"scope":"selection","source":"record","field":"id"}`. Unselected rows resolve to null; missing query fields are errors.

An action's `arguments` maps declared parameters to scalar query/selection projections:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "api": "remove_record",
  "parameters": {"id": {"type": "integer", "required": true}},
  "arguments": {"id": {"scope": "selection", "source": "record", "field": "id"}},
  "confirmation": "确认删除这条记录？"
}
```

:::

Arguments are frozen for confirmation. Replacing a query snapshot or completing a write clears selection and closes details, even if the subsequent refresh fails. Queries do not accept `arguments`.

All components support `when`; inputs and buttons also support `disabled_when`. The shape is `{"reference":...,"operator":"truthy|empty|not_empty|equals","expected":...}`, with expected allowed only for equals. A button's `disabled_reason` explains a matching disabled condition. Conditions read existing data without evaluation expressions.

## HTML pages

Ship a UTF-8 single-file HTML document. Plain HTML/CSS/JS works directly; React/Vue projects must be built ahead of time with scripts, styles, and images inlined. Installing the plugin does not require Node. Inline and blob scripts are supported; CDN resources, relative resource files, eval, and direct networking are unavailable.

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "schema_version": 2,
  "required_capabilities": ["custom_pages"],
  "pages": [{
    "id": "studio", "title": "工作台", "mode": "custom",
    "entry": "webui/index.html", "layout": "document",
    "queries": {"summary": {"api": "summary"}},
    "actions": {
      "save": {
        "api": "save_limit",
        "parameters": {"limit": {"type": "integer", "required": true}},
        "confirmation": "确认保存？"
      }
    }
  }]
}
```

:::

`entry` must be a relative `.html` path inside the plugin, without traversal, symlinks, or junctions. Do not provide the internal document field in `webui.json`. Each HTML file is limited to 2 MiB, all HTML files together to 8 MiB, and registration metadata separately to 512 KiB.

HTML pages do not declare content, auto_refresh, poll_interval_seconds, or component arguments references. The page's script owns interaction and refresh:

::: code-group

```html [webui/index.html ~vscode-icons:file-type-html~]
<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><style>body { padding: 24px; }</style></head>
<body class="maibot-page">
  <p id="count"></p>
  <input class="maibot-input" id="limit" type="number" value="100">
  <button class="maibot-button" id="save">保存</button>
  <p id="message" role="status"></p>
  <script type="module">
    const message = document.querySelector('#message');
    async function refresh() {
      const summary = await maibot.query('summary');
      document.querySelector('#count').textContent = `消息数：${summary.count}`;
    }
    await maibot.ready;
    try { await refresh(); } catch (error) { message.textContent = error.message; }
    document.querySelector('#save').onclick = async event => {
      event.target.disabled = true;
      try {
        await maibot.action('save', {limit: Number(document.querySelector('#limit').value)});
        message.textContent = '已保存';
        await refresh();
      } catch (error) { message.textContent = error.message; }
      finally { event.target.disabled = false; }
    };
  </script>
</body>
</html>
```

:::

The host injects `window.maibot` before plugin scripts:

::: fields
- **`ready`** — Bridge initialization Promise returning the initial theme/language context.
- **`query(alias, args?)`** — Calls this page's query and returns its result.
- **`action(alias, args?)`** — Calls this page's action after host confirmation when declared.
- **`upload(alias, file, args?, options?)`** — Uploads one image. Options support signal and onProgress(percent); returns the receiving API's result.
- **`navigate(pageId, state?)`** — Explicitly navigates to a declared page of the same plugin. URLs and plugin IDs are not accepted.
- **`page`** — `{id, layout, state}` after initialization.
- **`context`** — `{theme, language, dashboardStyle, styles}`. Updates dispatch a maibot:context event.
:::

Navigation state is a JSON object up to 4 KiB, stored in the URL's state parameter. Do not put secrets in it. HTML interprets maibot.page.state; declarative pages accept scalar initial values for declared inputs only. Navigation does not read API results or modify plugin-global settings.

The default `layout: "document"` expands to the body height and uses outer scrolling, up to 30000 px. Use natural document flow and avoid 100vh causing repeated growth. `layout: "viewport"` provides a fixed viewport for SPAs, editors, and complex tools with internal scrolling. The visible region is exposed through --maibot-viewport-top and --maibot-viewport-height. Invalid layout reports stop the page explicitly.

“Reload page” rereads HTML through the Runner. The Host validates the complete document set, byte limits, and full extension before atomically replacing its snapshot and rebuilding the current iframe. Failure retains the previous snapshot and displays the error. This does not reload the entire dashboard, unload the plugin, or interrupt background work. Declaration/API changes still require a plugin reload.

### Optional theme appearance

The SDK synchronizes the dark class, color-scheme, language, and data-dashboard-style, and supplies host theme variables and public CSS. Host DOM, React instances, and login credentials are not shared. Use your own styles or opt into these classes:

- maibot-page, maibot-card, maibot-card-header, maibot-muted, maibot-inset.
- maibot-button, optionally maibot-button-primary or maibot-button-danger; aria-pressed="true" marks selection.
- maibot-input, maibot-select, maibot-badge, maibot-table, maibot-number.
- --maibot-background, --maibot-surface, --maibot-foreground, --maibot-muted, --maibot-soft, --maibot-border, --maibot-primary, --maibot-primary-foreground, --maibot-danger, --maibot-radius, --maibot-font-body, --maibot-font-display, --maibot-font-mono.

Public styles recognize only maibot-* classes; the plugin implements behavior. Updates are coalesced to an animation frame and unchanged content is not resent. Fixed host font assets are transferred as data fonts, up to 2 MiB each. There is no arbitrary resource proxy.

### Image uploads

Declare image_upload and configure uploads on an HTML page. The protocol accepts images only:

::: code-group

```json [JSON ~vscode-icons:file-type-json~]
{
  "actions": {
    "add": {
      "api": "receive_image",
      "parameters": {
        "upload_id": {"type": "string", "required": true},
        "label": {"type": "string"}
      },
      "confirmation": "确认接收这张图片？"
    }
  },
  "uploads": {"library": {"action": "add", "image_max_edge": 4000}}
}
```

:::

After selecting a file, call:

::: code-group

```javascript [上传与取消 ~vscode-icons:file-type-js~]
const controller = new AbortController();
try {
  const result = await maibot.upload('library', file, {label: 'sample'}, {
    signal: controller.signal,
    onProgress: percent => console.log(percent),
  });
  console.log(result);
} catch (error) {
  console.error(error.message);
}
// 将取消按钮的点击事件绑定到 controller.abort()。
```

:::

The alias library resolves to the action in the declaration. Uploads can require confirmation; arguments are copied before confirmation, and API state and arguments are checked before file processing and again before invocation.

Declare `webui.claim_upload` in `_manifest.json` capabilities and use an SDK that provides `ctx.webui.claim_upload()` (2.11.0+). WebUI required_capabilities checks frontend features; manifest capabilities authorizes Python SDK calls. These are separate checks.

Add this receiving method to a MaiBotPlugin subclass with its lifecycle methods already implemented:

::: code-group

```python [plugin.py ~vscode-icons:file-type-python~]
from maibot_sdk import API


@API("receive_image", version="1")
async def receive_image(self, upload_id: str, label: str = ""):
    upload = await self.ctx.webui.claim_upload(upload_id)
    # upload 为 {path, sha256, upload_id}，path 在本插件 data_dir/uploads 内。
    # 在此执行业务校验、持久保存或删除；阻塞处理放进工作线程。
    return {"received": True, "label": label}
```

:::

Authenticated multipart POST uses `/api/webui/plugins/runtime/webui/{plugin}/{page}/uploads/{alias}` with file, args (JSON), and confirmed fields. The host issues a 64-character upload_id and rejects client-supplied IDs. `ctx.webui.claim_upload(upload_id)` claims it once into the plugin's data_dir/uploads. File bytes do not travel through JSON/RPC.

- Only static JPEG/PNG/WebP, at most 20 MiB and 40 million decoded pixels. Validation decodes the content; clients cannot choose storage paths.
- With image_max_edge, the browser accepts source images up to 64 MiB / 100 million pixels and resizes a copy. Otherwise the source limit is 20 MiB. Server validation still applies and the local original is unchanged.
- Authentication and binding checks precede multipart parsing. From reception through decoding, staging, and API invocation, limits are two uploads per plugin and four globally. Excess requests receive 429 without queueing. Requests have a 120-second budget and actual received bytes are bounded.
- Cancelling does not release a slot while its worker thread is still decoding or writing; the slot is released after that work completes.
- Unclaimed images are limited to eight per plugin and 32 globally, at most 160/640 MiB respectively. Excess staging receives 429. Tokens expire after one hour; cleanup runs every minute and during staging. Claimed files belong to the plugin.
- The SDK offers progress and cancellation. HTML owns batch queues, retry policy, and business messages.

## Security and failure boundaries

HTML runs in an iframe with sandbox="allow-scripts" and an opaque origin, without same-origin, top-level navigation, popup, form, or download permissions. Host CSP precedes plugin content and blocks direct networking, network subresources, nested frames, workers, and object embedding, while allowing inline scripts/styles and restricted data/blob resources. Plugin markup cannot relax the preceding policy.

The parent accepts a nonce handshake only from the current iframe and transfers a dedicated MessagePort. The bridge is fixed to this plugin and page; the backend still checks login, ownership, and static API state. Documents are fetched as JSON with no-store/nosniff, without exposing a plugin static directory or executing HTML in the host origin.

Each page allows two active bridge requests, a burst of 20 messages and a sustained rate of two per second; layout messages have their own limit. Flooding stops the page. Budgets are 10 seconds for initialization, 45 for confirmation, 60 for SDK queries/actions, and 150 for SDK uploads. Leaving, unloading, declaration changes, or “Stop page” removes the iframe, closes the bridge, and cancels browser requests. A navigated frame does not receive another bridge. Failures are reported without downgrading to old APIs.

These controls protect the host origin and API permissions; they do not fully isolate malicious plugins. A frame can still navigate itself and send a network request before its subsequent load causes removal. Arbitrary JavaScript loops or memory exhaustion may affect the browser tab. Python plugin processes are not OS sandboxes. CSP and the stop button do not provide complete data-loss prevention or resource isolation.

## Declaration migration

schema_version describes the WebUI declaration format, independently of manifest_version, the SDK version, and each API's version. Version 1 first appeared in the [3507afcf commit](https://github.com/Mai-with-u/MaiBot/commit/3507afcf6e8351664810868be59340cbaf4deb2e) on October 3, 2026 as `schema_version: Literal[1] = 1`. Version 2 described here accompanies the separation of page responsibilities and shared protocol changes.

Update the host, dashboard, and plugin declaration together. Version 1 declarations receive a migration error; changing the number alone does not restore removed components.

1. Set schema_version to 2 and choose declarative/custom. Replace file_upload with image_upload and remove interactive_controls. Declare structured_arguments when using array/object parameters.
2. Remove repeat/item contexts, gallery, upload, checkbox, multi-selection, cross-page selection, clear_selection, button.detail, dynamic button.value, select.presentation, and old component-specific fields from declarative pages. Keep basic layouts, single-row details, and scalar forms; move complex UI to HTML.
3. Remove content, component-style arguments, auto_refresh, and poll_interval_seconds from HTML pages. Manage behavior in script and select document/viewport layout as appropriate.
4. result.success=false no longer triggers a host exception; raise in the API or interpret results in HTML. Replace implicit navigate_page/navigate_params behavior with maibot.navigate(pageId, state).
5. Use uploads aliases and correctly typed business arguments. Leave upload_id for the host to inject. Host confirmation is supported.

There are no compatibility branches or dedicated APIs for old plugin names, business results, or invalid declarations.

## Verification and troubleshooting

Reload the plugin and open its page. Declarative pages should display query data; HTML should complete maibot.ready and call a query. Cancel a confirmation and verify that the API was not invoked. Edit HTML and use “Reload page” to recreate only that page instance.

- **Declaration rejected** — Read the field error in the log. Check schema_version, required_capabilities, and fields belonging to the chosen mode; remove obsolete fields and reload the plugin.
- **API unavailable or arguments invalid** — Verify same-plugin ownership, static @API registration, exact version, required parameters, types, and nested properties. Keep queries read-only.
- **Blank HTML or initialization timeout** — Check entry and UTF-8 content, with all scripts/styles inlined. CSP blocks CDN resources, relative resources, and eval. Use viewport for full-screen or very long interfaces.
- **Upload rejected or token expired** — Check image_upload, manifest webui.claim_upload, SDK availability, and image size/format. A 429 indicates exhausted capacity; claim staged images or wait for expiry cleanup. Do not automatically retry writes.
- **Changes not visible** — HTML changes use “Reload page”; declaration/API changes require a plugin reload. Use matching host/dashboard builds and enable local dashboard output with MAIBOT_WEBUI_USE_LOCAL_DASHBOARD.
