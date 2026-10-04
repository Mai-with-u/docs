<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref, onMounted, nextTick } from 'vue'
import { countWord } from '../utils/functions'

const { page, lang } = useData()

// Word count is injected at build time by transformPageData in config.mts,
// so SSR and hydration render the same value. DOM fallback covers dev/edge cases.
const words = ref<number>((page.value as any).wordCount ?? 0)

onMounted(async () => {
  if (words.value > 0) return
  await nextTick()
  const doc = document.querySelector('.vp-doc')
  if (doc?.textContent) {
    words.value = countWord(doc.textContent)
  }
})

const readingTime = computed(() => Math.max(1, Math.round(words.value / 300)))

const labels = computed(() => {
  if (lang.value.startsWith('en')) {
    return { updated: 'Updated', wordCount: 'Word count', words: 'words', readingTime: 'Reading time', time: 'min' }
  }
  return { updated: '更新', wordCount: '字数', words: '字', readingTime: '时长', time: '分钟' }
})

const dateLocale = computed(() => lang.value.startsWith('en') ? 'en-US' : 'zh-CN')

const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
</script>

<template>
  <div class="article-metadata">
    <span v-if="page.lastUpdated" class="meta-item">
      {{ labels.updated }}: {{ new Date(page.lastUpdated).toLocaleDateString(dateLocale, dateOptions) }}
    </span>
    <span class="meta-item">{{ labels.wordCount }}: {{ words }} {{ labels.words }}</span>
    <span class="meta-item">{{ labels.readingTime }}: {{ readingTime }} {{ labels.time }}</span>
  </div>
</template>

<style scoped>
.article-metadata {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-top: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.meta-item {
  display: flex;
  align-items: center;
}
</style>
