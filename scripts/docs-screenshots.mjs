#!/usr/bin/env node
/**
 * 把本次改动涉及的文档页面渲染成整页截图，供所有人审阅。
 *
 * 由 .github/workflows/docs-screenshots.yml 调用，也可本地手动运行：
 *
 *   node scripts/docs-screenshots.mjs \
 *     --changed .changed-files.txt \
 *     --out .screenshots \
 *     --sha "$(git rev-parse HEAD)" \
 *     --base HEAD^ \
 *     --repo Mai-with-u/docs
 *
 * 产物：
 *   <out>/<sha>/<page>.png     页面截图（超长页按 12000px 切片）
 *   <out>/manifest.json        机器可读清单
 *   <out>/gallery.html         下载后可直接打开的离线相册
 *   <out>/README.md            截图分支首页
 *   <out>/comment.md           提交评论正文（Markdown）
 *
 * 依赖 playwright；CI 里临时安装后通过 PLAYWRIGHT_PATH 指向模块目录。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync, createReadStream } from 'node:fs'
import { join, resolve, relative, basename, extname, sep } from 'node:path'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'

const ROOT = resolve(new URL('..', import.meta.url).pathname)
const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  const next = args[i + 1]
  return i >= 0 && next && !next.startsWith('--') ? next : fallback
}

const DIST = resolve(ROOT, opt('dist', '.vitepress/dist'))
const OUT = resolve(ROOT, opt('out', '.screenshots'))
const CHANGED_FILE = opt('changed', '')
const SHA = opt('sha', process.env.GITHUB_SHA || 'local')
const SHORT_SHA = SHA.slice(0, 7)
const BASE = opt('base', '')
const REPO = opt('repo', process.env.GITHUB_REPOSITORY || '')
const BRANCH = opt('branch', 'docs-screenshots')
const WIDTH = Number(opt('width', '1440'))
const MAX_PAGES = Number(opt('max-pages', '40'))
const GLOBAL_SAMPLE = Number(opt('global-sample', '16'))
const INLINE_LIMIT = Number(opt('inline', '8'))
const SEGMENT_HEIGHT = 12000
const SERVER_URL = process.env.GITHUB_SERVER_URL || 'https://github.com'
const RUN_URL =
  process.env.GITHUB_RUN_ID && REPO ? `${SERVER_URL}/${REPO}/actions/runs/${process.env.GITHUB_RUN_ID}` : ''

/* ------------------------------------------------------------------ 页面发现 */

const hash = (s) => createHash('md5').update(s).digest('hex').slice(0, 6)

