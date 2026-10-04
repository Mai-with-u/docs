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

Yes. The adapter's chat filters determine which groups and private chats are accepted. In allowlist mode only listed chats are processed; in blocklist mode listed chats are ignored.

## Which platforms are supported?

Platform support is provided by adapters. This documentation includes NapCat, SnowLuma, QQ Official, QQBot, Email, QQ Voice Call, and iMessage adapters. Actual capabilities depend on the installed adapter version.

## What should I do before first use?

Start with the smallest working configuration and verify the message path before enabling long-term memory, plugins, and advanced features. Read logs, record component versions, and avoid changing several unrelated settings at once.

## What should I include when asking for help?

Include the operating system, MaiBot version, deployment method, adapter version, complete error log, relevant configuration, and reproduction steps. Remove API keys, access tokens, cookies, and other secrets before sharing anything.

