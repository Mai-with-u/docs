---
title: Install Plugins
---

# Install Plugins

Plugins are like "Apps" you install for MaiBot, giving it more capabilities—games, drawing, music, weather queries, and **adapters that connect platforms like QQ, email, and voice calls**—almost everything is a plugin.

You can install from the built-in **Plugin Market** with one click, or build your own. This page only covers "how to install and manage plugins as a user"; for development see [Plugin Development](/en/plugin/).

## What is a Plugin

- 🎮 **Feature plugins** — games, drawing, music, weather, etc.
- 🔌 **Platform adapters** — connect messaging platforms to MaiBot; they are plugins too
- 🛠️ **Developer components** — Tool, Command, Hook, event handlers, etc.

## Plugin Market (Recommended)

MaiBot has a built-in **Plugin Market** where you can browse, install, and update plugins from the WebUI—no command line needed.

![Plugin Market](/images/plugin-market/store-overview.jpeg)

The market supports filtering by category and keyword to quickly find the plugin or adapter you need:

![Plugin Market filtering and categories](/images/plugin-market/store-filter.png)

The "Only show current version" switch in the toolbar decides whether plugins incompatible with your MaiBot version are hidden. Turn it off to see at a glance which plugins need a newer MaiBot. The "Incompatible" badge on a plugin card explains why; the version-level details are in the next section.

### Install from the Plugin Market

1. Open the WebUI and go to "Plugin Management".
2. Switch to the "Plugin Market / Browse" tab.
3. Search or filter for the plugin you want (e.g. `NapCat`).
4. Click "Install".
   - Plugins with a published Release in the official version index → the plugin detail page opens and asks you to **pick a version to install** (see the next section).
   - Plugins maintained only on a branch → the install dialog opens; pick a branch and install directly.
5. Newly installed plugins are **disabled by default**—remember to enable them (see [Manage Plugins](./management)).

::: tip Can't find it in the market?
The Plugin Market is indexed from GitHub repositories. If it's not there, use the Git URL method below to install any public repository.
:::

### Choose Which Version to Install

