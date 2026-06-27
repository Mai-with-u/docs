---
title: Docker 部署
---

# 🐳 Docker 部署指南

Docker 就像一个大盒子，把 MaiBot 和所有它需要的东西都打包好，一键就能跑起来！

## 📋 准备工作

需要安装：
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 5 分钟快速部署

### 1. 下载 MaiBot

```bash
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
```

### 2. 一键启动！

```bash
docker compose up -d
```

第一次启动会自动生成配置文件，然后会停下来等你配置。

## 📦 Docker 里都有啥？

Docker 会同时启动几个服务，就像一个团队：

- **`core`** — MaiBot 核心，机器人的大脑 🧠
- **`napcat`** — QQ 连接器，让机器人能上 QQ 📱
- **`sqlite-web`** — 数据库工具，查看机器人记住的东西 📊

## ⚙️ 环境变量（高级用法）

### 核心服务设置

- **`TZ`** — 时区，例如 `Asia/Shanghai`
- **`EULA_AGREE`** — 跳过协议确认（高级用法，一般不用管）

### QQ 服务设置

- **`NAPCAT_UID`** — 用户 ID（一般用默认的）
- **`NAPCAT_GID`** — 用户组 ID（一般用默认的）

## 💾 数据保存在哪里？

Docker 会把重要数据保存在你电脑的这些位置：

### 机器人数据
- **配置文件**：`./docker-config/mmc/`（机器人设置）
- **运行数据**：`./data/MaiMBot/`（聊天记录、记忆等）
- **插件**：`./data/MaiMBot/plugins/`（额外功能）
- **日志**：`./data/MaiMBot/logs/`（运行记录）

### QQ 数据
- **QQ 配置**：`./docker-config/napcat/`
- **登录信息**：`./data/qq/`（下次启动不用重新登录）

## 🔌 端口说明

- **Web 界面** — 端口 18001，在浏览器打开 http://localhost:18001
- **NapCat 管理面板** — 端口 6099，NapCat 网页配置面板
- **数据库工具** — 端口 8120，查看机器人数据用的

## 🔗 连接 NapCat

`docker compose up -d` 只会把 MaiBot 和 NapCat 容器启动起来，还需要完成 NapCat 登录、WebSocket 和适配器配置，MaiBot 才能真正收到 QQ 消息。

1. 打开 NapCat 管理面板：`http://localhost:6099`
2. 登录 NapCat 管理面板。如果需要 token，请查看 `./docker-config/napcat/webui.json` 中的 `token` 字段。
3. 在 NapCat 管理面板中登录 QQ 小号。
4. 在 NapCat 的网络配置中启用 **正向 WebSocket** 或 **WebSocket 服务器**，主机(host)填 `0.0.0.0` 或 `::`，监听端口一般用 `3001`。
5. 在 MaiBot WebUI 的插件管理中启用 **NapCat 适配器**，或编辑宿主机上的 `./data/MaiMBot/plugins/MaiBot-Napcat-Adapter/config.toml`：

```toml
[plugin]
enabled = true

[napcat_server]
host = "napcat"
port = 3001
token = ""
```

::: warning Docker 网络地址
在 Docker Compose 里，MaiBot 容器访问 NapCat 容器时应该使用服务名 `napcat`。因此适配器配置里的 `napcat_server.host` 通常填 `napcat`，不是 `127.0.0.1`。
`127.0.0.1` 在容器内只表示当前容器自己。
:::

### 群聊收不到消息

NapCat 适配器默认启用聊天名单过滤，且群聊默认是白名单模式。如果群号没有写进白名单，群消息会被适配器直接丢弃，看起来就像 NapCat 已连接但 MaiBot 没反应。

编辑 `./data/MaiMBot/plugins/MaiBot-Napcat-Adapter/config.toml` 的 `[chat]` 配置：

```toml
[chat]
enable_chat_list_filter = true
show_dropped_chat_list_messages = true
group_list_type = "whitelist"
group_list = ["你的QQ群号"]
```

如果只是本地测试，也可以临时关闭名单过滤：

```toml
[chat]
enable_chat_list_filter = false
```

改完后重启核心容器：

```bash
docker compose restart core
```

::: tip WebUI 配置位置
WebUI 的启用状态、监听地址和容器内端口现在都在 `./docker-config/mmc/bot_config.toml` 的 `[webui]` 配置段中设置，不再通过单独的 WebUI 配置文件或环境变量配置。
:::

默认情况下，`docker-compose.yml` 会把宿主机的 `18001` 端口映射到容器内的 `8001` 端口：

```yaml
ports:
  - "18001:8001"
```

Docker 部署时，建议确认 `./docker-config/mmc/bot_config.toml` 中的 WebUI 配置如下：

```toml
[webui]
enabled = true
host = "0.0.0.0"
port = 8001
```

::: warning ⚠️ host 必须改为 0.0.0.0
WebUI 的 `host` 默认值是 `127.0.0.1`（仅监听本地回环地址），**在 Docker 容器内这意味着只有容器自身能访问 WebUI，宿主机无法通过端口映射访问到它**。Docker 部署时务必将 `host` 改为 `0.0.0.0`，否则浏览器打不开 WebUI。
:::

- `host` 是 WebUI 在容器内绑定的地址。Docker 部署时建议使用 `0.0.0.0`，这样宿主机端口映射才能访问到 WebUI。
- `port` 是 WebUI 在容器内监听的端口，需要和 `docker-compose.yml` 端口映射右侧保持一致。例如 `18001:8001` 中的 `8001`。
- 如果你想修改浏览器访问端口，通常只需要改端口映射左侧。例如把 `18001:8001` 改成 `28001:8001` 后，通过 `http://localhost:28001` 访问。

## 📋 完整步骤（一步一步来）

```bash
# 1. 下载
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot

# 2. 首次启动（会生成配置文件）
docker compose up -d

# 3. 改配置（重要！）
# 打开 ./docker-config/mmc/bot_config.toml 填 QQ 号
# WebUI 配置也在 ./docker-config/mmc/bot_config.toml 的 [webui] 段
# 打开 ./docker-config/mmc/model_config.toml 填 API 密钥
# 打开 http://localhost:6099 登录 NapCat，并启用正向 WebSocket
# 启用 NapCat 适配器，并把适配器的 napcat_server.host 设为 napcat
# 群聊要把群号加入 NapCat 适配器的 group_list，或关闭聊天名单过滤

# 4. 重启让配置生效
docker compose restart core

# 5. 看日志
docker compose logs -f core
```

## 🔧 常见问题

### 容器启动就退出？

看日志找原因：
```bash
docker compose logs core
```

90% 是因为：
- 配置文件没填对（特别是 API 密钥）
- QQ 号填错了

### 内存不够？

Docker 比较吃内存，建议至少 2GB 空闲内存。

### 想停止机器人？

```bash
docker compose down
```

### 想重新启动？

```bash
docker compose restart
```

### 输入命令报错 `unknown shorthand flag: 'd' in -d`？

说明你的服务器安装的是**独立版（Standalone）**的 Docker Compose。请将命令中间的空格替换为**短横线**执行：
```bash
docker-compose up -d
```
同理，本文档后续所有形如 docker compose <命令> 的操作，在你的服务器上都需要写成 docker-compose <命令>（例如 docker-compose restart core）
