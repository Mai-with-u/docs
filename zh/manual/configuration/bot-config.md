---
title: Bot 配置
titleTemplate: :title · 配置
---

# Bot 配置

麦麦的所有主设置都写在 `config/bot_config.toml` 一个文件里：机器人身份、人设、聊天行为、记忆、表情、日志、WebUI、MCP、插件运行时。首次启动 MaiBot 后文件自动生成，之后由程序负责升级——**你只管改值，不要手动新增不存在的字段**。所有字段都带默认值，**保持默认就能直接运行**，只改你确实想调整的部分即可。

::: tip 不想改文件？
所有配置都能在 WebUI 里点点鼠标完成（默认 `http://127.0.0.1:8001`），效果与编辑文件一致。见 [WebUI 配置管理](/manual/webui/config-management)。
:::

保存文件后大多数设置**热重载**立即生效；改 `[maim_message]`、`[webui]` 的监听地址或端口、`[mcp]` 服务器连接、`[plugin_runtime]` 的 IPC、`[log]` 的事件循环看门狗、`[debug]` 的终端输入与强制插件兼容时需要重启 MaiBot。完整规则见 [配置概览](./index.md#改了会立即生效吗)。

## 快速上手

刚装好麦麦，绝大多数需求只用到下面 6 处。每段都给完整可复制的配置，按行尾注释修改即可。

### 告诉麦麦它是谁

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[bot]
platform = "qq"           # 备用主平台：适配器没有上报身份时使用，如 qq
qq_account = "123456789"  # 备用 QQ 账号：适配器没有上报 QQ 身份时使用
nickname = "麦麦"          # 麦麦显示和自称的名字
alias_names = ["小麦"]     # 别人可能用来称呼麦麦的名字，辅助识别提及
platforms = []            # 其他平台的备用账号，格式 platform:账号
```

:::

::: warning qq_account 要和适配器登录的 QQ 一致
用 NapCat 这类适配器接入时，`qq_account` 必须与适配器登录的 QQ 号完全一致，否则麦麦会把自己的消息当成别人的。适配器正常上报身份时这两个字段只是备用值，但保持一致永远是对的。详见 [NapCat 适配器](../adapters/napcat.md)。
:::

### 捏人设

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[personality]
personality = "是一个大二女大学生，现在正在上网和群友聊天。善于用人类的角度思考问题，聊天偏日常。"
behavior_style = "不会没话题硬找话题：群里聊到感兴趣的内容再插话，冷场时安静旁观，不刷屏。"
reply_style = "你的风格平淡简短，可以参考贴吧的回复风格。不滥用比喻或者生硬句子。视情况省略主语或者进行倒装，风格较为随意。"
multiple_reply_style = [
  "你的风格平淡但不失讽刺，很简短，很白话。可以参考贴吧，微博的回复风格。",
  "用1-2个字进行回复",
  "用1-2个符号进行回复",
]
multiple_probability = 0  # 按概率随机换成上面的备用风格；0 = 不换
```

:::

三段各管一件事：

- **`personality`** — 她是谁、什么性格。写 1~2 句即可，太长反而稀释效果
- **`behavior_style`** — 行动准则：什么时候参与聊天、怎么观察局面、什么时候安静
- **`reply_style`** — 说话的风格习惯：简短还是话痨、温和还是毒舌

### 调活跃度

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing]
talk_value = 1.0            # 群聊发言频率：越小越安静，0.3~0.5 明显话少
private_talk_value = 1.0    # 私聊发言频率：同上
inevitable_at_reply = true  # 被 @ 时尽量回复
mentioned_bot_reply = false # 消息提到麦麦名字时是否更容易回复
```

:::

想让麦麦按群、按时段分别调整频率，用 `talk_value_rules`（需先 `enable_talk_value_rules = true`）：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing]
enable_talk_value_rules = true

[[chat.reply_timing.talk_value_rules]]
platform = ""            # 留空 = 不限平台，"*" = 任意平台
item_id = ""             # 留空 = 不限聊天，"*" = 任意聊天
rule_type = "group"
time = "00:00-08:59"     # 生效时段；留空 = 兜底，"*" = 全天，支持跨夜 "23:00-02:00"
value = 0.8              # 该时段的发言频率

[[chat.reply_timing.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "09:00-18:59"
value = 1.0
```

