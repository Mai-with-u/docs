---
title: Editing Config in the Browser
---

# Editing Config in the Browser

**Mai Settings** (`/config/bot`) turns every section of `bot_config.toml` into a form: changes save automatically, and you can also save by hand, edit the raw file, or manage sharing groups.

## Three ways to edit

The top tabs switch between **Detailed settings** and **Command management**; the `⋮` menu adds two more:

::: fields
- **Detailed settings** — Sectioned forms covering every section of `bot_config.toml`. Hover an option to read its description.
- **Command management** — Plugin commands and execution permissions; see [Command management](./command-management.md).
- **Sharing groups** — Group several chat streams so they share expressions, slang, or long-term memory.
- **Source editing** — Edit the raw `bot_config.toml`, for people comfortable with TOML.
:::

Changes save automatically; for manual control use **Save manually** in the `⋮` menu, whose status shows "saving / auto-saving / saved".

## Pinning frequent sections

Section tabs in detailed settings can be pinned: use the pin button next to a tab to keep frequently used sections in front.

On phone widths the sections become a horizontally scrollable row of pills.

## Sharing groups

Sharing groups bundle several chat streams so they share one set of learned results:

::: fields
- **Expression groups** — Written to `expression_groups`.
- **Slang groups** — Written to `jargon_groups`.
- **Memory groups** — Written to `a_memorix.shared_memory_groups`.
:::

With `a_memorix.global_memory_sharing_enabled` on, memory groups become read-only on the page.

## Model management

**Model management** (`/config/model`) covers providers, models, and task assignment:

::: fields
- **Model settings** — Pick a provider on the left, then edit the API URL, key, and model list on the right; **Test connection** verifies it.
- **Task assignment** — Map thinking, reply, vision, and other tasks to specific models, with each model's most recent call shown.
- **Config copies** — Save the current config as a copy and manage history for rollback.
:::

Providers, models, and web services maintained under **Common settings** are shared by every bot; each bot only selects its own task models. See [Multiple bots](../multi-bot-host.md).

### Time-of-day pricing

A model's **Time-of-day pricing** bills by time windows each day:

- Set a start and end time (`HH:MM`, server local time) plus input, output, and cache prices (CNY per M tokens).
- An end earlier than the start means the window crosses midnight.
- Windows are billed start-inclusive and end-exclusive; the default price applies when nothing matches. Windows cannot overlap, and start and end must differ.

### Thinking switch

The **Enable thinking** switch in the model dialog follows the provider template:

::: fields
- **`thinking.type`** — Zhipu, Kimi, MiniMax, Doubao, and others; can be turned on or off, and off writes `disabled`.
- **`enable_thinking`** — Bailian, SiliconFlow, and others.
- **`reasoning_effort`** — StepFun, OpenAI, xAI and other reasoning models; thinking is always on and only the effort level changes.
:::

Parameter names, effort levels, and thinking budgets are covered in [Model extra parameters](../configuration/model-extra-params.md).

## When changes take effect

Most settings hot-reload after saving, and model changes apply to subsequent requests. A host restart is required for listen addresses and ports, the whole `[maim_message]` section, `[plugin_runtime]` binding and IPC settings, the `[log]` event-loop watchdog, and the network and login settings in `host/config.toml`.

To tell: after saving, check the log for a successful config reload message; for startup-time settings such as listen addresses, restart the host.

## Verify and troubleshoot

**Verify** — Change an option under **Detailed settings**, wait for "saved", then check the log for a successful reload message. Behavior should follow the new value immediately.

- **Saving fails** — Read the error on the page; the backend names the offending field for invalid values. You can also syntax-check first: `python -c "import tomllib; tomllib.load(open('config/bot_config.toml','rb'))"`.
- **A change has no effect** — Compare against "When changes take effect": listen addresses and ports, `[maim_message]`, `[plugin_runtime]`, and the watchdog need a host restart.
- **Sharing groups do nothing** — Memory groups are read-only while `a_memorix.global_memory_sharing_enabled` is on; turn the global switch off first.
- **Forms look wrong after source editing** — The raw file broke the structure; roll back with the pre-save state or a saved config copy.
