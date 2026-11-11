---
title: 内部聊天
---

# 内部聊天

网页聊天室和桌宠说的是同一个「主人」对话：两边共用一套身份和聊天记录，在网页里改的昵称，桌宠里立刻使用。

## 身份怎么定

::: fields
- **`platform`** — 固定为 `internal`。
- **`user_id`** — 固定为 `owner`，即你本人。
- **机器人账号** — `self`。
:::

已有对应聊天流时复用，没有则由正常会话创建链路创建。旧 `webui` 私聊保留原归属，不会自动迁移、合并不作为 `internal` 的别名读取；启动时也不会为这件事备份数据库或写入迁移任务。虚拟群聊继续使用它自己的平台和群身份。

## 昵称

发言昵称由主程序统一保存在 `data/internal_chat_profile.json`。第一次连接网页普通聊天时采用该浏览器已有的昵称，之后以服务端保存的值为准。

在输入框旁修改昵称会同步到其他网页，桌宠每次发言读取同一个昵称。虚拟身份昵称独立处理。

## 和桌宠的关系

桌宠的聊天、待办和探索都走这套 `internal / owner` 会话，所以麦麦给主人的回复在桌宠和网页里同步展示。

桌宠提交的消息保留界面来源标记，不具备受保护命令权限。主人聊天流有实际发言时桌宠会主动显示；聊天面板没展开时弹出消息气泡，点击可以查看聊天记录。

## 插件怎么接入

插件用 SDK 2.17.0 的接口查询身份和发言，不要自己计算 `session_id`：

::: fields
- **`ctx.internal_chat.identity()`** — 查询当前内部聊天身份。
- **`ctx.internal_chat.send(text)`** — 以主人身份发起一条真实聊天，可能触发麦麦回复并进入聊天历史。
:::

需要让插件在桌宠里显示提示而不触发模型调用时，用 `ctx.desktop_pet.say(text)`：它只在桌面气泡里显示文字，不进入聊天记录、学习和记忆。

## 本地 SDK 联调

需要本地 SDK 时，用环境变量指向 SDK 仓库再启动主程序：

::: code-group

```powershell [Windows PowerShell ~vscode-icons:file-type-powershell~]
$env:MAIBOT_PLUGIN_SDK_PATH = (Resolve-Path ../maibot-plugin-sdk).Path
uv run bot.py
```

```bash [Linux / macOS ~vscode-icons:file-type-shell~]
export MAIBOT_PLUGIN_SDK_PATH="$(cd ../maibot-plugin-sdk && pwd)"
uv run bot.py
```

:::

Runner 和版本校验会显式使用本地 SDK。主程序基础依赖仍兼容较低版本；使用新能力的插件 manifest 应声明要求的 SDK 版本，不满足时会报告版本不兼容。

## 验证与排错

**验证**：在网页聊天室发一句话，再到桌宠里打开聊天面板，两边应看到同一段对话；在网页里改昵称，桌宠下一条发言应当使用新昵称。

- **网页和桌宠记录对不上** — 确认两边都连在同一个 Bot 上；不同 Bot 的聊天数据相互隔离。
- **改了昵称桌宠没变** — 昵称由主程序统一保存，改动需要保存成功；检查 `data/internal_chat_profile.json` 是否被写保护。
- **旧聊天记录找不到** — 旧 `webui` 私聊不迁移也不合并，需要在新会话里重新开始。
- **插件发言没有回应** — 插件应使用 `ctx.internal_chat.send(text)`；用 `ctx.desktop_pet.say()` 只会显示桌面提示，不触发聊天。
