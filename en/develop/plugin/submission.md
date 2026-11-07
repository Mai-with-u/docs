---
title: Submit and Release Plugins
---

# Submit and Release Plugins

## Submit a plugin

Use a public GitHub repository with `_manifest.json` (v2), `plugin.py`, and `LICENSE` at its root. Keep runtime `config.toml` local. Publish at least one GitHub Release, then submit your plugin ID and repository URL using the [Add Plugin template](https://github.com/Mai-with-u/plugin-repo/issues/new/choose).

## Publish a new version

Update the three-part manifest `version`, keep the plugin ID, and publish a GitHub Release with a matching tag. Use a new version number to fix a listed release.

## Review rules

CI validates first submissions before a maintainer approves the listing. New releases are checked during daily sync. Low-risk releases are listed automatically, while risky or inconclusive results go to maintainers. If initial validation fails, fix the reported issues and comment `/recheck`. See the [official contribution guide](https://github.com/Mai-with-u/plugin-repo/blob/main/CONTRIBUTING.md) for all requirements.
