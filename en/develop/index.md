---
title: Development Guide
---

# Development Guide

MaiBot (Maimai / MaiSaka) is an interactive agent based on large language models. This section is for developers who want to participate in development or write plugins, introducing the project's tech stack, directory structure, and development environment setup.

## Tech Stack

| Category | Technology |
|------|------|
| Language | Python 3.10+ |
| Web Framework | FastAPI |
| ORM | SQLModel |
| ASGI Server | Uvicorn |
| Configuration Management | Pydantic + TOML + Hot Reload |
| Plugin IPC | msgpack over UDS / TCP / Named Pipe |
| Package Management | uv |
| Code Linting | Ruff |
| License | GPL-3.0 |

## Project Structure

```
MaiBot/
├── src/                    # Core source code
│   ├── config/             # Configuration management (TOML + Pydantic + Hot Reload)
│   ├── chat/               # Chat processing, flow engine, reply generation
│   ├── maisaka/             # Core AI runtime (planner, reasoning engine, tool calls)
│   ├── A_memorix/           # Long-term memory engine
│   ├── plugin_runtime/      # Plugin runtime (Host/Runner IPC architecture)
│   ├── platform_io/         # Platform abstraction layer (routing, drivers, deduplication)
│   ├── llm_models/          # LLM client implementation
│   ├── services/            # Business service layer (send service, memory flow, etc.)
│   ├── webui/               # FastAPI Web management backend
│   ├── learners/            # Expression learning and jargon mining
│   ├── emoji_system/        # Emoji management
│   ├── mcp_module/          # Model Context Protocol integration
│   ├── common/              # Shared tools (database, logs, i18n, message models)
│   ├── prompt/              # Prompt template management
│   └── core/                # Core type definitions, event bus, tool registry
├── dashboard/               # Frontend (independent repo build, do not modify)
├── plugins/                 # Third-party plugin directory
├── src/plugins/built_in/    # Built-in plugin directory
├── pytests/                 # Tests
└── data/                    # Runtime data (gitignore)
```

### Core Module Description

- **config/**: Uses Pydantic models to manage configuration, supports TOML file hot reload, configuration modifications are released through template + version number, do not directly edit runtime configuration.
- **chat/**: Chat message entry and main link scheduling. Contains `ChatBot` (message processing entry), `ChatManager` (session management), `HeartFlow` (flow message processor), etc.
- **maisaka/**: Core AI runtime. Centered on `ChatLoopService`, responsible for LLM conversation loops, tool call planning, context message management, etc.
- **A_memorix/**: Long-term memory engine, responsible for persisting user preferences, conversation memories and other psychology dimension data.
- **plugin_runtime/**: Plugin runtime system. Uses Host (main process) / Runner (subprocess) IPC architecture, uses msgpack encoding/decoding, supports Hook mechanism, component registration and hot reload.
- **platform_io/**: Platform abstraction layer. Through `RouteKey` routing mechanism implements unified management of multi-platform message sending/receiving, supports driver registration, route binding, inbound deduplication and outbound tracking.
- **llm_models/**: LLM client implementation, encapsulates calling logic of various model APIs.
- **services/**: Business service layer, contains core services like `SendService` (outbound message sending).
- **webui/**: FastAPI-driven Web management backend, provides plugin management, configuration editing, authentication and other functions, default binding `0.0.0.0:8001`.
- **core/**: Core type definitions, including `ComponentType`, `ActionInfo`, `CommandInfo`, `ToolInfo`, `MaiMessages`, etc.

## Development Environment Setup

### Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) package management tool

### Install Dependencies

```bash
uv sync
```

### Start Project

```bash
uv run python bot.py
```

`bot.py` uses Runner/Worker dual-process model: Runner process is responsible for daemon and restart (exit code 42 triggers restart), Worker process executes actual `MainSystem` initialization and task scheduling.

### Run Tests

```bash
uv run pytest
```

### Code Linting and Formatting

```bash
# Lint check
uv run ruff check .

# Auto formatting
uv run ruff format .
```

## Architecture Deep Dive

Deep dive into the internal architecture and implementation principles of each subsystem:

- [Message Pipeline](./architecture/message-pipeline.md): Complete processing flow for inbound messages — from platform adapters through Hook interception, filtering, command dispatch, HeartFlow, and outbound sending
- [Maisaka Reasoning Engine](./architecture/maisaka-reasoning.md): Core of conversational reasoning — Timing Gate rhythm control, Planner planning loop, tool calls, and interruption mechanisms
- [Memory System](./architecture/memory-system.md): A-Memorix long-term memory engine — dual-path retrieval, storage layer, memory strategies, and person profiling
- [WebUI Internals](./architecture/webui-internals.md): FastAPI backend architecture — authentication security, WebSocket communication, plugin management, and configuration hot reload

## Next Steps

- [Architecture Design](./architecture.md): Understand Runner/Worker process model and message processing pipeline
- [Contributing Guide](./contributing.md): Understand code standards and contribution process
- [Plugin Development](./plugin-dev/): Learn how to develop MaiBot plugins
- [Adapter Development](./adapter-dev/): Learn how to develop platform adapters