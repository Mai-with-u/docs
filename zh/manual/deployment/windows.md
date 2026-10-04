---
title: Windows 部署
---

# Windows 部署

## 系统要求

Windows 10 及以上版本，至少 2GB 可用内存。

## 一键包

推荐大多数用户使用一键包部署。一键包是一个桌面应用，会自动帮你管理 MaiBot 的安装、更新、启动和配置。

<Linkcard url="https://github.com/Mai-with-u/MaiBotOneKey/releases" title="MaiBot OneKey" description="前往 GitHub 下载最新版本的一键包" logo="/title_img/mai.png" />

也可以加入 QQ 群，从群文件获取，详见[交流群](/about/community)。

下载后双击安装包，按提示完成安装。首次启动时，一键包会自动配置 Python 环境并安装运行依赖，随后弹出配置向导，跟着提示完成即可。

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

启动后就可以直接在终端里和麦麦对话：`[debug].enable_console_input` 自 1.3.0 起默认开启，在交互式终端里可以输入普通消息，也可以输入 `/clear`、`/pm`、`/offline`、`/online` 等管理指令，输入 `exit()` 则只关闭终端输入、Bot 继续运行。用一键包自带的运行面板启动，或把输出重定向到文件时，stdin 不是交互式终端，会跳过终端输入并多打一条 warning，不影响 MaiBot 正常运行。

## 进入 WebUI

启动后，MaiBot 会自动打开 WebUI 服务。打开浏览器，访问以下地址：

```
http://localhost:8001
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

**验证**：启动后终端出现「WebUI 服务器启动中」，浏览器打开 `http://localhost:8001` 能看到登录页，说明部署成功。

**提示 `uv: command not found`？**

- 关闭终端重新打开，或把 uv 的安装目录加入 PATH 后重试

**依赖安装失败？**

- 确认 `python --version` 为 3.12 及以上
- 报 `No module named ...` 时回到项目目录重新执行 `uv sync`

**8001 端口被占用？**

- 用 `netstat -ano | findstr :8001` 找到占用进程的 PID，结束它后重新启动

**一直卡在用户协议？**

- 在终端输入「同意」并回车（不是 `yes` 或 `y`）

**一键包被杀毒软件拦截？**

- 将 MaiBot 安装目录和 `data/` 加入杀毒软件白名单后重试
