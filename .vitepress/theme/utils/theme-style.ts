/**
 * 界面风格（theme style）共享定义
 *
 * 界面风格对应 MaiBot WebUI 的 webui_style 取值：
 *   modern（0）原版 / future-retro（1）未来复古 / millennium（2）千禧
 *
 * 与明暗（light / dark）是两套正交体系：明暗由 VitePress 的 .dark 类
 * 控制，界面风格由 <html> 上的 data-theme-style 属性控制，可以自由组合。
 */

export type ThemeStyleId = 'modern' | 'future-retro' | 'millennium'

/** localStorage 存储键，组件与 index.ts 的首屏恢复共用 */
export const THEME_STYLE_STORAGE_KEY = 'maibot-docs-theme-style'

/** 所有可选风格，顺序即菜单展示顺序 */
export const THEME_STYLES: readonly ThemeStyleId[] = [
  'modern',
  'future-retro',
  'millennium',
]

export function isThemeStyleId(value: unknown): value is ThemeStyleId {
  return (
    typeof value === 'string' &&
    (THEME_STYLES as readonly string[]).includes(value)
  )
}

/** 把界面风格写到 <html> 上，modern 时移除属性以回落到默认主题 */
export function applyThemeStyle(id: ThemeStyleId) {
  const root = document.documentElement
  if (id === 'modern') root.removeAttribute('data-theme-style')
  else root.setAttribute('data-theme-style', id)
}

/** 读取持久化的选择，非法值一律回落 modern */
export function loadStoredThemeStyle(): ThemeStyleId {
  if (typeof localStorage === 'undefined') return 'modern'
  const saved = localStorage.getItem(THEME_STYLE_STORAGE_KEY)
  return isThemeStyleId(saved) ? saved : 'modern'
}

export function storeThemeStyle(id: ThemeStyleId) {
  localStorage.setItem(THEME_STYLE_STORAGE_KEY, id)
}