:::

### 过滤不想看到的消息

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[message_receive]
image_parse_threshold = 5   # 单条消息图片数不超过此值才识图
ban_words = ["广告", "抽奖"]  # 含这些词的消息直接丢弃
ban_msgs_regex = ["^\\d+$"]  # 按正则丢弃消息，适合复杂规则
```

:::

::: warning 正则写错会导致启动失败
`ban_msgs_regex` 里的正则会在启动时校验，写错直接报错退出。改完先用下面「验证与排错」里的命令自检。
:::

### 收集表情包

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[emoji]
steal_emoji = true     # 自动收集群里别人发的表情
max_reg_num = 64       # 最多保存 64 个可用表情
do_replace = true      # 满了以后新表情替换旧表情
check_interval = 10    # 每隔 10 分钟检查一次表情库
```

:::

### 出问题先看日志

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[log]
console_log_level = "INFO"   # 控制台日志级别
file_log_level = "DEBUG"     # 文件日志级别：排查问题时保持 DEBUG
max_log_files = 30           # 最多保留 30 个日志文件
log_cleanup_days = 30        # 日志保留 30 天
```

:::

更多字段（轮转大小、第三方库降噪等）见下方[全量配置参考](#全量配置参考)的 [log](#运维与调试) 分组。

## 全量配置参考

按功能分组列出所有段落。每个模板**写全了所有字段和默认值**，复制进 `bot_config.toml` 后只改你关心的行，其余保持默认即可。行尾注释标 **`[进阶]`** 的字段在 WebUI 中默认折叠，一般保持默认值就好。

### 身份与人设

#### 机器人身份

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[bot]
platform = ""            # 备用主平台：适配器没有上报身份时使用，如 "qq"
qq_account = ""          # 备用 QQ 账号：适配器没有上报 QQ 身份时使用
platforms = []           # 其他平台备用账号，格式 "platform:账号"；适配器身份存在时不参与判断
nickname = "麦麦"         # 麦麦显示和自称的名字
alias_names = []         # [进阶] 别人可能用来称呼麦麦的名字，用于辅助识别提及
```

:::

#### 人格

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[personality]
personality = "是一个大二女大学生，现在正在上网和群友聊天。善于用人类的角度思考问题，聊天偏日常。"
behavior_style = "不会没话题硬找话题：群里聊到感兴趣的内容再插话，冷场时安静旁观，不刷屏。"
reply_style = "你的风格平淡简短，可以参考贴吧的回复风格。不滥用比喻或者生硬句子。视情况省略主语或者进行倒装，风格较为随意。"
multiple_reply_style = [
  "你的风格平淡但不失讽刺，很简短,很白话。可以参考贴吧，微博的回复风格。",
  "用1-2个字进行回复",
  "用1-2个符号进行回复",
  "言辭凝練古雅，穿插《論語》經句卻不晦澀，以文言短句為基，輔以淺白語意，持長者溫和風範，全用繁體字表達，具先秦儒者談吐韻致。",
  "带点翻译腔，但不要太长",
]
multiple_probability = 0  # [进阶] 每次回复按此概率临时注入一条备用风格；0.0~1.0
```

:::

**要点：**

- **`multiple_reply_style`** — 备用说话风格，触发后只影响本次回复，想玩「人格随机切换」就把 `multiple_probability` 调到 0.1~0.3
- **`multiple_probability`** — `0` 表示从不切换，`1` 表示每次都换

### 聊天行为

#### 上下文与回想

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat]
max_context_size = 40            # 群聊回复参考最近多少条消息；越大越懂上下文，也更耗 token
max_private_context_size = 60    # 私聊参考的最近消息数量
enable_context_optimization = true  # 压缩部分上下文减少模型消耗；一般建议开启
mid_term_memory = true           # 聊天回想：主动召回最近聊天发生的事情
mid_term_memory_lenth = 10       # 最多保留多少条聊天回想；0 = 不保留
```

:::

::: tip 字段名 lenth 是历史拼写
`mid_term_memory_lenth` 的字段名就是「lenth」不是「length」，改对拼写反而会变成未知字段。保持原样即可。
:::

