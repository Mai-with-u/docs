---
title: 配置概览
titleTemplate: :title · 配置
---

# 配置概览

MaiBot 的设置分在 `config/` 与 `host/` 两个目录：改机器人本身看 `config/bot_config.toml`，改 AI 模型看 `config/model_config.toml`，改宿主对外地址与共享模型目录看 `host/`。

不想手动改文件，可以全程用 WebUI。

## 配置文件在哪

**`config/bot_config.toml`** — 主配置文件，归单个 Bot 所有：机器人身份、人设、聊天行为、记忆、表情、日志、WebUI 风格、MCP 等主设置 → [Bot 配置](./bot-config.md)

**`config/model_config.toml`** — 模型配置，归单个 Bot 所有：各任务用什么模型、任务参数，以及选中哪个联网服务 → [模型配置](./model-config.md)

**`host/config.toml`** — 宿主配置，工作区内所有 Bot 共用：监听地址、端口、TLS、访问防护、公开文件地址

**`host/model_catalog.toml`** — 共享模型目录，工作区内所有 Bot 共用：API 服务商、模型定义与联网服务

::: tip 先启动一次
这些文件都在**首次启动 MaiBot 后**自动生成。找不到就先启动一次。
:::

## 配置专题

主文件之外，这些主题各有专页：

- **[模型额外参数](./model-extra-params.md)** — 思考模式、服务商参数模板、自定义请求头等进阶模型设置
- **[A_Memorix 配置](./amemorix-config.md)** — 记忆引擎的存储、检索、向量化与调优

## 改了会立即生效吗

MaiBot 会监听这两个文件的变化。是否需要重启，取决于该设置控制的是运行时行为，还是服务的启动方式。

**保存后自动生效** — 机器人人设、人格、聊天策略、回复频率、共享模型目录里的供应商与模型、任务分配、`[response_splitter].mode` 等会热重载。模型变更对后续请求生效；带重载回调的模块（含 A_Memorix、表情维护）也会收到更新。

**由插件运行时热重载** — 插件自己的 `config.toml` 有独立生命周期。运行时会监听它并调用插件配置更新钩子。启用、禁用、安装、卸载和源码更新一般不需要重启整个 MaiBot。

**需要重启宿主** — `host/config.toml` 的 `[webui]` 监听地址、端口、TLS 与访问防护、整个 `[maim_message]` 段（服务与凭据在启动时装载）、`[plugin_runtime]` 的绑定与 IPC 设置、`[log]` 的事件循环看门狗（`event_loop_watchdog_*`）与内存诊断（`memory_diagnostics_*`）、`[debug]` 的 `enable_console_input` 与 `force_plugin_compatibility` 在启动时建立，文件重载不会重新绑定。

::: tip 如何判断
保存后看日志：出现配置重载成功的信息说明新值已生效；改了监听地址、MCP 连接这类启动期设置，重启 MaiBot。
:::

## 用 WebUI 改配置

不喜欢手动改文件，直接用内置的网页配置界面：

- 默认地址 `http://127.0.0.1:8001`，手机、电脑都能用
- 登录密码在首次启动的日志里打印，也可在 `host/webui.json` 查看
- 按模块分组编辑，保存即走同一套热重载逻辑

WebUI 的完整功能见 [登录与设置](../webui/)。

## 验证与排错

**验证** — 启动后确认工作区结构齐了：Bot 目录下有 `config/bot_config.toml` 与 `config/model_config.toml`，`host/` 下有 `config.toml`、`model_catalog.toml` 和 `registry.sqlite3`；再用日志里的密码打开 `http://127.0.0.1:8001` 并登录。

**找不到配置文件** — 文件是首次启动后生成的，先启动一次 MaiBot。

**改了配置没反应** — 对照上面的「改了会立即生效吗」：`host/config.toml` 的监听地址与端口、整个 `[maim_message]` 段需要重启宿主；其他改动看日志有没有重载成功的信息。

**WebUI 打不开** — 确认 `host/config.toml` 的 `[webui].enabled = true`；检查 `[webui].hosts` 是否只绑定了 `127.0.0.1`（远程访问改成 `["0.0.0.0"]` 或加上服务器 IP，也可用 `HTTP_HOST` 环境变量追加）；端口是否被占用或被防火墙拦截。

**改完文件麦麦行为异常** — 先做语法自检：`python -c "import tomllib; tomllib.load(open('config/bot_config.toml','rb'))"`，报错行号即问题所在；字段值非法时启动日志会直接点名问题字段。
