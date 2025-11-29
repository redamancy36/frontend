<template>
  <div ref="containerRef" class="animated-background" :class="className">
    <canvas ref="canvasRef" class="background-canvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'gradient', // 'gradient' | 'particles' | 'waves'
    validator: (value) => ['gradient', 'particles', 'waves'].includes(value)
  },
  colors: {
    type: Array,
    default: () => ['#667eea', '#764ba2']
  },
  className: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)
const canvasRef = ref(null)
const animationId = ref(null)

onMounted(() => {
  if (props.type === 'gradient') {
    // 渐变背景不需要 canvas
    return
  }
  
  const canvas = canvasRef.value
  if (!canvas) return
  
  const resizeCanvas = () => {
    if (!containerRef.value) return
    const { width, height } = containerRef.value.getBoundingClientRect()
    canvas.width = width
    canvas.height = height
  }
  
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  
  if (props.type === 'particles') {
    drawParticles(canvas)
  } else if (props.type === 'waves') {
    drawWaves(canvas)
  }
  
  return () => {
    window.removeEventListener('resize', resizeCanvas)
  }
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})

function drawParticles(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const particles = []
  const particleCount = 50
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    })
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(particle => {
      particle.x += particle.speedX
      particle.y += particle.speedY
      
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1
      
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`
      ctx.fill()
    })
    
    animationId.value = requestAnimationFrame(animate)
  }
  
  animate()
}

function drawWaves(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  let time = 0
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, props.colors[0] || '#667eea')
    gradient.addColorStop(1, props.colors[1] || '#764ba2')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    
    const waveHeight = 50
    const frequency = 0.01
    
    ctx.moveTo(0, canvas.height / 2)
    
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * frequency + time) * waveHeight
      ctx.lineTo(x, y)
    }
    
    ctx.lineTo(canvas.width, canvas.height)
    ctx.lineTo(0, canvas.height)
    ctx.closePath()
    ctx.fill()
    
    time += 0.02
    animationId.value = requestAnimationFrame(animate)
  }
  
  animate()
}
</script>

<style scoped>
.animated-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.animated-background.gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.background-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

