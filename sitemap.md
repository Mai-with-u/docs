---
layout: doc
title: 文档地图
description: MaiBot文档完整结构概览和搜索指南
---

# 📚 文档地图

欢迎使用MaiBot文档地图！本页面提供了完整的文档结构概览，帮助您快速找到所需内容。

## 🗺️ 文档结构概览

### 1. 首页 (`/`)
- **目的**: 项目概览和快速入口
- **主要内容**: 项目介绍、核心特性、快速开始按钮
- **关键链接**: 功能介绍、用户手册、开发文档

### 2. 功能介绍 (`/features/`)
- **目的**: 详细介绍MaiBot的核心功能和设计理念
- **主要内容**:
  - 拟人化AI聊天机器人介绍
  - 设计理念和核心特色
  - 智能对话能力
  - 情感与个性系统
  - 记忆与学习能力
  - 社交互动特性
  - 技术架构详解
  - 功能对比表格
  - 插件系统介绍 (`/features/plugins`)

### 3. 用户手册 (`/manual/`)
- **目的**: 用户安装、配置和使用指南

#### 3.1 安装方法
- **快速入门** (`/manual/deployment/`): 部署概览
- **平台部署**:
  - Windows部署 (`/manual/deployment/mmc_deploy_windows`)
  - Linux部署 (`/manual/deployment/mmc_deploy_linux`)
  - macOS部署 (`/manual/deployment/mmc_deploy_macos`)
  - Docker部署 (`/manual/deployment/mmc_deploy_docker`)
- **其他部署方式**:
  - Android部署 (`/manual/deployment/mmc_deploy_android`)
  - Kubernetes部署 (`/manual/deployment/mmc_deploy_kubernetes`)
  - 1Panel部署(社区) (`/manual/deployment/community/1panel`)
  - Linux一键部署(社区) (`/manual/deployment/community/linux_one_key`)

#### 3.2 配置详解
- **快速入门** (`/manual/configuration/`): 配置概览
- **配置指南**:
  - 关于配置指南 (`/manual/configuration/configuration_standard`)
  - 关于模型配置 (`/manual/configuration/configuration_model_standard`)
  - WebUI配置指南 (`/manual/configuration/config_windows_onekey_withwebui`)
- **LPMM系统**:
  - 使用说明 (`/manual/configuration/lpmm/lpmm`)
  - 手动编译说明 (`/manual/configuration/lpmm/lpmm_compile_and_install`)
  - 导入文件格式 (`/manual/configuration/lpmm/lpmm_knowledge_template`)
- **数据备份** (`/manual/configuration/backup`)

#### 3.3 适配器列表
- **适配器中心** (`/manual/adapters`): 所有适配器概览
- **主要适配器**:
  - MaiBot Napcat Adapter (`/manual/adapters/napcat`)
  - GO-CQ Adapter (`/manual/adapters/gocq`)
- **TTS适配器** (`/manual/adapters/tts/`):
  - GPT_Sovits TTS (`/manual/adapters/tts/gpt_sovits`)
  - 豆包 TTS (`/manual/adapters/tts/doubao_tts`)
  - 千问Omni TTS (`/manual/adapters/tts/qwen_omni`)

#### 3.4 常见问题
- **FAQ概览** (`/manual/faq/`): 常见问题解答

#### 3.5 参考资源
- **高效提问** (`/manual/other/smart-question-guide`): 如何有效提问
- **官方Q群** (`/manual/other/qq_group`): 加入用户交流群
- **最终用户许可协议** (`/manual/other/EULA`): 使用条款和条件
- **更新日志** (`/manual/other/changelog`): 版本更新记录

### 4. 开发文档 (`/develop/`)
- **目的**: 开发者指南和API参考

#### 4.1 开发文档中心 (`/develop/`)
- 插件和适配器开发概览
- 开发资源和规范

#### 4.2 适配器开发
- **开发综述** (`/develop/adapter_develop/`): 适配器开发概览
- **Adapter开发指南** (`/develop/adapter_develop/develop_adapter`): 详细开发指南

#### 4.3 插件开发
- **开发指南** (`/develop/plugin_develop/`): 插件开发概览
- **快速开始** (`/develop/plugin_develop/quick-start`): 插件开发入门
- **核心系统**:
  - Manifest系统指南 (`/develop/plugin_develop/manifest-guide`)
  - Actions系统 (`/develop/plugin_develop/action-components`)
  - 命令处理系统 (`/develop/plugin_develop/command-components`)
  - 工具系统 (`/develop/plugin_develop/tool-components`)
  - 配置管理指南 (`/develop/plugin_develop/configuration-guide`)
  - 依赖管理 (`/develop/plugin_develop/dependency-management`)
  - WebUI集成 (`/develop/plugin_develop/plugin-config-schema`)
