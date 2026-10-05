<script setup lang="ts">
/**
 * ThemeStyleSwitch — 外观菜单：明暗切换 + 界面风格切换
 *
 * 明暗（浅色/深色）复用 VitePress 的 toggle-appearance 注入（MyLayout
 * 提供，带从点击坐标展开的圆形揭示动效）；界面风格对应 MaiBot WebUI
 * 的 webui_style：0 原版 / 1 未来复古 / 2 千禧。
 *
 * 明暗与风格是两套正交体系，可自由组合：
 *   明暗 → html.dark 类（VitePress 原生）
 *   风格 → html[data-theme-style] 属性（样式在 theme/styles/ 下定义）
 * 共享常量与工具函数在 utils/theme-style.ts。
 */
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useData } from 'vitepress'
import {
  THEME_STYLES,
  applyThemeStyle,
  loadStoredThemeStyle,
  storeThemeStyle,
} from '../utils/theme-style'
import type { ThemeStyleId } from '../utils/theme-style'

const { lang, isDark } = useData()
const route = useRoute()

const current = ref<ThemeStyleId>('modern')
const open = ref(false)
const rootEl = ref<HTMLElement>()

/* 明暗切换：与 VPSwitchAppearance 同名注入键，MyLayout 里带圆形揭示动效 */
const toggleAppearance = inject<
  (e: { clientX: number; clientY: number }) => void
>('toggle-appearance', () => {
  isDark.value = !isDark.value
})

/* 菜单文案（风格描述与 MaiBot WebUI 外观设置一致） */
const i18n = {
  zh: {
    appearance: '外观',
    light: '浅色',
    dark: '深色',
    label: '界面风格',
    items: {
      modern: ['原版', 'MaiBot 橙色的现代外观'],
      'future-retro': ['未来复古', '纸面颗粒、硬朗描边与切角面板'],
      millennium: ['千禧', '米黄机壳、键帽按钮与像素字'],
    },
  },
  en: {
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    label: 'Theme Style',
    items: {
      modern: ['Classic', 'Modern look in MaiBot orange'],
      'future-retro': ['Future Retro', 'Paper grain and hard ink strokes'],
      millennium: ['Millennium', 'Beige shell, keycaps and pixel type'],
    },
  },
} as const

const t = computed(() => (lang.value.toLowerCase().startsWith('zh') ? i18n.zh : i18n.en))

/* 菜单里的迷你色板：[背景, 主色, 点缀色] */
const SWATCHES: Record<ThemeStyleId, readonly [string, string, string]> = {
  modern: ['#ffffff', '#ff8c00', '#d2691e'],
  'future-retro': ['#f3eccc', '#c24d24', '#0d4550'],
  millennium: ['#ddd4bf', '#8fd6a0', '#2a7d50'],
}

const options = computed(() =>
  THEME_STYLES.map((id) => {
    const [name, description] = t.value.items[id]
    return { id, name, description, swatches: SWATCHES[id] }
  })
)

/* ------------------------------------------------------------------
 * 明暗：把点击坐标交给注入的 toggle-appearance，
 * 圆形揭示动效就从菜单项的位置展开（与原开关行为一致）
 * ------------------------------------------------------------------ */
function selectAppearance(mode: 'light' | 'dark', event: MouseEvent) {
  if (isDark.value === (mode === 'dark')) {
    open.value = false
    return
  }
  open.value = false
  toggleAppearance(event)
}

/* ------------------------------------------------------------------
 * 风格：支持时用 View Transition 交叉淡化（见 base.css），否则直接切换
 * ------------------------------------------------------------------ */
function select(id: ThemeStyleId) {
  if (id === current.value) {
    open.value = false
    return
  }

  const commit = () => {
    applyThemeStyle(id)
    current.value = id
    storeThemeStyle(id)
  }

  const animate =
    'startViewTransition' in document &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches

  open.value = false

  if (!animate) {
    commit()
    return
  }

  const transition = document.startViewTransition(() => {
    document.documentElement.classList.add('theme-style-switching')
    commit()
  })

  transition.finished.finally(() => {
    document.documentElement.classList.remove('theme-style-switching')
  })
}

