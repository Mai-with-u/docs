import { defineConfig } from 'vitepress'
import { MermaidPlugin, MermaidMarkdown } from "vitepress-plugin-mermaid"
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MaiBot Docs",
  description: "MaiBot Development and Usage Guide",
  ignoreDeadLinks: 'localhostLinks',
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
        nav: [
          { text: '首页', link: '/' },
          { text: '功能介绍', link: '/features/' },
          { text: '用户手册', link: '/manual/deployment/' },
          { text: '开发文档', link: '/develop/' },
          {
            text: 'GitHub',
            items: [
              { text: 'MaiBot', link: 'https://github.com/MaiM-with-u/MaiBot' },
              { text: 'MaiBot Docs', link: 'https://github.com/MaiM-with-u/docs' },
            ]
          },
        ],
        sidebar: {
          '/manual/': [
            {
              text: '部署与安装',
              collapsed: false,
              items: [
                { text: '部署概览', link: '/manual/deployment/' },
                { text: '源码安装', link: '/manual/deployment/installation' },
                { text: 'Docker安装', link: '/manual/deployment/docker' },
                { text: '适配器安装', link: '/manual/deployment/adapters_installation' },
              ]
            },
            {
              text: '适配器',
              collapsed: false,
              items: [
                { text: '适配器概览', link: '/manual/adapters/' },
                { text: 'QQ 连接', link: '/manual/adapters/napcat' },
                { text: 'GoCQ 适配器', link: '/manual/adapters/gocq' },
              ]
            },
            {
              text: '配置说明',
              collapsed: false,
              items: [
                { text: '配置概览', link: '/manual/configuration/' },
                { text: 'Bot 配置', link: '/manual/configuration/bot-config' },
                { text: '模型配置', link: '/manual/configuration/model-config' },
              ]
            },
            {
              text: '功能介绍',
              collapsed: false,
              items: [
                { text: '功能概览', link: '/manual/features/' },
                { text: '消息是怎么处理的', link: '/manual/features/message-pipeline' },
                { text: 'MaiBot 是怎么思考的', link: '/manual/features/maisaka-reasoning' },
                { text: 'MaiBot 的记忆', link: '/manual/features/memory-system' },
                { text: '学说话', link: '/manual/features/learning' },
                { text: '表情包系统', link: '/manual/features/emoji-system' },
                { text: 'MCP 工具', link: '/manual/features/mcp' },
              ]
            },
            {
              text: 'WebUI 管理',
              collapsed: false,
              items: [
                { text: 'WebUI 概览', link: '/manual/webui/' },
                { text: '配置管理', link: '/manual/webui/config-management' },
                { text: '记忆管理', link: '/manual/webui/memory-management' },
                { text: '插件管理', link: '/manual/webui/plugin-management' },
                { text: '聊天与统计', link: '/manual/webui/chat-stats' },
              ]
            },
            {
              text: '常见问题',
              collapsed: false,
              items: [
                { text: 'FAQ', link: '/manual/faq/' },
              ]
            },
          ],
          '/develop/': [
            {
              text: '架构详解',
              collapsed: false,
              items: [
                { text: '消息管线', link: '/develop/architecture/message-pipeline' },
                { text: 'Maisaka 推理引擎', link: '/develop/architecture/maisaka-reasoning' },
                { text: '记忆系统', link: '/develop/architecture/memory-system' },
                { text: 'WebUI 内部机制', link: '/develop/architecture/webui-internals' },
              ]
            },
            {
              text: '开发文档',
              collapsed: false,
              items: [
                { text: '架构概览', link: '/develop/' },
                { text: '架构设计', link: '/develop/architecture' },
                { text: '贡献指南', link: '/develop/contributing' },
              ]
            },
            {
              text: '插件开发',
              collapsed: false,
              items: [
                { text: '开发指南', link: '/develop/plugin-dev/' },
                { text: 'Manifest', link: '/develop/plugin-dev/manifest' },
                { text: '生命周期', link: '/develop/plugin-dev/lifecycle' },
                { text: 'Tool', link: '/develop/plugin-dev/tools' },
                { text: 'Command', link: '/develop/plugin-dev/commands' },
                { text: 'Hook 处理器', link: '/develop/plugin-dev/hooks' },
                { text: '事件处理器', link: '/develop/plugin-dev/event-handlers' },
                { text: 'API 组件', link: '/develop/plugin-dev/api-components' },
                { text: '消息网关', link: '/develop/plugin-dev/message-gateway' },
                { text: 'Action (Legacy)', link: '/develop/plugin-dev/actions' },
                { text: '配置管理', link: '/develop/plugin-dev/config' },
                { text: 'API 参考', link: '/develop/plugin-dev/api-reference' },
              ]
            },
            {
              text: '适配器开发',
              collapsed: false,
              items: [
                { text: '开发指南', link: '/develop/adapter-dev/' },
                { text: 'PlatformIO 驱动', link: '/develop/adapter-dev/platform-io' },
              ]
            },
          ],
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
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Features', link: '/en/features/' },
          { text: 'Manual', link: '/en/manual/deployment/' },
          { text: 'Development', link: '/en/develop/' },
          {
            text: 'GitHub',
            items: [
              { text: 'MaiBot', link: 'https://github.com/MaiM-with-u/MaiBot' },
              { text: 'MaiBot Docs', link: 'https://github.com/MaiM-with-u/docs' },
            ]
          },
        ],
        sidebar: {
          '/en/manual/': [
            {
              text: 'Quick Start',
              collapsed: false,
              items: [
                { text: 'Get Started in 5 Minutes', link: '/en/manual/getting-started/' },
              ]
            },
            {
              text: 'Deployment & Installation',
              collapsed: false,
              items: [
                { text: 'Deployment Overview', link: '/en/manual/deployment/' },
                { text: 'Installation Guide', link: '/en/manual/deployment/installation' },
                { text: 'Docker Deployment', link: '/en/manual/deployment/docker' },
              ]
            },
            {
              text: 'Configuration',
              collapsed: false,
              items: [
                { text: 'Configuration Overview', link: '/en/manual/configuration/' },
                { text: 'Bot Config', link: '/en/manual/configuration/bot-config' },
                { text: 'Model Config', link: '/en/manual/configuration/model-config' },
              ]
            },
            {
              text: 'Features',
              collapsed: false,
              items: [
                { text: 'Features Overview', link: '/en/manual/features/' },
                { text: 'How Messages are Processed', link: '/en/manual/features/message-pipeline' },
                { text: 'How MaiBot Thinks', link: '/en/manual/features/maisaka-reasoning' },
                { text: 'MaiBot\'s Memory', link: '/en/manual/features/memory-system' },
                { text: 'Learning to Speak', link: '/en/manual/features/learning' },
                { text: 'Emoji System', link: '/en/manual/features/emoji-system' },
                { text: 'MCP Tools', link: '/en/manual/features/mcp' },
              ]
            },
            {
              text: 'WebUI Management',
              collapsed: false,
              items: [
                { text: 'WebUI Overview', link: '/en/manual/webui/' },
                { text: 'Config Management', link: '/en/manual/webui/config-management' },
                { text: 'Memory Management', link: '/en/manual/webui/memory-management' },
                { text: 'Plugin Management', link: '/en/manual/webui/plugin-management' },
                { text: 'Chat & Stats', link: '/en/manual/webui/chat-stats' },
              ]
            },
            {
              text: 'Adapters',
              collapsed: false,
              items: [
                { text: 'Adapters Overview', link: '/en/manual/adapters/' },
                { text: 'QQ Connection', link: '/en/manual/adapters/napcat' },
                { text: 'GoCQ Adapter', link: '/en/manual/adapters/gocq' },
              ]
            },
            {
              text: 'FAQ',
              collapsed: false,
              items: [
                { text: 'FAQ', link: '/en/manual/faq/' },
              ]
            },
          ],
          '/en/develop/': [
            {
              text: 'Architecture',
              collapsed: false,
              items: [
                { text: 'Message Pipeline', link: '/en/develop/architecture/message-pipeline' },
                { text: 'Maisaka Reasoning Engine', link: '/en/develop/architecture/maisaka-reasoning' },
                { text: 'Memory System', link: '/en/develop/architecture/memory-system' },
                { text: 'WebUI Internals', link: '/en/develop/architecture/webui-internals' },
              ]
            },
            {
              text: 'Development',
              collapsed: false,
              items: [
                { text: 'Architecture Overview', link: '/en/develop/' },
                { text: 'Architecture Design', link: '/en/develop/architecture' },
                { text: 'Contributing Guide', link: '/en/develop/contributing' },
              ]
            },
            {
              text: 'Plugin Development',
              collapsed: false,
              items: [
                { text: 'Development Guide', link: '/en/develop/plugin-dev/' },
                { text: 'Manifest', link: '/en/develop/plugin-dev/manifest' },
                { text: 'Lifecycle', link: '/en/develop/plugin-dev/lifecycle' },
                { text: 'Tool', link: '/en/develop/plugin-dev/tools' },
                { text: 'Command', link: '/en/develop/plugin-dev/commands' },
                { text: 'Hook Handler', link: '/en/develop/plugin-dev/hooks' },
                { text: 'Event Handler', link: '/en/develop/plugin-dev/event-handlers' },
                { text: 'API Component', link: '/en/develop/plugin-dev/api-components' },
                { text: 'Message Gateway', link: '/en/develop/plugin-dev/message-gateway' },
                { text: 'Action (Legacy)', link: '/en/develop/plugin-dev/actions' },
                { text: 'Configuration', link: '/en/develop/plugin-dev/config' },
                { text: 'API Reference', link: '/en/develop/plugin-dev/api-reference' },
              ]
            },
            {
              text: 'Adapter Development',
              collapsed: false,
              items: [
                { text: 'Development Guide', link: '/en/develop/adapter-dev/' },
                { text: 'PlatformIO Driver', link: '/en/develop/adapter-dev/platform-io' },
              ]
            },
          ],
        },
      }
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/title_img/mai2.png' }]
  ],
  themeConfig: {
    search: {
      provider: 'local',
    },
    outline: [2, 4],
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
      md.use(tabsMarkdownPlugin);
      md.use(MermaidMarkdown);
    },
  },
  vite: {
    plugins: [MermaidPlugin()],
    optimizeDeps: {
      include: ['mermaid'],
    },
    ssr: {
      noExternal: ['mermaid'],
    },
  },
})
