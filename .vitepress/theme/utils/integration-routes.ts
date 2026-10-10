/**
 * 「接入 MaiBot」总览页的路线数据。
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
  plugin: '/plugin/',
  model: '/manual/configuration/model-config',
  mcp: '/manual/configuration/mcp-config',
  api: '/develop/webui-api/',
  data: '/develop/statistics-io',
}

const icons: Record<string, string> = {
  adapter: '🔌',
  plugin: '🧩',
  model: '🧠',
  mcp: '🛠️',
  api: '🖥️',
  data: '📊',
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
  model: {
    category: '模型接入',
    title: '换模型或接自建模型服务',
    intent: '把对话、推理、嵌入、语音识别换成自己的模型或中转站。',
    audience: '模型服务提供方 / 站点运维',
    requires: '一个 OpenAI 兼容或厂商原生接口的地址与密钥',
  },
  mcp: {
    category: '工具接入',
    title: '让麦麦调用外部工具',
    intent: '把文件系统、数据库、内部 API 以 MCP 工具的形式交给麦麦。',
    audience: 'MCP Server 作者 / 站点运维',
    requires: '一个 MCP Server（本地进程或远程地址）',
  },
  api: {
    category: '程序化对接',
    title: '用外部程序读取或控制麦麦',
    intent: '做自己的面板、自动化脚本、监控告警，直接读写麦麦的运行时数据。',
    audience: '外部系统开发者',
    requires: '已开启 WebUI 并能拿到 Token',
  },
  data: {
    category: '数据接入',
    title: '导出与分析聊天数据',
    intent: '取统计聚合、导出聊天记录、把数据接到自己的分析管道。',
    audience: '数据分析 / 运维',
    requires: '访问权限与一点 SQL 或 HTTP 基础',
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
  model: {
    category: 'Model',
    title: 'Swap models or plug in your own service',
    intent: 'Point chat, reasoning, embeddings and ASR at your own endpoint.',
    audience: 'Model providers / operators',
    requires: 'An OpenAI-compatible or vendor-native endpoint plus a key',
  },
  mcp: {
    category: 'Tools',
    title: 'Let MaiBot call external tools',
    intent: 'Expose filesystems, databases or internal APIs as MCP tools.',
    audience: 'MCP server authors / operators',
    requires: 'An MCP server (local process or remote URL)',
  },
  api: {
    category: 'Automation',
    title: 'Read or control MaiBot from your own program',
    intent: 'Build dashboards, automation scripts and monitoring on top of MaiBot.',
    audience: 'External system developers',
    requires: 'WebUI enabled and a valid token',
  },
  data: {
    category: 'Data',
    title: 'Export and analyse chat data',
    intent: 'Pull statistics, export chat history into your own pipeline.',
    audience: 'Data / ops',
    requires: 'Access rights and basic SQL or HTTP skills',
  },
}

const order = ['adapter', 'plugin', 'model', 'mcp', 'api', 'data']

export const integrationRoutes: Record<'zh' | 'en', IntegrationRoute[]> = {
  zh: order.map((key) => ({ key, icon: icons[key], link: links[key as keyof typeof links], ...zh[key] })),
  en: order.map((key) => ({ key, icon: icons[key], link: links[key as keyof typeof links], ...en[key] })),
}

export const routeLabels: Record<'zh' | 'en', { audience: string; requires: string; cta: string }> = {
  zh: { audience: '适合', requires: '前置条件', cta: '开始接入' },
  en: { audience: 'For', requires: 'Before you start', cta: 'Get started' },
}
