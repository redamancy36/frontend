<template>
  <div ref="containerRef" class="click-ripple-container" @click="handleClick">
    <div
      v-for="(ripple, index) in ripples"
      :key="index"
      class="ripple"
      :style="getRippleStyle(ripple)"
    />
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#667eea'
  },
  duration: {
    type: Number,
    default: 800
  },
  maxScale: {
    type: Number,
    default: 4
  },
  opacity: {
    type: Number,
    default: 0.6
  }
})

const containerRef = ref(null)
const ripples = ref([])
const animationId = ref(null)

const handleClick = (e) => {
  const container = containerRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const ripple = {
    x,
    y,
    startTime: performance.now(),
    id: Date.now() + Math.random()
  }

  ripples.value.push(ripple)

  // 限制同时存在的涟漪数量
  if (ripples.value.length > 3) {
    ripples.value.shift()
  }

  // 启动动画
  if (!animationId.value) {
    animate()
  }
}

const getRippleStyle = (ripple) => {
  const elapsed = performance.now() - ripple.startTime
  const progress = Math.min(elapsed / props.duration, 1)
  const scale = 1 + (props.maxScale - 1) * progress
  const opacity = props.opacity * (1 - progress)

  return {
    left: ripple.x + 'px',
    top: ripple.y + 'px',
    transform: `translate(-50%, -50%) scale(${scale})`,
    opacity: opacity,
    backgroundColor: props.color
  }
}

const animate = () => {
  const now = performance.now()
  
  // 移除过期的涟漪
  ripples.value = ripples.value.filter(ripple => {
    return (now - ripple.startTime) < props.duration
  })

  if (ripples.value.length > 0) {
    animationId.value = requestAnimationFrame(animate)
  } else {
    animationId.value = null
  }
}

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<style scoped>
.click-ripple-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ripple {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: opacity 0.1s linear;
}
</style>

