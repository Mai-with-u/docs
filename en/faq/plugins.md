---
title: Plugin Issues
---

# Plugin Issues

## Why does an enabled plugin not work?

Read the plugin's README and confirm required configuration, dependencies, permissions, and compatible MaiBot versions. Then inspect startup logs for load, validation, command-registration, or event-registration errors.

## The log says "Host version incompatible" or "SDK version incompatible". What should I do?

The plugin's `_manifest.json` declares a compatibility range that does not include your current version. Two cases:

- **Host is only one patch release ahead** (e.g. the plugin supports up to `1.3.1` and you run `1.3.2`) — MaiBot loads it in compatibility mode and leaves only a warning in the log; nothing to do
- **Anything else** — the plugin is blocked. Look for a plugin version that supports your MaiBot; if you really want to try it, enable `[debug] force_plugin_compatibility` (the "Force plugin compatibility" switch in the WebUI debug settings) and **restart MaiBot** so it skips the version range check

::: danger Force compatibility is a diagnostic tool
That switch only skips the Host / SDK version range check. It does not cover the manifest protocol version, dependency resolution, or the capability whitelist, and it does not change how the Plugin Market judges version compatibility. With the check skipped, failures caused by interface changes come with no upfront signal. Turn it off once you have identified the problem.
:::

## Why is a plugin command treated as a normal chat message?

Verify the command syntax and prefix and confirm that the plugin registered its command. Duplicate commands or another plugin intercepting and modifying the event can allow the message to continue into normal chat handling.

Temporarily disable recently installed plugins and restore them one at a time to locate the conflict.

## How do I diagnose plugin conflicts?

Record the last installed or updated plugins and disable them in batches. Compare command names, hooks, event priority, and dependency versions after identifying the pair. Do not assume that an old online report applies to the current version.

## What should I do when a plugin download fails?

Check the repository URL, network, Git installation, proxy, and mirror settings. Confirm the repository's actual default branch; it may be `main`, `master`, or something else. If the repository is reachable, inspect the install log for Git, permission, and dependency errors.

## What if a plugin stops working after an update?

Read its release notes and migration instructions and verify the supported MaiBot versions. Back up the plugin directory and configuration before rolling back, then follow the repository's version guidance.

## Why does "Update" say the version is locked?

You ticked "Lock this version after install to block automatic updates" when installing the plugin. A locked plugin no longer participates in automatic updates, and the market stops prompting for new versions.

To restore automatic updates: open the plugin detail page, select a version once more under "Install version", and **untick** "Lock this version after install to block automatic updates".

## Why can't I automatically downgrade to an older version?

Automatic updates only move forward. When the target version is older than or equal to the current one, it answers "Already on the newest compatible version; automatic update will not downgrade or reinstall" to avoid an accidental rollback to a broken version.

To downgrade: open the plugin detail page, select the target version manually in the "Install version" dropdown, and install it. Before switching, the old directory is backed up to `plugins/.update_backups/` and `config.toml`, `config_back/`, `data/` are kept — but **plugin data is not rolled back**. Back up the plugin directory before downgrading.

## Many entries in the version dropdown are grayed out. What does that mean?

Grayed-out entries with a reason suffix are incompatible with your current MaiBot or SDK; installing them would be refused anyway, so they cannot be selected. Common suffixes:

- "Requires MaiBot ≥ x.y.z" / "Supports MaiBot ≤ x.y.z only" — the plugin's `host_application` range excludes your version
- "Requires SDK ≥ x.y.z" / "Supports SDK ≤ x.y.z only" — the plugin's `sdk` range excludes your SDK version
- "Manifest protocol version too old" — that version uses an unsupported manifest protocol
- "· Yanked" — the author withdrew this release
- "· Prerelease" — a version flagged for testing by the author; usable but not guaranteed stable

If every version of a plugin shows as incompatible, it has not been adapted to your MaiBot version yet; wait for the author.

## What should I do about "This plugin was installed from a release; update it through version selection"?

This plugin was installed from the version index (Git Release) and carries a `.maibot-release.json` record of the selected version, so a plain `git pull` is refused — it would clobber the version record.

Correct approach: open the plugin detail page and select the target version under "Install version". If you really want to switch to a branch build, uninstall the plugin first and then install it again through "Install from Git".

## Why does a release version install fail?

- **Dependencies unsatisfied** — other plugins or Python packages required by that version are missing
- **Blocked by another plugin** — an installed plugin requires this plugin to stay in a specific version range: "This version does not satisfy the dependency requirement of installed plugin X"
- **Local code modifications** — you edited code inside the plugin directory: "The plugin has local code modifications; resolve them first"; back it up and restore the directory before switching versions
- **Index and repository out of sync** — "The tag's current commit does not match the version index" or "The downloaded manifest does not match the version index"; wait for the index to sync and retry
- **Version sync failed** — the official version index could not be fetched; switch mirror source or retry later

## The plugin market won't open, or install spins forever?

With Fake-IP proxies such as Clash or Surge, the plugin market domain may resolve into `198.18.0.0/15` and be treated as an unsafe address, making it unreachable. Since 1.3.0 the plugin market's HTTPS domains are allowed to fall inside that range, so ordinary proxy setups no longer fail this way.

If it still fails: switch to another mirror source, temporarily disable Fake-IP mode in your proxy, or check the end of the error message — when every mirror source fails, the specific reason for each one is listed.

