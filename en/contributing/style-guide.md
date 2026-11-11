---
title: Documentation Style Guide
---

# Documentation Style Guide

The goal of this site is one sentence long: **readers arrive with a question and should find a usable answer on one screen.** The writing and layout follow the [DeepSeek API docs](https://api-docs.deepseek.com/zh-cn/): a single sentence on what the feature does, then a config or command you can copy, parameters as a definition list, long material folded into `::: details`, and a closing section with verification and troubleshooting only.

For syntax-level conventions (code groups, icons, Linkcard, containers, no tables), see [Markdown Features](./markdown-features).

## Page skeleton

1. **H1 is the name and nothing else** — no numbering, dashes, or bracketed code names. Put ownership details in the body or code-group labels so the "On this page" outline stays scannable.
2. **One-sentence lead** — one or two sentences on what the feature lets the reader do. The most important information follows immediately: a command, a config block, or a short capability list.
3. **H2 per task** — each H2 resolves one thing. Don't cut the page into "introduction / parameters / notes" boilerplate.
4. **Parameters as a definition list** — each entry reads "name — default / accepted values / purpose". Whole config blocks stay in copyable code blocks.
5. **Fold the long material** — full examples, edge cases, and derivations go into `::: details`.
6. **Close with verification and troubleshooting** — tutorials and how-to guides get one executable check plus 2–5 common failures. Reference pages, index pages, FAQ, legal and meta pages don't need one.

Page types and skeletons:

**Tutorial** (doing something for the first time) — Goal → Prerequisites → Numbered steps → Verification
**How-to guide** (doing a specific thing) — Conclusion → Steps or options → Troubleshooting
**Reference** (looking up parameters) — Definition list, field by field: name — default, purpose
**Concept** (understanding how it works) — Analogy → Diagram → Glossary

## Voice

- Address the reader as "you", never "the user".
- Give direct commands: "Run `pnpm docs:build`", "Set `host` to `0.0.0.0`" — not "you may consider".
- One sentence per idea. Cut every adjective that carries nothing.
- No exclamation marks, no emoji, no "simple", "easy", or "one click" marketing language.
- Keep technical terms in English (API, Token, Hook, Plugin, WebUI, Adapter, Prompt, JSON, TOML). Don't translate them, don't quote them.
- Explain a proper noun the first time it appears; never again.
- Put a warning where it takes effect, not stacked at the top of the page.

## Never do this

1. **Narrate what's visible on screen** — skip "click the button in the top right, then pick the first item". Write only what the reader can't see: defaults, consequences, prerequisites.
2. **Version annotations** — no "supported since 1.4.0", "older versions don't have this", "new in this release". Describe the current version as it is.
3. **"Not A, but B"** — and its mirror, "A, not non-A". Delete any contrast that adds no information.
4. **Vague instructions** — no "configure as appropriate" or "set it depending on your needs". Give a concrete value or explain how to choose one.

## Config display: whole template plus inline comments

Give a **complete config template** with every field present and commented, so the reader copies it and edits only the marked lines:

- **Complete and copyable** — include every section and field; an omitted field means the default
- **Comments cover three things** — purpose, default value, and constraints ("must be greater than 0", "match the NapCat setting")
- A single error-prone field can get a definition-list entry after the template, but whole configs always use a code block
- Follow the code-group conventions in [Markdown Features](./markdown-features), with `~vscode-icons:file-type-toml~` in the label

## Sidebar rules

The sidebar follows the same standard as the pages: a reader must **spot the right entry at a glance**.

- **Grouping** — group siblings when there are five or more and they fall into recognisable categories. Name the grouping dimension, such as splitting QQ by access route into "local client login" and "official platform bot"; never use catch-alls like "Other" or "Misc".
- **Entry naming** — `Name — what sets it apart`: describe what it is, who it's for, what makes it special. Don't write "the docs for X". Drop the description when the name already distinguishes it.
- **Overview entry** — the first entry of every section is the overview page, named "X Overview" (zh: X 概览).
- **Mirrored structure** — zh and en share groups, entries, and order, with zh as the source of truth.
- **Positive wording** — "officially recommended", not "available (in testing)".

## Style anchors

- Layout and rhythm: **DeepSeek API docs** (api-docs.deepseek.com/zh-cn)
- Structure: **Diátaxis** (diataxis.fr) — tutorial / how-to / reference / explanation
- Voice: **Stripe docs** and the Voice & Tone chapters of the **Google developer documentation style guide**

## Verification

Run both from the repository root after editing:

::: code-group

```bash [Build ~vscode-icons:file-type-shell~]
pnpm docs:build
```

```bash [Quality check ~vscode-icons:file-type-shell~]
node scripts/docs-quality.mjs
```

:::

The build validates dead links, container pairing, and snippet paths, and generates `llms.txt`. The quality script additionally checks zh/en symmetry, page skeleton, and the three writing bans.
