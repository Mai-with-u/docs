---
title: Events & Hooks
---

# Events & Hooks

MaiBot has two event systems working together: the **EventBus** (a publish/subscribe model based on `EventType`) and **named Hooks** (a plugin dispatch model based on `HookDispatcher`). This page explains what they are, how they cooperate, and how to diagnose issues from an ops and power-user perspective.

[[toc]]

## Two lines, one goal

The two systems serve different purposes but converge at key points.

**EventBus** is the internal "message routing bus" of the main program. The main program triggers events via `event_bus.emit()` at critical nodes: startup, incoming messages, LLM responses, outgoing messages, etc. Handlers registered on the EventBus execute in weight order and fall into two categories: intercepting (can abort the pipeline) and non-intercepting (fire-and-forget). EventBus also bridges events into the plugin runtime, so plugins can receive these lifecycle signals.

**Named Hooks** live inside the plugin runtime. The main program triggers a named hook via `invoke_hook("chat.receive.before_process", ...)`. The Host side collects all plugin handlers subscribed to that hook, sorts them by a uniform rule, then executes `blocking` handlers serially and `observe` handlers concurrently.

The two intersect at the tail end of `EventBus.emit()`: after intercepting handlers finish, EventBus calls `_bridge_to_ipc_runtime()` to push the event into the plugin runtime, where plugin `@EventHandler` handlers are invoked. Named hooks, by contrast, are triggered earlier in the business flow and do not share a queue with EventBus directly.

## EventBus and EventType reference

### 11 event types

EventBus uses the `EventType` enum to define a fixed set of event points. Each event occupies a distinct position in the message processing pipeline.

**`ON_START`** — Fired when the main program finishes starting up. No message body. Used for one-time work like plugin initialization and scheduled task registration. Emitted by `main.py`.

**`ON_STOP`** — Fired before the main program shuts down. No message body. Used for plugin cleanup and state persistence. Emitted by the WebUI shutdown route and `main.py`.

**`ON_MESSAGE_PRE_PROCESS`** — Fired after an inbound message arrives, before formal preprocessing. At this point the message has not yet gone through `SessionMessage.process()` lightweight preprocessing. Suitable for raw format checks, filtering, or logging.

**`ON_MESSAGE`** — Fired after preprocessing completes. The message has been parsed into `MaiMessages` but has not yet entered command matching or the conversation pipeline. This is the most common entry point for plugins to intercept content.

**`ON_PLAN`** — Fired before the Planner begins execution. The system has already decided whether to enter a conversation, carrying the current session context.

**`POST_LLM`** — Fired after the LLM returns a raw response, before downstream processing (expression selection, sending, etc.) begins. You can modify the LLM output, append tool call results, or inject custom logic here.

**`AFTER_LLM`** — Fired after post-processing (expression selection, emoji matching, etc.) completes, just before the send phase. At this point the reply text and expressions are finalized but can still be intercepted and rewritten.

**`POST_SEND_PRE_PROCESS`** — Fired after `SendService` constructs the outbound message but before the actual platform IO call. You can perform final modifications to the message body or cancel sending.

**`POST_SEND`** — Fired after a message is successfully sent. Used for post-send logging, statistics, downstream actions, etc.

**`AFTER_SEND`** — Fired after sending completes and all cleanup work finishes. Used for end-of-round processing for the entire message cycle.

**`UNKNOWN`** — A reserved event type for compatibility or custom events. Not currently used in the main line.

### Subscription and weight

Registering a handler requires four elements:

**`event_type`** — Target `EventType` enum value.

**`handler`** — An `async` callable with signature `(Optional[MaiMessages]) -> (bool, Optional[MaiMessages])`.

**`weight`** — Weight, type `int`. Higher values execute first. Defaults to `0`.

**`intercept`** — Whether this is an intercepting handler, type `bool`. Defaults to `False`.

When multiple handlers subscribe to the same event, they are sorted by `weight` in descending order. `EventBus.subscribe()` sorts automatically at registration time; no manual ordering is needed.

### intercept vs fire-and-forget: a complete emit flow

Here is how intercepting and non-intercepting handlers differ in behavior.

**Intercepting (`intercept=True`)**

- Execute serially, one by one in descending weight order
- Each handler receives the current message object and may return a modified message
- Returning `(False, ...)` aborts the pipeline; subsequent handlers do not run
- If aborted partway, all non-intercepting handlers and the IPC bridge are skipped

**Non-intercepting (`intercept=False`)**

- Launched as background tasks via `asyncio.create_task()`, executing concurrently
- Each handler receives a `deepcopy` of the current message, isolating side effects
- Return values are ignored and do not affect the main pipeline
- Suitable for logging, statistics, passive observation, etc. — anything that does not modify the message

A single `emit()` call proceeds as follows:

