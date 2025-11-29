<template>
  <div
    ref="containerRef"
    :class="['glare-hover-container', className]"
    :style="containerStyle"
    @mouseenter="animateIn"
    @mouseleave="animateOut"
  >
    <div ref="overlayRef" :style="overlayStyle" class="glare-overlay" />
    <slot />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  glareColor: {
    type: String,
    default: '#ffffff'
  },
  glareOpacity: {
    type: Number,
    default: 0.3
  },
  glareAngle: {
    type: Number,
    default: -45
  },
  transitionDuration: {
    type: Number,
    default: 600
  },
  className: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)
const overlayRef = ref(null)

const hexToRgba = (hex, opacity) => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

const rgba = computed(() => {
  return hexToRgba(props.glareColor, props.glareOpacity)
})

const containerStyle = computed(() => ({
  position: 'relative',
  overflow: 'hidden'
}))

const overlayStyle = computed(() => ({
  position: 'absolute',
  inset: '0',
  background: `linear-gradient(${props.glareAngle}deg,
    hsla(0,0%,0%,0) 60%,
    ${rgba.value} 70%,
    hsla(0,0%,0%,0) 100%)`,
  backgroundSize: '250% 250%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '-100% -100%',
  pointerEvents: 'none',
  transition: 'none'
}))

const animateIn = () => {
  const el = overlayRef.value
  if (!el) return
  el.style.transition = 'none'
  el.style.backgroundPosition = '-100% -100%'
  void el.offsetHeight
  el.style.transition = `${props.transitionDuration}ms ease`
  el.style.backgroundPosition = '100% 100%'
}

const animateOut = () => {
  const el = overlayRef.value
  if (!el) return
  el.style.transition = `${props.transitionDuration}ms ease`
  el.style.backgroundPosition = '-100% -100%'
}
</script>

<style scoped>
.glare-hover-container {
  cursor: pointer;
}

.glare-overlay {
  z-index: 1;
}
</style>

