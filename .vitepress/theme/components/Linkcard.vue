<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  url: string
  title: string
  description: string
  logo?: string
}

const props = withDefaults(defineProps<Props>(), {
  logo: ''
})

const BUILTIN_ICONS: Record<string, string> = {
  github: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
  bilibili: '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M17.813 4.653h.854c1.51 0 2.733 1.224 2.733 2.734v9.544a2.734 2.734 0 0 1-2.733 2.734H5.333A2.734 2.734 0 0 1 2.6 16.931V7.387a2.734 2.734 0 0 1 2.733-2.734h.854L4.85 3.315a.781.781 0 0 1 1.104-1.104l2.57 2.442h6.952l2.57-2.442a.781.781 0 0 1 1.104 1.104l-1.337 1.338zM5.333 6.216a1.171 1.171 0 0 0-1.17 1.171v9.544a1.171 1.171 0 0 0 1.17 1.172h13.334a1.171 1.171 0 0 0 1.17-1.172V7.387a1.171 1.171 0 0 0-1.17-1.171H5.333zm3.125 4.688a1.172 1.172 0 1 1 0 2.344 1.172 1.172 0 0 1 0-2.344zm7.084 0a1.172 1.172 0 1 1 0 2.344 1.172 1.172 0 0 1 0-2.344z"/></svg>',
}

const imgError = ref(false)

watch(() => [props.url, props.logo], () => {
  imgError.value = false
})

const platformSvg = computed(() => {
  if (props.logo && BUILTIN_ICONS[props.logo.toLowerCase()]) {
    return BUILTIN_ICONS[props.logo.toLowerCase()]
  }
  if (props.logo) return ''
  try {
    const host = new URL(props.url).hostname.toLowerCase()
    if (host === 'github.com' || host.endsWith('.github.com')) return BUILTIN_ICONS.github
    if (host === 'x.com' || host === 'twitter.com') return BUILTIN_ICONS.x
    if (host === 'discord.gg' || host === 'discord.com') return BUILTIN_ICONS.discord
    if (host === 't.me' || host.endsWith('.t.me') || host === 'telegram.me') return BUILTIN_ICONS.telegram
    if (host === 'bilibili.com' || host.endsWith('.bilibili.com')) return BUILTIN_ICONS.bilibili
  } catch {
    // ignore
  }
  return ''
})

const resolvedLogo = computed(() => {
  if (platformSvg.value) return ''
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
    <div v-if="platformSvg" class="linkcard-logo linkcard-icon" v-html="platformSvg" />
    <div v-else-if="resolvedLogo && !imgError" class="linkcard-logo">
      <img :src="resolvedLogo" :alt="props.title" @error="imgError = true" />
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
.linkcard:hover .linkcard-icon {
  color: var(--vp-c-brand-1);
}
</style>
