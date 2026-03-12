# 统一安装指南

::: warning
本教程为部署到QQ平台的教程，不代表其他平台的部署方式相同
:::

::: tip
可在[麦麦QQ交流群](/manual/other/qq_group)群文件获取最新一键安装包。
:::

## 系统要求

| 要求 | Windows | Linux | macOS |
|------|---------|-------|-------|
| 操作系统 | Windows 10/11 | 主流发行版 | macOS 10.15+ |
| Python | ≥ 3.10 | ≥ 3.10 | ≥ 3.10 |
| 内存 | 4GB+ | 2GB+ | 4GB+ |
| 磁盘空间 | 5GB+ | 5GB+ | 5GB+ |
| 特殊要求 | - | python3-dev 包 | Xcode Command Line Tools |

本教程推荐使用 [uv](https://docs.astral.sh/uv/) 作为 Python 包管理器，pip 和 conda 方式同样可用。

## 安装步骤

### 1. 克隆仓库

:::tabs
== Windows
```shell
mkdir MaiBot && cd MaiBot
git clone https://github.com/MaiM-with-u/MaiBot.git
git clone https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter.git
```

== Linux
```bash
mkdir maimai && cd maimai
git clone https://github.com/MaiM-with-u/MaiBot.git
git clone https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter.git
```

== macOS
```bash
mkdir MaiM-with-u && cd MaiM-with-u
git clone https://github.com/MaiM-with-u/MaiBot.git
git clone https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter.git
```
:::

### 2. 配置 Python 环境

**安装 uv（推荐）**

:::tabs
== Windows
```shell
pip install uv
```

== Linux
```bash
# 确认 Python 版本
python3 --version

# 安装 python3-dev
sudo apt update && sudo apt install python3-dev

# 安装 uv
pip3 install uv --break-system-packages -i https://mirrors.huaweicloud.com/repository/pypi/simple/
```

== macOS
```bash
# 确认 Python 版本
python3 --version

# 如版本过低，通过 Homebrew 安装
brew install python@3.11

# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 添加到 PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
:::

### 3. 安装依赖

:::tabs
== Windows
```shell
cd MaiBot
uv venv
uv pip install -r .\requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade

cd ..\MaiBot-Napcat-Adapter
uv venv
uv pip install -r .\requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
```

== Linux
```bash
cd MaiBot
uv venv
uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade

cd ../MaiBot-Napcat-Adapter
uv venv
uv pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple --upgrade
```

== macOS
```bash
cd MaiBot
uv venv
uv pip install -r requirements.txt

cd ../MaiBot-Napcat-Adapter
uv venv
uv pip install -r requirements.txt
```
:::

::: tip
如果 `quick_algo` 安装失败，macOS 用户参考下方[手动编译](#macos-手动编译-quick_algo)章节，其他平台参考[LPMM知识库](/manual/configuration/lpmm/lpmm)。
:::

### 4. 复制配置文件

**Adapter 配置**

:::tabs
== Windows
```shell
cd MaiBot-Napcat-Adapter
copy template\template_config.toml config.toml
```

== Linux / macOS
```bash
cd MaiBot-Napcat-Adapter
cp template/template_config.toml config.toml
```
:::

**MaiBot 配置**

:::tabs
== Windows
```shell
cd ../MaiBot
mkdir config
copy template\bot_config_template.toml config\bot_config.toml
copy template\model_config_template.toml config\model_config.toml
copy template\template.env .env
```

== Linux / macOS
```bash
cd ../MaiBot
mkdir -p config
cp template/bot_config_template.toml config/bot_config.toml
cp template/model_config_template.toml config/model_config.toml
cp template/template.env .env
```
:::

### 5. 配置 Napcat

参考 [NapCatQQ 官方文档](https://napneko.github.io/) 部署，选择 Shell 版或 Framework 版：
- [Shell 版](https://napneko.github.io/guide/boot/Shell)
- [Framework 版](https://napneko.github.io/guide/boot/Framework)

配置 WebSocket 反向代理，记下设置的端口号。

### 6. 修改配置文件

**MaiBot `.env` 文件**
```env
PORT=8000
```

**Adapter `config.toml` 文件**
```toml
[Napcat_Server]
host = "localhost"
port = 8095        # 与 Napcat 设置的 WebSocket 端口一致
heartbeat = 30     # 与 Napcat 设置的心跳一致（秒）

[MaiBot_Server]
host = "localhost"
port = 8000        # 与 MaiBot 的 .env 中 PORT 一致
```

**注意**：Napcat 心跳单位为毫秒，Adapter 配置中为秒。

### 7. 运行

启动顺序：**Napcat → MaiBot → Adapter**

:::tabs
== Windows
```shell
# 终端 1：启动 MaiBot
cd MaiBot
uv run python .\bot.py

# 终端 2：启动 Adapter
cd ..\MaiBot-Napcat-Adapter
uv run python .\main.py
```

== Linux
```bash
# 终端 1：启动 MaiBot
cd MaiBot
uv run python bot.py

# 终端 2：启动 Adapter
cd ../MaiBot-Napcat-Adapter
uv run python main.py
```

== macOS
```bash
# 终端 1：启动 MaiBot
cd MaiBot
uv run python bot.py

# 终端 2：启动 Adapter
cd ../MaiBot-Napcat-Adapter
uv run python main.py
```
:::

**Linux 后台运行**
```bash
screen -S maibot
cd MaiBot && uv run python bot.py
# Ctrl+A, D 分离会话
# screen -r maibot 重新连接
```

---

## macOS 手动编译 quick_algo

由于 `quick_algo` 在 macOS 上预编译包可能不兼容，需手动编译：

```bash
# 克隆 LPMM 仓库
git clone https://github.com/MaiM-with-u/MaiMBot-LPMM.git
cd MaiMBot-LPMM

# 安装编译工具
xcode-select --install

# 安装依赖
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple

# 编译安装
cd lib/quick_algo
python build_lib.py --cleanup --cythonize --install
```

编译成功标志：`Successfully installed quick-algo-x.x.x`

---

## 参考链接

- [麦麦主仓库](https://github.com/MaiM-with-u/MaiBot)
- [Napcat Adapter](https://github.com/MaiM-with-u/MaiBot-Napcat-Adapter)
- [NapCatQQ 文档](https://napneko.github.io/)
- [配置指南](/manual/configuration/index)
- [QQ交流群](/manual/other/qq_group)
