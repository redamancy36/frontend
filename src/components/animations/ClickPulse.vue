<template>
  <div ref="containerRef" class="click-pulse-container" @click="handleClick">
    <div
      v-if="isPulsing"
      class="pulse-ring"
      :style="pulseStyle"
    />
    <slot />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#667eea'
  },
  duration: {
    type: Number,
    default: 600
  },
  scale: {
    type: Number,
    default: 2
  }
})

const containerRef = ref(null)
const isPulsing = ref(false)
const clickPosition = ref({ x: 0, y: 0 })

const pulseStyle = computed(() => ({
  left: clickPosition.value.x + 'px',
  top: clickPosition.value.y + 'px',
  backgroundColor: props.color,
  animationDuration: props.duration + 'ms',
  '--scale': props.scale
}))

const handleClick = (e) => {
  const container = containerRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  clickPosition.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  isPulsing.value = false
  // 触发重渲染
  setTimeout(() => {
    isPulsing.value = true
    setTimeout(() => {
      isPulsing.value = false
    }, props.duration)
  }, 10)
}
</script>

<style scoped>
.click-pulse-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.pulse-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0.8;
  animation: pulse var(--scale, 600ms) ease-out;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(var(--scale, 2));
    opacity: 0;
  }
}
</style>

