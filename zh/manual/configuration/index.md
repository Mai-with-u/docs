---
title: 配置概览
titleTemplate: :title · 配置
---

# 配置概览

MaiBot 的全部设置都在 `config/` 目录下的两个 TOML 文件里：改机器人本身看 `bot_config.toml`，改 AI 模型看 `model_config.toml`。不想手动改文件，可以全程用 WebUI。

## 两个配置文件

**`bot_config.toml`** — 主配置文件：机器人身份、人设、聊天行为、记忆、表情、日志、WebUI、MCP 等全部主设置 → [Bot 配置](./bot-config.md)

**`model_config.toml`** — 模型配置：API 服务商、模型列表、各任务用什么模型 → [模型配置](./model-config.md)

::: tip 先启动一次
两个文件都在**首次启动 MaiBot 后**自动生成。找不到就先启动一次。
:::

## 改了会立即生效吗

MaiBot 会监听这两个文件的变化。是否需要重启，取决于该设置控制的是运行时行为，还是服务的启动方式。

**保存后自动生效** — 机器人人设、人格、聊天策略、回复频率、模型提供商、模型与任务分配、`[experimental]` 的复古回复提示词（`replyer_retro_prompt`）、`[response_splitter].mode` 等会热重载。模型变更对后续请求生效；带重载回调的模块（含 A_Memorix、表情维护）也会收到更新。

**由插件运行时热重载** — 插件自己的 `config.toml` 有独立生命周期。运行时会监听它并调用插件配置更新钩子。启用、禁用、安装、卸载和源码更新一般不需要重启整个 MaiBot。

**需要完全重启 MaiBot** — `[webui]` 与 `[maim_message]` 的监听地址和端口、`[mcp]` 服务器连接、`[plugin_runtime]` 的绑定与 IPC 设置、`[log]` 的事件循环看门狗（`event_loop_watchdog_*`）、`[debug].force_plugin_compatibility` 在启动时建立，文件重载不会重新绑定。

::: tip 如何判断
保存后看日志：出现配置重载成功的信息说明新值已生效；改了监听地址、MCP 连接这类启动期设置，重启 MaiBot。
:::

## 用 WebUI 改配置

不喜欢手动改文件，直接用内置的网页配置界面（1.0.0 起内置）：

- 默认地址 `http://127.0.0.1:8001`，手机、电脑都能用
- 登录 Token 在首次启动的日志里打印，也可在 `data/webui.json` 查看
- 按模块分组编辑，保存即走同一套热重载逻辑

WebUI 的完整功能见 [登录与设置](../webui/)。

## 验证与排错

**验证** — 启动 MaiBot 后确认 `config/` 目录下出现两个 `.toml` 文件，且浏览器能打开 `http://127.0.0.1:8001` 并用日志中的 Token 登录。

**找不到配置文件** — 文件是首次启动后生成的，先启动一次 MaiBot。

**改了配置没反应** — 对照上面的「改了会立即生效吗」：监听地址、端口、MCP 连接需要重启；其他改动看日志有没有重载成功的信息。

**WebUI 打不开** — 确认 `bot_config.toml` 的 `[webui] enabled = true`；检查 `host` 是否只绑定了 `127.0.0.1`（远程服务器访问时改绑或用端口转发）；端口是否被占用或被防火墙拦截。

**改完文件麦麦行为异常** — 先做语法自检：`python -c "import tomllib; tomllib.load(open('config/bot_config.toml','rb'))"`，报错行号即问题所在；字段值非法时启动日志会直接点名问题字段。
