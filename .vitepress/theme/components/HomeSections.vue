<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

/* ------------------------------------------------------------------
 * HomeSections — 首页 hero 以下的全部内容区块。
 *
 * · 文案内置双语，按当前 locale 自动切换，zh / en 两个首页结构永远一致；
 * · 图标为内联 SVG（stroke 跟随品牌色），跨平台渲染一致，不依赖 emoji 字体；
 * · 配色全部走 --vp-c-* 设计令牌，自动适配
 *   默认 / 千禧两套界面风格与明暗模式。
 * ------------------------------------------------------------------ */

const { lang } = useData()
const isEn = computed(() => lang.value.startsWith('en'))
const prefix = computed(() => (isEn.value ? '/en' : ''))

/* 24×24 线性图标：每条为一段 <path d>（circle 用圆弧路径表达） */
const icons: Record<string, string[]> = {
  chat: [
    'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 4v-4a2 2 0 0 1-2-2V6Z',
    'M8 9.5h8',
    'M8 12.5h5',
  ],
  memory: [
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z',
    'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
    'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  ],
  clock: [
    'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17',
    'M12 7.5V12l3.2 1.9',
  ],
  sprout: [
    'M12 20.5V13',
    'M12 13C8.7 13 6 10.3 6 7c3.3 0 6 2.7 6 6Z',
    'M12 13c3.3 0 6-2.7 6-6-3.3 0-6 2.7-6 6Z',
  ],
  plugin: [
    'M4 4h6.5v6.5H4V4Z',
    'M13.5 4H20v6.5h-6.5V4Z',
    'M4 13.5h6.5V20H4v-6.5Z',
    'M16.75 13.5V20',
    'M13.5 16.75H20',
  ],
  download: ['M12 3.5v11', 'm7.5 10.5 4.5 4.5 4.5-4.5', 'M4.5 20.5h15'],
  plug: [
    'M9 3.5v5',
    'M15 3.5v5',
    'M6.5 8.5h11v3a5.5 5.5 0 0 1-11 0v-3Z',
    'M12 17v3.5',
  ],
  sliders: [
    'M4 7.5h8.4',
    'M17.6 7.5H20',
    'M4 16.5h1.4',
    'M10.6 16.5H20',
    'M15 4.9a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 1 0 0-5.2',
    'M8 13.9a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 1 0 0-5.2',
  ],
  code: ['m8.5 8-4.5 4 4.5 4', 'm15.5 8 4.5 4-4.5 4'],
  branch: [
    'M6.5 4.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5',
    'M6.5 9.5v3a4.5 4.5 0 0 0 4.5 4.5h4',
    'M17.5 14.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5',
  ],
  help: [
    'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17',
    'M9.6 9.4a2.5 2.5 0 0 1 4.9.6c0 1.6-2.4 2-2.4 3.3',
    'M12.1 16.5h.01',
  ],
  check: ['m4.5 12.5 5 5 10-11'],
}

const t = computed(() =>
  isEn.value
    ? {
        pill: 'Mai keeps evolving · See what’s new',
        featuresTitle: 'More than a bot',
        featuresSub:
          'MaiBot is a “digital life” living inside your conversations — here’s what makes her different.',
        chatTitle: 'Group chat · just now',
        chat: [
          { side: 'in', text: 'what’s for dinner tonight?' },
          { side: 'out', text: 'idk… that malatang place again?' },
          { side: 'in', text: 'malatang AGAIN?!' },
          { side: 'out', text: 'ok fine, hotpot then' },
        ],
        cards: [
          {
            icon: 'chat',
            title: 'Natural conversation',
            desc: 'No GPT-style walls of text — short or long, always at a human pace, like a friend who actually lives in your group chat.',
            wide: true,
          },
          {
            icon: 'memory',
            title: 'Memory × Personality',
            desc: 'The A-Memorix engine remembers every exchange, layered with a psychology-based personality model — the more you chat, the better she knows you.',
          },
          {
            icon: 'clock',
            title: 'Smart timing',
            desc: 'Reads the room and picks her moment — speaks up when she should, stays quiet when she shouldn’t.',
          },
          {
            icon: 'sprout',
            title: 'Always learning',
            desc: 'Mimics how group members talk and figures out new slang on her own — quietly evolving every day.',
          },
          {
            icon: 'plugin',
            title: 'Plugin system',
            desc: 'A powerful API and event system plus a growing community plugin market — endless ways to extend her.',
          },
        ],
        showcaseEyebrow: 'WEBUI CONSOLE',
        showcaseTitle: 'A full console, out of the box',
        showcaseDesc:
          'Config, chat, memory, stickers, plugin market… stop staring at TOML files — manage everything about Mai from one web page.',
        showcaseBullets: [
          'Hot-reload config that applies instantly',
          'Memory and knowledge base, visible at a glance',
          'One-click installs from the plugin market',
        ],
        showcaseLink: 'Explore the WebUI',
        linksTitle: 'Start here',
        linksSub: 'Six shortest paths to the doc page you need.',
        links: [
          { icon: 'download', title: 'Get Started', desc: 'Deploy Mai from scratch, step by step', href: '/manual/' },
          { icon: 'plug', title: 'Connect Platforms', desc: 'QQ, Email, iMessage and more adapters', href: '/manual/adapters/' },
          { icon: 'sliders', title: 'Configuration', desc: 'Persona, models and memory, item by item', href: '/manual/configuration/' },
          { icon: 'code', title: 'Plugin Development', desc: 'Give Mai brand-new abilities', href: '/plugin/' },
          { icon: 'branch', title: 'Integration Guides', desc: 'Write adapters, plugins and API clients', href: '/develop/' },
          { icon: 'help', title: 'FAQ', desc: 'Hit a snag? Look here first', href: '/faq/' },
        ],
        bannerTitle: 'Hang out with Mai-pals',
        bannerDesc:
          'Need a hand, want release news the moment it drops, or just feel like chatting with fellow Mai-pals? The community has the answers.',
        bannerPrimary: 'Join the community',
        bannerMeta: '5 QQ groups · GitHub · Discord · Telegram · X',
        thanks: 'MaiBot is built by volunteers — developers, docs maintainers, group owners, artists and community contributors.',
        thanksLink: 'See the full list',
      }
    : {
        pill: '麦麦一直在进化 · 查看最新更新',
        featuresTitle: '不只是机器人',
        featuresSub: '麦麦是一个活跃在对话中的「数字生命」——这些能力让她与众不同。',
        chatTitle: '群聊 · 刚刚',
        chat: [
          { side: 'in', text: '今晚吃啥？' },
          { side: 'out', text: '不知道诶，要不上次那家麻辣烫' },
          { side: 'in', text: '又麻辣烫？！' },
          { side: 'out', text: '那…火锅吧' },
        ],
        cards: [
          {
            icon: 'chat',
            title: '自然对话风格',
            desc: '不堆长篇大论，贴合人类节奏的或长或短闲谈——像一个真正住在群里的朋友。',
            wide: true,
          },
          {
            icon: 'memory',
            title: '长期记忆 × 人格画像',
            desc: 'A-Memorix 记忆引擎记住你们的每一次交流，再结合心理学人格模型，越相处越懂你。',
          },
          {
            icon: 'clock',
            title: '智能发言时机',
            desc: '读气氛、把握节奏，该开口就开口，该沉默就沉默。',
          },
          {
            icon: 'sprout',
            title: '持续学习进化',
            desc: '模仿群友的说话风格，自己揣摩新词与黑话，一直在悄悄进化。',
          },
          {
            icon: 'plugin',
            title: '插件系统',
            desc: '强大的 API 与事件系统，加上不断壮大的社区插件生态，扩展可能无限。',
          },
        ],
        showcaseEyebrow: 'WEBUI 控制台',
        showcaseTitle: '开箱即用的管理台',
        showcaseDesc:
          '配置、聊天、记忆、表情包、插件市场……不用再对着配置文件发呆，网页里点一点就能管好麦麦的一切。',
        showcaseBullets: [
          '配置热重载，改完即生效',
          '记忆与知识库，随时可视化查看',
          '插件市场一键安装与更新',
        ],
        showcaseLink: '了解 WebUI',
        linksTitle: '从这里开始',
        linksSub: '六条最短路径，通往你最想看的那页文档。',
        links: [
          { icon: 'download', title: '快速上手', desc: '从零开始，一步步把麦麦部署到手边', href: '/manual/' },
          { icon: 'plug', title: '接入聊天平台', desc: 'QQ、邮件、iMessage 等适配器', href: '/manual/adapters/' },
          { icon: 'sliders', title: '配置详解', desc: '人设、模型、记忆，每一项都讲清楚', href: '/manual/configuration/' },
          { icon: 'code', title: '插件开发', desc: '给麦麦写点新能力', href: '/plugin/' },
          { icon: 'branch', title: '接入开发', desc: '写适配器、插件，或对接 HTTP API', href: '/develop/' },
          { icon: 'help', title: '常见问题', desc: '遇到坑？先来这看看', href: '/faq/' },
        ],
        bannerTitle: '和麦友一起玩',
        bannerDesc:
          '遇到问题想找人帮、想第一时间拿新版本通知、想跟其他麦友吹水？社区里有答案。',
        bannerPrimary: '加入社区',
        bannerMeta: '5 个 QQ 群 · GitHub · Discord · Telegram · X',
        thanks: 'MaiBot 的背后是一群志愿者——开发者、文档维护者、群主、画师与社区贡献者。',
        thanksLink: '查看完整名单',
      }
)
</script>

<template>
  <div class="hs">
    <!-- 更新日志 pill -->
    <a class="hs-pill" :href="`${prefix}/changelog/`">
      <span class="hs-pill-dot" aria-hidden="true"></span>
      {{ t.pill }}
      <span class="hs-pill-arrow" aria-hidden="true">→</span>
    </a>

    <!-- 特性 bento -->
    <section class="hs-section">
      <div class="hs-head">
        <h2 class="hs-title">{{ t.featuresTitle }}</h2>
        <p class="hs-sub">{{ t.featuresSub }}</p>
      </div>
      <div class="hs-bento">
        <div
          v-for="(card, i) in t.cards"
          :key="i"
          class="hs-card"
          :class="{ 'hs-card--wide': card.wide }"
        >
          <div class="hs-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, k) in icons[card.icon]" :key="k" :d="d" />
            </svg>
          </div>
          <h3 class="hs-card-title">{{ card.title }}</h3>
          <p class="hs-card-desc">{{ card.desc }}</p>

          <div v-if="card.wide" class="hs-chat" aria-hidden="true">
            <div class="hs-chat-bar">
              <i class="hs-chat-dot"></i><i class="hs-chat-dot"></i><i class="hs-chat-dot"></i>
              <span class="hs-chat-label">{{ t.chatTitle }}</span>
            </div>
            <div class="hs-chat-body">
              <span
                v-for="(msg, j) in t.chat"
                :key="j"
                class="hs-bubble"
                :class="`hs-bubble--${msg.side}`"
                :style="{ animationDelay: `${0.15 * j + 0.1}s` }"
              >{{ msg.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WebUI 展示 -->
    <section class="hs-section hs-showcase">
      <div class="hs-showcase-text">
        <p class="hs-eyebrow">{{ t.showcaseEyebrow }}</p>
        <h2 class="hs-title hs-title--left">{{ t.showcaseTitle }}</h2>
        <p class="hs-sub hs-sub--left">{{ t.showcaseDesc }}</p>
        <ul class="hs-bullets">
          <li v-for="(b, i) in t.showcaseBullets" :key="i">
            <svg class="hs-bullet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="icons.check[0]" />
            </svg>
            <span>{{ b }}</span>
          </li>
        </ul>
        <a class="hs-text-link" :href="`${prefix}/manual/webui/`">
          {{ t.showcaseLink }} <span aria-hidden="true">→</span>
        </a>
      </div>
      <div class="hs-browser">
        <div class="hs-browser-bar" aria-hidden="true">
          <i class="hs-dot hs-dot--r"></i>
          <i class="hs-dot hs-dot--y"></i>
          <i class="hs-dot hs-dot--g"></i>
          <span class="hs-browser-url">localhost:8001/webui</span>
        </div>
        <img
          src="/images/webui/home.webp"
          alt="MaiBot WebUI"
          width="1600"
          height="1000"
          loading="lazy"
        />
      </div>
    </section>

    <!-- 快速通道 -->
    <section class="hs-section">
      <div class="hs-head">
        <h2 class="hs-title">{{ t.linksTitle }}</h2>
        <p class="hs-sub">{{ t.linksSub }}</p>
      </div>
      <div class="hs-links">
        <a
          v-for="(link, i) in t.links"
          :key="i"
          class="hs-link"
          :href="`${prefix}${link.href}`"
        >
          <span class="hs-link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, k) in icons[link.icon]" :key="k" :d="d" />
            </svg>
          </span>
          <span class="hs-link-body">
            <span class="hs-link-title">
              {{ link.title }}
              <span class="hs-link-arrow" aria-hidden="true">→</span>
            </span>
            <span class="hs-link-desc">{{ link.desc }}</span>
          </span>
        </a>
      </div>
    </section>

    <!-- 社区 banner -->
    <section class="hs-banner">
      <h2 class="hs-banner-title">{{ t.bannerTitle }}</h2>
      <p class="hs-banner-desc">{{ t.bannerDesc }}</p>
      <div class="hs-banner-actions">
        <a class="hs-btn hs-btn--solid" :href="`${prefix}/about/community`">{{ t.bannerPrimary }}</a>
        <a
          class="hs-btn hs-btn--ghost no-icon"
          href="https://github.com/Mai-with-u/MaiBot"
          target="_blank"
          rel="noopener"
        >GitHub</a>
      </div>
      <p class="hs-banner-meta">{{ t.bannerMeta }}</p>
    </section>

    <!-- 鸣谢 -->
    <p class="hs-thanks">
      {{ t.thanks }}
      <a class="hs-text-link" :href="`${prefix}/about/acknowledgements`">
        {{ t.thanksLink }} <span aria-hidden="true">→</span>
      </a>
    </p>
  </div>
</template>

<style scoped>
/* ------------------------------------------------------------------
 * 布局骨架
 * ------------------------------------------------------------------ */
.hs {
  display: flex;
  flex-direction: column;
  gap: 88px;
  margin: 40px 0 64px;
}

.hs-section {
  display: flex;
  flex-direction: column;
}

/* ------------------------------------------------------------------
 * 更新日志 pill
 * ------------------------------------------------------------------ */
.hs-pill {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  margin-top: -40px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: border-color 0.25s, color 0.25s, transform 0.25s;
}
.hs-pill:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}
.hs-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-brand-2);
  animation: hs-pulse 2.4s ease-in-out infinite;
}
.hs-pill-arrow {
  transition: transform 0.25s;
}
.hs-pill:hover .hs-pill-arrow {
  transform: translateX(2px);
}
@keyframes hs-pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--vp-c-brand-soft); }
  50% { box-shadow: 0 0 0 5px var(--vp-c-brand-soft); }
}

