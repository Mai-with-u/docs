---
title: Desktop Pet
---

# Desktop Pet

The desktop pet puts MaiBot on your desktop: a window that walks, talks, and keeps todos, chatting through the same owner conversation as the web chat room. It ships inside the main program — no separate plugin needed.

## Enabling and run modes

Turn on **Enable desktop pet** (`desktop_pet.enabled`, off by default) under **Mai Settings → Desktop pet**. There are two run modes:

::: fields
- **`local`** — In-process window started and reclaimed by the main program. Windows only.
- **`remote`** — Waits for a standalone client to connect; the server can be Linux.
:::

"Remote" only means a standalone client connects — the host does not have to be on another computer. For a local connection, give the local host address, for example `http://127.0.0.1:8001`, with the real deployment port. The mode is explicit and never switches automatically on disconnect.

The config hot-reloads. Each bot connects to one desktop pet at a time.

## Connecting a standalone client

The packaged client needs no Python, Node.js, Rust, or full MaiBot install. Windows needs the WebView2 Runtime (the installer fetches it when missing), macOS uses system WKWebView, and Linux uses WebKitGTK 4.1.

::: steps

1. In the target bot's WebUI, open **Desktop pet**, enable it, and set the run mode to **Remote**. The server needs no graphical desktop.
2. In the client, enter the host WebUI address, click **Connect through WebUI**, and complete the first login in the page that opens. With several bots, then pick the target by name.
3. Public deployments use HTTPS/WSS. A reverse proxy must support WebSocket Upgrade and allow long-lived connections; the client has heartbeats and automatic reconnect.

:::

The pet has no separate password box and never writes the password into local config. Host sessions last 8 hours and can be reused within that window; after expiry or revocation the WebUI login page reappears. The host must serve `/api/host/desktop-pet/session`, which reuses host session validation and returns 401 when unauthenticated.

If a reverse proxy such as Nginx enables HTTP Basic Auth, the native WebView may separately ask for the proxy credentials, and they are not guaranteed to be remembered. The tray menu offers **Open WebUI login** and **Change connection / screen authorization**.

## Skin packs

In **Desktop pet → Current skin**, select a skin, preview it, or import a ZIP; saving the config hot-swaps it. `desktop_pet.skin_id` defaults to `builtin`. Previewing does not interrupt the pet; switching validates and decodes every resource first and keeps the original appearance with an error message on failure.

Skins are discovered in three places: program presets at `src/desktop_pet/presets/<dir>/skin.json`, instance skins at `data/desktop_pet/skins/<dir>/skin.json`, and plugin skins at `plugins/<plugin dir>/skins/<dir>/skin.json`. Duplicate IDs across sources raise a clear error, and imports never overwrite existing skins.

Packs contain only JSON and static PNG/WebP and never execute scripts. A ZIP may contain `skin.json` at the top level or nested one directory deep. Each pack is limited to 32 MiB and 512 files, each image to 16 million pixels, and each animation to 240 frames and 30 seconds.

::: code-group

```json [skin.json ~vscode-icons:file-type-json~]
{
  "schema_version": 1,
  "id": "author.pet",
  "name": "My pet",
  "version": "1.0.0",
  "canvas": {
    "width": 160, "height": 160,
    "anchor": [80, 160], "bubble_anchor": [80, 0],
    "hitbox": [10, 10, 140, 150]
  },
  "animations": {
    "idle": {"file": "idle.png", "frames": 1, "fps": 1, "motion": "bob"}
  },
  "states": {"idle": "idle", "thinking": "idle", "talking": "idle", "dragging": "idle"},
  "events": {"greeting": "idle"}
}
```

:::

::: fields
- **Canvas** — Width 64-220 and height 64-240 in CSS pixels; the anchor sits within 4 pixels of the bottom, and switching keeps the on-screen anchor fixed.
- **`hitbox`** — `[x, y, width, height]` inside the canvas.
- **`bubble_anchor`** — Vertical position of the speech bubble; the bubble is horizontally centered.
- **Sprite sheet** — Set `file`, `frame_width`, `frame_height`, `frames`, and `fps`; frames are read left to right, top to bottom.
- **Image frames** — Use a `sequence` array instead, each entry `{"file":"atlas.png","rect":[0,0,256,256],"duration_ms":125}`; omit `rect` to use the whole image.
- **`motion`** — `none`, `bob`, `sway`, `hop`, `shake`, `pulse`.
- **State mapping** — `idle`, `thinking`, `talking`, and `dragging` must all be mapped explicitly and may reuse animations; optional events are `click`, `happy`, `error`, `greeting`.
:::

