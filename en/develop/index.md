---
title: Development Overview
---

# Development Overview

MaiBot has two integration surfaces: connect it to a chat platform, or add features to it. Both are written in Python and neither requires changing MaiBot source code.

<IntegrationRoutes />

## Route 1: connect MaiBot to a chat platform

Write an Adapter that converts platform messages into MaiBot unified format, and converts MaiBot replies back. The official adapters (OneBot Adapter, QQ official bot, Telegram, WeChat ClawBot) all work this way and can be installed as-is; start from [Adapter integration](./adapters/index.md) for a platform of your own.

**Before you start** — the platform exposes usable send/receive APIs (an official SDK, a OneBot implementation, or a private protocol library): you can receive message events and call send APIs.

**Deliverable** — a process that connects to the MaiBot message server, or a plugin with `plugin_type = "adapter"`.

## Route 2: add features to MaiBot

Write a Plugin: a directory holding `_manifest.json` and `plugin.py` is enough to load. Add a Tool for the LLM to call, a Command for slash commands, a HookHandler to rewrite messages and replies, a MessageGateway to send and receive messages, or WebUI pages to extend the console.

**Before you start** — Python 3.10+ and `maibot-plugin-sdk`.

**Deliverable** — a hot-reloadable plugin directory, optionally packaged and submitted to the plugin market.

## External agents

MaiBot can hand part of the work to an external Agent that speaks ACP (dsh and others); models and sessions stay in the external program. See [External agent connection](./agent-connections.md).

## Deployment and usage

Deployment and configuration live in the [User Manual](/en/manual/); for error triage see the [FAQ](/en/faq/).
