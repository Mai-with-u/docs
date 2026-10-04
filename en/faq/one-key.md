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

Confirm that NapCat is logged into the correct account, a forward WebSocket server is enabled, ports match, the WebSocket access token matches, the adapter is enabled, and the target chat passes its filter.

The NapCat WebUI login token is not the WebSocket access token. See [NapCat Connection](../manual/adapters/napcat.md).

## Why does SnowLuma fail after switching adapters?

Confirm that the SnowLuma adapter is enabled and that its address, port, and token match the SnowLuma WebSocket service. See [SnowLuma Adapter](../manual/adapters/snowluma.md).

::: info Source note
The one-click-package question categories on this page were adapted from the community [Quick FAQ / Community Tutorial](https://www.kdocs.cn/l/ctOGhVv6L8Yq). Metadata from the July 12, 2026 export identifies 池雨 as the creator and 无为青年 as the modifier. This page keeps only general steps that can be verified against the current documentation.
:::
