---
title: 命令管理
---

# 命令管理

从 1.2.0 起，MaiBot 对插件命令提供**统一管理**：你可以在 WebUI 中查看所有已注册的命令，并为命令配置**执行权限**（鉴权）。入口位于 **Bot 配置**页面（侧边栏"机器人配置"分组 → Bot 配置）的 **命令** 编辑模式。

## 查看所有命令

命令管理会列出当前运行时所有已注册的插件命令：

- **命令名称** 与触发模式
- **所属插件** 与描述
- **鉴权标记** — 标记为"操作员"级别的命令需要额外授权才能执行

支持按名称、描述或插件名**搜索**命令，快速定位目标。

## 命令鉴权

命令可以要求**操作员权限**（`operator` 级别）。一个命令被标记为操作员级别后，只有以下用户 / 聊天可以执行它：

- **操作员列表** — `[plugin].permission` 中配置的用户（`platform:id` 格式，如 `qq:123456789`）
- **命令放行规则** — 为该命令单独配置的 `allow_users`（允许执行的用户）与 `allow_chats`（允许执行的真实聊天流）

在命令管理页中：

1. 选中一个命令
2. 在 **放行用户** 中添加允许执行该命令的用户（`platform:id` 格式）
3. 在 **放行聊天** 中选择允许执行该命令的聊天流（从已存在的聊天流中选择）
4. 保存后，配置写入 `bot_config.toml` 的 `[plugin]` 段

::: tip 权限判定顺序
未匹配任何放行规则的命令，普通用户无法执行。判定逻辑由 `has_command_permission()` 统一处理：先看用户是否为操作员，再看命令级放行规则是否命中。
:::

## 配置文件

命令权限保存在 `bot_config.toml` 的 `[plugin]` 段：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]  # 操作员列表

[plugin.command_permissions.example-plugin.example-command]
allow_users = ["qq:987654321"]  # 额外放行的用户
allow_chats = ["chat-xxxx"]     # 额外放行的聊天流 ID
```

:::

## 相关文档

- [插件 Command 组件](../../plugin/commands.md) — 插件侧如何声明命令与操作员级别
- [Bot 配置](../configuration/bot-config.md) — `[plugin]` 段完整配置说明
