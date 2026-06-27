
## Root Directory Files
| File | Description |
|------|-------------|
| `index.md` | VitePress homepage/Hero page, displays MaiBot introduction and navigation entry |
| `README.md` | Project description, introduces documentation repository purpose, local development methods and contribution guide |
| `_redirects` | SPA route redirect configuration (all paths redirect to /index.html) |
| `.gitignore` | Git ignore rules (node_modules, dist, .vitepress/cache, etc.) |
| `package.json` | Node.js project configuration (VitePress + Mermaid + Tabs plugins) |
| `pnpm-lock.yaml` | pnpm dependency lock file |
| `LICENSE` | Open source license file |

## Folder Structure Details

### `.vitepress/` — VitePress site configuration

| File/Folder | Description |
|-------------|-------------|
| `config.mts` | VitePress core configuration: navbar, sidebar, multilingual (Chinese/English), search, markdown plugins (Mermaid, Tabs), social links |
| `theme/` | Custom theme directory |
| `theme/index.ts` | Theme entry |
| `theme/style.css` | Custom styles |

### `manual/` — User manual (Simplified Chinese)

| File/Folder | Description |
|-------------|-------------|
| `index.md` | User manual overview |
| `deployment/` | Deployment and installation guide (deployment overview, source install, Docker, adapter installation) |
| `adapters/` | Platform adapter docs (NapCat QQ connection, GoCQ adapter) |
| `configuration/` | Configuration guide (Bot config, model config) |
| `features/` | Feature details (message pipeline, Maisaka inference engine, memory system, learning system, sticker system, MCP integration) |
| `webui/` | WebUI management docs (config management, memory management, plugin management, chat statistics) |
| `faq/` | FAQ and troubleshooting |
| `getting-started/` | Quick start guide |

### `develop/` — Development docs (Simplified Chinese)

| File/Folder | Description |
|-------------|-------------|
| `index.md` | Development guide overview (tech stack, project structure, environment setup) |
| `architecture.md` | Architecture design overview |
| `contributing.md` | Contribution guide |
| `architecture/` | Architecture details (message pipeline, Maisaka inference engine, memory system, WebUI internals) |
| `plugin-dev/` | Plugin development docs (Manifest, lifecycle, Tool, Command, Hook, event handling, API components, message gateway, Action, configuration, API reference) |
| `adapter-dev/` | Adapter development docs (PlatformIO driver) |

### `features/` — Feature introduction pages

| File/Folder | Description |
|-------------|-------------|
| Feature pages | Homepage feature card display content |

### `changelog/` — Changelog

| File/Folder | Description |
|-------------|-------------|
| Version logs | Records update content for each version |

### `community/` — Community pages

| File/Folder | Description |
|-------------|-------------|
| Community pages | QQ groups, GitHub links, social media, derived projects |

### `en/` — English documentation

The structure under `en/` is a complete mirror of the Chinese version, containing `manual/` (user manual), `develop/` (development docs), `features/` (feature introduction), `changelog/` (changelog), `community/` (community pages), and other subdirectories.

> ⚠️ **Note**: The `en/` English documentation is derived from translation of the Chinese content and should be kept as synchronized with the Chinese version as possible.

### `public/` — Static assets

| File/Folder | Description |
|-------------|-------------|
| `images/` | Documentation images (screenshots, diagrams) |
| `title_img/` | Homepage title images |
| `avatars/` | Avatar/character images |

### `.sisyphus/` — Internal workflow records

> ⚠️ Note: This folder contains internal workflow records. Do not edit manually.

## Documentation Writing Conventions

- **Do not use Markdown tables in content pages**. Markdown tables render poorly in VitePress (not mobile-friendly, column widths uncontrollable). Only `index.md` pages may use tables. For content pages, use definition lists instead, e.g. `**`field`** — Description. Default X`
- **Chinese and English documentation must be updated together**. When changing Chinese docs, update the corresponding English docs under `en/`; when changing English docs, check and update the corresponding Chinese docs. Both versions should communicate the same information, avoiding one-sided documentation updates.
