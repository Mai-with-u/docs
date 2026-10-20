---
title: Windows 部署
---

# Windows 部署

想通过命令行安装主程序和 WebUI，可以使用 [uv 安装](./uv-tool)。下面介绍一键包和源码部署。

## 系统要求

Windows 10 及以上版本，至少 2GB 可用内存。

## 一键包

推荐大多数用户使用一键包部署。一键包是一个桌面应用，会自动帮你管理 MaiBot 的安装、更新、启动和配置。

<Linkcard url="https://github.com/Mai-with-u/MaiBotOneKey/releases" title="MaiBot OneKey" description="前往 GitHub 下载最新版本的一键包" logo="/title_img/mai.png" />

也可以加入 QQ 群，从群文件获取，详见[交流群](/about/community)。

不想自己盯每一步的话，也可以把[安装提示词](./installation-agent)交给 AI 助手，让它照着源码部署流程代劳。

不想维护 Git 仓库、或者想从 WebUI 一键更新主程序，用[程序包安装与更新](./update.md)。

::: tip
遇到问题可以先看看[常见问题](/faq/)，大部分常见情况都有覆盖。
:::

## 源码部署

如果你更习惯用命令行，或者想参与开发，可以用源码部署。

需要先装好 [Python](https://www.python.org/downloads/) 3.12+ 和 [Git](https://git-scm.com/downloads)。

安装 uv：

::: code-group

```powershell [PowerShell ~vscode-icons:file-type-shell~]
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

:::

克隆仓库：

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

启动：

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
uv run bot.py
```

:::

第一次启动会要求同意用户协议，在终端输入「同意」即可。

## 进入 WebUI

启动后，MaiBot 会自动打开 WebUI 服务。打开浏览器，访问以下地址：

```
http://localhost:8001
```

首次启动时，终端会打印出 WebUI 的登录 Token，类似于这样：

```
07-30 18:53:45 [WebUI] WebUI 配置已保存到: /MaiMBot/data/webui.json
07-30 18:53:45 [WebUI] 新的 WebUI Token 已生成: QSwgc2Vu...
07-30 18:53:45 [WebUI应用] 🔑 WebUI 登录 Token: QSwgc2VucGFp77yBQ2lhbGxv772eKOKIoOODu8+JPCAp4oyS4piF
07-30 18:53:45 [WebUI应用] 💡 请使用此 Token 登录 WebUI
```

复制日志中的 Token，在浏览器登录页面粘贴即可进入 WebUI。后续可以在 `data/webui.json` 中查看或修改 Token。

进入 WebUI 后，跟随配置向导完成模型配置和平台连接即可。

配置模型和连接 QQ 的详细步骤，参考 [模型配置](/manual/configuration/model-config) 和 [适配器](/manual/adapters/)。

## 验证与排错

**验证** — 启动后终端打印 WebUI 地址与登录 Token；浏览器打开 `http://localhost:8001` 能登录，并在终端输入一句话能得到回复。

**`uv: command not found`** — 重新打开 PowerShell，或按 uv 安装脚本的提示把 `%USERPROFILE%\.local\bin` 加入 PATH。

**Python 版本低于 3.12** — 安装新版 Python 后重新执行 `uv sync`。

**依赖安装失败** — 检查网络与磁盘空间后重试；国内网络可以给 uv 配置 PyPI 镜像。

**WebUI 打不开** — 确认 `[webui].enabled = true`、8001 端口未被占用；远程访问时在 Windows 防火墙放行该端口。
