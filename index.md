---
layout: home
title: MaiBot 文档中心
hero:
  name: MaiBot
  text: 多模型、拟人化、可扩展的智能体
  tagline: 多种模型协作，仿生的思考规划架构，模块化设计和内部扩展性带来拟人化的交互体验
  image:
    src: /images/mai.png
    alt: MaiBot
  actions:
    - theme: brand
      text: 功能介绍
      link: /features
    - theme: brand
      text: 用户指南
      link: /manual/
    - theme: alt
      text: 开发文档
      link: /develop/
features:
  - icon: 🧠
    title: 好多LLM
    details: 基于多个LLM配合协作，带来自然语言理解与生成能力
  - icon: 💾
    title: 能够记点东西
    details: 能记住交流中发生的事，也能记住人类是怎么说话的
  - icon: ❤️
    title: 仿生的思考
    details: 参考认知科学理论的模块化设计，并可以进行拓展
  - icon: 🔧
    title: 灵活配置
    details: 支持多种API服务，个性化设置轻松实现
  - icon: 🚢
    title: 多种部署
    details: 支持启动器、Docker、Linux、Windows等多种部署方式
  - icon: 🔄
    title: 持续更新
    details: 定期更新和改进，不断增强功能与性能
---

## 🔍 快速搜索提示

使用页面右上角的搜索框可以快速查找文档内容。以下是一些搜索技巧：

- **按类别搜索**: 如"安装"、"配置"、"插件"、"API"
- **使用具体关键词**: 如"Windows部署"、"Docker安装"、"TTS配置"
- **查看文档地图**: 使用[文档地图](/sitemap)了解完整文档结构
- **利用导航**: 通过顶部导航栏快速跳转到主要章节

## 获取更多支持

- 访问[GitHub仓库](https://github.com/MaiM-with-u/MaiBot)提交问题或贡献代码
- 加入用户交流群获取帮助

<style scoped>
#star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.VPHome {
  position: relative;
  z-index: 1;
}
</style>

<canvas id="star-canvas"></canvas>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'

// 普通封面图片列表
const normalImages = [
  '/title_img/mai.png',
  '/title_img/mai2.png',
  '/title_img/emoji1.png',
  '/title_img/emoji2.png',
  '/title_img/emoji3.png',
]

// 隐藏款图片（出现概率是其他图片的1/10）
const hiddenImage = '/title_img/dis.png'

let animationFrameId = null
let particles = []

