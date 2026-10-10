import type { DefaultTheme } from 'vitepress'

// Mirror of zh.ts — same dual-channel design.
//   Top nav = intent axis (reusing the six integration routes declared by the site
//   itself in theme/utils/integration-routes.ts); sidebar = directory axis, one
//   config per path prefix. All links carry /en/ and activeMatch matches '^/en/...'.
//   See zh.ts for the design notes and VitePress behaviour caveats.

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Home', link: '/en/' },
  { text: 'Manual', link: '/en/manual/', activeMatch: '^/en/manual/' },
  {
    text: 'Integration & Extension',
    activeMatch: '^/en/(develop|plugin)/',
    items: [
      { text: 'Integration Overview', link: '/en/develop/' },
      { text: 'Connect MaiBot to a new chat platform', link: '/en/develop/adapters/' },
      { text: 'Add features to MaiBot', link: '/en/plugin/' },
      { text: 'Swap models or plug in your own service', link: '/en/manual/configuration/model-config' },
      { text: 'Let MaiBot call external tools', link: '/en/manual/configuration/mcp-config' },
      { text: 'Read or control MaiBot from your own program', link: '/en/develop/webui-api/' },
      { text: 'Export and analyse chat data', link: '/en/develop/statistics-io' },
    ],
  },
  { text: 'FAQ', link: '/en/faq/', activeMatch: '^/en/faq/' },
  { text: 'Changelog', link: '/en/changelog/', activeMatch: '^/en/changelog/' },
  {
    text: 'About',
    activeMatch: '^/en/(about|contributing)/',
    items: [
      { text: 'About the Project', link: '/en/about/' },
      { text: 'Community Groups', link: '/en/about/community' },
      { text: 'Acknowledgements & Links', link: '/en/about/acknowledgements' },
      { text: 'About This Docs', link: '/en/about/about-docs' },
      { text: 'Contribute to Docs', link: '/en/contributing/' },
    ],
  },
]

const manualSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Getting Started & Deployment',
    collapsed: false,
    items: [
      { text: 'Quick Start', link: '/en/manual/' },
      { text: 'Windows Deployment', link: '/en/manual/deployment/windows' },
      { text: 'Linux Deployment', link: '/en/manual/deployment/linux' },
      { text: 'Docker Deployment', link: '/en/manual/deployment/docker' },
      { text: 'AI-Assisted Install', link: '/en/manual/deployment/installation-agent' },
    ]
  },
  {
    text: 'Configuration',
    collapsed: true,
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
    text: 'Connect Platforms',
    collapsed: true,
    items: [
      { text: 'Connect Platforms', link: '/en/manual/adapters/' },
      { text: 'Unified QQ Connector', link: '/en/manual/adapters/qq-local-client' },
      { text: 'QQ Official Bot', link: '/en/manual/adapters/qq-official' },
      { text: 'Email', link: '/en/manual/adapters/email' },
      { text: 'QQ Voice Call', link: '/en/manual/adapters/qq-voice-call' },
      { text: 'iMessage', link: '/en/manual/adapters/imessage' },
      { text: 'NapCat (archived)', link: '/en/manual/adapters/napcat' },
    ]
  },
  {
    text: 'Plugins',
    collapsed: true,
    items: [
      { text: 'Install Plugins', link: '/en/manual/plugins/' },
      { text: 'Manage Plugins', link: '/en/manual/plugins/management' },
    ]
  },
  {
    text: 'WebUI Console',
    collapsed: true,
    items: [
      { text: 'Login & Settings', link: '/en/manual/webui/' },
      { text: 'Editing Config in the Browser', link: '/en/manual/webui/config-management' },
      { text: 'Adapter Management', link: '/en/manual/webui/adapter-management' },
      { text: 'Command Management', link: '/en/manual/webui/command-management' },
      { text: 'Viewing & Managing Memory', link: '/en/manual/webui/memory-management' },
      { text: 'Data Management', link: '/en/manual/webui/data-management' },
      { text: 'Chat History & Stats', link: '/en/manual/webui/chat-stats' },
    ]
  },
]

const developSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Integration Routes',
    collapsed: false,
    items: [
      { text: 'Integration Overview', link: '/en/develop/' },
      { text: 'Swap models or plug in your own service', link: '/en/manual/configuration/model-config' },
      { text: 'Let MaiBot call external tools', link: '/en/manual/configuration/mcp-config' },
    ]
  },
  {
    text: 'Platform Adapters',
    collapsed: true,
    items: [
      { text: 'Adapter Overview', link: '/en/develop/adapters/' },
      { text: 'Message Protocol', link: '/en/develop/adapters/protocol' },
      { text: 'Writing an Adapter', link: '/en/develop/adapters/build' },
      { text: 'Access Policy', link: '/en/develop/adapters/policy' },
      { text: 'Troubleshooting', link: '/en/develop/adapters/debugging' },
    ]
  },
  {
    text: 'Plugin Integration',
    collapsed: true,
    items: [
      { text: 'Plugin Integration', link: '/en/develop/plugin' },
      { text: 'Plugin Development Guide', link: '/en/plugin/' },
    ]
  },
  {
    text: 'Programmatic Access',
    collapsed: true,
    items: [
      { text: 'API Overview', link: '/en/develop/webui-api/' },
      { text: 'Auth & Setup', link: '/en/develop/webui-api/auth-and-setup' },
      { text: 'System Control', link: '/en/develop/webui-api/system-control' },
      { text: 'Data & Memory', link: '/en/develop/webui-api/data-and-memory-api' },
      { text: 'Plugin Management', link: '/en/develop/webui-api/plugin-lifecycle-api' },
      { text: 'Realtime Channel & Statistics', link: '/en/develop/webui-api/realtime-and-stats' },
    ]
  },
  {
    text: 'Data & Statistics',
    collapsed: true,
    items: [
      { text: 'Data & Statistics', link: '/en/develop/statistics-io' },
    ]
  },
]

const pluginSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Start',
    collapsed: false,
    items: [
      { text: 'Plugin Development Guide', link: '/en/plugin/' },
      { text: 'Plugin Integration', link: '/en/develop/plugin' },
      { text: 'Vibe Coding', link: '/en/plugin/vibe-coding' },
    ]
  },
  {
    text: 'Plugin Basics',
    collapsed: true,
    items: [
      { text: 'Manifest', link: '/en/plugin/manifest' },
      { text: 'Lifecycle', link: '/en/plugin/lifecycle' },
      { text: 'Configuration', link: '/en/plugin/config' },
    ]
  },
  {
    text: 'Components',
    collapsed: true,
    items: [
      { text: 'Tool', link: '/en/plugin/tools' },
      { text: 'Command', link: '/en/plugin/commands' },
      { text: 'Hook', link: '/en/plugin/hooks' },
      { text: 'Event Handlers', link: '/en/plugin/event-handlers' },
      { text: 'Message Gateway', link: '/en/plugin/message-gateway' },
      { text: 'API Components', link: '/en/plugin/api-components' },
      { text: 'LLM Provider', link: '/en/plugin/llmprovider' },
      { text: 'Reply Extensions', link: '/en/plugin/reply-extensions' },
      { text: 'Home Cards', link: '/en/plugin/home-cards' },
      { text: 'WebUI Custom Pages', link: '/en/plugin/webui-pages' },
      { text: 'Action (Legacy)', link: '/en/plugin/actions' },
    ]
  },
  {
    text: 'Reference & Publishing',
    collapsed: true,
    items: [
      { text: 'Plugin API Reference', link: '/en/plugin/api-reference' },
      { text: 'Publishing', link: '/en/plugin/submission' },
    ]
  },
]

const contributingSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Docs Site',
    items: [
      { text: 'Contribute to Docs', link: '/en/contributing/' },
      { text: 'Style Guide', link: '/en/contributing/style-guide' },
      { text: 'Markdown Features', link: '/en/contributing/markdown-features' },
    ]
  },
]

export const sidebar: DefaultTheme.Sidebar = {
  '/en/develop/': developSidebar,
  '/en/plugin/': pluginSidebar,
  '/en/contributing/': contributingSidebar,
  '/en/about/': [
    {
      text: 'Project & Community',
      collapsed: false,
      items: [
        { text: 'About the Project', link: '/en/about/' },
        { text: 'Community Groups', link: '/en/about/community' },
        { text: 'Acknowledgements & Links', link: '/en/about/acknowledgements' },
      ]
    },
    {
      text: 'Docs Site',
      collapsed: true,
      items: [
        { text: 'About This Docs', link: '/en/about/about-docs' },
        { text: 'Contribute to Docs', link: '/en/contributing/' },
        { text: 'Style Guide', link: '/en/contributing/style-guide' },
        { text: 'Markdown Features', link: '/en/contributing/markdown-features' },
      ]
    },
    {
      text: 'Legal',
      collapsed: true,
      items: [
        { text: 'EULA', link: '/en/about/EULA' },
        { text: 'Privacy Policy', link: '/en/about/PRIVACY' },
      ]
    },
  ],
  '/en/changelog/': [
    {
      text: 'Changelog',
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
      ]
    },
    {
      text: 'Troubleshooting',
      collapsed: false,
      items: [
        { text: 'Troubleshooting Overview', link: '/en/faq/error-troubleshooting' },
        { text: 'Startup & Access', link: '/en/faq/troubleshooting-startup' },
        { text: 'Models & Rules', link: '/en/faq/troubleshooting-model' },
        { text: 'Runtime & Data', link: '/en/faq/troubleshooting-runtime' },
        { text: 'Plugins & Adapters', link: '/en/faq/troubleshooting-plugins-adapters' },
        { text: 'Getting Help', link: '/en/faq/getting-help' },
      ]
    },
    {
      text: 'Go Deeper',
      collapsed: true,
      items: [
        { text: 'Configuration', link: '/en/manual/configuration/' },
        { text: 'Plugin Development Guide', link: '/en/plugin/' },
        { text: 'Programmatic Access', link: '/en/develop/webui-api/' },
      ]
    },
  ],
  '/en/manual/': manualSidebar,
}
