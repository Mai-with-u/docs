---
title: Manage Plugins
---

# Manage Plugins

Installing is only the first step. After a plugin is written, you enable, configure, update, or uninstall it in the WebUI's "Plugin Extensions". This page explains these operations and the runtime timing behind them.

## View Plugins

The plugin list shows:

- 📋 **Name** and description
- 🔧 **Version** and author
- ✅ **Enabled status** (green = enabled, gray = disabled)
- 📖 **Usage instructions** (click to expand)
- 🏷️ **Version source and lock state** — plugins installed from a release with "Lock this version" ticked are marked as locked; they never appear in update prompts

## Enable / Disable

- Switch ON → the runtime loads the plugin
- Switch OFF → the unload lifecycle runs and the plugin stops
- Normally **takes effect immediately, without restarting all of MaiBot**

## Configure Plugins

Some plugins support custom settings:

1. Click the plugin's "Settings" button;
2. Modify options (e.g. API Key, trigger words, feature toggles);
3. After saving, the runtime invokes the plugin's `on_config_update`.

## Custom Pages (since 1.3.2)

Once a plugin ships a `webui.json`, it can bring its own page entries — no Node install, no changes to the main program:

- **Sidebar entries** — shown in the workspace sidebar under "Plugin Extensions"; the entry label and icon come from the plugin itself
- **Top workspace entries** — a plugin can also declare its own top-level workspace. When one plugin has several workspace pages, the first is the default and the rest collapse into "More Plugin Workspaces"
- **Page addresses** — of the form `/extensions/{plugin_id}/{page_id}`; a plugin cannot define custom routes or override built-in entries

**Reorder or hide**: open the "Plugin Extensions" page (sidebar → "Integration → Plugin Extensions", at `/plugin-config`). At the bottom of the page is the "Manage Plugin Pages" area, where you drag to reorder or hide a plugin's entries entirely. These preferences live only in your current browser and affect display only — they are not server-side authorization, so clearing the cache or switching browsers restores the defaults.

**Changes not taking effect?** Editing `webui.json` requires a **plugin reload** to take effect; it is not a MaiBot global setting. After reloading, the browser reflects entries within at most 30 seconds, or refresh manually.

For the full field reference, component types, limits, and troubleshooting, see [WebUI Pages](/en/plugin/webui-pages).

## Install from a ZIP

When all you have is a plugin archive (sent by a friend, packed by yourself, or not yet listed in the market), you do not need to unpack it into `plugins/` by hand:

1. Open the "插件扩展" (Plugin Extensions) page and click the "更多操作" (More actions) button in the top-right corner;
2. Choose "从 ZIP 安装插件" (Install plugin from ZIP) and select your `.zip` file;
3. Click "安装插件" (Install plugin) and wait for the "安装成功" (Installed) notice;
4. **No MaiBot restart is needed**: the file watcher detects the new plugin and generates `config.toml` from its `config_model`; plugins whose `enabled` defaults to `false` just need to be enabled manually in the list. Only when the log explicitly reports a watching or loading failure should you fall back to "重启麦麦" (Restart MaiBot) in the same menu.

The archive must meet these rules or it is rejected:

- **Size** — the archive is at most 100 MB; unpacked it is at most 300 MB and 10000 files
- **Layout** — `_manifest.json` and `plugin.py` sit in the archive root, or inside a single top-level plugin folder; one archive installs one plugin
- **Content** — no encryption, no `.git` directory, no symbolic links, and no paths such as `../` that escape the folder
- **Not installed yet** — if a plugin with the same ID is already installed, uninstall it first

::: warning Only install archives you trust
A ZIP install skips the plugin market listing. MaiBot only checks that the archive is well-formed, not what the code does. Do not install archives from unknown sources.
:::

## Update Plugins

When the page reports a new version:

1. Click "Update";
2. Wait for download and install;
3. Source changes trigger a plugin Supervisor restart and reload.

"Update" runs an **automatic update**: it moves to the newest stable version compatible with your MaiBot and SDK. It only moves forward — it never auto-downgrades and never overrides a version you locked.

The same plugin cannot run install / update / uninstall at the same time; different plugins can be processed in parallel.

### Install a Specific Version / Downgrade

To install a particular version (including one older than what you have now), open the plugin's **detail page** from the market or plugin extensions and install after selecting a version in the "Install version" card:

- Versions disabled in the dropdown are incompatible with your current MaiBot / SDK, and the reason follows in parentheses (e.g. "Requires MaiBot ≥ 1.4.0")
- "· Recommended" is the newest stable version under the compatibility check and is selected by default
- Switching versions backs up the old directory and keeps `config.toml` / `config_back/` / `data/`, but **does not roll back plugin data**

### Lock a Version

After ticking "Lock this version after install to block automatic updates" under the version dropdown:

- The plugin no longer participates in automatic updates, and the page stops prompting for new versions
- To resume automatic updates, open the detail page, select a version again, and **untick** "Lock this version after install to block automatic updates"

