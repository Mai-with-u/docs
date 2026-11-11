---
title: 适配器连接
---

# 适配器连接

这页解决消息平台接不进来的问题：适配器连不上、QQ 客户端收不到回复、Token 填错、内置 Telegram 与微信 ClawBot 接入失败。

## 适配器显示连接已断开怎么办？

适配器两端的主机、端口、令牌必须对得上。跨容器或跨设备时 `127.0.0.1` 只指向组件自己，要换成实际 IP。

改完同时重启适配器和 MaiBot，看两边日志确认连接方向。

## QQ 客户端已连接，群聊还是没有回复？

先查适配器策略的放行范围：默认全部放行，一旦某条规则拦下该群或该用户，消息在进入 Planner 之前就被丢掉。入口是 WebUI 的「适配器设置」（`/adapter-management`）或 `config/adapter_policy.toml` 里的 `[defaults.group]` / `[defaults.private]` 与 `[[adapters]]` 条目。

再确认：客户端登录的 QQ 号、目标群号、麦麦在群里的发言权限，以及日志里是否真的收到过这条消息。链路说明见[OneBot 适配器](../manual/adapters/qq-local-client.md)。

## 应该填哪个 NapCat Token？

填 NapCat 的 WebSocket 服务配置里那个访问令牌，写进 OneBot 适配器的 `plugins/MaiBot-SnowLuma-Adapter/config.toml`，字段是 `[client].token`（WebUI 插件设置里也能改同名项）。

WebSocket 没开鉴权时留空；开了鉴权两端必须完全一致。

## OneBot 适配器为什么连不上 NapCat？

OneBot 适配器（仓库 `MaiBot-SnowLuma-Adapter`）负责 MaiBot 与 NapCat 这类 OneBot v11 实现之间的连接，按顺序查：

1. **插件已启用** — WebUI 的插件管理里 OneBot 适配器是启用状态，且 `[plugin].enabled = true`。
2. **客户端在监听** — NapCat 已登录 QQ，并开启了正向 WebSocket 服务器。
3. **地址端口对得上** — `[client].server`（默认 `127.0.0.1`）和 `[client].port`（默认 `3001`）指向那个监听。
4. **Token 一致** — `[client].token` 与客户端设置里的访问令牌完全相同。
5. **跨设备 / 跨容器** — 换成实际 IP 并放行防火墙。

`client_type` 保持 `auto` 即可，连接建立后自动判定对端类型。完整字段见[OneBot 适配器](../manual/adapters/qq-local-client.md)。

## QQ 官方机器人怎么接入？

QQ 开放平台路线不需要登录 QQ 客户端：

1. 在 [QQ 开放平台](https://q.qq.com/) 创建机器人，拿到 AppID 和 AppSecret。
2. WebUI 的插件管理里启用「QQ 官方机器人适配器」。
3. 在插件设置里填 `qq_official.app_id` 和 `qq_official.app_secret`，然后启用。
4. 到开放平台把机器人加入目标群，在群里 @ 它验证。

想让官方机器人与本地客户端路线共享聊天上下文，把 `qq_official.unified_account_id` 填成那个 QQ 号。详见[QQ 官方机器人](../manual/adapters/qq-official)。

## Telegram 和微信怎么接？

两个都是内置适配器，装好即用，不用额外下载插件：

**Telegram** — 在 [BotFather](https://t.me/BotFather) 建机器人拿 Token，WebUI 插件设置里填 `telegram.bot_token` 并启用。需要代理时填 `telegram.proxy_url`。私聊机器人发 `/start` 验证。要收到群里的普通消息，在 BotFather 关闭 Privacy Mode。

**微信 ClawBot** — 启用内置微信 ClawBot 适配器，打开「插件扩展 → 微信账号管理」→「添加账号并扫码」。状态变成「已连接：微信私聊」后从微信侧发一条消息验证。支持多账号，登录失效时在对应账号卡片点「重新扫码」。

## 怎样判断问题在适配器还是 MaiBot？

沿消息链路逐段看日志：平台是否收到 → 适配器是否收到并转换 → MaiBot 是否收到 → 模型是否生成回复 → 适配器是否成功发送。

哪一步首次中断，问题就在那一步或它前面的连接。

## 适配器装好了但 WebUI 里看不到？

插件式适配器要在插件管理里安装并启用才会出现在连接列表里。内置的三条（QQ 官方、Telegram、微信 ClawBot）随主程序提供，启用即可；社区适配器要自己从插件市场或 Git 装。

先看日志有没有「插件加载失败」或版本不兼容的记录，见[插件与适配器错误排查](./troubleshooting-plugins-adapters.md#插件加载失败)。
