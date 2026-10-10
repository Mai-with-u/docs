---
title: 适配器连接
---

# 适配器连接

## 适配器显示连接已断开怎么办？

分别检查适配器两端的主机地址、端口和访问令牌。服务端监听的端口必须与适配器连接的端口一致；如果组件运行在不同容器或不同设备上，`127.0.0.1` 通常只代表组件自身，不能指向另一台设备或容器。

修改后同时重启适配器和 MaiBot，并查看双方日志确认连接方向。

## QQ 客户端已连接（NapCat / SnowLuma），为什么群聊仍然没有回复？

优先检查宿主适配器策略的放行范围：默认全部放行，一旦某条规则把该群或该用户拦下，消息会在进入 MaiBot 前被丢弃。入口是 WebUI 侧边栏「配置管理」→ **适配器设置**（`/adapter-management`），或配置文件 `config/adapter_policy.toml` 里的 `[defaults.group]` / `[defaults.private]` 与 `[[adapters]]` 条目。

还应确认客户端登录的 QQ 号、目标群号、机器人发言权限，以及 MaiBot 后台日志中是否实际收到消息。链路说明见[统一 QQ 连接器](../manual/adapters/qq-local-client.md)。

## 应该填写哪个 NapCat Token？

适配器连接 NapCat 时使用的是 NapCat WebSocket 服务配置中的访问令牌，填在统一 QQ 连接器配置文件 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 的 `[client]` 节 `token` 字段（WebUI 的插件设置里也能改同名项）。

如果 WebSocket 服务没有启用鉴权，`token` 通常留空；如果启用了鉴权，两端必须填写完全相同的值。

## 统一 QQ 连接器为什么连不上 SnowLuma / NapCat？

统一 QQ 连接器（`MaiBot-SnowLuma-Adapter`）用一个插件同时支持两类客户端，按下面的顺序排查：

1. **插件已启用** — WebUI 的**插件管理**里 `MaiBot-SnowLuma-Adapter` 处于启用状态，且 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 里 `[plugin].enabled = true`。
2. **客户端在监听** — SnowLuma 或 NapCat 已登录 QQ，并启用了**正向 WebSocket 服务器**。
3. **地址和端口对得上** — `[client]` 节的 `server`（默认 `127.0.0.1`）和 `port`（默认 `3001`）指向客户端的正向 WS 监听地址。
4. **Token 一致** — `[client].token` 与客户端设置里的访问令牌完全相同。
5. **跨设备 / 跨容器** — `127.0.0.1` 只指向组件自身，此时要换成实际 IP 并放行防火墙。

`client_type` 显式写成 `napcat` / `snowluma` 时会做一致性校验，连错客户端会打警告，日常保持 `auto` 即可。完整配置项见[统一 QQ 连接器](../manual/adapters/qq-local-client.md)。

## 怎样判断问题在适配器还是 MaiBot？

按照消息链路逐段查看日志：平台是否收到消息、适配器是否收到并转换消息、MaiBot 是否收到消息、模型是否生成回复、适配器是否成功发送。在哪一步首次中断，问题通常就位于该步骤或其前一段连接。

