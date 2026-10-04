<template>
  <div class="aurora-bg" aria-hidden="true">
    <div class="aurora-blob aurora-blob--1"></div>
    <div class="aurora-blob aurora-blob--2"></div>
    <div class="aurora-blob aurora-blob--3"></div>
    <div class="aurora-blob aurora-blob--4"></div>
    <div class="aurora-blob aurora-blob--5"></div>
    <div class="aurora-blob aurora-blob--6"></div>
  </div>
</template>

<style scoped>
/* ------------------------------------------------------------------
 * AuroraBackground — Gemini-style flowing aurora glow.
 * Pure CSS keyframes, no canvas / WebGL / JS. SSR-safe.
 * Mounted only on the home page (not global Layout) to avoid
 * distracting readers on doc pages.
 * ------------------------------------------------------------------ */

.aurora-bg {
  position: fixed;
  inset: 0;
  /* Negative z-index paints aurora BELOW normal-flow content in the root
     stacking context (paint phase 2), so the fixed blob layer never covers
     text/buttons regardless of which parent (VitePress .VPHome / .vp-doc)
     it happens to be rendered inside. Do NOT bump this to 0 or higher. */
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  /* Form an isolated stacking context so the blobs' mix-blend-mode stays
     contained within this background layer and never bleeds into (i.e.
     "white-fogs") the VitePress content above. */
  isolation: isolate;
  /* default (light) base */
  background: #ffffff;
}

.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  /* Default blend: normal -- blobs just paint semi-transparently on the base.
     Mode-specific overrides live below. Do NOT set `screen` globally, or in
     light mode the blobs vanish on white (white + x = white via screen) and
     in dark mode the blobs bleed across the transparent .VPHome container
     onto the text, producing the "thick fog cover" users saw. */
  mix-blend-mode: normal;
  will-change: transform;
  opacity: 0.9;
}

/* ---- Light mode: "五彩斑斓的白" — very faint warm-dominant blobs
    with a couple of cool accents. Normal blend with raised alpha so the
    colours are actually visible on white (screen-on-white = white). ---- */
.aurora-blob--1 {
  width: 42vw;
  height: 42vw;
  top: -8vw;
  left: -6vw;
  background: radial-gradient(circle at center,
    rgba(255, 140, 0, 0.28), transparent 70%);
  animation: aurora-float-1 48s ease-in-out infinite;
}
.aurora-blob--2 {
  width: 38vw;
  height: 38vw;
  top: 10vh;
  right: -8vw;
  background: radial-gradient(circle at center,
    rgba(255, 169, 64, 0.24), transparent 70%);
  animation: aurora-float-2 54s ease-in-out infinite;
}
.aurora-blob--3 {
  width: 34vw;
  height: 34vw;
  bottom: -6vw;
  left: 18vw;
  background: radial-gradient(circle at center,
    rgba(199, 81, 41, 0.22), transparent 70%);
  animation: aurora-float-3 42s ease-in-out infinite;
}
.aurora-blob--4 {
  width: 30vw;
  height: 30vw;
  top: 38vh;
  left: 32vw;
  background: radial-gradient(circle at center,
    rgba(244, 114, 182, 0.22), transparent 70%);
  animation: aurora-float-4 60s ease-in-out infinite;
}
.aurora-blob--5 {
  width: 26vw;
  height: 26vw;
  bottom: 12vh;
  right: 14vw;
  background: radial-gradient(circle at center,
    rgba(56, 189, 248, 0.20), transparent 70%);
  animation: aurora-float-5 50s ease-in-out infinite;
}
.aurora-blob--6 {
  width: 22vw;
  height: 22vw;
  top: 6vh;
  left: 44vw;
  background: radial-gradient(circle at center,
    rgba(255, 200, 120, 0.24), transparent 70%);
  animation: aurora-float-6 44s ease-in-out infinite;
}

/* ---- Dark mode: "五彩斑斓的黑" — near-black base, saturated neon
    blobs with larger blur for a glow feel. SCREEN blend here is safe:
    it only mixes blobs with each other inside the isolated .aurora-bg,
    never with the VitePress content layer above.
    NOTE: the whole compound selector must live inside :global() — Vue's
    scoped-CSS compiler only honours :global() when it wraps the ENTIRE
    selector. `:global(html.dark) .aurora-bg` (half-scoped) silently
    fails to apply, leaving the light-mode #fff base on the fixed layer
    and "white-fogging" the whole page in dark mode. ---- */
:global(html.dark .aurora-bg) {
  background: #0a0a0f;
}
:global(html.dark .aurora-blob) {
  filter: blur(80px);
  mix-blend-mode: screen;
  opacity: 1;
}
:global(html.dark .aurora-blob--1) {
  background: radial-gradient(circle at center,
    rgba(255, 140, 0, 0.40), transparent 70%);
}
:global(html.dark .aurora-blob--2) {
  background: radial-gradient(circle at center,
    rgba(255, 169, 64, 0.34), transparent 70%);
}
:global(html.dark .aurora-blob--3) {
  background: radial-gradient(circle at center,
    rgba(199, 81, 41, 0.32), transparent 70%);
}
:global(html.dark .aurora-blob--4) {
  background: radial-gradient(circle at center,
    rgba(244, 114, 182, 0.30), transparent 70%);
}
:global(html.dark .aurora-blob--5) {
  background: radial-gradient(circle at center,
    rgba(56, 189, 248, 0.26), transparent 70%);
}
:global(html.dark .aurora-blob--6) {
  background: radial-gradient(circle at center,
    rgba(255, 200, 120, 0.32), transparent 70%);
}

/* ---- Keyframes: slow, large, non-linear drift ---- */
@keyframes aurora-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(8vw, 6vh) scale(1.12); }
  66%      { transform: translate(-4vw, 10vh) scale(0.92); }
}
@keyframes aurora-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-10vw, 8vh) scale(0.9); }
  66%      { transform: translate(6vw, -6vh) scale(1.15); }
}
@keyframes aurora-float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(12vw, -8vh) scale(1.1); }
  66%      { transform: translate(-8vw, 4vh) scale(0.95); }
}
@keyframes aurora-float-4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-14vw, 10vh) scale(1.08); }
  66%      { transform: translate(10vw, -12vh) scale(0.88); }
}
@keyframes aurora-float-5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(10vw, -10vh) scale(0.9); }
  66%      { transform: translate(-12vw, 6vh) scale(1.18); }
}
@keyframes aurora-float-6 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-6vw, 12vh) scale(1.12); }
  66%      { transform: translate(8vw, -8vh) scale(0.94); }
}

/* ---- Reduced motion: freeze blobs in place ---- */
@media (prefers-reduced-motion: reduce) {
  .aurora-blob {
    animation: none !important;
  }
}
</style>