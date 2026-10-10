---
title: 插件接入
---

# 插件接入

**想给麦麦加能力、又不想改 MaiBot 源码，就写插件。** 插件跑在独立的 Runner 子进程里，通过 IPC 与主进程通信；你只需要实现 `MaiBotPlugin` 子类并声明组件，加载、配置、热重载、WebUI 都由运行时托管。

这一页解决"接入视角"的问题：插件能接到哪些地方、边界在哪、版本怎么对齐。**组件写法、装饰器参数与完整 API 见[插件开发文档](/plugin/)。**

## 什么时候用插件

::: fields
- **加命令 / 加工具** — 用户输入 `/weather` 触发，或让模型自主调用某个工具 → **插件**。
- **改麦麦的行为** — 改写提示词、拦截消息、修改回复 → **插件**（Hook 处理器）。
- **接入一个新聊天平台** — → **适配器**，见[适配器接入](./adapters/)。
- **让外部程序读取或控制麦麦** — 面板、监控、自动化脚本 → **HTTP API**，见[程序化对接](./webui-api/)。
- **让麦麦调用你的外部系统** — 已有现成服务 → 优先 **MCP**，见[MCP 配置](/manual/configuration/mcp-config)；需要复杂逻辑再考虑写插件。
:::

插件与适配器可以并存：平台适配器负责收发消息，插件负责处理消息。

## 插件能接到哪些地方

每个组件类型对应一个明确的接入面，按"你想影响什么"挑：

::: fields
- **Tool** — 暴露给模型自主调用的工具，接入的是**推理环节**。
- **Command** — 用户直接输入的命令，接入的是**消息入口**。
- **Hook 处理器** — 挂到命名钩子上，可以在消息处理、回复生成、发送、表情选择等节点前后读写数据，接入的是**流程内部**。
- **事件处理器** — 监听 `on_start` / `on_stop` 等事件，接入的是**生命周期**。
- **消息网关** — 插件自己收发某个平台的消息，等于"插件即适配器"。
- **API 组件** — 给其他插件或自己的 WebUI 页面提供接口，接入的是**插件之间**。
- **LLMProvider** — 注册新的模型客户端类型，接入的是**模型层**，见[LLMProvider 组件](/plugin/llmprovider)。
- **首页卡片 / WebUI 页面** — 在麦麦的 WebUI 里呈现数据与操作，接入的是**界面**。
:::

## 最小插件长什么样

一个能用的插件只有两个文件。下面这个插件注册了一个命令、一个工具，并在回复发出前改一句话：

::: code-group

```json [_manifest.json ~vscode-icons:file-type-json~]
{
  "manifest_version": 2,
  "id": "com.example.hello",
  "version": "1.0.0",
  "name": "示例插件",
  "description": "演示命令、工具与 Hook 三类接入面",
  "author": { "name": "you", "url": "https://github.com/you" },
  "license": "MIT",
  "urls": { "repository": "https://github.com/you/hello" },
  "host_application": { "min_version": "1.3.0", "max_version": "1.99.99" },
  "sdk": { "min_version": "2.0.0", "max_version": "2.99.99" },
  "capabilities": ["send.text", "send.emoji", "config.get"],
  "i18n": { "default_locale": "zh-CN" }
}
```

```python [plugin.py ~vscode-icons:file-type-python~]
from maibot_sdk import Command, HookHandler, MaiBotPlugin, Tool
from maibot_sdk.types import ToolParameterInfo, ToolParamType


class HelloPlugin(MaiBotPlugin):
    async def on_load(self) -> None:
        self.ctx.logger.info("hello 插件已加载")

    async def on_unload(self) -> None:
        pass

    async def on_config_update(self, scope: str, config_data: dict, version: str) -> None:
        pass

    @Command("hello", pattern=r"^/hello")
    async def handle_hello(self, **kwargs):
        await self.ctx.send.text("你好！", kwargs["stream_id"])
        return True, "你好！", 2

    @Tool(
        "greet",
        brief_description="向指定聊天流打招呼",
        detailed_description="参数 stream_id：当前聊天流 ID。",
        parameters=[ToolParameterInfo(
            name="stream_id", param_type=ToolParamType.STRING,
            description="当前聊天流 ID", required=True,
        )],
    )
    async def handle_greet(self, stream_id: str, **kwargs):
        await self.ctx.send.text("你好！", stream_id)
        return {"success": True}

    @HookHandler("send_service.after_build_message")
    async def tag_reply(self, **kwargs):
        # 在每个回复末尾加一句签名；blocking 模式才能改数据
        kwargs["processed_plain_text"] = f"{kwargs['processed_plain_text']}\n—— 来自 hello 插件"
        return {"action": "continue", "modified_kwargs": kwargs}


def create_plugin():
    return HelloPlugin()
```

