---
title: 运行与数据错误排查
---

# 运行与数据错误排查

这页解决运行期异常和数据问题：机器人不回复消息、数据库错误、表情包系统错误、记忆系统错误、日志文件过大与磁盘空间占满、人物与用户系统数据异常。

## 机器人不回复消息

### 错误现象
- 消息已发送到平台（QQ 群/私聊）
- 机器人无任何响应
- 日志无报错，但就是没回复

### 快速自查三连
1️⃣ 看后端终端输出，有没有收到消息的提示？
2️⃣ 匹配到规则了吗？检查关键词/意图规则是否覆盖该消息
3️⃣ LLM 配置对吗？确认 API Key 和模型配置正确（参考[模型与规则错误排查 · API Key 错误/余额不足](./troubleshooting-model.md#api-key-错误-余额不足)）

### 解决方案

**步骤 1：看终端输出**
重启 MaiBot 后观察终端日志，看有没有：
- `收到消息：...`（说明消息到了 MaiBot）
- `正在调用 LLM...`（说明在请求 AI）
- `发送回复：...`（说明回复发出去了）
如果这些都有，说明 MaiBot 本身没问题，可能是平台权限或网络问题。

**步骤 2：检查回复规则**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 检查关键词规则
[[keyword_reaction.keyword_rules]]
keywords = ["你好", "hello"]    # 确保包含你发送的消息
reaction = "你好呀！"
enabled = true                  # 确保规则启用
```

:::

**步骤 3：检查发言频率**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# config/bot_config.toml
[chat.reply_timing]
talk_value = 1                  # 群聊发言意愿（0-1），越小越安静；默认 1
private_talk_value = 1          # 私聊发言意愿（0-1），默认 1
```

:::

**步骤 4：检查平台权限**
- QQ 群：机器人是否被禁言？是否有发言权限？
- 私聊：是否被拉黑？
- 适配器：NapCat 是否正常连接？

**步骤 5：测试 LLM 响应**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 手动测试 API
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"你好"}]}'
# 应该能收到 API 返回的回复
```

:::

### 预防建议
- 📊 **监控日志** — 定期查看日志，发现异常及时处理
- 🧪 **测试新规则** — 添加新规则后先测试是否生效
- 📝 **记录配置变更** — 修改回复规则后记录变更内容

## 数据库错误

### 错误现象
- 运行时报 `DatabaseError` 或 `OperationalError`
- 启动时提示数据库迁移失败
- 日志显示 `database is locked` 或 `disk I/O error`

### 快速自查三连
1️⃣ 检查是否同时启动多个 MaiBot 实例连接同一数据库
2️⃣ 查看磁盘空间是否已满（打开文件管理器看看）
3️⃣ 确认 `data/MaiBot.db` 文件权限是否正确（可读写）

### 解决方案

**步骤 1：解决数据库锁定**

如果日志显示 `database is locked`，说明可能有多个 MaiBot 实例同时访问同一个数据库文件。关掉多余的 MaiBot 进程，只保留一个就行。

如果关掉后还是锁定，可以尝试把 `data/MaiBot.db` 文件删掉重来（注意先备份）。

**步骤 2：修复损坏的数据库**

如果怀疑数据库损坏（如突然断电后）：

1. 先备份：复制 `data/MaiBot.db` 到安全位置
2. 重启 MaiBot，程序会自动重建或修复数据库
3. 如果还不行，删掉 `data/MaiBot.db` 让程序重新创建（之前的重要数据需要从备份恢复）

**步骤 3：确认没有多实例在写同一个库**

`database is locked` 基本只有一个原因：多个 MaiBot 实例（或残留进程）在同时访问 `data/MaiBot.db`。关掉多余进程，只保留一个。数据库默认已经跑在 WAL 模式下，不需要也不能通过 `[database]` 段开启。

**步骤 4：清理磁盘空间**

打开 `logs/` 文件夹，删除不需要的旧日志文件。如果磁盘空间严重不足，也检查一下其他目录的大文件。

### 预防建议
- 避免同时启动多个 MaiBot 实例连接同一数据库文件
- 定期备份 `data/MaiBot.db`（建议每周一次）
- 配置日志轮转，避免日志文件占满磁盘

## 表情包系统错误

### 错误现象
- 发送表情命令无反应
- 表情注册失败，日志提示超出数量限制
- 表情注册失败，实际是 `data/emojis/` 目录不可写

### 快速自查三连
1️⃣ 检查 `[emoji]` 的 `content_filtration` 是否过滤过严
2️⃣ 确认 `[emoji]` 的 `emoji_send_num` / `max_reg_num` 是否设得过小
3️⃣ 确保 `data/emojis/` 目录可写（权限正确）

### 解决方案

**步骤 1：调整表情过滤规则**

如果表情被过滤规则误杀，先暂时关闭过滤确认是不是规则问题：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[emoji]
content_filtration = false   # 暂时关闭过滤，排查是否为规则问题
```

:::

**步骤 3：检查目录权限**

确保 `data/emojis/` 目录可写。如果权限不对，在文件管理器里右键设置读写权限。

**步骤 4：调整表情数量限制**

