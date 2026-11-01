---
title: 实验性：桌面环境下一键包部署
---

# 实验性：桌面环境下一键包部署

在 Linux 桌面上点几下就能跑起 MaiBot：一键包（MaiBot OneKey Linux）是一个图形界面的部署工具，从安装主程序、配置模型到连接 QQ 全程不用敲命令，装完后的日常启停、更新和日志也都在这一个窗口里完成。

::: warning 实验性
一键包由社区维护（[MaiBotOneKey](https://github.com/Mai-with-u/MaiBotOneKey) 的 Linux 移植，非官方发行），已在 Ubuntu 22.04+ / Debian 12+（x86_64）实测跑通全流程。其他环境可能遇到没覆盖到的问题，欢迎到[仓库 Issues](https://github.com/Schaled/MaiBot-OneKey-Linux/issues) 反馈。
:::

## 它帮你做什么

::: fields
- **内嵌 Python 3.12** — 随环境自带，不需要也不改动系统 Python。
- **自动安装 MaiBot** — 首次启动从 PyPI 安装最新正式版，之后可在包内切换版本或回滚。
- **SnowLuma 协议端按需下载** — 首次使用时自动下载，sha256 校验，优先走 GitHub 加速代理，失败兜底官方源。
- **进程托管** — 服务启停、健康检查、崩溃自愈，附带内嵌终端与内嵌 WebUI。
- **同源 Windows 一键包** — 与官方 Windows 版同一套编排核心，用过 Windows 一键包的话上手零成本。
:::

<Linkcard url="https://github.com/Schaled/MaiBot-OneKey-Linux" title="MaiBot-OneKey-Linux" description="MaiBot OneKey 的 Linux 移植，源码与发布说明" logo="/title_img/mai.png" />

::: tip
没有图形界面的服务器可以用同一项目的 headless 命令行模式，见仓库内 [docs/linux.md](https://github.com/Schaled/MaiBot-OneKey-Linux/blob/main/docs/linux.md)。
:::

想用命令行或容器来管理，改走 [uv 安装](./uv-tool)、[Linux 源码部署](./linux)或 [Docker 部署](./docker)。

## 准备环境

- **系统** — x86_64，glibc ≥ 2.35：Ubuntu 22.04+ / Debian 12+ 实测定级，未提供 arm64 构建。
- **桌面环境** — 有图形界面即可；KDE（X11）完成过实机验收，GNOME 等其他桌面未逐一验证。
- **Git** — 一键包不自带，缺失时用系统包管理器装一个。
- **资源** — 至少 2GB 可用内存与 2GB 可用磁盘；首次启动需联网下载 MaiBot 和协议端。

先验证一下环境：

::: code-group

```bash [~vscode-icons:file-type-shell~]
ldd --version | head -1   # glibc 版本，需 ≥ 2.35
git --version
```

:::

## 部署步骤

::: steps

1. **下载安装包**

   两种形态任选：AppImage 免安装，加执行权限直接跑；deb 装进系统，Debian / Ubuntu 系适用。版本号以发布页为准：

   <Linkcard url="https://github.com/Schaled/MaiBot-OneKey-Linux/releases" title="MaiBot-OneKey-Linux Releases" description="下载最新版 AppImage / deb 与 SHA256SUMS 校验文件" logo="/title_img/mai.png" />

   ::: code-group

   ```bash [AppImage ~vscode-icons:file-type-shell~]
   chmod +x MaiBot-OK-0.7.3-linux.AppImage
   ./MaiBot-OK-0.7.3-linux.AppImage
   ```

   ```bash [deb ~vscode-icons:file-type-shell~]
   sudo dpkg -i MaiBot-OK-0.7.3-linux.deb
   ```

   :::

   发布页同时提供 `SHA256SUMS` 校验文件，可用 `sha256sum` 比对下载完整性。

2. **首次启动并确认协议**

   从应用菜单（deb）或直接运行（AppImage）打开一键包，确认用户协议后进入主界面。

3. **等待运行环境准备完成**

   一键包自动完成三件事：创建独立 Python 环境（内嵌 Python 3.12）→ 从 PyPI 安装 MaiBot 最新正式版 → 首次使用时下载 SnowLuma 协议端。完成后自动打开 MaiBot WebUI 的设置向导。

   ::: tip
   国内网络建议先在一键包设置的「通用」里把 Python 包源换成国内镜像，安装会快很多。
   :::

4. **在 WebUI 向导里配置模型**

   按向导提示填入模型 API Key 完成首次配置；各字段的详细说明见[模型配置](/manual/configuration/model-config)。

5. **添加消息平台并登录 QQ**

   默认协议端是 SnowLuma，无需 Docker。尚未添加平台时主界面只有一张「消息平台」卡片，点「新增平台」：

   - 保存 SnowLuma 的连接配置后，一键包自动把连接参数同步给 MaiBot 内置的[统一 QQ 连接器](/manual/adapters/qq-local-client)并启动协议端；
   - 打开 `http://127.0.0.1:5099`（SnowLuma WebUI，登录密码可在一键包的协议端设置里查看），扫码登录机器人 QQ 号。

   ::: warning
   这个 QQ 号就是机器人本体，须与 WebUI 中配置的机器人账号一致。
   :::

6. **验证部署**

   回到 WebUI（`http://127.0.0.1:8001`）的「聊聊」页发一句问候，麦麦正常回话即部署完成。之后启停服务、看日志、开终端都在一键包窗口里操作。

:::

## 数据与更新

实例数据在 `~/.local/share/maibot-onekey/instance`（`config/`、`data/`、`plugins/`、`logs/`），一键包运行环境在 `~/.local/share/maibot-onekey/payload`。备份与迁移的通用步骤见[备份与迁移](/faq/backup-and-migration)；迁移实例目录、从 NapCat 换 SnowLuma 等一键包通用问题见 [FAQ：一键包](/faq/one-key)。

- **更新 MaiBot** — 在一键包的更新窗口选择 PyPI 上的新版本安装；更新失败时用「恢复上一环境」退回，配置、数据库和插件随环境一起回滚。
- **升级一键包** — 目前未配置自动更新源，从发布页下载新版替换即可，实例数据会保留。

## 已知限制

::: fields
- **架构** — 仅 x86_64，未提供 arm64 构建。
- **NapCat** — Linux 上仅 Docker 路线（需要 Docker 权限），默认的 SnowLuma 不受影响。
- **自动更新** — 启动器未配置更新源，升级需手动下载新版替换。
- **真机登录** — QQ 扫码登录与消息收发未经过自动验收，出问题请到仓库反馈。
:::

## 验证与排错

**验证** — `http://127.0.0.1:8001` 能登录 WebUI，一键包状态页里 MaiBot 与协议端均为运行中，发消息能得到回复。

**一键包起不来** — 先在终端里直接运行 AppImage 看报错输出；确认 glibc ≥ 2.35、系统 Git 已安装。

**环境准备卡住或安装 MaiBot 失败** — 多为网络问题：把 Python 包源换成国内镜像后重试，或用一键包自带的检查与修复重装环境。

**SnowLuma 下载失败** — 一键包优先走 GitHub 加速代理，失败自动回退官方 Release；反复失败时检查网络与磁盘空间。

**QQ 扫码登录后收发不到消息** — 核对机器人 QQ 号与 WebUI 中的账号配置一致；连接问题按[统一 QQ 连接器](/manual/adapters/qq-local-client)的排错步骤排查。

**端口冲突（8001 / 5099）** — 停掉占用端口的程序，重启一键包。
