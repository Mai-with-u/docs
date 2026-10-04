---
title: 快速上手
---

# 快速上手

欢迎来到 MaiBot 用户手册。MaiBot（昵称「麦麦」）是一个基于大语言模型的聊天机器人框架——通过适配器它可以接入 QQ、邮件、iMessage 等平台，在群聊里像真人一样聊天、记忆、学习、使用工具。本手册从零开始，带你完成安装、配置、连接平台，并逐步掌握它的全部功能。

::: tip 系统要求
一台能联网的电脑（Windows 10+ / Linux / macOS），至少 2GB 可用内存，以及一个 LLM 的 API Key。硬件门槛不高，普通家用电脑就能跑。
:::

## 🚀 快速上手

从零到能聊天，只需要四步。每步约 1~2 分钟，跟着下面的卡片走就行。

<div class="step-grid">

<div class="step-card">
  <div class="step-head"><span class="step-no">1</span> <h3>安装 MaiBot</h3></div>
  <p>Windows 用户推荐使用<strong>一键包</strong>——无需安装命令行工具，双击安装后自动配置 Python 环境并弹出配置向导。Linux、macOS 或想用容器的话也有对应的方案。</p>
  <a class="step-more" href="/manual/deployment/windows">查看安装教程 →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">2</span> <h3>打开 WebUI</h3></div>
  <p>启动后，用浏览器访问 <code>http://localhost:8001</code>，把首次启动时终端打印的登录 Token 粘进去即可。WebUI 是管理 MaiBot 的图形界面，后续配置基本都在这里完成。</p>
  <a class="step-more" href="/manual/webui/">了解 WebUI →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">3</span> <h3>配置模型</h3></div>
  <p>在 WebUI 的模型配置里填写你的 API 服务商地址和 Key，并选择要用的模型。至少要有一个 LLM 模型，麦麦才能开口说话。</p>
  <a class="step-more" href="/manual/configuration/model-config">查看模型配置 →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">4</span> <h3>连接聊天平台</h3></div>
  <p>以最常用的 QQ 为例：装好 NapCat 并开启正向 WebSocket，然后在 WebUI 的插件市场安装「NapCat 适配器」并启用，麦麦就能进群聊天了。</p>
  <a class="step-more" href="/manual/adapters/napcat">连接 QQ →</a>
</div>

</div>

## 📖 进阶指南

跑起来之后，按需查阅下面的分区，把麦麦调教成你想要的样子。

<div class="nav-grid">

<div class="nav-card">
  <h3>⚙️ 配置详解</h3>
  <p>人格、昵称、聊天风格、记忆开关……所有配置文件都能在 WebUI 里改，也能直接编辑 TOML。</p>
  <a href="/manual/configuration/">配置概览 →</a>
</div>

<div class="nav-card">
  <h3>🔌 平台适配器</h3>
  <p>除了 QQ，麦麦还可以接入邮件、iMessage 等平台。查看不同适配器的接入方式和维护状态。</p>
  <a href="/manual/adapters/">接入平台 →</a>
</div>

</div>

## 💬 遇到问题？

- 先查[常见问题 FAQ](/faq/)，部署、连接、报错的大部分问题都有现成答案。
- 加入[麦麦交流群](/about/community)，群里有技术答疑和热心麦友。
- 也可以到 [GitHub Discussions](https://github.com/Mai-with-u/docs/discussions) 提问或参与讨论。

<style scoped>
/* 快速上手步骤卡片 */
.step-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 24px 0;
}

.step-card {
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.step-card:hover {
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 6px 20px var(--vp-c-brand-soft);
  transform: translateY(-2px);
}

.step-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.step-head h3 {
  margin: 0;
  font-size: 17px;
  color: var(--vp-c-text-1);
}

.step-no {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.step-card p {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.step-more {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s, transform 0.2s;
}
.step-more:hover {
  color: var(--vp-c-brand-2);
  transform: translateX(2px);
}

/* 分区导航卡片 */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;
}

.nav-card {
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.nav-card:hover {
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 6px 20px var(--vp-c-brand-soft);
  transform: translateY(-2px);
}

.nav-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--vp-c-text-1);
}

.nav-card p {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.nav-card a {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

/* 移动端单列 */
@media (max-width: 768px) {
  .step-grid,
  .nav-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
