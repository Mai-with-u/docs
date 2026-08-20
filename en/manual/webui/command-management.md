---
title: Command Management
---

# Command Management

Since 1.2.0, MaiBot provides **unified management** for plugin commands: you can view all registered commands in the WebUI and configure **execution permissions** (authorization) for each command. The entry point is the **Commands** editing mode of the **Bot Config** page (sidebar "Bot Configuration" group → Bot Config).

## View All Commands

Command management lists all currently registered plugin commands at runtime:

- **Command name** and trigger pattern
- **Owning plugin** and description
- **Authorization flag** — commands marked as "operator" level require extra authorization to execute

You can **search** commands by name, description, or plugin name to quickly locate one.

## Command Authorization

A command can require **operator permission** (`operator` level). Once a command is marked as operator level, only the following users / chats can execute it:

- **Operator list** — users configured in `[plugin].permission` (`platform:id` format, e.g. `qq:123456789`)
- **Command allow rules** — per-command `allow_users` (allowed users) and `allow_chats` (allowed real chat flows)

In the command management page:

1. Select a command
2. In **Allowed Users**, add users allowed to execute it (`platform:id` format)
3. In **Allowed Chats**, select the chat flows allowed to execute it (chosen from existing chat flows)
4. After saving, the configuration is written to the `[plugin]` section of `bot_config.toml`

::: tip Permission evaluation order
A command that matches no allow rule cannot be executed by ordinary users. The logic is handled uniformly by `has_command_permission()`: first it checks whether the user is an operator, then whether a command-level allow rule matches.
:::

## Configuration File

Command permissions live in the `[plugin]` section of `bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]  # operator list

[plugin.command_permissions.example-plugin.example-command]
allow_users = ["qq:987654321"]  # extra allowed users
allow_chats = ["chat-xxxx"]     # extra allowed chat flow IDs
```

:::

## Related Docs

- [Plugin Command Component](../../plugin/commands.md) — how plugins declare commands and the operator level
- [Bot Config](../configuration/bot-config.md) — full `[plugin]` section reference
