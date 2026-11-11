---
title: 模型与规则错误排查
---

# 模型与规则错误排查

这页解决模型调用和规则匹配相关的报错：API Key 无效或余额不足、网络超时与连接失败、正则表达式无效、关键词规则配置错误。机器人不回复或回复不符合预期时，先看这页。

## API Key 错误/余额不足

**可能看到的现象**

- 机器人完全无回复
- 后端日志出现 `401 Unauthorized` / `402 Payment Required` / `403 Forbidden`
- 日志提示 `API key is invalid` 或 `Insufficient balance`

**先自查这几点**

1. API Key 填对了吗？检查 `model_config.toml` 中 `api_key` 字段
2. 账户余额够吗？登录 API 提供商后台查看余额
3. 模型名对吗？检查 `model_identifier` 是否在提供商支持列表内

**步骤 1：检查 API Key 配置**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# model_config.toml
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-your-api-key-here"    # 必填！替换为你的真实 Key
auth_type = "bearer"
```

:::

**步骤 2：验证 Key 是否有效**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 测试 DeepSeek API
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer sk-your-api-key-here"
```

:::

**步骤 3：检查余额**
- 登录 DeepSeek/OpenAI 等提供商后台
- 查看账户余额是否大于 0
- 检查 API Key 是否过期或被禁用

**步骤 4：确认模型名**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 正确示例
[[models]]
model_identifier = "deepseek-chat"   # 必须是 API 商支持的模型名
name = "deepseek-chat"
api_provider = "DeepSeek"

# 错误示例
[[models]]
model_identifier = "gpt-4"           # DeepSeek 不支持 GPT-4！
api_provider = "DeepSeek"
```

:::

**避免复发**

- **Key 不要提交到 Git** — 用环境变量或本地配置文件
- **设置余额提醒** — 在 API 后台设置低余额邮件通知
- **监控用量** — 定期检查 Token 消耗情况

## 网络超时/连接失败

**可能看到的现象**

- LLM 请求长时间无响应后报 `APIConnectionError` 或 `TimeoutError`
- 日志显示 `Connection refused`、`Connection reset` 或 `Read timed out`
- 机器人完全无回复，但本地功能正常

**先自查这几点**

1. 测试网络通不通（`curl -v https://api.deepseek.com`）
2. 换个网络试试（比如切换手机热点）
3. 确认 `timeout` 参数不是太小（建议 60-120 秒）

**步骤 1：测试网络连通性**

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 测试 API 端点是否可达
curl -v https://api.deepseek.com
```

:::
如果能连上（返回 HTTP 200 或 401 都算连通），说明网络没问题。
如果超时或连不上，说明你的网络到 API 服务商的线路不通，换个网络试试。

**步骤 2：增大超时时间**

如果网络不太好，把超时设长一点：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-your-api-key-here"
timeout = 120              # 单次请求超时（秒），网络差时可设到 180
max_retry = 3              # 最多请求几次（含第一次）
retry_interval = 8         # 重试间隔（秒）
```

:::

**步骤 3：换一个 API 提供商试试**

如果 DeepSeek 不稳定，可以在配置中加一个备用 API：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[[api_providers]]
name = "DeepSeek"
base_url = "https://api.deepseek.com"
api_key = "sk-key-1"

[[api_providers]]
name = "备用"
base_url = "https://api.openai.com/v1"  # 换成其他 API
api_key = "sk-your-backup-key"
```

:::

**避免复发**

- 设置合理的 `timeout`（60-120 秒）和 `max_retry`（2-3，含第一次请求）
- 网络不稳定时换个网络试试（如切换手机热点）
- 配置多个 API 提供商做备份，避免单点故障
- 定期检查 API 服务商状态（关注官方公告）

## 正则表达式无效

**可能看到的现象**

- 启动或保存配置时报 `re.error: bad escape` 等错误
- 日志提示 `Invalid regex pattern` 或 `正则表达式编译失败`
- 关键词规则/消息过滤不生效
- 配置页面提示「保存失败：正则语法错误」

**先自查这几点**

1. **检查特殊字符转义** — `\.` `\*` `\+` 等特殊字符是否加了反斜杠
2. **检查括号闭合** — `()` `[]` `{}` 是否成对出现
3. **使用在线工具测试** — 用 regex101.com 验证正则是否正确

**方法一：使用在线正则测试工具**
```text
# 访问 https://regex101.com/
# 1. 在左侧输入你的正则表达式
# 2. 在下方输入测试文本
# 3. 查看是否报错并调整
```

**方法二：转义特殊字符**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 错误示例：未转义
ban_msgs_regex = ["\d{17}[\dXx"]  # 方括号未闭合

# 正确示例：转义并闭合
ban_msgs_regex = [
    "\\d{17}[\\dXx]",            # 身份证号（TOML 中需要双反斜杠）
    "1[3-9]\\d{9}",              # 手机号
    "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",  # 邮箱
]
```

