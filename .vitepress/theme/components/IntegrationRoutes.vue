<script setup lang="ts">
/**
 * 接入路线卡片墙 —— 用在 /develop/ 与 /en/develop/ 总览页。
 *
 * 用法：<IntegrationRoutes />（可选 only="adapter,plugin" 只显示部分路线）
 * 文案与链接见 ../utils/integration-routes.ts，中英文案随站点语言自动切换。
 */
import { computed } from 'vue'
import { useData } from 'vitepress'
import { integrationRoutes, routeLabels, type IntegrationRoute } from '../utils/integration-routes'

const props = withDefaults(defineProps<{ only?: string }>(), { only: '' })

const { lang } = useData()
const locale = computed<'zh' | 'en'>(() => (lang.value?.startsWith('en') ? 'en' : 'zh'))
const labels = computed(() => routeLabels[locale.value])
// 数据文件里的链接不含语言前缀，英文站渲染时统一补 /en
const linkPrefix = computed(() => (locale.value === 'en' ? '/en' : ''))

const routes = computed<IntegrationRoute[]>(() => {
  const all = integrationRoutes[locale.value]
  if (!props.only) return all
  const wanted = props.only.split(',').map((k) => k.trim())
  return all.filter((r) => wanted.includes(r.key))
})
</script>

<template>
  <div class="ir-grid">
    <a v-for="route in routes" :key="route.key" class="ir-card" :href="linkPrefix + route.link">
      <span class="ir-icon" aria-hidden="true">{{ route.icon }}</span>
      <span class="ir-category">{{ route.category }}</span>
      <span class="ir-title">{{ route.title }}</span>
      <span class="ir-intent">{{ route.intent }}</span>
      <span class="ir-meta">
        <span class="ir-meta-label">{{ labels.audience }}</span>
        <span class="ir-meta-value">{{ route.audience }}</span>
      </span>
      <span class="ir-meta">
        <span class="ir-meta-label">{{ labels.requires }}</span>
        <span class="ir-meta-value">{{ route.requires }}</span>
      </span>
      <span class="ir-cta">{{ labels.cta }} →</span>
    </a>
  </div>
</template>

<style scoped>
.ir-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  margin: 20px 0;
}

.ir-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}

.ir-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.ir-icon {
  font-size: 22px;
  line-height: 1;
}

.ir-category {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.ir-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--vp-c-text-1);
}

.ir-intent {
  font-size: 13px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.ir-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  line-height: 1.55;
}

.ir-meta-label {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 5px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-default-soft);
}

.ir-meta-value {
  color: var(--vp-c-text-3);
}

.ir-cta {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

@media (prefers-reduced-motion: reduce) {
  .ir-card {
    transition: border-color 0.25s;
  }
  .ir-card:hover {
    transform: none;
  }
}
</style>
