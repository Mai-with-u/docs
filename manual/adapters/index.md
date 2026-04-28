---
title: 适配器概览
---

# 适配器概览

适配器负责把 QQ、Telegram、微信、Discord 等消息平台接入 MaiBot。不同适配器支持的平台、运行方式和维护状态不同，第一次部署建议优先选择维护活跃、文档完整的适配器。

## 可用适配器

| 适配器 | 支持平台 | 状态 | 简介 |
| --- | --- | --- | --- |
| [NapCat](./napcat.md) | QQ | 推荐使用 | 麦麦官方维护的 QQ 适配器，支持插件版和独立版，插件版是当前推荐方案。 |
| [GoCQ](./gocq.md) | QQ | 可用，偏旧 | 基于 go-cqhttp / AstralGocq 的 QQ 适配方案，适合已有 GoCQ 环境或特定需求。 |
| Snowluma（建设中） | QQ | 建设中 | 新一代 QQ 适配方案，相关能力和文档仍在完善。 |
| [Telegram](https://github.com/xiaoxi68/MaiBot-Telegram-Adapter) | Telegram | 社区适配 | Telegram 平台适配方案。 |
| [Discord](https://github.com/2829798842/MaiBot-Discord-Adapter) | Discord | 社区适配 | Discord 平台适配方案。 |
| 更多适配器 | 微信等 | 社区适配 | 关注 [MaiBot GitHub 组织](https://github.com/Mai-with-u) 或社区交流群获取更多第三方适配器信息。 |

## 旧版 / 社区适配器列表（可能未及时维护）

下面这些适配器多为旧版或社区项目，部分可能无法兼容当前 MaiBot 版本。使用前建议先查看对应仓库的更新时间、README 和 Issue。

- [Nonebot 适配器](https://github.com/MaiM-with-u/nonebot-plugin-maibot-adapters)
- [桌宠 适配器](https://github.com/MaiM-with-u/MaiM-desktop-pet)
- [微信 - wxauto Adapter](https://github.com/Angela459/WeMai)
- [Milky 协议适配器](https://github.com/ShinKanji/MaiBot-Milky-Adapter)



## 下一步

- 如果你要安装和配置适配器，请看 [适配器安装](../deployment/adapters_installation.md)。
- 如果你第一次接入 QQ，建议直接看 [NapCat 适配器](./napcat.md)。
- 如果你已经在使用 GoCQ，可以参考 [GoCQ 适配器](./gocq.md)。
