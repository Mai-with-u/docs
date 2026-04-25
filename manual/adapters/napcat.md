---
title: 💬 QQ 机器人连接指南
---

# 💬 QQ 机器人连接指南

想让 MaiBot 在 QQ 群里陪你聊天？用 NapCat 就能轻松搞定！

## 什么是 NapCat？🤔

NapCat 就像一个"翻译官"，帮 MaiBot 和 QQ 聊天：
- ✅ 不需要装完整的 QQ 客户端
- ✅ 稳定、快速、省资源
- ✅ 支持群聊和私聊
- ✅ 自动连接，不用你操心

简单来说：NapCat 让 MaiBot 能够"听懂"QQ 消息，也能"说话"给 QQ 听！

## 适配器仓库 📦

NapCat 适配器的源码在这里：[Mai-with-u/MaiBot-Napcat-Adapter](https://github.com/Mai-with-u/MaiBot-Napcat-Adapter)

在本项目中克隆到了 `MaiBot-Napcat-Adapter/` 目录下。

> 💡 **注意分支区别**：适配器有**两个分支**对应不同的运行模式：
> - `main` 分支 → **独立模式**（适配器作为独立程序运行）
> - `plugin` 分支 → **插件模式**（适配器作为 MaiBot 插件运行）
>
> 克隆后记得根据你选择的运行方式切换到对应分支哦！

## 两种运行方式 ⚡

NapCat 适配器支持两种运行方式，选一个适合你的就行！

### 🌟 插件模式（推荐）

适配器直接运行在 MaiBot 内部，像一个"内置翻译官"：
- 只需一层网络连接（NapCat → 适配器）
- 适配器和 MaiBot 之间通过内部通信，不走网络
- **更稳定**：少一个连接点，就不容易断
- **更简单**：不用再配适配器和 MaiBot 之间的连接
- **更低延迟**：消息少走一层网络，回复更快

消息流转：**QQ → NapCat → 适配器插件（MaiBot 内部）→ MaiBot**

### 🔧 独立模式

适配器作为独立程序运行，像一个"中间人"：
- 需要两层网络连接（NapCat → 适配器，适配器 → MaiBot）
- 适配器和 MaiBot 之间还需要额外一个 WebSocket 连接
- 适合需要独立部署或有特殊需求的场景

消息流转：**QQ → NapCat → 适配器 → MaiBot**

### 对比一下 ✨

| 特性 | 插件模式 🌟 | 独立模式 🔧 |
|------|------------|------------|
| 网络跳数 | 1 层 | 2 层 |
| 延迟 | 更低 ✅ | 较高 |
| 配置难度 | 简单 ✅ | 需要额外配置 |
| 稳定性 | 更高 ✅ | 多一个连接点可能断 |
| 安装方式 | 放入 plugins/ 目录 ✅ | 需要独立运行 |

💡 **建议**：如果你刚开始用，选插件模式就对啦！如果你有特殊需求（比如适配器和 MaiBot 部署在不同机器上），再考虑独立模式。

## 插件模式使用指南 🚀

### 第一步：安装适配器

插件模式使用 `plugin` 分支：

1. 克隆或切换到插件分支：
```bash
# 克隆插件分支
git clone -b plugin https://github.com/Mai-with-u/MaiBot-Napcat-Adapter.git

# 或者如果已克隆，切换到 plugin 分支
cd MaiBot-Napcat-Adapter
git checkout plugin
```

2. 将适配器目录放入 MaiBot 的 `plugins/` 文件夹中

或者，你也可以通过 MaiBot 的 WebUI 界面安装插件，更方便！

### 第二步：配置 NapCat 连接

插件模式下，适配器已经在 MaiBot 内部运行了，不需要再配置适配器和 MaiBot 之间的连接。你只需要配置适配器和 NapCat 之间的连接信息，在适配器的配置文件中填写 NapCat 的地址和端口。

### 第三步：配置 NapCat

1. 打开 NapCat 的网页界面
2. 找到 "反向 WebSocket" 设置
3. 填上适配器的监听地址

具体配置方法请参考 [NapCat 官方文档](https://napneko.github.io/guide/boot/Shell)。

💡 **提示**：反向 WebSocket 地址通常填 `ws://127.0.0.1:8095`，具体端口以适配器配置为准。

### 第四步：启动

直接启动 MaiBot 就行，适配器会自动加载！不需要单独启动适配器 🎉

## 独立模式使用指南 🔧

如果你需要独立运行适配器，按以下步骤操作。

使用 `main` 分支：

```bash
# 克隆 main 分支（默认）
git clone https://github.com/Mai-with-u/MaiBot-Napcat-Adapter.git

# 或者如果已克隆，确保在 main 分支
cd MaiBot-Napcat-Adapter
git checkout main
```

### 配置 MaiBot

在 `config/bot_config.toml` 里添加：

```toml
[bot]
platform = "qq"           # 用 QQ 平台
qq_account = 123456789    # 你的机器人 QQ 号
nickname = "麦麦"          # 机器人昵称
```

还是在 `config/bot_config.toml` 里，设置连接参数：

```toml
[maim_message]
ws_server_host = "127.0.0.1"   # 服务器地址（本地就用这个）
ws_server_port = 8080           # 端口号（默认 8080）
auth_token = []                 # 认证令牌，空着就行
```

| 配置项 | 什么意思 | 怎么填 |
|--------|----------|--------|
| `ws_server_host` | 服务器地址 | 本地用 `127.0.0.1`，服务器用实际 IP |
| `ws_server_port` | 端口号 | 默认 `8080`，改了就记住这个数字 |
| `auth_token` | 密码验证 | 空着就行，不用管 |

### 安装 NapCat

请参考 [NapCat 官方文档](https://napneko.github.io/guide/boot/Shell) 安装 NapCat。

**Docker 用户**：如果你使用项目自带的 `docker-compose.yml`，NapCat 已经作为 `napcat` 服务包含在内，直接和 MaiBot 一起启动即可：

```bash
docker compose up -d
```

### 设置 NapCat 连接

1. 打开 NapCat 的网页界面
2. 找到 "反向 WebSocket" 设置
3. 填上 MaiBot 地址：`ws://127.0.0.1:8080/ws`

具体配置方法请参考 [NapCat 官方文档](https://napneko.github.io/guide/boot/Shell)。

💡 **提示**：如果 NapCat 和 MaiBot 都在 Docker Compose 里运行，请确认 MaiBot 的 `maim_message.ws_server_host` 监听地址允许容器网络访问。

### 登录 QQ

启动 NapCat 后需要登录 QQ。具体登录方法请参考 [NapCat 官方文档](https://napneko.github.io/guide/boot/Shell)。

⚠️ **重要提醒**：
- 建议用小号，降低被封风险
- 登录信息会保存，重启后不用重新登录
- 遵守 QQ 规则，别发垃圾消息

### 连接步骤

推荐启动顺序：

1. **启动 NapCat** → 等 QQ 登录成功
2. **启动 MaiBot** → 等 WebSocket 服务启动
3. **启动适配器** → 适配器连接到 NapCat 和 MaiBot
4. **自动连接** → NapCat 会自动连上适配器

```bash
# Docker 一键启动（推荐）
docker compose up -d

# 手动启动
# 终端 1：启动 NapCat
# 终端 2：启动适配器 (进入适配器目录运行)
# 终端 3：uv run python bot.py
```

## 验证连接 ✅

怎么知道连上了？看这几个地方：

**插件模式**：
1. **WebUI 插件列表**：能看到 NapCat 适配器插件已加载
2. **MaiBot 日志**：看到适配器插件已加载的提示
3. **发消息测试**：在 QQ 群里 @机器人，看有没有回复

**独立模式**：
1. **MaiBot 日志**：看到 "WebSocket 服务启动成功"
2. **NapCat 日志**：看到 "反向 WebSocket 连接成功"
3. **适配器日志**：看到连接成功
4. **发消息测试**：在 QQ 群里 @机器人，看有没有回复

## 常见问题 🤔

### 插件模式和独立模式怎么选？

- **大部分情况选插件模式**：更简单、更稳定、延迟更低
- **选独立模式的情况**：适配器和 MaiBot 部署在不同机器上，或者有其他特殊需求

### 怎么知道我用的是哪种模式？

- **插件模式**：在 MaiBot 的 WebUI 插件列表里能看到 NapCat 适配器
- **独立模式**：适配器是单独运行的程序，有自己独立的终端/进程

### 连不上怎么办？

**检查这几点**：
- 地址和端口填对了吗？
- 防火墙拦住了吗？
- NapCat 和 MaiBot 在同一台机器吗？
- 日志里有什么报错信息？

### 收不到消息？

**可能原因**：
- QQ 号填错了？要和 NapCat 登录的一致
- NapCat 本身收到消息了吗？看 NapCat 日志
- 网络连接正常吗？

### 发不出消息？

**排查方法**：
- 机器人有发言权限吗？（群聊需要权限）
- 看 MaiBot 日志有什么报错
- 是不是多个程序同时用一个 QQ 号？

### 其他平台怎么办？

如果需要连接其他平台（如 GoCQ、微信、Discord、Telegram 等），可以参考：

- [GoCQ 适配器](./gocq) — 基于 go-cqhttp 的 QQ 适配器
- [社区适配器列表](./#社区第三方适配器) — 微信、Discord、Telegram 等

### 版本兼容性

- **版本兼容性**：用最新版 NapCat 一般没问题
- **网络问题**：检查防火墙和网络设置
- **权限问题**：确保机器人有必要的权限

### 怎么更新 NapCat？

Docker 部署可以这样更新：

```bash
docker compose pull napcat
docker compose up -d napcat
```

## 安全提醒 🔒

- 别把 WebSocket 端口暴露到公网
- 用 `127.0.0.1` 比较安全
- 定期更新 NapCat 版本
- 注意 QQ 的使用规则

## 获取帮助 💬

遇到问题可以：
- 查看 NapCat 和 MaiBot 的日志
- 加入 MaiBot 交流群问问
- 在 GitHub 提交问题
- 搜索相关教程

祝你连接顺利，让 MaiBot 在 QQ 里陪你聊天！🎉