/** 文件改动会波及所有页面时，抽样渲染若干代表页 */
const isGlobalChange = (file) =>
  file.startsWith('.vitepress/') ||
  file.startsWith('public/') ||
  file === 'package.json' ||
  file === 'pnpm-lock.yaml'

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function cleanTitle(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*`_]/g, '')
    .trim()
}

function readTitle(file) {
  const text = readFileSync(file, 'utf-8')
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (frontmatter) {
    const m = frontmatter[1].match(/^title:\s*(.+)$/m)
    if (m) return cleanTitle(m[1].replace(/^['"]|['"]$/g, ''))
  }
  const h1 = text.match(/^#\s+(.+)$/m)
  if (h1) return cleanTitle(h1[1])
  return basename(file, '.md')
}

/**
 * 把 zh/、en/ 下的 Markdown 映射成构建产物里的 HTML 路径。
 * zh/ 经 rewrites 去掉前缀；en/ 保留 /en/。cleanUrls 下每页都有 .html 文件。
 */
function pageFromFile(file) {
  const relPath = relative(ROOT, file).split(sep).join('/')
  const locale = relPath.startsWith('en/') ? 'en' : 'zh'
  const urlPrefix = locale === 'en' ? 'en/' : ''
  let rest = relPath.slice(locale.length + 1).replace(/\.md$/, '')
  if (rest === 'index') rest = ''
  else if (rest.endsWith('/index')) rest = rest.slice(0, -'/index'.length)

  const url = `/${urlPrefix}${rest ? `${rest}.html` : 'index.html'}`
  if (!existsSync(join(DIST, url))) return null

  const rawSlug = (rest || 'index').replace(/\//g, '-')
  const safeSlug = rawSlug.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
  const slug = safeSlug === rawSlug ? `${locale}-${rawSlug}` : `${locale}-${safeSlug || 'page'}-${hash(rawSlug)}`
  const title = rest === '' ? (locale === 'en' ? 'Home' : '首页') : readTitle(file)
  return {
    locale,
    source: relPath,
    route: `/${urlPrefix}${rest}`,
    url,
    slug,
    title,
  }
}

function discoverPages() {
  const pages = []
  for (const dir of ['zh', 'en']) {
    for (const file of walk(join(ROOT, dir))) {
      if (!file.endsWith('.md') || /(^|[/\\])(README|AGENTS)\.md$/.test(file)) continue
      const page = pageFromFile(file)
      if (page) pages.push(page)
    }
  }
  return pages.sort((a, b) => (a.locale === b.locale ? a.route.localeCompare(b.route) : a.locale.localeCompare(b.locale)))
}

/** 均布抽样，保留首尾，避免只看到目录首页 */
function sampleEvenly(items, count) {
  if (count <= 0 || !items.length) return []
  if (count === 1) return [items[Math.floor(items.length / 2)]]
  if (items.length <= count) return items
  const picked = new Set()
  for (let i = 0; i < count; i++) {
    picked.add(Math.round((i * (items.length - 1)) / (count - 1)))
  }
  return [...picked].sort((a, b) => a - b).map((i) => items[i])
}

/** 全站改动抽样：首页必选，中英文各占一半 */
function pickGlobalSample(all, count) {
  const homes = all.filter((p) => p.route === '/' || p.route === '/en/')
  const picked = [...homes]
  const rest = all.filter((p) => !homes.includes(p))
  const budget = Math.max(0, count - picked.length)
  const zh = rest.filter((p) => p.locale === 'zh')
  const en = rest.filter((p) => p.locale === 'en')
  const zhBudget = Math.min(zh.length, Math.ceil(budget / 2))
  const enBudget = Math.min(en.length, Math.max(0, budget - zhBudget))
  picked.push(...sampleEvenly(zh, zhBudget), ...sampleEvenly(en, enBudget))

  // 一侧页面不足时，用另一侧补齐
  for (const page of [...zh, ...en]) {
    if (picked.length >= count) break
    if (!picked.includes(page)) picked.push(page)
  }
  return picked
}

function uniqueByRoute(pages) {
  const seen = new Set()
  return pages.filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)))
}

/** public/ 下的图片等资源：找出正文里引用它的页面，顺带渲染 */
function pagesReferencingPublic(changedFiles) {
  const refs = changedFiles.filter((f) => f.startsWith('public/')).map((f) => f.slice('public/'.length))
  if (!refs.length) return []
  const pages = []
  for (const dir of ['zh', 'en']) {
    for (const file of walk(join(ROOT, dir))) {
      if (!file.endsWith('.md') || /(^|[/\\])(README|AGENTS)\.md$/.test(file)) continue
      const text = readFileSync(file, 'utf-8')
      if (refs.some((ref) => text.includes(ref))) {
        const page = pageFromFile(file)
        if (page) pages.push(page)
      }
    }
  }
  return pages
}

/* ------------------------------------------------------------------ 静态服务 */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

/** 只读地托管 .vitepress/dist，支持 cleanUrls 与 404 回退 */
function startServer(dist) {
  const rootDir = resolve(dist)
  const server = createServer((req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)
      if (pathname.endsWith('/')) pathname += 'index.html'
      let file = resolve(rootDir, `.${pathname}`)
      if (file !== rootDir && !file.startsWith(rootDir + sep)) {
        res.writeHead(403).end('forbidden')
        return
      }
      if (!existsSync(file) || statSync(file).isDirectory()) {
        file = [`${file}.html`, join(file, 'index.html'), join(rootDir, '404.html')].find((p) => existsSync(p))
      }
      if (!file) {
        res.writeHead(404).end('not found')
        return
      }
      res.writeHead(200, {
        'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store',
      })
      createReadStream(file).pipe(res)
    } catch {
      res.writeHead(500).end('server error')
    }
  })
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)))
}

/* ------------------------------------------------------------------ 截图 */

function loadPlaywright() {
  const require = createRequire(import.meta.url)
  const path = process.env.PLAYWRIGHT_PATH || 'playwright'
  try {
    return require(path)
  } catch {
    console.error(
      `找不到 playwright（${path}）。本地可先 npm i -D playwright 并 npx playwright install chromium，` +
        '或设置 PLAYWRIGHT_PATH 指向已安装的模块目录。',
    )
    process.exit(1)
  }
}

async function settle(page) {
  await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {})
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await page
    .evaluate(async () => {
      const pending = [...document.images].filter((img) => !img.complete)
      await Promise.race([
        Promise.all(pending.map((img) => new Promise((done) => ((img.onload = done), (img.onerror = done))))),
        new Promise((done) => setTimeout(done, 8000)),
      ])
    })
    .catch(() => {})

  // Mermaid 在浏览器端渲染，等 SVG 出现再截图
  const hasMermaid = await page.evaluate(() => document.querySelectorAll('[class*="mermaid"]').length > 0).catch(() => false)
  if (hasMermaid) {
    await page
      .waitForFunction(
        () => [...document.querySelectorAll('[class*="mermaid"]')].every((el) => el.querySelector('svg')),
        null,
        { timeout: 15000 },
      )
      .catch(() => {})
  }

  // 逐屏滚动触发懒加载，再回到顶部
  await page
    .evaluate(async () => {
      const height = document.documentElement.scrollHeight
      for (let y = 0; y < height; y += 800) {
        window.scrollTo(0, y)
        await new Promise((done) => setTimeout(done, 25))
      }
      window.scrollTo(0, 0)
      await new Promise((done) => setTimeout(done, 250))
    })
    .catch(() => {})

  await page
    .addStyleTag({
      content: `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}`,
    })
    .catch(() => {})
}

async function capture(page, entry, outDir, baseName) {
  const height = await page.evaluate(() =>
    Math.max(document.body?.scrollHeight || 0, document.documentElement.scrollHeight, window.innerHeight),
  )
  const files = []
  const take = async (name, options) => {
    const file = join(outDir, name)
    await page.screenshot({ path: file, animations: 'disabled', caret: 'hide', timeout: 60000, ...options })
    files.push(relative(OUT, file).split(sep).join('/'))
  }

  if (height <= SEGMENT_HEIGHT) {
    await take(`${baseName}.png`, { fullPage: true })
  } else {
    // Chromium 对超长整页截图有高度限制，按段切片保证可用
    const segments = Math.ceil(height / SEGMENT_HEIGHT)
    for (let i = 0; i < segments; i++) {
      const y = i * SEGMENT_HEIGHT
      await take(`${baseName}-${i + 1}.png`, {
        fullPage: true,
        clip: { x: 0, y, width: WIDTH, height: Math.min(SEGMENT_HEIGHT, height - y) },
      })
    }
  }
  return { files, height }
}

/* ------------------------------------------------------------------ 产物生成 */

const RAW_HOST =
  SERVER_URL === 'https://github.com' ? 'https://raw.githubusercontent.com' : `${SERVER_URL}/raw`
const rawUrl = (rel) => `${RAW_HOST}/${REPO}/${BRANCH}/${rel}`
const branchBlobUrl = () => `${SERVER_URL}/${REPO}/blob/${BRANCH}/README.md`
const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function metaLines(manifest) {
  const lines = []
  if (manifest.repository) lines.push(`- 仓库：\`${manifest.repository}\``)
  lines.push(`- 提交：\`${manifest.sha}\``)
  if (manifest.base) lines.push(`- 对比基线：\`${manifest.base.slice(0, 12)}\``)
  if (manifest.runUrl) lines.push(`- 运行记录：${manifest.runUrl}`)
  lines.push(`- 页面：${manifest.pages.length} 个，截图 ${manifest.screenshots} 张`)
  return lines.join('\n')
}

