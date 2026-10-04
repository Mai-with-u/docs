<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  url: string
  title: string
  description: string
  logo?: string
}

const props = withDefaults(defineProps<Props>(), {
  logo: ''
})

const resolvedLogo = computed(() => {
  if (props.logo) return props.logo
  try {
    const host = new URL(props.url).hostname
    return `https://${host}/favicon.ico`
  } catch {
    return ''
  }
})
</script>

<template>
  <a :href="props.url" target="_blank" rel="noopener noreferrer" class="linkcard">
    <div class="linkcard-content">
      <span class="linkcard-title">{{ props.title }}</span>
      <span class="linkcard-desc">{{ props.description }}</span>
    </div>
    <div v-if="resolvedLogo" class="linkcard-logo">
      <img :src="resolvedLogo" :alt="props.title" />
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
}
.linkcard-logo img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}
</style>