function onPointerDown(e: PointerEvent) {
  if (!rootEl.value || !rootEl.value.contains(e.target as Node)) open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  current.value = loadStoredThemeStyle()
  applyThemeStyle(current.value)
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})

/* 路由变化时收起菜单，避免移动端残留展开态 */
watch(() => route.path, () => (open.value = false))
</script>

<template>
  <div ref="rootEl" class="theme-style-switch">
    <button
      class="style-trigger"
      :class="{ open }"
      type="button"
      :aria-label="t.appearance"
      :title="t.appearance"
      @click="open = !open"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.473 5.555-5.555C21.965 6.012 17.461 2 12 2z"
        />
      </svg>
    </button>

    <Transition name="style-menu">
      <div v-if="open" class="style-menu" role="menu" :aria-label="t.appearance">
        <!-- 明暗：复用注入的 toggle-appearance（带圆形揭示动效） -->
        <p class="style-menu-title">{{ t.appearance }}</p>
        <div class="appearance-row">
          <button
            class="appearance-option"
            :class="{ active: !isDark }"
            type="button"
            role="menuitemradio"
            :aria-checked="!isDark"
            @click="selectAppearance('light', $event)"
          >
            <span class="vpi-sun appearance-icon" aria-hidden="true" />
            {{ t.light }}
          </button>
          <button
            class="appearance-option"
            :class="{ active: isDark }"
            type="button"
            role="menuitemradio"
            :aria-checked="isDark"
            @click="selectAppearance('dark', $event)"
          >
            <span class="vpi-moon appearance-icon" aria-hidden="true" />
            {{ t.dark }}
          </button>
        </div>

        <!-- 界面风格 -->
        <p class="style-menu-title">{{ t.label }}</p>
        <button
          v-for="option in options"
          :key="option.id"
          class="style-option"
          :class="{ active: option.id === current }"
          type="button"
          role="menuitemradio"
          :aria-checked="option.id === current"
          @click="select(option.id)"
        >
          <span class="style-option-body">
            <span class="style-option-name">{{ option.name }}</span>
            <span class="style-option-desc">{{ option.description }}</span>
          </span>
          <span class="style-swatches" aria-hidden="true">
            <i
              v-for="(color, index) in option.swatches"
              :key="index"
              class="swatch"
              :style="{ backgroundColor: color }"
            />
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.theme-style-switch {
  position: relative;
  display: flex;
  align-items: center;
}

/* 触发按钮：与 VPFlyout（阅读菜单等导航栏图标按钮）同规格——
   全导航栏高度、无背景，悬停只变色，图标 20px 描边风格 */
.style-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--vp-nav-height);
  padding: 0 12px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: color 0.25s;
}

.style-trigger:hover,
.style-trigger.open {
  color: var(--vp-c-brand-1);
}

/* 移动端抽屉里不需要整条导航栏高度 */
@media (max-width: 767px) {
  .style-trigger {
    height: 40px;
    padding: 0 10px;
  }
}

/* 下拉面板 */
.style-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 32;
  margin-top: 8px;
  min-width: 224px;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
}

.style-menu-title {
  margin: 4px 8px 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.style-menu-title + .style-menu-title {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--vp-c-divider);
}

/* 明暗分段选择 */
.appearance-row {
  display: flex;
  gap: 4px;
  padding: 2px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
}

.appearance-option {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.appearance-option:hover {
  color: var(--vp-c-text-1);
}

.appearance-option.active {
  border-color: var(--vp-c-brand-2);
  background-color: var(--vp-c-bg-elv);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.appearance-icon {
  font-size: 14px;
}

/* 界面风格选项 */
.style-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.style-option:hover {
  background-color: var(--vp-c-bg-soft);
}

.style-option.active {
  border-color: var(--vp-c-brand-2);
  background-color: var(--vp-c-brand-soft);
}

.style-option-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.style-option-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.style-option-desc {
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.style-swatches {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider);
}

/* 展开 / 收起动画 */
.style-menu-enter-active,
.style-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.style-menu-enter-from,
.style-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>