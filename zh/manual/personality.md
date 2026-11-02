---
title: 人设库与导入
---

# 人设库与导入

人设库让你保存多套人设，随时手动切换。切换会保留你正在编辑的内容，保存后热重载，下一条回复就用新人设。

## 保存与切换

在 WebUI「身份与人格」页填写人格、行为风格、表达风格和群聊/私聊提示词，保存时会一并写进当前人设。点「保存为人设」把它存进人设库，之后可以在列表里重命名、删除或点「切换」。

切换前，麦麦会先把当前编辑的内容存回原来的人设；如果当前内容还没入库，会自动存成一份「切换前人设」留档，不会丢失。切换动作会写入配置文件并热重载，成功后新回复立即生效；已发出的消息不会改变。

群聊与私聊提示词也随人设一起保存和切换，分别落在 `chat.reply_style.group_chat_prompt` 和 `chat.reply_style.private_chat_prompts`。

## 导入 JSON

点「导入」可以粘贴一份 JSON，也支持被 Markdown 的 json 代码块包裹。粘贴后自动校验并预览，点「继续编辑」可以调整所有字段，最后点「创建人设」存入人设库。导入不会自动切换当前人设；同名人设需要先改名称。

::: code-group

```json [人设 JSON ~vscode-icons:file-type-json~]
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

`format` 必须是 `maibot.personality`，`version` 必须是数字 `1`。`profile` 的前六个字段（含群聊与私聊提示词）是必填字符串，名称不能全是空白；`multiple_reply_style` 是可选字符串数组，默认空；`multiple_probability` 是 0~1 的数字，默认 `0`。不接受额外字段、自动类型转换或远程资源，单份文本最多 65536 个字符。

## 从网页唤起导入

外部网页可以让用户点一个链接，直接在已登录的 WebUI 里打开导入卡片：

```text
{WEBUI_ORIGIN}/config/bot?tab=bot#personality-import={URL编码后的完整JSON}
```

这是浏览器导航接口，不是写配置的 HTTP API：不需要令牌、不需要跨域配置，JSON 放在 fragment 里，不会随请求发给服务器。用户仍需正常登录；同一标签页会临时保存待导入内容，登录后回到导入卡片，取消或保存后清除。

::: code-group

```js [生成导入链接 ~vscode-icons:file-type-js~]
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

URL 长度受浏览器和外部平台限制，人设很长时改用复制 JSON 的方式导入。这个接口面向已经能访问的 WebUI 实例，不负责启动尚未运行的麦麦。

## 插件切换人设

插件声明 `personality.list`、`personality.get_current`、`personality.switch` 后，可以读取人设库并按名称切换。完整接口见[插件 API 参考](/plugin/api-reference#personality)。

## 验证与排错

**验证** — 保存两套人设后切换，日志出现重载成功，新回复风格随之变化；在 WebUI 重新打开「身份与人格」能看到当前人设名称。

**切换后风格没变** — 人设只影响新生成的回复；确认日志里没有热重载失败的报错。切换期间如果配置被其他操作改动，会提示重新读取当前人设。

**导入被拒绝** — 检查 `format`、`version` 和六个必填字段是否齐全，`multiple_probability` 是否在 0~1 之间；有多余字段也会被拒绝。

**同名冲突** — 人设库按名称区分，导入同名人设前先改名称。

**外部链接打开后没有卡片** — 确认用户已登录该 WebUI；JSON 放在 fragment 中，超长时改用粘贴导入。
