---
title: 📱 Supported Platforms
---

# 📱 Supported Platforms

MaiBot can connect to various chat platforms - like a universal translator!

## Currently Supported Platforms

### 🐧 QQ (Most Recommended)
Connect to QQ through NapCat, with the most complete features:
- ✅ Text chat
- ✅ Emoji stickers
- ✅ Image messages
- ✅ Group and private chats
- ✅ File transfers
- ✅ Supports plugin mode (recommended, more stable and simpler)

**Easy setup**: Plugin mode for one-click install, or standalone mode - just install NapCat and fill in IP address!

## Other Adapters

### GoCQ Adapter
A QQ adapter based on go-cqhttp, suitable for accounts with lower risk control:
- [GoCQ Adapter Documentation](./gocq)

### Community Third-Party Adapters
Community-developed adapters for other platforms, including WeChat, Discord, Telegram, etc.:
- Follow the [MaiBot GitHub organization](https://github.com/Mai-with-u) for the latest adapters
- Get third-party adapter info in the community chat groups

## Coming Soon

### 💬 WeChat
Currently in development, stay tuned:
- Personal WeChat
- WeChat groups
- Official accounts

### 📱 Other Platforms
Future support may include:
- DingTalk
- Feishu
- Telegram
- Discord

## How to Connect Platforms?

### Step 1: Choose Adapter
Each platform has its corresponding "adapter":
- QQ → NapCat adapter (supports plugin mode, recommended!)
- Other platforms → Community adapters (WeChat, Discord, etc.)

### Step 2: Configure Connection
Fill in the config file:
- Platform type
- Connection address
- Account information

### Step 3: Start Connection
Save config, restart MaiBot, and it connects automatically!

## Platform Comparison

| Platform | Ease of Use | Features | Stability | Recommendation |
|----------|-------------|----------|-----------|----------------|
| QQ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| WeChat | In Development | In Development | In Development | Coming Soon |

## Usage Recommendations

### For Beginners
**Start with QQ**, recommended to use plugin mode:
- Easiest setup
- Most complete documentation
- Best community support

### Advanced Play
**Multi-Platform**:
- QQ chat as primary
- Extend with community adapters for more platforms

### Multi-Platform Deployment
Can connect multiple platforms simultaneously:
- One MaiBot serves multiple groups
- Different personalities per platform
- Unified management

## Common Questions

**Q: Must I use QQ?**
A: Currently QQ has the best support, recommended for beginners

**Q: When will WeChat be available?**
A: Currently in development, follow update news

**Q: Can I use multiple platforms at once?**
A: Yes, one MaiBot can serve multiple platforms

**Q: Will accounts get banned?**
A: Any platform has risks, recommended to use secondary accounts and follow platform rules

## Getting Help

- 📖 Check specific adapter setup tutorials
- 💬 Join MaiBot community groups to ask
- 🔧 Submit issues on GitHub

## Next Steps

- [NapCat Adapter](./napcat) - Detailed QQ connection tutorial
- [GoCQ Adapter](./gocq) - QQ adapter based on go-cqhttp