1. Sort all handlers by weight, split into intercepting and non-intercepting groups
2. Execute intercepting handlers sequentially; any returning `continue_flag=False` causes immediate abort
3. If not aborted, launch each non-intercepting handler as a background task (fire-and-forget)
4. Bridge to the IPC plugin runtime, dispatching the event to plugin `@EventHandler` handlers
5. Return the final `(continue_flag, modified_message)`

> Plugin `@EventHandler` corresponds to the EventBus system. To learn how plugins subscribe to EventType, see [Event Handlers](/en/plugin/event-handlers).

## Named Hooks: the plugin dispatch center

Named hooks are not part of EventBus. They are the plugin runtime's internal dispatch system, implemented via `HookDispatcher`. The main program does not trigger hooks through EventBus; instead it calls `invoke_hook()` directly.

### blocking vs observe

Each hook handler declares its mode:

**`blocking`** — Blocking mode. Executes serially. Can modify `kwargs`. Can return `action: "abort"` to cancel the entire hook call chain. Suitable for scenarios that need to rewrite messages or intercept pipelines.

**`observe`** — Observation mode. Runs concurrently in the background. `kwargs` is a snapshot copy taken at invocation time. Returned `modified_kwargs` and `abort` requests are ignored. Suitable for logging, monitoring, data collection, and other scenarios that do not affect the main pipeline.

The core distinction is semantically similar to EventBus's intercept vs non-intercept, but there are important implementation differences: named hook `modified_kwargs` is a dict merge rather than a message object replacement, and `observe` handlers are explicitly forbidden from aborting the chain.

### Dispatch order: five-level sorting

In a single hook invocation, all handlers subscribed to that hook are ordered by the following five-level sorting keys:

1. **Mode** — `blocking` before `observe` (rank `0 < 1`)
2. **Order slot** — `early` before `normal` before `late` (rank `0 < 1 < 2`)
3. **Plugin source** — built-in plugins before third-party plugins (rank `0 < 1`)
4. **Plugin ID** — sorted by `plugin_id` string
5. **Handler name** — sorted by `name` string

This means a "built-in plugin's blocking + early handler" will inevitably execute before all third-party plugins' observe handlers. The order is predictable and debuggable.

### Timeout control

Each hook has an independent `default_timeout_ms`. Handlers can also set `timeout_ms` individually. If a handler does not return before the timeout, the framework applies the handler's `error_policy`: `abort` cancels the chain, `skip` continues past it, `log` only records a log entry.

## HookHandler return format

A plugin's `@HookHandler` method must return a `dict` or nothing (`None` is treated as `{"action": "continue"}`).

The return structure contains four fields:

**`action`** — Control action. Takes `"continue"` (continue executing subsequent handlers) or `"abort"` (cancel the current hook call chain). Defaults to `"continue"`. Only effective in `blocking` mode.

**`success`** — Whether the call succeeded, `bool`. Does not affect dispatch logic; used only for logging and debugging.

**`modified_kwargs`** — Modified `kwargs` dictionary, `dict` or `None`. The framework shallow-merges this dict into the current `kwargs`, so subsequent handlers receive updated parameters. Only effective in `blocking` mode.

**`custom_result`** — Additional result, any type. Returned to the caller along with `HookDispatchResult.custom_results` list. Available in both modes.

Return examples:

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# blocking handler: rewrite message text, then continue
return {
    "action": "continue",
    "success": True,
    "modified_kwargs": {
        "message": {"processed_text": "[Filtered] " + original_text}
    },
}

# blocking handler: abort hook chain
return {
    "action": "abort",
    "success": True,
}

