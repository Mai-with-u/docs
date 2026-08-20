---
title: Management Console
---

# Management Console

MaiBot can accept messages and management commands from its local terminal. Terminal input enters the regular message-processing pipeline as the built-in local operator, so no additional plugin-management permission is required.

## Enable the console

Set the following option in `bot_config.toml`:

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[debug]
enable_console_input = true
```

:::

Restart MaiBot. The terminal will display `MaiBot 管理终端`. Plain text is handled as a local-operator message, and MaiBot renders its reply in the same terminal.

::: warning Interactive terminal required
The console requires standard input. Leave it disabled for background services, non-interactive containers, and environments without a terminal.
:::

## Built-in commands

- **`/help`** — Show console help
- **`/clear <chat name>`** — Clear the Maisaka history of a real chat; press Tab after `/clear ` to complete a chat name
- **`/offline`** — Stop all currently active adapter plugins
- **`/online`** — Restore adapter plugins stopped by `/offline` during this run
- **`/pm help`** — Show plugin, component, configuration, and command-alias management help
- **`exit()`** — Close console input while keeping MaiBot running
- **`Ctrl+C`** — Exit MaiBot

The console also supports Tab completion and Up/Down history navigation for the current run.

## Plugin-management permission

Messages created by the management console use the trusted local-operator identity and may execute `/pm` lifecycle commands directly. Users on other platforms must still be authorized in `[plugin].permission` with the `platform:id` format, for example `qq:123456789`.

Since 1.2.0, plugin commands marked as operator level (such as `/pm`) are authorized uniformly by `has_command_permission()`: besides the `[plugin].permission` operator list, you can also configure `command_permissions` allow rules per command (`allow_users` / `allow_chats`). The rules can be maintained visually in the WebUI [Command Management](../webui/command-management.md); see [Plugin Command Authorization](../../plugin/commands.md#command-authorization).

`/offline` affects adapter plugins only; it does not stop the MaiBot core. `/online` restores only the adapters stopped by `/offline` during the current run.
