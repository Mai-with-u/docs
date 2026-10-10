#!/usr/bin/env node
/**
 * 文档质量度量：把「文档好不好」拆成可证伪的检查项。
 *
 *   node scripts/docs-quality.mjs           # 人读报告
 *   node scripts/docs-quality.mjs --json    # 机器可读，便于进 CI / 看趋势
 *   MAIBOT_DIR=/path/to/MaiBot node scripts/docs-quality.mjs   # 指定参考源码
 *
 * 设计原则：
 *   1. 只做**可证伪**的断言——每条检查都能给出具体文件与行号，不存在"感觉不错"。
 *   2. 分两层：A 机械一致性（改坏了一定能测出来）、B 语义一致性（文档里的标识符
 *      必须能在上游源码里找到——过期文档最典型的症状就是这里挂掉）。
 *   3. 门禁项（gate）全绿才算通过；信息项（info）只统计不阻断。
 *
 * 注意：本脚本只读，不写任何文件。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createMarkdownRenderer } from 'vitepress'
import maiContainers from '../.vitepress/markdown/containers.ts'

const ROOT = resolve(new URL('..', import.meta.url).pathname)
const MAIBOT = process.env.MAIBOT_DIR || resolve(ROOT, '../MaiBot')
const SDK = process.env.SDK_DIR || '/tmp/maibot-plugin-sdk'
const JSON_OUT = process.argv.includes('--json')

const results = []
const add = (name, level, violations, note = '') =>
  results.push({ name, level, note, count: violations.length, violations: violations.slice(0, 12) })

/* ---------------------------------------------------------------- 基础工具 */
const slugify = (s) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase()

function walk(dir, filter, out = []) {
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, filter, out)
    else if (filter(p)) out.push(p)
  }
  return out
}
const mdFiles = (lang) => walk(join(ROOT, lang), (p) => p.endsWith('.md'))
const rel = (p) => relative(ROOT, p)
const lines = (p) => readFileSync(p, 'utf-8').split('\n')

/** 逐行扫描，跳过 fenced code 与 ::: 容器体之外的行？这里返回带状态的迭代结果 */
function scan(p) {
  const out = []
  let fence = null
  let container = []
  lines(p).forEach((raw, i) => {
    const t = raw.trim()
    const m = t.match(/^(`{3,}|~{3,})(.*)$/)
    if (m) {
      if (!fence) {
        fence = m[1]
        out.push({ i: i + 1, kind: 'fence-open', info: m[2].trim(), raw, containers: [...container] })
      } else if (t.startsWith(fence)) {
        out.push({ i: i + 1, kind: 'fence-close', raw, containers: [...container] })
        fence = null
      } else out.push({ i: i + 1, kind: 'code', raw, containers: [...container] })
      return
    }
    if (fence) return out.push({ i: i + 1, kind: 'code', raw, containers: [...container] })
    if (/^:::/.test(t)) {
      const name = t.replace(/^:::\s*/, '').split(/\s+/)[0]
      if (!name) out.push({ i: i + 1, kind: 'container-close', raw, containers: [...container] })
      else out.push({ i: i + 1, kind: 'container-open', name, raw, containers: [...container] })
      if (!name) container.pop()
      else container.push(name)
      return
    }
    out.push({ i: i + 1, kind: 'text', raw, containers: [...container] })
  })
  return out
}

const idsOf = (p) => {
  const set = new Set()
  for (const l of lines(p)) {
    const m = l.match(/^#{1,6}\s+(.*)$/)
    if (m) set.add(slugify(m[1].replace(/`/g, '').trim()))
  }
  return set
}

/* ------------------------------------------------- A. 机械一致性（门禁） */
const zh = mdFiles('zh')
const en = mdFiles('en')

