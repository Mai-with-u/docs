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
        { text: '发布插件', link: '/plugin/submission' },
      ]
    },
    {
      text: '组件开发',
      collapsed: false,
      items: [
        { text: 'Tool', link: '/plugin/tools' },
        { text: 'Command', link: '/plugin/commands' },
        { text: '首页卡片', link: '/plugin/home-cards' },
        { text: 'Hook 处理器', link: '/plugin/hooks' },
        { text: '事件处理器', link: '/plugin/event-handlers' },
        { text: 'API 组件', link: '/plugin/api-components' },
        { text: '消息网关', link: '/plugin/message-gateway' },
        { text: 'LLMProvider 组件', link: '/plugin/llmprovider' },
        { text: 'Action (Legacy)', link: '/plugin/actions' },
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
        { text: '错误排查', link: '/faq/error-troubleshooting' },
      ]
    },
  ],
  '/manual/': [
    {
      text: '入门',
      collapsed: false,
      items: [
        { text: '快速上手', link: '/manual/' },
        { text: 'Windows 部署', link: '/manual/deployment/windows' },
        { text: 'Linux 部署', link: '/manual/deployment/linux' },
        { text: 'Docker 部署', link: '/manual/deployment/docker' },
      ]
    },
    {
      text: '适配器',
      collapsed: false,
      items: [
        { text: '接入平台', link: '/manual/adapters/' },
        { text: 'NapCat', link: '/manual/adapters/napcat' },
        { text: 'SnowLuma', link: '/manual/adapters/snowluma' },
        { text: 'QQ 官方', link: '/manual/adapters/qq-official' },
        { text: 'QQBot', link: '/manual/adapters/qqbot' },
        { text: '邮件', link: '/manual/adapters/email' },
        { text: 'QQ 语音通话', link: '/manual/adapters/qq-voice-call' },
        { text: 'iMessage', link: '/manual/adapters/imessage' },
      ]
    },
    {
      text: '插件',
      collapsed: false,
      items: [
        { text: '安装插件', link: '/manual/plugins/' },
        { text: '管理', link: '/manual/plugins/management' },
      ]
    },
    {
      text: '配置',
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
      text: '网页管理',
      collapsed: false,
      items: [
        { text: '登录与设置', link: '/manual/webui/' },
        { text: '配置管理', link: '/manual/webui/config-management' },
        { text: '适配器管理', link: '/manual/webui/adapter-management' },
        { text: '命令管理', link: '/manual/webui/command-management' },
        { text: '记忆管理', link: '/manual/webui/memory-management' },
        { text: '聊天与统计', link: '/manual/webui/chat-stats' },
      ]
    },
  ],
  '/changelog/': [
    {
      text: '更新日志',
      collapsed: false,
      items: [
        { text: '总览', link: '/changelog/' },
        { text: '1.0.0 专题', link: '/changelog/v1-0-0' },
      ]
    },
  ],
  '/develop/': [
    {
      text: '开发总览',
      collapsed: false,
      items: [
        { text: '开发指南', link: '/develop/' },
        { text: '风格指南', link: '/develop/style-guide' },
        { text: 'Markdown 特性', link: '/develop/markdown-features' },
      ]
    },
    {
      text: '进阶专题',
      collapsed: false,
      items: [
        { text: '数据库', link: '/develop/database' },
        { text: '配置系统', link: '/develop/configuration' },
        { text: '消息服务器', link: '/develop/message-server-and-adapters' },
        { text: 'LLM 集成', link: '/develop/llm-providers' },
        { text: 'MCP 集成', link: '/develop/mcp-integration' },
        { text: 'WebUI HTTP API', link: '/develop/webui-api/' },
        { text: '认证与配置', link: '/develop/webui-api/auth-and-setup' },
        { text: '系统控制', link: '/develop/webui-api/system-control' },
        { text: '数据与记忆', link: '/develop/webui-api/data-and-memory-api' },
        { text: '插件生命周期', link: '/develop/webui-api/plugin-lifecycle-api' },
        { text: '实时统计', link: '/develop/webui-api/realtime-and-stats' },
        { text: '日志与观测', link: '/develop/observability' },
        { text: '数据导入导出', link: '/develop/statistics-io' },
        { text: '事件与钩子', link: '/develop/event-pipeline-hooks' },
        { text: '运行时架构', link: '/develop/plugin-runtime-internals' },
      ]
    },
  ],
}
