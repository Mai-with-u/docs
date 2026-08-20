import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Home', link: '/en/' },
  { text: 'Manual', link: '/en/manual/' },
  { text: 'Development', items: [
    { text: 'MaiBot Development', link: '/en/develop/' },
    { text: 'Plugin Development', link: '/en/plugin/' },
  ]},
  { text: 'FAQ', link: '/en/faq/' },
  { text: 'Changelog', link: '/en/changelog/' },
  { text: 'About', link: '/en/about/' },
]

export const sidebar: DefaultTheme.Sidebar = {
  '/en/plugin/': [
    {
      text: 'Getting Started',
      collapsed: false,
      items: [
        { text: 'Development Guide', link: '/en/plugin/' },
        { text: 'Vibe Coding Guide', link: '/en/plugin/vibe-coding' },
        { text: 'Manifest', link: '/en/plugin/manifest' },
        { text: 'Lifecycle', link: '/en/plugin/lifecycle' },
        { text: 'Configuration', link: '/en/plugin/config' },
      ]
    },
    {
      text: 'Plugin Store',
      collapsed: false,
      items: [
        { text: 'Submit a Plugin', link: '/en/plugin/submission' },
      ]
    },
    {
      text: 'Components',
      collapsed: false,
      items: [
        { text: 'Tool', link: '/en/plugin/tools' },
        { text: 'Command', link: '/en/plugin/commands' },
        { text: 'Hook Handler', link: '/en/plugin/hooks' },
        { text: 'Event Handler', link: '/en/plugin/event-handlers' },
        { text: 'API Components', link: '/en/plugin/api-components' },
        { text: 'Message Gateway', link: '/en/plugin/message-gateway' },
        { text: 'LLMProvider', link: '/en/plugin/llmprovider' },
        { text: 'Action (Legacy)', link: '/en/plugin/actions' },
      ]
    },
    {
      text: 'Reference',
      collapsed: false,
      items: [
        { text: 'API Reference', link: '/en/plugin/api-reference' },
      ]
    },
  ],
  '/en/changelog/': [
    {
      text: 'Changelog',
      collapsed: false,
      items: [
        { text: 'Version Overview', link: '/en/changelog/' },
      ]
    },
    {
      text: 'Feature Updates',
      collapsed: false,
      items: [
        { text: '1.0.0 Feature Page', link: '/en/changelog/v1-0-0' },
      ]
    },
  ],
  '/en/faq/': [
    {
      text: 'FAQ',
      collapsed: false,
      items: [
        { text: 'FAQ Overview', link: '/en/faq/' },
        { text: 'Basic Usage', link: '/en/faq/basic-usage' },
        { text: 'Deployment and Startup', link: '/en/faq/deployment' },
        { text: 'One-click Package', link: '/en/faq/one-key' },
        { text: 'Adapter Connections', link: '/en/faq/adapters' },
        { text: 'Chat and Replies', link: '/en/faq/chat-and-reply' },
        { text: 'Models and APIs', link: '/en/faq/models-and-api' },
        { text: 'Memory and Learning', link: '/en/faq/memory-and-learning' },
        { text: 'Plugin Issues', link: '/en/faq/plugins' },
        { text: 'Backup and Migration', link: '/en/faq/backup-and-migration' },
      ]
    },
    {
      text: 'Troubleshooting and Support',
      collapsed: false,
      items: [
        { text: 'Error Troubleshooting', link: '/en/faq/error-troubleshooting' },
      ]
    },
  ],
  '/en/manual/': [
    {
      text: 'Getting Started',
      collapsed: false,
      items: [
        { text: 'User Manual', link: '/en/manual/' },
      ]
    },
    {
      text: 'Deployment & Installation',
      collapsed: false,
      items: [
        { text: 'Windows Deployment', link: '/en/manual/deployment/windows' },
        { text: 'Linux Deployment', link: '/en/manual/deployment/linux' },
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
        { text: 'Model Extra Parameters', link: '/en/manual/configuration/model-extra-params' },
        { text: 'MCP Configuration', link: '/en/manual/configuration/mcp-config' },
        { text: 'A_Memorix Config', link: '/en/manual/configuration/amemorix-config' },
      ]
    },
    {
      text: 'Features',
      collapsed: false,
      items: [
        { text: 'Features Overview', link: '/en/manual/features/' },
        { text: 'Message Processing', link: '/en/manual/features/message-pipeline' },
        { text: 'How MaiBot Thinks', link: '/en/manual/features/maisaka-reasoning' },
        { text: 'MaiBot\'s Memory', link: '/en/manual/features/memory-system' },
        { text: 'Learning to Speak', link: '/en/manual/features/learning' },
        { text: 'Emoji System', link: '/en/manual/features/emoji-system' },
        { text: 'MCP Tools', link: '/en/manual/features/mcp' },
        { text: 'Management Console', link: '/en/manual/features/management-console' },
      ]
    },
    {
      text: 'WebUI Management',
      collapsed: false,
      items: [
        { text: 'WebUI Overview', link: '/en/manual/webui/' },
        { text: 'Config Management', link: '/en/manual/webui/config-management' },
        { text: 'Adapter Management', link: '/en/manual/webui/adapter-management' },
        { text: 'Command Management', link: '/en/manual/webui/command-management' },
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
        { text: 'NapCat QQ Connection', link: '/en/manual/adapters/napcat' },
        { text: 'LLOneBot (LLBot) Adapter', link: '/en/manual/adapters/LLOneBot' },
        { text: 'GoCQ Adapter', link: '/en/manual/adapters/gocq' },
        { text: 'SnowLuma Adapter', link: '/en/manual/adapters/snowluma' },
        { text: 'Telegram Adapter', link: '/en/manual/adapters/telegram' },
        { text: 'Discord Adapter', link: '/en/manual/adapters/discord' },
      ]
    },
  ],
  '/en/develop/': [
    {
      text: 'Overview',
      collapsed: false,
      items: [
        { text: 'Development Guide', link: '/en/develop/' },
        { text: 'Markdown Features', link: '/en/develop/markdown-features' },
      ]
    },
    {
      text: 'Advanced Topics',
      collapsed: false,
      items: [
        { text: 'Database', link: '/en/develop/database' },
        { text: 'Configuration System', link: '/en/develop/configuration' },
        { text: 'Message Server & Adapter Integration', link: '/en/develop/message-server-and-adapters' },
        { text: 'LLM Model Integration', link: '/en/develop/llm-providers' },
        { text: 'MCP Integration & External Tools', link: '/en/develop/mcp-integration' },
        {
          text: 'WebUI HTTP API',
          collapsed: false,
          items: [
            { text: 'WebUI HTTP API Overview', link: '/en/develop/webui-api/' },
            { text: 'Authentication & Setup', link: '/en/develop/webui-api/auth-and-setup' },
            { text: 'System Control', link: '/en/develop/webui-api/system-control' },
            { text: 'Data & Memory API', link: '/en/develop/webui-api/data-and-memory-api' },
            { text: 'Plugin Lifecycle API', link: '/en/develop/webui-api/plugin-lifecycle-api' },
            { text: 'Real-time Subscriptions & Stats', link: '/en/develop/webui-api/realtime-and-stats' },
          ]
        },
        { text: 'Logging & Observability', link: '/en/develop/observability' },
        { text: 'Statistics & Data Export', link: '/en/develop/statistics-io' },
        { text: 'Event Pipeline & Hooks', link: '/en/develop/event-pipeline-hooks' },
        { text: 'Plugin Runtime Internals', link: '/en/develop/plugin-runtime-internals' },
      ]
    },
  ],
  '/en/about/': [
    {
      text: 'About',
      collapsed: false,
      items: [
        { text: 'About the Project', link: '/en/about/' },
        { text: 'About This Docs', link: '/en/about/about-docs' },
        { text: 'Community Groups', link: '/en/about/community' },
        { text: 'Acknowledgements & Links', link: '/en/about/acknowledgements' },
        { text: 'EULA', link: '/en/about/EULA' },
        { text: 'Privacy Policy', link: '/en/about/PRIVACY' },
      ]
    },
  ],
}
