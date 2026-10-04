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
        { text: 'Publish a Plugin', link: '/en/plugin/submission' },
      ]
    },
    {
      text: 'Components',
      collapsed: false,
      items: [
        { text: 'Tool', link: '/en/plugin/tools' },
        { text: 'Command', link: '/en/plugin/commands' },
        { text: 'Home Cards', link: '/en/plugin/home-cards' },
        { text: 'Hook Handler', link: '/en/plugin/hooks' },
        { text: 'Event Handler', link: '/en/plugin/event-handlers' },
        { text: 'API Components', link: '/en/plugin/api-components' },
        { text: 'Message Gateway', link: '/en/plugin/message-gateway' },
        { text: 'LLMProvider', link: '/en/plugin/llmprovider' },
        { text: 'Action (Legacy)', link: '/en/plugin/actions' },
        { text: 'API Reference', link: '/en/plugin/api-reference' },
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
  '/en/changelog/': [
    {
      text: 'Changelog',
      collapsed: false,
      items: [
        { text: 'Overview', link: '/en/changelog/' },
        { text: 'v1.0.0 Highlights', link: '/en/changelog/v1-0-0' },
      ]
    },
  ],
  '/en/faq/': [
    {
      text: 'FAQ',
      collapsed: false,
      items: [
        { text: 'Categories', link: '/en/faq/' },
        { text: 'Basic Usage', link: '/en/faq/basic-usage' },
        { text: 'Deployment & Startup', link: '/en/faq/deployment' },
        { text: 'One-click Package', link: '/en/faq/one-key' },
        { text: 'Adapters', link: '/en/faq/adapters' },
        { text: 'Chat & Replies', link: '/en/faq/chat-and-reply' },
        { text: 'Models & APIs', link: '/en/faq/models-and-api' },
        { text: 'Memory & Learning', link: '/en/faq/memory-and-learning' },
        { text: 'Plugins', link: '/en/faq/plugins' },
        { text: 'Backup & Migration', link: '/en/faq/backup-and-migration' },
        { text: 'Error Troubleshooting', link: '/en/faq/error-troubleshooting' },
      ]
    },
  ],
  '/en/manual/': [
    {
      text: 'Getting Started',
      collapsed: false,
      items: [
        { text: 'Quick Start', link: '/en/manual/' },
        { text: 'Windows Deployment', link: '/en/manual/deployment/windows' },
        { text: 'Linux Deployment', link: '/en/manual/deployment/linux' },
        { text: 'Docker Deployment', link: '/en/manual/deployment/docker' },
      ]
    },
    {
      text: 'Adapters',
      collapsed: false,
      items: [
        { text: 'Connect Platforms', link: '/en/manual/adapters/' },
        { text: 'NapCat', link: '/en/manual/adapters/napcat' },
        { text: 'SnowLuma', link: '/en/manual/adapters/snowluma' },
        { text: 'QQ Official', link: '/en/manual/adapters/qq-official' },
        { text: 'QQBot', link: '/en/manual/adapters/qqbot' },
        { text: 'Email', link: '/en/manual/adapters/email' },
        { text: 'QQ Voice Call', link: '/en/manual/adapters/qq-voice-call' },
        { text: 'iMessage', link: '/en/manual/adapters/imessage' },
      ]
    },
    {
      text: 'Plugins',
      collapsed: false,
      items: [
        { text: 'Install Plugins', link: '/en/manual/plugins/' },
        { text: 'Management', link: '/en/manual/plugins/management' },
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
        { text: 'MCP Config', link: '/en/manual/configuration/mcp-config' },
        { text: 'A_Memorix Config', link: '/en/manual/configuration/amemorix-config' },
      ]
    },
    {
      text: 'WebUI',
      collapsed: false,
      items: [
        { text: 'Login & Settings', link: '/en/manual/webui/' },
        { text: 'Config Management', link: '/en/manual/webui/config-management' },
        { text: 'Adapter Management', link: '/en/manual/webui/adapter-management' },
        { text: 'Command Management', link: '/en/manual/webui/command-management' },
        { text: 'Memory Management', link: '/en/manual/webui/memory-management' },
        { text: 'Chat & Stats', link: '/en/manual/webui/chat-stats' },
      ]
    },
  ],
  '/en/develop/': [
    {
      text: 'Development Overview',
      collapsed: false,
      items: [
        { text: 'Development Guide', link: '/en/develop/' },
        { text: 'Style Guide', link: '/en/develop/style-guide' },
        { text: 'Markdown Features', link: '/en/develop/markdown-features' },
      ]
    },
    {
      text: 'Advanced Topics',
      collapsed: false,
      items: [
        { text: 'Database', link: '/en/develop/database' },
        { text: 'Configuration System', link: '/en/develop/configuration' },
        { text: 'Message Server', link: '/en/develop/message-server-and-adapters' },
        { text: 'LLM Integration', link: '/en/develop/llm-providers' },
        { text: 'MCP Integration', link: '/en/develop/mcp-integration' },
        { text: 'WebUI HTTP API', link: '/en/develop/webui-api/' },
        { text: 'Auth & Configuration', link: '/en/develop/webui-api/auth-and-setup' },
        { text: 'System Control', link: '/en/develop/webui-api/system-control' },
        { text: 'Data & Memory', link: '/en/develop/webui-api/data-and-memory-api' },
        { text: 'Plugin Lifecycle', link: '/en/develop/webui-api/plugin-lifecycle-api' },
        { text: 'Realtime Stats', link: '/en/develop/webui-api/realtime-and-stats' },
        { text: 'Logging & Monitoring', link: '/en/develop/observability' },
        { text: 'Data Import/Export', link: '/en/develop/statistics-io' },
        { text: 'Events & Hooks', link: '/en/develop/event-pipeline-hooks' },
        { text: 'Runtime Architecture', link: '/en/develop/plugin-runtime-internals' },
      ]
    },
  ],
}
