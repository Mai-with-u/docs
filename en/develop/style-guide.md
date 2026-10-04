---
title: Documentation Style Guide
---

# Documentation Style Guide

::: tip One-line manifesto
**Readers come with a problem; we give them the answer directly: conclusion first, then steps, then troubleshooting — like a friend walking them through it, not a manual reciting parameters.**
:::

Before writing any page, read the manifesto above, then follow the rules below. For syntax-level conventions (code groups, icons, Linkcard, no tables), see [Markdown Features](./markdown-features).

## Four Iron Rules

1. **Lead with the conclusion** — Open the page with one or two sentences saying what problem this page solves and who it is for. Never open with "This article will introduce…".
2. **Every step must be actionable** — Every value in the steps must be concrete: ports, paths, default values, button names, token names. Avoid vague instructions like "set as needed" or "configure appropriately".
3. **End with troubleshooting** — Every page ends with a "Verification & Troubleshooting" section: one executable verification action plus 2–5 common failure scenarios with their fixes.
4. **Headings are just words** — Headings contain only the heading text itself, in the page language: no numbering, dashes, or bracketed code names ("1. Tell Mai Who It Is — [bot]" ✗ → "Tell Mai Who It Is" ✓). Put ownership details in the body or code-group labels so the "On this page" outline stays clean and scannable.

## Identify the Page Type First

Before writing, decide which type this page is and follow its skeleton:

**Tutorial** (doing something for the first time) — Goal → Prerequisites → Numbered steps → Verification
**How-to guide** (doing a specific thing) — Conclusion → Steps or options → Troubleshooting
**Reference** (looking up parameters) — Definition list, field by field: name — default value, purpose
**Concept** (understanding how it works) — Analogy → Diagram → Glossary

## Tone

- Address the reader as "you", never "the user"
- Give direct commands: "Install NapCat", "Edit `config/bot_config.toml`" — not "you may consider"
- Place warnings where they matter in the body, not stacked at the top of the page
- Lead with the positive: say what the reader gains first, mention risks afterwards
- If one sentence suffices, don't use two

## Config Display: Code Block + Comments

For config-like content (plugin settings, config files, environment variables), **prefer a complete config template with inline comments** over item-by-item definition lists:

- **Copy-ready** — give the full config (all sections, all fields); readers copy it and edit the commented spots
- **Comments cover three things** — the field's purpose, its default value, and caveats (e.g. "must be greater than 0", "must match NapCat's setting")
- **Omitted field = default value** — showing every field in the template makes defaults visible and adjustable at a glance
- Definition lists are still fine for **expanding a single tricky field**, but full configs always go in a code block
- Follow the markdown-features code-group convention, with `~vscode-icons:file-type-toml~` tags

## Sidebar Rules

The sidebar follows the same manifesto as pages: readers must be able to **find the right entry at a glance**.

- **Grouping** — When a section has ≥5 sibling entries that readers can classify, group them. Group names state the distinguishing dimension, e.g. QQ grouped by route: "Local Client Login" / "Open Platform Bot". Avoid catch-all names like "Other" or "Misc"
- **Entry naming** — `Name — distinguishing description`: describe what it is, who it is for, or its highlight — not "docs about X". When the name alone is self-explanatory (e.g. "Database", "Bot Config"), no description is needed
- **Overview entry** — Each section's first item is the overview page, named "X Overview" (zh: X 概览)
- **Mirror symmetry** — zh/en groups, entries, and order must correspond one-to-one; zh is authoritative. New pages must be added to both sidebars
- **Positive wording** — Consistent with page tone: write "officially recommended", not "available (in testing)"

## Style Anchors (searchable online)

When unsure, look up these well-known sources to align:

- Structure: **Diátaxis** (diataxis.fr) — the four-way split of tutorials / how-to guides / reference / concept
- Tone: **Stripe Docs** (stripe.com/docs) and the **Google developer documentation style guide** (developers.google.com/style) — Voice & Tone sections
