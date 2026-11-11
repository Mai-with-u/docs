---
title: About This Docs
---

# About This Docs

This is the official MaiBot documentation site, built with VitePress in Chinese and English ([简体中文](/) / [English](/en/)) and maintained by community contributors.

## Structure

`zh/` is the source of truth; `en/` mirrors it.

- **User manual** (`manual/`) — deployment, connecting platforms, configuration, plugin installation, WebUI operations, plus feature pages for multi-instance, personality, chat scenes, files, desktop pet, and internal chat
- **Development** (`develop/`) — integration only: the five adapter pages, plugin integration and development, and external agent connections
- **Docs site** (`contributing/`) — contribution rules, style guide, and Markdown features
- **FAQ** (`faq/`) — categorised questions and error troubleshooting
- **Changelog** (`changelog/`) — feature changes and fixes per release
- **About** (`about/`) — project overview, community, acknowledgements, EULA, and privacy policy

## Tech stack

- **VitePress** — static site generator; the build output deploys to Cloudflare Pages
- **Mermaid** — flowcharts and sequence diagrams
- **vitepress-plugin-group-icons** — language icons in code group labels
- **vitepress-markdown-timeline** — timeline layout for the changelog
- **Linkcard** — external link cards with local vector icons matched by domain
- **vitepress-plugin-llms** — generates `llms.txt` and `llms-full.txt` for AI readers

## Local development

::: code-group

```bash [Install ~vscode-icons:file-type-pnpm~]
pnpm install
```

```bash [Preview ~vscode-icons:file-type-shell~]
pnpm docs:dev
```

```bash [Build ~vscode-icons:file-type-shell~]
pnpm docs:build
```

:::

`pnpm docs:build` validates dead links, container pairing, and snippet paths, and generates `llms.txt`. Run it before opening a pull request.

## Contributing

- Fork the repository and open a pull request
- Register a new page in both `.vitepress/sidebar/zh.ts` and `en.ts` (English links take the `/en/` prefix); edit `config.mts` only when the top nav needs it
- Mirror every change in `en/` in the same pull request, keeping terms, code, and file names identical
- Add a 301 line to `public/_redirects` when a page is removed or moved

See [Contributing](/en/contributing/) and the [Style Guide](/en/contributing/style-guide) for writing rules, and [Markdown Features](/en/contributing/markdown-features) for syntax details.
