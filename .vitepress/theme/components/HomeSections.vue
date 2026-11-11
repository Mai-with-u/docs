<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

/* ------------------------------------------------------------------
 * HomeSections — 首页 hero 以下的全部内容区块。
 *
 * · 文案内置双语，按当前 locale 自动切换，zh / en 两个首页结构永远一致；
 * · 版面克制：一句导语、一组能力、一组入口，不放大字报和装饰动画；
 * · 配色全部走 --vp-c-* 设计令牌，自动适配默认 / 千禧两套风格与明暗模式。
 * ------------------------------------------------------------------ */

const { lang } = useData()
const isEn = computed(() => lang.value.startsWith('en'))
const prefix = computed(() => (isEn.value ? '/en' : ''))

const t = computed(() =>
  isEn.value
    ? {
        pill: 'MaiBot 1.4.3 is out',
        introTitle: 'What MaiBot does',
        introSub: 'One process, several bots, all reachable from a browser.',
        cards: [
          {
            icon: 'chat',
            title: 'Talks like a person',
            desc: 'Replies run from a few characters to a few sentences. Message debounce and reply timing decide when she speaks.',
          },
          {
            icon: 'memory',
            title: 'Remembers',
            desc: 'The A-Memorix engine stores long-term memory, and the personality model builds a picture of each person over time.',
          },
          {
            icon: 'sprout',
            title: 'Learns the room',
            desc: 'Expression and slang learning pick up how a group talks, with per-chat switches and a learning blacklist.',
          },
          {
            icon: 'plugin',
            title: 'Extends through plugins',
            desc: 'Tools, commands, hooks, and reply extensions run in an isolated plugin runtime, installable from the plugin market.',
          },
          {
            icon: 'sliders',
            title: 'Runs several bots',
            desc: 'Each bot keeps its own chats, configuration, data, and plugins. Model providers are shared.',
          },
        ],
        linksTitle: 'Start here',
        links: [
          { title: 'Get started', desc: 'Deploy MaiBot and open the WebUI', href: '/manual/' },
          { title: 'Connect a platform', desc: 'QQ, Telegram, WeChat ClawBot, email, iMessage', href: '/manual/adapters/' },
          { title: 'Configuration', desc: 'Bot behavior, models, memory, and MCP', href: '/manual/configuration/' },
          { title: 'Plugin development', desc: 'Write tools, commands, and hooks', href: '/develop/plugin/' },
          { title: 'Adapter development', desc: 'Implement the message protocol', href: '/develop/adapters/' },
          { title: 'FAQ', desc: 'Common failures and their fixes', href: '/faq/' },
        ],
        bannerTitle: 'Community',
        bannerDesc: 'QQ groups for questions and release news, plus GitHub, Discord, Telegram, and X.',
        bannerPrimary: 'Join the groups',
        thanks: 'Built by volunteers: developers, docs maintainers, group owners, artists, and community contributors.',
        thanksLink: 'Full list',
      }
    : {
        pill: '当前版本 1.4.3',
        introTitle: '麦麦能做什么',
        introSub: '一个进程跑多只麦麦，浏览器里完成全部管理。',
        cards: [
          {
            icon: 'chat',
            title: '像人一样说话',
            desc: '回复短则几个字，长则几句话。消息防抖与回复时机决定她什么时候开口。',
          },
          {
            icon: 'memory',
            title: '记得住',
            desc: 'A-Memorix 引擎保存长期记忆，人格模型逐步积累对每个人的了解。',
          },
          {
            icon: 'sprout',
            title: '学得会',
            desc: '表达与黑话学习模仿群里的说法，可按聊天开关，并支持学习黑名单。',
          },
          {
            icon: 'plugin',
            title: '插件扩展',
            desc: 'Tool、Command、Hook 与回复扩展运行在独立插件运行时里，可从插件市场安装。',
          },
          {
            icon: 'sliders',
            title: '多实例',
            desc: '每只麦麦各自保存聊天、配置、数据和插件，模型供应商由公共设置管理。',
          },
        ],
        linksTitle: '从这里开始',
        links: [
          { title: '快速上手', desc: '部署麦麦并打开 WebUI', href: '/manual/' },
          { title: '接入聊天平台', desc: 'QQ、Telegram、微信 ClawBot、邮件、iMessage', href: '/manual/adapters/' },
          { title: '配置', desc: '机器人行为、模型、记忆与 MCP', href: '/manual/configuration/' },
          { title: '插件开发', desc: '编写 Tool、Command 与 Hook', href: '/develop/plugin/' },
          { title: '适配器开发', desc: '实现消息协议', href: '/develop/adapters/' },
          { title: '常见问题', desc: '常见故障与对应解法', href: '/faq/' },
        ],
        bannerTitle: '社区',
        bannerDesc: 'QQ 群提问与版本通知，另有 GitHub、Discord、Telegram 与 X。',
        bannerPrimary: '加入交流群',
        thanks: '这份文档由志愿者维护：开发者、文档维护者、群主、画师与社区贡献者。',
        thanksLink: '完整名单',
      }
)

