---
title: 快速上手
---

# 快速上手

你好！

MaiBot（麦麦）是一个基于大语言模型的聊天机器人框架——通过适配器它可以接入 QQ、TG、邮件、iMessage 等平台，像真人一样聊天、记忆、学习、好奇、犯贱、语出惊人、成为电子宠物。

本手册从零开始，带你完成安装、配置、连接平台，并逐步掌握它的全部功能。

::: tip 系统要求
一台能联网的电脑（Windows 10+ / Linux / macOS），至少 2GB 可用内存，以及一个 LLM 的 API Key。

随时询问人类和AI并思考的意识
:::

## 麦麦 101

从零到能聊天，只需要四步。

<div class="step-grid">

<div class="step-card">
  <div class="step-head"><span class="step-no">1</span> <h3>安装 MaiBot</h3></div>
  <p>Windows 用户推荐使用<strong>一键包</strong>一站式快速部署。<br> Linux、macOS 可以使用Docker或用Python环境直接启动。</p>
  <a class="step-more" href="/manual/deployment/windows">查看安装教程 →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">2</span> <h3>打开 WebUI</h3></div>
  <p>启动后，用浏览器访问 <code>http://localhost:8001</code>，登录密码通常会显示在启动窗口。</p>
  <a class="step-more" href="/manual/webui/">了解 WebUI →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">3</span> <h3>配置模型</h3></div>
  <p>跟随引导填写你的 API 服务商地址和 Key，并选择要用的模型。</p>
  <a class="step-more" href="/manual/configuration/model-config">查看模型配置 →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">4</span> <h3>连接聊天平台</h3></div>
  <p>以最常用的 QQ 为例：使用适配器与 QQ 官方机器人 或者 SnowLuma连接，即可获取消息</p>
  <a class="step-more" href="/manual/adapters/qq-local-client">连接 QQ →</a>
</div>

</div>

## 第二课

跑起来之后，按需查阅下面的分区，把麦麦调教成你想要的样子。

<div class="nav-grid">

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="m9 3-.6 2.4-2.1 1.2L4 6l-2 3 1.8 1.8v2.4L2 15l2 3 2.3-.6 2.1 1.2L9 21h6l.6-2.4 2.1-1.2L20 18l2-3-1.8-1.8v-2.4L22 9l-2-3-2.3.6-2.1-1.2L15 3Z"/></svg></span>
    <h3>配置</h3>
  </div>
  <p>人格、昵称、聊天风格、记忆开关……了解这些配置的含义和功能</p>
  <a href="/manual/configuration/">配置概览 →</a>
</div>

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4"/></svg></span>
    <h3>接入平台</h3>
  </div>
  <p>除了 QQ，麦麦还可以接入TG、邮件、iMessage 。查看不同适配器的介绍。</p>
  <a href="/manual/adapters/">接入平台 →</a>
</div>

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path transform="translate(0 2)" d="M4 4h5V3a3 3 0 0 1 6 0v1h5v5h-1a3 3 0 0 0 0 6h1v5h-5v-1a3 3 0 0 0-6 0v1H4v-5h1a3 3 0 0 0 0-6H4Z"/></svg></span>
    <h3>插件</h3>
  </div>
  <p>从插件市场一键安装新能力——游戏、画图、天气，以及各平台适配器。</p>
  <a href="/manual/plugins/">安装插件 →</a>
</div>

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg></span>
    <h3>WebUI 管理面板</h3>
  </div>
  <p>WebUI 全功能指南：配置、适配器、命令、记忆、数据与聊天统计。</p>
  <a href="/manual/webui/">登录与设置 →</a>
</div>

</div>

## 我是开发者

想给麦麦写插件、写适配器，或用自己的程序对接麦麦？

- [接入总览](/develop/) — 六条接入路线，按受众与前置条件选型
- [插件开发指南](/plugin/) — 编写插件，扩展 MaiBot 的行为

## 遇到问题？

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
  grid-template-columns: repeat(2, 1fr);
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

.nav-card .nav-icon {
  padding: 0;
}

.nav-icon svg {
  width: 18px;
  height: 18px;
}

.nav-card .nav-head h3 {
  margin: 0;
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
