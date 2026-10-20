---
title: 程序包安装与更新
---

# 程序包安装与更新

**不想维护 Git 仓库，或者想在 WebUI 里一键升级主程序，就用程序包安装。** 程序包把 MaiBot 装进独立的 Python 环境，配置、数据和插件仍然放在你自己指定的实例目录里。

::: tip 适合谁
- 只运行 MaiBot、不修改源码的用户
- 希望从 WebUI「设置 → 关于」直接检查并更新主程序的用户
- 服务器上没有 Git、或不想让更新依赖 Git 仓库状态的用户

需要改源码、跟分支开发，仍建议用[源码部署](./linux.md)或 [Docker 部署](./docker.md)。
:::

## 安装程序包

需要 Python 3.12 及以上。推荐用 uv 安装到独立工具环境：

::: code-group

```bash [uv 安装 ~vscode-icons:file-type-python~]
uv tool install maibot
```

```bash [pip 安装 ~vscode-icons:file-type-python~]
pip install -U maibot
```

:::

安装完成后，初始化一个实例目录。目录可以放在任何位置，例如 `~/MaiBot`：

::: code-group

```bash [初始化实例 ~vscode-icons:file-type-shell~]
maibot init --directory ~/MaiBot
```

:::

这一步会生成 `config/bot_config.toml`、`config/model_config.toml`，并创建 `data/`、`logs/`、`plugins/`、`temp/`。已有的配置文件会保留，不会被覆盖。

编辑 `~/MaiBot/config/model_config.toml`，至少填好一个 API 提供商、一个模型，以及 `replyer` / `planner` / `utils` 三个任务；然后启动：

::: code-group

```bash [启动 ~vscode-icons:file-type-shell~]
maibot run --directory ~/MaiBot
```

:::

启动后 WebUI 默认在 `http://127.0.0.1:8001`，登录 Token 打印在终端日志里。后续配置模型和连接平台可以全程在 WebUI 完成。

::: warning 必须用 maibot run 启动
程序包安装的自更新和重启依赖 `maibot run` 的实例租约。直接用 `python` 运行包内模块不会获得自更新能力。
:::

## 更新主程序

### 从 WebUI 更新

打开 **设置 → 关于**，点「检查更新」：

- **Git 部署** — 按所选更新来源检查 `main` 或 `dev` 分支，列出待更新提交；点「更新」后同步代码与依赖，成功后自动重启。依赖同步失败会自动回滚到更新前的版本
- **程序包安装** — 从 PyPI（或镜像源）检查正式版本；更新只替换程序本身，实例目录里的配置、数据、日志和插件不受影响

有可用更新时，顶栏右上角也会出现更新卡片，点进去即可查看。

更新前建议备份 `config/`、`data/` 和 `plugins/`。更新过程会重启 MaiBot，正在生成的回复会中断。

### 更新来源

Git 部署可以在检查更新时选择来源；程序包安装可以选择 PyPI、清华或阿里云镜像。国内网络访问 GitHub 较慢时，切换到 CNB 或镜像源通常更快。

## 验证与排错

**验证** — 运行 `maibot --version` 应输出版本号；`maibot run --directory <实例目录>` 能正常启动并打开 WebUI。从 WebUI 更新后，「设置 → 关于」会显示当前版本与最近一次更新结果。

**提示「实例未初始化」** — `run` 只接受已经执行过 `init` 的目录。先运行 `maibot init --directory <实例目录>`，再启动。

**更新检查显示被阻止** — 常见原因：工作区有未提交改动、当前是分离头指针、分支不是 `main` / `dev`、更新会改变 Python 版本要求、本地缺少依赖同步工具。按页面提示处理后再检查；改过源码的部署建议继续用 Git 手动更新。

**依赖同步失败** — 自更新会自动回滚并保留原版本。查看日志里的失败阶段与命令输出，确认磁盘空间和网络可用后重试。

**更新后打不开 WebUI** — 先确认进程已经重启完成；查看 `logs/` 下最新日志的报错。程序包安装可执行 `maibot --version` 确认版本，必要时用 `uv tool install --force maibot` 或 `pip install -U --force-reinstall maibot` 重装程序包，实例数据不会丢失。
