---
title: One-click Package
---

# One-click Package

Package interfaces and directories can change between releases. The answers below describe general checks; use the labels shown by your installed version.

## Why is user data still on drive C after installing elsewhere?

The launcher installation directory, MaiBot instance directory, and package user-data directory are separate locations. Moving the launcher does not necessarily move instances or user data.

Check the active instance path in the package settings rather than inferring it from the shortcut or launcher path.

## Can I move an instance to another drive?

Yes. Stop MaiBot, adapters, and the launcher, then back up the original directory. Move the complete instance, select the existing instance path again in the package, save, restart, and verify configuration, databases, plugins, and adapters before removing the old copy.

Do not move only a similarly named subdirectory because layouts differ between package versions.

## Why does the bundled NapCat connection fail?

One-click packages are normally used together with a SnowLuma / NapCat client, which connects to MaiBot through the **Unified QQ Connector** (`MaiBot-SnowLuma-Adapter`). When the connection fails, follow the steps in [Adapter Connections](/en/faq/adapters) under "Why can't the Unified QQ Connector reach SnowLuma / NapCat?"; if an older package installed the archived standalone NapCat adapter, the [NapCat Adapter (archived)](../manual/adapters/napcat.md) page is historical reference only—upgrade to the Unified QQ Connector.

## Why does SnowLuma fail after switching the package's client from NapCat?

Confirm the Unified QQ Connector is enabled (`MaiBot-SnowLuma-Adapter` enabled in the WebUI **Plugin Management**) and that SnowLuma is logged in and listening on a forward WebSocket server. Then check the `[client]` section of `plugins/MaiBot-SnowLuma-Adapter/config.toml`: `server` / `port` must target SnowLuma's listener, `token` must match its access token, and `client_type` should stay `auto` (or be pinned to `snowluma`).

One connector supports both client types, so there is no need to swap plugins—editing `[client]` is enough. See [Unified QQ Connector](../manual/adapters/qq-local-client.md).

::: info Source note
The one-click-package question categories on this page were adapted from the community [Quick FAQ / Community Tutorial](https://www.kdocs.cn/l/ctOGhVv6L8Yq). Metadata from the July 12, 2026 export identifies 池雨 as the creator and 无为青年 as the modifier. This page keeps only general steps that can be verified against the current documentation.
:::
