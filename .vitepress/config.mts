import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import { MermaidPlugin, MermaidMarkdown } from "vitepress-plugin-mermaid"
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
import llmstxt from 'vitepress-plugin-llms'
import timeline from 'vitepress-markdown-timeline'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import type { Token, Options } from 'markdown-it'
import { nav as zhNav, sidebar as zhSidebar } from './sidebar/zh'
import { nav as enNav, sidebar as enSidebar } from './sidebar/en'
import { countWord, extractDescription } from './theme/utils/functions'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MaiBot Docs",
  description: "MaiBot Development and Usage Guide",
  ignoreDeadLinks: 'localhostLinks',
  lastUpdated: true,
  cleanUrls: true,
  srcExclude: ['**/README.md', '**/AGENTS.md', 'public/**'],
  transformPageData(pageData) {
    if (!pageData.filePath) return
    const raw = readFileSync(pageData.filePath, 'utf-8')
    const result: Record<string, unknown> = { wordCount: countWord(raw) }
    if (!pageData.frontmatter.description) {
      const description = extractDescription(raw)
      if (description) result.description = description
    }
    return result
  },
  transformHead({ pageData, title, description }) {
    const isEn = pageData.relativePath.startsWith('en/')
    const rel = pageData.relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '')
    const image = 'https://docs.maimai.lol/title_img/mai2.png'
    return [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: isEn ? 'MaiBot Docs' : 'MaiBot 文档中心' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: 'https://docs.maimai.lol/' + rel }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: image }],
    ]
  },
  sitemap: {
    hostname: 'https://docs.maimai.lol'
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'MaiBot 文档中心',
      description: 'MaiBot 开发与使用指南',
      themeConfig: {
        editLink: {
          pattern: "https://github.com/MaiM-with-u/docs/edit/main/:path",
          text: "在 GitHub 上编辑此页"
        },
        lastUpdated: {
          text: "最后更新",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short",
          },
        },
        nav: zhNav,
        sidebar: zhSidebar,
        outline: { level: [2, 4], label: '本页目录' },
        docFooter: { prev: '上一篇', next: '下一篇' },
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到深色主题',
        darkModeSwitchTitle: '切换到浅色主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        langMenuLabel: '切换语言',
        skipToContentLabel: '跳到主要内容',
        notFound: {
          title: '页面不存在',
          quote: '你要找的页面可能已被移动或删除。',
          linkLabel: '返回首页',
          linkText: '回到首页',
        },
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'MaiBot Docs',
      description: 'MaiBot Development and Usage Guide',
      link: '/en/',
      themeConfig: {
        editLink: {
          pattern: "https://github.com/MaiM-with-u/docs/edit/main/:path",
          text: "Edit this page on GitHub"
        },
        lastUpdated: {
          text: "Last updated",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short",
          },
        },
        nav: enNav,
        sidebar: enSidebar,
        outline: { level: [2, 4], label: 'On this page' },
      }
    }
  },
  rewrites: {
    'zh/:rest*': ':rest*'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/title_img/mai2.png' }],
    ['meta', { name: 'theme-color', content: '#d2691e', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#ffa940', media: '(prefers-color-scheme: dark)' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '重置',
                backButtonTitle: '返回',
                noResultsText: '未找到结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc',
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MaiM-with-u/MaiBot' },
      { icon: 'x', link: 'https://x.com/MaiWithYou' },
      { icon: 'discord', link: 'https://discord.gg/UvgPVSVX' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>'
        },
        link: 'https://t.me/MaiWithYou'
      }
    ],
  },
  markdown: {
    config(md) {
      md.use(MermaidMarkdown);
      md.use(InlineLinkPreviewElementTransform);
      md.use(groupIconMdPlugin);
      md.use(timeline);
      md.renderer.rules.heading_close = (tokens: Token[], idx: number, options: Options, env: any, slf: any) => {
        let htmlResult = slf.renderToken(tokens, idx, options)
        if (tokens[idx].tag === 'h1' && !env.metadataRendered) {
          env.metadataRendered = true
          htmlResult += '<ArticleMetadata />'
        }
        return htmlResult
      }
    },
  },
  metaChunk: true,
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          'git': 'vscode-icons:file-type-git',
          'uv': 'vscode-icons:file-type-python',
          'pip': 'vscode-icons:file-type-python',
        },
      }),
      MermaidPlugin(),
      llmstxt({ workDir: 'zh', ignoreFiles: ['index.md'], domain: 'https://docs.maimai.lol' }),
    ],
    optimizeDeps: {
      include: ['mermaid'],
      exclude: [
        '@nolebase/vitepress-plugin-inline-link-preview/client',
        '@nolebase/vitepress-plugin-enhanced-readabilities/client',
        '@nolebase/ui',
      ],
    },
    ssr: {
      noExternal: [
        'mermaid',
        '@nolebase/vitepress-plugin-inline-link-preview',
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/ui',
      ],
    },
  },
})
