---
title: 聊天与回复
---

# 聊天与回复

这页解决聊天表现问题：麦麦回不回、话多话少、回复变慢、只处理一条消息。

## 麦麦怎么决定要不要回复？

一条新消息先过防抖合并，再由 Planner 判断是否回应、回复谁、调哪些工具。

影响回复倾向的开关：

- **`[chat.reply_timing].talk_value`** — 群聊发言频率，0 最安静，1 按正常频率。
- **`[chat.reply_timing].inevitable_at_reply`** — 被 @ 时尽量回复，默认开启。
- **`[chat.reply_timing].mentioned_bot_reply`** — 消息提到名字时更容易回复。
- **`no_action_backoff_*`** — 连续几次不回复后自动放慢检查节奏，来新消息会提前唤醒。

改完观察一段时间再决定下一步，不要一次调好几个值。

## 麦麦话太多或话太少怎么办？

按范围从大到小调：

**整体频率** — 调 `[chat.reply_timing].talk_value`，0.3~0.5 明显话少。

**单个群或时段** — 用动态发言规则组。当前生效的组由 `[chat.reply_timing.talk_rule_groups].active_group` 指定，组内规则按平台、群号、时段匹配：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing.talk_rule_groups]
active_group = "夜间"    # 当前生效的规则组，默认是"默认"组

[[chat.reply_timing.talk_rule_groups.groups]]
name = "夜间"

[[chat.reply_timing.talk_rule_groups.groups.rules]]
platform = "qq"          # 留空 = 不限定平台
item_id = "123456"       # 留空 = 不限定聊天
rule_type = "group"      # group 群聊 / private 私聊
time = "23:00-02:00"     # 留空为兜底，"*" 表示全天
value = 0.3              # 这个群这个时段更安静
```

:::

规则组可以在 WebUI 里创建、复制、切换，单条规则也能单独关闭。没命中任何规则的聊天回落到 `talk_value`。

**提醒层面** — 人格里的 `behavior_style` 和群聊提示词 `[chat.reply_style].group_chat_prompt` 也会影响 Planner 对「该不该说话」的判断。

## 机器人为什么回复自己的消息？

先确认适配器是否把机器人自己发出的消息又当成入站消息送回来，并检查适配器里填的机器人 QQ 号是否正确。

再检查插件是否拦截并重发了消息、`[message_receive]` 的过滤规则、以及发言频率设置。链路正常但 Planner 仍然反复回复自己时，换一个 Planner 模型对比一次；不要只凭这个现象断定模型有质量问题。

## 连续发多条消息，为什么只处理了前一条？

默认会被防抖合并成一批一起送进 Planner。合并窗口的长短由 `[chat.reply_timing].message_debounce_mode`（群聊）和 `private_message_debounce_mode`（私聊）决定，四个档位：

- **`off`** — 不合并，沿用原有等待逻辑。
- **`fast`** — 安静 1 秒、活跃 3 秒，响应最快，容易漏接分段补充。
- **`natural`** — 默认档，安静 2 秒、活跃 5 秒。
- **`steady`** — 安静 4 秒、活跃 7 秒，给补充消息留更多时间。

想要消息一到就打断当前思考并重新推理，开 `[chat.reply_timing].planner_message_steering`（快速反应模式，只作用于群聊）。

## 回复很慢怎么办？

先从日志区分时间花在哪：模型请求、工具调用、图片识别、适配器发送，还是 Planner 的等待动作。

常见原因按影响排序：

- `max_context_size` / `max_private_context_size` 太大，每轮塞进去的消息过多。
- 模型本身响应慢，或服务商排队。
- 开了「超长工具结果整理」（`[capabilities].tool_result_condense`）会多一次模型请求。
- 插件 Hook 阻塞，看 `[plugin_runtime].hook_blocking_timeout_sec` 附近有没有告警。

必须等上一轮结束才处理新消息时，开快速反应模式。

## 回复为什么变成「懒得说」这类很短的文本？

先看模型原始输出，分清是模型自己生成的短文本，还是后处理砍出来的。启用了回复分割时，检查 `[response_splitter]` 的 `max_sentence_num`、`max_split_num` 和 `enable_overflow_return_all`。

关掉分割后问题还在，就继续看人格、群聊提示词和所用模型。

::: info 内容来源
本页部分现象和排查思路来自社区协作文档[《麦麦教程-常见问题速查/社区教程》](https://www.kdocs.cn/l/ctOGhVv6L8Yq)，其中「机器人回复自己」相关经验原文署名千石可乐。本站已按当前消息链路和配置重写。
:::
