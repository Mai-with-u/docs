---
title: About This Docs
---

# About This Docs

## What This Docs Is

This website is the official documentation for MaiBot, built with [VitePress](https://vitepress.dev/). It covers everything from installation, deployment, and configuration to plugin and adapter development. The documentation is bilingual ([简体中文](/) / [English](/en/)) and maintained by community contributors.

## Documentation Structure

The documentation is organized by module, with `zh/` and `en/` directories mirrored:

- **User Manual** (`manual/`) — Deployment and installation (Windows/Linux/Docker/one-click), connecting platforms (QQ local client, QQ official bot, email, QQ voice call, iMessage), Bot and model configuration (including MCP), plugin installation and management, WebUI operations
- **Development** (`develop/`) — Integration only: the five adapter pages (overview, message protocol, writing an adapter, access policy, troubleshooting), plugin integration, programmatic access via the WebUI API, and data statistics; model and MCP configuration lives in the User Manual under `manual/configuration/`
- **Plugin Development** (`plugin/`) — Plugin Manifest, lifecycle, configuration, developing Tool/Command/Hook/Event components, API reference, publishing
- **Docs Site** (`contributing/`) — This repository's contribution rules, style guide, and Markdown features
- **FAQ** (`faq/`) — Deployment, configuration, models, plugins, data migration FAQs; troubleshooting guide
- **Changelog** (`changelog/`) — Version release notes
- **About** (`about/`) — About the Project, About This Docs, Community Groups, Acknowledgements & Links, EULA, Privacy Policy

## Tech Stack

Technologies and plugins used by this documentation site:

- [VitePress](https://vitepress.dev/) — Static site generator based on Vite and Vue
- [Mermaid](https://mermaid.js.org/) — Flowcharts, sequence diagrams, etc. via `vitepress-plugin-mermaid`
- [vitepress-plugin-group-icons](https://vp.yuy1n.io/features.html) — Language icons for code group tabs
- [vitepress-markdown-timeline](https://github.com/LittleFox94/vitepress-markdown-timeline) — Timelines support
- Linkcard — Custom link card component (registered globally as `<Linkcard>`; automatically shows link favicon when logo is unspecified)
- [xgplayer](https://h5player.bytedance.com/) — Video player component
- [vitepress-plugin-llms](https://github.com/AnYiEE/vitepress-plugin-llms) — Generates llms.txt / llms-full.txt
- [@nolebase/vitepress-plugin-enhanced-readabilities](https://nolebase.ayaka.io/pages/zh-CN/integrations/vitepress-plugin-enhanced-readabilities/) — Enhanced reading experience

## Local Development

::: code-group

```bash [Bash ~vscode-icons:file-type-shell~]
# Install dependencies
pnpm install

# Start dev server
pnpm docs:dev

# Build for production
pnpm docs:build

# Preview production build
pnpm docs:preview
```

:::

## Contributing

You are welcome to contribute to the documentation! Here's how:

- Fork this repository, modify or add documentation content, and submit a PR
- When adding a page, register it in both `.vitepress/sidebar/zh.ts` and `.vitepress/sidebar/en.ts` (English-side links carry the `/en/` prefix); touch `.vitepress/config.mts` only when the top navigation needs it
- Sync the `en/` mirror in the same PR, keeping terminology, code, and filenames consistent
- Run `pnpm docs:build` before submitting: it validates dead links, container pairing, and snippet paths, and generates llms.txt
- When a page is retired or its path changes, add a 301 line for it in `public/_redirects`

For the detailed documentation workflow, see the [documentation repository README](https://github.com/Mai-with-u/docs). Code contributions follow the [MaiBot contribution guide](https://github.com/Mai-with-u/MaiBot/blob/main/docs/CONTRIBUTE.md).

## Markdown Features

In addition to VitePress's native features, this site is configured with extra Markdown plugins and custom components. Contributors should first read the [Markdown Features](/en/contributing/markdown-features) page to learn about Mermaid charts, timestamps, code group icons, the Linkcard component, and related conventions.

For the list of documentation contributors, see [Acknowledgements & Links](./acknowledgements).