## Rich chat

Paste a clipboard image into the chat box to preview it, remove it, and send it together with text; image-only messages work too. Up to four images per message, each at most 8 MiB and 25 million pixels. Enter sends, Shift+Enter inserts a newline, and a failed send keeps your draft and shows the reason.

## Todos

Todos are available once the desktop pet is enabled. Items come in two kinds:

::: fields
- **`bot`** — A todo of the bot itself; when due, it posts an internal task into the owner's real chat stream and wakes it.
- **`user`** — A reminder for the user; when due, it shows the pet window and a reminder message.
:::

::: fields
- **`due_at`** — ISO 8601 absolute date-time, ideally with a timezone; without one, server local time applies.
- **`delay_seconds`** — Seconds from save time until trigger; never combined with `due_at`.
- **Omitted time** — Keeps the original schedule; `due_at: null` cancels the timer.
- **Content** — At most 200 characters.
:::

The todo panel can add items and edit content, type, and time, using an absolute time or a number of minutes from now. It anchors to the bottom and shows the last five items; long content wraps to at most two lines and scrolls back and forth on hover or keyboard focus. Edited items carry a thin orange line with the edit time on hover, and times display in the interface's local timezone.

Due items stay in the list showing pending, triggering, triggered, or failed; checking one archives it to the completed list, where it no longer fires on time or condition. "Triggered" only means the reminder appeared or the task was queued — not that it finished. Failure details are kept, and setting a future time retries it.

Bot todos require an owner chat stream first — say something in the pet or on the web. The main program checks every second, and hiding the pet does not stop the timer. In local mode, closing the pet, quitting the main program, or sleeping prevents on-time reminders and they fire after resuming; in remote mode, bot todos keep running while the client is offline, and user reminders wait for the client to reconnect.

Memos support image attachments: press Ctrl+V in the todo input to paste clipboard images, up to four per item and 8 MiB each. Pasting only an image saves an "image memo". Attachments live in `todo_images/` under the todo data directory, and the todo JSON stores only image identifiers.

## Conditional todos

"App opened" is a separate program-detection mode: enter a process name or window-title keyword such as `code`, `Code.exe`, or `notepad`. Matching ignores case, full-width versus half-width, and a trailing `.exe`, and it is a contains check with no semantic guessing. It runs every 5 seconds while the pet is up, and an already-running app counts. The string you enter is never executed and no screen reading is required.

Natural-language conditions are judged by the bot, for example "when VS Code is on screen". On every model request in the owner's internal chat, the full todo snapshot is re-read with real IDs, revisions, conditions, times, and states, so saved content is visible even with the pet closed.

When a condition holds, the bot calls `trigger` with the real ID, current `revision`, and concrete `evidence`. The storage layer claims atomically and refuses duplicate triggers for already-triggered or stale revisions. Editing a condition returns the item to waiting — it is not a recurring reminder.

## Periodic proactive thinking

With **Periodic proactive thinking** enabled (`desktop_pet.proactive_wake_enabled`, off by default), an internal thinking event is posted to the existing owner chat stream once per interval, reusing the normal Planner, persona, context, and available tools.

::: fields
- **`proactive_wake_interval_minutes`** — Interval in minutes, default `30`, range 1-1440.
- **Prerequisite** — Say something in the pet or on the web first to establish the owner conversation.
- **Timing** — Local mode starts counting once the pet is ready and cancels when it exits; remote mode counts on the server and is not cancelled when the client goes offline.
:::

Edit the prompt **Desktop pet periodic proactive thinking** (`desktop_pet_proactive_wake`) in prompt management. A failed post logs the full error and shows the pet error state, then retries next cycle.

## Screen reading

Turn on **Allow reading the desktop** (`screen_read_enabled`, off by default) under **Desktop pet**. Local mode reads the Windows primary screen; the standalone client reads its own primary screen and respects client authorization and system permissions. Screen reading never controls mouse or keyboard.