/* ------------------------------------------------------------------
 * 区块标题
 * ------------------------------------------------------------------ */
.hs-head {
  max-width: 620px;
  margin: 0 auto 44px;
  text-align: center;
}
.hs-eyebrow {
  margin: 0 0 10px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--vp-c-brand-1);
}
.hs-title {
  margin: 0;
  border-top: none;
  padding-top: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--vp-c-text-1);
}
.hs-title--left {
  font-size: 28px;
}
.hs-sub {
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}
.hs-sub--left {
  margin-bottom: 20px;
}

/* ------------------------------------------------------------------
 * 特性 bento
 * ------------------------------------------------------------------ */
.hs-bento {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}
.hs-card {
  grid-column: span 6;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 26px 28px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  /* 半透明玻璃卡：让身后的极光透出来，同时保持内容区可读 */
  background: var(--vp-c-bg-soft);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 78%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
/* bento 配比：7+5 / 7(跨行)+5 / 6+6 */
.hs-card--wide {
  grid-column: span 7;
  grid-row: span 2;
}
.hs-card:nth-child(2),
.hs-card:nth-child(3) {
  grid-column: span 5;
}
.hs-card:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 16px 40px -16px var(--vp-c-brand-soft), 0 8px 24px -12px rgba(0, 0, 0, 0.18);
}
.hs-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  margin-bottom: 16px;
}
.hs-card-icon svg {
  width: 23px;
  height: 23px;
}
.hs-card-title {
  margin: 0 0 8px;
  border-top: none;
  padding-top: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.hs-card-desc {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* 对话大卡里的聊天窗口 */
.hs-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 22px;
  min-height: 190px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  background: color-mix(in srgb, var(--vp-c-bg) 70%, transparent);
  overflow: hidden;
}
.hs-chat-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.hs-chat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  opacity: 0.5;
}
.hs-chat-label {
  margin-left: 6px;
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.hs-chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
}
.hs-bubble {
  width: fit-content;
  max-width: 84%;
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.55;
  animation: hs-rise 0.5s ease both;
}
.hs-bubble--in {
  align-self: flex-start;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-bottom-left-radius: 4px;
  color: var(--vp-c-text-1);
}
.hs-bubble--out {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--vp-c-brand-2), var(--vp-c-brand-1));
  border-bottom-right-radius: 4px;
  color: var(--vp-button-brand-text, #ffffff);
}
@keyframes hs-rise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ------------------------------------------------------------------
 * WebUI 展示：浏览器窗口拟态
 * ------------------------------------------------------------------ */