#### 什么时候发言

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_timing]
talk_value = 1                             # 群聊发言频率：0~1，越小越安静
private_talk_value = 1                     # 私聊发言频率：同上
mentioned_bot_reply = false                # 消息提到麦麦名字时更容易回复
inevitable_at_reply = true                 # 被 @ 时尽量回复
reply_trigger_mode = "frequency"           # 新消息何时进入 Planner："frequency" / "reply_necessity"
planner_interrupt_max_consecutive_count = 0  # [进阶] 思考时来了新消息最多重新思考几次；0 = 不限制
max_consecutive_wait_count = 3             # Planner 最多连续调用 wait 几次，达到后拒绝继续等待
no_action_backoff_base_seconds = 15        # 连续决定不回复后，下次检查前先等多久（秒）
no_action_backoff_cap_seconds = 300        # [进阶] 退避等待的上限（秒）
no_action_backoff_start_count = 2          # [进阶] 连续几次不回复后开始放慢检查
no_action_backoff_bypass_pending_count = 6 # [进阶] 等待期间新消息达到几条就立刻重新处理；0 = 不按条数打断
enable_talk_value_rules = false            # 开启后可按聊天/时段单独调频率，见下
```

:::

`talk_value_rules` 按平台、聊天流、时段设置发言频率，默认带两条全局规则：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[chat.reply_timing.talk_value_rules]]
platform = ""         # 留空 = 不限平台；"*" = 任意平台
item_id = ""          # 群号或用户 ID；留空 = 不限聊天，"*" = 任意聊天
rule_type = "group"   # "group" / "private"
time = "00:00-08:59"  # 留空 = 兜底，"*" = 全天，支持跨夜 "23:00-02:00"
value = 0.8           # 该时段发言频率：0 更安静，1 按正常频率

[[chat.reply_timing.talk_value_rules]]
platform = ""
item_id = ""
rule_type = "group"
time = "09:00-18:59"
value = 1.0
```

:::

**要点：**

- **具体群** — `platform = "qq"`、`item_id = "123456"`，只对这一个群生效
- **全局兜底** — `platform` 与 `item_id` 都留空，未命中任何具体规则时使用
- **全局通配** — 两个字段都填 `"*"`，匹配任意平台和聊天；在 WebUI 编辑时可直接选「全局通配」或「默认兜底」模式

#### 如何发言

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chat.reply_style]
enable_reply_quote = true  # [进阶] 回复时是否引用相关消息
```

```toml [群聊/私聊提示词 ~vscode-icons:file-type-toml~]
[chat.reply_style]
group_chat_prompt = """
你正在qq群里聊天，下面是群里正在聊的内容，聊天中包含文字，图片和表情包等消息。
回复尽量简短一些。最好一次对一个话题进行回复，但必须考虑不同群友发言之间的交互，免得啰嗦或者回复内容太乱。请注意把握聊天内容。
不要总是提及自己的身份背景，根据聊天内容自由发挥，但是要日常不浮夸，不要刻意找话题。
不用刻意回复其他人发送的表情包，只要关注表情包表达的含义。你可以适当发送表情包表达情绪。控制回复的频率，不要每个人的消息都回复，优先回复你感兴趣的或者主动提及你的，适当回复其他话题。
"""
private_chat_prompts = """
你正在聊天，下面是正在聊的内容，其中包含聊天记录和聊天中的图片。
回复尽量简短一些。请注意把握聊天内容。
请考虑对方的发言频率，想法，思考自己何时回复以及回复内容。
"""
```

:::

`chat_prompts` 给指定群聊或私聊追加额外要求，有特殊群规或语气要求时再加；`platform`、`item_id`、`prompt` 缺一不可，否则整条无效：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[chat.reply_style.chat_prompts]]
platform = "qq"
item_id = "123456"
rule_type = "group"
prompt = "这个群里说话要更简短。"
```

:::

#### 实验性功能

整段属于进阶设置，默认全部关闭，想尝鲜再逐项打开。

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[experimental]
enable_behavior_learning = false  # 从聊天中学习「什么时候该怎么回应」的经验
enable_rich_reply = false         # reply 动作可附加图片、表情包或 @
replyer_retro_prompt = false      # 按旧版（0.12.x）方式组织 Replyer 提示词，全部指令集中在一份模板里
emotion_trait = "neutral"         # 实验性情绪特点："rational_calm" / "neutral" / "sentimental"
behavior_learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
behavior_groups = []              # 多个聊天共享学到的行为经验

