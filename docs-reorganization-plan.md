# MaiBot 文档重组计划

## 概述

本计划旨在重新组织 MaiBot 文档的目录结构和侧边栏配置，以提供更佳的用户体验。新的结构将按照用户旅程组织，使文档更易于导航和理解。

## 目标

1. 创建更直观的目录结构，按照用户使用流程组织
2. 整合当前分散在多个目录中的相关内容
3. 设计清晰的侧边栏导航，反映新的组织结构
4. 确保所有现有链接在重组后仍然有效
5. 保持开发文档部分不变

## 当前结构分析

### 目录结构
- `manual/` - 用户手册（部署、配置、适配器、FAQ、其他）
- `features/` - 功能介绍和插件广场（不在侧边栏中）
- `archives/` - 归档文档（部分内容仍有价值）
- `develop/` - 开发文档（保持不变）

### 侧边栏配置
- 只有 `/manual/` 和 `/develop/` 两部分有侧边栏
- `features/` 目录内容缺失于侧边栏
- 导航菜单有"功能介绍"链接指向 `/features/index`

## 新的目录结构方案

### 基于用户旅程的组织

```
docs/
├── getting-started/          # 开始使用
│   ├── index.md
│   ├── quick-start.md
│   └── installation/         # 安装部署
│       ├── index.md
│       ├── windows.md
│       ├── linux.md
│       ├── macos.md
│       ├── docker.md
│       ├── android.md
│       ├── kubernetes.md
│       └── community/        # 社区部署方式
│           ├── 1panel.md
│           └── linux-one-key.md
├── configuration/           # 配置设置
│   ├── index.md
│   ├── basics/             # 基础配置
│   │   ├── index.md
│   │   ├── overview.md
│   │   ├── standard.md
│   │   ├── model-standard.md
│   │   └── validation.md
│   ├── advanced/           # 高级配置
│   │   ├── index.md
│   │   ├── lpmm/           # LPMM配置
│   │   │   ├── index.md
│   │   │   ├── usage.md
│   │   │   ├── compilation.md
│   │   │   └── template.md
│   │   ├── backup.md
│   │   └── settings.md
│   └── webui/              # WebUI配置
│       └── index.md
├── features/               # 功能使用
│   ├── index.md           # 功能介绍概览
│   ├── core-features/     # 核心功能
│   │   ├── index.md
│   │   ├── chat-system.md   # 聊天系统
│   │   ├── personality.md   # 个性系统
│   │   ├── expression.md    # 表达学习
│   │   ├── memory.md       # 记忆检索
│   │   └── emoji.md        # 表情包系统
│   ├── plugins/           # 插件系统
│   │   ├── index.md       # 插件广场
│   │   ├── usage.md       # 插件使用
│   │   └── development.md  # 插件开发（链接到develop）
│   └── adapters/          # 适配器
│       ├── index.md
│       ├── napcat.md
│       ├── gocq.md
│       └── tts/
│           ├── index.md
│           ├── gpt-sovits.md
│           ├── doubao.md
│           └── qwen-omni.md
├── troubleshooting/       # 问题解决
│   ├── index.md          # FAQ概览
│   ├── faq/              # 常见问题
│   │   ├── index.md
│   │   └── ...（具体问题分类）
│   ├── smart-question-guide.md  # 如何高效提问
│   └── community/        # 社区支持
│       ├── qq-group.md
│       └── feedback.md
├── reference/            # 参考资源
│   ├── index.md
│   ├── changelog.md      # 更新日志
│   ├── eula.md           # 最终用户许可协议
│   └── sitemap.md        # 文档地图
├── develop/              # 开发文档（保持不变）
│   ├── index.md
│   ├── develop_standard.md
│   ├── adapter_develop/
│   ├── plugin_develop/
│   ├── maim_message/
│   └── guide/
└── archives/             # 归档文档（保留但隐藏）
    ├── index.md
    ├── deployment/
    └── features/
```

## 文件移动映射表

### 从 manual/ 移动的文件

