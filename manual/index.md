---
title: MaiBot用户手册
description: 完整的MaiBot安装、配置、使用和故障排除指南
keywords: [MaiBot, 用户手册, 安装, 部署, 配置, 适配器, 插件, FAQ, 故障排除]
---

# MaiBot 手册

<style>
.doc-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.doc-card {
  background: linear-gradient(135deg, var(--card-start) 0%, var(--card-end) 100%);
  border-radius: 15px;
  padding: 20px;
  color: white !important;
  text-decoration: none !important;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}

.doc-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--card-end) 0%, var(--card-start) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.doc-card:hover::before {
  opacity: 1;
}

.doc-card-content {
  position: relative;
  z-index: 2;
}

.doc-card a {
  text-decoration: none !important;
  color: inherit !important;
}

.doc-card h3 {
  margin: 0 0 12px 0;
  font-size: 1.3em;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-card p {
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
  color: white;
  font-size: 0.95em;
}

/* Card color categories */
.card-getting-started {
  --card-start: #4f46e5;
  --card-end: #7c3aed;
}

.card-core-features {
  --card-start: #059669;
  --card-end: #10b981;
}

.card-help-support {
  --card-start: #dc2626;
  --card-end: #ef4444;
}

.card-legal-other {
  --card-start: #7c3aed;
  --card-end: #9333ea;
}

.section-title {
  font-size: 1.8em;
  margin: 40px 0 20px 0;
  color: #333;
  border-bottom: 3px solid;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-getting-started {
  border-color: #4f46e5;
}

.section-core-features {
  border-color: #059669;
}

.section-help-support {
  border-color: #dc2626;
}

.section-legal-other {
  border-color: #7c3aed;
}

.avatar-section {
  text-align: center;
  margin: 40px 0;
}

.avatar-section img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
}

.avatar-section img:hover {
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .doc-cards {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px;
  }
  
  .doc-card {
    padding: 18px;
  }
  
  .section-title {
    font-size: 1.6em;
  }
}

@media (max-width: 480px) {
  .doc-cards {
    grid-template-columns: 1fr;
  }
}
</style>

## 🚀 快速开始

<div class="doc-cards">
  <a href="/manual/deployment/" class="doc-card card-getting-started">
    <div class="doc-card-content">
      <h3>📦 如何安装麦麦</h3>
      <p>从零开始安装 MaiBot 的完整教程，包含多种部署方式</p>
    </div>
  </a>
  
  <a href="/manual/adapters/" class="doc-card card-getting-started">
    <div class="doc-card-content">
      <h3>🔗 适配器配置</h3>
      <p>连接 MaiBot 到 QQ、微信等聊天平台</p>
    </div>
  </a>
</div>

## ⚡ 核心功能

<div class="doc-cards">
  <a href="/features/plugins" class="doc-card card-core-features">
    <div class="doc-card-content">
      <h3>🔌 插件系统</h3>
      <p>获取、安装和管理各种功能插件，扩展 MaiBot 能力</p>
    </div>
  </a>
  
  <a href="/manual/configuration/" class="doc-card card-core-features">
    <div class="doc-card-content">
      <h3>⚙️ 设置详解</h3>
      <p>深入了解 MaiBot 的所有配置选项和参数</p>
    </div>
  </a>
  
  <a href="/manual/configuration/backup" class="doc-card card-core-features">
    <div class="doc-card-content">
      <h3>💾 数据备份</h3>
      <p>安全备份和恢复你的 MaiBot 数据和配置</p>
    </div>
  </a>
</div>

## ❓ 帮助与支持

<div class="doc-cards">
  <a href="/manual/faq/" class="doc-card card-help-support">
    <div class="doc-card-content">
      <h3>❓ 常见问题</h3>
      <p>API 问题、部署故障排除、功能使用疑问解答</p>
    </div>
  </a>
  
  <a href="/manual/other/smart-question-guide" class="doc-card card-help-support">
    <div class="doc-card-content">
      <h3>📚 提问的艺术</h3>
      <p>学习如何有效提问以获得更好的帮助（麦麦版本）</p>
    </div>
  </a>
</div>

## 📄 法律与其他

<div class="doc-cards">
  <a href="/manual/other/EULA" class="doc-card card-legal-other">
    <div class="doc-card-content">
      <h3>📜 最终用户许可协议</h3>
      <p>了解 MaiBot 的使用条款、条件和隐私政策</p>
    </div>
  </a>
</div>

:::info 提示
  如果想查看过时的文档可以前往[这里](/archives/)
:::

![MaiBot](/avatars/MaiM.png)
