---
title: Quick Start
---

# Quick Start

Welcome to the MaiBot User Manual. MaiBot is an LLM-powered chatbot framework — through adapters it connects to platforms such as QQ, email, and iMessage, and chats, remembers, learns, and uses tools in group conversations like a real person. This manual walks you through installation, configuration, and platform connection from scratch, then helps you master every feature.

::: tip System Requirements
A computer with internet access (Windows 10+ / Linux / macOS), at least 2GB of free memory, and an LLM API key. The hardware bar is low — an ordinary home computer is enough.
:::

## 🚀 Quick Start

From zero to chatting takes just four steps, about 1–2 minutes each. Just follow the cards below.

<div class="step-grid">

<div class="step-card">
  <div class="step-head"><span class="step-no">1</span> <h3>Install MaiBot</h3></div>
  <p>Windows users are recommended to use the <strong>one-click package</strong> — no command-line tools needed. Double-click to install; it automatically sets up the Python environment and launches a configuration wizard. Linux, macOS, and container options are also available.</p>
  <a class="step-more" href="/en/manual/deployment/windows">View install guide →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">2</span> <h3>Open the WebUI</h3></div>
  <p>After startup, open <code>http://localhost:8001</code> in your browser and paste the login token printed in the terminal on first launch. The WebUI is MaiBot's graphical management interface — most configuration happens here.</p>
  <a class="step-more" href="/en/manual/webui/">Learn about the WebUI →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">3</span> <h3>Configure a Model</h3></div>
  <p>In the WebUI's model settings, enter your API provider's base URL and key, then pick the model you want. You need at least one LLM model before MaiBot can speak.</p>
  <a class="step-more" href="/en/manual/configuration/model-config">View model config →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">4</span> <h3>Connect a Chat Platform</h3></div>
  <p>Taking QQ as the most common example: install NapCat and enable its forward WebSocket, then install and enable the "NapCat Adapter" from the plugin store in the WebUI — MaiBot can join your group chats.</p>
  <a class="step-more" href="/en/manual/adapters/napcat">Connect to QQ →</a>
</div>

</div>

## 📖 Going Further

Once it's running, explore the sections below to shape MaiBot into what you want.

<div class="nav-grid">

<div class="nav-card">
  <h3>⚙️ Configuration</h3>
  <p>Personality, nickname, chat style, memory toggles… every config file can be edited in the WebUI, or as TOML directly.</p>
  <a href="/en/manual/configuration/">Configuration Overview →</a>
</div>

<div class="nav-card">
  <h3>🔌 Platform Adapters</h3>
  <p>Besides QQ, MaiBot can connect to email, iMessage, and more. See how each adapter is set up and maintained.</p>
  <a href="/en/manual/adapters/">Connect Platforms →</a>
</div>

</div>

## 💬 Need Help?

- Check the [FAQ](/en/faq/) first — most deployment, connection, and error questions already have answers.
- Join the [MaiBot community](/en/about/community) — the QQ groups offer technical Q&A and friendly help.
- Ask or discuss in [GitHub Discussions](https://github.com/Mai-with-u/docs/discussions).

<style scoped>
/* Quick-start step cards */
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

/* Section navigation cards */
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

/* Single column on mobile */
@media (max-width: 768px) {
  .step-grid,
  .nav-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
