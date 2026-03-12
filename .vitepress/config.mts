import { defineConfig } from 'vitepress'
import { MermaidPlugin, MermaidMarkdown } from "vitepress-plugin-mermaid";
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MaiBot 文档中心",
  description: "MaiBot 开发与使用指南",
  head: [
    ['link', { rel: 'icon', href: '/title_img/mai2.png' }]
  ],
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          'zh-CN': {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除搜索条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        },
        detailedView: true,
        miniSearch: {
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: {
              title: 2,
              description: 1.5,
              content: 1
            }
          }
        }
      }
    },
    editLink: {
      pattern: "https://github.com/Mai-with-u/docs/edit/main/:path",
      text: "在 GitHub 上编辑此页"
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '功能介绍',link: '/features/index'},
      { text: '用户手册', link: '/manual/' },
      { text: '开发文档', link: '/develop/' },
      { text: '文档地图', link: '/sitemap' },
      {text: '官方Q群', link:'/manual/other/qq_group'},
      {text: '意见反馈', link:'https://docs.qq.com/form/page/DWGxycXdKWG9PS1NH'},
      {
        text: 'GitHub', 
        items: [
          { text: 'MaiBot', link: 'https://github.com/MaiM-with-u/MaiBot' },
          { text: 'MaiBot Docs', link: 'https://github.com/MaiM-with-u/docs' },
        ]
      },
    ],
    outline: [1, 4],
    sidebar: {
      '/manual/': [
        {
          text: '安装方法',
          collapsed: false,
          items: [
            { text: '快速入门', link: '/manual/deployment/' },
            { text: 'Windows部署', link: '/manual/deployment/mmc_deploy_windows' },
            { text: 'Linux部署', link: '/manual/deployment/mmc_deploy_linux' },
            { text: 'macOS部署', link: '/manual/deployment/mmc_deploy_macos' },
            { text: 'Docker部署', link: '/manual/deployment/mmc_deploy_docker' },
            { text: '其他部署方式', 
              collapsed: true, 
              items: [
                { text: 'Android部署', link: '/manual/deployment/mmc_deploy_android' },
                { text: 'Kubernetes部署', link: '/manual/deployment/mmc_deploy_kubernetes' },
                { text: '1Panel 部署(社区)', link: '/manual/deployment/community/1panel' },
                { text: 'Linux一键部署(社区)', link: '/manual/deployment/community/linux_one_key' },
              ],
            },
          ]
        },
        {
          text: '配置详解',
          collapsed: false,
          items: [
            { text: '快速入门', link: '/manual/configuration/' },
            { text: '关于配置指南', link: '/manual/configuration/configuration_standard' },
            { text: '关于模型配置', link: '/manual/configuration/configuration_model_standard' },
            { text: 'WebUI配置指南', link: '/manual/configuration/config_windows_onekey_withwebui'},
            { text: '关于LPMM', 
              collapsed: true, 
              items: [
                { text: '使用说明', link: '/manual/configuration/lpmm/lpmm' },
                { text: '手动编译说明', link: '/manual/configuration/lpmm/lpmm_compile_and_install'},
                { text: '导入文件格式', link: '/manual/configuration/lpmm/lpmm_knowledge_template' },
              ]
            },
            { text: '关于备份', link: '/manual/configuration/backup' },
          ]
        },
        {
          text: '适配器列表',
          collapsed: false,
          items: [
            { text: 'Adapters 文档中心', link: '/manual/adapters' },
            { text: 'MaiBot Napcat Adapter', link: '/manual/adapters/napcat' },
            { text: 'GO-CQ Adapter', link: '/manual/adapters/gocq' },
            {
              text: 'MaiBot TTS Adapter', 
              collapsed: true, 
              items: [
                { text: '基本介绍', link: '/manual/adapters/tts/' },
                { text: 'GPT_Sovits TTS', link: '/manual/adapters/tts/gpt_sovits' },
                { text: '豆包 TTS', link: '/manual/adapters/tts/doubao_tts' },
                { text: '千问Omni TTS', link: '/manual/adapters/tts/qwen_omni' },
              ]
            },
          ]
        },
        {
          text: '常见问题',
          collapsed: false,
          items: [
            { text: 'FAQ 概览', link: '/manual/faq/' },
          ]
        },
        {
          text: '参考资源',
          collapsed: false,
          items: [
            { text: '如何高效提问', link: '/manual/other/smart-question-guide' },
            { text: '官方Q群', link: '/manual/other/qq_group' },
            { text: '最终用户许可协议', link: '/manual/other/EULA' },
          ]
        },
        { text: '更新日志', link: '/manual/other/changelog' },
      ],
 
       '/features/': [
        {
          text: '功能介绍',
          items: [
            { text: '功能介绍', link: '/features/' },
            { text: '插件广场', link: '/features/plugins' },
          ]
        },
      ],

      '/develop/': [
        {
          text: '开发文档',
          items: [
            { text: '介绍', link: '/develop/' },
            { text: '开发者与代码规范', link: '/develop/develop_standard' },
          ]
        },
        {
          text: '适配器开发',
          collapsed: false,
          items: [
            { text: '开发综述', link: '/develop/adapter_develop/' },
            { text: 'Adapter 开发指南', link: '/develop/adapter_develop/develop_adapter' },
          ]
        },
        {
          text: '插件开发',
          collapsed: false,
          items: [
            { text: '开发指南', link: '/develop/plugin_develop/' },
            { text: '快速开始', link: '/develop/plugin_develop/quick-start'},
            { text: 'Manifest系统指南', link: '/develop/plugin_develop/manifest-guide' },
            { text: 'Actions系统', link: '/develop/plugin_develop/action-components' },
            { text: '命令处理系统', link: '/develop/plugin_develop/command-components' },
            { text: '工具系统', link: '/develop/plugin_develop/tool-components' },
            { text: '配置管理指南', link: '/develop/plugin_develop/configuration-guide' },
            { text: '依赖管理', link: '/develop/plugin_develop/dependency-management' },
            { text: 'WebUI集成', link: '/develop/plugin_develop/plugin-config-schema' },
            { text: 'API参考',
              collapsed: true,
              items: [
                { text: '发送API', link: '/develop/plugin_develop/api/send-api' },
                { text: '消息API', link: '/develop/plugin_develop/api/message-api' },
                { text: '聊天流API', link: '/develop/plugin_develop/api/chat-api' },
                { text: 'LLM API', link: '/develop/plugin_develop/api/llm-api' },
                { text: '回复生成器API', link: '/develop/plugin_develop/api/generator-api' },
                { text: '表情包API', link: '/develop/plugin_develop/api/emoji-api' },
                { text: '人物信息API', link: '/develop/plugin_develop/api/person-api' },
                { text: '数据库API', link: '/develop/plugin_develop/api/database-api' },
                { text: '配置API', link: '/develop/plugin_develop/api/config-api' },
                { text: '插件API', link: '/develop/plugin_develop/api/plugin-manage-api' },
                { text: '组件API', link: '/develop/plugin_develop/api/component-manage-api' },
                { text: '日志API', link: '/develop/plugin_develop/api/logging-api' },
                { text: '工具API', link: '/develop/plugin_develop/api/tool-api'}
              ]
            },

          ]
        },
        {
          text: 'Maim_Message参考',
          collapsed: false,
          items: [
            { text: 'Maim_Message 概述', link: '/develop/maim_message/' },
            { text: 'Message_Base', link: '/develop/maim_message/message_base' },
            { text: 'Router', link: '/develop/maim_message/router' },
            { text: '命令参数表', link: '/develop/maim_message/command_args'}
          ]
        }
        // {
        //   text: '开发指南',
        //   collapsed: false,
        //   items: [
        //     { text: 'AI辅助开发', link: '/develop/guide/ai-instruction' }
        //   ]
        // }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/MaiM-with-u/MaiBot' },
      { icon: 'x', link: 'https://x.com/MaiWithYou' },
      { icon: 'discord', link: 'https://discord.gg/UvgPVSVX' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>'
        },
        link: 'https://t.me/MaiWithYou'
      }
    ],

    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
      },
    },
  },
  markdown: {
    config(md) {
      md.use(MermaidMarkdown);
      md.use(tabsMarkdownPlugin);
    },
  },
  vite: {
    plugins: [MermaidPlugin()],
    optimizeDeps: {
      include: ['mermaid'],
    },
    ssr: {
      noExternal: ['mermaid'],
    },
  },
})
