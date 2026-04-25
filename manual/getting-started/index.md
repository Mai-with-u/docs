---
title: 快速上手
---

# 🚀 MaiBot 快速上手

**欢迎使用 MaiBot！** 本文档会带你从零开始，让麦麦成功跑起来。

## 📋 准备工作

你需要准备以下 3 样东西：

### 1️⃣ 一个 QQ 小号 🆔

- **必须是 QQ 小号**（机器人账号有被限制登录的风险，不要用主号）
- **能正常登录**（建议先在手机上确认账号正常）

### 2️⃣ 一个 AI 模型的 API 密钥 🔑

MaiBot 需要调用大语言模型来思考和回复。**首次启动时会自动生成默认配置，默认使用阿里云百炼（通义千问）**，你只需要获取百炼的 API 密钥即可。

| 服务商 | 价格 | 特点 | 获取方式 |
|--------|------|------|----------|
| **阿里云百炼 (Qwen)** 🏆 默认 | 便宜 | 默认集成，国内直连稳定；通义千问全系列 + 第三方模型，**文本/视觉/向量**全能力覆盖 | [百炼控制台](https://bailian.console.aliyun.com/) → API-KEY |
| **硅基流动** | 便宜 | 聚合 200+ 模型（DeepSeek、Qwen、GLM 等），**一个 API Key 覆盖文本/视觉/向量**，支持支付宝/微信支付 | [官网注册](https://cloud.siliconflow.cn/) |
| **DeepSeek** | 极低 | 极致性价比，推理能力顶尖（V4 支持 1M 超长上下文），MIT 开源可自托管 | [官网注册](https://platform.deepseek.com/) |
| **智谱 GLM** | 免费起 | 清华大学团队出品，**文本/视觉/向量全支持**；Flash 系列**永久免费**，新用户送 2000 万 tokens | [智谱开放平台](https://open.bigmodel.cn/) |
| **Kimi (Moonshot)** | 中等 | **超长上下文（262K）**，原生多模态（文本+图片+视频理解），中英双语能力出色 | [官网注册](https://platform.moonshot.cn/) |

::: tip 💡 新手推荐
- **不想折腾？用阿里云百炼** — 默认配置直接可用，只需填 API Key
- **追求极致性价比？用 DeepSeek** — 极低价格获得顶级推理能力
- **想要免费？用智谱 GLM** — Flash 模型永久免费，注册即送 2000 万 tokens
- 大部分服务商提供**免费试用额度**，可以先体验再决定
:::

MaiBot 通过 Git 下载和管理代码。从 [git-scm.com](https://git-scm.com/) 下载安装。


## 🏃‍♂️ 安装步骤

### 第 1 步：下载 MaiBot 📥

**方法一：下载压缩包（Windows 新手推荐）**

1. 访问 [MaiBot Releases 页面](https://github.com/Mai-with-u/MaiBot/releases)
2. 找到最新版本，展开 **Assets**，下载 **Source code (zip)**
3. 解压到你想要的位置（比如桌面）

**方法二：Git 克隆**（如果你装了 Git）

```bash
git clone https://github.com/Mai-with-u/MaiBot.git
```

如需使用开发分支：

```bash
git checkout dev
```

### 第 2 步：安装 Python 🐍

> MaiBot 需要 **Python 3.10 及以上版本**（推荐 3.12 / 3.13）。

1. 访问 [python.org](https://www.python.org/downloads/) 下载 Windows 安装包
2. **安装时务必勾选 "Add Python to PATH"**
3. 打开命令提示符（`Win + R` → 输入 `cmd` → 回车），验证安装：

```bash
python --version
```

### 第 3 步：安装 uv（包管理器）📦

MaiBot 使用 [uv](https://docs.astral.sh/uv/) 管理依赖，速度比 pip 快很多。

在命令提示符中运行：

```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

安装完成后**关闭并重新打开**命令提示符。

### 第 4 步：安装项目依赖

进入你解压好的 MaiBot 文件夹，在地址栏输入 `cmd` 回车打开命令提示符，运行：

```bash
uv sync
```

这会创建虚拟环境（`.venv`）并安装所有依赖，大概需要几分钟。

::: tip 💡 国内用户
MaiBot 已配置清华镜像源，`uv sync` 会自动使用，无需手动设置。
:::

### 第 5 步：首次启动（生成配置 + 同意协议）

```bash
uv run python bot.py
```

**首次启动时，终端会显示用户协议（EULA）和隐私协议，输入 `同意` 并回车以继续。** 之后系统检测到配置文件不存在，自动生成默认配置到 `config/` 目录，然后退出——**这是正常行为**。

### 第 6 步：再次启动，进入 WebUI

```bash
uv run python bot.py
```

这次启动后，你会看到类似这样的日志：

```
🌐 WebUI 服务器启动中...
🌐 访问地址: http://127.0.0.1:8001
🔑 WebUI 访问令牌: e7b2a4f1...（一长串字符）
💡 请在浏览器中打开访问地址，输入上面的访问令牌进行登录
```

### 第 7 步：浏览器打开 WebUI，完成设置 🌐

1. 打开浏览器，访问 **http://127.0.0.1:8001**
2. 你会看到一个登录页面，**输入终端里那串访问令牌（Access Token）**
3. 登录成功后，如果是首次使用，会自动进入**配置向导**
4. 在向导中填写 **API 密钥**（只需要填这个，其他都有默认值）
5. 完成后系统标记初始化完成，进入正常管理界面

::: tip 💡 所有配置都在 WebUI 上操作
修改昵称、人格、聊天频率、模型等，都可以在 WebUI 的"配置管理"中在线修改，**无需手动编辑文件**，保存即生效。
:::

## 📱 连接 QQ

MaiBot 核心启动后，还需要连接 QQ 才能收发消息。MaiBot 通过 **NapCat** 实现 QQ 接入。

### 安装 NapCat

参照 [NapCat 官方安装指南](https://napneko.github.io/guide/install) 安装并登录你的 QQ 小号。

### 安装 NapCat 适配器

在 MaiBot WebUI 中（浏览器访问 `http://127.0.0.1:8001`）：

1. 点击左侧菜单 **"插件管理"**
2. 搜索 **"NapCat 适配器"**
3. 点击安装

安装完成后，根据适配器的配置说明填写 NapCat 的连接地址即可。

::: tip 💡 更多适配器信息
详细的 NapCat 适配器安装和配置请参考 [NapCat 适配器文档](../adapters/napcat.md)。
:::


## 🎉 开始聊天

### 测试机器人

在 QQ 群里 @机器人，或者在私聊中发送消息：

```
@麦麦 你好！
```

如果机器人回复你了，恭喜，部署成功！🎉


## 🆘 常见问题

### 启动后自动退出？

查看日志确认原因，在命令提示符中运行：

```bash
uv run python bot.py
```

常见原因：

- **API 密钥未填写** — `model_config.toml` 中的 `api_key` 还是 `your-api-key`
- **配置格式错误** — TOML 文件语法不正确
- **端口被占用** — 默认 8001 端口被其他程序占用

### 机器人不回复？

按顺序排查：

1. ✅ NapCat 是否在线？（NapCat 界面显示已登录）
2. ✅ API 密钥是否正确？（WebUI 配置中检查）
3. ✅ 插件是否已安装？（WebUI 插件管理中确认）
4. ✅ 日志是否有报错？（WebUI 日志页面查看）

### API Key 无效？

- 确认没有多余的空格
- 检查 API 服务商选择是否正确
- 确认账户是否有余额或免费额度

### 浏览器打不开？

- 确认 MaiBot 正在运行（终端窗口是打开的）
- 检查地址是否正确：`http://127.0.0.1:8001`
- 防火墙是否允许

### 如何修改配置？

- **通过 WebUI**：浏览器访问 `http://127.0.0.1:8001`，在配置管理页面修改
- **直接编辑文件**：修改 `config/bot_config.toml` 或 `config/model_config.toml`
- 修改后无需重启，MaiBot 支持**配置热重载**（大部分配置保存即生效）


## 🎯 下一步

恭喜你成功部署了 MaiBot！接下来可以：

- 📚 **[配置详解](../configuration/)** — 调整人格、聊天频率、记忆等参数
- 🔌 **[插件开发](../../develop/plugin-dev/)** — 为麦麦开发新功能
- 🧠 **[了解麦麦的大脑](../../manual/features/maisaka-reasoning.md)** — 深入理解 MaiBot 的推理机制
- 💬 **邀请麦麦进群** — 和朋友们一起玩


**遇到问题？** 加入技术交流群提问：[麦麦脑电图](https://qm.qq.com/q/RzmCiRtHEW)

**祝你玩得开心！**
