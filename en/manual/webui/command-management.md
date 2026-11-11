---
title: Command Management
---

# Command Management

Command management lists every registered plugin command and configures who may run them. Open it from the **Command management** tab at the top of **Mai Settings**.

## What the list shows

Each command shows its name, trigger mode, and owning plugin. Disabled commands cannot run, and commands marked operator-level require authorization.

## Who can run commands

::: fields
- **Operator list** — Users in `[plugin].permission`, formatted `platform:user-id`, for example `qq:123456789`. These people can manage plugins with chat commands.
- **Command allow rules** — Per-command `allow_users` and `allow_chats` (real chat stream IDs).
- **Plugin usage scope** — `[plugin.usage_permissions]` limits a plugin's commands and tools by plugin ID without changing plugin lifecycle management rights.
:::

When nothing matches, regular users cannot run protected commands. Allow rules are narrower than operator permission: the former only permits command execution, the latter includes plugin management.

## Command notices

::: fields
- **`silent_permission_denied`** — When on, a permission denial sends no message; it is blocked silently and logged.
- **`command_require_self_mention`** — A command message containing structured @ mentions must mention the current receiving account; commands without @ are unaffected.
:::

## Config file

Command permissions live in the `[plugin]` section of `bot_config.toml`:

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]         # Plugin management permission: users who may manage plugins via chat commands
silent_permission_denied = false      # When on, deny silently without a notice message
command_require_self_mention = false  # Commands with a structured @ must mention this account
disabled_commands = []                # Disabled command IDs, formatted plugin_id.command_name

# Extra allow rules for one command
[plugin.command_permissions."example-plugin.example-command"]
allow_users = ["qq:987654321"]        # Extra allowed users
allow_chats = ["chat-xxxx"]           # Extra allowed real chat stream IDs

# Limit a plugin's commands and tools
[plugin.usage_permissions."example-plugin"]
enabled = true                        # Whether to restrict the plugin; off keeps current behavior
allow_users = ["qq:987654321"]        # Allowed users for commands and private tools
allow_chats = ["chat-xxxx"]           # Allowed chat streams; group tools authorize per session
```

:::

`command_permissions`, `usage_permissions`, and `disabled_commands` are hidden in the WebUI forms and written by the command management page.

## Verify and troubleshoot

**Verify** — Run a protected command from an account not in the operator list; it should be refused. Add that account to the command's `allow_users` and retry; it should run.

- **Every command reports no permission** — Check whether `[plugin].permission` is empty; nobody is an operator when it is.
- **An allow rule does not help** — Confirm the command ID uses `plugin_id.command_name`, with built-in commands written like `core.clear`.
- **You want to see where it was blocked** — Turn off `silent_permission_denied` so notices appear, and read the permission decisions in the log.
- **Plugin tools are also blocked** — That is `[plugin.usage_permissions].enabled`; add the user or chat to the matching `allow_users` / `allow_chats`.
