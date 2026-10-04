---
layout: home

hero:
  name: MaiBot
  text: An LLM-powered interactive agent
  tagline: 'Not just a bot, but a "digital life" living inside your conversations'
  image:
    src: /title_img/mai.png
    alt: MaiBot
  actions:
    - theme: brand
      text: Get Started
      link: /en/manual/
    - theme: alt
      text: Developer Docs
      link: /en/develop/

features:
  - icon: 💬
    title: Natural Conversation Style
    details: No walls of text — short, human-paced turns that fit the room.
  - icon: ⏱️
    title: Smart Timing
    details: Reads the mood, knows when to speak up and when to stay quiet.
  - icon: 🌱
    title: Continuous Learning
    details: Picks up others' styles and figures out new slang on its own.
  - icon: 🧠
    title: Deep User Understanding
    details: Built on personality psychology — the more you chat, the better it knows you.
  - icon: 🔌
    title: Plugin System
    details: A powerful API and event system unlock endless extension.
  - icon: ❤️
    title: Long-term Memory
    details: The A-Memorix engine remembers every exchange you share.
---

<AuroraBackground />

<div class="spotlight-sections">

<section class="spotlight spotlight--media-left">
  <div class="spotlight-media spotlight-media--1" aria-hidden="true">
    <span class="spotlight-emoji">💬</span>
  </div>
  <div class="spotlight-body">
    <h2>Conversational, like a real person</h2>
    <p>MaiBot doesn't dump GPT-style paragraphs. It reads the room, feels the mood, and picks its moment — speaking up when it should and staying quiet when it shouldn't, so every line in the group chat lands just right.</p>
  </div>
</section>

<section class="spotlight spotlight--media-right">
  <div class="spotlight-media spotlight-media--2" aria-hidden="true">
    <span class="spotlight-emoji">🧠</span>
  </div>
  <div class="spotlight-body">
    <h2>Long-term Memory × Personality Profile</h2>
    <p>The A-Memorix engine writes every exchange back into its memory, then layers in a psychological personality model — so the more time you spend together, the better it knows you. Your words, your tastes, your way of speaking: it remembers them all.</p>
  </div>
</section>

<section class="spotlight spotlight--media-left">
  <div class="spotlight-media spotlight-media--3" aria-hidden="true">
    <span class="spotlight-emoji">🌱</span>
  </div>
  <div class="spotlight-body">
    <h2>Continuous Learning × Evolution</h2>
    <p>MaiBot mimics how others in the group talk, and quietly figures out new slang and in-jokes on its own. It's always evolving — and might just drop the phrase you tossed out last night into tomorrow's reply.</p>
  </div>
</section>

</div>

## Join the Community

Need a hand, want new-release news the moment it drops, or just feel like hanging out with fellow Mai-pals? The community has the answers.

<a class="home-cta" href="/en/about/community">
  <span class="home-cta-title">Join the community →</span>
  <span class="home-cta-desc">5 QQ groups · GitHub · Discord · Telegram · X</span>
</a>

## Acknowledgements

MaiBot is built by volunteers — developers, docs maintainers, group owners, artists, and community contributors.

<a class="home-cta" href="/en/about/acknowledgements">
  <span class="home-cta-title">See the full list →</span>
  <span class="home-cta-desc">Everyone who makes MaiBot better</span>
</a>

<style scoped>
/* ------------------------------------------------------------------
 * Spotlight sections — alternating left/right media+text rhythm,
 * collapses to a single stacked column on mobile.
 * ------------------------------------------------------------------ */

.spotlight-sections {
  display: flex;
  flex-direction: column;
  gap: 72px;
  margin: 72px 0 56px;
}

.spotlight {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 48px;
}

.spotlight--media-left .spotlight-media {
  order: 1;
}
.spotlight--media-left .spotlight-body {
  order: 2;
}
.spotlight--media-right .spotlight-media {
  order: 2;
}
.spotlight--media-right .spotlight-body {
  order: 1;
}

.spotlight-media {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

/* Each media block: brand-dominant gradient + one non-brand accent,
   echoing the aurora's "colourful yet unified" feel. */
.spotlight-media--1 {
  background:
    radial-gradient(circle at 25% 30%, rgba(244, 114, 182, 0.22), transparent 55%),
    linear-gradient(135deg, rgba(255, 140, 0, 0.28), rgba(255, 169, 64, 0.16));
}
.spotlight-media--2 {
  background:
    radial-gradient(circle at 75% 25%, rgba(56, 189, 248, 0.20), transparent 55%),
    linear-gradient(135deg, rgba(199, 81, 41, 0.26), rgba(255, 140, 0, 0.18));
}
.spotlight-media--3 {
  background:
    radial-gradient(circle at 30% 75%, rgba(244, 114, 182, 0.20), transparent 55%),
    linear-gradient(135deg, rgba(255, 169, 64, 0.26), rgba(199, 81, 41, 0.16));
}

.spotlight-emoji {
  font-size: 96px;
  line-height: 1;
  opacity: 0.55;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.12));
  user-select: none;
}

.spotlight-body h2 {
  margin-top: 0;
  border-top: none;
  padding-top: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.spotlight-body p {
  margin: 16px 0 24px;
  font-size: 16px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.spotlight-link {
  display: inline-flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s, transform 0.2s;
}
.spotlight-link:hover {
  color: var(--vp-c-brand-2);
  transform: translateX(2px);
}

/* ------------------------------------------------------------------
 * CTA cards for community / acknowledgements
 * ------------------------------------------------------------------ */

.home-cta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 20px 0 8px;
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.home-cta:hover {
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 6px 20px var(--vp-c-brand-soft);
  transform: translateY(-2px);
}
.home-cta-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.home-cta-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* ------------------------------------------------------------------
 * Mobile: stack spotlight media above body, single column
 * ------------------------------------------------------------------ */

@media (max-width: 768px) {
  .spotlight-sections {
    gap: 48px;
    margin: 48px 0 40px;
  }
  .spotlight {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .spotlight--media-left .spotlight-media,
  .spotlight--media-right .spotlight-media {
    order: 1;
  }
  .spotlight--media-left .spotlight-body,
  .spotlight--media-right .spotlight-body {
    order: 2;
  }
  .spotlight-emoji {
    font-size: 72px;
  }
  .spotlight-body h2 {
    font-size: 24px;
  }
}
</style>
