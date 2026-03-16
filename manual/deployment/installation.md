# 📦 安装指南

本指南将指导您部署麦麦聊天机器人。推荐使用 [uv](https://docs.astral.sh/uv/) 作为 Python 包管理器，它提供了更快的包安装速度和更好的依赖管理体验。传统 pip 方式同样可用。

## 安装与运行

### 前置准备
- [Python](https://www.python.org/) - 3.10 及以上版本
- [Git](https://git-scm.com/) - (可选)更方便的更新 MaiBot
- [uv](https://docs.astral.sh/uv/) - (可选)Python 包管理器
- **内存和磁盘空间**：- 请至少预留 2GB 内存和 2GB 的磁盘空间

### 下载

您可以通过以下两种方式获取 MaiBot：

**方式一：从 Releases 下载（推荐新手）**

访问 [GitHub Releases](https://github.com/MaiM-with-u/MaiBot/releases) 页面，下载最新版本的源码压缩包，解压后即可使用。

**方式二：使用 Git 克隆**

```bash
git clone https://github.com/MaiM-with-u/MaiBot.git
```

::: tip 国内镜像加速
如果克隆速度较慢，可使用镜像站加速：
```bash
git clone https://gh-proxy.com/https://github.com/MaiM-with-u/MaiBot.git
```
:::

### 创建虚拟环境

:::tabs key:platform-venv
== Windows

```bash
# uv
uv venv
# pip 
python -m venv venv
```

== Linux

```bash
# uv
uv venv
# pip 
python3 -m venv venv
```

== macOS

```bash
# uv
uv venv
# pip 
python3 -m venv venv
```
:::

### 激活虚拟环境

:::tabs key:platform-activate
== Windows

```bash
.\venv\Scripts\activate
```

== Linux

```bash
source ./venv/bin/activate
```

== macOS

```bash
source ./venv/bin/activate
```
:::

::: tip
使用 **uv** 方式时无需手动激活虚拟环境，`uv run` 命令会自动处理。
:::

### 安装依赖

:::tabs key:platform-deps
== Windows

```bash
# uv
uv pip install -r requirements.txt
# pip 
pip install -r requirements.txt
```

== Linux

```bash
# uv
uv pip install -r requirements.txt
# pip 
pip install -r requirements.txt
```

== macOS

```bash
# uv
uv pip install -r requirements.txt
# pip 
pip install -r requirements.txt
```

> `quick-algo` 包在 macOS 上可能需要手动编译，详见 [LPMM 知识库](/manual/configuration/lpmm/lpmm)。
:::

### 运行

:::tabs key:platform-run
== Windows

```bash
# uv
uv run python bot.py
# pip 
python bot.py
```

== Linux

```bash
# uv
uv run python3 bot.py
# pip 
python3 bot.py
```

== macOS

```bash
# uv
uv run python bot.py
# pip 
python bot.py
```
:::

## 配置

麦麦支持通过 WebUI 进行配置：

1. 启动程序后，在浏览器打开 `http://localhost:8001`（默认端口）
2. 通过 WebUI 完成 bot 配置、模型配置和适配器配置，具体教程可见[WebUI配置指南](/manual/configuration/config_windows_onekey_withwebui)。
3. 接入 QQ 请前往 [Adapters 文档中心](/manual/adapters/)。

::: tip
手动配置请参考 [配置指南](/manual/configuration/index)
:::

## 后台运行（Linux）

```bash
# 安装 screen（如未安装）
sudo apt install screen

# 启动
screen -S maibot
uv run python bot.py
# 按 Ctrl+a，再按 d 退出 screen，程序在后台运行
```

## 常见问题

- [Windows 常见问题](/manual/faq/windows)
- [Linux 常见问题](/manual/faq/linux)
- [macOS 常见问题](/manual/faq/macos)

---

遇到问题？请参考常见问题解答或加入 [麦麦社群](/manual/other/group) 获取帮助。
