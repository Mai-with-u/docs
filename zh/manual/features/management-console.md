---
title: 管理终端
---

# 管理终端

MaiBot 可以在运行它的本地终端中接收消息和管理指令。终端输入会通过正式消息处理链进入 MaiBot，并以“本地操作员”身份运行，因此不需要额外配置插件管理权限。

## 启用

在 `bot_config.toml` 中开启：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[debug]
enable_console_input = true
```

:::

重新启动 MaiBot 后，终端会显示 `MaiBot 管理终端`。普通文本会作为本地操作员消息进入聊天处理链，MaiBot 的回复也会直接显示在终端中。

::: warning 仅限交互式终端
管理终端需要可用的标准输入。在后台服务、无交互容器或没有终端的运行环境中，请保持关闭。
:::

## 内置指令

- **`/help`** — 显示管理终端帮助
- **`/clear <聊天名>`** — 清空指定真实聊天的 Maisaka 历史；输入 `/clear ` 后可按 Tab 补全聊天名
- **`/offline`** — 关闭当前所有适配器插件
- **`/online`** — 恢复本次运行中由 `/offline` 关闭的适配器插件
- **`/pm help`** — 查看插件、组件、配置和指令别名管理帮助
- **`exit()`** — 关闭终端输入，MaiBot 主程序继续运行
- **`Ctrl+C`** — 退出 MaiBot

终端支持 Tab 补全和上下方向键浏览本次运行的输入历史。

## 插件管理权限

管理终端创建的消息固定使用本地操作员身份，可以直接执行 `/pm` 插件生命周期指令。其他平台上的用户仍需在 `[plugin].permission` 中使用 `platform:id` 格式授权，例如 `qq:123456789`。

从 1.2.0 起，标记为操作员级别的插件命令（如 `/pm`）统一由 `has_command_permission()` 鉴权：除了 `[plugin].permission` 操作员列表，还可以为单个命令配置 `command_permissions` 放行规则（`allow_users` / `allow_chats`）。规则可在 WebUI 的 [命令管理](../webui/command-management.md) 中可视化维护，详见 [插件 Command 鉴权](../../plugin/commands.md#command-authorization)。

`/offline` 只影响适配器插件，不会关闭 MaiBot 核心；`/online` 只恢复本次运行中由 `/offline` 关闭的适配器。
