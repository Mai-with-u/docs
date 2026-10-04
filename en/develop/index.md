---
title: Development Guide
---

# Development Guide

This section is aimed at deployment operators and advanced users — keeping MaiBot running smoothly, troubleshooting issues, extending integrations, and handling data archiving and automation.

::: tip Tech Stack
MaiBot uses Python 3.12+ / FastAPI / SQLModel / structlog / Pydantic + TOML hot reload, with dependency management via `uv`. For the full project structure and technology choices, see [Configuration System](./configuration.md).
:::

## Document Index

- **Database** — SQLite + SQLModel 22 tables: connections and sessions, PRAGMA tuning, data archiving and troubleshooting. (Operations)
- **Configuration System** — version chains, hot reload mechanisms, upgrade hooks, and legacy migration for the two TOML files (bot_config + model_config). (Operations / Advanced Users)
- **Message Server** — how the WebSocket message server lets external adapters (NapCat, SnowLuma, QQ Official, Email, etc.) connect to MaiBot: authentication, message flow, and deployment notes. (Operations)
- **LLM Model Integration** — the LLM integration pipeline driven by the three concepts of APIProvider / ModelInfo / ModelTaskConfig; configure to connect. (Advanced Users)
- **MCP Integration and External Tool Access** — MCP client integration: three transport options, tool registration, naming conflict handling, and debugging. (Advanced Users)
- **WebUI HTTP API Entry** — 6 sub-articles: FastAPI backend HTTP / WebSocket API overview, covering authentication, route groups, and scene navigation. (Operations / Advanced Users)
- **Logging & Monitoring** — structlog's three parallel output channels (file / console / WebUI): log tuning, third-party noise reduction, LLM request snapshot capture, and online troubleshooting. (Operations)
- **Data Import/Export** — hourly granularity aggregation tables, real-time dashboard queries, and async zip export: three data consumption pathways. (Operations / Advanced Users)
- **Events & Hooks** — the cooperative mechanism of the EventBus and named Hook dual event systems: intercepting / non-intercepting handlers, plugin bridging, and troubleshooting perspective. (Advanced Users / Plugin Internals)
- **Runtime Architecture** — the internal mechanics of the Host / Runner dual-process IPC architecture: msgpack encoding/decoding, hot reload, and fault isolation. For operations troubleshooting, not plugin development. (Plugin Internals)

## Roadmaps

- Run the bot on a VPS → [Configuration System](./configuration.md) → [Message Server](./message-server-and-adapters.md) → [Logging & Monitoring](./observability.md)
- Build a WebUI automation panel → [WebUI HTTP API Entry](./webui-api/) → [Data Import/Export](./statistics-io.md)
- Integrate an external chat platform → [Message Server](./message-server-and-adapters.md) → [Events & Hooks](./event-pipeline-hooks.md)
- Connect an MCP Server → [Configuration System](./configuration.md) → [MCP Integration and External Tool Access](./mcp-integration.md)
- Export / migrate data → [Database](./database.md) → [Data Import/Export](./statistics-io.md)

## Extensions and Contributions

- If you need to write plugins, head to the [Plugin Development Documentation](/en/plugin/), which covers Manifest, lifecycle, component registration, and other developer-facing content.
- If you want to contribute code to the MaiBot source, see the [GitHub repository contribution guide](https://github.com/Mai-with-u/MaiBot/blob/main/docs/CONTRIBUTE.md). The `contributing.md` in this repository is no longer maintained; the GitHub repository is the canonical source.
