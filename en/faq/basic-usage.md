---
title: Basic Usage
---

# Basic Usage

## Does MaiBot cost money?

MaiBot is open-source software and does not charge a software license fee. Running it usually involves LLM, vision, or embedding services, whose pricing is determined by each provider.

Usage depends on speaking frequency, context length, enabled features, and model pricing. Lowering frequency, choosing suitable models, and disabling unused features can reduce costs.

## Which model should I use?

There is no single best model. Check whether the Planner can reason and call tools reliably, whether the Replyer produces the desired writing quality, whether vision models accept images, and whether memory uses an embedding model. Also consider price, latency, stability, and regional availability.

See [Model Configuration](../manual/configuration/model-config.md). Avoid relying on a fixed model ranking that can quickly become outdated.

## Can one MaiBot serve multiple chats?

Yes. Which groups and private chats are accepted is decided centrally by the **MaiBot main program's adapter policy**; everything is allowed by default. There are two entry points:

- **WebUI** — **Adapter Settings** under the "Configuration" group in the sidebar (`/adapter-management`): the "Global default rules" card at the top sets the default action for group and private chats, and selecting an adapter opens an **Allow/deny rules** tab where you list the group / user IDs to receive or block (edits autosave);
- **Config file** — `config/adapter_policy.toml`: put fallback rules in `[defaults.group]` / `[defaults.private]` and per-instance `allow_ids` / `deny_ids` under `[[adapters]]` entries.

See [Adapter Management](../manual/webui/adapter-management.md).

## Which platforms are supported?

Platform support is provided by adapters. QQ has two routes:

- **Local client login** — install the **Unified QQ Connector** (plugin name `MaiBot-SnowLuma-Adapter`) and log in your own QQ account; one plugin supports both SnowLuma and NapCat clients;
- **Open platform bot** — install the **QQ Official Bot** adapter and apply for an AppID + AppSecret on the QQ Open Platform; no QQ client login is required.

Email, QQ Voice Call, iMessage, and other community adapters are available as well. Actual capabilities depend on the installed adapter version. See [Connect Platforms](../manual/adapters/index.md) for selection and installation.

## What should I do before first use?

Start with the smallest working configuration and verify the message path before enabling long-term memory, plugins, and advanced features. Read logs, record component versions, and avoid changing several unrelated settings at once.

## What should I include when asking for help?

Include the operating system, MaiBot version, deployment method, adapter version, complete error log, relevant configuration, and reproduction steps. Remove API keys, access tokens, cookies, and other secrets before sharing anything.

See [Getting Help](/en/faq/getting-help) for the full self-check list and the issue template.