// A1 zh/en 页面集合对称
{
  const zhSet = new Set(zh.map((p) => rel(p).replace(/^zh\//, '')))
  const enSet = new Set(en.map((p) => rel(p).replace(/^en\//, '')))
  const onlyZh = [...zhSet].filter((x) => !enSet.has(x) && x !== 'develop/_containers-test.md')
  const onlyEn = [...enSet].filter((x) => !zhSet.has(x))
  add('A1 zh/en 页面集合对称', 'gate', [
    ...onlyZh.map((x) => `仅 zh 有: ${x}`),
    ...onlyEn.map((x) => `仅 en 有: ${x}`),
  ])
}

// A2 页面骨架：frontmatter title / 唯一 H1 / 有「验证与排错」/ 标题不跳级
{
  const v = []
  const EXEMPT_VERIFY = /^(about|changelog)\//
  for (const p of [...zh, ...en]) {
    const src = readFileSync(p, 'utf-8')
    const isEn = rel(p).startsWith('en/')
    const r = rel(p).replace(/^(zh|en)\//, '')
    const isIndex = /(^|\/)index\.md$/.test(r)
    const isHome = /^---[\s\S]*?layout:\s*home/m.test(src) // 首页用 hero，本就没有 H1
    if (!isHome) {
      if (!/^---[\s\S]*?title:/m.test(src)) v.push(`${rel(p)} 缺 frontmatter title`)
      const toks0 = scan(p)
      const h1 = toks0.filter((t) => t.kind === 'text' && /^#\s+\S/.test(t.raw)).length
      if (h1 !== 1) v.push(`${rel(p)} H1 数量 = ${h1}`)
    }
    const toks = scan(p)
    // 「验证与排错」只对教程/指南类强制（见 zh/contributing/style-guide.md 第三条）
    const GUIDE = /^(manual\/(deployment|adapters|plugins)\/|develop\/adapters\/|plugin\/)/
    if (!isIndex && !EXEMPT_VERIFY.test(r) && GUIDE.test(r) && !/api-reference\.md$/.test(r)) {
      // 英文措辞不统一（Verify / Verification、& / and），只测「有没有这一节」
      const want = isEn ? /^##+\s*(verify|verification|troubleshoot)/im : /^##+\s*验证与排错/m
      if (!want.test(src)) v.push(`${rel(p)} 缺「验证与排错」小节（教程/指南类）`)
    }
    let prev = 0
    for (const t of toks) {
      if (t.kind !== 'text') continue
      if (t.containers.includes('timeline')) continue // timeline 内的层级由该容器决定
      const m = t.raw.match(/^(#{1,6})\s/)
      if (!m) continue
      const lv = m[1].length
      if (prev && lv > prev + 1) v.push(`${rel(p)}:${t.i} 标题跳级 h${prev} → h${lv}`)
      prev = lv
    }
  }
  add('A2 页面骨架（title / 唯一 H1 / 末节覆盖 / 不跳级）', 'gate', v, '末节仅教程与指南类强制')
}

// A3 链接与锚点（严格：片段必须与真实 id 完全相等）
{
  const cache = new Map()
  const ids = (p) => {
    if (!cache.has(p)) cache.set(p, idsOf(p))
    return cache.get(p)
  }
  const v = []
  for (const p of [...zh, ...en]) {
    const src = readFileSync(p, 'utf-8')
    for (const m of src.matchAll(/\]\(([^)\s]+)\)/g)) {
      const url = m[1]
      if (/^(https?:|mailto:)/.test(url)) continue
      const [pathPart, frag] = url.split('#')
      let target = null
      if (pathPart.startsWith('/')) {
        const r = pathPart.replace(/\.md$/, '')
        const cand = [join(ROOT, 'zh', r + '.md'), join(ROOT, 'zh', r, 'index.md')]
        target = cand.find((c) => existsSync(c)) || null
      } else if (pathPart.endsWith('.md')) target = resolve(dirname(p), pathPart)
      else if (pathPart) {
        const cand = [resolve(dirname(p), pathPart + '.md'), resolve(dirname(p), pathPart, 'index.md')]
        target = cand.find((c) => existsSync(c)) || null
      }
      if (target && !existsSync(target)) v.push(`${rel(p)} 死链 → ${pathPart}`)
      if (!frag) continue
      const fragIds = target && existsSync(target) ? ids(target) : ids(p)
      if (!fragIds.has(decodeURIComponent(frag))) v.push(`${rel(p)} 失效锚点 → ${url}`)
    }
  }
  add('A3 站内链接与锚点严格有效', 'gate', v)
}

// A4 容器与代码块配对
{
  const v = []
  for (const p of [...zh, ...en]) {
    const toks = scan(p)
    const opens = toks.filter((t) => t.kind === 'container-open').length
    const closes = toks.filter((t) => t.kind === 'container-close').length
    if (opens !== closes) v.push(`${rel(p)} ::: 开 ${opens} / 闭 ${closes} 不配对`)
    const opens2 = toks.filter((t) => t.kind === 'fence-open').length
    const closes2 = toks.filter((t) => t.kind === 'fence-close').length
    if (opens2 !== closes2) v.push(`${rel(p)} 代码围栏未闭合（开 ${opens2} / 闭 ${closes2}）`)
  }
  add('A4 容器与代码围栏配对', 'gate', v)
}

// A5 写法三禁 + code-group 图标
{
  const v = []
  for (const p of [...zh, ...en]) {
    const isIndex = /(^|\/)index\.md$/.test(rel(p))
    const toks = scan(p)
    // 表格（非索引页）
    if (!isIndex) {
      for (const t of toks) {
        if (t.kind === 'text' && /^\|.*\|$/.test(t.raw.trim()) && !t.containers.includes('code-group'))
          v.push(`${rel(p)}:${t.i} 内容页出现 Markdown 表格`)
      }
    }
    // 裸外链成行
    for (const t of toks) {
      if (t.kind === 'text' && /^\s*\[[^\]]+\]\(https?:[^)]+\)\s*$/.test(t.raw)) v.push(`${rel(p)}:${t.i} 独立裸外链`)
    }
    // 有语言标注的 fence 必须在 code-group 内，且标签带图标
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k]
      if (t.kind !== 'fence-open') continue
      const lang = (t.info.match(/^([a-zA-Z0-9+#-]+)/) || ['', ''])[1]
      const DEMO_LANGS = ['mermaid', 'mmd', 'text', 'plain', 'plaintext', 'markdown', 'html']
      if (!lang || DEMO_LANGS.includes(lang)) continue
      if (!t.containers.includes('code-group')) {
        if (!/contributing\/markdown-features\.md$/.test(rel(p)))
          v.push(`${rel(p)}:${t.i} 裸语言 fence（未包 code-group）`)
        continue
      }
      // 「文档编写特性」本身就在演示图标规则，豁免
      if (/contributing\/markdown-features\.md$/.test(rel(p))) continue
      const label = t.info.match(/\[([^\]]*)\]/)?.[1] || ''
      if (!/~(vscode-icons|logos|simple-icons|skill-icons):[a-z0-9-]+~/.test(label))
        v.push(`${rel(p)}:${t.i} code-group 标签缺显式图标: [${label || lang}]`)
    }
  }
  add('A5 写法三禁 + code-group 显式图标', 'gate', v)
}

// A6 可达性：页面必须出现在侧边栏或至少有一个入链
{
  const sidebar = ['zh', 'en'].map((l) => readFileSync(join(ROOT, `.vitepress/sidebar/${l}.ts`), 'utf-8')).join('\n')
  const inbound = new Map()
  for (const p of [...zh, ...en]) {
    for (const m of readFileSync(p, 'utf-8').matchAll(/\]\(([^)\s#]+\.md)?[^)\s]*\)/g)) {
      const url = m[1]
      if (!url) continue
      const t = resolve(dirname(p), url)
      inbound.set(t, (inbound.get(t) || 0) + 1)
    }
  }
  const v = []
  for (const p of [...zh, ...en]) {
    const r = rel(p)
    const isEn = r.startsWith('en/')
    const body = r
      .replace(/^(zh|en)\//, '')
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '')
    const asLink = (isEn ? '/en/' : '/') + body
    const devCanonical = body.startsWith('develop/') && isEn // 英文开发文档挂在 /develop/*
    const alt = devCanonical ? '/' + body : asLink
    const inSidebar =
      sidebar.includes(`'${asLink}'`) ||
      sidebar.includes(`'${asLink}/'`) ||
      sidebar.includes(`'${asLink.replace(/\/$/, '')}'`) ||
      (devCanonical && sidebar.includes(`'${alt}'`))
    if (!inSidebar && !inbound.get(p)) v.push(`${r} 孤儿页（不在 sidebar 且无入链）`)
  }
  add('A6 无孤儿页（sidebar 或入链可达）', 'gate', v)
}

// A7 每页都能被真实的 Markdown 管线渲染（容器配对、围栏、<<< 片段导入路径）
{
  const v = []
  const md = await createMarkdownRenderer(ROOT, { headers: { level: [2, 3, 4] } }, '/')
  md.use(maiContainers)
  for (const p of [...zh, ...en]) {
    try {
      md.render(readFileSync(p, 'utf-8'), { path: rel(p) })
    } catch (e) {
      v.push(`${rel(p)} 渲染失败：${String(e.message).split('\n')[0]}`)
    }
  }
  add('A7 页面可被渲染（容器/围栏/片段导入）', 'gate', v, '不含 mermaid 等 VitePress 专有插件')
}

/* ------------------------------------------------- B. 语义一致性（门禁） */
const haveMaiBot = existsSync(MAIBOT)
const haveSdk = existsSync(SDK)

// B1 文档里的 `section.key` 配置键必须在 MaiBot 配置模型里存在
{
  const v = []
  if (!haveMaiBot) add('B1 配置键对得上源码', 'info', [], `跳过：找不到 ${MAIBOT}`)
  else {
    const cfg = readFileSync(join(MAIBOT, 'src/config/official_configs.py'), 'utf-8')
    const fields = new Set([...cfg.matchAll(/^\s{4}([a-z_][a-z0-9_]*)\s*:/gm)].map((m) => m[1]))
    const sections = new Set([...cfg.matchAll(/^\s{4}([a-z_][a-z0-9_]*)\s*:\s*\w*Config/gm)].map((m) => m[1]))
    const seen = new Set()
    for (const p of zh) {
      for (const [i, l] of lines(p).entries()) {
        for (const m of l.matchAll(/`([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)+)`/g)) {
          const [head, ...rest] = m[1].split('.')
          const leaf = rest[rest.length - 1]
          if (!sections.has(head)) continue // 只校验以配置段名开头的键，避免误报
          if (fields.has(leaf) || fields.has(head) || rest.every((x) => fields.has(x))) continue
          const key = `${head}.${leaf}`
          if (seen.has(key)) continue
          seen.add(key)
          v.push(`${rel(p)}:${i + 1} 配置键 \`${m[1]}\` 在源码里找不到`)
        }
      }
    }
    add('B1 配置键对得上源码', 'gate', v, `参考 ${MAIBOT}`)
  }
}

// B2 文档里的 HTTP 路由必须在 MaiBot 的 webui 路由里存在
{
  const v = []
  if (!haveMaiBot) add('B2 HTTP 路由对得上源码', 'info', [], '跳过：找不到 MaiBot')
  else {
    const routes = new Set()
    const routerDir = join(MAIBOT, 'src/webui')
    for (const f of walk(routerDir, (p) => p.endsWith('.py'))) {
      const src = readFileSync(f, 'utf-8')
      const prefix =
        src.match(/APIRouter\([\s\S]{0,200}?prefix\s*=\s*"([^"]*)"/)?.[1] ??
        src.match(/APIRouter\([\s\S]{0,200}?prefix\s*=\s*([A-Za-z_][\w.]*)/)?.[1] ??
        ''
      for (const m of src.matchAll(/@\w+\.(get|post|put|delete|patch)\(\s*"([^"]*)"/g)) {
        routes.add((prefix + m[2]).replace(/\{[^}]+\}/g, ':p').replace(/\/$/, ''))
      }
      for (const m of src.matchAll(/@\w+\.websocket\(\s*"([^"]*)"/g)) {
        routes.add((prefix + m[1]).replace(/\{[^}]+\}/g, ':p').replace(/\/$/, ''))
      }
      if (prefix) routes.add(prefix.replace(/\/$/, ''))
    }
    const seen = new Set()
    for (const p of zh) {
      for (const [i, l] of lines(p).entries()) {
        for (const m of l.matchAll(/`(\/api\/webui\/[a-zA-Z0-9/_{}.:-]*)`/g)) {
          if (m[1].endsWith('/')) continue // 前缀引用，不是具体端点
          const raw = m[1].replace(/\{[^}]+\}/g, ':p').replace(/\/$/, '')
          const hit = [...routes].some((r) => r === raw || r.endsWith(raw) || raw.endsWith(r))
          if (hit || seen.has(raw)) continue
          seen.add(raw)
          v.push(`${rel(p)}:${i + 1} 路由 \`${m[1]}\` 在 webui 源码里找不到`)
        }
      }
    }
    add('B2 HTTP 路由对得上源码', 'gate', v)
  }
}

// B3 文档里的 ctx.<能力组>.<方法> 必须在 SDK 里存在
{
  const v = []
  if (!haveSdk) add('B3 插件能力名对得上 SDK', 'info', [], `跳过：找不到 ${SDK}`)
  else {
    const seen = new Set()
    for (const p of [...zh, ...en]) {
      for (const [i, l] of lines(p).entries()) {
        for (const m of l.matchAll(/`?ctx\.([a-z_]+)\.([a-z_][a-z0-9_]*)\(/g)) {
          const [, group, method] = m
          const key = `${group}.${method}`
          if (seen.has(key)) continue
          seen.add(key)
          const ALIAS = { db: 'database', logger: 'logging', message: 'message', render: 'render' }
          const file = ALIAS[group] || group
          const f = join(SDK, 'maibot_sdk/capabilities', `${file}.py`)
          if (!existsSync(f)) {
            v.push(`${rel(p)}:${i + 1} 能力组 ctx.${group} 在 SDK 里没有对应文件`)
            continue
          }
          const src = readFileSync(f, 'utf-8')
          const ctxSrc = readFileSync(join(SDK, 'maibot_sdk/context.py'), 'utf-8')
          const STDLIB_LOGGER = ['debug', 'info', 'warning', 'error', 'exception', 'critical', 'log']
          const isAliasMember =
            new RegExp(`\\b${method}\\s*[:(]`).test(ctxSrc) ||
            (group === 'logger' && STDLIB_LOGGER.includes(method))
          if (!new RegExp(`(async )?def ${method}\\b`).test(src) && !isAliasMember)
            v.push(`${rel(p)}:${i + 1} ctx.${key} 在 SDK 里找不到该方法`)
        }
      }
    }
    add('B3 插件能力名对得上 SDK', 'gate', v, `参考 ${SDK}`)
  }
}

// B4 被文档导入的示例代码必须语法有效
{
  const v = []
  for (const p of [...zh, ...en]) {
    for (const m of readFileSync(p, 'utf-8').matchAll(/^<<<\s+@\/([^\s#{}]+)(?:#\S+)?(?:\{[^}]*\})?/gm)) {
      if (/[^\x00-\x7F]|\.\.\./.test(m[1])) continue // 文档里演示用的占位路径，跳过
      const f = join(ROOT, m[1])
      if (!existsSync(f)) v.push(`${rel(p)} 片段导入路径不存在: ${m[1]}`)
      else if (f.endsWith('.py')) {
        try {
          // 用 ast.parse 而非 py_compile：只解析语法，不落 .pyc
          execFileSync('python3', ['-c', 'import ast,sys;ast.parse(open(sys.argv[1],encoding="utf-8").read())', f], { stdio: 'pipe' })
        } catch {
          v.push(`${rel(p)} 导入的 Python 示例语法错误: ${m[1]}`)
        }
      }
    }
  }
  add('B4 示例代码可解析', 'gate', v)
}

// B5 文档示例里声明的插件能力名必须是 Host 真正注册的能力
if (haveMaiBot) {
  const v = []
  const reg = readFileSync(join(MAIBOT, 'src/plugin_runtime/capabilities/registry.py'), 'utf-8')
  const known = new Set([...reg.matchAll(/"(\w+\.[\w.]+)"/g)].map((m) => m[1]))
  const seen = new Set()
  for (const p of [...zh, ...en]) {
    const src = readFileSync(p, 'utf-8')
    // 只看 JSON 代码块里的 capabilities 数组
    for (const m of src.matchAll(/```json[\s\S]*?```/g)) {
      const caps = m[0].match(/"capabilities"\s*:\s*\[([^\]]*)\]/)
      if (!caps) continue
      for (const name of caps[1].matchAll(/"(\w+\.[\w.]+)"/g)) {
        const key = `${rel(p)}:${name[1]}`
        if (known.has(name[1]) || seen.has(key)) continue
        seen.add(key)
        v.push(`${rel(p)} 示例声明了未注册的能力 \`${name[1]}\``)
      }
    }
  }
  add('B5 示例里的插件能力名有效', 'gate', v)
}

/* ------------------------------------------------- C. 信息项（不阻断） */
// C1 同页重复锚点
{
  const v = []
  for (const p of [...zh, ...en]) {
    const seen = new Map()
    for (const l of lines(p)) {
      const m = l.match(/^#{1,6}\s+(.*)$/)
      if (!m) continue
      const s = slugify(m[1].replace(/`/g, '').trim())
      seen.set(s, (seen.get(s) || 0) + 1)
    }
    const dup = [...seen.entries()].filter(([, n]) => n > 1)
    if (dup.length) v.push(`${rel(p)} 重复锚点 ${dup.length} 组（深链会带 -1/-2 后缀）`)
  }
  add('C1 同页重复锚点', 'info', v)
}

// C2 未被引用的 public 资源
{
  const v = []
  const themeFiles = walk(join(ROOT, '.vitepress'), (p) => /\.(css|ts|mts|vue)$/.test(p))
  const all = [...[...zh, ...en], ...themeFiles].map((p) => readFileSync(p, 'utf-8')).join('\n')
  for (const f of walk(join(ROOT, 'public'), (p) => /\.(png|jpe?g|webp|svg|gif|ttf|woff2?)$/i.test(p))) {
    const url = '/' + relative(join(ROOT, 'public'), f)
    if (!all.includes(url)) v.push(`${url} 未被任何页面引用`)
  }
  add('C2 未被引用的 public 资源', 'info', v)
}

/* ------------------------------------------------------------- 输出 */
const gates = results.filter((r) => r.level === 'gate')
const failed = gates.filter((r) => r.count > 0)
if (JSON_OUT) {
  console.log(JSON.stringify({ ok: failed.length === 0, results }, null, 2))
} else {
  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - [...s].reduce((a, c) => a + (c.charCodeAt(0) > 255 ? 2 : 1), 0)))
  console.log('\n文档质量报告 —— 只有可证伪的检查项\n' + '='.repeat(64))
  for (const r of results) {
    const mark = r.level === 'info' ? '·' : r.count === 0 ? '✓' : '✗'
    console.log(`${mark} ${pad(r.name, 44)} ${r.count === 0 ? '通过' : r.count + ' 处'}  ${r.note ? '(' + r.note + ')' : ''}`)
    for (const x of r.violations) console.log(`    - ${x}`)
  }
  console.log('='.repeat(64))
  console.log(
    failed.length === 0
      ? `门禁通过：${gates.length} 项检查全部为 0 违规。`
      : `门禁未通过：${failed.length}/${gates.length} 项有违规，共 ${failed.reduce((a, r) => a + r.count, 0)} 处。`
  )
}
process.exit(failed.length === 0 ? 0 : 1)