Since 1.3.0 the official version index maintains a **release version list** for every indexed plugin (built from the repository's Git Releases). You can pick exactly which one to install in the "Install version" card on the plugin detail page.

Each entry in the version dropdown carries a suffix describing its state:

- **· Recommended** — the newest stable version compatible with both your MaiBot and SDK; selected by default
- **· Prerelease** — a prerelease flagged by the author; it may contain unstable changes
- **· Yanked** — the author withdrew this version; installing it fails
- **· Incompatibility reason** — for example "Requires MaiBot ≥ 1.4.0", "Supports SDK ≤ 2.99.99 only", or "Manifest protocol version too old". These entries are **disabled** in the dropdown: you can see why, but cannot select them

To install a specific version (including one older than the recommendation), select it in the dropdown and click "Install selected version". Untick "Lock this version after install to block automatic updates" whenever you want to change that behavior.

::: tip Just want the newest compatible version?
Leave the dropdown on the "Recommended" entry — that is equivalent to auto-updating to the newest compatible stable release.
:::

::: warning Manual downgrade only
Automatic updates only move forward. If the recommended version is older than what you have installed, the auto-update answers "Already on the newest compatible version; automatic update will not downgrade or reinstall" — to downgrade or roll back, you must select that version manually on the plugin detail page.
:::

### Switch / Downgrade to Another Version

Select a different version on the detail page of an installed plugin and install it to switch versions:

- The old plugin directory is backed up wholesale to `plugins/.update_backups/` rather than deleted
- `config.toml`, `config_back/`, and `data/` are carried over, so you do not re-enter configuration
- **Downgrading does not roll back plugin data** — databases and state files written by the newer version are not restored
- During the switch the plugin is stopped and reloaded, so it is briefly unavailable; the MaiBot core does not need a restart

::: danger Do not edit code inside the plugin directory and then switch versions
If the plugin repository carries local code changes, switching versions is refused with "The plugin has local code modifications; resolve them first". Back such changes up elsewhere, or fall back to a branch install.
:::

### Plugins Not in the Version Index

The version list only covers plugins indexed officially that have published a Git Release. Installing an unindexed repository answers "Not yet in the version index; sync the plugin center first" — for these, use "Install from Git" for a branch install, and update them afterwards as an ordinary branch plugin.

Plugins installed from a release gain a `.maibot-release.json` receipt in their directory (recording version, tag, commit, and whether it is locked). Plugins with this receipt can no longer be updated by a plain `git pull`; you get "This plugin was installed from a release; update it through version selection" instead — pick a version on the detail page to change it.

## Install from a Repository (git clone)

Beyond the Plugin Market, there is a "repository" path: first find a plugin on the Plugin Site or the official organization, then install it via a Git URL.

### Where to Find Plugins

Besides the built-in Plugin Market in the WebUI, you can also visit the **MaiBot Plugin Site** to browse and search community-maintained plugins and adapters:

<Linkcard url="https://plugins.maibot.chat/" title="MaiBot Plugin Site" description="Browse and search community-maintained plugins and adapters" logo="/title_img/mai.png" />

<Linkcard url="https://github.com/Mai-with-u" title="MaiBot Official Organization" description="Official adapters and example plugins live here" logo="/title_img/mai.png" />

### Install from a Git Repository URL

Use this when the plugin isn't in the market, or when you want a specific branch / fork.

Paste the repository URL into "Install from Git" in plugin management, or clone manually in a terminal:

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Paste the URL into "Install from Git" in the WebUI, or run in a terminal:
git clone https://github.com/author/plugin-name.git plugins/plugin-name
```

:::

**Example URL**:

```
https://github.com/author/plugin-name
```

> ⚠️ Currently only installation via Git repository URL is supported; local file upload is not supported.

## After Install: Disabled by Default

Regardless of method, once a plugin is written to `plugins/`:

- A file watcher detects the new plugin and generates `config.toml` from the plugin's `config_model`;
- Plugins whose `enabled` defaults to `false` **must be enabled manually** to run.

So "install succeeded" ≠ "already running". Next, go to [Manage Plugins](./management) to enable and configure it.

::: warning Security reminder
Only install plugins from trusted sources. Before installing, check the repository's README, update time, and Issues, and review the permissions the plugin requests. Third-party plugins are maintained by their respective authors; the MaiBot team does not guarantee their compatibility or safety.
:::

## Verification & Troubleshooting

**Verify**: after installation the plugin appears in the WebUI plugin management page and `plugins/<plugin-name>/config.toml` has been generated — installation succeeded. Then go to [Manage Plugins](./management) to enable it manually.

**The plugin is missing from the list?**

- Check the directory structure: `plugins/<plugin-name>/` must contain `_manifest.json` and the plugin entry file; an extra nesting level will not be detected

**`config.toml` was not generated?**

- Plugins that do not declare `config_model` have no config file — that is expected
- If it should exist, check the plugin loading errors in the log

**Enabled but not running?**

- Check whether `min_version` in `_manifest.json` is compatible with your MaiBot version
- Confirm the dependencies declared by the plugin are installed
- When you are sure a version number is blocking it, temporarily enable `[debug] force_plugin_compatibility` and restart — see [Manifest System · Force Plugin Compatibility](/en/plugin/manifest.md)

**`git clone` fails?**

- Private repositories require an SSH key or access Token
- On a restricted network, download the plugin files manually and place them under `plugins/<plugin-name>/` with the directory structure preserved

**Installing a specific version fails?**

- "Plugin dependencies unsatisfied" — the other plugins or Python packages required by that version are missing
- "This version does not satisfy the dependency requirement of installed plugin X" — an installed plugin needs this plugin to stay in a specific version range; deal with X first
- "The plugin has local code modifications; resolve them first" — you edited code inside the plugin directory; back it up and restore the directory
- "The tag's current commit does not match the version index" / "The downloaded manifest does not match the version index" — the index and repository are out of sync; wait for the index to sync and retry
- "Version sync failed: …" — the official version index itself could not be fetched; switch mirror source or retry later

**The plugin market won't open, or install spins forever?**

- With Fake-IP proxies such as Clash or Surge, the plugin market domain may resolve into `198.18.0.0/15` and be treated as an unsafe address. 1.3.0 lifted this restriction for the plugin market's HTTPS domains; if it still fails, switch to another mirror source or temporarily disable Fake-IP mode in your proxy
- When every mirror source fails, the error message ends with the specific reason for each one — follow those hints
