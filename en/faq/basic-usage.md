---
title: Basic Usage
---

# Basic Usage

This page answers first-use questions: whether it costs money, which model to pick, how many bots one instance runs, which platforms are supported, and what to do first.

## Does MaiBot cost money?

The MaiBot program itself is free and open source. Running it calls LLM, vision, or embedding services, and those providers set the price.

Cost depends on speaking frequency, context length, enabled features, and model pricing. Lower the frequency, pick cheaper models, and switch off features you do not use.

## Which model should I pick?

Pick by task, not by benchmark ranking:

- **Planner** — Needs reliable reasoning and tool calling; it decides when Mai speaks and which tool runs.
- **Replyer** — Decides the wording of the final reply. Choose one whose writing style fits.
- **Vision model** — Must accept image input; used for image understanding and emoji analysis.
- **Embedding** — Long-term memory semantic search depends on it. Without one, memory search stops working.

Task-by-task guidance lives in [Model Configuration](../manual/configuration/model-config.md).

## Can one MaiBot run several bots?

Yes. A workspace can register multiple bots. Each bot is its own process and directory with independent config, data, and plugins, while WebUI shares one entry point and one login.

Create, start, and stop bots from the Bot management page in WebUI, or from the CLI:

::: code-group

```bash [Multiple bots ~vscode-icons:file-type-shell~]
maibot host list --directory <workspace>                    # List registered bots
maibot host create-bot --directory <workspace> --name helper # Create a bot
maibot host start --directory <workspace> --bot-id <bot_id>  # Start and mark as desired-running
```

:::

Three things to watch: all bots share one Python environment; a cloned bot inherits the same platform accounts, so change them before starting; providers and API keys are maintained once under common settings, while task models stay per bot. See [Multiple bots](../manual/multi-bot-host.md).

## Can one MaiBot serve several chats?

Yes. Which groups and private chats are accepted is decided centrally by the adapter policy of the main program, and everything is allowed by default. Two entry points:

- **WebUI** — "Configuration → Adapter settings" (`/adapter-management`). The global default rules card sets the default action for groups and private chats; select an adapter and fill group / user IDs under the allow-deny tab. Edits save automatically.
- **Config file** — `config/adapter_policy.toml`. Fallback rules live in `[defaults.group]` / `[defaults.private]`; each `[[adapters]]` entry sets `allow_ids` / `deny_ids`.

See [Adapter Management](../manual/webui/adapter-management.md).

## Which platforms are supported?

Support depends on the adapters you install:

- **QQ local client** — OneBot Adapter. Log in your own QQ account; it supports NapCat and other OneBot v11 implementations.
- **QQ official bot** — QQ Open Platform bot adapter. Apply for AppID + AppSecret and connect directly; no QQ client login needed.
- **Built-in adapters** — Telegram and WeChat ClawBot, ready without installing extra plugins.
- **Community adapters** — Email, iMessage, QQ voice call.

See [Connect Platforms](../manual/adapters/index.md).

## What should I do on first run?

Get the smallest path working first: one LLM provider, one model that replies, and one adapter, verified by receiving a reply in a group. Then enable long-term memory, plugins, and the desktop pet one at a time.

Change one category of settings per round and verify before moving on, so failures stay traceable.

## What should I include when asking for help?

Operating system, MaiBot version, deployment method (source / Docker / uv / one-key package), adapter and plugin versions, the complete error log, relevant configuration, and reproduction steps.

Remove API keys, access tokens, and cookies before posting. The full checklist is in [Getting Help](./getting-help.md).
