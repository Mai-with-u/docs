---
title: 登录与设置
---

# 登录与设置

MaiBot 启动后访问 `http://localhost:8001` 即可访问 WebUI

## 管理多个机器人

在 WebUI 切换到宿主管理后，可新建机器人、切换当前机器人，或对已有机器人执行启停、重命名、克隆和归档。先确认当前选中的机器人，再修改聊天、插件或人设设置。模型供应商、模型列表和联网服务在「公共设置」维护，各机器人在模型任务分工中选择所用模型。

在「麦麦观察」提交问题后会进入独立帮助页，可从历史记录续聊。需要修改插件配置时，在当前轮启用写入权限，再核对页面显示的实际改动。

## 获取登录密码

第一次启动 MaiBot 时，控制台会打印一个临时 Token：

```
🔑 WebUI 登录 Token: e37fd618051f802816dc3bf32067583294b2648aff233a2d4caee0f67ebfdfcb
💡 请使用此 Token 登录 WebUI
```

这个 Token 只用于本次启动的首次登录。登录后，首次配置向导会要求你设置一个固定 Token；临时 Token 在下次启动时会重新生成。

## 登录

1. 浏览器打开 `http://localhost:8001`，进入登录页
2. 输入控制台显示的 Token，点击「登录」

![WebUI 登录页](/images/webui/login.webp)

3. 首次登录会进入配置向导，第一步是设置密码

![设置登录密码](/images/webui/setup-token.webp)

固定 Token 需要同时满足：长度至少 10 位、包含大写字母、包含小写字母、包含特殊符号（例如 `MaiBot-Docs-2026!`）。

![填写固定 Token](/images/webui/setup-token-filled.webp)

4. 保存后旧 Token 立即失效，用新 Token 重新登录，再继续向导

## 首次配置向导

设置完密码后，向导剩下两步，完成后就能聊天。

**基础与人格** — 填平台、账号、昵称和别名，再确认人格预设。平台按适配器选 QQ、邮件等，用自建适配器就选「其他平台」并填平台名；昵称是麦麦对外的名字，别名是群里可能出现的其他称呼。

![基础与人格](/images/webui/setup-bot-profile.webp)

![填写完成的基础与人格](/images/webui/setup-bot-profile-filled.webp)

**模型配置** — 填 API 服务商的 Base URL 和 Key，再给「规划思考」和「回复发言」各指定一个模型标识，例如 `deepseek-chat`。两项都填好、Key 有效时，下拉框会列出服务商返回的模型；勾选「启用视觉」表示该模型能看图。

![模型配置](/images/webui/setup-model.webp)

点「完成配置」后进入 WebUI 主界面。之后想重新走一遍向导，在 **WebUI 设置 → 常规** 里找进入配置向导的入口；想逐项改，用[在浏览器里改配置](./config-management.md)。

## Webui设置

在 `bot_config.toml` 里可以更改 WebUI 自身的一些基础设置。监听地址与端口在 `[http]` 段，由 WebUI 和文件传输共用：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[http]
host = ["127.0.0.1", "::1"]  # 监听地址列表；远程访问改为 ["0.0.0.0", "::"]
port = 8001                   # WebUI 与文件传输共用的端口

[webui]
enabled = true                # 是否启用 WebUI
mode = "production"           # 运行模式：development(开发) 或 production(生产)
webui_style = 2               # 界面风格：0 原版 / 1 未来复古 / 2 千禧
anti_crawler_mode = "basic"   # 防爬虫模式：false / strict / loose / basic
allowed_ips = "127.0.0.1"     # IP 白名单（逗号分隔）
```

:::

改完 `[http]` 必须重启 MaiBot 才生效。

![WebUI 设置](/images/webui/settings.webp)

![关于页](/images/webui/settings-about.webp)

## 更新 MaiBot

**设置 → 关于** 可以检查并更新主程序。检测到新版本时，顶栏右上角会出现更新卡片，点进去即可查看版本与待更新提交：

- **Git 部署** — 同步代码与依赖，成功后自动重启；依赖同步失败会自动回滚
- **程序包安装** — 从 PyPI 或所选镜像更新程序本身，实例目录里的配置、数据和插件不受影响

详细说明与排错见[uv 安装](../deployment/uv-tool.md)。

## 忘记密码怎么办？

如果仍能登录，在 **WebUI 设置**（`/settings`，点顶栏右侧的齿轮进入）的「安全」标签中修改或重新生成 Token：

![安全设置](/images/webui/settings-security.webp)

如果已经无法登录：

1. 关闭 MaiBot
2. 删除 `data/webui.json` 文件
3. 重新启动 MaiBot，用控制台显示的新临时 Token 登录，并重新设置固定 Token

## 常见问题

**打不开页面？**

- 确认 MaiBot 正在运行，控制台打印了「🌐 WebUI 服务器启动中...」和「🌐 访问地址」
- 确认 `[webui].enabled = true`，端口没被占用

**登录提示 Token 错误？**

- 临时 Token 每次启动都会变，用本次启动控制台打印的值
- 复制时别带上空格或换行

**设置固定 Token 后进不去？**

- 保存固定 Token 后旧 Token 立即失效，用新 Token 重新登录
- 实在不行删除 `data/webui.json` 重置

## 更多功能

- [配置管理](./config-management.md) - 在浏览器里改配置
- [与麦麦聊天](./chat.md) - 本地聊天室与观察聊天流
- [适配器管理](./adapter-management.md) - 账号身份与黑白名单
- [命令管理](./command-management.md) - 插件命令与执行权限
- [学习管理](./learning.md) - 表达方式、黑话与表情包
- [记忆管理](./memory-management.md) - 查看和管理记忆
- [日志与详细统计](./logs.md) - 终端日志、推理过程与用量统计
- [插件管理](/manual/plugins/) - 安装和管理插件
- [数据管理](./data-management.md)（`/data-transfer`）- 侧边栏「高级工具 → 数据管理」，打包导出和导入整份数据
