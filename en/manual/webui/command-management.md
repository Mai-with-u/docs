---
title: Command Management
---

# Command Management

MaiBot provides **unified management** for plugin commands: view all registered commands in the WebUI and configure their **execution permissions**. Open the **命令管理** (Command Management) tab at the top of **麦麦设置** (MaiBot Settings), under the sidebar's "配置管理" (Configuration) group.

![Command management](/images/webui/config-bot-commands.webp)

## View All Commands

Command management lists all currently registered plugin commands at runtime:

- **Command name** and trigger pattern
- **Owning plugin** and description
- **Authorization flag** — commands marked as "operator" level require extra authorization to execute
- **Disabled flag** — disabled commands show a "已停用" (Disabled) badge next to the existing "受保护 / 公开" (Protected / Public) badge

## Command Authorization

A command can require **operator permission** (`operator` level). Once a command is marked as operator level, only the following users / chats can execute it:

- **Operator list** — users configured in `[plugin].permission` (`platform:id` format, e.g. `qq:123456789`)
- **Command allow rules** — per-command `allow_users` (allowed users) and `allow_chats` (allowed real chat flows)

::: tip Permission evaluation order
A command that matches no allow rule cannot be executed by ordinary users.

## Configuration File

Command permissions live in the `[plugin]` section of `bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]  # operator list
silent_permission_denied = true  # silently block unauthorized attempts, no notice message
disabled_commands = ["example-plugin.example-command"]  # disabled command IDs

[plugin.command_permissions.example-plugin.example-command]
allow_users = ["qq:987654321"]  # extra allowed users
allow_chats = ["chat-xxxx"]     # extra allowed chat flow IDs
```

:::

## Related Docs

- [Plugin Command Component](../../plugin/commands.md) — how plugins declare commands and the operator level
- [Bot Config](../configuration/bot-config.md) — full `[plugin]` section reference
