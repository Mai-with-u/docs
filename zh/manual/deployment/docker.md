---
title: Docker 部署
---

# Docker 部署

## 准备工作

MaiBot Docker 部署需要 Docker 和 Docker Compose，以及至少 2GB 可用内存。支持 Linux、macOS 以及 Windows（通过 Docker Desktop）。

先验证一下你的环境：

::: code-group

```bash [~vscode-icons:file-type-shell~]
docker --version
docker compose version
```

:::

如果还没装好，可以参考官方文档：

- **Docker** — [官方安装文档](https://docs.docker.com/get-docker/)
- **Docker Compose** — [官方安装文档](https://docs.docker.com/compose/install/)

::: tip 国内用户
国内服务器可以使用一键安装脚本：
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```

:::
:::

## Docker Compose

这是推荐的部署方式。

### 使用官方 docker-compose.yml

MaiBot 仓库中提供了完整的 `docker-compose.yml`，直接下载即可：

::: code-group

```bash [curl ~vscode-icons:file-type-shell~]
curl -o docker-compose.yml https://raw.githubusercontent.com/Mai-with-u/MaiBot/main/docker-compose.yml
```

```bash [wget ~vscode-icons:file-type-shell~]
wget -O docker-compose.yml https://raw.githubusercontent.com/Mai-with-u/MaiBot/main/docker-compose.yml
```

:::

官方配置包含了 MaiBot 核心、NapCat 和数据库工具，适合大多数用户。

### 使用精简配置

如果你只需要 MaiBot 核心，不需要 NapCat 和数据库工具，可以用以下精简配置：

::: code-group

```yaml [docker-compose.yml ~vscode-icons:file-type-yaml-official~]
services:
  core:
    container_name: maim-bot-core
    image: sengokucola/maibot:latest   # 官方镜像，升级时先 docker compose pull
    environment:
      - TZ=Asia/Shanghai               # 时区，影响日志与统计时间
      - EULA_AGREE=8e6e7d647f7f82d6ea98456b73908656    # 用户协议同意标识，勿改
      - PRIVACY_AGREE=91e5db7659c560bc3545e63859b6ebc0 # 隐私条款同意标识，勿改
      - WEBUI_HOST=0.0.0.0             # 容器内必须监听 0.0.0.0，否则宿主机访问不到
    ports:
      - "18001:8001"                   # 宿主机 18001 → 容器 8001；宿主机端口冲突时改左边
    volumes:
      - ./docker-config/mmc:/MaiMBot/config     # 配置文件
      - ./data/MaiMBot:/MaiMBot/data            # 运行数据
      - ./data/MaiMBot/plugins:/MaiMBot/plugins # 插件
      - ./data/MaiMBot/logs:/MaiMBot/logs       # 日志
    restart: always                    # 崩溃或服务器重启后自动拉起
```

:::

### 启动

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker compose up -d
```

:::

第一次启动会自动生成配置文件。

**数据存储位置**

- **配置文件** — `./docker-config/mmc/`
- **运行数据** — `./data/MaiMBot/`
- **插件** — `./data/MaiMBot/plugins/`
- **日志** — `./data/MaiMBot/logs/`

**端口说明**

- **WebUI** — 18001（映射到容器内 8001）

::: warning
WebUI 的 `host` 默认值是 `127.0.0.1`，在 Docker 容器内这意味着只有容器自身能访问。Docker 部署时务必将 `host` 改为 `0.0.0.0`。
:::

::: tip
如果你的服务器安装的是独立版 Docker Compose，命令需要写成 `docker-compose`（带短横线）而不是 `docker compose`。
:::

## Docker 镜像直接部署

如果你只想快速拉取镜像运行，不需要修改任何配置，可以用这种方式：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker pull sengokucola/maibot:latest
```

:::

然后直接运行容器：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker run -d \
  --name maim-bot-core \
  -p 18001:8001 \
  -e TZ=Asia/Shanghai \
  -e EULA_AGREE=8e6e7d647f7f82d6ea98456b73908656 \
  -e PRIVACY_AGREE=91e5db7659c560bc3545e63859b6ebc0 \
  -e WEBUI_HOST=0.0.0.0 \
  -v ./docker-config/mmc:/MaiMBot/config \
  -v ./data/MaiMBot:/MaiMBot/data \
  -v ./data/MaiMBot/plugins:/MaiMBot/plugins \
  -v ./data/MaiMBot/logs:/MaiMBot/logs \
  --restart always \
  sengokucola/maibot:latest
```

:::

这种方式只启动 MaiBot 核心。如果你还需要 NapCat 和数据库工具，建议用 Docker Compose 部署。

## Docker 源码构建

如果你需要修改源码，或者无法直接从 Docker Hub 拉取镜像，可以选择本地构建：

::: code-group

```bash [~vscode-icons:file-type-git~]
git clone https://github.com/Mai-with-u/MaiBot.git
```

:::

进入文件夹，构建镜像：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker build -t maibot .
```

:::

运行容器，命令和镜像直接部署相同，只是把镜像名换成本地构建的 `maibot`：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker run -d \
  --name maim-bot-core \
  -p 18001:8001 \
  -e TZ=Asia/Shanghai \
  -e EULA_AGREE=8e6e7d647f7f82d6ea98456b73908656 \
  -e PRIVACY_AGREE=91e5db7659c560bc3545e63859b6ebc0 \
  -e WEBUI_HOST=0.0.0.0 \
  -v ./docker-config/mmc:/MaiMBot/config \
  -v ./data/MaiMBot:/MaiMBot/data \
  -v ./data/MaiMBot/plugins:/MaiMBot/plugins \
  -v ./data/MaiMBot/logs:/MaiMBot/logs \
  --restart always \
  maibot
```

:::

## 进入 WebUI

启动后，MaiBot 会自动打开 WebUI 服务。打开浏览器，访问以下地址（把 `本机IP` 换成你的服务器地址，本机就是 `localhost`）：

```
http://本机IP:18001
```

首次启动时，容器日志中会打印出 WebUI 的登录 Token，类似于这样：

```
07-30 18:53:45 [WebUI] WebUI 配置文件不存在，正在创建: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] WebUI 配置已保存到: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] 新的 WebUI Token 已生成: QSwgc2Vu...
07-30 18:53:45 [WebUI应用] 🔑 WebUI 登录 Token: 5YWz5rOo5Y+v5LmQ5Za1fiDlhbPms6jlj6/kuZDosKLosKLllrXvvIE=
07-30 18:53:45 [WebUI应用] 💡 请使用此 Token 登录 WebUI
07-30 18:53:45 [WebUI服务] 🌐 WebUI 服务器启动中...
```

用以下命令查看容器日志：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker compose logs core
```

:::

复制日志中的 Token，在浏览器登录页面粘贴即可进入 WebUI。后续可以在 `data/webui.json` 中查看或修改 Token。

进入 WebUI 后，跟随配置向导完成模型配置和平台连接即可。

配置模型和连接 QQ 的详细步骤，参考 [模型配置](/manual/configuration/model-config) 和 [适配器](/manual/adapters/)。

## 验证与排错

**验证**：`docker compose ps` 中 `core` 状态为 `Up`，且 `curl -I http://127.0.0.1:18001` 返回 `200` 或 `307`，说明容器和 WebUI 都已就绪。

**容器启动后立刻退出？**

- 先看日志定位：`docker compose logs core`
- 常见原因是挂载目录权限不足或 `docker-compose.yml` 中的路径不存在，按日志修正后 `docker compose up -d` 重试

**端口被占用？**

- 日志提示 `port is already allocated` 时，修改 `docker-compose.yml` 里 `18001`/`18002` 的宿主机端口映射
- 或用 `ss -ltnp | grep 18001` 找到占用进程并停止

**外部访问不到 WebUI？**

- 确认容器环境变量 `WEBUI_HOST=0.0.0.0`
- 云服务器还要在安全组 / 防火墙放行 `18001` 端口

**找不到登录 Token？**

- 用 `docker compose logs core | grep Token` 过滤日志
- Token 同时保存在 `data/webui.json`，可直接查看

**镜像拉取很慢？**

- 配置 Docker 镜像加速器后重新执行 `docker compose pull`
