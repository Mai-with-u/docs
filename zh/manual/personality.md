---
title: 人设
---

# 人设

人设决定麦麦是谁：她怎么理解自己、怎么说话、在群里和私聊里分别注意什么。WebUI 可以保存多套人设、随时切换，也支持从 JSON 或外部网页导入。

## 人设字段

一套人设由这些字段组成，保存在 `bot_config.toml` 的 `[personality]` 中：

::: fields
- **`name`** — 人设名称，人设库内唯一，不能全为空白。
- **`personality`** — 人格和身份设定，最核心的一段。
- **`behavior_style`** — 行为风格，比如怎么参与聊天、要不要找话题。
- **`reply_style`** — 表达风格，句长、语气、用词。
- **`group_chat_prompt`** — 群聊提示词，写群里的注意事项。
- **`private_chat_prompts`** — 私聊提示词，写一对一交流的注意事项。
- **`multiple_reply_style`** — 备用表达风格列表，默认空。
- **`multiple_probability`** — 备用表达风格的触发概率，0～1，默认 `0`。
:::

群聊和私聊提示词随人设一起保存和切换，分别写入 `chat.reply_style.group_chat_prompt` 与 `chat.reply_style.private_chat_prompts`。

## 保存多套人设

在 WebUI「麦麦设置 → 身份与人格」写好人设后存进人设库，可以继续保存其他版本，给每套起不同名称。之后在该页面切换：切换会把切换前的已保存编辑留在人设库里，再写入目标人设并热重载，已开始的回复不受影响。

当前人设还没存进人设库时，`selected_profile` 为空字符串。改动只写入配置文件和热重载后才生效，浏览器里没保存的编辑不会被切换读取。

## 导入 JSON

在「身份与人格」的「导入」卡片粘贴下面的 JSON，也支持用 Markdown 的 json 代码块包裹。粘贴后自动校验并预览，点「继续编辑」可以调整所有字段，最后点「创建人设」保存到人设库。

::: code-group

```json [maibot.personality ~vscode-icons:file-type-json~]
{
  "format": "maibot.personality",
  "version": 1,
  "profile": {
    "name": "温柔的麦麦",
    "personality": "温柔、好奇，喜欢和朋友分享日常。",
    "behavior_style": "自然参与聊天，认真倾听，不强行找话题。",
    "reply_style": "简短自然，语气温和。",
    "group_chat_prompt": "留意群友之间的互动，适时参与，不必逐条回复。",
    "private_chat_prompts": "关注对方的想法，保持自然连贯的一对一交流。",
    "multiple_reply_style": ["偶尔用一句俏皮话回复"],
    "multiple_probability": 0.1
  }
}
```

:::

导入规则：

::: fields
- **`format`** — 必须是 `maibot.personality`。
- **`version`** — 必须是数字 `1`。
- **必填字段** — `profile` 的前六项（含群聊与私聊提示词），都必须是字符串，名称不能全为空白。
- **可选字段** — `multiple_reply_style` 默认 `[]`；`multiple_probability` 默认 `0`，取值 0～1。
- **不接受的输入** — 额外字段、自动类型转换、远程资源；单份文本上限 65536 个 JavaScript 字符。
:::

导入不会自动切换当前人设。同名的人设需要改名称后再保存。

## 从外部网页导入

外部站点可以让用户填写自己的实例地址，然后生成一个预览链接：

```text
{WEBUI_ORIGIN}/config/bot?tab=bot#personality-import={URL编码后的完整JSON}
```

这是浏览器导航接口，不是写入配置的 HTTP API：不需要认证令牌、跨域接口或 CORS 配置。JSON 放在 URL 片段里，不会随 HTTP 请求发给服务器。用户仍需正常登录 WebUI；同一标签页会临时保存待导入内容，登录后回到导入卡片，取消或保存后清除。

::: code-group

```js [生成导入链接 ~vscode-icons:file-type-typescript~]
function personalityImportUrl(webuiOrigin, document) {
  const base = new URL(webuiOrigin)
  if (!['http:', 'https:'].includes(base.protocol)) {
    throw new Error('WebUI 地址必须是 HTTP 或 HTTPS')
  }
  const url = new URL('/config/bot?tab=bot', base.origin)
  url.hash = new URLSearchParams({
    'personality-import': JSON.stringify(document),
  }).toString()
  return url.href
}
```

:::

URL 长度受浏览器和外部平台限制，长人设建议改用复制 JSON 的方式导入。这个接口只面向可访问的 HTTP(S) 实例，不负责启动尚未运行的 MaiBot。

## 插件切换人设

插件通过 SDK 的 `ctx.personality` 读取和切换人设，需要在 manifest 里声明对应能力：

::: code-group

```json [_manifest.json ~vscode-icons:file-type-json~]
{
  "capabilities": [
    "personality.list",
    "personality.get_current",
    "personality.switch"
  ]
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
available = await self.ctx.personality.list()
names = [profile["name"] for profile in available["profiles"]]
current = await self.ctx.personality.get_current()
result = await self.ctx.personality.switch("温柔的麦麦")
```

:::

::: fields
- **`list()` / `personality.list`** — 返回 `{"profiles": [人设对象, ...]}`。
- **`get_current()` / `personality.get_current`** — 返回当前人设对象。
- **`switch(name)` / `personality.switch`** — 按名称精确匹配切换，作用于全局所有会话，返回 `{"changed": true, "current": 人设对象}`。
:::

人设对象包含上面列出的全部字段，当前人设未命名时 `name` 为空字符串。列表与当前查询读取运行时快照，WebUI 保存并热重载完成后才能读到最新内容。

切换到当前名称不会覆盖当前编辑，返回 `changed: false`。未知人设、缺少能力授权、非法参数、写文件失败或热重载失败都会抛出能力调用异常；热重载失败时配置可能已经写入磁盘，异常消息会说明，可以查询当前状态后重试。

## 验证与排错

**验证**：在「身份与人格」保存一套新人设并切换，然后在「麦麦聊天」里问她「你是谁」，回复应当体现新人设的性格与语气。

- **导入报格式错误** — 检查 `format` 是否为 `maibot.personality`、`version` 是否为数字 `1`，以及 `profile` 六个必填字段是否都是字符串。
- **同名保存失败** — 人设库内名称唯一，改个名称再保存。
- **切换后没变化** — 切换依赖热重载，看日志有没有重载成功的信息；浏览器里没保存的编辑不会生效。
- **插件读到旧人设** — 插件读取的是运行时快照，等 WebUI 保存并完成热重载后再查询。
