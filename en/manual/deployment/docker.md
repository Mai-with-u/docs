---
title: Docker Deployment
---

# Docker Deployment

## Prerequisites

MaiBot Docker deployment requires Docker and Docker Compose, plus at least 2GB of available memory. It supports Linux, macOS, and Windows (via Docker Desktop).

First, verify your environment:

::: code-group

```bash [~vscode-icons:file-type-shell~]
docker --version
docker compose version
```

:::

If not installed yet, refer to the official docs:

- **Docker** — [Official Installation Docs](https://docs.docker.com/get-docker/)
- **Docker Compose** — [Official Installation Docs](https://docs.docker.com/compose/install/)

::: tip Domestic Users (China)
For servers in China, you can use this one-liner:
::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```

:::
:::

## Docker Compose

This is the recommended deployment method.

### Using the Official docker-compose.yml

The MaiBot repository provides a complete `docker-compose.yml`. Download it directly:

::: code-group

```bash [curl ~vscode-icons:file-type-shell~]
curl -o docker-compose.yml https://raw.githubusercontent.com/Mai-with-u/MaiBot/main/docker-compose.yml
```

```bash [wget ~vscode-icons:file-type-shell~]
wget -O docker-compose.yml https://raw.githubusercontent.com/Mai-with-u/MaiBot/main/docker-compose.yml
```

:::

The official configuration includes MaiBot core, NapCat, and database tools, suitable for most users.

### Using the Minimal Configuration

If you only need the MaiBot core without NapCat and database tools, use this minimal configuration:

::: code-group

```yaml [docker-compose.yml ~vscode-icons:file-type-yaml-official~]
services:
  core:
    container_name: maim-bot-core
    image: sengokucola/maibot:latest   # Official image; run docker compose pull before upgrading
    environment:
      - TZ=Asia/Shanghai               # Timezone, affects log and statistics timestamps
      - EULA_AGREE=8e6e7d647f7f82d6ea98456b73908656    # EULA agreement marker, do not change
      - PRIVACY_AGREE=91e5db7659c560bc3545e63859b6ebc0 # Privacy agreement marker, do not change
      - WEBUI_HOST=0.0.0.0             # Must listen on 0.0.0.0 inside the container, or the host cannot reach it
    ports:
      - "18001:8001"                   # Host 18001 -> container 8001; change the left side if the host port is taken
    volumes:
      - ./docker-config/mmc:/MaiMBot/config     # Configuration files
      - ./data/MaiMBot:/MaiMBot/data            # Runtime data
      - ./data/MaiMBot/plugins:/MaiMBot/plugins # Plugins
      - ./data/MaiMBot/logs:/MaiMBot/logs       # Logs
    restart: always                    # Auto-restart after a crash or server reboot
```

:::

### Start

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker compose up -d
```

:::

The first launch will automatically generate configuration files.

**Data Storage Locations**

- **Configuration files** — `./docker-config/mmc/`
- **Runtime data** — `./data/MaiMBot/`
- **Plugins** — `./data/MaiMBot/plugins/`
- **Logs** — `./data/MaiMBot/logs/`

**Port Reference**

- **WebUI** — 18001 (mapped to 8001 inside the container)

::: warning
The default WebUI `host` is `127.0.0.1`, which inside a Docker container means only the container itself can access it. When deploying with Docker, make sure to change `host` to `0.0.0.0`.
:::

::: tip
If your server has the standalone Docker Compose installed, the command should be `docker-compose` (with a hyphen) instead of `docker compose`.
:::

## Direct Docker Image Deployment

If you just want to quickly pull and run the image without modifying any configuration, use this method:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker pull sengokucola/maibot:latest
```

:::

Then run the container directly:

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

This method only starts the MaiBot core. If you also need NapCat and database tools, use Docker Compose deployment instead.

## Building from Source with Docker

If you need to modify the source code, or cannot pull images directly from Docker Hub, you can build locally:

::: code-group

```bash [~vscode-icons:file-type-git~]
git clone https://github.com/Mai-with-u/MaiBot.git
```

:::

Enter the folder and build the image:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker build -t maibot .
```

:::

To run the container, the command is the same as direct image deployment, just replace the image name with the locally built `maibot`:

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

## Accessing WebUI

After starting, MaiBot automatically launches the WebUI service. Open your browser and visit the following address (replace `本机IP` with your server address; use `localhost` if running locally):

```
http://本机IP:18001
```

On first launch, the container log will print the WebUI login Token, like this:

```
07-30 18:53:45 [WebUI] WebUI 配置文件不存在，正在创建: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] WebUI 配置已保存到: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] 新的 WebUI Token 已生成: QSwgc2Vu...
07-30 18:53:45 [WebUI应用] 🔑 WebUI 登录 Token: 5YWz5rOo5Y+v5LmQ5Za1fiDlhbPms6jlj6/kuZDosKLosKLllrXvvIE=
07-30 18:53:45 [WebUI应用] 💡 请使用此 Token 登录 WebUI
07-30 18:53:45 [WebUI服务] 🌐 WebUI 服务器启动中...
```

Use this command to view container logs:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
docker compose logs core
```

:::

Copy the Token from the log and paste it into the browser login page to access WebUI. You can later view or modify the Token in `data/webui.json`.

Once in WebUI, follow the configuration wizard to set up models and connect platforms.

For detailed steps on configuring models and connecting QQ, refer to [Model Configuration](/en/manual/configuration/model-config) and [Adapters](/en/manual/adapters/).

## Verification & Troubleshooting

**Verify**: `docker compose ps` shows `core` as `Up`, and `curl -I http://127.0.0.1:18001` returns `200` or `307` — the container and WebUI are both ready.

**Container exits right after starting?**

- Check the logs first: `docker compose logs core`
- Common causes are insufficient permissions on mounted directories or missing paths in `docker-compose.yml`; fix per the log and retry with `docker compose up -d`

**Port already in use?**

- If the log says `port is already allocated`, change the host-side mappings for `18001`/`18002` in `docker-compose.yml`
- Or find the process with `ss -ltnp | grep 18001` and stop it

**WebUI unreachable from outside?**

- Confirm the container environment variable `WEBUI_HOST=0.0.0.0`
- On a cloud server, also allow port `18001` in the security group / firewall

**Can't find the login Token?**

- Filter the logs with `docker compose logs core | grep Token`
- The Token is also stored in `data/webui.json` for direct viewing

**Image pulls are slow?**

- Configure a Docker registry mirror and run `docker compose pull` again
