import type { DefaultTheme } from 'vitepress'

// ---------------------------------------------------------------------------
// 双通道导航设计（顶栏 × 侧边栏）
//
// 顶栏 = 意图轴：四个入口，每项落在分区门户页。首页由站名承载，更新日志收进
//   「关于」下拉。开发入口集中在「开发」，模型配置归入手册。
//   activeMatch 是未锚定正则，匹配 normalize('/' + page.relativePath)，
//   必须写成 '^/xxx/' 形式；en 侧要匹配 '/en/xxx/'。
// 标签只写页面名，不复述解释：解释句留在「开发总览」页的卡片里，菜单写
//   「把麦麦接到一个新聊天平台」这类句子只会把窄侧栏撑长。页面正文 H1 仍是完整
//   标题，侧栏只是目录，二者不必逐字相同。
// 侧边栏 = 目录轴：VitePress 的键是路径前缀，只能按分区组织；与顶栏分区一一对应。
//   除各分区入口组外默认 collapsed: true —— 含当前页的组会被 VitePress 强制展开，
//   折叠只控制默认视觉噪音。单组分区省略 collapsed（第三态：常开且不显示折叠箭头）。
// 注意：① 侧边栏键按路径段数降序匹配，切勿新增 '/develop/plugin' 这类与
//   '/develop/' 同段数的键（生效与否取决于书写顺序）；
//   ② nav 项同时给 link 与 items 时下拉会被静默丢弃，所以下拉项只能有 items；
//   ③ 侧边栏条目高亮是归一后精确匹配，index 页的 link 必须带尾斜杠。
// ---------------------------------------------------------------------------

export const nav: DefaultTheme.NavItem[] = [
  { text: '手册', link: '/manual/', activeMatch: '^/manual/' },
  {
    text: '开发',
    activeMatch: '^/develop/',
    items: [
      { text: '总览', link: '/develop/' },
      { text: '平台适配器', link: '/develop/adapters/' },
      { text: '插件开发', link: '/develop/plugin/' },
    ],
  },
  { text: '常见问题', link: '/faq/', activeMatch: '^/faq/' },
  {
    text: '关于',
    activeMatch: '^/(about|contributing|changelog)/',
    items: [
      { text: '项目介绍', link: '/about/' },
      { text: '交流群', link: '/about/community' },
      { text: '致谢', link: '/about/acknowledgements' },
      { text: '本站', link: '/about/about-docs' },
      { text: '参与', link: '/contributing/' },
      { text: '更新日志', link: '/changelog/' },
    ],
  },
]

const manualSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '开始',
    collapsed: false,
    items: [
      { text: '快速上手', link: '/manual/' },
      { text: 'uv 安装', link: '/manual/deployment/uv-tool' },
      { text: 'Windows 部署', link: '/manual/deployment/windows' },
      { text: 'Linux 部署', link: '/manual/deployment/linux' },
      { text: 'Linux 桌面一键包（实验性）', link: '/manual/deployment/linux-onekey' },
      { text: 'Docker 部署', link: '/manual/deployment/docker' },
      { text: 'AI 安装', link: '/manual/deployment/installation-agent' },
    ]
  },
  {
    text: '配置',
    collapsed: true,
    items: [
      { text: '概览', link: '/manual/configuration/' },
      { text: 'Bot 配置', link: '/manual/configuration/bot-config' },
      { text: '模型配置', link: '/manual/configuration/model-config' },
      { text: '额外参数', link: '/manual/configuration/model-extra-params' },
      { text: 'A_Memorix 配置', link: '/manual/configuration/amemorix-config' },
    ]
  },
  {
    text: '接入平台',
    collapsed: true,
    items: [
      { text: '概览', link: '/manual/adapters/' },
      { text: 'QQ 连接器', link: '/manual/adapters/qq-local-client' },
      { text: '官方机器人', link: '/manual/adapters/qq-official' },
      { text: '邮件', link: '/manual/adapters/email' },
      { text: '语音通话', link: '/manual/adapters/qq-voice-call' },
      { text: 'iMessage', link: '/manual/adapters/imessage' },
    ]
  },
  {
    text: '插件',
    collapsed: true,
    items: [
      { text: '插件市场', link: '/manual/plugins/' },
      { text: '提交与发布插件', link: '/develop/plugin/submission' },
    ]
  },
  {
    text: 'WebUI',
    collapsed: true,
    items: [
      { text: '登录', link: '/manual/webui/' },
      { text: '改配置', link: '/manual/webui/config-management' },
      { text: '适配器管理', link: '/manual/webui/adapter-management' },
      { text: '命令管理', link: '/manual/webui/command-management' },
      { text: '记忆管理', link: '/manual/webui/memory-management' },
      { text: '数据管理', link: '/manual/webui/data-management' },
    ]
  },
]

const developSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '路线',
    collapsed: false,
    items: [
      { text: '总览', link: '/develop/' },
    ]
  },
  {
    text: '适配器',
    collapsed: true,
    items: [
      { text: '适配器概览', link: '/develop/adapters/' },
      { text: '消息协议', link: '/develop/adapters/protocol' },
      { text: '头像接口', link: '/develop/adapters/avatar-api' },
      { text: '编写适配器', link: '/develop/adapters/build' },
      { text: '访问策略', link: '/develop/adapters/policy' },
      { text: '排错', link: '/develop/adapters/debugging' },
    ]
  },
  {
    text: '插件开发',
    collapsed: true,
    items: [
      {
        text: '快速开始',
        collapsed: false,
        items: [
          { text: '开发指南', link: '/develop/plugin/' },
          { text: '插件接入', link: '/develop/plugin/integration' },
          { text: 'Vibe Coding', link: '/develop/plugin/vibe-coding' },
        ]
      },
      {
        text: '插件基础',
        collapsed: true,
        items: [
          { text: 'Manifest', link: '/develop/plugin/manifest' },
          { text: '生命周期', link: '/develop/plugin/lifecycle' },
          { text: '配置', link: '/develop/plugin/config' },
        ]
      },
      {
        text: '对话与交互',
        collapsed: true,
        items: [
          { text: 'Tool', link: '/develop/plugin/tools' },
          { text: 'Command', link: '/develop/plugin/commands' },
          { text: 'Hook', link: '/develop/plugin/hooks' },
          { text: '事件处理器', link: '/develop/plugin/event-handlers' },
          { text: '回复扩展', link: '/develop/plugin/reply-extensions' },
        ]
      },
      {
        text: '平台与服务',
        collapsed: true,
        items: [
          { text: '消息网关', link: '/develop/plugin/message-gateway' },
          { text: 'API 组件', link: '/develop/plugin/api-components' },
          { text: 'LLMProvider', link: '/develop/plugin/llmprovider' },
        ]
      },
      {
        text: 'WebUI 扩展',
        collapsed: true,
        items: [
          { text: '首页卡片', link: '/develop/plugin/home-cards' },
          { text: 'WebUI 页面', link: '/develop/plugin/webui-pages' },
        ]
      },
      { text: 'SDK API 参考', link: '/develop/plugin/api-reference' },
      { text: '提交与发布插件', link: '/develop/plugin/submission' },
    ],
  },
  {
    text: '接口',
    collapsed: true,
    items: [
      { text: '外接 Agent 连接', link: '/develop/agent-connections' },
    ]
  },
]

const aboutSidebar: DefaultTheme.SidebarItem[] = [
    {
      text: '项目',
      collapsed: false,
      items: [
        { text: '项目介绍', link: '/about/' },
        { text: '交流群', link: '/about/community' },
        { text: '致谢', link: '/about/acknowledgements' },
      ]
    },
    {
      text: '文档站',
      collapsed: true,
      items: [
        { text: '本站', link: '/about/about-docs' },
        { text: '参与', link: '/contributing/' },
        { text: '风格指南', link: '/contributing/style-guide' },
        { text: '写作特性', link: '/contributing/markdown-features' },
      ]
    },
    {
      text: '条款',
      collapsed: true,
      items: [
        { text: 'EULA', link: '/about/EULA' },
        { text: '隐私条款', link: '/about/PRIVACY' },
      ]
    },
]

export const sidebar: DefaultTheme.Sidebar = {
  '/develop/': developSidebar,
  '/contributing/': aboutSidebar,
  '/about/': aboutSidebar,
  '/faq/': [
    {
      text: '常见问题',
      collapsed: false,
      items: [
        { text: '分类', link: '/faq/' },
        { text: '基础使用', link: '/faq/basic-usage' },
        { text: '部署与启动', link: '/faq/deployment' },
        { text: '一键包', link: '/faq/one-key' },
        { text: '适配器', link: '/faq/adapters' },
        { text: '聊天与回复', link: '/faq/chat-and-reply' },
        { text: '模型与 API', link: '/faq/models-and-api' },
        { text: '记忆与学习', link: '/faq/memory-and-learning' },
        { text: '插件', link: '/faq/plugins' },
        { text: '备份与迁移', link: '/faq/backup-and-migration' },
      ]
    },
    {
      text: '错误排查',
      collapsed: false,
      items: [
        { text: '总览', link: '/faq/error-troubleshooting' },
        { text: '启动与访问', link: '/faq/troubleshooting-startup' },
        { text: '模型与规则', link: '/faq/troubleshooting-model' },
        { text: '运行与数据', link: '/faq/troubleshooting-runtime' },
        { text: '插件与适配器', link: '/faq/troubleshooting-plugins-adapters' },
        { text: '帮助', link: '/faq/getting-help' },
      ]
    },
    {
      text: '深入',
      collapsed: true,
      items: [
        { text: '部署配置', link: '/manual/configuration/' },
        { text: '插件指南', link: '/develop/plugin/' },
      ]
    },
  ],
  '/manual/': manualSidebar,
  '/changelog/': [
    {
      text: '更新日志',
      items: [
        { text: '总览', link: '/changelog/' },
      ]
    },
  ],
}
