---
title: 部署概览
---

# MaiBot 部署概览

**MaiBot 是一个拟人化的智能体**，可以陪你聊天，不断学习了解你，搜集信息，或者用插件或者mcp扩展能力。

MaiBot可以通过本地命令行对话，也可以通过适配器插件连接到不同的IM平台或者任意客户端。

目前QQ（NapCat）平台是使用最多，兼容最好的平台，本教程将会以QQ平台作为使用示例。

## 部署准备

📱 **一个 QQ 小号**（用来登录QQ的NapCat客户端）

🔑 **一个 AI 模型的 API 密钥（需要拥有识图模型和嵌入模型）**

## 📦 部署方式选择

MaiBot 提供 2 种安装方式，任选其一即可：

| 方式 | 适合人群 |
|------|---------|
| [源码安装](./installation.md) | 想自己折腾、控制细节的用户 |
| [Docker 部署（文档有待更新）](./docker.md) | 想一键部署、服务器用户 |

::: tip 💡 如何连接QQ
第一次用？建议按这个顺序：

1. **先安装 MaiBot并启动一次**
2. **再连接 QQ（也可以使用其他IM平台）** → [NapCat 适配器（文档有待更新）](../adapters/napcat.md)
3. **最后配置 AI 模型和微调设置** → [配置指南](../configuration/index.md)
:::

## 3 分钟快速开始

如果你已经准备好了 Python 环境和 AI API，可以直接开干：

```bash
# 1. 下载 MaiBot
git clone https://github.com/Mai-with-u/MaiBot.git
cd MaiBot

# 2. 安装依赖
uv sync

# 3. 启动！
uv run python bot.py
```
