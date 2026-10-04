import { defineAsyncComponent, onMounted, watch, nextTick } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { inBrowser, useRoute } from 'vitepress'
import { NProgress } from 'nprogress-v2/dist/index.js'
import 'nprogress-v2/dist/index.css'
import { NolebaseInlineLinkPreviewPlugin } from '@nolebase/vitepress-plugin-inline-link-preview/client'
import mediumZoom from 'medium-zoom'
import MyLayout from './components/MyLayout.vue'
import ArticleMetadata from './components/ArticleMetadata.vue'

import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'
import 'vitepress-markdown-timeline/dist/theme/index.css'
import 'virtual:group-icons.css'
import './style.css'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    let zoom: ReturnType<typeof mediumZoom> | undefined
    const initZoom = () => {
      // Detach the previous instance before attaching a new one, otherwise
      // every route change leaves a zoom instance listening on the old DOM.
      zoom?.detach()
      zoom = mediumZoom('.main img', { background: 'var(--vp-c-bg)' })
    }
    onMounted(() => {
      initZoom()
    })
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  },
  Layout: MyLayout,
  enhanceApp({ app, router }) {
    app.use(NolebaseInlineLinkPreviewPlugin)
    app.component('xgplayer', defineAsyncComponent(() => import('./components/xgplayer.vue')))
    app.component('ArticleMetadata', ArticleMetadata)
    app.component('Linkcard', defineAsyncComponent(() => import('./components/Linkcard.vue')))
    app.component('AuroraBackground', defineAsyncComponent(() => import('./components/AuroraBackground.vue')))

    if (inBrowser) {
      NProgress.configure({ showSpinner: false })
      router.onBeforeRouteChange = () => { NProgress.start() }
      router.onAfterRouteChanged = () => { NProgress.done() }
    }
  }
} satisfies Theme
