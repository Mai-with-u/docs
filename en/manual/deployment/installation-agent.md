---
title: AI-Assisted Install
---

# AI-Assisted Install

**Hand one prompt to an AI assistant and let it clone, install, configure, and start MaiBot for you.** You only answer a few questions and click a couple of things in the WebUI when asked; if you want to see what each step does first, follow along with [Windows Deployment](./windows) or [Linux Deployment](./linux).

## Give the Prompt to an AI

Copy the sentence below into the AI assistant you already use (Claude, GPT, Gemini, and so on):

::: info Prompt

> Please help me install MaiBot, following the guide here:
>
> https://docs.mai-mai.org/installation-agent.md

:::

> **Running this program indicates that you agree to the [MaiBot End User License Agreement (EULA)](../../about/EULA).**

The prompt itself is a plain-text guide hosted on the documentation site (currently written in Chinese). It is updated together with MaiBot, so sending the link is enough—no need to copy the full text.

## What the AI Will Walk You Through

1. **Ask two things** — your operating system, and whether you want QQ connected. There are two QQ routes: the **Unified QQ Connector** (log in your own QQ account, recommended) or the **QQ Official Bot** (AppID + AppSecret, no client login needed);
2. **Check the environment** — at least 2 GB of RAM and 2 GB of free disk space; Git, Python 3.12+, and uv are installed first if missing;
3. **Clone and start** — pull the [MaiBot repository](https://github.com/Mai-with-u/MaiBot), install dependencies with uv, then start the program;
4. **Connect QQ** (optional) — install the adapter for the chosen route, fill in the connection details, and set the allow scope;
5. **Verify** — send a message in the WebUI or on QQ and confirm Mai can reply.

The install and start commands are the same ones used in the deployment docs:

::: code-group

```bash [Install dependencies ~vscode-icons:file-type-python~]
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
uv sync
```

:::

::: code-group

```bash [Start MaiBot ~vscode-icons:file-type-shell~]
uv run bot.py
```

:::

On first start, type **同意** (agree) in the terminal to accept the user agreement; the terminal then prints the WebUI login Token (also stored in `data/webui.json`). Open http://127.0.0.1:8001/, paste the Token, and follow the setup wizard to configure at least one LLM model.

## Two Routes to QQ

- **SnowLuma QQ Connector** — repository `MaiBot-SnowLuma-Adapter`. Log in a bot alt account with a SnowLuma or NapCat client and enable its forward WebSocket server. See [SnowLuma QQ Connector](../adapters/qq-local-client.md) for the full steps;

Both routes need an **allow scope**: inbound access is controlled by MaiBot's adapter policy, which allows everything by default. Configure it in the WebUI under "配置管理 → 适配器设置" (Adapter Settings, `/adapter-management`) or in `config/adapter_policy.toml`. To serve only specific groups, write:

::: code-group

```toml [adapter_policy.toml ~vscode-icons:file-type-toml~]
[[adapters]]
platform = "qq"            # platform only: applies to every account on it

[adapters.group]
default_action = "block"   # reject by default
allow_ids = ["test-group"] # only these groups are allowed
```

:::

See [Access Policy and Account Routing](/en/develop/adapters/policy) for all fields. Allow one test group and one test user first, then widen the scope once sending and receiving work.

## Verify and Troubleshoot

**Verify**: after handing the prompt to an AI, its installation steps no longer mention the standalone NapCat / SnowLuma adapters; once you follow them, you can chat with Mai in the WebUI, and if QQ is connected, @-mentioning Mai in an allowed group (or messaging the official bot) gets a reply.

**`uv: command not found`?**

- Run `source $HOME/.local/bin/env` to refresh the environment, or open a new terminal

**The adapter cannot connect to the QQ client?**

- Check the `[client]` section of `plugins/MaiBot-SnowLuma-Adapter/config.toml`: `server` and `port` must match the client's forward WebSocket listener (default `127.0.0.1:3001`), and `token` must match when authentication is enabled
- Make sure the client is logged in with the forward WebSocket service enabled, and always start the client before MaiBot

**No response when Mai is @-mentioned in a group?**

- First check whether the adapter policy allows that group: WebUI "Adapter Settings" or `config/adapter_policy.toml`—this is the first place to look when nothing happens
- Then confirm `bot.qq_account` in `config/bot_config.toml` matches the QQ account logged in by the client exactly, and that the sender is not on the adapter's user blocklist