# observe handler: log, do not modify
return {
    "action": "continue",
    "success": True,
}
```

:::

## Common hook names

The following are built-in hook names registered by the main program, grouped by functional domain. For complete parameter schemas, see the corresponding `register_*_hook_specs` functions in the source code.

### Chat message chain (chat)

**`chat.receive.before_process`** — Before `SessionMessage.process()` on an inbound message. Can intercept or rewrite the raw message.

**`chat.receive.after_process`** — After the inbound message completes lightweight preprocessing. Can rewrite text or abort subsequent chains.

**`chat.command.before_execute`** — After a command match succeeds, before execution. Can intercept the command or rewrite context.

**`chat.command.after_execute`** — After command execution ends. Can adjust the return text and whether to continue the main chain.

### Emoji system (emoji)

**`emoji.maisaka.before_select`** — Before the Maisaka emoji sending tool selects an emoji. Can rewrite emotion, context, and sampling parameters, or abort this selection.

**`emoji.maisaka.after_select`** — After an emoji has been selected. Can replace the emoji hash, supplement matched emotions, or abort sending.

### Jargon mining (jargon)

**`jargon.extract.before_persist`** — Before jargon entries are written to the database. Can rewrite the deduplicated entry list or skip persistence.

**`jargon.inference.before_finalize`** — After jargon meaning inference completes, before writing back to the database. Can rewrite the final verdict and meaning.

### Expression (expression)

**`expression.select.before_select`** — Before the expression selection pipeline starts. Can rewrite session context, selection parameters, or abort selection.

**`expression.select.after_selection`** — After expression selection completes. Can rewrite the final selected expression list and IDs.

### Maisaka reasoning (maisaka)

**`maisaka.planner.before_request`** — Before sending a planning request to the model. Can rewrite the message window and tool definitions.

**`maisaka.planner.after_response`** — After receiving the model's planning response. Can adjust the text result and tool call list.

**`maisaka.replyer.before_request`** — Before sending a reply request to the model. Can rewrite the reply prompt and parameters.

**`maisaka.replyer.after_response`** — After receiving the model's reply response. Can adjust the reply text.

### Send service (send_service)

**`send_service.after_build_message`** — After the outbound SessionMessage is constructed. Can rewrite the message body or cancel sending.

**`send_service.before_send`** — Right before the actual Platform IO send call. Can rewrite the message or cancel sending.

> The registration source for the hooks above is `src/plugin_runtime/hook_catalog.py` (aggregator). Each domain's register functions are spread across corresponding submodules. For plugin development, see [Hook Handlers](/en/plugin/hooks).

## Ops diagnostics

### How "slow hooks" bog down the system

Named hook `blocking` handlers are **serially blocking**. Suppose the `maisaka.planner.before_request` hook has 5 blocking handlers, each taking 200ms. The delay from hook trigger to the actual LLM call is then at least 1 second. That 1 second is **purely additive** on top of the LLM request latency.

A subtler problem is `observe` handlers. Although they run concurrently in the background, if an observe handler contains synchronous blocking operations (e.g., disk IO without aiofile), they will occupy the event loop and indirectly block other tasks on the same event loop.

EventBus intercepting handlers work the same way — they are serial. An intercepting handler registered on `ON_MESSAGE` with very high weight that takes 3 seconds will make all subsequent handlers (both intercepting and non-intercepting) wait 3 seconds.

### What you can do as an operator

The starting point for diagnosing hook latency is the **hook name in the logs**. When users report "replies are slow," use the following approach to isolate the issue.

**Step 1: Identify potentially involved hooks**

Observe timestamps around `invoke_hook` or `bridge_event` in the logs. If a hook name repeatedly appears near noticeable time gaps, it's the prime suspect. Pay attention to these high-risk hooks:

- `chat.receive.before_process` / `chat.receive.after_process` — Every message passes through them; any slow handler affects overall responsiveness
- `maisaka.planner.before_request` — Fires before every LLM call; latency adds directly
- `send_service.before_send` — Fires before every reply is sent; affects the "thinking completed to message delivered" gap

**Step 2: Trace to the plugin**

Once you have a suspicious hook name, cross-reference with the installed plugin list on the [Plugin Configuration & Management](/en/plugin/) page. The hook name prefix usually corresponds to a functional domain (`chat`, `emoji`, `maisaka`, etc.), and combined with the plugin ID you can roughly infer which plugin registered the handler.

Alternatively, inspect the `plugin_id` field in hook execution result logs. `HookDispatcher` records a `HookHandlerExecutionResult` after each handler executes, which explicitly includes `plugin_id` and elapsed time.

**Step 3: Temporary measures**

- If a plugin's blocking handler is clearly slowing things down, disable that plugin in the WebUI plugin management page and observe the effect
- Adjusting plugin execution order at the code level isn't feasible (the order is uniformly managed by the framework), but if the problem is an observe handler doing heavyweight work it shouldn't, report it to the plugin author
- Check the `plugin_runtime.hook_blocking_timeout_sec` config item (default 60s). If a hook timeout is set too long, a timed-out handler will block the entire chain until the timeout expires

**Step 4: Investigate the EventBus side**

Although named hooks are the primary system, EventBus intercepting handlers can also cause global latency. Open `src/core/event_bus.py` and trace the `_bridge_to_ipc_runtime` logic (starting at line 173) to see which events take abnormally long during the bridge phase.

### Performance baseline reference

In a normally running MaiBot, the blocking latency of most hook calls should be **under 100ms**. The following figures are for reference (excluding LLM call time itself):

- `chat.receive.*` hooks: typically < 10ms (message preprocessing is very lightweight)
- `maisaka.planner.before_request` hook: typically < 50ms (mainly prompt rewriting)
- `expression.select.*` hooks: typically < 30ms
- `send_service.*` hooks: typically < 20ms

If logs show a hook's blocking latency exceeding **500ms**, strongly recommend investigating that plugin's logic.

### Related documentation

- [Runtime Architecture](/en/develop/plugin-runtime-internals) — Plugin runtime Host/Runner architecture
- [Hook Handlers](/en/plugin/hooks) — Hook usage guide from a plugin developer's perspective
- [Event Handlers](/en/plugin/event-handlers) — EventHandler usage guide from a plugin developer's perspective
