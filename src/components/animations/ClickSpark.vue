<template>
  <div ref="containerRef" class="click-spark-container" @click="handleClick">
    <canvas ref="canvasRef" class="click-spark-canvas" />
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  sparkColor: {
    type: String,
    default: '#667eea'
  },
  sparkSize: {
    type: Number,
    default: 15  // 增大火花大小
  },
  sparkRadius: {
    type: Number,
    default: 60  // 增大扩散半径
  },
  sparkCount: {
    type: Number,
    default: 20  // 增加火花数量
  },
  duration: {
    type: Number,
    default: 700  // 延长持续时间
  }
})

const containerRef = ref(null)
const canvasRef = ref(null)
const sparks = ref([])
const animationId = ref(null)

const handleClick = (e) => {
  // 阻止事件冒泡，但允许点击继续
  e.stopPropagation()
  
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) {
    console.warn('[ClickSpark] Canvas or container not found')
    return
  }
  
  // 确保 canvas 尺寸正确
  resizeCanvas()
  
  const rect = container.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const now = performance.now()
  const newSparks = Array.from({ length: props.sparkCount }, (_, i) => ({
    x,
    y,
    angle: (2 * Math.PI * i) / props.sparkCount,
    startTime: now
  }))

  sparks.value.push(...newSparks)
  
  // 确保动画循环正在运行
  if (!animationId.value) {
    const animate = (timestamp) => {
      draw(timestamp)
      if (sparks.value.length > 0) {
        animationId.value = requestAnimationFrame(animate)
      } else {
        animationId.value = null
      }
    }
    animationId.value = requestAnimationFrame(animate)
  }
}

const draw = (timestamp) => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!ctx || !canvas) return

  // 清除画布（考虑 devicePixelRatio）
  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

  sparks.value = sparks.value.filter((spark) => {
    const elapsed = timestamp - spark.startTime
    if (elapsed >= props.duration) {
      return false
    }

    const progress = elapsed / props.duration
    const eased = progress * (2 - progress) // ease-out

    const distance = eased * props.sparkRadius
    const lineLength = props.sparkSize * (1 - eased)

    const x1 = spark.x + distance * Math.cos(spark.angle)
    const y1 = spark.y + distance * Math.sin(spark.angle)
    const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
    const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

    ctx.strokeStyle = props.sparkColor
    ctx.lineWidth = 3  // 增加线条宽度
    ctx.lineCap = 'round'  // 圆角端点
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    return true
  })

  if (sparks.value.length > 0) {
    animationId.value = requestAnimationFrame(draw)
  } else {
    animationId.value = null
  }
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const rect = container.getBoundingClientRect()
  const width = Math.max(rect.width, 1)
  const height = Math.max(rect.height, 1)
  
  // 使用 devicePixelRatio 提高清晰度
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

let resizeObserver = null

onMounted(() => {
  // 延迟初始化，确保 DOM 完全渲染
  setTimeout(() => {
    resizeCanvas()
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas()
      })
      resizeObserver.observe(containerRef.value)
    }
    
    // 启动动画循环（只在有火花时运行）
    const animate = (timestamp) => {
      draw(timestamp)
      if (sparks.value.length > 0) {
        animationId.value = requestAnimationFrame(animate)
      } else {
        animationId.value = null
      }
    }
    // 不立即启动，等有火花时再启动
  }, 100)
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<style scoped>
.click-spark-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.click-spark-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
</style>

