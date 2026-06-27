---
title: Manifest System
---

# Manifest System

Each MaiBot plugin must include a `_manifest.json` file in its root directory to declare plugin metadata, version compatibility, dependencies, and capability requirements. The Host-side `ManifestValidator` will strictly validate this file before loading.

## _manifest.json Structure

Here is a complete Manifest example:

```json
{
  "$schema": "../_manifest.schema.json",
  "manifest_version": 2,
  "id": "com.example.my-plugin",
  "version": "1.0.0",
  "name": "My Plugin",
  "description": "An example plugin",
  "author": {
    "name": "Developer",
    "url": "https://github.com/developer"
  },
  "license": "MIT",
  "urls": {
    "repository": "https://github.com/developer/my-plugin",
    "homepage": "https://example.com",
    "documentation": "https://docs.example.com",
    "issues": "https://github.com/developer/my-plugin/issues"
  },
  "host_application": {
    "min_version": "1.0.0",
    "max_version": "1.99.99"
  },
  "sdk": {
    "min_version": "1.0.0",
    "max_version": "2.99.99"
  },
  "dependencies": [],
  "plugin_type": "tool",
  "display": {
    "icon": {
      "type": "lucide",
      "value": "wrench"
    }
  },
  "capabilities": ["send_message"],
  "i18n": {
    "default_locale": "zh-CN",
    "locales_path": "i18n",
    "supported_locales": ["zh-CN", "en-US"]
  }
}
```

## Using the Manifest Schema

The MaiBot repository provides the JSON Schema for `_manifest.json` at `plugins/_manifest.schema.json`. It is used for editor completion, field descriptions, and format checks.

When the plugin is located at `plugins/<plugin-name>/_manifest.json`, add this at the top level:

```json
{
  "$schema": "../_manifest.schema.json",
  "manifest_version": 2
}
```

`../_manifest.schema.json` points to MaiBot's built-in `plugins/_manifest.schema.json`. Editors that support JSON Schema will automatically use it to show available fields, types, and format errors. The Host ignores `$schema` at runtime, so it does not affect plugin loading.

## Required Fields

- **`manifest_version`** `2` — Manifest protocol version, currently fixed as `2`
- **`id`** `string` — Plugin unique identifier, format is lowercase letters/numbers, separated by dots or dashes (e.g., `com.author.plugin`)
- **`version`** `string` — Plugin version number, must be strict three-part semantic version (e.g., `1.0.0`)
- **`name`** `string` — Plugin display name
- **`description`** `string` — Plugin description
- **`author`** `object` — Plugin author information, contains `name` (author name) and `url` (author homepage, must be HTTP/HTTPS URL)
- **`license`** `string` — Plugin license
- **`urls`** `object` — Plugin related links collection (see below)
- **`host_application`** `object` — Host compatibility range (see below)
- **`sdk`** `object` — SDK compatibility range (see below)
- **`capabilities`** `string[]` — Plugin declared capability request list, cannot contain empty values
- **`i18n`** `object` — Internationalization configuration (see below)

## Optional Fields

### plugin_type Plugin Type

`plugin_type` declares the plugin's primary role. WebUI uses it for display, filtering, and default icon selection. This field is optional and does not require a `manifest_version` upgrade; missing values are treated as `extension`.

Allowed values:

- `adapter` — message platform or protocol adapters
- `tool` — tools, commands, or model-callable capabilities
- `provider` — LLM, TTS, API, or other service providers
- `management` — management, permission, group moderation, or admin plugins
- `data` — statistics, memory, knowledge base, import/export, or other data plugins
- `media` — image, audio, video, emoji, or other media processing
- `game` — games or entertainment interactions
- `integration` — external platforms, search, Webhooks, or integrations
- `extension` — general extensions
- `other` — other plugins

### display Metadata

`display.icon` declares the plugin icon. It only affects WebUI display and does not change runtime behavior.