.hs-showcase {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 52px;
  align-items: center;
}
.hs-showcase-text {
  min-width: 0;
}
.hs-bullets {
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hs-bullets li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
.hs-bullet-icon {
  flex: none;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  color: var(--vp-c-brand-1);
}
.hs-browser {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  box-shadow: 0 28px 64px -28px rgba(0, 0, 0, 0.35);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}
.hs-browser:hover {
  transform: translateY(-4px);
  box-shadow: 0 36px 72px -28px rgba(0, 0, 0, 0.42);
}
.hs-browser-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.hs-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
}
.hs-dot--r { background: #ff5f57; }
.hs-dot--y { background: #febc2e; }
.hs-dot--g { background: #28c840; }
.hs-browser-url {
  margin-left: 10px;
  padding: 3px 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}
.hs-browser img {
  display: block;
  width: 100%;
  height: auto;
  /* 预留给懒加载的占位高度，避免图片到达前布局塌陷 */
  aspect-ratio: 16 / 10;
  background: var(--vp-c-bg-soft);
  margin: 0;
  border-radius: 0;
}

/* ------------------------------------------------------------------
 * 文本链接
 * ------------------------------------------------------------------ */
.hs-text-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s;
}
.hs-text-link span {
  transition: transform 0.2s;
}
.hs-text-link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: none;
}
.hs-text-link:hover span {
  transform: translateX(3px);
}

/* ------------------------------------------------------------------
 * 快速通道
 * ------------------------------------------------------------------ */
.hs-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.hs-link {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 78%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  text-decoration: none;
  font-weight: normal;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.hs-link:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-2);
  box-shadow: 0 10px 28px -12px var(--vp-c-brand-soft), 0 6px 18px -10px rgba(0, 0, 0, 0.16);
  text-decoration: none;
}
.hs-link-icon {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.hs-link-icon svg {
  width: 21px;
  height: 21px;
}
.hs-link-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hs-link-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.hs-link-arrow {
  color: var(--vp-c-text-3);
  transition: transform 0.2s, color 0.2s;
}
.hs-link:hover .hs-link-arrow {
  transform: translateX(3px);
  color: var(--vp-c-brand-1);
}
.hs-link-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

/* ------------------------------------------------------------------
 * 社区 banner
 * ------------------------------------------------------------------ */
.hs-banner {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 60px 32px 52px;
  text-align: center;
  /* 品牌橙固定渐变：不随界面风格变量变化，
     保证三套风格下白字对比度都达标（品牌色块时刻） */
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(120, 52, 4, 0.22);
  background: linear-gradient(120deg, #c25e17 0%, #e87e1c 52%, #ff8c00 100%);
  isolation: isolate;
}
/* 装饰光斑，让渐变更有层次 */
.hs-banner::before,
.hs-banner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(48px);
  z-index: -1;
}
.hs-banner::before {
  width: 340px;
  height: 340px;
  top: -140px;
  right: -60px;
  background: rgba(255, 255, 255, 0.22);
}
.hs-banner::after {
  width: 280px;
  height: 280px;
  bottom: -130px;
  left: -50px;
  background: rgba(244, 114, 182, 0.28);
}
.hs-banner-title {
  margin: 0 0 12px;
  border-top: none;
  padding-top: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: inherit;
}
.hs-banner-desc {
  margin: 0 auto 28px;
  max-width: 540px;
  font-size: 15px;
  line-height: 1.75;
  opacity: 0.94;
  color: inherit;
}
.hs-banner-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}
.hs-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 26px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}
.hs-btn--solid {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.35);
}
.hs-btn--solid:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px -8px rgba(0, 0, 0, 0.4);
  text-decoration: none;
}
.hs-btn--ghost {
  border: 1.5px solid currentColor;
  color: inherit;
  background: transparent;
}
.hs-btn--ghost:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.14);
  text-decoration: none;
}
.hs-banner-meta {
  margin: 22px 0 0;
  font-size: 12.5px;
  letter-spacing: 0.02em;
  opacity: 0.78;
  color: inherit;
}

