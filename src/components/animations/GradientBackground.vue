<template>
  <div class="gradient-background" :style="gradientStyle"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  colors: {
    type: Array,
    default: () => ['#667eea', '#764ba2', '#667eea']
  },
  speed: {
    type: Number,
    default: 15
  }
})

const gradientStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.colors[0]} 0%, ${props.colors[1]} 50%, ${props.colors[2]} 100%)`,
  backgroundSize: '200% 200%',
  animation: `gradientShift ${props.speed}s ease infinite`
}))
</script>

<style scoped>
.gradient-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>

