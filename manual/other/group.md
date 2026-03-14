# 社区与交流

欢迎加入麦麦社区！这里是与我们联系的各种方式。

<style>
.community-container {
  margin: 1.5rem 0;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.section-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

/* QQ Group Cards Grid */
.qq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.qq-card {
  position: relative;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.qq-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff8c00, #32cd32);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.qq-card:hover {
  border-color: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -8px rgba(255, 140, 0, 0.15);
}

.qq-card:hover::before {
  opacity: 1;
}

/* Card Top Row */
.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.group-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.type-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-tag.tech {
  background: rgba(255, 140, 0, 0.12);
  color: #ff8c00;
  border: 1px solid rgba(255, 140, 0, 0.25);
}

.type-tag.chat {
  background: rgba(50, 205, 50, 0.12);
  color: #32cd32;
  border: 1px solid rgba(50, 205, 50, 0.25);
}

.type-tag.dev {
  background: rgba(163, 113, 247, 0.12);
  color: #a371f7;
  border: 1px solid rgba(163, 113, 247, 0.25);
}

/* Dark mode tag adjustments */
.dark .type-tag.tech {
  background: rgba(255, 140, 0, 0.18);
  color: #ffb347;
}

.dark .type-tag.chat {
  background: rgba(50, 205, 50, 0.18);
  color: #6ee66e;
}

.dark .type-tag.dev {
  background: rgba(163, 113, 247, 0.18);
  color: #c49bff;
}

/* Card Content */
.group-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

/* Join Button */
.join-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ff8c00 0%, #d2691e 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(255, 140, 0, 0.25);
}

.join-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.35);
  background: linear-gradient(135deg, #ff9f2e 0%, #e07820 100%);
}

.join-btn:active {
  transform: translateY(0);
}

.join-btn svg {
  width: 14px;
  height: 14px;
}

/* Social Media Section */
.social-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.875rem;
}

.social-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.25s ease;
}

.social-card:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-bg-alt);
  transform: translateX(4px);
}

.social-card:hover .social-icon {
  transform: scale(1.1);
}

.social-icon {
  font-size: 1.5rem;
  line-height: 1;
  transition: transform 0.25s ease;
}

.social-info {
  flex: 1;
  min-width: 0;
}

.social-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.15rem;
}

.social-handle {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

/* Tip Box Styling */
.community-tip {
  margin-top: 2rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 140, 0, 0.08) 0%, rgba(50, 205, 50, 0.05) 100%);
  border: 1px solid rgba(255, 140, 0, 0.2);
  border-radius: 10px;
  border-left: 4px solid #ff8c00;
}

.community-tip p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.community-tip .tip-icon {
  font-size: 1.1rem;
}

/* Dark mode tip */
.dark .community-tip {
  background: linear-gradient(135deg, rgba(255, 140, 0, 0.12) 0%, rgba(50, 205, 50, 0.08) 100%);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .qq-grid {
    grid-template-columns: 1fr;
  }
  
  .social-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-wrap: wrap;
  }
}
</style>

<div class="community-container">

<!-- QQ Groups Section -->
<div class="section-header">
  <span class="section-icon">💬</span>
  <h2 class="section-title">QQ 群</h2>
</div>

<div class="qq-grid">

<div class="qq-card">
  <div class="card-top">
    <span class="group-icon">🧠</span>
    <span class="type-tag tech">技术交流</span>
  </div>
  <h3 class="group-name">麦麦脑电图</h3>
  <a href="https://qm.qq.com/q/RzmCiRtHEW" target="_blank" rel="noopener" class="join-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    加入群聊
  </a>
</div>

<div class="qq-card">
  <div class="card-top">
    <span class="group-icon">🔮</span>
    <span class="type-tag tech">技术交流</span>
  </div>
  <h3 class="group-name">麦麦大脑磁共振</h3>
  <a href="https://qm.qq.com/q/VQ3XZrWgMs" target="_blank" rel="noopener" class="join-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    加入群聊
  </a>
</div>

<div class="qq-card">
  <div class="card-top">
    <span class="group-icon">🎭</span>
    <span class="type-tag tech">技术交流</span>
  </div>
  <h3 class="group-name">麦麦要当VTB</h3>
  <a href="https://qm.qq.com/q/wGePTl1UyY" target="_blank" rel="noopener" class="join-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    加入群聊
  </a>
</div>

<div class="qq-card">
  <div class="card-top">
    <span class="group-icon">🌊</span>
    <span class="type-tag chat">闲聊吹水</span>
  </div>
  <h3 class="group-name">麦麦之闲聊群</h3>
  <a href="https://qm.qq.com/q/JxvHZnxyec" target="_blank" rel="noopener" class="join-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    加入群聊
  </a>
</div>

<div class="qq-card">
  <div class="card-top">
    <span class="group-icon">🧩</span>
    <span class="type-tag dev">插件开发</span>
  </div>
  <h3 class="group-name">插件开发群</h3>
  <a href="https://qm.qq.com/q/1ibfetCXoY" target="_blank" rel="noopener" class="join-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    加入群聊
  </a>
</div>

</div>

<!-- Social Media Section -->
<div class="section-header">
  <span class="section-icon">🌐</span>
  <h2 class="section-title">社交媒体</h2>
</div>

<div class="social-grid">

<a href="https://github.com/MaiM-with-u/MaiBot" target="_blank" rel="noopener" class="social-card">
  <span class="social-icon">📦</span>
  <div class="social-info">
    <div class="social-name">GitHub</div>
    <div class="social-handle">MaiM-with-u/MaiBot</div>
  </div>
</a>

<a href="https://x.com/MaiWithYou" target="_blank" rel="noopener" class="social-card">
  <span class="social-icon">✖️</span>
  <div class="social-info">
    <div class="social-name">X (Twitter)</div>
    <div class="social-handle">@MaiWithYou</div>
  </div>
</a>

<a href="https://discord.gg/UvgPVSVX" target="_blank" rel="noopener" class="social-card">
  <span class="social-icon">💬</span>
  <div class="social-info">
    <div class="social-name">Discord</div>
    <div class="social-handle">加入服务器</div>
  </div>
</a>

<a href="https://t.me/MaiWithYou" target="_blank" rel="noopener" class="social-card">
  <span class="social-icon">✈️</span>
  <div class="social-info">
    <div class="social-name">Telegram</div>
    <div class="social-handle">@MaiWithYou</div>
  </div>
</a>

</div>

<!-- Tip -->
<div class="community-tip">
  <p><span class="tip-icon">💡</span> 技术交流群仅供讨论技术问题和答疑，闲聊请加入吹水群。</p>
</div>

</div>
