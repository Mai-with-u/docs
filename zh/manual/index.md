---
title: 快速上手
---

# 快速上手

MaiBot（麦麦）是基于大语言模型的可交互智能体。它通过适配器接入 QQ、Telegram、邮件、iMessage 等平台，在群里像人一样聊天、记忆、学习，也能作为桌宠陪在电脑边。

跑起来只需要四步：装好程序、打开 WebUI、填一个模型、接一个聊天平台。

## 系统要求

一台能联网的电脑（Windows 10+ / Linux / macOS），至少 2GB 可用内存，以及一个 LLM 的 API Key。

## 五分钟跑起来

::: steps

1. **安装 MaiBot** — 用 uv 安装主程序，再在实例目录里生成配置。Windows、Linux、macOS 的命令一致。

   ::: code-group

   ```bash [安装与初始化 ~vscode-icons:file-type-python~]
   uv tool install --python 3.13 maibot
   mkdir my-maibot && cd my-maibot
   maibot init
   ```

   :::

   `maibot init` 在当前目录生成 `config/`，并建出 `data`、`logs`、`plugins` 和 `temp`；已有配置会被保留。成功时打印 `MaiBot 实例已初始化：<目录>`。

   不想用 uv 时，可以走 [Windows 部署](./deployment/windows)、[Linux 部署](./deployment/linux)、[Docker 部署](./deployment/docker)或[一键包](./deployment/windows)。

2. **启动并打开 WebUI** — 在实例目录执行 `maibot run`。这条命令运行宿主，以及该工作区内的全部 Bot。浏览器打开 `http://127.0.0.1:8001/`，首次登录用终端打印的临时登录密码，随后按向导设置固定密码。

3. **配置模型** — 在「模型管理」填写服务商地址、API Key 和模型名称，再到「功能分配」把思考、回复、视觉等任务分给具体模型。字段含义见[模型配置](./configuration/model-config)。

4. **接入聊天平台** — QQ 有两条路线：OneBot 适配器在插件市场安装，QQ 官方机器人随主程序内置。Telegram 和微信 ClawBot 同样是内置适配器。见[接入平台](./adapters/)。

:::

跑通后向麦麦发一句「你好」，能收到回复就说明模型和平台都通了。

## 按需要查阅

**[部署](./deployment/uv-tool.md)** — uv 安装、Windows / Linux 源码部署、Docker 与一键包。

**[配置](./configuration/)** — `bot_config.toml` 与 `model_config.toml` 的全部字段、思考模式参数、记忆引擎调优。

**[接入平台](./adapters/)** — 适配器选型与连接：QQ、Telegram、微信 ClawBot、邮件、iMessage、语音通话。

**[WebUI](./webui/)** — 登录、改配置、聊天与观察、统计、文件管理、数据迁移。

**[插件](./plugins/)** — 从插件市场安装、启用和更新插件。

## 玩出花样

**[多实例](./multi-bot-host.md)** — 一个工作区跑多只麦麦，各自独立的配置、数据与插件。

**[人设](./personality.md)** — 保存多套人设、粘贴 JSON 导入、热切换。

**[聊天场景](./chat-scenes.md)** — 动态发言规则组、快速反应、Focus、回复模板。

**[文件功能](./files.md)** — 聊天附件的收发、保存与文本阅读。

**[桌宠](./desktop-pet.md)** — 皮肤包、远程连接、待办、发图与读取桌面。

**[内部聊天](./internal-chat.md)** — 网页聊天室与桌宠共用一个主人身份。

**[麦麦答疑](./webui/ai-help.md)** — WebUI 内置的答疑 Agent，能查文档、找插件、改配置。

## 我是开发者

- [开发总览](/develop/) — 平台适配器与插件开发
- [插件开发指南](/develop/plugin/) — 编写插件，扩展 MaiBot 的行为

## 遇到问题

- 先查[常见问题](/faq/)，部署、连接、报错的大部分问题都有现成答案。
- 加入[麦麦交流群](/about/community)，群里有技术答疑和热心麦友。
- 也可以到 GitHub Discussions 提问：<Linkcard url="https://github.com/Mai-with-u/docs/discussions" title="MaiBot Discussions" description="提问、反馈文档问题与参与讨论" />
