import type { DefaultTheme } from 'vitepress'

// Mirror of zh.ts — same dual-channel design.
//   Top nav = intent axis (reusing the six integration routes declared by the site
//   itself in theme/utils/integration-routes.ts); sidebar = directory axis, one
//   config per path prefix. All links carry /en/ and activeMatch matches '^/en/...'.
//   See zh.ts for the design notes and VitePress behaviour caveats.

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Manual', link: '/en/manual/', activeMatch: '^/en/manual/' },
  {
    text: 'Development',
    activeMatch: '^/en/develop/',
    items: [
      { text: 'Overview', link: '/en/develop/' },
      { text: 'Platform Adapters', link: '/en/develop/adapters/' },
      { text: 'Plugin Development', link: '/en/develop/plugin/' },
    ],
  },
  { text: 'FAQ', link: '/en/faq/', activeMatch: '^/en/faq/' },
  {
    text: 'About',
    activeMatch: '^/en/(about|contributing|changelog)/',
    items: [
      { text: 'Project Overview', link: '/en/about/' },
      { text: 'Community Groups', link: '/en/about/community' },
      { text: 'Acknowledgements', link: '/en/about/acknowledgements' },
      { text: 'Docs Site', link: '/en/about/about-docs' },
      { text: 'Contribute', link: '/en/contributing/' },
      { text: 'Changelog', link: '/en/changelog/' },
    ],
  },
]

const manualSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Start',
    collapsed: false,
    items: [
      { text: 'Quick Start', link: '/en/manual/' },
      { text: 'Install with uv', link: '/en/manual/deployment/uv-tool' },
      { text: 'Windows Deployment', link: '/en/manual/deployment/windows' },
      { text: 'Linux Deployment', link: '/en/manual/deployment/linux' },
      { text: 'Docker Deployment', link: '/en/manual/deployment/docker' },
      { text: 'AI Install', link: '/en/manual/deployment/installation-agent' },
    ]
  },
  {
    text: 'Configuration',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/manual/configuration/' },
      { text: 'Bot Config', link: '/en/manual/configuration/bot-config' },
      { text: 'Model Config', link: '/en/manual/configuration/model-config' },
      { text: 'Extra Parameters', link: '/en/manual/configuration/model-extra-params' },
      { text: 'A_Memorix', link: '/en/manual/configuration/amemorix-config' },
    ]
  },
  {
    text: 'Connect Platforms',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/en/manual/adapters/' },
      { text: 'QQ Connector', link: '/en/manual/adapters/qq-local-client' },
      { text: 'Official Bot', link: '/en/manual/adapters/qq-official' },
      { text: 'Email', link: '/en/manual/adapters/email' },
      { text: 'Voice Call', link: '/en/manual/adapters/qq-voice-call' },
      { text: 'iMessage', link: '/en/manual/adapters/imessage' },
    ]
  },
  {
    text: 'Plugins',
    collapsed: true,
    items: [
      { text: 'Plugin Marketplace', link: '/en/manual/plugins/' },
      { text: 'Submit and Release Plugins', link: '/en/develop/plugin/submission' },
    ]
  },
  {
    text: 'WebUI',
    collapsed: true,
    items: [
      { text: 'Login', link: '/en/manual/webui/' },
      { text: 'Edit Config', link: '/en/manual/webui/config-management' },
      { text: 'Adapter Management', link: '/en/manual/webui/adapter-management' },
      { text: 'Command Management', link: '/en/manual/webui/command-management' },
      { text: 'Memory', link: '/en/manual/webui/memory-management' },
      { text: 'Data Management', link: '/en/manual/webui/data-management' },
    ]
  },
]

const developSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Routes',
    collapsed: false,
    items: [
      { text: 'Overview', link: '/en/develop/' },
    ]
  },
  {
    text: 'Adapters',
    collapsed: true,
    items: [
      { text: 'Adapter Overview', link: '/en/develop/adapters/' },
      { text: 'Message Protocol', link: '/en/develop/adapters/protocol' },
      { text: 'Avatar API', link: '/en/develop/adapters/avatar-api' },
      { text: 'Writing an Adapter', link: '/en/develop/adapters/build' },
      { text: 'Access Policy', link: '/en/develop/adapters/policy' },
      { text: 'Troubleshooting', link: '/en/develop/adapters/debugging' },
    ]
  },
  {
    text: 'Plugin Development',
    collapsed: true,
    items: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Development Guide', link: '/en/develop/plugin/' },
          { text: 'Plugin Integration', link: '/en/develop/plugin/integration' },
          { text: 'Vibe Coding', link: '/en/develop/plugin/vibe-coding' },
        ]
      },
      {
        text: 'Plugin Fundamentals',
        collapsed: true,
        items: [
          { text: 'Manifest', link: '/en/develop/plugin/manifest' },
          { text: 'Lifecycle', link: '/en/develop/plugin/lifecycle' },
          { text: 'Configuration', link: '/en/develop/plugin/config' },
        ]
      },
      {
        text: 'Chat and Interaction',
        collapsed: true,
        items: [
          { text: 'Tool', link: '/en/develop/plugin/tools' },
          { text: 'Command', link: '/en/develop/plugin/commands' },
          { text: 'Hook', link: '/en/develop/plugin/hooks' },
          { text: 'Event Handlers', link: '/en/develop/plugin/event-handlers' },
          { text: 'Reply Extensions', link: '/en/develop/plugin/reply-extensions' },
        ]
      },
      {
        text: 'Platforms and Services',
        collapsed: true,
        items: [
          { text: 'Message Gateway', link: '/en/develop/plugin/message-gateway' },
          { text: 'API Components', link: '/en/develop/plugin/api-components' },
          { text: 'LLM Provider', link: '/en/develop/plugin/llmprovider' },
        ]
      },
      {
        text: 'WebUI Extensions',
        collapsed: true,
        items: [
          { text: 'Home Cards', link: '/en/develop/plugin/home-cards' },
          { text: 'WebUI Pages', link: '/en/develop/plugin/webui-pages' },
        ]
      },
      { text: 'SDK API Reference', link: '/en/develop/plugin/api-reference' },
      { text: 'Submit and Release Plugins', link: '/en/develop/plugin/submission' },
    ],
  },
  {
    text: 'API',
    collapsed: true,
    items: [
      { text: 'External Agent Connections', link: '/en/develop/agent-connections' },
    ]
  },
]

const aboutSidebar: DefaultTheme.SidebarItem[] = [
    {
      text: 'Project',
      collapsed: false,
      items: [
        { text: 'Project Overview', link: '/en/about/' },
        { text: 'Community Groups', link: '/en/about/community' },
        { text: 'Acknowledgements', link: '/en/about/acknowledgements' },
      ]
    },
    {
      text: 'Docs Site',
      collapsed: true,
      items: [
        { text: 'Docs Site', link: '/en/about/about-docs' },
        { text: 'Contribute', link: '/en/contributing/' },
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
]

export const sidebar: DefaultTheme.Sidebar = {
  '/en/develop/': developSidebar,
  '/en/contributing/': aboutSidebar,
  '/en/about/': aboutSidebar,
  '/en/changelog/': [
    {
      text: 'Changelog',
      items: [
        { text: 'Overview', link: '/en/changelog/' },
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
        { text: 'Overview', link: '/en/faq/error-troubleshooting' },
        { text: 'Startup & Access', link: '/en/faq/troubleshooting-startup' },
        { text: 'Models & Rules', link: '/en/faq/troubleshooting-model' },
        { text: 'Runtime & Data', link: '/en/faq/troubleshooting-runtime' },
        { text: 'Plugins & Adapters', link: '/en/faq/troubleshooting-plugins-adapters' },
        { text: 'Help', link: '/en/faq/getting-help' },
      ]
    },
    {
      text: 'Deeper',
      collapsed: true,
      items: [
        { text: 'Configuration', link: '/en/manual/configuration/' },
        { text: 'Plugin Guide', link: '/en/develop/plugin/' },
      ]
    },
  ],
  '/en/manual/': manualSidebar,
}