focus_mode = false                # 同一时间只专注一个聊天流，适合直播/高强度场景
focus_on_private = false          # Focus 是否也作用于私聊
focus_chat_whitelist = []         # Focus 白名单；留空 = 所有符合开关的聊天都可进入
focus_groups = []                 # Focus 共享组：同组共享 Focus，不同组互不抢占
focus_cool_time = 120             # 当前聊天多久没继续后允许被其他聊天唤醒（秒）

[experimental.attention_drift]
enabled = false                   # 注意力漂移：更容易被新话题、梗、反差点吸引
drift_level = "scattered"         # 漂移档位："subtle" / "active" / "scattered" / "wild"
anchor_policy = "balanced"        # 回钩策略：漂移后多强地回到当前上下文
reaction_style = "lively"         # 短反应风格："reserved" / "natural" / "lively"
```

:::

**复古回复提示词** — `replyer_retro_prompt = true` 时按旧版（0.12.x）方式组织 Replyer 提示词：全部回复指令集中在一份完整模板里，整段作为一条 `user` 消息发送，历史对话渲染成纯文本填入模板占位符，不再发送图片 Item。群聊、"简短回复"、私聊和"私聊且回复麦麦自己"各用一套模板（`retro_replyer`、`retro_replyer_light`、`retro_private_replyer`、`retro_private_replyer_self`），它们在 **Prompt 管理**里以"高级"折叠展示，可以编辑和创建自定义版本。改动热重载生效。

#### 消息接收

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[message_receive]
image_parse_threshold = 5   # [进阶] 单条消息图片数不超过此值才识图，避免拖慢处理
ban_words = []              # 含这些词的消息会被过滤，如 ["广告", "抽奖"]
ban_msgs_regex = []         # 按正则过滤消息；非法正则会导致配置校验失败
```

:::

#### 关键词反应

命中关键词或正则后，给麦麦追加一段**反应提示**——注意这是给麦麦看的指令，不是直接发送的消息：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[[keyword_reaction.keyword_rules]]
keywords = ["早上好"]          # 命中任意一个即触发；至少填 keywords 或 regex 之一
reaction = "现在是早晨，愉快地打招呼"  # 必填：命中后给麦麦的反应提示

[[keyword_reaction.regex_rules]]
regex = ["^早(上|安)[~！!]"]   # 适合复杂文本规则，Python re 语法
reaction = "对方在问早，简短回应即可"
```

:::

**要点：**

- 每条规则必须同时满足：`keywords` 或 `regex` 至少填一个、`reaction` 必填、正则合法，否则启动报错

### 学习系统

#### 表达学习

麦麦从聊天中学习表达方式，并在之后的回复里使用：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[expression]
expression_checked_only = true        # 仅使用人工精选过的表达
expression_self_reflect = true        # 写入前先让 AI 审核，减少学到奇怪内容
expression_selection_mode = "legacy"  # "legacy" 随手抽取 / "vector_intent" 意图+向量精细召回（需嵌入模型）
expression_vector_index_path = "data/expression_selection/expression_vector_index.json"  # [进阶]
expression_vector_candidate_pool_size = 50  # [进阶] 向量召回后交给 LLM 选择的候选数，硬上限 50
max_expression_learner = 3            # [进阶] 同时运行的学习任务数
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
expression_groups = []                # 多个聊天共享学到的表达
```

:::

**要点：**

- **`expression_selection_mode`** — 配好了嵌入模型就换 `"vector_intent"`，选择效果显著更好；旧配置里的 `"vector"` 模式已移除，升级后首次启动会自动迁移为 `"vector_intent"` 并写回文件
- **`learning_list`** — `platform` / `item_id` 留空表示全局规则；`type` 可选 `"group"` / `"private"`；`use` 控制是否使用已学内容，`learn` 控制是否继续学习

从 1.2.0 起，表达向量索引支持在线维护：新增、历史回填与失败恢复按最近聚类中心增量分配，索引文件损坏会自动重建而不是反复异常重启。该过程自动运行，无需配置。

