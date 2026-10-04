---
title: Deployment and Startup
---

# Deployment and Startup

## What should I do when MaiBot fails to start?

Find the first real error in the startup log. Common causes include incompatible Python or dependency versions, missing or invalid configuration, incomplete model settings, occupied ports, and file permissions.

Do not repeatedly reinstall before identifying the cause. Search [Error Troubleshooting](./error-troubleshooting.md) when the log contains a specific error.

## What if a configuration file is missing or invalid?

Prefer editing through the WebUI. When editing TOML manually, quote strings, leave numbers unquoted, use lowercase `true` and `false`, and verify section names and array syntax.

See [Config Files](../manual/configuration/index.md) for paths and fields.

## What if a port is already in use?

First identify the service from the log:

- MaiBot WebUI uses `8001` by default.
- The legacy MaiBot message WebSocket uses `8000` by default.
- The NapCat panel in Docker is commonly mapped to `6099`.
- NapCat or SnowLuma forward WebSocket services often use `3001`, but their adapter settings are authoritative.

Stop the duplicate process or change both server and client settings to the same free port. See [Port conflict troubleshooting](./error-troubleshooting.md#scenario-3-port-already-in-use).

## How do I open the WebUI?

For a local installation, open `http://127.0.0.1:8001` after the startup log confirms the WebUI is running. If you changed the port, use the new value.

Docker deployments also require correct port mapping and bind addresses. See [Docker Installation](../manual/deployment/docker.md).

## Why is a setting missing from the WebUI?

Check whether the page has an advanced-settings toggle, then verify the current MaiBot version. Settings may be moved, renamed, or replaced; do not add unknown configuration only because it appears in an old screenshot.