function writeReadme(manifest) {
  const lines = [
    '# 改动页面截图',
    '',
    metaLines(manifest),
    '',
    '> 由 CI 自动生成，仅供排版与内容审阅。本分支每次运行都会整体覆盖。',
    '',
  ]
  if (manifest.global) {
    lines.push(`本次改动触及全站配置或资源，抽取 ${manifest.pages.length} 个代表页面渲染。`, '')
  }
  for (const locale of ['zh', 'en']) {
    const pages = manifest.pages.filter((p) => p.locale === locale)
    if (!pages.length) continue
    lines.push(`## ${locale === 'zh' ? '简体中文' : 'English'}`, '')
    for (const page of pages) {
      lines.push(`### ${page.title}`, '', `- 页面：\`${page.route}\``, `- 源码：\`${page.source}\``, '')
      for (const file of page.files) lines.push(`![${page.title}](${file})`, '')
    }
  }
  if (manifest.errors.length) {
    lines.push('## 截图失败', '')
    for (const err of manifest.errors) lines.push(`- \`${err.source}\`：${err.error}`)
    lines.push('')
  }
  writeFileSync(join(OUT, 'README.md'), lines.join('\n'))
}

function writeGallery(manifest) {
  const summary = metaLines(manifest)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, '<br>')
  const blocks = []
  for (const locale of ['zh', 'en']) {
    const pages = manifest.pages.filter((p) => p.locale === locale)
    if (!pages.length) continue
    blocks.push(`<h2>${locale === 'zh' ? '简体中文' : 'English'}</h2>`)
    for (const page of pages) {
      blocks.push(
        `<section><h3>${escapeHtml(page.title)}</h3>` +
          `<p class="meta">${escapeHtml(page.route)} · ${escapeHtml(page.source)}</p>` +
          page.files.map((f) => `<img loading="lazy" src="${escapeHtml(f)}" alt="${escapeHtml(page.title)}">`).join('') +
          '</section>',
      )
    }
  }
  writeFileSync(
    join(OUT, 'gallery.html'),
    `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<title>改动页面截图 · ${escapeHtml(SHORT_SHA)}</title>
<style>
  body{margin:0;padding:32px;font:15px/1.6 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;background:#f6f7f9;color:#1f2328}
  h1{font-size:22px;margin:0 0 8px}
  .meta{color:#59636e;font-size:13px}
  .summary{background:#fff;border:1px solid #d1d9e0;border-radius:8px;padding:16px 20px;margin-bottom:24px}
  section{background:#fff;border:1px solid #d1d9e0;border-radius:8px;padding:16px 20px;margin-bottom:24px}
  h2{font-size:18px;margin:32px 0 12px}
  h3{font-size:16px;margin:0 0 4px}
  img{display:block;width:100%;height:auto;border:1px solid #d1d9e0;border-radius:6px;margin:12px 0}
  a{color:#0969da}
</style>
<h1>改动页面截图 · ${escapeHtml(SHORT_SHA)}</h1>
<div class="summary">${summary}</div>
${blocks.join('\n')}
</html>`,
  )
}