onMounted(async () => {
  await nextTick()
  
  // 加权随机选择：dis.png 概率为其他图片的 1/5
  // 创建一个加权数组：其他图片各出现5次，隐藏款出现1次
  const weightedImages = [
    ...normalImages.map(img => Array(5).fill(img)).flat(), // 每张普通图片出现5次
    hiddenImage // 隐藏款出现1次
  ]
  
  // 随机选择一张图片
  const randomImage = weightedImages[Math.floor(Math.random() * weightedImages.length)]
  
  // 尝试多种选择器来查找 hero 图片
  const selectors = [
    '.VPHomeHero .VPImage img',
    '.VPHomeHero img',
    'main .VPImage img',
    '[alt="MaiBot"]'
  ]
  
  let heroImage = null
  for (const selector of selectors) {
    heroImage = document.querySelector(selector)
    if (heroImage) break
  }
  
  // 设置图片的函数
  const setImage = (imgElement, imageSrc) => {
    imgElement.src = imageSrc
    imgElement.alt = 'MaiBot'
    // 如果是 emoji4.png，缩放到 1.5 倍
    if (imageSrc.includes('emoji4.png')) {
      imgElement.style.transform = 'scale(1.5)'
      imgElement.style.transformOrigin = 'center'
    } else {
      // 重置其他图片的缩放
      imgElement.style.transform = ''
      imgElement.style.transformOrigin = ''
    }
  }
  
  // 如果找到了图片元素，替换它
  if (heroImage) {
    setImage(heroImage, randomImage)
  } else {
    // 如果没找到，延迟再试一次（等待 VitePress 渲染完成）
    setTimeout(() => {
      for (const selector of selectors) {
        heroImage = document.querySelector(selector)
        if (heroImage) {
          setImage(heroImage, randomImage)
          break
        }
      }
    }, 100)
  }
  
  // 初始化星星特效
  initStarEffect()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

function initStarEffect() {
  const canvas = document.getElementById('star-canvas')
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  let width = canvas.width = window.innerWidth
  let height = canvas.height = window.innerHeight
  
  const config = {
    spawnRate: 12,
    startSpeed: 0.6,
    attraction: 0.015,
    mouseForce: 0.05,
    maxMouseForce: 1.5,
    maxStarSpeed: 3.0,
    friction: 0.98,
    minDriftSpeed: 0.3,
    starBaseSize: 4,
    circleRadius: 600
  }
  
  const mouse = {
    x: undefined,
    y: undefined,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
    isMoving: false,
    timer: null
  }
  
  const resize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  
  window.addEventListener('resize', resize)
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x
    mouse.y = e.y
    mouse.vx = e.x - mouse.lastX
    mouse.vy = e.y - mouse.lastY
    mouse.lastX = e.x
    mouse.lastY = e.y
    mouse.isMoving = true
    
    clearTimeout(mouse.timer)
    mouse.timer = setTimeout(() => {
      mouse.vx = 0
      mouse.vy = 0
      mouse.isMoving = false
      mouse.x = undefined
      mouse.y = undefined
    }, 100)
  })
  
  class Star {
    constructor(centerX, centerY) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * config.circleRadius * 0.3 + config.circleRadius * 0.1
      this.x = centerX + Math.cos(angle) * radius
      this.y = centerY + Math.sin(angle) * radius
      
      const driftAngle = angle + (Math.random() - 0.5) * 0.5
      const speed = config.startSpeed + Math.random() * 0.3
      
      this.vx = Math.cos(driftAngle) * speed
      this.vy = Math.sin(driftAngle) * speed
      
      this.size = Math.random() * 5 + config.starBaseSize
      this.life = 1
      this.decay = Math.random() * 0.001 + 0.0015
      this.hue = Math.random() * 60 + 180
    }
    
    draw(ctx) {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(this.life * 0.5)
      
      ctx.beginPath()
      const r = this.size
      ctx.moveTo(0, -r)
      ctx.quadraticCurveTo(0, 0, r, 0)
      ctx.quadraticCurveTo(0, 0, 0, r)
      ctx.quadraticCurveTo(0, 0, -r, 0)
      ctx.quadraticCurveTo(0, 0, 0, -r)
      ctx.closePath()
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
      gradient.addColorStop(0, `hsla(${this.hue}, 80%, 80%, ${this.life})`)
      gradient.addColorStop(1, `hsla(${this.hue}, 80%, 50%, ${this.life})`)
      
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.restore()
    }
    
    update() {
      if (mouse.x !== undefined) {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx*dx + dy*dy)
        
        if (distance < 300) {
          const forceX = dx / distance
          const forceY = dy / distance
          
          this.vx += forceX * config.attraction
          this.vy += forceY * config.attraction
          
          if (mouse.isMoving) {
            let pushX = mouse.vx * config.mouseForce
            let pushY = mouse.vy * config.mouseForce
            
            const pushStrength = Math.sqrt(pushX * pushX + pushY * pushY)
            if (pushStrength > config.maxMouseForce) {
              const scale = config.maxMouseForce / pushStrength
              pushX *= scale
              pushY *= scale
            }
            
            this.vx += pushX
            this.vy += pushY
          }
        }
      }
      
      this.vx *= config.friction
      this.vy *= config.friction
      
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
      if (currentSpeed > config.maxStarSpeed) {
        const scale = config.maxStarSpeed / currentSpeed
        this.vx *= scale
        this.vy *= scale
      }
      
      if (currentSpeed < config.minDriftSpeed) {
        const heroImage = document.querySelector('.VPHomeHero .VPImage img') || 
                         document.querySelector('.VPHomeHero img')
        if (heroImage) {
          const rect = heroImage.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          const angleToCenter = Math.atan2(this.y - centerY, this.x - centerX)
          this.vx += Math.cos(angleToCenter) * 0.005
          this.vy += Math.sin(angleToCenter) * 0.005
        }
      }
      
      this.x += this.vx
      this.y += this.vy
      this.hue += 0.2
      this.life -= this.decay
    }
  }
  
  let frame = 0
  
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    
    ctx.clearRect(0, 0, width, height)
    
    ctx.globalCompositeOperation = 'lighter'
    
    frame++
    
    // 获取图标位置
    const heroImage = document.querySelector('.VPHomeHero .VPImage img') || 
                     document.querySelector('.VPHomeHero img')
    
    if (heroImage && frame % config.spawnRate === 0) {
      const rect = heroImage.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      particles.push(new Star(centerX, centerY))
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.update()
      p.draw(ctx)
      
      if (p.life <= 0) {
        particles.splice(i, 1)
      }
    }
    
    ctx.globalCompositeOperation = 'source-over'
  }
  
  animate()
}
</script>