/**
 * 「开发总览」页的路线数据。
 *
 * 一个接入点 = 一条路线；zh / en 两份文案都放在这里，组件按当前语言取用，
 * 这样 Markdown 里只需要写一个 <IntegrationRoutes /> 标签。
 */
export interface IntegrationRoute {
  /** 稳定标识，用作锚点与筛选键 */
  key: string
  icon: string
  category: string
  title: string
  intent: string
  audience: string
  requires: string
  link: string
}

export interface IntegrationRouteText {
  category: string
  title: string
  intent: string
  audience: string
  requires: string
}

const links = {
  adapter: '/develop/adapters/',
  plugin: '/develop/plugin/',
}

const icons: Record<string, string> = {
  adapter: '🔌',
  plugin: '🧩',
}

const zh: Record<string, IntegrationRouteText> = {
  adapter: {
    category: '平台接入',
    title: '把麦麦接到一个新聊天平台',
    intent: '让麦麦出现在 QQ 之外的聊天平台，收发该平台的消息。',
    audience: '平台适配器作者',
    requires: '一个能收发消息的平台客户端 + Python 环境',
  },
  plugin: {
    category: '插件接入',
    title: '给麦麦加功能',
    intent: '加命令、加工具、加定时任务，或改写麦麦的回复。',
    audience: '插件作者',
    requires: 'Python 3.10+，无需改动 MaiBot 源码',
  },
}

const en: Record<string, IntegrationRouteText> = {
  adapter: {
    category: 'Platform',
    title: 'Connect MaiBot to a new chat platform',
    intent: 'Make MaiBot live on a platform beyond QQ and exchange its messages.',
    audience: 'Adapter authors',
    requires: 'A platform client that can send/receive messages + Python',
  },
  plugin: {
    category: 'Plugin',
    title: 'Add features to MaiBot',
    intent: 'Ship commands, tools, scheduled jobs, or rewrite replies.',
    audience: 'Plugin authors',
    requires: 'Python 3.10+, no MaiBot source changes',
  },
}

const order = ['adapter', 'plugin']

export const integrationRoutes: Record<'zh' | 'en', IntegrationRoute[]> = {
  zh: order.map((key) => ({ key, icon: icons[key], link: links[key as keyof typeof links], ...zh[key] })),
  en: order.map((key) => ({ key, icon: icons[key], link: links[key as keyof typeof links], ...en[key] })),
}

export const routeLabels: Record<'zh' | 'en', { audience: string; requires: string; cta: string }> = {
  zh: { audience: '适合', requires: '前置条件', cta: '开始接入' },
  en: { audience: 'For', requires: 'Before you start', cta: 'Get started' },
}
