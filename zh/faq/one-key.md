---
title: 一键包
---

# 一键包

一键包的界面和目录结构可能随版本变化。下列回答说明通用检查思路，具体按钮名称以当前一键包为准。

## 为什么安装到其他磁盘后，用户数据仍然出现在 C 盘？

启动器安装目录、MaiBot 实例目录和一键包自身的用户数据目录不是同一个位置。改变启动器安装位置，不一定会改变实例和用户数据的保存位置。

先在一键包设置中查看当前实例路径，不要只根据桌面快捷方式或启动器安装目录判断 MaiBot 实际位置。

## 可以把一键包实例迁移到其他磁盘吗？

可以，但迁移前必须完全停止 MaiBot、适配器和启动器，并备份原目录。移动完整实例目录后，在一键包中重新选择现有实例路径，保存并重新启动，确认配置、数据库、插件和适配器均能正常加载后再处理原目录。

不同版本的一键包可能采用不同的目录结构，不要只移动某个名称相似的子目录。

## 一键包中的 NapCat 连接失败怎么办？

一键包通常配合 SnowLuma / NapCat 客户端使用，客户端通过**统一 QQ 连接器**（`MaiBot-SnowLuma-Adapter`）接入 MaiBot。连接失败时，按[适配器连接](./adapters.md)中「统一 QQ 连接器为什么连不上 SnowLuma / NapCat」的步骤排查即可；如果旧版一键包装的是已归档的独立 NapCat 适配器，[NapCat 适配器（已归档）](../manual/adapters/napcat.md)仅作历史参考，请升级到统一 QQ 连接器。

## 把一键包客户端从 NapCat 换成 SnowLuma 后连接失败怎么办？

确认统一 QQ 连接器已启用：WebUI 的**插件管理**里 `MaiBot-SnowLuma-Adapter` 处于启用状态，SnowLuma 已登录并监听正向 WebSocket。然后核对 `plugins/MaiBot-SnowLuma-Adapter/config.toml` 的 `[client]` 节：`server` / `port` 指向 SnowLuma 的监听地址，`token` 与 SnowLuma 的访问令牌一致，`client_type` 保持 `auto`（也可显式写成 `snowluma`）。

一个连接器同时支持两类客户端，切换时不用换插件，改 `[client]` 配置即可。详见[统一 QQ 连接器](../manual/adapters/qq-local-client.md)。

::: info 内容来源
本页的一键包问题分类参考了社区协作文档[《麦麦教程-常见问题速查/社区教程》](https://www.kdocs.cn/l/ctOGhVv6L8Yq)。2026 年 7 月 12 日导出版本的页面信息显示创建者为池雨、修改者为无为青年；本站仅保留能够按当前文档确认的通用步骤。
:::
