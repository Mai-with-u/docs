---
title: Docker 部署
---

# 🐳 Docker 部署指南

Docker 就像一个大盒子，把 MaiBot 和所有它需要的东西都打包好，一键就能跑起来！

## 📋 准备工作

需要安装：
- [Docker](https://docs.docker.com/get-docker/)（就像装个虚拟机）
- [Docker Compose](https://docs.docker.com/compose/install/)（Docker 的助手）

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

| 服务 | 作用 | 简单解释 |
|------|------|----------|
| `core` | MaiBot 核心 | 机器人的大脑 🧠 |
| `napcat` | QQ 连接器 | 让机器人能上 QQ 📱 |
| `sqlite-web` | 数据库工具 | 查看机器人记住的东西 📊 |

## ⚙️ 环境变量（高级用法）

### 核心服务设置

| 变量 | 作用 | 例子 |
|------|------|------|
| `TZ` | 时区 | `Asia/Shanghai` |
| `EULA_AGREE` | 跳过协议确认 | 高级用法，一般不用管 |

### QQ 服务设置

| 变量 | 作用 |
|------|------|
| `NAPCAT_UID` | 用户 ID（一般用默认的） |
| `NAPCAT_GID` | 用户组 ID（一般用默认的） |

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

| 服务 | 端口 | 用途 |
|------|------|------|
| Web 界面 | 18001 | 在浏览器打开 http://localhost:18001 |
| QQ 连接 | 6099 | 机器人连接 QQ 用的 |
| 数据库工具 | 8120 | 查看机器人数据用的 |

## 📋 完整步骤（一步一步来）

```bash
# 1. 下载
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot

# 2. 首次启动（会生成配置文件）
docker compose up -d

# 3. 改配置（重要！）
# 打开 ./docker-config/mmc/bot_config.toml 填 QQ 号
# 打开 ./docker-config/mmc/model_config.toml 填 API 密钥

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
