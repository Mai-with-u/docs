---
title: Desktop Pet
---

# Desktop Pet

The desktop pet puts Mai on your Windows desktop: it animates, speaks, chats with you, and keeps a todo list. The pet is built into the main program — no extra plugin to install.

**Requirements**: Windows 10 or later with the WebView2 Runtime installed (bundled with Win11). The pet renders in a separate child process, so chat and the web UI stay responsive.

## Enable and Disable

In the WebUI main program configuration, find "Desktop Pet" and turn on "Enable Desktop Pet"; or edit the config directly:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[desktop_pet]
enabled = true               # The window appears as soon as this is on
chat_tools_enabled = false   # Let the owner chat query other chat streams and hand off tasks
skin_id = "builtin"          # Current skin; builtin is the bundled Mai
```

:::

The settings hot-reload. Turning the switch off closes the window immediately, and the main program cleans the window up on exit — nothing lingers.

## Chatting with Mai

The pet and the web chat room share one internal chat: the platform is fixed to `internal` and the user to `owner`, so both sides see the same conversation and the same nickname. Change the nickname next to the web input box and the pet uses the new one the next time it speaks.

The chat box accepts pasted clipboard images — preview them, remove them, or send images alone. Up to 4 images per message, each at most 8 MiB and 25 megapixels; Enter sends, Shift+Enter breaks the line, and a failed send keeps the draft and shows the reason.

**Chat stream tools** — with `chat_tools_enabled` on, Mai in this owner chat can query all of your real chat streams and hand a task to the chat of your choice, waking that Mai up. The switch only affects the session shared by the pet and the web chat room; ordinary group chats never get these tools, and sending images is unaffected.

## Todos

Mai maintains her own todo list: view, add, update, and delete entries. Todos live inside the pet window process, and the desktop list refreshes as soon as one changes. A finished todo is deleted as before — no completed list is kept, and each entry holds at most 200 characters.

The todo file is shared with the old desktop pet plugin at `data/plugins/sengokucola.desktop-pet/todos.json`; existing todos carry over without migration.

## Skins

"Desktop Pet → Current Skin" lets you pick a skin, preview it, and import a ZIP; the change applies after saving. Previewing does not interrupt the running animation. Switching validates and decodes every resource first — on failure the original look stays and an error is reported.

A skin pack is purely static: a JSON description plus PNG/WebP images, no scripts executed. The ZIP may contain `skin.json` directly or one folder deep; each pack holds at most 32 MiB and 512 files, each image at most 16 megapixels, each animation at most 240 frames or 30 seconds.

::: code-group

```json [skin.json ~vscode-icons:file-type-json~]
{
  "schema_version": 1,
  "id": "author.pet",
  "name": "My Pet",
  "version": "1.0.0",
  "canvas": {
    "width": 160, "height": 160,
    "anchor": [80, 160], "bubble_anchor": [80, 0],
    "hitbox": [10, 10, 140, 150]
  },
  "animations": {
    "idle": { "file": "idle.png", "frames": 1, "fps": 1, "motion": "bob" }
  },
  "states": { "idle": "idle", "thinking": "idle", "talking": "idle", "dragging": "idle" },
  "events": { "greeting": "idle" }
}
```

:::

- **`canvas`** — 64–220 wide, 64–240 tall CSS pixels; `anchor` is the standing point and must sit within 4 pixels of the bottom
- **`animations`** — sprite sheets fill in `file`, `frame_width`, `frame_height`, `frames`, `fps`; alternatively use `sequence` with per-frame `{"file": "atlas.png", "rect": [0,0,256,256], "duration_ms": 125}`
- **`motion`** — the limited offset/scale effects the program provides: `none`, `bob`, `sway`, `hop`, `shake`, `pulse`
- **`states`** — all four continuous states must be mapped explicitly; reusing one animation is allowed
- **`events`** — optional `click`, `happy`, `error`, `greeting`

Plugins may also ship static skins: put `skin.json` under `plugins/<plugin dir>/skins/<dir>/`. Whether the plugin's code runs is independent of skin selection, and a plugin cannot switch your skin on its own.

## Plugin Extensions

Plugins can add buttons to the puzzle-icon "Plugin Extensions" menu — up to 10 per plugin. Buttons accept only an ID, label, built-in icon, and order; HTML or scripts cannot be injected. On click, the Host verifies ownership, visibility, and disabled state first.

The pet also broadcasts events to plugins: window ready, closed, clicked, drag started and ended, visibility change, and skin switch. These hooks are observation-only — handlers cannot intercept or alter pet actions. See the [Plugin API Reference](/en/plugin/api-reference) for the interfaces.

## Verification and Troubleshooting

**Verify** — after enabling, the Mai window appears on the desktop and reacts to clicks; a message sent in the web chat room shows Mai's reply on the pet as well.

**Window does not appear** — confirm the system is Windows with the WebView2 Runtime installed, then check the pet child process errors in the log. Non-Windows platforms report the lack of support explicitly.

**Window is there but frozen** — close other programs using the same skin resources and restart the main program; skins that fail validation keep the original look and report the reason in the UI.

**Todos do not refresh** — todos come from the window process; make sure the pet is running and ready — the tool returns an explicit error while the window is not ready.

**Plugin buttons missing** — plugins must declare the matching `desktop_pet.*` capabilities and have them authorized in the manifest. Buttons are removed with the registry when a plugin is disabled or uninstalled, and re-sync when the window restarts.
