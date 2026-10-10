---
title: Quick Start
---

# Quick Start

Hello!

MaiBot (Mai) is an LLM-powered chatbot framework. Through adapters, it connects to QQ, Telegram, email, iMessage, and other platforms. Like a person, it can chat, remember, learn, be curious, act cheeky, surprise you with what it says, and become your digital pet.

This manual walks you through installation, configuration, and platform connection from scratch, then helps you master every feature.

::: tip System Requirements
A computer with internet access (Windows 10+ / Linux / macOS), at least 2GB of free memory, and an LLM API key.

A willingness to ask people and AI for help and think things through.

## Mai 101

From zero to chatting takes just four steps.

<div class="step-grid">

<div class="step-card">
  <div class="step-head"><span class="step-no">1</span> <h3>Install MaiBot</h3></div>
  <p>Windows users are recommended to use the <strong>one-click package</strong> for a quick, complete setup.<br> Linux and macOS users can use Docker or launch directly in a Python environment.</p>
  <a class="step-more" href="/en/manual/deployment/windows">View install guide →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">2</span> <h3>Open the WebUI</h3></div>
  <p>After startup, open <code>http://localhost:8001</code> in your browser. The login password usually appears in the startup window.</p>
  <a class="step-more" href="/en/manual/webui/">Learn about the WebUI →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">3</span> <h3>Configure a Model</h3></div>
  <p>Follow the setup guide to enter your API provider's base URL and key, then choose the models to use.</p>
  <a class="step-more" href="/en/manual/configuration/model-config">View model config →</a>
</div>

<div class="step-card">
  <div class="step-head"><span class="step-no">4</span> <h3>Connect a Chat Platform</h3></div>
  <p>For QQ, the most common example, use an adapter to connect to a QQ Official Bot or SnowLuma to receive messages.</p>
  <a class="step-more" href="/en/manual/adapters/qq-local-client">Connect to QQ →</a>
</div>

</div>

## Lesson Two

Once it's running, explore the sections below to shape MaiBot into what you want.

<div class="nav-grid">

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="m9 3-.6 2.4-2.1 1.2L4 6l-2 3 1.8 1.8v2.4L2 15l2 3 2.3-.6 2.1 1.2L9 21h6l.6-2.4 2.1-1.2L20 18l2-3-1.8-1.8v-2.4L22 9l-2-3-2.3.6-2.1-1.2L15 3Z"/></svg></span>
    <h3>Configuration</h3>
  </div>
  <p>Personality, nickname, chat style, memory toggles… learn what these settings mean and what they do.</p>
  <a href="/en/manual/configuration/">Configuration Overview →</a>
</div>

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4"/></svg></span>
    <h3>Connect Platforms</h3>
  </div>
  <p>Besides QQ, MaiBot can connect to Telegram, email, and iMessage. Explore the available adapters.</p>
  <a href="/en/manual/adapters/">Connect Platforms →</a>
</div>

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path transform="translate(0 2)" d="M4 4h5V3a3 3 0 0 1 6 0v1h5v5h-1a3 3 0 0 0 0 6h1v5h-5v-1a3 3 0 0 0-6 0v1H4v-5h1a3 3 0 0 0 0-6H4Z"/></svg></span>
    <h3>Plugins</h3>
  </div>
  <p>Install new abilities from the plugin market — games, drawing, weather, and platform adapters.</p>
  <a href="/en/manual/plugins/">Install Plugins →</a>
</div>

<div class="nav-card">
  <div class="step-head nav-head">
    <span class="step-no nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg></span>
    <h3>WebUI Console</h3>
  </div>
  <p>The full WebUI guide: configuration, adapters, commands, memory, data, and chat statistics.</p>
  <a href="/en/manual/webui/">Login & Settings →</a>
</div>

</div>

## I'm a Developer

Want to write plugins or adapters for MaiBot, or integrate it with your own program?

- [Integration Overview](/en/develop/) — six integration routes, organized by audience and prerequisites
- [Plugin Development Guide](/en/plugin/) — write plugins to extend MaiBot's behavior

## Need Help?

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

/* Single column on mobile */
@media (max-width: 768px) {
  .step-grid,
  .nav-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