#### 黑话学习

字段与 [expression](#表达学习) 的 `learning_list` 完全一致，只是学习对象换成群里的黑话梗：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[jargon]
learning_list = [{ platform = "", item_id = "", type = "group", use = true, learn = true }]
jargon_groups = []  # 多个聊天共享学到的黑话
```

:::

### 输出与形象

#### 视觉

控制图片消息进入规划器和回复器的方式：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[visual]
planner_mode = "auto"                  # "auto" 按模型自动选 / "text" 只用文字和识图结果 / "multimodal" 直接发图给模型
replyer_mode = "auto"                  # 同上，控制回复生成阶段
max_image_num = 128                    # [进阶] 一次多模态请求最多带多少张图
wait_image_recognize_max_time = 10     # 等识图完成的最长秒数；0 = 不等待
handle_oversized_images = true         # 收到过大图片时自动压缩或丢弃
max_image_size_mb = 30.0               # 超过此大小按过大图片处理；0 = 不限
oversized_image_handle_method = "compress"  # "compress" 压缩后继续用 / "discard" 直接丢弃

[visual.image_cache_cleanup]
enabled = true                 # 自动清理长期不用的图片缓存
check_interval_hours = 6.0     # 每隔多少小时检查一次
image_file_retention_days = 14    # 图片文件多久没用后删除
no_file_result_retention_days = 30  # 图片删掉后识别结果再保留多久
```

:::

#### 表情包

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[emoji]
emoji_send_num = 25        # [进阶] 每次从多少个候选里挑一张发送（不是一次发 25 张）
max_reg_num = 64           # 最多保存多少个可用表情
do_replace = true          # [进阶] 满额后用新表情替换旧表情；关闭则不再收集
check_interval = 10        # 每隔多少分钟检查一次表情库
steal_emoji = true         # 从聊天中自动收集别人发的表情
max_emoji_size_mb = 5.0    # [进阶] 收集表情的大小上限；0 = 不限
content_filtration = false # [进阶] 只保存内容合适的表情

[emoji.cache_cleanup]
enabled = true                  # 自动清理未注册的表情包缓存（已注册的不会被删）
check_interval_hours = 6.0      # 每隔多少小时检查一次
emoji_file_retention_days = 30  # 未注册表情文件多久没用后删除
no_file_record_retention_days = 30  # 文件删掉后描述记录再保留多久
```

:::

#### 语音识别

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[voice]
enable_asr = false  # 开启后把语音消息识别成文字再处理；需在 model_config 配置 voice 任务模型
```

:::

#### 回复后处理

总开关控制错别字生成与回复分割：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[response_post_process]
enable_response_post_process = true  # 总开关；关闭后错别字和回复分割都不生效
typing_speed = 1.0                   # [进阶] 模拟打字速度：0 最快 / 1 默认 / 2 更慢（0~2）
```

:::

#### 中文错别字

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[chinese_typo]
enable = true                       # 偶尔打错字，更像真人
enable_correction_quote = true      # 纠正错别字时引用上一条包含错别字的消息
correction_quote_probability = 1.0  # [进阶] 生成纠正消息时引用原消息的概率（0~1）
error_rate = 0.01                   # [进阶] 单个字被替换成错字的概率（0~1）
min_freq = 9                        # [进阶] 只对常见程度达到该值的字制造错字
tone_error_rate = 0.1               # [进阶] 按相近声调制造错字的概率（0~1）
word_replace_rate = 0.006           # [进阶] 整词被替换成错词的概率（0~1）
```

:::

#### 回复分割

把过长回复拆成多条发送，更像真人刷屏：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[response_splitter]
mode = "rule"                     # 断句模式："rule" 规则断句 / "llm" 由 LLM 按语义断句
enable = true                     # 把过长回复拆成多条发送
max_length = 512                  # 单条回复最大长度（字符）
max_sentence_num = 8              # 单条回复最多包含多少句
max_split_num = 3                 # 一次回复最多拆成几条
enable_kaomoji_protection = false # [进阶] 尽量不把颜文字从中间拆开
enable_overflow_return_all = false # [进阶] 句子太多时保留完整回复，不再强行截断
```

:::

**要点：**

- **`mode = "rule"`（默认）** — 按标点等规则机械断句，速度快、没有额外模型调用
- **`mode = "llm"`** — 由 LLM 按语义断句，走 `utils` 模型任务：每轮回复会多一次模型调用，延迟和费用都会上升，**必须先给 `utils` 配好可用模型，且失败不会自动回退**（本次回复会被标记为失败）
- `llm` 模式的断句提示词是程序内置的，不在 Prompt 管理页面里，无法自定义；也不会应用颜文字保护
- 统计里会出现 `response.splitter` 这一请求类型，可用它观察额外调用量

### 服务与连接

#### 消息服务

`maim_message` 是供外部程序（适配器、第三方客户端）连接麦麦的消息服务。**改这里必须重启 MaiBot**：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[maim_message]
ws_server_host = "127.0.0.1"  # 旧版 WebSocket 监听地址；不清楚保持默认
ws_server_port = 8000         # 旧版 WebSocket 端口
auth_token = []               # 旧版认证令牌列表；为空 = 不验证

enable_api_server = false     # 新版 API Server：供外部程序调用麦麦
api_server_host = "0.0.0.0"   # 新版监听地址；0.0.0.0 = 允许外部访问
api_server_port = 8090        # 新版监听端口
api_server_use_wss = false    # 是否使用加密 WebSocket
api_server_cert_file = ""     # WSS 证书文件路径
api_server_key_file = ""      # WSS 私钥文件路径
api_server_allowed_api_keys = []  # 允许访问的 API Key 列表；为空 = 不限制
```

:::

::: warning 对公网开放前先加鉴权
`api_server_host = "0.0.0.0"` 会把新版 API 暴露到所有网卡。对外提供服务务必配置 `api_server_allowed_api_keys`；启用 WSS 时 `secure_cookie` 一并打开。
:::

#### WebUI

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[webui]
enabled = true            # 是否启动 WebUI 管理界面
host = ["127.0.0.1", "::1"]  # 监听地址；允许外部访问改为 ["0.0.0.0", "::"]
port = 8001               # 访问端口
mode = "production"       # "production" 日常使用 / "development" 调试
webui_style = 1           # 界面风格：0 旧风格 / 1 未来复古风格

anti_crawler_mode = "basic"  # 防爬虫："basic" 只记录 / "strict" / "loose" 拦截更多请求 / "false" 关闭
allowed_ips = "127.0.0.1"    # 允许访问的 IP，逗号分隔，支持 CIDR 和通配符
trusted_proxies = ""         # 可信反向代理 IP，逗号分隔
trust_xff = false            # 是否信任 X-Forwarded-For 中的真实访客 IP
secure_cookie = false        # 只在 HTTPS 下发送登录 Cookie；没有 HTTPS 不要开
enforce_public_outbound_url = true  # 限制 WebUI 访问外部 URL，降低访问内网地址的风险
enable_paragraph_content = false    # 知识图谱加载段落全文；更完整但更占内存
```

:::

::: warning 监听地址与端口只在启动时读取
改 `host` / `port` 后必须重启 MaiBot。允许外部访问时建议同时收紧 `allowed_ips`。
:::

#### MCP

`[mcp]` 段只有总开关，服务器列表、Sampling、Roots 等详见 **[MCP 配置详解](./mcp-config.md)**：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[mcp]
enable = true  # 是否启用 MCP 工具接入能力
```

:::

::: tip MCP 服务器连接需要重启
`[mcp]` 下的服务器连接只在启动时建立，文件重载不会重新连接。改完服务器配置重启 MaiBot。
:::

#### 插件管理

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[plugin]
permission = ["qq:123456789"]  # 允许用聊天命令管理插件的用户，格式 platform:QQ号
```

:::

#### 插件运行时

新版插件系统的进程管理。**绑定与 IPC 设置只在启动时生效**：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[plugin_runtime]
enabled = true                   # 是否启用新版插件运行时
health_check_interval_sec = 30.0 # 每隔多少秒检查一次插件运行状态
max_restart_attempts = 3         # Runner 崩溃后最多自动重启几次
runner_spawn_timeout_sec = 30.0  # 等待 Runner 启动完成的最长时间（秒）
hook_blocking_timeout_sec = 60   # 单个阻塞 Hook 最多运行多久（秒）
ipc_socket_path = ""             # 自定义通信 Socket 路径；留空自动生成

[plugin_runtime.render]
enabled = true                   # 允许插件使用浏览器渲染（网页截图等）
browser_ws_endpoint = ""         # 已有 Chrome/Chromium 的调试地址；留空自动启动
executable_path = ""             # 浏览器程序路径；留空自动查找
browser_install_root = "data/playwright-browsers"  # 自动下载浏览器的保存位置
headless = true                  # 隐藏浏览器窗口运行
launch_args = ["--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"]
concurrency_limit = 2            # 同时最多运行多少个渲染任务
startup_timeout_sec = 20.0       # 浏览器启动或连接的最长等待（秒）
render_timeout_sec = 15.0        # 单次渲染任务的最长等待（秒）
auto_download_chromium = true    # 找不到浏览器时自动下载 Chromium
download_connection_timeout_sec = 120.0  # 下载浏览器的连接超时（秒）
restart_after_render_count = 200 # 渲染多少次后重启浏览器；0 = 不自动重启
```

:::

### 运维与调试

#### 日志

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[log]
date_style = "m-d H:i:s"        # 日志时间显示格式
log_level_style = "lite"        # 日志等级显示样式："lite" / "compact" / "full"，只影响外观
color_text = "full"             # 控制台颜色范围："none" / "title" / "full"
log_level = "INFO"              # 全局最低日志等级："DEBUG" / "INFO" / "WARNING" / "ERROR" / "CRITICAL"
console_log_level = "INFO"      # 控制台最低日志等级
file_log_level = "DEBUG"        # 文件最低日志等级；排查问题时保持 DEBUG
log_file_max_bytes = 5242880    # 单个日志文件超过此大小后轮转（5MB）
max_log_files = 30              # 最多保留多少个主日志文件
log_cleanup_days = 30           # 主日志超过多少天后清理

llm_request_snapshot_limit = 128      # 失败模型请求快照最多保留多少份
maisaka_prompt_preview_limit = 256    # 每个聊天最多保留多少组 Prompt 预览
maisaka_reply_effect_limit = 256      # 每个聊天最多保留多少条回复效果记录

event_loop_watchdog_enabled = false        # [进阶] 记录事件循环卡顿，用于排查界面/主循环卡顿
event_loop_watchdog_warn_seconds = 0.5     # [进阶] 事件循环唤醒延迟超过该秒数时记录一条警告日志

suppress_libraries = ["faiss", "httpx", "urllib3", "asyncio", "websockets", "httpcore", "requests", "sqlalchemy", "openai", "uvicorn", "jieba"]  # [进阶] 完全不显示日志的第三方库
library_log_levels = { aiohttp = "WARNING", PIL = "WARNING" }  # [进阶] 单独调低某些第三方库的日志
```

:::

**事件循环看门狗** — 开启后每 1 秒检查一次主循环和 WebUI 循环"应该醒来"与"实际醒来"的时间差，超过 `event_loop_watchdog_warn_seconds` 就打一条形如 `事件循环卡顿: loop=main 迟到=1.23s (告警阈值 0.50s)` 的警告日志，用来判断界面卡顿、消息延迟是不是主线程被阻塞造成的。两个字段都**需要重启**才生效；默认关闭，因为正常运行也会有少量无害的延迟日志。

#### 调试

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[debug]
enable_console_input = true           # 在交互式终端中启用本地消息和指令输入（默认开启）
show_maisaka_thinking = true          # 在日志或界面中显示麦麦的思考过程
enable_clear_context_command = false  # 允许用 /clear 清空当前聊天流的短期上下文
enable_reply_effect_tracking = false  # 记录回复效果评分，观察回复质量
force_plugin_compatibility = false    # 跳过插件声明的 Host/SDK 版本校验直接加载；开启后需重启生效
keep_prompt_preview_json_base64 = false  # [进阶] Prompt 预览保留图片 base64；便于复现但占空间
record_tool_structured_content = false   # [进阶] 保存工具返回的结构化内容；增加数据库体积
enable_llm_cache_stats = false           # [进阶] 记录模型 prompt cache 统计，性能调试用
```

:::

**要点：**

- **终端输入** — `enable_console_input` 默认开启：在交互式终端里可以直接输入普通消息，或用 `/clear`、`/pm`、`/offline`、`/online`、`/help` 等指令管理聊天和适配器，输入 `exit()` 关闭。非交互终端（systemd、nohup、`docker run` 不带 `-it`）只会多打一条 warning，不影响运行；改动需重启
- **强制插件兼容** — `force_plugin_compatibility = true` 会跳过插件 manifest 声明的 Host/SDK 版本区间校验直接加载，**仅作临时兜底**，可能加载实际不兼容的插件；它只记一条 warning，且不影响插件市场的版本兼容性判断。开启后需重启

#### 遥测

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[telemetry]
enable = true  # 发送匿名运行统计；关闭不影响正常使用
```

:::

#### 数据库

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[database]
save_binary_data = false  # [进阶] 保存语音等二进制原文件；更占空间，方便以后重新识别。仅影响新存储的消息
```

:::

#### 长期记忆

A_Memorix 是独立的长记忆子系统，包含 12 个子段落，完整说明见 **[A_Memorix 配置详解](./amemorix-config.md)**。最简启用只需两行：

::: code-group

```toml [bot_config.toml ~vscode-icons:file-type-toml~]
[a_memorix]

[a_memorix.plugin]
enabled = true  # 启用长期记忆系统；启用前先确认嵌入模型可用
```

:::

::: info 关于 [inner] 段
文件开头的 `[inner]` 记录配置结构版本号，由程序在升级时自动管理，不要手动修改。
:::

## 验证与排错

**验证配置** — 改完先做一次语法自检（MaiBot 要求 Python 3.12，自带 `tomllib`）：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
python -c "import tomllib; tomllib.load(open('config/bot_config.toml','rb')); print('TOML 语法 OK')"
```

:::

然后在 WebUI 或直接看运行日志：保存文件后出现配置重载成功的信息，说明热重载已生效。

**启动时直接报错退出** — TOML 语法错误，或字段值非法（`ban_msgs_regex` 正则非法、关键词规则缺 `reaction`、`chat_prompts` 缺字段）。先用上面的命令定位语法问题；字段校验的错误信息会直接点名问题字段，改掉即可。

**改了没生效** — 你改的段落可能属于「仅启动时生效」：`[webui]` 与 `[maim_message]` 的监听地址和端口、`[mcp]` 服务器连接、`[plugin_runtime]` 的 IPC、`[log]` 的 `event_loop_watchdog_*`、`[debug]` 的 `enable_console_input` 与 `force_plugin_compatibility`。重启 MaiBot。其余段落看 [配置概览](./index.md#改了会立即生效吗)。

**麦麦不理人** — 依次检查：适配器的聊天名单有没有加这个群（见 [NapCat 适配器](../adapters/napcat.md) 的「先加名单，再测试」）；`talk_value` 是否被调得过低；`qq_account` 与适配器登录的 QQ 是否一致。

**麦麦刷屏话痨** — 调低 `talk_value`（如 0.3）；`response_splitter.max_sentence_num` 和 `max_split_num` 限制单次回复条数；注意 `emoji_send_num` 只是发送候选数，调小它不会减少发言频率。

**手动加的字段被删掉** — 配置文件由程序自动升级，不存在或拼写错误的字段（如把 `mid_term_memory_lenth` 改成 `length`）会在下次启动时被清理回默认值。先启动一次让程序生成/升级文件，再在生成的字段上改值。

**人设改了感觉没变化** — 人设只影响新生成的回复，已发出的消息不会变。确认日志出现重载成功后，连续观察几轮对话；想让风格偶尔突变，试试 `multiple_reply_style` + `multiple_probability`。

## 下一步

- 配置模型：[模型配置](./model-config.md)
- 模型高级参数（思考模式等）：[模型额外参数](./model-extra-params.md)
- 长期记忆详解：[A_Memorix 配置](./amemorix-config.md)
- 接入外部工具：[MCP 配置](./mcp-config.md)
- 连接 QQ：[NapCat 适配器](../adapters/napcat.md)
- 在浏览器里改配置：[WebUI 配置管理](../webui/config-management.md)
