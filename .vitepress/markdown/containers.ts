/**
 * Nesting-aware custom containers for the MaiBot docs site.
 *
 * Markdown-it's stock `markdown-it-container` cannot nest (the first bare `:::`
 * closes whatever container is open), which makes it impossible to put an
 * `::: fields` reference list inside an `::: endpoint` card. This module
 * implements a small block rule that tracks container depth, so any registered
 * container — including VitePress' own `::: tip` / `::: code-group` — can be
 * nested inside another.
 *
 * Registered containers:
 *   ::: endpoint <METHOD> <path>   → section card whose title is a real <h3>
 *                                    (shows up in the outline and gets an
 *                                    anchor id), body is regular Markdown
 *   ::: fields                     → compact field/parameter reference list
 *   ::: steps                      → numbered step list styling
 */
import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'

type RenderRule = (
  tokens: Token[],
  idx: number,
  options: unknown,
  env: Record<string, unknown>,
  self: { renderToken: (tokens: Token[], idx: number, options: unknown) => string }
) => string

export interface ContainerSpec {
  /** Optional Markdown heading emitted at the top of the container body. */
  heading?: (info: string, env: Record<string, unknown>, line: number) => {
    tag: string
    text: string
    attrs: [string, string][]
  } | null
  open: RenderRule
  close: RenderRule
}

const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'WS'])

const OPEN_RE = /^(:{3,})[ \t]*([^\s:]+)?[ \t]*(.*)$/

/** Text of a single line without its trailing newline. */
function lineText(state: StateBlock, line: number): string {
  return state.src.slice(state.bMarks[line] + state.tShift[line], state.eMarks[line])
}

/** Slug for an endpoint heading id: `POST /api/x` → `post-api-x`. */
function endpointId(info: string): string {
  const raw = info
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return raw || 'endpoint'
}

/**
 * Find the line that closes the container opened at `startLine`.
 * Fences are skipped so that `:::` inside a code block never closes a card,
 * and nested containers of any kind raise the depth.
 */
function findClosingLine(state: StateBlock, contentStart: number, endLine: number): number {
  let depth = 0
  let fence: string | null = null
  for (let line = contentStart; line < endLine; line++) {
    if (state.sCount[line] - state.blkIndent >= 4) continue
    const text = lineText(state, line)

    if (fence) {
      if (new RegExp(`^ {0,3}${fence}[ \t]*$`).test(text)) fence = null
      continue
    }
    const fenceMatch = text.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fenceMatch) {
      fence = fenceMatch[1]
      continue
    }

    const marker = text.match(OPEN_RE)
    if (!marker) continue
    if (marker[2]) {
      depth++
    } else if (depth === 0) {
      return line
    } else {
      depth--
    }
  }
  return -1
}

function defaultOpen(name: string): RenderRule {
  return () => `<div class="mb-block mb-${name}">\n`
}

function defaultClose(): RenderRule {
  return () => '</div>\n'
}

export const endpointSpec: ContainerSpec = {
  heading(info, env, line) {
    const trimmed = info.trim()
    if (!trimmed) return null
    const [first, ...rest] = trimmed.split(/\s+/)
    const method = first.toUpperCase()
    const isMethod = HTTP_METHODS.has(method)
    if (!isMethod && rest.length === 0) {
      // Plain title form: `::: endpoint 出站回执`
      return { tag: 'h3', text: trimmed, attrs: [['class', 'mb-endpoint-title']] }
    }
    const path = rest.join(' ')
    const ids = (env.__mbEndpointIds ??= {}) as Record<string, number>
    let id = endpointId(trimmed)
    if (ids[id]) {
      ids[id] += 1
      id = `${id}-${ids[id]}`
    } else {
      ids[id] = 1
    }
    const attrs: [string, string][] = [
      ['class', `mb-endpoint-title mb-endpoint-${method.toLowerCase()}`],
      ['id', id],
    ]
    if (isMethod) attrs.push(['data-mb-method', method])
    return { tag: 'h3', text: isMethod ? `${method} ${path}` : trimmed, attrs }
  },
  open: (tokens, idx) => {
    const method = (tokens[idx].info ?? '').trim().split(/\s+/)[0]?.toLowerCase() ?? ''
    const modifier = HTTP_METHODS.has(method.toUpperCase()) ? ` mb-endpoint-${method}` : ''
    return `<div class="mb-block mb-endpoint${modifier}">\n`
  },
  close: () => '</div>\n',
}

export const fieldsSpec: ContainerSpec = {
  open: () => '<div class="mb-block mb-fields">\n',
  close: () => '</div>\n',
}

export const stepsSpec: ContainerSpec = {
  open: () => '<div class="mb-block mb-steps">\n',
  close: () => '</div>\n',
}

export function markdownContainers(md: MarkdownIt, specs: Record<string, ContainerSpec>): void {
  for (const [name, spec] of Object.entries(specs)) {
    const ruleName = `mb_container_${name}`

    md.block.ruler.before(
      'fence',
      ruleName,
      (state: StateBlock, startLine: number, endLine: number, silent: boolean) => {
        if (state.sCount[startLine] - state.blkIndent >= 4) return false

        const openMatch = lineText(state, startLine).match(OPEN_RE)
        if (!openMatch || openMatch[2] !== name) return false

        const info = openMatch[3] ?? ''
        const contentStart = startLine + 1
        const closeLine = findClosingLine(state, contentStart, endLine)
        if (closeLine < 0) {
          if (silent) return false
          throw new Error(
            `[markdown/containers] 第 ${startLine + 1} 行的 ::: ${name} 没有找到配对的 :::`
          )
        }
        if (silent) return true

        const oldParent = state.parentType
        const oldLineMax = state.lineMax
        state.parentType = 'container'
        state.lineMax = closeLine

        // The section title is emitted *outside* the container so it stays at
        // token level 0 — VitePress only collects level-0 headings for the
        // outline ("本页目录"), and the card body needs to be a wrapper anyway.
        const heading = spec.heading?.(info, state.env as Record<string, unknown>, startLine)
        if (heading) {
          const headingOpen = state.push('heading_open', heading.tag, 1)
          headingOpen.attrs = heading.attrs
          headingOpen.map = [startLine, contentStart]
          const inline = state.push('inline', '', 0)
          inline.content = heading.text
          inline.children = []
          inline.map = [startLine, contentStart]
          const headingClose = state.push('heading_close', heading.tag, -1)
          headingClose.map = [startLine, contentStart]
        }

        const openToken = state.push(`mb_${name}_open`, 'div', 1)
        openToken.info = info
        openToken.markup = openMatch[1]
        openToken.block = true
        openToken.map = [startLine, closeLine + 1]

        state.md.block.tokenize(state, contentStart, closeLine)

        const closeToken = state.push(`mb_${name}_close`, 'div', -1)
        closeToken.markup = openMatch[1]
        closeToken.block = true

        state.parentType = oldParent
        state.lineMax = oldLineMax
        state.line = closeLine + 1
        return true
      },
      { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
    )

    md.renderer.rules[`mb_${name}_open`] = spec.open
    md.renderer.rules[`mb_${name}_close`] = spec.close
  }
}

/** Default export so `md.use(...)` can register every container at once. */
export default function maiContainers(md: MarkdownIt): void {
  markdownContainers(md, {
    endpoint: endpointSpec,
    fields: fieldsSpec,
    steps: stepsSpec,
  })
}

export { defaultOpen, defaultClose, HTTP_METHODS }
