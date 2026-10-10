---
title: 命令管理
---

# 命令管理

MaiBot 对插件命令提供**统一管理**：在 WebUI 中查看所有已注册的命令，并为命令配置**执行权限**。入口在「麦麦设置」页（侧边栏「配置管理」分组 → 麦麦设置）顶部的 **命令管理** 标签。

![命令管理](/images/webui/config-bot-commands.webp)

## 查看所有命令

列表显示已注册命令的名称、触发模式与所属插件。操作员级别的命令需要授权；停用的命令无法执行。

## 命令鉴权

命令可以要求**操作员权限**（`operator` 级别）。一个命令被标记为操作员级别后，只有以下用户 / 聊天可以执行它：

- **操作员列表** — `[plugin].permission` 中配置的用户（`platform:id` 格式，如 `qq:123456789`）
- **命令放行规则** — 为该命令单独配置的 `allow_users`（允许执行的用户）与 `allow_chats`（允许执行的真实聊天流）

::: tip 权限判定顺序
未匹配任何放行规则的命令，普通用户无法执行。
:::

## 配置文件

命令权限保存在 `bot_config.toml` 的 `[plugin]` 段：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]  # 操作员列表
silent_permission_denied = true  # 无权限时静默拦截，不回提示消息
disabled_commands = ["example-plugin.example-command"]  # 已停用的命令 ID

[plugin.command_permissions.example-plugin.example-command]
allow_users = ["qq:987654321"]  # 额外放行的用户
allow_chats = ["chat-xxxx"]     # 额外放行的聊天流 ID
```

:::


## 相关文档

- [插件 Command 组件](../../plugin/commands.md) — 插件侧如何声明命令与操作员级别
- [Bot 配置](../configuration/bot-config.md) — `[plugin]` 段完整配置说明