/* ------------------------------------------------------------------
 * 鸣谢
 * ------------------------------------------------------------------ */
.hs-thanks {
  margin: -24px 0 0;
  text-align: center;
  font-size: 14px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}
.hs-thanks .hs-text-link {
  font-size: 14px;
  white-space: nowrap;
}

/* ------------------------------------------------------------------
 * 响应式
 * ------------------------------------------------------------------ */
@media (max-width: 960px) {
  .hs {
    gap: 72px;
  }
  .hs-card,
  .hs-card--wide,
  .hs-card:nth-child(2),
  .hs-card:nth-child(3) {
    grid-column: span 6;
    grid-row: auto;
  }
  .hs-card--wide {
    grid-column: span 12;
  }
  .hs-showcase {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .hs-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .hs {
    gap: 64px;
    margin-top: 24px;
  }
  .hs-pill {
    margin-top: -16px;
  }
  .hs-title {
    font-size: 26px;
  }
  .hs-title--left {
    font-size: 24px;
  }
  .hs-card,
  .hs-card--wide,
  .hs-card:nth-child(2),
  .hs-card:nth-child(3) {
    grid-column: span 12;
  }
  .hs-links {
    grid-template-columns: 1fr;
  }
  /* 小屏省电：关掉玻璃虚化，改回实心底，避免滚动时 GPU 压力 */
  .hs-card,
  .hs-link {
    background: var(--vp-c-bg-soft);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .hs-banner {
    padding: 44px 22px 40px;
  }
  .hs-banner-title {
    font-size: 24px;
  }
}

/* ------------------------------------------------------------------
 * 减少动态效果
 * ------------------------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
  .hs-pill-dot,
  .hs-bubble {
    animation: none;
  }
  .hs-card,
  .hs-browser,
  .hs-link,
  .hs-btn,
  .hs-pill {
    transition: none;
  }
}
</style>
