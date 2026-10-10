---
title: 回复扩展
---

# 回复扩展

回复扩展（`@ReplyExtension`，插件 SDK 2.10.0+）让插件直接参与麦麦的 `reply` 回复流程：插件注册一组**命名空间参数**，Planner 调用 reply 工具时可以带上它们；插件据此在**生成前**追加额外要求，或在**发送前**转换整组待发消息（例如把文字换成语音）。

需要更底层的干预点（任意 Hook、全局改写消息）时，请改用 [Hook 处理器](./hooks.md)；只做「随回复注入参数 / 改写回复内容」这类需求，回复扩展更省事：发送、历史记录、监控与失败判断都由主程序统一负责。

## 装饰器签名

::: code-group

```python [Python ~vscode-icons:file-type-python~]
from maibot_sdk import ReplyExtension

@ReplyExtension(
    name: str,                                  # 组件名称（命名空间最后一段）
    description: str = "",                      # 给 Planner 看的说明：什么时候启用
    parameters: dict | list[ToolParameterInfo], # 参数声明，写法与 Tool 相同
    *,
    priority: int = 0,                          # 多个扩展的处理顺序，从小到大
    timeout_ms: int = 60000,                    # 单次调用超时（毫秒）
    chat_scope: str = "all",                    # all / group / private
    allowed_session: list[str] | None = None,   # 限定生效的聊天流
    enabled: bool = True,
)
```

:::

`parameters` 支持 `ToolParameterInfo` 列表、属性字典或完整 object JSON Schema；主程序会校验类型、必填项、枚举和默认值。`chat_scope` / `allowed_session` 与组件启用开关沿用通用组件机制。

## 参数如何出现在 reply 工具里

注册成功后，reply 工具会多出一个 `plugin_options` 参数，每个扩展的键是 `插件 ID.组件名`：

::: code-group

```json [Planner 调用 reply 时 ~vscode-icons:file-type-json~]
{
  "msg_id": "m123",
  "set_quote": true,
  "plugin_options": {
    "voice_plugin.voice": { "attach_voice": true, "keep_text": false }
  }
}
```

:::

- 插件被停用或卸载后，对应参数会立刻从 reply 声明中移除；正在生成的回复如果其扩展被卸载或重载，会明确失败
- 不填 `plugin_options` 里的某个键 = 不调用该扩展；两个插件即使参数同名也互不冲突
- 默认值只在模型选择该扩展时补齐，声明参数不会自动启用插件
- 参数 Schema 不支持 `$ref` / `$dynamicRef`，请内联声明；未知顶层参数默认拒绝

## 处理器协议

处理器收到这些关键字参数：

- **`phase`** — `prepare`（生成前）或 `before_send`（后处理和附件完成后、任何消息发送前）
- **`reply_id`** — 本次回复的唯一 ID，两个阶段相同；并发回复各自独立
- **`call_id`** — 原始 reply 工具调用 ID
- **`session_id` / `reply_message_id`** — 聊天流 ID / 目标消息 ID
- **`chat`** — platform、is_group_chat、group_id、user_id、session_id、stream_id
- **`parameters`** — 仅本扩展的参数，已经校验并补齐默认值
- **`text`** — `prepare` 时为空；`before_send` 时为生成、Hook 处理后的完整正文
- **`messages`** — `prepare` 时为空；`before_send` 时为整组待发送消息

返回值：

- **`prepare`** — 返回 `{"extra_prompt": "额外要求"}` 或 `{}`；要求会交给 Replyer，并在生成 Hook 的 `extra_prompt` 中可见
- **`before_send`** — 返回 `{"messages": [...]}` 或 `{}`（保留原样）

## 消息组格式

每条消息写作 `{"segments": [...], "quote_previous": false}`，顺序就是发送顺序；消息段沿用发送协议的字典格式：`text`、`image`、`emoji`、`voice`、`at`、`reply`、`file`、`forward`、`dict`。

- 第一条消息沿用 reply 的 `set_quote`；后续消息 `quote_previous=true` 时会引用前一条
- 修改文字时保留无关的图片、@、表情段与 `quote_previous`，避免丢失原始附件
- 新增图片 / 表情 / 语音要携带 Base64 数据；原有图片、表情可保留 hash
- 音频合成由插件自行完成（SDK 不内置 TTS），语音段必须携带有效非空的 Base64 音频

多个扩展按 `priority` 从小到大、组件完整名称字典序依次处理，上一个扩展的输出交给下一个。

## 约束与失败行为

- 不要在扩展里直接替主程序发送这组回复；发送、记录历史、监控和失败判断都由主程序统一处理
- 空消息组、无效返回值、插件报错与超时都会让本次 reply 失败；发送前失败不会发出任何消息
- 正式插件应在依赖声明中指定 `maibot-plugin-sdk>=2.10.0`，详见 [Manifest 系统](./manifest.md)

## 完整示例：语音回复

把下列方法放进自己的 `MaiBotPlugin` 子类；`self.synthesize_voice(text)` 是插件提供的异步 TTS 方法，返回适配器支持的音频 bytes。

::: code-group

```python [Python ~vscode-icons:file-type-python~]
import base64

from maibot_sdk import MaiBotPlugin, ReplyExtension


class VoicePlugin(MaiBotPlugin):
    @ReplyExtension(
        "voice",
        description="需要语音回复时启用，可选择同时保留文字",
        parameters={
            "attach_voice": {"type": "boolean", "default": False, "description": "是否合成语音"},
            "keep_text": {"type": "boolean", "default": True, "description": "是否同时发送文字"},
        },
        timeout_ms=60000,
    )
    async def reply_voice(self, *, phase, parameters, text, messages, **context):
        if not parameters["attach_voice"]:
            return {}
        if phase == "prepare":
            return {"extra_prompt": "这次回复会转成语音，请使用适合朗读的自然口语。"}

        audio = await self.synthesize_voice(text)
        result = []
        for message in messages:
            segments = [
                segment
                for segment in message["segments"]
                if parameters["keep_text"] or segment["type"] != "text"
            ]
            if segments:
                result.append({"segments": segments, "quote_previous": message["quote_previous"]})

        voice = {
            "segments": [{
                "type": "voice",
                "data": text,
                "binary_data_base64": base64.b64encode(audio).decode("ascii"),
            }],
            "quote_previous": False,
        }
        result.append(voice)
        return {"messages": result}


def create_plugin():
    return VoicePlugin()
```

:::

## 验证与排错

**验证** — 注册后重载插件，在麦麦聊天里让 Planner 需要回复时，reply 工具的 `plugin_options` 中应出现「插件 ID.组件名」；Planner 选中后，监控时间线里能看到本次回复的两个阶段执行。

**reply 里看不到我的参数？**

- 确认插件已启用，且 `chat_scope` / `allowed_session` 与当前会话匹配
- 停用或卸载后参数会立刻从声明中移除，重新启用并重载即可恢复

**回复没发出去？**

- 任一扩展在发送前失败都会让整次回复失败，在插件日志里搜索对应 `reply_id` 的报错，修复后再触发一次

**语音 / 图片发不出去？**

- 检查 Base64 数据是否非空、音频格式是否被目标适配器支持