| 原路径 | 新路径 | 操作说明 |
|--------|--------|----------|
| `manual/deployment/index.md` | `getting-started/installation/index.md` | 重命名并更新内容 |
| `manual/deployment/mmc_deploy_windows.md` | `getting-started/installation/windows.md` | 简化文件名 |
| `manual/deployment/mmc_deploy_linux.md` | `getting-started/installation/linux.md` | 简化文件名 |
| `manual/deployment/mmc_deploy_macos.md` | `getting-started/installation/macos.md` | 简化文件名 |
| `manual/deployment/mmc_deploy_docker.md` | `getting-started/installation/docker.md` | 简化文件名 |
| `manual/deployment/mmc_deploy_android.md` | `getting-started/installation/android.md` | 简化文件名 |
| `manual/deployment/mmc_deploy_kubernetes.md` | `getting-started/installation/kubernetes.md` | 简化文件名 |
| `manual/deployment/community/1panel.md` | `getting-started/installation/community/1panel.md` | 保持相同 |
| `manual/deployment/community/linux_one_key.md` | `getting-started/installation/community/linux-one-key.md` | 标准化文件名 |
| `manual/deployment/unified_installation.md` | `getting-started/quick-start.md` | 作为快速入门指南 |
| `manual/configuration/index.md` | `configuration/basics/index.md` | 调整位置 |
| `manual/configuration/configuration_overview.md` | `configuration/basics/overview.md` | 简化文件名 |
| `manual/configuration/configuration_standard.md` | `configuration/basics/standard.md` | 简化文件名 |
| `manual/configuration/configuration_model_standard.md` | `configuration/basics/model-standard.md` | 简化文件名 |
| `manual/configuration/configuration_validation.md` | `configuration/basics/validation.md` | 简化文件名 |
| `manual/configuration/lpmm/lpmm.md` | `configuration/advanced/lpmm/usage.md` | 调整位置和文件名 |
| `manual/configuration/lpmm/lpmm_compile_and_install.md` | `configuration/advanced/lpmm/compilation.md` | 调整位置和文件名 |
| `manual/configuration/lpmm/lpmm_knowledge_template.md` | `configuration/advanced/lpmm/template.md` | 调整位置和文件名 |
| `manual/configuration/backup.md` | `configuration/advanced/backup.md` | 保持相同 |
| `manual/configuration/settings.md` | `configuration/advanced/settings.md` | 保持相同 |
| `manual/configuration/config_windows_onekey_withwebui.md` | `configuration/webui/index.md` | 调整位置和文件名 |
| `manual/adapters/index.md` | `features/adapters/index.md` | 调整位置 |
| `manual/adapters/napcat.md` | `features/adapters/napcat.md` | 调整位置 |
| `manual/adapters/gocq.md` | `features/adapters/gocq.md` | 调整位置 |
| `manual/adapters/tts/index.md` | `features/adapters/tts/index.md` | 调整位置 |
| `manual/adapters/tts/gpt_sovits.md` | `features/adapters/tts/gpt-sovits.md` | 调整位置和文件名 |
| `manual/adapters/tts/doubao_tts.md` | `features/adapters/tts/doubao.md` | 调整位置和文件名 |
| `manual/adapters/tts/qwen_omni.md` | `features/adapters/tts/qwen-omni.md` | 调整位置和文件名 |
| `manual/faq/index.md` | `troubleshooting/faq/index.md` | 调整位置 |
| `manual/other/smart-question-guide.md` | `troubleshooting/smart-question-guide.md` | 调整位置 |
| `manual/other/qq_group.md` | `troubleshooting/community/qq-group.md` | 调整位置 |
| `manual/other/EULA.md` | `reference/eula.md` | 调整位置 |
| `manual/other/changelog.md` | `reference/changelog.md` | 调整位置 |

### 从 features/ 移动的文件

| 原路径 | 新路径 | 操作说明 |
|--------|--------|----------|
| `features/index.md` | `features/index.md` | 保持不变，但可能需要更新内容 |
| `features/plugins.md` | `features/plugins/index.md` | 重命名为 index.md |

### 从 archives/ 移动的文件

| 原路径 | 新路径 | 操作说明 |
|--------|--------|----------|
| `archives/features/chat.md` | `features/core-features/chat-system.md` | 调整位置和文件名 |
| `archives/features/personality.md` | `features/core-features/personality.md` | 调整位置 |
| `archives/features/expression.md` | `features/core-features/expression.md` | 调整位置 |
| `archives/features/memory_retrieval.md` | `features/core-features/memory.md` | 调整位置和文件名 |
| `archives/features/emoji.md` | `features/core-features/emoji.md` | 调整位置 |
| `archives/lpmm.md` | `configuration/advanced/lpmm/index.md` | 作为LPMM概览 |

### 需要创建的新文件

1. `getting-started/index.md` - 开始使用概览
2. `configuration/index.md` - 配置指南概览
3. `features/core-features/index.md` - 核心功能概览
4. `troubleshooting/index.md` - 问题解决概览
5. `reference/index.md` - 参考资源概览
6. `features/plugins/usage.md` - 插件使用指南（从 plugins.md 拆分）
7. `features/plugins/development.md` - 插件开发指南（链接到 develop）

## 侧边栏组织方案