Clicking "Update" on a locked plugin returns "This plugin has a locked version; select a version on the plugin detail page and unlock it before updating".

### Updating Branch-Installed Plugins

Plugins installed through "Install from Git" remain ordinary branch plugins — click "Update" for a `git pull`. Plugins installed from a release can no longer be `git pull`-ed; you get "This plugin was installed from a release; update it through version selection" — pick a version on the detail page instead.

## Uninstall Plugins

1. Click "Uninstall" and confirm;
2. The plugin files are deleted.

⚠️ Before uninstalling, confirm whether the plugin stores user data in its own directory—that data may be lost after uninstall. For release-installed plugins, uninstalling also removes the `.maibot-release.json` receipt.

## Lifecycle and Restart Boundary

```mermaid
flowchart LR
    Install[Install: written to plugins/] --> Watch[File watcher detects]
    Watch --> Cfg[Generate config.toml from config_model]
    Cfg --> Enabled{enabled?}
    Enabled -- false --> Off[Disabled, not running]
    Enabled -- true --> Load[Loaded and running]
    Load --> Update[Config update on_config_update]
    Load --> Src[Source change restarts Supervisor]
    Load --> Unload[Uninstall deletes files]
```

- **Install** — written to `plugins/` then detected by the watcher; Runner generates `config.toml` from `config_model` defaults; `enabled=false` needs manual enable
- **Enable / Disable** — the runtime loads or unloads the plugin, **no MaiBot restart needed**
- **Config change** — a loaded plugin receives `on_config_update`; setting it disabled unloads it, enabled loads it
- **Source update** — changes to `.py` / `plugin.py` / `_manifest.json` restart the plugin Supervisor; briefly unavailable, core needs no restart
- **Uninstall** — disable and unload first, then delete files

::: warning Restart is only a fallback
Only fully restart MaiBot when the log explicitly reports that watching, loading, unloading, or a config callback failed. Normal plugin management should not require restarting the core.
:::

## Tips

**Conflicts** — only enable the plugins you need when functions overlap; contact the author for updates if necessary.

**Performance** — too many plugins may affect performance; uninstall unused ones promptly.

**Security** — only install from trusted sources, review permission requirements, update regularly.

**Versions** — keep compatible plugins on the "Recommended" version; when only an older version works for now, lock that version on the detail page so automatic updates cannot push it away.

## FAQ

**Q: Install failed?** Check network and the URL, and review error messages; for release installs, first check whether that version is compatible in the dropdown and whether dependencies are missing.
**Q: "Update" says the version is locked?** You ticked "Lock this version" when installing. Open the detail page, select a version again, and untick the lock to restore automatic updates.
**Q: Want to roll back to an older version but it says no automatic downgrade?** Automatic updates only move forward. Open the plugin detail page and manually select the older version under "Install version".
**Q: "This plugin was installed from a release; update it through version selection"?** This plugin is managed by the version index and can no longer be `git pull`-ed; switch versions only via the detail page.
**Q: Are config and data still there after switching versions?** `config.toml`, `config_back/`, and `data/` are preserved; but a downgrade does not roll back new content the plugin wrote into data files.
**Q: Installed but no effect?** Confirm it's enabled, the config is correct, and check MaiBot logs.
**Q: Can I develop my own?** Yes! See [Plugin Development](/en/plugin/).

## Verify and Troubleshoot

**Verification** — install a test plugin with "Install from ZIP": it appears in the list with its toggle off by default; switch it on and the log reports a successful load while `plugins/<plugin-name>/config.toml` is generated; then edit one plugin setting and confirm it saves — installation, enabling, and configuration all work.

- **The ZIP is rejected as badly structured** — `_manifest.json` and `plugin.py` must sit at the archive root or inside a single top-level plugin folder, and one archive may contain only one plugin; a wrapper folder, a second plugin directory, `.git`, or `__MACOSX` entries all get refused.
- **"ZIP extracts to more than 300 MB or contains more than 10000 files" / "ZIP file cannot exceed 100 MB"** — trim the package before uploading: leave out test data, virtual environments, and logs; if it is genuinely too large, install from the plugin marketplace or Git instead.
- **"Plugin validation failed: …"** — `_manifest.json` did not pass validation: fix the `id`, version, URL, or dependency fields named in the message, keeping `manifest_version` at `2` and `version` in strict `X.Y.Z`. If a plugin with the same ID is already installed, the message asks you to uninstall it first.
- **The plugin is listed after install but the bot does nothing** — a freshly installed plugin has `enabled` set to `false`, so turn the toggle on manually; while disabled it is never loaded and produces no runtime logs at all.
- **The toggle is on but the plugin still does not run** — read the log: a failed load, an uninstallable dependency, or a missing lifecycle method is named there. Use "More actions → Restart MaiBot" only when the log explicitly reports a watcher, load, unload, or config-callback failure, and fix the first error in the log before restarting.