function writeComment(manifest) {
  if (!manifest.pages.length) return
  const lines = [
    `📸 **改动页面截图** · \`${SHORT_SHA}\``,
    '',
    `本次共渲染 ${manifest.pages.length} 个改动页面（${manifest.screenshots} 张截图）。` +
      (manifest.global ? '改动涉及全站配置或资源，已抽取代表页面。' : ''),
    '',
  ]
  if (REPO) lines.push(`- [截图分支](${branchBlobUrl()}) · [Actions 运行](${RUN_URL || `${SERVER_URL}/${REPO}/actions`})`, '')

  let inlined = 0
  for (const locale of ['zh', 'en']) {
    const pages = manifest.pages.filter((p) => p.locale === locale)
    if (!pages.length) continue
    lines.push('<details>', `<summary>${locale === 'zh' ? '简体中文' : 'English'}（${pages.length} 页）</summary>`, '')
    for (const page of pages) {
      lines.push(`**[${page.title}](${SERVER_URL}/${REPO}/blob/${SHA}/${page.source})** · \`${page.route}\``)
      for (const file of page.files) {
        if (inlined < INLINE_LIMIT) {
          lines.push(`![${page.title}](${rawUrl(file)})`)
          inlined++
        } else {
          lines.push(`[查看截图](${rawUrl(file)})`)
        }
      }
      lines.push('')
    }
    lines.push('</details>', '')
  }
  if (manifest.errors.length) {
    lines.push('<details>', `<summary>⚠️ ${manifest.errors.length} 个页面截图失败</summary>`, '')
    for (const err of manifest.errors) lines.push(`- \`${err.source}\`：${err.error}`)
    lines.push('', '</details>', '')
  }
  lines.push('> 截图由 CI 自动生成，仅供排版审阅；内容以源码为准。')
  writeFileSync(join(OUT, 'comment.md'), lines.join('\n'))
}