### 新的侧边栏配置结构

```typescript
sidebar: {
  // 开始使用侧边栏
  '/getting-started/': [
    {
      text: '开始使用',
      collapsed: false,
      items: [
        { text: '快速入门', link: '/getting-started/quick-start' },
        { text: '安装部署', link: '/getting-started/installation/' },
        { text: 'Windows部署', link: '/getting-started/installation/windows' },
        { text: 'Linux部署', link: '/getting-started/installation/linux' },
        { text: 'macOS部署', link: '/getting-started/installation/macos' },
        { text: 'Docker部署', link: '/getting-started/installation/docker' },
        { text: '其他部署方式',
          collapsed: true,
          items: [
            { text: 'Android部署', link: '/getting-started/installation/android' },
            { text: 'Kubernetes部署', link: '/getting-started/installation/kubernetes' },
            { text: '1Panel部署(社区)', link: '/getting-started/installation/community/1panel' },
            { text: 'Linux一键部署(社区)', link: '/getting-started/installation/community/linux-one-key' },
          ]
        }
      ]
    }
  ],

  // 配置指南侧边栏
  '/configuration/': [
    {
      text: '配置指南',
      collapsed: false,
      items: [
        { text: '配置概览', link: '/configuration/' },
        { text: '基础配置', link: '/configuration/basics/' },
        { text: '配置标准', link: '/configuration/basics/standard' },
        { text: '模型配置', link: '/configuration/basics/model-standard' },
        { text: '配置验证', link: '/configuration/basics/validation' },
        { text: '高级配置', link: '/configuration/advanced/' },
        { text: 'LPMM配置',
          collapsed: true,
          items: [
            { text: '使用说明', link: '/configuration/advanced/lpmm/usage' },
            { text: '手动编译', link: '/configuration/advanced/lpmm/compilation' },
            { text: '导入模板', link: '/configuration/advanced/lpmm/template' },
          ]
        },
        { text: '备份配置', link: '/configuration/advanced/backup' },
        { text: '设置详解', link: '/configuration/advanced/settings' },
        { text: 'WebUI配置', link: '/configuration/webui/' },
      ]
    }
  ],

  // 功能详解侧边栏
  '/features/': [
    {
      text: '功能详解',
      collapsed: false,
      items: [
        { text: '功能概览', link: '/features/' },
        { text: '核心功能', link: '/features/core-features/' },
        { text: '聊天系统', link: '/features/core-features/chat-system' },
        { text: '个性系统', link: '/features/core-features/personality' },
        { text: '表达学习', link: '/features/core-features/expression' },
        { text: '记忆检索', link: '/features/core-features/memory' },
        { text: '表情包系统', link: '/features/core-features/emoji' },
        { text: '插件系统', link: '/features/plugins/' },
        { text: '插件使用', link: '/features/plugins/usage' },
        { text: '插件开发', link: '/develop/plugin_develop/' },
        { text: '适配器', link: '/features/adapters/' },
        { text: 'Napcat适配器', link: '/features/adapters/napcat' },
        { text: 'GO-CQ适配器', link: '/features/adapters/gocq' },
        { text: 'TTS适配器',
          collapsed: true,
          items: [
            { text: 'TTS介绍', link: '/features/adapters/tts/' },
            { text: 'GPT-Sovits TTS', link: '/features/adapters/tts/gpt-sovits' },
            { text: '豆包TTS', link: '/features/adapters/tts/doubao' },
            { text: '千问Omni TTS', link: '/features/adapters/tts/qwen-omni' },
          ]
        },
      ]
    }
  ],

  // 问题解决侧边栏
  '/troubleshooting/': [
    {
      text: '问题解决',
      collapsed: false,
      items: [
        { text: '问题解决概览', link: '/troubleshooting/' },
        { text: '常见问题 (FAQ)', link: '/troubleshooting/faq/' },
        { text: '如何高效提问', link: '/troubleshooting/smart-question-guide' },
        { text: '社区支持',
          collapsed: true,
          items: [
            { text: '官方QQ群', link: '/troubleshooting/community/qq-group' },
            { text: '意见反馈', link: 'https://docs.qq.com/form/page/DWGxycXdKWG9PS1NH' },
          ]
        },
      ]
    }
  ],

  // 参考资源侧边栏
  '/reference/': [
    {
      text: '参考资源',
      collapsed: false,
      items: [
        { text: '参考资源概览', link: '/reference/' },
        { text: '更新日志', link: '/reference/changelog' },
        { text: '最终用户许可协议', link: '/reference/eula' },
        { text: '文档地图', link: '/reference/sitemap' },
      ]
    }
  ],

  // 开发文档侧边栏（保持不变）
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
  ]
}
```

