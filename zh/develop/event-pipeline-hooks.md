---
title: 事件与钩子
---

# 事件与钩子

MaiBot 内部有两套事件系统协同工作：**EventBus**（基于 `EventType` 的发布/订阅模型）和**命名 Hook**（基于 `HookDispatcher` 的插件调度模型）。本页从运维和高级使用者的视角解释它们是什么、如何配合、出了问题怎么看。

[[toc]]

## 认识两条线

两条线分工不同，但最终汇合。

**EventBus** 是主程序内部的「消息路由总线」。主程序在启动、收到消息、LLM 响应、发送消息等关键节点通过 `event_bus.emit()` 触发事件。注册在 EventBus 上的 handler 按权重顺序执行，分为拦截型（可中断流程）和非拦截型（fire-and-forget）。EventBus 还负责将事件桥接到插件运行时，让插件也能收到这些生命周期信号。

**命名 Hook** 位于插件运行时内部。主程序通过 `invoke_hook("chat.receive.before_process", ...)` 触发一个命名 Hook，Host 端收集所有订阅该 Hook 的插件处理器，按统一规则排序后串行执行 `blocking` 处理器、并发执行 `observe` 处理器。

二者的交汇点在 `EventBus.emit()` 的末尾：拦截型 handler 执行完毕后，EventBus 调用 `_bridge_to_ipc_runtime()` 将事件推送到插件运行时，插件注册的 `@EventHandler` 在此被调用。而命名 Hook 的触发则更早地嵌入在业务流程中，不与 EventBus 直接共享队列。

## EventBus 与 EventType 参考

### 11 个事件类型

EventBus 使用 `EventType` 枚举定义了一套固定的事件点。每个事件在消息处理管线中占据一个明确的位置。

**`ON_START`** — 主程序启动完成时触发。无消息体，用于插件初始化、定时任务注册等一次性工作。由 `main.py` 发出。

**`ON_STOP`** — 主程序关闭前触发。无消息体，用于插件清理、状态持久化。由 WebUI 关闭路由和 `main.py` 发出。

**`ON_MESSAGE_PRE_PROCESS`** — 入站消息到达后、正式预处理之前触发。此时消息尚未经过 `SessionMessage.process()` 的轻量预处理，适合做原始的格式检查、过滤或日志记录。

**`ON_MESSAGE`** — 消息完成预处理后触发。此时消息已解析为 `MaiMessages`，但尚未进入命令匹配或对话链路。这是插件做内容拦截最常用的入口。

**`ON_PLAN`** — 规划器（Planner）开始执行前触发。此时系统已决定是否进入对话，携带当前会话的上下文信息。

**`POST_LLM`** — LLM 返回原始响应后、下游处理（表达选择、发送等）开始前触发。可在此修改 LLM 输出、追加工具调用结果或插入自定义逻辑。

**`AFTER_LLM`** — 表达选择、表情匹配等后处理完成、即将进入发送阶段前触发。此时回复文本和表达式已确定但仍可被拦截改写。

**`POST_SEND_PRE_PROCESS`** — `SendService` 构建好出站消息后、实际调用平台 IO 发送前触发。可在此对消息体做最终修改或放弃发送。

**`POST_SEND`** — 消息成功发送后触发。用于发送后的日志、统计、联动等。

**`AFTER_SEND`** — 发送完成且所有收尾工作结束后触发。用于整个消息轮次的收尾处理。

**`UNKNOWN`** — 预留的未知事件类型，用于兼容或自定义事件。当前未在主线中使用。

### 订阅与权重

注册 handler 需要四个要素：

**`event_type`** — 目标 `EventType` 枚举值。

**`handler`** — 一个 `async` callable，签名 `(Optional[MaiMessages]) -> (bool, Optional[MaiMessages])`。

**`weight`** — 权重，类型 `int`，越大越先执行。默认为 `0`。

**`intercept`** — 是否为拦截型，类型 `bool`，默认 `False`。

多个 handler 订阅同一事件时，按 `weight` 降序排列。`EventBus.subscribe()` 在注册时自动排序，无需手动管理顺序。

### intercept vs fire-and-forget：一次 emit 的完整流程

以下对照说明拦截型与非拦截型 handler 的行为差异。

**拦截型（`intercept=True`）**

- 串行执行，按 weight 从大到小逐个调用
- 每个 handler 接收当前消息对象，可返回修改后的消息
- 返回 `(False, ...)` 表示中断流程，后续 handler 不再执行
- 若中途中断，跳过所有非拦截型 handler 和 IPC 桥接

**非拦截型（`intercept=False`）**

- 通过 `asyncio.create_task()` 创建后台任务，并发执行
- 每个 handler 拿到的是当前消息的 `deepcopy`，隔离副作用
- 返回值被忽略，不参与主流程控制
- 适用于日志、统计、旁路观察等不修改消息的场景

一次 `emit()` 的流程是：

1. 按 weight 排序所有 handler，拆分为拦截型与非拦截型两组
2. 顺序执行拦截型 handler，任一返回 `continue_flag=False` 则立即中断
3. 若未被中断，为每个非拦截型 handler 创建后台任务（fire-and-forget）
4. 桥接到 IPC 插件运行时，将事件分发给插件的 `@EventHandler`
5. 返回最终的 `(continue_flag, modified_message)`

