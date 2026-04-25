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

### 安装项目依赖（给机器人装零件）

::: code-group

```bash [推荐：uv]
uv sync
```

```bash [备用：pip]
pip install -r requirements.txt
```

:::



## 配置

MaiBot 的配置文件在 `config/` 目录下：

| 文件 | 作用 | 看这里 |
|------|------|------|
| `bot_config.toml` | 基础配置 | [配置概览](../configuration/index.md) |
| `model_config.toml` | 模型设置 | [模型配置](../configuration/model-config.md) |

第一次启动时，MaiBot 会自动生成默认配置。你需要改两个地方：

1. **设置 QQ 账号**：在 `bot_config.toml` 中填写 `qq_account`（麦麦交互的QQ号）
2. **设置 AI 模型**：在 `model_config.toml` 中填写 `api_key`，并配置模型，最后为模型指派任务

## 启动

```bash
uv run python bot.py
```

## 用户协议确认

第一次启动会要求你同意用户协议，很简单：

**在终端输入"同意"就行！** 

## 常见问题（新手别怕）

### Python 版本不对？

MaiBot 需要 Python 3.13 以上。检查版本：

```bash
python --version
```

### 依赖装不上？

```bash
# 清除缓存重新装
uv sync --reinstall
```