```json
{
  "display": {
    "icon": {
      "type": "local",
      "value": "assets/icon.png",
      "fallback": "package",
      "background": "#1f2937"
    }
  }
}
```

- `type`: `lucide`, `emoji`, or `local`
- `value`: icon value. `lucide` uses an icon name, `emoji` uses an emoji or short text, and `local` uses a relative path inside the plugin directory
- `fallback`: optional lucide icon name used when the icon fails to load
- `background`: optional icon background color in `#RRGGBB` format

Online URL icons are not allowed. Local icons only support `.png`, `.jpg`, `.jpeg`, `.webp`, and `.svg`. The path must stay inside the plugin directory and cannot use absolute paths, `..`, or symlinks.

### urls Link Collection

- **`repository`** · Required — Plugin repository address, must be HTTP/HTTPS URL
- **`homepage`** · Optional — Plugin homepage address
- **`documentation`** · Optional — Plugin documentation address
- **`issues`** · Optional — Plugin issue feedback address

### host_application / sdk Version Range

Both have the same structure, as closed interval declarations:

```json
{
  "min_version": "1.0.0",
  "max_version": "1.99.99"
}
```

- `min_version`: Allowed minimum version (closed interval)
- `max_version`: Allowed maximum version (closed interval)
- Both must be strict three-part semantic version numbers (`X.Y.Z`)
- `min_version` cannot be greater than `max_version`

Host will validate whether the current version falls within the declared range during handshake. If incompatible, the plugin will be blocked from loading.

### i18n Internationalization Configuration

- **`default_locale`** · Required — Default language code (e.g., `zh-CN`)
- **`locales_path`** · Optional — Language resource file directory path
- **`supported_locales`** · Optional — Supported language list, cannot contain empty values and duplicates. If not empty, `default_locale` must exist in this list

## Dependency Declaration

The `dependencies` array supports two types of dependencies, distinguished by the `type` field:

### Plugin-level Dependencies

```json
{
  "type": "plugin",
  "id": "com.example.other-plugin",
  "version_spec": ">=1.0.0,<2.0.0"
}
```

- `id`: ID of the dependency plugin, follows the same format rules as plugin ID
- `version_spec`: Version constraint expression, uses PEP 440 style (e.g., `>=1.0.0`, `~=1.0`)
- Circular dependencies or self-dependencies are not allowed
- Duplicate declarations of the same plugin dependency are not allowed

### Python Package Dependencies

```json
{
  "type": "python_package",
  "name": "httpx",
  "version_spec": ">=0.24.0"
}
```

- `name`: Python package name, only allows letters, numbers, dots, underscores, and dashes
- `version_spec`: Version constraint expression

### Dependency Resolution Process

`PluginDependencyPipeline` executes dependency analysis uniformly on the Host side:

1. **Scan**: Collect all plugins' `_manifest.json`
2. **Detect Host conflicts**: If plugin's Python package dependencies have no intersection with main program's dependency constraints, block loading
3. **Detect inter-plugin conflicts**: If multiple plugins have mutually exclusive version constraints for the same Python package, block all from loading
4. **Auto install**: For missing Python dependencies of loadable plugins, prefer `uv pip install`, fallback to `pip install`
5. **Topological sort**: Determine Runner startup order based on cross-Supervisor dependency relationships, circular dependencies will be rejected

## Validation Rules

The Manifest validator (`ManifestValidator`) uses Pydantic strict mode, with main validation rules including:

- **No extra fields**: Fields not declared in `_manifest.json` are not allowed
- **ID format**: Must match `^[a-z0-9]+(?:[.-][a-z0-9]+)+$` (e.g., `com.example.my-plugin`)
- **Version number format**: Must be `X.Y.Z` three-part format
- **URL format**: Must start with `http://` or `https://`
- **No self-dependency**: Cannot depend on itself in `dependencies`
- **No duplicate dependencies**: Same plugin/package name can only be declared once
