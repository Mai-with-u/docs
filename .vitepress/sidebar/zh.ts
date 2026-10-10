import type { DefaultTheme } from 'vitepress'

// ---------------------------------------------------------------------------
// 双通道导航设计（顶栏 × 侧边栏）
//
// 顶栏 = 意图轴：覆盖全部分区，每项落在分区门户页；「接入与扩展」下拉直接复用
//   站点自己声明的六条接入路线（见 theme/utils/integration-routes.ts）——其中
//   换模型 / 接 MCP 两条路线落在用户手册里，只有走意图轴才能从任意页面一击到达。
//   activeMatch 是未锚定正则，匹配 normalize('/' + page.relativePath)，
//   必须写成 '^/xxx/' 形式；en 侧要匹配 '/en/xxx/'。
// 侧边栏 = 目录轴：VitePress 的键是路径前缀，只能按分区组织；与顶栏分区一一对应。
//   除各分区入口组外默认 collapsed: true —— 含当前页的组会被 VitePress 强制展开，
//   折叠只控制默认视觉噪音。单组分区省略 collapsed（第三态：常开且不显示折叠箭头）。
// 注意：① 侧边栏键按路径段数降序匹配，切勿新增 '/develop/plugin' 这类与
//   '/develop/' 同段数的键（生效与否取决于书写顺序）；
//   ② nav 项同时给 link 与 items 时下拉会被静默丢弃，所以下拉项只能有 items；
//   ③ 侧边栏条目高亮是归一后精确匹配，index 页的 link 必须带尾斜杠。
// ---------------------------------------------------------------------------

export const nav: DefaultTheme.NavItem[] = [
  { text: '首页', link: '/' },
  { text: '用户手册', link: '/manual/', activeMatch: '^/manual/' },
  {
    text: '接入与扩展',
    activeMatch: '^/(develop|plugin)/',
    items: [
      { text: '接入路线总览', link: '/develop/' },
      { text: '把麦麦接到一个新聊天平台', link: '/develop/adapters/' },
      { text: '给麦麦加功能', link: '/plugin/' },
      { text: '换模型或接自建模型服务', link: '/manual/configuration/model-config' },
      { text: '让麦麦调用外部工具', link: '/manual/configuration/mcp-config' },
      { text: '用外部程序读取或控制麦麦', link: '/develop/webui-api/' },
      { text: '导出与分析聊天数据', link: '/develop/statistics-io' },
    ],
  },
  { text: '常见问题', link: '/faq/', activeMatch: '^/faq/' },
  { text: '更新日志', link: '/changelog/', activeMatch: '^/changelog/' },
  {
    text: '关于',
    activeMatch: '^/(about|contributing)/',
    items: [
      { text: '关于麦麦', link: '/about/' },
      { text: '交流群', link: '/about/community' },
      { text: '致谢与友链', link: '/about/acknowledgements' },
      { text: '关于文档站', link: '/about/about-docs' },
      { text: '参与文档站', link: '/contributing/' },
    ],
  },
]

const manualSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '入门与部署',
    collapsed: false,
    items: [
      { text: '快速上手', link: '/manual/' },
      { text: 'Windows 部署', link: '/manual/deployment/windows' },
      { text: 'Linux 部署', link: '/manual/deployment/linux' },
      { text: 'Docker 部署', link: '/manual/deployment/docker' },
      { text: 'AI 助手安装', link: '/manual/deployment/installation-agent' },
    ]
  },
  {
    text: '配置',
    collapsed: true,
    items: [
      { text: '配置概览', link: '/manual/configuration/' },
      { text: 'Bot 配置', link: '/manual/configuration/bot-config' },
      { text: '模型配置', link: '/manual/configuration/model-config' },
      { text: '模型额外参数', link: '/manual/configuration/model-extra-params' },
      { text: 'MCP 配置', link: '/manual/configuration/mcp-config' },
      { text: 'A_Memorix 记忆系统配置', link: '/manual/configuration/amemorix-config' },
    ]
  },
  {
    text: '接入平台',
    collapsed: true,
    items: [
      { text: '接入平台', link: '/manual/adapters/' },
      { text: '统一 QQ 连接器', link: '/manual/adapters/qq-local-client' },
      { text: 'QQ 官方机器人', link: '/manual/adapters/qq-official' },
      { text: '邮件', link: '/manual/adapters/email' },
      { text: 'QQ 语音通话', link: '/manual/adapters/qq-voice-call' },
      { text: 'iMessage', link: '/manual/adapters/imessage' },
      { text: 'NapCat（已归档）', link: '/manual/adapters/napcat' },
    ]
  },
  {
    text: '插件',
    collapsed: true,
    items: [
      { text: '安装插件', link: '/manual/plugins/' },
      { text: '管理插件', link: '/manual/plugins/management' },
    ]
  },
  {
    text: 'WebUI 管理面板',
    collapsed: true,
    items: [
      { text: '登录与设置', link: '/manual/webui/' },
      { text: '在浏览器里改配置', link: '/manual/webui/config-management' },
      { text: '适配器管理', link: '/manual/webui/adapter-management' },
      { text: '命令管理', link: '/manual/webui/command-management' },
      { text: '查看和管理记忆', link: '/manual/webui/memory-management' },
      { text: '数据管理', link: '/manual/webui/data-management' },
    ]
  },
]

const developSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '接入路线',
    collapsed: false,
    items: [
      { text: '接入路线总览', link: '/develop/' },
      { text: '换模型或接自建模型服务', link: '/manual/configuration/model-config' },
      { text: '让麦麦调用外部工具', link: '/manual/configuration/mcp-config' },
    ]
  },
  {
    text: '平台接入',
    collapsed: true,
    items: [
      { text: '适配器概览', link: '/develop/adapters/' },
      { text: '消息协议', link: '/develop/adapters/protocol' },
      { text: '编写适配器', link: '/develop/adapters/build' },
      { text: '访问策略', link: '/develop/adapters/policy' },
      { text: '排错', link: '/develop/adapters/debugging' },
    ]
  },
  {
    text: '插件接入',
    collapsed: true,
    items: [
      { text: '插件接入', link: '/develop/plugin' },
      { text: '插件开发指南', link: '/plugin/' },
    ]
  },
  {
    text: '程序化对接',
    collapsed: true,
    items: [
      { text: '接口概览', link: '/develop/webui-api/' },
      { text: '认证与配置', link: '/develop/webui-api/auth-and-setup' },
      { text: '系统控制', link: '/develop/webui-api/system-control' },
      { text: '数据与记忆', link: '/develop/webui-api/data-and-memory-api' },
      { text: '插件管理', link: '/develop/webui-api/plugin-lifecycle-api' },
      { text: '实时通道与统计', link: '/develop/webui-api/realtime-and-stats' },
    ]
  },
  {
    text: '数据与统计',
    collapsed: true,
    items: [
      { text: '数据与统计', link: '/develop/statistics-io' },
    ]
  },
]

const pluginSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '开始',
    collapsed: false,
    items: [
      { text: '插件开发指南', link: '/plugin/' },
      { text: '插件接入', link: '/develop/plugin' },
      { text: 'Vibe Coding', link: '/plugin/vibe-coding' },
    ]
  },
  {
    text: '插件基础',
    collapsed: true,
    items: [
      { text: 'Manifest', link: '/plugin/manifest' },
      { text: '生命周期', link: '/plugin/lifecycle' },
      { text: '配置', link: '/plugin/config' },
    ]
  },
  {
    text: '组件',
    collapsed: true,
    items: [
      { text: 'Tool', link: '/plugin/tools' },
      { text: 'Command', link: '/plugin/commands' },
      { text: 'Hook', link: '/plugin/hooks' },
      { text: '事件处理器', link: '/plugin/event-handlers' },
      { text: '消息网关', link: '/plugin/message-gateway' },
      { text: 'API 组件', link: '/plugin/api-components' },
      { text: 'LLMProvider', link: '/plugin/llmprovider' },
      { text: '回复扩展', link: '/plugin/reply-extensions' },
      { text: '首页卡片', link: '/plugin/home-cards' },
      { text: 'WebUI 自定义页面', link: '/plugin/webui-pages' },
      { text: 'Action（旧版）', link: '/plugin/actions' },
    ]
  },
  {
    text: '参考与发布',
    collapsed: true,
    items: [
      { text: '插件 API 参考', link: '/plugin/api-reference' },
      { text: '发布插件', link: '/plugin/submission' },
    ]
  },
]

const contributingSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '文档站',
    items: [
      { text: '参与文档站', link: '/contributing/' },
      { text: '风格指南', link: '/contributing/style-guide' },
      { text: '写作特性', link: '/contributing/markdown-features' },
    ]
  },
]

export const sidebar: DefaultTheme.Sidebar = {
  '/develop/': developSidebar,
  '/plugin/': pluginSidebar,
  '/contributing/': contributingSidebar,
  '/about/': [
    {
      text: '项目与社区',
      collapsed: false,
      items: [
        { text: '关于麦麦', link: '/about/' },
        { text: '交流群', link: '/about/community' },
        { text: '致谢与友链', link: '/about/acknowledgements' },
      ]
    },
    {
      text: '文档站',
      collapsed: true,
      items: [
        { text: '关于文档站', link: '/about/about-docs' },
        { text: '参与文档站', link: '/contributing/' },
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
  ],
  '/faq/': [
    {
      text: '常见问题',
      collapsed: false,
      items: [
        { text: '问题分类', link: '/faq/' },
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
        { text: '错误排查总览', link: '/faq/error-troubleshooting' },
        { text: '启动与访问', link: '/faq/troubleshooting-startup' },
        { text: '模型与规则', link: '/faq/troubleshooting-model' },
        { text: '运行与数据', link: '/faq/troubleshooting-runtime' },
        { text: '插件与适配器', link: '/faq/troubleshooting-plugins-adapters' },
        { text: '获取帮助', link: '/faq/getting-help' },
      ]
    },
    {
      text: '深入文档',
      collapsed: true,
      items: [
        { text: '部署与配置', link: '/manual/configuration/' },
        { text: '插件开发指南', link: '/plugin/' },
        { text: '程序化对接', link: '/develop/webui-api/' },
      ]
    },
  ],
  '/manual/': manualSidebar,
  '/changelog/': [
    {
      text: '更新日志',
      items: [
        { text: '总览', link: '/changelog/' },
        { text: '1.0.0 专题', link: '/changelog/v1-0-0' },
      ]
    },
  ],
}