> 插件的 `@EventHandler` 对应 EventBus 这套体系。要了解插件如何订阅 EventType，请参阅 [事件处理器](/plugin/event-handlers)。

## 命名 Hook：插件的调度中心

命名 Hook 不是 EventBus 的一部分，它是插件运行时内部的调度系统，通过 `HookDispatcher` 实现。主程序不通过 EventBus 触发 Hook，而是直接调用 `invoke_hook()`。

### blocking vs observe

每个 Hook 处理器声明自己的模式：

**`blocking`** — 阻塞模式。串行执行，可修改 `kwargs`，可返回 `action: "abort"` 中止整个 Hook 调用链。适用于需要改写消息或拦截流程的场景。

**`observe`** — 观察模式。后台并发执行，`kwargs` 为调用时快照的副本。返回的 `modified_kwargs` 和 `abort` 请求会被忽略。适用于日志、监控、数据采集等不影响主流程的场景。

二者的核心区别和 EventBus 的 intercept vs non-intercept 语义相似，但实现层面有重要差异：命名 Hook 的 `modified_kwargs` 是字典合并而非消息对象替换，且 `observe` 处理器明确地不允许中止链。

### 调度顺序：五级排序

一次 Hook 调用中，所有订阅该 Hook 的处理器按以下五级排序键依次确定执行顺序：

1. **模式** — `blocking` 先于 `observe`（rank 值 `0 < 1`）
2. **顺序槽位** — `early` 先于 `normal` 先于 `late`（rank 值 `0 < 1 < 2`）
3. **插件来源** — 内置插件先于第三方插件（rank 值 `0 < 1`）
4. **插件 ID** — 按 `plugin_id` 字符串排序
5. **处理器名称** — 按 `name` 字符串排序

这意味着「内置插件的 blocking + early 处理器」必然在所有第三方插件的 observe 处理器之前执行。顺序可预测、可排障。

### 超时控制

每个 Hook 有独立的 `default_timeout_ms`。处理器也可以单独设置 `timeout_ms`。若在超时前未返回，框架按处理器的 `error_policy` 处理：`abort` 中止链、`skip` 跳过继续、`log` 仅记录日志。

## HookHandler 返回格式

插件中的 `@HookHandler` 方法需返回一个 `dict` 或无返回（`None` 视为 `{"action": "continue"}`）。

返回结构包含四个字段：

**`action`** — 控制动作。取值 `"continue"`（继续执行后续处理器）或 `"abort"`（中止当前 Hook 调用链）。默认 `"continue"`。仅在 `blocking` 模式下生效。

**`success`** — 调用是否成功，`bool`。不影响调度逻辑，仅用于日志和调试。

**`modified_kwargs`** — 修改后的 `kwargs` 字典，`dict` 或 `None`。框架会将此字典浅合并到当前 `kwargs`，后续处理器收到更新后的参数。仅在 `blocking` 模式下生效。

**`custom_result`** — 附加结果，任意类型。随同 `HookDispatchResult.custom_results` 列表返回给调用方。两种模式均可用。

返回示例（在 code-group 中展示）：

::: code-group

```python [Python ~vscode-icons:file-type-python~]
# blocking 处理器：改写消息文本，然后继续
return {
    "action": "continue",
    "success": True,
    "modified_kwargs": {
        "message": {"processed_text": "[已过滤] " + original_text}
    },
}

# blocking 处理器：中止 Hook 链
return {
    "action": "abort",
    "success": True,
}

# observe 处理器：记录日志，不做修改
return {
    "action": "continue",
    "success": True,
}
```

:::

## 常用 Hook 名清单

以下是主程序注册的内置 Hook 名，按功能域分组。要查看完整参数 schema，请参见源码中对应的 `register_*_hook_specs` 函数。

### 聊天消息链（chat）

**`chat.receive.before_process`** — 入站消息 `SessionMessage.process()` 之前。可拦截或改写原始消息。

**`chat.receive.after_process`** — 入站消息完成轻量预处理后。可改写文本或中止后续链路。

**`chat.command.before_execute`** — 命令匹配成功、执行前。可拦截命令或改写上下文。

**`chat.command.after_execute`** — 命令执行结束后。可调整返回文本和是否继续主链。

### 表情系统（emoji）

**`emoji.maisaka.before_select`** — Maisaka 表情发送工具选择表情前。可改写情绪、上下文和采样参数，或中止本次选择。

**`emoji.maisaka.after_select`** — 已选出表情后。可替换表情哈希、补充匹配情绪，或中止发送。

### 黑话挖掘（jargon）

**`jargon.extract.before_persist`** — 黑话条目写入数据库前。可改写去重后的条目列表或跳过持久化。

**`jargon.inference.before_finalize`** — 黑话含义推断完成、写回数据库前。可改写最终判定与含义。

### 表达方式（expression）

**`expression.select.before_select`** — 表达方式选择流程开始前。可改写会话上下文、选择参数或中止选择。

