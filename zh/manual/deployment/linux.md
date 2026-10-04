---
title: Linux 部署
---

# Linux 部署

在 Linux 上跑 MaiBot 最直接的方式就是源码部署。本指南覆盖大多数主流发行版，macOS 用户也可以跟着做。如果你不想折腾 Python 环境，也可以直接用 [Docker 部署](./docker)。

## 准备环境

MaiBot 需要 [Python](https://www.python.org/downloads/) 3.12、[Git](https://git-scm.com/downloads)，以及至少 2GB 可用内存。

先验证一下你的环境：

::: code-group

```bash [~vscode-icons:file-type-shell~]
python3 --version
git --version
```

:::

如果版本不满足要求，按你的发行版安装：

::: code-group

```bash [Ubuntu / Debian ~vscode-icons:file-type-shell~]
sudo apt update && sudo apt install -y python3.12 python3-pip git
```

```bash [Fedora / RHEL ~vscode-icons:file-type-shell~]
sudo dnf install -y python3.12 git
```

```bash [Arch Linux ~vscode-icons:file-type-shell~]
sudo pacman -S python git
```

:::

::: tip
MaiBot 要求 Python 3.12 及以上。如果系统自带的版本较低，建议用 pyenv 或发行版提供的最新包升级。
:::

## 源码部署

### 安装 uv

我们推荐用 uv 管理依赖，它比传统 pip 快很多。

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

:::

::: tip
如果安装后终端提示 `uv: command not found`，运行 `source $HOME/.local/bin/env` 刷新环境变量，或者重新打开一个终端窗口。
:::

### 下载 MaiBot

::: code-group

```bash [~vscode-icons:file-type-git~]
git clone https://github.com/Mai-with-u/MaiBot.git
```

:::

进入文件夹，安装依赖：

::: code-group

```bash [uv sync ~vscode-icons:file-type-python~]
uv sync
```

```bash [pip install ~vscode-icons:file-type-python~]
pip install -r requirements.txt
```

:::

### 启动

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
uv run bot.py
```

:::

第一次启动会弹出用户协议，在终端输入 **同意** 即可继续。

启动后就可以直接在终端里和麦麦对话：`[debug].enable_console_input` 自 1.3.0 起默认开启，在交互式终端里可以输入普通消息，也可以输入 `/clear`、`/pm`、`/offline`、`/online` 等管理指令，输入 `exit()` 则只关闭终端输入、Bot 继续运行。用 systemd 托管或把输出重定向到文件时，stdin 不是交互式终端，会跳过终端输入并多打一条 warning，不影响 MaiBot 正常运行。

## 进入 WebUI

启动后，MaiBot 会自动打开 WebUI 服务。打开浏览器，访问以下地址（把 `本机IP` 换成你的服务器地址，本机就是 `localhost`）：

```
http://本机IP:8001
```

首次启动时，终端会打印出 WebUI 的登录 Token，类似于这样：

```
07-30 18:53:45 [WebUI] WebUI 配置文件不存在，正在创建: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] WebUI 配置已保存到: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] 新的 WebUI Token 已生成: QSwgc2Vu...
07-30 18:53:45 [WebUI应用] 🔑 WebUI 登录 Token: QSwgc2VucGFp77yBQ2lhbGxv772eKOKIoOODu8+JPCAp4oyS4piF
07-30 18:53:45 [WebUI应用] 💡 请使用此 Token 登录 WebUI
07-30 18:53:45 [WebUI服务] 🌐 WebUI 服务器启动中...
```

复制日志中的 Token，在浏览器登录页面粘贴即可进入 WebUI。后续可以在 `data/webui.json` 中查看或修改 Token。

进入 WebUI 后，跟随配置向导完成模型配置和平台连接即可。

配置模型和连接 QQ 的详细步骤，参考 [模型配置](/manual/configuration/model-config) 和 [适配器](/manual/adapters/)。

## 验证与排错

**验证**：启动后终端出现「WebUI 服务器启动中」，执行 `curl -I http://127.0.0.1:8001` 返回 `200` 或 `307`，说明服务已就绪。

**提示 `uv: command not found`？**

- 执行 `source $HOME/.local/bin/env` 刷新环境变量，或重新打开终端

**`pip install` 编译失败？**

- Ubuntu / Debian 先装编译依赖：`sudo apt install -y build-essential python3.12-dev`
- 再重新执行安装命令

**Python 版本低于 3.12？**

- 按发行版包或 pyenv 升级到 3.12+，用 `python3 --version` 确认后再安装依赖

**本机能开、外部打不开？**

- 检查云服务器安全组 / 防火墙是否放行 `8001`（如 `sudo ufw allow 8001`）

**进程被 `Killed`？**

- 内存不足 2GB 时会被系统杀掉，增加内存或配置 swap 后重试
