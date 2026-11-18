---
title: Submit and Release Plugins
---

# Submit and Release Plugins

Publish to the official plugin market (`Mai-with-u/plugin-repo`) and users can find, install, and upgrade your plugin from the WebUI plugin market. Submission needs one public GitHub repository and one release; version updates go through the same automated review pipeline.

## Submit a plugin

Use a public GitHub repository with `_manifest.json` (v2), `plugin.py`, and `LICENSE` at its root. Keep runtime `config.toml` local. Publish at least one GitHub Release, then submit your plugin ID and repository URL using the [Add Plugin template](https://github.com/Mai-with-u/plugin-repo/issues/new/choose).

## Publish a new version

Update the three-part manifest `version`, keep the plugin ID, and publish a GitHub Release with a matching tag. Use a new version number to fix a listed release.

## Review rules

CI validates first submissions before a maintainer approves the listing. New releases are checked during daily sync. Low-risk releases are listed automatically, while risky or inconclusive results go to maintainers. If initial validation fails, fix the reported issues and comment `/recheck`. See the [official contribution guide](https://github.com/Mai-with-u/plugin-repo/blob/main/CONTRIBUTING.md) for all requirements.

## Verify and troubleshoot

**Verify**: search the plugin marketplace for your plugin and check that the name, summary, and version show up; install it into an instance and the plugin page should render your configuration form.

- **The issue reports a manifest validation failure** — check the required `_manifest.json` fields and the three-part `version` format against the message, then comment `/recheck` to re-trigger.
- **The plugin cannot be found** — confirm the first GitHub Release is published and the repository URL matches the ID in the manifest.
- **It installs but the config form is empty** — `config_model` is not declared correctly, or `config.toml` is not referenced by the manifest.
