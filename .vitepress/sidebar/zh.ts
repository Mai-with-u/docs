import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.NavItem[] = [
  { text: '首页', link: '/' },
  { text: '用户手册', link: '/manual/' },
  { text: '开发文档', items: [
    { text: '麦麦开发', link: '/develop/' },
    { text: '插件开发', link: '/plugin/' },
  ]},
  { text: '常见问题', link: '/faq/' },
  { text: '更新日志', link: '/changelog/' },
  { text: '关于', link: '/about/' },
]

export const sidebar: DefaultTheme.Sidebar = {
  '/plugin/': [
    {
      text: '入门',
      collapsed: false,
      items: [
        { text: '开发指南', link: '/plugin/' },
        { text: 'Vibe Coding 指南', link: '/plugin/vibe-coding' },
        { text: 'Manifest', link: '/plugin/manifest' },
        { text: '生命周期', link: '/plugin/lifecycle' },
        { text: '配置管理', link: '/plugin/config' },
      ]
    },
    {
      text: '插件市场',
      collapsed: false,
      items: [
        { text: '提交插件', link: '/plugin/submission' },
      ]
    },
    {
      text: '组件开发',
      collapsed: false,
      items: [
        { text: 'Tool', link: '/plugin/tools' },
        { text: 'Command', link: '/plugin/commands' },
        { text: 'Hook 处理器', link: '/plugin/hooks' },
        { text: '事件处理器', link: '/plugin/event-handlers' },
        { text: 'API 组件', link: '/plugin/api-components' },
        { text: '消息网关', link: '/plugin/message-gateway' },
        { text: 'LLMProvider 组件', link: '/plugin/llmprovider' },
        { text: 'Action (Legacy)', link: '/plugin/actions' },
      ]
    },
    {
      text: '参考',
      collapsed: false,
      items: [
        { text: 'API 参考', link: '/plugin/api-reference' },
      ]
    },
  ],
  '/about/': [
    {
      text: '关于',
      collapsed: false,
      items: [
        { text: '关于麦麦', link: '/about/' },
        { text: '关于文档', link: '/about/about-docs' },
        { text: '交流群', link: '/about/community' },
        { text: '致谢与友链', link: '/about/acknowledgements' },
        { text: 'EULA', link: '/about/EULA' },
        { text: '隐私条款', link: '/about/PRIVACY' },
      ]
    },
  ],
  '/faq/': [
    {
      text: '常见问题',
      collapsed: false,
      items: [
        { text: 'FAQ 总览', link: '/faq/' },
        { text: '基础使用', link: '/faq/basic-usage' },
        { text: '部署与启动', link: '/faq/deployment' },
        { text: '一键包', link: '/faq/one-key' },
        { text: '适配器连接', link: '/faq/adapters' },
        { text: '聊天与回复', link: '/faq/chat-and-reply' },
        { text: '模型与 API', link: '/faq/models-and-api' },
        { text: '记忆与学习', link: '/faq/memory-and-learning' },
        { text: '插件问题', link: '/faq/plugins' },
        { text: '数据与迁移', link: '/faq/backup-and-migration' },
      ]
    },
    {
      text: '排错与支持',
      collapsed: false,
      items: [
        { text: '错误排查', link: '/faq/error-troubleshooting' },
      ]
    },
  ],
  '/manual/': [
    {
      text: '入门',
      collapsed: false,
      items: [
        { text: '用户手册', link: '/manual/' },
      ]
    },
    {
      text: '部署与安装',
      collapsed: false,
      items: [
        { text: 'Windows 部署', link: '/manual/deployment/windows' },
        { text: 'Linux 部署', link: '/manual/deployment/linux' },
        { text: 'Docker 部署', link: '/manual/deployment/docker' },
      ]
    },
    {
      text: '适配器',
      collapsed: false,
      items: [
        { text: '适配器概览', link: '/manual/adapters/' },
        { text: 'NapCat QQ 连接', link: '/manual/adapters/napcat' },
        { text: 'LLOneBot(LLBot) 适配器', link: '/manual/adapters/LLOneBot' },
        { text: 'GoCQ 适配器', link: '/manual/adapters/gocq' },
        { text: 'SnowLuma 适配器', link: '/manual/adapters/snowluma' },
        { text: 'Telegram 适配器', link: '/manual/adapters/telegram' },
        { text: 'Discord 适配器', link: '/manual/adapters/discord' },
      ]
    },
    {
      text: '配置说明',
      collapsed: false,
      items: [
        { text: '配置概览', link: '/manual/configuration/' },
        { text: 'Bot 配置', link: '/manual/configuration/bot-config' },
        { text: '模型配置', link: '/manual/configuration/model-config' },
        { text: '模型额外参数', link: '/manual/configuration/model-extra-params' },
        { text: 'MCP 配置', link: '/manual/configuration/mcp-config' },
        { text: 'A_Memorix 配置', link: '/manual/configuration/amemorix-config' },
      ]
    },
    {
      text: '功能介绍',
      collapsed: false,
      items: [
        { text: '功能概览', link: '/manual/features/' },
        { text: '消息处理流程', link: '/manual/features/message-pipeline' },
        { text: 'MaiBot 思考机制', link: '/manual/features/maisaka-reasoning' },
        { text: 'MaiBot 的记忆', link: '/manual/features/memory-system' },
        { text: '学说话', link: '/manual/features/learning' },
        { text: '表情包系统', link: '/manual/features/emoji-system' },
        { text: 'MCP 工具', link: '/manual/features/mcp' },
        { text: '管理终端', link: '/manual/features/management-console' },
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

  ],
  '/changelog/': [
    {
      text: '更新日志',
      collapsed: false,
      items: [
        { text: '版本总览', link: '/changelog/' },
      ]
    },
    {
      text: '更新专题',
      collapsed: false,
      items: [
        { text: '1.0.0 更新专题', link: '/changelog/v1-0-0' },
      ]
    },
  ],
  '/develop/': [
    {
      text: '总览',
      collapsed: false,
      items: [
        { text: '开发指南', link: '/develop/' },
        { text: '文档编写特性', link: '/develop/markdown-features' },
      ]
    },
    {
      text: '进阶专题',
      collapsed: false,
      items: [
        { text: '数据库', link: '/develop/database' },
        { text: '配置系统', link: '/develop/configuration' },
        { text: '消息服务器与适配器对接', link: '/develop/message-server-and-adapters' },
        { text: 'LLM 模型集成', link: '/develop/llm-providers' },
        { text: 'MCP 集成与外部工具接入', link: '/develop/mcp-integration' },
        {
          text: 'WebUI HTTP API',
          collapsed: false,
          items: [
            { text: 'WebUI HTTP API 入口', link: '/develop/webui-api/' },
            { text: '认证与首次配置', link: '/develop/webui-api/auth-and-setup' },
            { text: '系统控制', link: '/develop/webui-api/system-control' },
            { text: '数据 & 记忆 API', link: '/develop/webui-api/data-and-memory-api' },
            { text: '插件生命周期 API', link: '/develop/webui-api/plugin-lifecycle-api' },
            { text: '实时订阅与统计', link: '/develop/webui-api/realtime-and-stats' },
          ]
        },
        { text: '日志与可观测性', link: '/develop/observability' },
        { text: '统计与数据导入导出', link: '/develop/statistics-io' },
        { text: '事件管线与钩子', link: '/develop/event-pipeline-hooks' },
        { text: '插件运行时内部架构', link: '/develop/plugin-runtime-internals' },
      ]
    },
  ],
}