**`expression.select.after_selection`** — 表达方式选择完成后。可改写最终选中的表达方式列表与 ID。

### Maisaka 推理（maisaka）

**`maisaka.planner.before_request`** — 向模型发起规划请求前。可改写消息窗口与工具定义。

**`maisaka.planner.after_response`** — 收到模型规划响应后。可调整文本结果与工具调用列表。

**`maisaka.replyer.before_request`** — 向模型发起回复请求前。可改写回复 prompt 与参数。

**`maisaka.replyer.after_response`** — 收到模型回复响应后。可调整回复文本。

### 发送服务（send_service）

**`send_service.after_build_message`** — 出站 SessionMessage 构建完成后。可改写消息体或取消发送。

**`send_service.before_send`** — 真正调用 Platform IO 发送前。可改写消息或取消发送。

> 以上 Hook 的注册源码位于 `src/plugin_runtime/hook_catalog.py`（汇总），各域 register 函数分散在对应子模块。插件开发请参阅 [Hook 处理器](/plugin/hooks)。

## 运维诊断

### 「Hook 慢」是怎么拖慢系统的

命名 Hook 的 `blocking` 处理器是**串行阻塞**的。假设 `maisaka.planner.before_request` Hook 上有 5 个 blocking 处理器，每个耗时 200ms，那么从触发 Hook 到开始真正调用 LLM 的延迟至少是 1 秒。这 1 秒是**纯叠加**在 LLM 请求耗时之上的。

更隐蔽的问题是 `observe` 处理器。虽然它们是后台并发执行的，但如果 observe 处理器内部有同步阻塞操作（如磁盘 IO 未用 aiofile），它们会占用事件循环，间接阻塞同一事件循环上的其他任务。

EventBus 的拦截型 handler 同理——它们是串行的。一个注册在 `ON_MESSAGE` 上、weight 极高、耗时 3 秒的拦截型 handler 会让所有后续 handler（不论拦截型还是非拦截型）都等 3 秒。

### 作为运维，我能做什么

排查 Hook 延迟的起点是**日志中的 Hook 名**。当用户反馈「回复变慢」时，先用以下思路定位。

**第一步：找出可能涉事的 Hook**

观察日志中 `invoke_hook` 或 `bridge_event` 附近的时间戳。如果某个 Hook 名称反复出现在明显时间间隙附近，它就是首要嫌疑对象。关注这些高延迟风险 Hook：

- `chat.receive.before_process` / `chat.receive.after_process` — 每条消息都会经过，任何一个慢处理器都会影响整体响应
- `maisaka.planner.before_request` — 每次 LLM 调用前触发，延迟直接叠加
- `send_service.before_send` — 每次回复发送前触发，影响「思考完成到消息发出」的间隔

**第二步：定位到插件**

拿到可疑的 Hook 名之后，去 [插件配置与管理](/plugin/) 页面对照已安装插件的列表。Hook 名的前缀通常对应功能域（`chat`、`emoji`、`maisaka` 等），结合插件 ID 可以大致推断是哪个插件注册了处理器。

也可以直接查看日志中 Hook 执行结果的 `plugin_id` 字段。`HookDispatcher` 在执行完每个处理器后会记录 `HookHandlerExecutionResult`，其中明确包含 `plugin_id` 和耗时。

**第三步：临时措施**

- 如果某个插件的 blocking 处理器明显拖慢流程，可以在 WebUI 的插件管理页面禁用该插件观察效果
- 调整插件的执行顺序在代码层面不可行（顺序由框架统一管理），但如果问题确实是某个 observe 处理器在做不该做的重量级操作，向插件作者反馈
- 检查 `plugin_runtime.hook_blocking_timeout_sec` 配置项（默认 60s）。如果某个 Hook 超时时间设得过长，超时的处理器会堵塞整个链直到超时结束

**第四步：排查 EventBus 侧**

虽然命名 Hook 是主力系统，EventBus 的拦截型 handler 同样可能造成全局延迟。打开 `src/core/event_bus.py` 中的 `_bridge_to_ipc_runtime` 逻辑（173 行起），可以追踪哪些事件在桥接阶段耗时异常。

### 性能基线参考

正常运行的 MaiBot 中，大多数 Hook 调用的阻塞耗时应在 **100ms 以内**。以下数字供参考（不含 LLM 调用本身的时间）：

- `chat.receive.*` Hook：通常 < 10ms（消息预处理很轻量）
- `maisaka.planner.before_request` Hook：通常 < 50ms（主要是 prompt 改写）
- `expression.select.*` Hook：通常 < 30ms
- `send_service.*` Hook：通常 < 20ms

如果日志显示某个 Hook 的阻塞耗时超过 **500ms**，强烈建议排查对应插件的逻辑。

### 相关文档

- [运行时架构](/develop/plugin-runtime-internals) — 插件运行时 Host/Runner 架构
- [Hook 处理器](/plugin/hooks) — 插件开发者视角的 Hook 使用指南
- [事件处理器](/plugin/event-handlers) — 插件开发者视角的 EventHandler 使用指南
