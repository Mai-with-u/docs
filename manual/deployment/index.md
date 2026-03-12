---
title: MaiBot部署指南
description: MaiBot多平台部署方法：Windows、Linux、macOS、Docker等安装教程
keywords: [MaiBot, 部署, 安装, Windows, Linux, macOS, Docker, 安装指南]
---

# 📦 MaiBot 部署指南

## 🎯 选择你的部署方式

我们提供了多种部署方式，请根据你的需求选择：

### 🚀 **推荐：统一安装指南（新用户首选）**

**统一安装指南** 是一个跨平台的完整安装教程，包含了 Windows、Linux、macOS 的所有安装步骤。它提供了：

- **跨平台支持**：一个指南覆盖所有主流操作系统
- **详细步骤**：从环境配置到运行测试的完整流程
- **故障排除**：针对各平台的常见问题解决方案
- **最佳实践**：推荐使用 uv 包管理器，提升安装体验

👉 **[开始使用统一安装指南](unified_installation)**

### 🖥️ **平台独立文档（特定需求备用）**

如果你需要针对特定平台的详细文档，或者遇到平台特有的问题，可以参考以下独立文档：

| 平台 | 适用场景 | 文档链接 |
|------|----------|----------|
| **Windows** | Windows 10/11 用户，个人电脑部署 | [Windows 部署指南](mmc_deploy_windows) |
| **Linux** | 服务器部署，追求性能和稳定性 | [Linux 部署指南](mmc_deploy_linux) |
| **macOS** | Mac 用户，支持 M1/M2 芯片 | [macOS 部署指南](mmc_deploy_macos) |

### 🐳 **容器化部署**

| 部署方式 | 特点 | 文档链接 |
|----------|------|----------|
| **Docker** | 容器化部署，环境一致性 | [Docker 部署指南](mmc_deploy_docker) |
| **Kubernetes** | 集群部署，Helm Chart | [Kubernetes 部署指南](mmc_deploy_kubernetes) |

### 📱 **移动端部署**

| 平台 | 特点 | 文档链接 |
|------|------|----------|
| **Android** | 通过 ZeroTermux 在移动设备运行 | [Android 部署指南](mmc_deploy_android) |

### 👥 **社区方案**

| 方案 | 特点 | 作者 | 文档链接 |
|------|------|------|----------|
| **1Panel 部署** | 通过 1Panel 面板快速部署 | 梦归云帆 | [1Panel 部署指南](community/1panel) |
| **Linux 一键脚本** | 自动化脚本简化部署流程 | Astriora | [Linux 一键脚本部署指南](community/linux_one_key) |

## 📋 部署前准备

### 你必须要准备好的

1. **电脑一台**：Windows/Linux/Mac 任意
2. **一个QQ小号**（请自行了解QQ机器人风险）（你也可以使用微信适配器或者桌宠适配器，但可能更新不及时）
3. **AI大模型的可以使用的API Key**

### 一键包安装

你可以在[麦麦QQ交流群](/manual/other/qq_group)群文件获取到最新版本的一键安装包。

## 🆘 故障排除

如果你在部署过程中遇到问题，可以：

1. 参考 [常见问题](/manual/faq/) 中的常见问题
2. 查看项目的 GitHub Issues
3. 加入[麦麦QQ交流群](/manual/other/qq_group)获取帮助

> **配置相关故障**：如果部署成功后遇到配置问题，请参阅 [配置文档](/manual/configuration/) 获取详细帮助。

## 💡 使用建议

- **新用户**：建议从 **[统一安装指南](unified_installation)** 开始，它提供了最完整的安装流程
- **特定平台用户**：如果遇到平台特有的问题，可以参考对应的平台独立文档
- **服务器部署**：Linux 用户可以考虑使用 Docker 或社区的一键脚本方案
- **快速体验**：可以尝试一键包安装或社区方案快速上手