### 新的导航栏配置

```typescript
nav: [
  { text: '首页', link: '/' },
  { text: '开始使用', link: '/getting-started/' },
  { text: '配置指南', link: '/configuration/' },
  { text: '功能详解', link: '/features/' },
  { text: '问题解决', link: '/troubleshooting/' },
  { text: '开发文档', link: '/develop/' },
  { text: '参考资源', link: '/reference/' },
  {
    text: '社区支持',
    items: [
      { text: '官方QQ群', link: '/troubleshooting/community/qq-group' },
      { text: '意见反馈', link: 'https://docs.qq.com/form/page/DWGxycXdKWG9PS1NH' },
    ]
  },
  {
    text: 'GitHub',
    items: [
      { text: 'MaiBot 仓库', link: 'https://github.com/MaiM-with-u/MaiBot' },
      { text: '文档仓库', link: 'https://github.com/MaiM-with-u/docs' },
    ]
  },
]
```

## 实施步骤

### 阶段一：准备阶段
1. 创建备份目录：`cp -r docs docs-backup-$(date +%Y%m%d)`
2. 创建新目录结构
3. 分析所有内部链接，创建链接映射表

### 阶段二：文件移动和重命名
1. 按照文件映射表移动文件
2. 重命名文件以遵循新命名约定
3. 更新移动文件中的YAML frontmatter（如需要）

### 阶段三：链接更新
1. 使用脚本或工具更新所有内部链接
2. 特别注意：
   - 相对链接 (`./file.md`)
   - 绝对链接 (`/manual/deployment/`)
   - 导航链接
3. 更新 `features/index.md` 中的卡片链接

### 阶段四：创建新内容
1. 创建新的索引页面：
   - `getting-started/index.md`
   - `configuration/index.md`
   - `features/core-features/index.md`
   - `troubleshooting/index.md`
   - `reference/index.md`
2. 拆分 `features/plugins.md` 为 `index.md` 和 `usage.md`
3. 创建 `features/plugins/development.md`（重定向到开发文档）

### 阶段五：配置更新
1. 更新 `.vitepress/config.mts`：
   - 更新侧边栏配置
   - 更新导航栏配置
2. 验证配置语法正确性

### 阶段六：验证
1. 运行本地开发服务器：`pnpm docs:dev`
2. 检查所有页面是否正常加载
3. 验证所有内部链接是否有效
4. 测试导航栏和侧边栏功能
5. 运行构建测试：`pnpm docs:build`

### 阶段七：清理
1. 删除空的旧目录
2. 更新 `archives/index.md` 说明文档已重组
3. 考虑添加重定向（如需要）

## 向后兼容性考虑

### 重定向策略
1. **选项A：不设置重定向** - 假设所有用户都从导航访问文档
2. **选项B：使用VitePress重定向** - 在 `_redirects` 文件中设置
3. **选项C：创建重定向页面** - 在每个旧位置创建重定向页面

建议采用选项A，因为：
- 大多数用户通过导航访问文档
- 外部链接可能较少
- 简化维护负担

### 外部链接处理
1. 如果存在重要的外部链接，考虑在旧位置保留重定向
2. 可以在 `archives/` 中保留一份说明文档结构已更改的说明

## 验证清单

### 预实施检查
- [ ] 备份完整文档目录
- [ ] 确认所有文件映射正确
- [ ] 准备链接更新脚本
- [ ] 测试VitePress构建过程

### 实施后验证
- [ ] 所有页面可访问
- [ ] 侧边栏导航正常工作
- [ ] 导航栏链接正确
- [ ] 内部链接无404错误
- [ ] 搜索功能正常工作
- [ ] 构建过程无错误
- [ ] 移动设备显示正常

## 风险与缓解

### 风险1：链接断裂
- **缓解**：仔细更新所有内部链接，使用自动化脚本

### 风险2：配置错误
- **缓解**：在测试环境中验证配置，逐步更新

### 风险3：用户困惑
- **缓解**：在首页添加公告，说明文档结构已更新

## 后续工作建议

1. **内容更新**：在重组后审查和更新过时内容
2. **搜索优化**：确保新结构下搜索功能最佳
3. **用户反馈**：收集用户对新结构的反馈
4. **持续改进**：根据使用数据优化结构

## 总结

本重组计划将 MaiBot 文档从按技术分类的结构转变为按用户旅程组织的结构，预计将显著改善用户体验。新结构更符合用户的学习路径，使文档更易于导航和理解。

实施此计划需要仔细执行文件移动、链接更新和配置更改，但最终将创建一个更现代化、更用户友好的文档系统。