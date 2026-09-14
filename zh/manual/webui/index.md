---
title: 登录与设置
---

# 登录与设置

MaiBot 自带浏览器管理面板（WebUI），启动后访问 `http://localhost:8001` 就能改配置、管记忆、看统计。这一页讲怎么登录、怎么完成首次设置，以及忘记密码怎么办。

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

3. 首次登录会进入配置向导，第一步是设置固定 Token

![设置登录密码](/images/webui/setup-token.webp)

固定 Token 需要同时满足：长度至少 10 位、包含大写字母、包含小写字母、包含特殊符号（例如 `MaiBot-Docs-2026!`）。

![填写固定 Token](/images/webui/setup-token-filled.webp)

4. 保存后旧 Token 立即失效，用新 Token 重新登录，再继续向导

## 首次配置向导

向导共三步，任何一步都可以点「跳过向导」（之后可在「WebUI 设置」中重新进入）：

### 设置登录密码

把临时 Token 换成你自己的固定 Token。

### 基础与人格

设置机器人昵称、人格描述和回复风格。

![基础与人格](/images/webui/setup-bot-profile.webp)

![填写昵称与人格](/images/webui/setup-bot-profile-filled.webp)

### API 与模型

配置模型服务商（API 地址、Key）和基础模型。还没有 Key 可以先跳过，之后在[模型管理](./config-management.md)里补。

![API 与模型配置](/images/webui/setup-model.webp)

完成后进入管理面板首页：

![WebUI 首页](/images/webui/home.webp)

## 能做什么？

- ⚙️ **改配置** — 表单化编辑 `bot_config.toml`，不用碰文件
- 🧠 **管记忆** — 查看、导入、修正、删除长期记忆
- 🔌 **装插件** — 安装和管理插件、适配器
- 📊 **看统计** — 消息、Token、费用与在线时长

## 基本设置

在 `bot_config.toml` 里改 WebUI 的设置：

::: code-group

```toml [TOML ~vscode-icons:file-type-toml~]
[webui]
enabled = true                # 是否启用 WebUI
host = ["127.0.0.1", "::1"]  # 绑定地址列表
port = 8001                   # 端口号
mode = "production"           # 运行模式：development(开发) 或 production(生产)
webui_style = 1               # 界面风格
anti_crawler_mode = "basic"   # 防爬虫模式：false / strict / loose / basic
allowed_ips = "127.0.0.1"     # IP 白名单（逗号分隔）
```

:::

- `host` 改成 `["0.0.0.0", "::"]` 可以监听所有网卡；同时应配置防火墙、访问白名单和 HTTPS
- `port` 可以改成其他数字避免冲突

## WebUI 设置

右上角齿轮进入 **WebUI 设置**（`/settings`），管理界面偏好：

- **外观** — 主题模式（浅色/深色/跟随系统）、主题色、字体、圆角、自定义 CSS
- **安全** — 修改或重新生成登录 Token
- **其他** — 数据管理：清理日志与缓存、导入/导出设置、重置
- **关于** — 版本信息、技术栈与开源许可

![WebUI 设置](/images/webui/settings.webp)

![关于页](/images/webui/settings-about.webp)

### 真实聊天流快捷管理（v1.2.5+）

在 WebUI 的「麦麦聊天」工作区左侧会话列表中：

* **直达设置入口**：针对已连接的真实聊天流（如群聊监听或私聊会话），会话项右侧提供了专属的 **⚙️ 设置** 齿轮图标。

* **快捷管理功能**：点击后直接呼出该聊天流的管理详情浮层，支持实时查看流状态、快速调整该会话的发言频率、插话敏感度，以及查看该流专属的审计与推理时间线。

## 忘记密码怎么办？

如果仍能登录，在「WebUI 设置 → 安全」中修改或重新生成 Token：

![安全设置](/images/webui/settings-security.webp)

如果已经无法登录：

1. 关闭 MaiBot
2. 删除 `data/webui.json` 文件
3. 重新启动 MaiBot，用控制台显示的新临时 Token 登录，并重新设置固定 Token

## 验证与排错

**验证**：登录后能看到首页统计卡片和左侧菜单，说明 WebUI 正常。

**打不开页面？**

- 确认 MaiBot 正在运行，控制台打印了「WebUI 服务器已启动」
- 确认 `[webui].enabled = true`，端口没被占用

**登录提示 Token 错误？**

- 临时 Token 每次启动都会变，用本次启动控制台打印的值
- 复制时别带上空格或换行

**设置固定 Token 后进不去？**

- 保存固定 Token 后旧 Token 立即失效，用新 Token 重新登录
- 实在不行删除 `data/webui.json` 重置

## 更多功能

- [配置管理](./config-management.md) - 在浏览器里改配置
- [记忆管理](./memory-management.md) - 查看和管理记忆
- [插件管理](/manual/plugins/) - 安装和管理插件
- [聊天记录](./chat-stats.md) - 查看聊天统计
