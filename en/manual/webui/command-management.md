---
title: Command Management
---

# Command Management

Since 1.2.0, MaiBot provides **unified management** for plugin commands: view all registered commands in the WebUI and configure **execution permissions** (authorization) for each command. The entry point is the **命令管理** (Command Management) editing mode at the top of the **麦麦设置** (MaiBot Settings) page (sidebar "麦麦配置编辑" group → MaiBot Settings).

![Command management](/images/webui/config-bot-commands.webp)

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
2. In **放行用户** (Allowed Users), add users allowed to execute it (`platform:id` format)
3. In **放行聊天** (Allowed Chats), select the chat flows allowed to execute it (chosen from existing chat flows)
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

## Verification & Troubleshooting

**Verify**: search a command name on the command management page — it should be found with the correct authorization flag, which means the command is registered.

**Command list is empty?**

- Confirm the corresponding plugin is installed and enabled
- Plugins that don't declare a Command component won't appear in the list

**Saving allow rules failed?**

- User IDs must be in `platform:id` format
- Allowed chats can only be selected from existing chat flows

## Related Docs

- [Plugin Command Component](../../plugin/commands.md) — how plugins declare commands and the operator level
- [Bot Config](../configuration/bot-config.md) — full `[plugin]` section reference
