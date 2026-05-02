---
title: 安装指南
---

# 📦 MaiBot 安装指南

## 下载 MaiBot

从 [GitHub Release](https://github.com/Mai-with-u/MaiBot/releases/) 下载最新版本，或者直接克隆仓库：

::: code-group

```bash [稳定版 (推荐)]
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
```

```bash [开发版 (尝鲜)]
git clone -b dev https://github.com/Mai-with-u/MaiBot.git
cd MaiBot
```

:::

::: warning ⚠️ 注意
`dev` 分支有新功能但可能不稳定。第一次用建议选 `main` 分支。
:::

## 安装依赖

MaiBot 用 [uv](https://github.com/astral-sh/uv) 管理依赖。

### 安装 uv

::: code-group

```bash [Windows]
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

```bash [macOS / Linux]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

:::

### 安装项目依赖

::: code-group

```bash [推荐：uv]
uv sync
```

```bash [备用：pip]
pip install -r requirements.txt
```

:::


## 启动

```bash
uv run python bot.py
```

## 用户协议确认

第一次启动会要求你同意用户协议，很简单：

**在终端输入"同意"就行！** 

## 常见问题

### 首次启动提示配置文件不存在？

某些版本在首次启动时可能不会自动生成配置文件，会报错：

```
FileNotFoundError: [Errno 2] No such file or directory: 'config/bot_config.toml'
```

**解决方法**：手动创建 `config/` 目录和一个最小配置文件，然后重新启动，程序会自动检测旧版本并升级到完整配置。

```bash
mkdir -p config
echo -e '[inner]\nversion = "0.0.1"' > config/bot_config.toml
echo -e '[inner]\nversion = "0.0.1"' > config/model_config.toml
uv run python bot.py
```

程序会提示「配置文件已经更新」，然后退出。此时再启动就能正常加载配置了。

### 启动后提示"模型列表不能为空"？

`model_config.toml` 中必须至少包含一个模型配置。如果自动升级失败，需要手动创建模型配置文件，包括：
- 至少一个 API 提供商（`[[api_providers]]`）
- 至少一个文本模型（`[[models]]`）
- 一个视觉模型（`[[models]]`，设置 `visual = true`）
- 一个嵌入模型（`[[models]]`）
- 对应的任务分配（`[model_task_config.xxx]`）

参考 [模型配置文档](../configuration/model-config.md) 进行配置。

### uv 命令找不到？

安装 uv 后需要将其加入 PATH 环境变量：

```bash
# Linux/macOS
source $HOME/.local/bin/env

# 或者重新打开终端

# 验证安装
uv --version
```

### 非交互环境下如何同意用户协议？

在服务器或无头环境下，无法在终端中输入"同意"，可以使用环境变量跳过：

```bash
# 方法一：使用程序提示的 hash 值（每次可能不同，以实际提示为准）
export EULA_AGREE=<终端显示的hash值>
export PRIVACY_AGREE=<终端显示的hash值>

# 方法二：先运行一次看提示的 hash 值，记录后用环境变量启动
uv run python bot.py  # 会显示需要的环境变量
```

### 如何确认适配器插件已启用？

启动 MaiBot 后查看日志：
- ✅ 已启用：`插件 maibot-team.napcat-adapter ... 激活`
- ❌ 未启用：`插件 maibot-team.napcat-adapter 已在配置中禁用，跳过激活`

插件默认是禁用的，需要手动启用。详见 [NapCat 适配器文档](../adapters/napcat.md#⚠️-重要插件默认未启用)。