/* ------------------------------------------------------------------ 主流程 */

const changedFiles = CHANGED_FILE && existsSync(CHANGED_FILE)
  ? readFileSync(CHANGED_FILE, 'utf-8').split('\n').map((s) => s.trim()).filter(Boolean)
  : []

const globalChange = changedFiles.some(isGlobalChange)
const changedPages = uniqueByRoute(
  changedFiles
    .filter((f) => /^(zh|en)\/.+\.md$/.test(f) && !/(^|\/)(README|AGENTS)\.md$/.test(f))
    .map((f) => pageFromFile(join(ROOT, f)))
    .filter(Boolean),
)

let pages = [...changedPages, ...pagesReferencingPublic(changedFiles)]
if (globalChange) {
  pages.push(...pickGlobalSample(discoverPages(), GLOBAL_SAMPLE))
}
pages = uniqueByRoute(pages)

if (pages.length > MAX_PAGES) {
  console.warn(`改动页面 ${pages.length} 个，超过上限 ${MAX_PAGES}，仅渲染前 ${MAX_PAGES} 个`)
  pages = pages.slice(0, MAX_PAGES)
}
pages.sort((a, b) => (a.locale === b.locale ? a.route.localeCompare(b.route) : a.locale.localeCompare(b.locale)))

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

if (!pages.length) {
  writeFileSync(
    join(OUT, 'manifest.json'),
    JSON.stringify({ sha: SHA, base: BASE, repository: REPO, generatedAt: new Date().toISOString(), pages: [], screenshots: 0, errors: [] }, null, 2),
  )
  console.log('本次没有改动页面，跳过截图')
  process.exit(0)
}

if (!existsSync(DIST)) {
  console.error(`构建产物不存在：${DIST}，请先运行 pnpm docs:build`)
  process.exit(1)
}

const { chromium } = loadPlaywright()
const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] })
const server = await startServer(DIST)
const origin = `http://127.0.0.1:${server.address().port}`
const outDir = join(OUT, SHORT_SHA)
mkdirSync(outDir, { recursive: true })

const results = []
const errors = []
for (const [index, page] of pages.entries()) {
  const label = `[${index + 1}/${pages.length}] ${page.route}`
  process.stdout.write(`${label} ... `)
  let context
  try {
    context = await browser.newContext({
      viewport: { width: WIDTH, height: 1000 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
      locale: page.locale === 'en' ? 'en-US' : 'zh-CN',
      reducedMotion: 'reduce',
    })
    const tab = await context.newPage()
    await tab.goto(origin + page.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await tab.waitForSelector('#app', { timeout: 15000 }).catch(() => {})
    await settle(tab)
    const { files, height } = await capture(tab, page, outDir, page.slug)
    results.push({ ...page, files, height })
    console.log(`ok (${files.length} 张)`)
  } catch (error) {
    const message = String(error?.message || error).split('\n')[0].slice(0, 300)
    errors.push({ source: page.source, route: page.route, error: message })
    console.log(`失败：${message}`)
  } finally {
    await context?.close().catch(() => {})
  }
}

await browser.close()
server.close()

const manifest = {
  sha: SHA,
  base: BASE,
  repository: REPO,
  ref: process.env.GITHUB_REF_NAME || '',
  runUrl: RUN_URL,
  generatedAt: new Date().toISOString(),
  global: globalChange,
  pages: results,
  screenshots: results.reduce((n, p) => n + p.files.length, 0),
  errors,
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
writeReadme(manifest)
writeGallery(manifest)
writeComment(manifest)

console.log(`完成：${results.length}/${pages.length} 个页面，${manifest.screenshots} 张截图，${errors.length} 个失败`)
if (errors.length && !results.length) process.exit(1)
