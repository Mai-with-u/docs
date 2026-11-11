---
title: 命令管理
---

# 命令管理

命令管理列出所有已注册的插件命令，并配置谁能执行它们。入口在「麦麦设置」页顶部的 **命令管理** 标签。

## 列表里有什么

每条命令显示名称、触发模式与所属插件。停用的命令无法执行；标记为操作员级别的命令需要授权。

## 谁能执行命令

::: fields
- **操作员列表** — `[plugin].permission` 里的用户，格式 `平台:用户ID`，例如 `qq:123456789`。这些人可以用聊天命令管理插件。
- **命令放行规则** — 单个命令的 `allow_users`（放行用户）与 `allow_chats`（放行真实聊天流）。
- **插件使用范围** — `[plugin.usage_permissions]` 按插件 ID 限制命令与工具的使用范围，不改变插件的生命周期管理权限。
:::

未匹配任何放行规则时，普通用户无法执行受保护命令。放行规则范围要小于操作员权限：前者只放开命令执行，后者包含插件管理。

## 命令提示

::: fields
- **`silent_permission_denied`** — 开启后无权限时不再发送提示消息，只静默拦截并记录日志。
- **`command_require_self_mention`** — 命令消息包含结构化 @ 时，必须提及当前接收账号；不含 @ 的命令不受影响。
:::

## 配置文件

命令权限保存在 `bot_config.toml` 的 `[plugin]` 段：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]         # 插件管理权限：可用聊天命令管理插件的用户
silent_permission_denied = false      # 开启后无权限时静默拦截，不发提示消息
command_require_self_mention = false  # 命令含结构化 @ 时必须提及当前账号
disabled_commands = []                # 停用的命令 ID，格式 plugin_id.command_name

# 单个命令的额外放行规则
[plugin.command_permissions."example-plugin.example-command"]
allow_users = ["qq:987654321"]        # 额外放行的用户
allow_chats = ["chat-xxxx"]           # 额外放行的真实聊天流 ID

# 按插件限制命令与工具的使用范围
[plugin.usage_permissions."example-plugin"]
enabled = true                        # 是否限制该插件；关闭时保留现有行为
allow_users = ["qq:987654321"]        # 放行用户，适用于命令及私聊工具
allow_chats = ["chat-xxxx"]           # 放行聊天流；群聊工具按会话鉴权
```

:::

`command_permissions`、`usage_permissions` 和 `disabled_commands` 在 WebUI 表单里不显示，由命令管理页写入。

## 验证与排错

**验证**：用一个不在操作员列表里的账号执行受保护命令，应当被拒绝；把该账号加进对应命令的 `allow_users` 后重试，应当能执行。

- **所有命令都提示无权限** — 检查 `[plugin].permission` 是否为空；为空时没有任何人是操作员。
- **加了放行规则还是不行** — 确认命令 ID 用的是 `plugin_id.command_name` 格式；内置命令写作 `core.clear`。
- **想看是哪一步被拦的** — 关闭 `silent_permission_denied`，让提示消息显出来，同时看日志里的权限判定记录。
- **插件工具也用不了** — 那是 `[plugin.usage_permissions]` 的 `enabled` 打开了，需要把用户或聊天加进对应的 `allow_users` / `allow_chats`。
