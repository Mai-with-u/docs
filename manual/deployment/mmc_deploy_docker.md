# 🐳 Docker 部署

## 📋 环境要求

- ✅ 已安装 Docker 环境
- ⚙️ 最低系统配置：2 核 CPU / 2GB 内存 / 5GB 磁盘空间
- 🐧 本教程测试环境：Ubuntu Server 24.04 LTS

---

<!-- ::: warning
**升级到0.6.2时由于更换了adapter需要重新拉取docker-compose.yml和adapter相关配置(adapter配置方法见[修改相关配置](#⚙%EF%B8%8F-二、麦麦环境配置))，  
新版的adapter需要将napcat改为客户端([配置示例](#_5-2-⚙%EF%B8%8F-napcat配置入口))**
::: -->



## 🛠️ 一、准备麦麦部署环境

### 1.1 📂 创建项目目录

```bash
mkdir -p maim-bot/docker-config/{mmc,adapters} && cd maim-bot
```

### 1.2 📥 获取 Docker 编排文件

```bash
wget https://raw.githubusercontent.com/SengokuCola/MaiMBot/main/docker-compose.yml
```

> 🔄 **备用下载方式**  
> 若 GitHub 直连不稳定，可使用镜像源：
>
> ```bash
> wget https://github.moeyy.xyz/https://raw.githubusercontent.com/SengokuCola/MaiMBot/main/docker-compose.yml
> ```

> 使用本地构建镜像请跳转这里[本地构建流程](#本地构建流程)

---

## ⚙️ 二、麦麦环境配置

### 2.1 📝 准备配置文件模板

```bash
# 获取核心组件配置模板
wget https://raw.githubusercontent.com/MaiM-with-u/MaiBot/main/template/template.env \
     -O docker-config/mmc/.env
# 若 GitHub 直连不稳定，可使用镜像源：https://github.moeyy.xyz/https://raw.githubusercontent.com/MaiM-with-u/MaiBot/main/template/template.env
```

获取`adapter`的`config.toml`

```bash
wget https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter/raw/refs/heads/main/template/template_config.toml \
     -O docker-config/adapters/config.toml
# 若 GitHub 直连不稳定，可使用镜像源：https://github.moeyy.xyz/https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter/raw/refs/heads/main/template/template_config.toml
```

> 配置文件里的服务名如不可用可替换为容器名
>
> - `MaiBot_Server`配置可替换成`maim-bot-core`
> - `napcat`ws客户端可替换成`ws://maim-bot-adapters:8095`

[//]: # (> - `ONEBOT_WS_URLS`配置可替换成`ws://maim-bot-napcat:8095`)
[//]: # (> - `nonebot-qq`配置可替换成`http://maim-bot-adapters:18002/api/message`)



### 2.2   **预留文件**

- 这个文件是MaiBot运行统计报告。

`MacOS/Linux`

```bash
mkdir -p data/MaiMBot && touch ./data/MaiMBot/maibot_statistics.html
```

`Windows`

```cmd
mkdir data\MaiMBot && type nul > .\data\MaiMBot\maibot_statistics.html
```



### 2.3  ✏️ 修改相关配置

- 修改麦麦主程序的环境变量文件

```bash
vim docker-config/mmc/.env
```

需修改以下关键参数：

```ini
# 网络监听配置
HOST=0.0.0.0
```



- 修改适配器配置文件

```bash
vim docker-config/adapters/config.toml
```

修改`Napcat_Server`的host为`0.0.0.0`  
修改`MaiBot_Server`的host为`core`  

```toml
[napcat_server] # Napcat连接的ws服务设置
host = "0.0.0.0"      # Napcat设定的主机地址
port = 8095             # Napcat设定的端口 
heartbeat_interval = 30 # 与Napcat设置的心跳相同（按秒计）

[maibot_server] # 连接麦麦的ws服务设置
host = "core" # 麦麦在.env文件中设置的主机地址，即HOST字段
port = 8000        # 麦麦在.env文件中设置的端口，即PORT字段
```



### 2.3 📜 取消注释docker-compose.yml的eula

```bash
vim docker-compose.yml
# 取消注释以下两行（30-31行）
- EULA_AGREE=bda99dca873f5d8044e9987eac417e01  # 同意EULA
- PRIVACY_AGREE=42dddb3cbe2b784b45a2781407b298a1 # 同意EULA
```



### 2.4  数据库管理工具

- **如果不使用sqlite-web则取消chat2db的注释并给sqlite-web部分加上注释（或者删除）**


```bash
  #sqlite-web:
  #  # 注意：coleifer/sqlite-web 镜像不支持arm64
  #  image: coleifer/sqlite-web
  #  container_name: sqlite-web
  #  restart: always
  #  ports:
  #    - "8120:8080"
  #  volumes:
  #    - ./data/MaiMBot:/data/MaiMBot
  #  environment:
  #    - SQLITE_DATABASE=MaiMBot/MaiBot.db  # 你的数据库文件
  #  networks:
  #    - maim_bot

  # chat2db占用相对较高但是功能强大
  # 内存占用约600m，内存充足推荐选此
   chat2db:
     image: chat2db/chat2db:latest
     container_name: maim-bot-chat2db
     restart: always
     ports:
       - "10824:10824"
     volumes:
       - ./data/MaiMBot:/data/MaiMBot
     networks:
       - maim_bot
```



### 2.5  目录结构

- 当前配置完成后目录结构应如下

```text
.
├── docker-compose.yml
├── data
    ├── MaiMbot
        └── maibot_statitics.html
└── docker-config
    ├── adapters
    │   └── config.toml
    └── mmc
        └── .env
```

---



## 🚀 三、初始化容器环境

### 3.1 ⚡ 首次启动容器生成剩余配置文件

- 会自动生成麦麦主程序的基础配置和模型配置文件

```bash
docker compose up -d && sleep 15 && docker compose down
```



### 3.2 🔧 调整麦麦配置

> 请根据需要自行修改
> 配置文件相关说明见[配置指南](/manual/configuration/index.md)

- `bot_config.toml`：基础配置文件，包含麦麦名字、qq号、人设等。

```bash
vim docker-config/mmc/bot_config.toml
```



- `model_config.toml`：模型配置文件，包含了服务商、使用哪个模型等。

```bash
vim docker-config/mmc/model_config.toml
```





---

## 🎉 四、启动麦麦

::: tip

注意：以下操作都是在 `maim-bot`目录下执行的。

:::

### 4.1 🏁 启动所有组件

```bash
docker compose up -d
```

### 4.2 🔍 验证服务状态

```bash
docker compose ps
```

- 正常应显示 4 个容器（maim-bot-core、maim-bot-adapters、maim-bot-napcat、sqlite-web[或chat2db]）状态为 `running`

```bash
NAME                IMAGE                           COMMAND                  SERVICE     CREATED          STATUS          PORTS
maim-bot-adapters   unclas/maimbot-adapter:latest   "python main.py"         adapters    34 minutes ago   Up 34 minutes   8095/tcp
maim-bot-core       sengokucola/maimbot:main        "python bot.py"          core        34 minutes ago   Up 34 minutes   8000/tcp
maim-bot-napcat     mlikiowa/napcat-docker:latest   "bash entrypoint.sh"     napcat      34 minutes ago   Up 34 minutes   0.0.0.0:6099->6099/tcp, [::]:6099->6099/tcp
sqlite-web          coleifer/sqlite-web             "/bin/ash -c 'sqlite…"   sqlite-web  34 minutes ago   Up 34 minutes   0.0.0.0:8120->8080/tcp   
```



### 4.3 📜 实时日志监控

- 实时查看所有容器日志

```bash
docker compose logs -f
```



- 实时查看某个容器日志

```bash
# 例如只想看主程序日志
docker compose logs -f core
```





---

## 🔧 五、后续管理操作

### 5.1 🎛️ 服务启停命令

| 操作 | 命令 |
|------|------|
| ▶️ 启动服务 | `docker compose up -d` |
| ⏹️ 停止服务 | `docker compose down` |
| 🔄 强制重建 | `docker compose up -d --force-recreate` |



### 5.2 ⚙️ Napcat配置入口

访问 `http://<服务器IP>:6099` 完成 Napcat 的配置
> 网络配置使用`websocket客户端`，`url`为`ws://adapters:8095`
> 例：
>
> ![](/images/napcat_network_webcoket.png)
>
> ![Napcat配置](/images/mmc-napcat-client.png)


### 5.3 chat2db参数设置（如果启用）

访问 `http://<服务器IP>:10824` 完成 chat2db 的配置
>数据库选择`SQLite`,`file`为`/data/MaiMBot/MaiBot.db`
>例：
>![chat2db配置](/images/mmc-chat2db.png)






---

## 六、❓ 常见问题排查

1. ❌ **容器启动失败**：
   - 🔍 检查端口冲突（18002/8000/8095/6099/8120/10824）
      > 如未映射请忽略
   - 🔑 验证 `.env` 文件中的 API 密钥有效性

   
   
2. 🔄 **配置文件更新**：
   修改配置后需执行：

   ```bash
   docker compose down
   docker compose up -d
   ```

   或：

   ```bash
   docker compose restart
   ```

3. 📊 **资源监控**：

   ```bash
   docker stats
   ```

> 💡 提示：遇到问题时可以查看日志获取更多信息：
>
> ```bash
> docker compose logs -f
> ```





---

## 七、本地构建流程

### 准备必要的文件

1. 通过 git clone 将 [麦麦](https://github.com/MaiM-with-u/MaiBot) clone 到本地

2. 通过 git clone 将 [MaiMBot-LPMM 包](https://github.com/MaiM-with-u/MaiMBot-LPMM) clone 到本地

3. 通过 git clone 将 [MaiBot-Napcat-Adapter](https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter) clone 到本地

```shell
git clone https://github.com/MaiM-with-u/MaiBot.git
git clone https://github.com/MaiM-with-u/MaiMBot-LPMM.git
git clone https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter.git
```

> 如需切换分支在链接后面加`-b <分支名>`即可  

复制`MaiMBot-LPMM`到`MaiBot`目录下

```bash
cp -r MaiMBot-LPMM MaiBot/MaiMBot-LPMM 
```

拉取所需的镜像

```bash
sudo docker pull python:3.13.5-slim-bookworm
sudo docker pull python:3.13.5-slim
sudo docker pull ghcr.io/astral-sh/uv:latest
```

运行构建

```bash
cd MaiBot
sudo docker build -t mmc:local .
cd ../MaiBot-Napcat-Adapter
sudo docker build -t adapters:local .
```

想要使用本地构建将`docker-compose.yml`的`image`替换即可

---
