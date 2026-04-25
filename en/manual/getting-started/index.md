---
title: Quick Start
---

# 🚀 MaiBot Quick Start

**Welcome to MaiBot!** This guide will walk you through getting MaiBot up and running from scratch.

## 📋 Prerequisites

You'll need these 3 things ready:

### 1️⃣ A QQ Side Account 🆔

- **Must be a side account** (bot accounts risk being restricted — don't use your main account)
- **Must be able to log in normally** (test it on your phone first)

### 2️⃣ An AI Model API Key 🔑

MaiBot needs a Large Language Model (LLM) to think and reply. **The first launch auto-generates a default config using Alibaba Cloud Bailian (Tongyi Qianwen)** — you just need to get an API key.

| Provider | Price | Features | How to Get |
|----------|-------|----------|------------|
| **Alibaba Cloud Bailian (Qwen)** 🏆 Default | Low | Pre-integrated, stable access in China; full Qwen series + third-party models, covers **text/vision/embedding** | [Bailian Console](https://bailian.console.aliyun.com/) → API-KEY |
| **SiliconFlow** | Low | 200+ models aggregated (DeepSeek, Qwen, GLM, etc.), **one API key for text/vision/embedding**, Alipay/WeChat Pay | [Sign up](https://cloud.siliconflow.cn/) |
| **DeepSeek** | Very Low | Best price-performance ratio, top-tier reasoning (V4 with 1M context), MIT open-source, self-hostable | [Sign up](https://platform.deepseek.com/) |
| **Zhipu AI (GLM)** | Free+ | Tsinghua-backed, **text/vision/embedding** fully supported; **Flash series permanently free**, 20M free tokens for new users | [Zhipu Platform](https://open.bigmodel.cn/) |
| **Kimi (Moonshot)** | Medium | **262K context window**, native multimodal (text+image+video), excellent bilingual capability | [Sign up](https://platform.moonshot.cn/) |

::: tip 💡 For Beginners
- **Want zero hassle? Use Bailian** — the default config works out of the box, just fill in your API Key
- **Want the best value? Use DeepSeek** — top-tier reasoning at a fraction of the cost
- **Want free? Use Zhipu GLM** — Flash models are permanently free, plus 20M welcome tokens
- Most providers offer **free trial credits** — try before you commit
:::

### 3️⃣ Git

MaiBot uses Git for code management. Download from [git-scm.com](https://git-scm.com/).

---

## 🏃‍♂️ Installation Steps

### Step 1: Download MaiBot 📥

**Option A: Download ZIP (Recommended for Windows beginners)**

1. Go to [MaiBot Releases](https://github.com/Mai-with-u/MaiBot/releases)
2. Find the latest version, expand **Assets**, download **Source code (zip)**
3. Extract the zip file to a convenient location (e.g. your desktop)

**Option B: Git Clone** (if you have Git installed)

```bash
git clone https://github.com/Mai-with-u/MaiBot.git
```

To use the development branch:

```bash
git checkout dev
```

### Step 2: Install Python 🐍

> MaiBot requires **Python 3.10+** (Python 3.12 / 3.13 recommended).

1. Go to [python.org](https://www.python.org/downloads/) and download the Windows installer
2. **Check "Add Python to PATH"** during installation
3. Open Command Prompt (`Win + R` → type `cmd` → Enter) and verify:

```bash
python --version
```

### Step 3: Install uv (Package Manager) 📦

MaiBot uses [uv](https://docs.astral.sh/uv/) for dependency management — much faster than pip.

In Command Prompt:

```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Close and reopen** Command Prompt after installation.

### Step 4: Install Dependencies

Navigate to the MaiBot folder (in File Explorer, type `cmd` in the address bar) and run:

```bash
uv sync
```

This creates a virtual environment (`.venv`) and installs all dependencies (takes a few minutes).

::: tip 💡 For users in China
MaiBot's `pyproject.toml` is pre-configured with the Tsinghua mirror — `uv sync` will use it automatically.
:::

### Step 5: First Launch (Generate Config + Accept License)

```bash
uv run python bot.py
```

**On the first launch, you'll be prompted to accept the EULA and Privacy Policy. Type `同意` (or `confirmed`) and press Enter.** The system will auto-generate default configs in `config/`, then exit — **this is normal behavior**.

### Step 6: Launch Again, Enter WebUI

```bash
uv run python bot.py
```

This time you'll see logs like:

```
🌐 WebUI server starting...
🌐 Access address: http://127.0.0.1:8001
🔑 WebUI Access Token: e7b2a4f1... (long string)
💡 Open the access address in your browser and enter the token to log in
```

### Step 7: Open WebUI & Complete Setup 🌐

1. Open your browser and go to **http://127.0.0.1:8001**
2. You'll see a login page — **enter the Access Token** shown in the terminal
3. After logging in, the **setup wizard** will appear automatically for first-time users
4. Fill in your **API Key** (that's all you need — everything else has defaults)
5. The system marks initialization as complete, and you're in the normal dashboard

::: tip 💡 All configuration is done through WebUI
You can change nickname, personality, chat frequency, models, and everything else via the WebUI **"Config Management"** page. No need to manually edit files — changes apply instantly.
:::

## 📱 Connect to QQ

After MaiBot core starts, you need to connect it to QQ using **NapCat**.

### Install NapCat

Follow the [NapCat Official Installation Guide](https://napneko.github.io/guide/install) to install and log in with your QQ side account.

### Install the NapCat Adapter

In the MaiBot WebUI (browser at `http://127.0.0.1:8001`):

1. Click **"Plugin Management"** in the left sidebar
2. Search for **"NapCat Adapter"**
3. Click Install

After installation, configure the connection address following the adapter's instructions.

::: tip 💡 More Details
See the [NapCat Adapter Guide](../adapters/napcat.md) for complete installation and configuration instructions.
:::

---

## 🎉 Start Chatting

### Test Your Bot

In a QQ group, @your bot, or send a private message:

```
@MaiMai Hello!
```

If the bot replies, congratulations — you're all set! 🎉

---

## 🆘 Troubleshooting

### Bot exits immediately on start?

Check the logs by running:

```bash
uv run python bot.py
```

Common causes:

- **API key not set** — `api_key` in `model_config.toml` still says `your-api-key`
- **Config format error** — invalid TOML syntax
- **Port conflict** — port 8001 is already in use

### Bot not responding?

Check in order:

1. ✅ Is NapCat online? (NapCat interface shows logged in)
2. ✅ Is the API key correct? (check in WebUI config)
3. ✅ Is the adapter plugin installed? (check in WebUI plugin management)
4. ✅ Any errors in the logs? (check WebUI log viewer)

### "API key invalid"?

- Make sure there are no extra spaces
- Verify you selected the right provider
- Confirm your account still has credits

### Can't access the WebUI?

- Confirm MaiBot is running (terminal window is open)
- Check the address: `http://127.0.0.1:8001`
- Check your firewall settings

### How to change settings?

- **Via WebUI**: Open `http://127.0.0.1:8001` in your browser and use the config editor
- **Edit files directly**: Modify `config/bot_config.toml` or `config/model_config.toml`
- Most changes apply instantly — MaiBot supports **hot-reloading** of configuration

---

## 🎯 What's Next

You've successfully deployed MaiBot! Now you can:

- 📚 **[Configuration Guide](../configuration/)** — Tweak personality, chat frequency, memory, and more
- 🔌 **[Plugin Development](../../develop/plugin-dev/)** — Build new features for MaiBot
- 🧠 **[Understand MaiBot's Brain](../features/maisaka-reasoning.md)** — Dive into the reasoning engine
- 💬 **Invite MaiBot to more groups** — Share the fun with friends

---

**Having issues?** Join the community QQ group: [MaiBrain EEG](https://qm.qq.com/q/RzmCiRtHEW)

**Have fun!**