:::

**方法三：使用普通字符串代替正则**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 如果不需要复杂匹配，用普通字符串更安全
ban_words = ["广告", "加微信", "兼职"]  # 简单关键词，无需正则

# 避免写复杂的正则表达式
# ban_msgs_regex = ["(今天 | 明天 | 后天).*(天气 | 气温)"]  # 容易出错
# 改用关键词匹配
ban_words = ["天气", "气温", "温度"]
```

:::

> **提示**：TOML 文件中正则表达式需要双反斜杠 `\\` 转义，因为 `\` 本身是 TOML 的转义字符。

**避免复发**

- **优先用关键词匹配** — 简单场景不需要正则
- **复杂正则单独测试** — 先在 regex101.com 验证再填入配置
- **添加注释说明** — 在正则旁边注释匹配的内容，方便后续维护

## 关键词规则配置错误

**可能看到的现象**

- 启动时报 `关键词规则必须至少包含keywords或regex中的一个`
- 或 `关键词规则必须包含reaction`
- 或 `无效的正则表达式`
- 消息命中了规则，但回复里看不出反应提示的效果

**先自查这几点**

1. 每条规则是不是至少填了 `keywords` 或 `regex`？
2. `reaction` 填了吗？它是必填项，不是可选说明
3. 正则能在 Python 的 `re` 语法下编译通过吗？

**步骤 1：按规则类的真实字段写**
`KeywordRuleConfig` 只有三个字段，没有 `priority`、`enabled` 之类的开关：

::: code-group

```toml [config/bot_config.toml ~vscode-icons:file-type-toml~]
[keyword_reaction]

# 纯关键词规则：keywords 命中任意一个即触发
[[keyword_reaction.keyword_rules]]
keywords = ["你好", "hello", "嗨"]
reaction = "对方在打招呼，用日常语气回应"

# 纯正则规则：regex 用 Python re 语法
[[keyword_reaction.regex_rules]]
regex = ["^早(上|安)[~！!]"]
reaction = "对方在问早，简短回应即可"

# 关键词和正则可以同时写，任一命中都触发
[[keyword_reaction.keyword_rules]]
keywords = ["天气"]
regex = ["(今天|明天|后天).*(天气|气温|温度)"]
reaction = "对方在问天气，先问清城市再回答"
```

:::

`reaction` 是给麦麦看的提示，不会原样当成消息发出去。`regex` 里可以用捕获组，`reaction` 中对应位置会被匹配内容替换。

**步骤 2：多条规则同时命中的行为**
所有命中的规则会按配置顺序把 `reaction` 依次追加到提示里，最后一起交给 Planner 参考。没有优先级字段，也没有「高优先级覆盖低优先级」的机制。

想让引导只在该聊天下生效，配 `[chat.reply_style].chat_prompts`，关键词规则本身没有作用域字段。

**步骤 3：排查「没反应」**
- 确认匹配范围：规则只看最新消息和近期聊天内容，很久以前的发言不会触发。
- 全角与半角标点有区别，`你好，` 和 `你好,` 是两条不同的关键词；要两种都生效就都写进去。
- 正则写错会在启动时直接抛 `无效的正则表达式`，不会静默失效。

**避免复发**

- **能写关键词就别写正则** — 关键词是子串匹配，人眼可读、不会编译失败
- **正则先在 regex101.com 用 Python 语法验证** — 再贴进配置
- **`reaction` 写成指令而不是台词** — 写「简短回应即可」比写死一句回复效果好


## 相关

- [错误排查总览](./error-troubleshooting.md) — 错误代码速查表、常见错误关键词索引和排查流程图。
- [启动与访问错误排查](./troubleshooting-startup.md) — 配置文件、MCP、端口、WebUI 访问与登录。
- [运行与数据错误排查](./troubleshooting-runtime.md) — 不回复消息、数据库、表情包、记忆、磁盘空间和数据异常。
- [插件与适配器错误排查](./troubleshooting-plugins-adapters.md) — 插件加载失败、适配器连接和重连。
- [获取帮助](./getting-help.md) — 提问前自查、提交 Issue 的信息清单和获取日志的方法。