Screenshots go to the current chat model and may include private information visible on screen; the model must support image understanding.

::: fields
- **One-off look** — Owner chat can call `desktop_pet_screen` to get the current screenshot, capture time, and dimensions. Regular group chats cannot.
- **`screen_sample_interval_seconds`** — How often frames are sampled and compared, default `2`, range 0.5-30.
- **`screen_read_interval_seconds`** — How often the change timeline is delivered, default `10`, range 2-3600.
- **`screen_change_threshold`** — Share of clearly changed pixels required, default `0.015` (1.5%).
:::

Change detection compares brightness on a 320×180 thumbnail and ignores single-pixel changes below 20/255. Up to six frames are tiled left to right, top to bottom, labeled with an index and UTC capture time at 960×572 per cell. Small text changes can be filtered out — lower the threshold to be more sensitive.

A capture or delivery failure stops continuous reading and shows the reason; restart it by hand after fixing the cause. Turning off read permission, closing the pet, or quitting the main program stops it, and a restart never resumes it automatically.

## Showing the current task

With **Show what the pet is doing** enabled (`desktop_pet.show_current_task`, off by default), stage changes in the owner's internal chat call `fast_model` for a short summary shown at the bottom of the pet.

The switch is only available when `fast_model` has its own valid model assigned and never borrows another model. Summaries are capped at 2 seconds, never wait on the main inference, and never retry; a stage change restores the placeholder and cancels the old request, and timeouts or empty summaries keep the placeholder.

## What plugins can do

Plugins control the pet through the SDK, declaring the matching capabilities in their manifest:

::: code-group

```json [_manifest.json ~vscode-icons:file-type-json~]
{
  "capabilities": [
    "desktop_pet.status", "desktop_pet.show", "desktop_pet.hide",
    "desktop_pet.say", "desktop_pet.set_thinking"
  ]
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
state = await self.ctx.desktop_pet.status()
if state["ready"]:
    await self.ctx.desktop_pet.show()
    await self.ctx.desktop_pet.set_thinking(True)
    try:
        await self.ctx.desktop_pet.say("Your todos are tidied up")
    finally:
        await self.ctx.desktop_pet.set_thinking(False)
```

:::

::: fields
- **`status()`** — Returns `enabled`, `supported`, `running`, `ready`, `visible`, and `error`.
- **`show()` / `hide()`** — Show or hide the started window; hiding does not exit the process.
- **`say(text)`** — Shows a 1-2000 character plain-text bubble that never enters chat history, learning, or memory.
- **`set_thinking(active)`** — Starts or ends the thinking animation; chat replies also drive it.
:::

Every control call returns the current state and only resolves after the window acknowledges; not-ready, window failure, and communication timeout raise errors. `status()` works even when the pet is off or unsupported. A starting window may report `running=True` with `ready=False`, so plugins should skip the hint or query again later.

Plugins cannot inject JavaScript, HTML, or native window code. `show()` never bypasses the user's switch, and `say()` on a hidden pet never reveals the window.

Plugin buttons all appear in the pet's puzzle-piece **Plugin extensions** menu, at most ten buttons per plugin.

## Verify and troubleshoot

**Verify** — Enable the desktop pet and restart the bot in local mode; the window appears. Say something in web chat and the pet shows the reply. Switch to **Remote** and have the client enter the host address and log in — it shows the same pet.

- **No pet window** — Confirm `desktop_pet.enabled` is on. Local mode is Windows-only; use a remote client elsewhere.
- **Remote client cannot connect** — Check that the run mode is Remote, the address and port are reachable, and the reverse proxy supports WebSocket Upgrade with long-lived connections.
- **Login page keeps reappearing** — Host sessions last 8 hours and are invalidated on expiry or auth state changes; log in again.
- **Todos do not fire on time** — Local mode cannot fire while the pet is closed or the machine sleeps and catches up afterwards; bot todos need an owner chat stream first.
- **Skin switch fails** — Switching validates and decodes everything first and keeps the old appearance on failure; check that `skin.json` maps all four states and that IDs are not duplicated across sources.
- **Screen reading stops by itself** — A capture or delivery failure stops it with a reason; restart by hand. Turning off read permission or restarting never resumes it automatically.
