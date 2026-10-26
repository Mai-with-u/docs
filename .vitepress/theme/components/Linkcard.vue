<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// 平台图标按域名命名，存放在 .vitepress/theme/icons/ 下（文件名即域名，如 example.com.svg）。
// 新增平台图标：往 icons/ 放一个「域名.svg」即可，组件构建时通过 import.meta.glob 自动发现，
// 不需要修改本文件。SVG 约定：24×24 viewBox、单个 path、fill="currentColor"（颜色由卡片样式控制）。
const iconModules = import.meta.glob('../icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

/** 域名（小写）→ 图标 SVG 源码 */
const localIcons = new Map(
  Object.entries(iconModules).map(([file, svg]) => {
    const domain = file.slice(file.lastIndexOf('/') + 1).replace(/\.svg$/i, '')
    return [domain.toLowerCase(), svg] as const
  })
)

/** 显式图片地址：绝对 URL、协议相对 URL、站内绝对路径、./ 或 ../ 相对路径 */
function isImageSource(value: string): boolean {
  return /^(?:https?:)?\/\//i.test(value) || /^(?:\/|\.{1,2}\/)/.test(value)
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/** 命中规则：先精确匹配域名，再逐级去掉左侧子域（www.example.com → example.com），最少保留两级 */
function findLocalIcon(host: string): string {
  const labels = host.toLowerCase().split('.').filter(Boolean)
  while (labels.length >= 2) {
    const svg = localIcons.get(labels.join('.'))
    if (svg) return svg
    labels.shift()
  }
  return ''
}

interface Props {
  url: string
  title: string
  description: string
  logo?: string
}

const props = withDefaults(defineProps<Props>(), {
  logo: ''
})

const imgError = ref(false)

watch(
  () => [props.url, props.logo],
  () => {
    imgError.value = false
  }
)

/**
 * 本地图标：优先按 logo（裸域名）查，其次按链接域名查。
 * logo 是图片地址时不走图标；未传 logo 时按 url 的 hostname 查。
 */
const inlineIcon = computed(() => {
  const logo = props.logo.trim()
  if (logo) return isImageSource(logo) ? '' : findLocalIcon(logo)
  const host = hostnameOf(props.url)
  return host ? findLocalIcon(host) : ''
})

/** <img> 地址：用户传入的 logo 原样使用；未传时回退站点 favicon */
const imgSrc = computed(() => {
  if (inlineIcon.value) return ''
  if (props.logo) return props.logo
  const host = hostnameOf(props.url)
  return host ? `https://${host}/favicon.ico` : ''
})
</script>

<template>
  <a :href="props.url" target="_blank" rel="noopener noreferrer" class="linkcard">
    <div class="linkcard-content">
      <span class="linkcard-title">{{ props.title }}</span>
      <span class="linkcard-desc">{{ props.description }}</span>
    </div>
    <div v-if="inlineIcon" class="linkcard-logo linkcard-icon" aria-hidden="true" v-html="inlineIcon" />
    <div v-else-if="imgSrc && !imgError" class="linkcard-logo">
      <img :src="imgSrc" :alt="props.title" @error="imgError = true" />
    </div>
  </a>
</template>

<style scoped>
.linkcard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  transition: border-color 0.25s, box-shadow 0.25s;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
}
.linkcard:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.linkcard-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.linkcard-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.linkcard-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.linkcard-logo {
  flex-shrink: 0;
  margin-left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
}
.linkcard-logo img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}
.linkcard-icon {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
  transition: color 0.25s, background-color 0.25s;
}
.linkcard-icon :deep(svg) {
  width: 28px;
  height: 28px;
  display: block;
}
.linkcard:hover .linkcard-icon {
  color: var(--vp-c-brand-1);
}
</style>