- **API参考**:
  - 发送API (`/develop/plugin_develop/api/send-api`)
  - 消息API (`/develop/plugin_develop/api/message-api`)
  - 聊天流API (`/develop/plugin_develop/api/chat-api`)
  - LLM API (`/develop/plugin_develop/api/llm-api`)
  - 回复生成器API (`/develop/plugin_develop/api/generator-api`)
  - 表情包API (`/develop/plugin_develop/api/emoji-api`)
  - 人物信息API (`/develop/plugin_develop/api/person-api`)
  - 数据库API (`/develop/plugin_develop/api/database-api`)
  - 配置API (`/develop/plugin_develop/api/config-api`)
  - 插件API (`/develop/plugin_develop/api/plugin-manage-api`)
  - 组件API (`/develop/plugin_develop/api/component-manage-api`)
  - 日志API (`/develop/plugin_develop/api/logging-api`)
  - 工具API (`/develop/plugin_develop/api/tool-api`)

#### 4.4 Maim_Message参考
- **概述** (`/develop/maim_message/`): 消息系统概览
- **核心组件**:
  - Message_Base (`/develop/maim_message/message_base`)
  - Router (`/develop/maim_message/router`)
  - 命令参数表 (`/develop/maim_message/command_args`)

#### 4.5 开发规范
- **开发者与代码规范** (`/develop/develop_standard`): 开发规范和最佳实践

### 5. 归档文档 (`/archives/`)
- **目的**: 历史版本和过时文档
- **注意**: 这些文档可能已过时，建议优先查看最新文档

## 🔍 搜索优化指南

### 常用搜索关键词
- **安装相关**: `安装`, `部署`, `Windows`, `Linux`, `Docker`, `配置`
- **功能相关**: `插件`, `适配器`, `TTS`, `API`, `开发`, `调试`
- **问题解决**: `FAQ`, `错误`, `故障`, `问题`, `解决`
- **配置相关**: `模型`, `LPMM`, `备份`, `WebUI`, `设置`

### 搜索技巧
1. **使用具体关键词**: 如"Windows部署"而非"怎么安装"
2. **结合分类搜索**: 如"插件开发API"或"适配器配置"
3. **利用文档结构**: 先确定文档类别，再使用搜索
4. **查看相关链接**: 搜索结果页面会显示相关文档链接

### 快速查找路径
- **新用户**: 首页 → 用户手册 → 安装方法 → 选择平台
- **配置用户**: 用户手册 → 配置详解 → 相关配置指南
- **开发者**: 开发文档 → 选择开发类型(插件/适配器) → API参考
- **问题解决**: 用户手册 → 常见问题 → 搜索具体问题

## 🎯 用户角色指南

### 新用户
1. 阅读**功能介绍**了解MaiBot特性
2. 查看**用户手册**中的安装方法
3. 根据平台选择具体部署指南
4. 配置基础设置后开始使用

### 进阶用户
1. 探索**插件系统**扩展功能
2. 学习**配置详解**优化设置
3. 查看**适配器列表**连接更多平台
4. 使用**数据备份**保护配置

### 开发者
1. 阅读**开发文档中心**概览
2. 选择开发类型(插件/适配器)
3. 查看对应API参考和开发指南
4. 遵循**开发规范**提交代码

### 问题解决者
1. 首先查看**常见问题**(FAQ)
2. 使用搜索功能查找具体问题
3. 查看相关配置文档
4. 如未解决，参考**高效提问指南**寻求帮助

## 📊 文档统计
- **总页面数**: 50+ 个文档页面
- **主要分类**: 4个(首页、功能、用户、开发)
- **更新频率**: 定期更新，关注更新日志
- **支持语言**: 中文

## 🔗 重要链接
- [GitHub仓库](https://github.com/MaiM-with-u/MaiBot)
- [问题反馈](https://github.com/MaiM-with-u/MaiBot/issues)
- [社区讨论](https://github.com/MaiM-with-u/MaiBot/discussions)
- [官方Q群](/manual/other/qq_group)

---

*最后更新: 2026年3月10日*  
*使用本文档地图可以快速定位到您需要的文档内容。如有建议或发现问题，欢迎通过GitHub提交反馈。*