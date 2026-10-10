---
title: Contributing to the Docs Site
---

# Contributing to the Docs Site

**This site is a VitePress site where Chinese is the authoritative source and English is the mirror.** Changing docs only means editing Markdown — no theme work — but a few hard rules must be followed, or the CI build check fails outright.

## Repository Structure

- **`zh/`** — Chinese docs (authoritative). Change content here first.
- **`en/`** — English mirror, whose directory structure maps one-to-one onto `zh/`.
- **`.vitepress/`** — Site configuration: `config.mts` (navigation and plugins), `sidebar/` (sidebars), `theme/` (theme and components), `markdown/` (custom Markdown plugins).
- **`public/`** — Static assets: `images/`, `title_img/`, `avatars/`.

Content sections:

- **`manual/`** — User manual: deployment, adapters, configuration, plugin installation, WebUI.
- **`develop/`** — Integration docs: adapters, plugin integration, programmatic access (WebUI API), data statistics; model and MCP configuration guidance lives under `manual/configuration/`.
- **`plugin/`** — Plugin development docs (the authoritative single entry point).
- **`contributing/`** — The docs-site collaboration conventions, which is this page.
- **`faq/` `changelog/` `about/`** — FAQ, changelog, project metadata.

## Local Preview and Build

::: code-group

```bash [pnpm ~vscode-icons:file-type-pnpm~]
pnpm install
pnpm docs:dev      # Local preview; file edits refresh instantly
```

```bash [Build ~vscode-icons:file-type-shell~]
pnpm docs:build    # Build the whole site and generate llms.txt
```

:::

Before submitting, you **must** run `pnpm docs:build` once: it does more than bundle — it validates dead links, container syntax, and snippet import paths.

## Hard Rules

::: steps
1. **Chinese first, English in sync** — If you change a content page under `zh/`, sync the `en/` mirror in the same PR. Terminology, code, and filenames must match; prose may be rewritten.

2. **New pages must register in the navigation** — Update both `.vitepress/sidebar/zh.ts` and `.vitepress/sidebar/en.ts` (English-side links carry the `/en/` prefix), and update the top navigation in `config.mts` when needed.

3. **Images go in `public/images/`** and are referenced from the body as `/images/xxx.png`; avatars and title images go in `public/avatars/` and `public/title_img/`.

4. **Three writing prohibitions** — Content pages don't use Markdown tables (use definition lists instead), standalone external links aren't written as bare links (use `<Linkcard>` instead), and standalone code blocks aren't left bare (wrap them in `::: code-group` with an explicit icon). See [Markdown Features](./markdown-features) for the details.
:::

## Writing Conventions

- How to write at the expression level (conclusion first, actionable steps, troubleshooting at the end) → [Documentation Style Guide](./style-guide)
- How to write at the syntax level (code groups, icons, Mermaid, custom containers, components) → [Markdown Features](./markdown-features)

## Verification & Troubleshooting

**Acceptance check** — `pnpm docs:build` finishes without errors, and the pages you added are reachable from the sidebar.

- **The build reports a "dead link"** — The link path is wrong, or a page was moved without updating its references; note that English pages need the `/en/` prefix.
- **The build reports an unclosed container** — The `:::` markers don't pair up; custom containers support nesting, but every level needs its own closing marker.
- **The build reports a nonexistent snippet path** — Paths in `<<< @/...` are **relative to the site root**, not to the current file.
- **The page renders but isn't in the sidebar** — The new page wasn't registered in the sidebar, or it was registered under the wrong path group.
- **Review rejects the PR for a zh/en mismatch** — The `zh/` and `en/` pages, sidebar entries, and code block structures must correspond one-to-one.
