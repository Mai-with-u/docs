# ❓ 常见问题（FAQ）

本页汇总部署、配置与日常使用中最常见的问题，并给出建议排查步骤。若需更细节的说明，可在对应功能页找到深入文档。

---

## 1. 麦麦不说话 / 说话频率异常

**Q：为什么麦麦不回复消息？**请检查：

1. `config/bot_config.toml` 的 `[chat].talk_value` 是否被设置得过低。
2. `talk_value_rules` 是否命中了当前时段导致降为 0。
3. `plan_style` 是否要求“少说话”，可适度放宽。
4. 是否启用了"仅 @ 必回"：`mentioned_bot_reply = true` 时，只要有人 @ 才会强制回复。

**Q：提及必回没有生效？**
确保群的 `@麦麦` 格式正确，并确认 `mentioned_bot_reply = true`、`at_bot_inevitable_reply` 大于 0。如果仍未生效，可在日志中搜索 `planner` 输出确认是否检测到提及事件。

---

## 2. 数据与隐私

**Q：聊天记录、记忆数据存在哪里？**
默认使用 `data/maibot.db`（Peewee SQLite）存储，包括黑话、记忆、表情、插件数据等。若需迁移或清理，可停机后备份/替换该文件。

**Q：如何确保数据合规？**
请在部署前阅读[使用许可条款](../other/EULA.md)。若所在环境对日志/记忆存储有要求，可关闭不必要的模块（如 `[memory]`、`[emoji].steal_emoji`），或定期在数据库层执行清理脚本。

---

## 3. API 配额与限速

**Q：频繁出现 429 或余额不足？**

- 检查 `model_task_config` 是否选择了速率更高的模型；可为高频任务（如表达学习、黑话推断）选择 `utils_small` 减少 token。
- 调整 `[chat].planner_size`、`[expression].learning_list` 的 `learning_intensity`，降低高频调用。
- 在 `.env` 中配置多个 API Key（若服务商支持）并开启轮询。

---

## 4. 个性与表达

**Q：人格配置太长会怎样？**
`personality` 建议控制在 100~150 字，过长会占用上下文导致回复拖泥带水。可以把差异化设定拆到 `states`、`plan_style`、`reply_style` 等字段，在具体场景再切换。

**Q：表达学习里老梗不更新？**
查看 `data/` 下的 `expression` 数据，可手动删除冷门表达，或降低 `learning_intensity` 让学习频率下降。必要时可重置 `Expression` 表重新积累。

---

## 5. 常见自定义需求

**Q：想让麦麦更“话痨”/更“社恐”？**围绕以下三处调整：

- `[chat].talk_value` 与 `talk_value_rules` 控制总体频率。
- `[personality].plan_style` 决定触发规则，可加入“看到热闹就插嘴”等指令。
- 表达学习的 `use_expression`/`enable_learning` 用于控制语言风格多样性。

**Q：需要多语言输出？**
在 `reply_style` 中明确语言要求，或按群配置 `experimental.chat_prompts`（如：“这是一个英语群，请用英文回复”）。同时注意 emoji/字符集在不同平台的兼容性。

---

## 6. 平台特定问题

若遇到的问题与操作系统相关，请参考对应的平台 FAQ：

- **[Windows 常见问题](./windows.md)** – 针对 Windows 系统特有的部署、权限、依赖等问题。
- **[Linux 常见问题](./linux.md)** – 针对 Linux 系统特有的虚拟环境、编译工具、防火墙等问题。
- **[macOS 常见问题](./macos.md)** – 针对 macOS 特有的安全提示、端口占用、Xcode 工具等问题。

---

如以上内容未覆盖你的问题，欢迎在 Issue、群组或插件市场反馈，我们会持续完善 FAQ。欢迎也补充自己的排障经验，帮助后续用户更快上手。***