/* 24x24 线性图标，每条为一段 <path d> */
const icons: Record<string, string[]> = {
  chat: ['M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 4v-4a2 2 0 0 1-2-2V6Z'],
  memory: [
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z',
    'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
    'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  ],
  sprout: ['M12 20.5V13', 'M12 13C8.7 13 6 10.3 6 7c3.3 0 6 2.7 6 6Z', 'M12 13c3.3 0 6-2.7 6-6-3.3 0-6 2.7-6 6Z'],
  plugin: ['M4 4h6.5v6.5H4V4Z', 'M13.5 4H20v6.5h-6.5V4Z', 'M4 13.5h6.5V20H4v-6.5Z', 'M16.75 13.5V20', 'M13.5 16.75H20'],
  sliders: [
    'M4 7.5h8.4',
    'M17.6 7.5H20',
    'M4 16.5h1.4',
    'M10.6 16.5H20',
    'M15 4.9a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 1 0 0-5.2',
    'M8 13.9a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 1 0 0-5.2',
  ],
  check: ['m4.5 12.5 5 5 10-11'],
}
</script>

<template>
  <div class="hs">
    <a class="hs-pill" :href="`${prefix}/changelog/`">
      <span class="hs-pill-dot" aria-hidden="true"></span>
      {{ t.pill }}
      <span class="hs-pill-arrow" aria-hidden="true">→</span>
    </a>

    <section class="hs-section">
      <div class="hs-head">
        <h2 class="hs-title">{{ t.introTitle }}</h2>
        <p class="hs-sub">{{ t.introSub }}</p>
      </div>
      <ul class="hs-grid">
        <li v-for="(card, i) in t.cards" :key="i" class="hs-card">
          <span class="hs-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, k) in icons[card.icon]" :key="k" :d="d" />
            </svg>
          </span>
          <h3 class="hs-card-title">{{ card.title }}</h3>
          <p class="hs-card-desc">{{ card.desc }}</p>
        </li>
      </ul>
    </section>

    <section class="hs-section">
      <div class="hs-head">
        <h2 class="hs-title">{{ t.linksTitle }}</h2>
      </div>
      <ul class="hs-links">
        <li v-for="(link, i) in t.links" :key="i">
          <a class="hs-link" :href="`${prefix}${link.href}`">
            <span class="hs-link-title">{{ link.title }}</span>
            <span class="hs-link-desc">{{ link.desc }}</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="hs-banner">
      <div>
        <h2 class="hs-banner-title">{{ t.bannerTitle }}</h2>
        <p class="hs-banner-desc">{{ t.bannerDesc }}</p>
      </div>
      <div class="hs-banner-actions">
        <a class="hs-btn" :href="`${prefix}/about/community`">{{ t.bannerPrimary }}</a>
        <a class="hs-btn hs-btn--ghost no-icon" href="https://github.com/Mai-with-u/MaiBot" target="_blank" rel="noopener">GitHub</a>
      </div>
    </section>

    <p class="hs-thanks">
      {{ t.thanks }}
      <a class="hs-text-link" :href="`${prefix}/about/acknowledgements`">{{ t.thanksLink }} →</a>
    </p>
  </div>
</template>

<style scoped>
.hs {
  display: flex;
  flex-direction: column;
  gap: 72px;
  max-width: 900px;
  margin: 24px auto 64px;
}

/* 版本 pill */
.hs-pill {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: border-color 0.25s, color 0.25s;
}
.hs-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.hs-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
}
.hs-pill-arrow {
  transition: transform 0.25s;
}
.hs-pill:hover .hs-pill-arrow {
  transform: translateX(2px);
}

/* 区块标题 —— 与卡片 / 入口条目的文字左缘对齐（两者内缩 20px 内边距 + 2px 边框） */
.hs-head {
  margin-bottom: 28px;
  padding: 0 21px;
}
.hs-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}
.hs-sub {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* 能力卡片 */
.hs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.hs-card {
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.hs-card-icon {
  display: block;
  color: var(--vp-c-brand-1);
  margin-bottom: 10px;
}
.hs-card-icon svg {
  width: 20px;
  height: 20px;
}
.hs-card-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.hs-card-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* 入口列表 */
.hs-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.hs-link {
  display: block;
  padding: 12px 20px;
  border: 1px solid transparent;
  border-bottom-color: var(--vp-c-divider);
  text-decoration: none;
}
.hs-link-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.hs-link-desc {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* 社区 */
.hs-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.hs-banner-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.hs-banner-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}
.hs-banner-actions {
  display: flex;
  gap: 10px;
}
.hs-btn {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}
.hs-btn:hover {
  background: var(--vp-c-brand-2);
}
.hs-btn--ghost {
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}
.hs-btn--ghost:hover {
  border-color: var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}

/* 鸣谢 */
.hs-thanks {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
}
.hs-text-link {
  margin-left: 4px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

@media (max-width: 768px) {
  .hs {
    gap: 48px;
    margin: 16px auto 48px;
  }
  .hs-grid,
  .hs-links {
    grid-template-columns: 1fr;
  }
  .hs-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