如果提示注册数量超限：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[emoji]
emoji_send_num = 25          # 单次发送候选数（1-64）
max_reg_num = 64             # 最大注册表情包数量
do_replace = true            # 满额后替换旧表情
```

:::

### 预防建议
- 谨慎开启 `content_filtration`，避免误杀正常表情
- 定期清理 `data/emojis/` 目录，删除不用的表情
- 设置合理的 `max_reg_num`，避免占用过多存储空间

## 记忆系统错误

### 错误现象
- 机器人回答"我不记得"或"未找到相关信息"
- 日志提示长期记忆加载失败
- 记忆添加后无法检索到

### 快速自查三连
1️⃣ 在 WebUI 的「记忆」页面执行索引重建（段落、向量各有入口）
2️⃣ 检查 `data/a-memorix/` 目录是否可写、内容是否完整
3️⃣ 确认 `[a_memorix]` 下 `plugin.enabled` 为 `true`

### 解决方案

**步骤 1：重建记忆索引**

长期记忆的段落索引和向量索引都在 WebUI 的「记忆」页面重建，1.3.1 没有独立的命令行重建工具。打开 WebUI → 记忆页面，按提示执行对应重建入口即可。

**步骤 2：检查记忆数据目录**

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 查看记忆数据目录（在 [a_memorix] 的 storage.data_dir 中配置，默认 data/a-memorix）
ls -la data/a-memorix/

# 确认目录可写，且没有残留的 .lock / .tmp 文件
```

:::

**步骤 3：启用记忆系统**

在配置文件中确认长期记忆已启用：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[a_memorix.plugin]
enabled = true                 # 长期记忆系统总开关，默认 false
```

:::

**步骤 4：向量索引损坏时重建**

如果检索不到新加入的记忆，优先在 WebUI 的「记忆」页面执行向量重建。仍不行就先备份 `data/a-memorix/`，停止 MaiBot 后删除该目录让系统重新生成（历史记忆需要从备份恢复）。

### 预防建议
- 定期在 WebUI 检查记忆索引状态，发现检索不到及时重建
- 备份 `data/a-memorix/` 目录，它是长期记忆的唯一存储位置
- 使用 WebUI 的记忆管理功能，不要手动编辑 `data/a-memorix/` 里的文件

## 日志文件过大 / 磁盘空间满

### 错误现象
- 系统运行缓慢或崩溃
- 日志轮转失败报 `No space left on device`
- 磁盘使用率 100%，无法写入新文件
- MaiBot 启动失败，提示数据库锁定或写入失败

### 快速自查三连
1️⃣ **检查磁盘空间** — 打开文件管理器看看磁盘还剩多少空间
2️⃣ **查看日志文件大小** — 看看 `logs/` 文件夹有多大
3️⃣ **检查日志级别** — `DEBUG` 级别会产生大量日志

### 解决方案

**步骤一：清理日志文件**
打开 `logs/` 文件夹，删除不需要的旧日志文件。一般只需要保留最近几天的日志，以前的可以直接删掉。

**步骤二：配置日志轮转**
::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
# 编辑 config/bot_config.toml
[log]
log_level = "INFO"             # 全局日志级别，生产环境用 INFO，调试时用 DEBUG
log_file_max_bytes = 10485760  # 单个日志文件超过 10MB 后轮转
max_log_files = 30             # 最多保留多少个主日志文件
log_cleanup_days = 30          # 超过该天数的日志文件自动清理
```

:::

日志轮转和清理默认就是开启的，改这三个值即可控制体积和保留时长。更细的调法见 [Bot 配置 · 日志](../manual/configuration/bot-config.md#日志)。

**步骤三：清理其他垃圾文件**
- Docker 用户：清理未使用的镜像和容器释放空间
- 检查 `~/.cache/` 目录，可以删除里面不需要的缓存文件

**步骤四：如果还不行，换个盘**
如果当前磁盘确实空间太小，考虑把 MaiBot 的日志和数据目录移到空间更大的磁盘上。

### 预防建议
- **生产环境用 INFO 级别** — 避免 DEBUG 日志过多
- **配置日志轮转** — 限制日志文件大小和数量
- **定期清理** — 设置 crontab 每周自动清理旧日志
- **独立磁盘挂载** — 将日志目录挂载到独立磁盘分区
- **监控磁盘空间** — 设置告警，使用率超过 80% 时通知

## 人物/用户系统数据异常

### 错误现象
- WebUI 中用户资料加载失败，显示空白或报错
- 人物卡信息丢失，之前设置的性格/背景没了
- 绑定账号时提示「用户已存在」或「外键约束失败」

### 快速自查三连
1️⃣ 是不是直接改过 SQLite 数据库文件？
2️⃣ `data/persons/` 文件夹里的人物卡 JSON 格式对吗？
3️⃣ 有没有多个 MaiBot 实例同时访问同一个数据库？

### 解决方案
**重建人物索引**
人物卡信息异常时，先在 WebUI 的人物/用户管理页面刷新或重建索引；1.3.1 没有独立的命令行重建工具。

**检查人物卡格式**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 进入人物卡目录
cd data/persons/

# 验证 JSON 格式（以某个角色为例）
python -m json.tool "角色名.json" > /dev/null
```

:::

**修复数据库（谨慎操作）**
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# 备份数据库
cp data/MaiBot.db data/MaiBot.db.bak

# 使用 WebUI 管理用户，不要直接操作数据库
```

:::

### 预防建议
- 🖥️ **用 WebUI 管理** - 不要直接改数据库文件
- 💾 **定期备份** - `data/persons/` 和 `data/MaiBot.db` 很重要
- 🔒 **避免并发访问** - 不要同时启动多个 MaiBot 连同一个数据库

## 相关

- [错误排查总览](./error-troubleshooting.md) — 错误代码速查表、常见错误关键词索引和排查流程图。
- [启动与访问错误排查](./troubleshooting-startup.md) — 配置文件、MCP、端口、WebUI 访问与登录。
- [模型与规则错误排查](./troubleshooting-model.md) — API Key、网络超时、正则表达式和关键词规则。
- [插件与适配器错误排查](./troubleshooting-plugins-adapters.md) — 插件加载失败、适配器连接和重连。
- [获取帮助](./getting-help.md) — 提问前自查、提交 Issue 的信息清单和获取日志的方法。
