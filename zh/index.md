---
layout: home

hero:
  name: MaiBot
  text: 基于 LLM 的交互式智能体
  tagline: '不仅仅是一个机器人，而是一个活跃在对话中的"数字生命"'
  image:
    src: /title_img/mai.png
    alt: MaiBot
  actions:
    - theme: brand
      text: 快速开始
      link: /manual/
    - theme: alt
      text: 开发文档
      link: /develop/

features:
  - icon: 💬
    title: 自然对话风格
    details: 不堆长篇大论，贴合人类节奏的或长或短闲谈。
  - icon: ⏱️
    title: 智能发言时机
    details: 读气氛、把握节奏，该开口就开口，该沉默就沉默。
  - icon: 🌱
    title: 持续学习进化
    details: 模仿他人说话风格，自己揣摩新词与黑话。
  - icon: 🧠
    title: 深度了解用户
    details: 基于心理学人格模型，越相处越懂你。
  - icon: 🔌
    title: 插件系统
    details: 强大的 API 与事件系统，扩展可能无限。
  - icon: ❤️
    title: 长期记忆
    details: A-Memorix 记忆引擎，记住你们的每一次交流。
---

<AuroraBackground />

<div class="spotlight-sections">

<section class="spotlight spotlight--media-left">
  <div class="spotlight-media spotlight-media--1" aria-hidden="true">
    <span class="spotlight-emoji">💬</span>
  </div>
  <div class="spotlight-body">
    <h2>如真人般的对话风格</h2>
    <p>麦麦不再像 GPT 那样堆砌长篇大论，她会看场合、读气氛、把握节奏——该开口就开口，该沉默就沉默，让群聊里的每一句都恰到好处。</p>
  </div>
</section>

<section class="spotlight spotlight--media-right">
  <div class="spotlight-media spotlight-media--2" aria-hidden="true">
    <span class="spotlight-emoji">🧠</span>
  </div>
  <div class="spotlight-body">
    <h2>长期记忆 × 人格画像</h2>
    <p>A-Memorix 记忆引擎把你们每一次交流都写回她的记忆，再结合心理学人格模型，让她越相处越了解你——你说过的话、你的喜好、你的说话风格，她都记得清清楚楚。</p>
  </div>
</section>

<section class="spotlight spotlight--media-left">
  <div class="spotlight-media spotlight-media--3" aria-hidden="true">
    <span class="spotlight-emoji">🌱</span>
  </div>
  <div class="spotlight-body">
    <h2>持续学习 × 进化</h2>
    <p>麦麦会模仿群里其他人的说话方式，也会自己揣摩新词和黑话的含义，一直在悄悄进化，没准哪天就用上你昨夜随口蹦出的句式。</p>
  </div>
</section>

</div>

## 加入社区

遇到问题想找人帮、想第一时间拿新版本通知、想跟其他麦友吹水？社区里有答案。

<a class="home-cta" href="/about/community">
  <span class="home-cta-title">加入社区 →</span>
  <span class="home-cta-desc">5 个 QQ 群 · GitHub · Discord · Telegram · X</span>
</a>

## 鸣谢

MaiBot 的背后是一群志愿者——开发者、文档维护者、群主、画师、社区贡献者。

<a class="home-cta" href="/about/acknowledgements">
  <span class="home-cta-title">查看完整名单 →</span>
  <span class="home-cta-desc">每一位让麦麦更好的人</span>
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
