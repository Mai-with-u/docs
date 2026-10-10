---
title: 登录与设置
---

# 登录与设置

MaiBot 启动后访问 `http://localhost:8001` 即可访问 WebUI

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


## Webui设置

在 `bot_config.toml` 里可以更改 WebUI 自身的一些基础设置：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[webui]
enabled = true                # 是否启用 WebUI
host = ["127.0.0.1", "::1"]  # 绑定地址列表
port = 8001                   # 端口号
mode = "production"           # 运行模式：development(开发) 或 production(生产)
webui_style = 2               # 界面风格：0 原版 / 1 未来复古 / 2 千禧
anti_crawler_mode = "basic"   # 防爬虫模式：false / strict / loose / basic
allowed_ips = "127.0.0.1"     # IP 白名单（逗号分隔）
```

:::


![关于页](/images/webui/settings-about.webp)

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
- [适配器管理](./adapter-management.md) - 账号身份与黑白名单
- [命令管理](./command-management.md) - 插件命令与执行权限
- [记忆管理](./memory-management.md) - 查看和管理记忆
- [MCP 配置](../configuration/mcp-config.md) - 外部工具服务，入口在「插件扩展 → MCP 服务」
- [插件管理](/manual/plugins/) - 安装和管理插件
- [数据管理](./data-management.md)（`/data-transfer`）- 侧边栏「高级工具 → 数据管理」，打包导出和导入整份数据
