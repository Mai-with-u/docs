export function extractDescription(data: string, maxLength = 150): string {
  const body = data
    .replace(/^---[\s\S]*?---\s*/m, '')   // frontmatter
    .replace(/```[\s\S]*?```/g, '')     // fenced code blocks

  const paragraph: string[] = []
  for (const line of body.split('\n')) {
    const t = line.trim()
    if (!t) {
      if (paragraph.length) break
      continue
    }
    if (paragraph.length === 0) {
      if (/^#{1,6}\s/.test(t)) continue
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) continue
      if (/^(:::|<|!\[|\||>|[-*+]\s|\d+\.\s)/.test(t)) continue
    }
    paragraph.push(t)
  }

  let text = paragraph
    .join(' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length > maxLength) {
    const cut = text.slice(0, maxLength)
    const lastPunct = Math.max(
      cut.lastIndexOf('。'),
      cut.lastIndexOf('.'),
      cut.lastIndexOf('！'),
      cut.lastIndexOf('？')
    )
    text = lastPunct > maxLength * 0.6 ? cut.slice(0, lastPunct + 1) : cut + '…'
  }
  return text
}

export function countWord(data: string): number {
  // Strip markdown syntax before counting
  const cleaned = data
    .replace(/^---[\s\S]*?---/m, '')        // frontmatter
    .replace(/```[\s\S]*?```/g, '')          // code blocks
    .replace(/`[^`]*`/g, '')                 // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '')         // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links (keep text)
    .replace(/[#>*_~|-]/g, '')               // markdown symbols

  const cn = cleaned.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const en = cleaned.match(/\b[a-zA-Z]+\b/g)?.length || 0
  return cn + en
}
