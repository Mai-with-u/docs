<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import 'xgplayer/dist/index.min.css'

const { lang } = useData()

interface Props {
  url: string
  poster?: string
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  poster: '',
  width: '100%',
  height: 'auto'
})

const playerRef = ref<HTMLElement>()
const player = shallowRef<any>(null)

onMounted(async () => {
  if (typeof window === 'undefined') return
  if (!playerRef.value) return
  try {
    const { default: Player } = await import('xgplayer')
    player.value = new Player({
      el: playerRef.value,
      url: props.url,
      poster: props.poster,
      width: props.width,
      height: props.height,
    })
  } catch (e) {
    console.error('xgplayer init failed:', e)
    if (playerRef.value) {
      const errorText = lang.value.startsWith('en') ? 'Video failed to load' : '视频加载失败'
      playerRef.value.innerHTML = `<p style="padding:16px;text-align:center;color:var(--vp-c-text-2)">${errorText}</p>`
    }
  }
})

onUnmounted(() => {
  if (player.value) {
    player.value.destroy()
    player.value = null
  }
})
</script>

<template>
  <div ref="playerRef" class="xgplayer-container"></div>
</template>

<style scoped>
.xgplayer-container {
  width: 100%;
  min-height: 360px;
  background: #000;
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