:::

三类接入面各占一个装饰器：`@Command` 管消息入口，`@Tool` 给模型用，`@HookHandler` 改流程内部数据。生命周期三个方法一个都不能少，否则运行时拒绝加载。

Hook 是覆盖面最广的一类：22 个命名钩子分布在聊天、发送服务、表情、学习与推理流程上，支持阻塞（可改数据、可中止）与旁路观察两种模式，并带超时与熔断保护。钩子清单与返回契约见[插件开发文档 · Hook 处理器](/plugin/hooks)。

## 插件的运行边界

理解边界能省掉大量调试：

::: fields
- **独立进程** — 第三方插件跑在 Runner 子进程里，主进程崩溃与插件崩溃互不牵连；单次 RPC 默认 30 秒超时，组件调用默认 60 秒。
- **不能 import 主程序** — 插件代码只能用 `maibot_sdk`，不能引用 `src.*`。需要的能力通过 `self.ctx` 的能力代理申请。
- **能力要声明** — 能调哪些能力由 manifest 的 `capabilities` 列表决定，没声明就调用会被拒。
- **数据有固定落点** — 插件专属目录是 `data/plugins/{插件 ID}` 与 `temp/plugins/{插件 ID}`，别写到别处。
- **没有沙箱** — 没有通用的文件/网络隔离，插件等同于以主程序权限运行的代码；只装信任来源的插件。
- **热重载** — 插件源码或它的 `config.toml` 变化会自动重载；重载失败会回滚到上一版本。
:::

## 版本兼容

插件能否装进当前麦麦，由 manifest 里两个区间决定：

::: fields
- **`host_application`** — 宿主版本区间。低于下限直接拒绝；高于上限但主次版本相同则放行并告警。
- **`sdk`** — 插件 SDK 版本区间，不满足一律拒绝。当前配套的 SDK 是 `maibot-plugin-sdk` 2.9 系列。
:::

调试期可以用 `debug.force_plugin_compatibility` 临时跳过校验，但那是兜底手段——强行加载一个真的不兼容的插件，会在运行期报错。

## 从哪开始

::: steps
1. 先跑通最小插件：读[插件开发指南](/plugin/)，照着装 SDK、写 `_manifest.json` 和 `plugin.py`。

2. 想清楚要挂哪个接入面：工具、命令还是钩子，对照上面的清单选一个。

3. 按需查 API：能力代理覆盖发送、模型、配置、数据库、会话、消息、人物、表情、统计等，清单见[API 参考](/plugin/api-reference)。

4. 需要界面就在 `webui.json` 里声明页面，写法见[WebUI 页面](/plugin/webui-pages)。

5. 要发布到插件市场，见[发布插件](/plugin/submission)。
:::

## 验证与排错

**验收动作** — 插件加载后，WebUI 的插件页能看到它处于已加载状态，且你声明的命令 / 工具能触发。

- **插件没被加载** — 查 manifest：`manifest_version` 必须是 `2`，`id` 至少要有一个 `.` 或 `-` 分隔符，`capabilities` 与 `i18n` 是必填项，多写未知字段会被直接拒绝。
- **加载时报版本不兼容** — 对照 `host_application` / `sdk` 区间与当前版本；插件 SDK 与主程序是分开升级的。
- **组件注册失败** — 注册是全有或全无：某个组件的类型或钩子名不合法，整个插件都会注册失败，日志里会指出具体是哪一个。
- **能力调用被拒** — `capabilities` 里没声明；按能力名补上再重载。
- **改代码没生效** — 确认文件确实落在插件目录内；重载失败会自动回滚，日志里能看到回滚记录。
- **模型/发送等调用失败但没有异常** — 插件组件的异常不会变成 RPC 错误，而是以 `success: false` 写在返回载荷里，记得判返回值。
