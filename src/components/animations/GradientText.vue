<template>
  <div :class="['gradient-text-wrapper', className]">
    <div
      v-if="showBorder"
      class="gradient-text-border"
      :style="borderStyle"
    />
    <div class="gradient-text" :style="textStyle">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  },
  colors: {
    type: Array,
    default: () => ['#667eea', '#764ba2', '#667eea']
  },
  animationSpeed: {
    type: Number,
    default: 8
  },
  showBorder: {
    type: Boolean,
    default: false
  }
})

const gradientStyle = computed(() => ({
  backgroundImage: `linear-gradient(to right, ${props.colors.join(', ')})`,
  backgroundSize: '300% 100%',
  '--animation-duration': `${props.animationSpeed}s`
}))

const borderStyle = computed(() => ({
  ...gradientStyle.value
}))

const textStyle = computed(() => ({
  ...gradientStyle.value,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent'
}))
</script>

<style scoped>
.gradient-text-wrapper {
  position: relative;
  display: inline-block;
}

.gradient-text-border {
  position: absolute;
  inset: 0;
  background-size: 300% 100%;
  animation: gradient var(--animation-duration, 8s) linear infinite;
  z-index: 0;
  pointer-events: none;
}

.gradient-text-border::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: currentColor;
  z-index: -1;
}

.gradient-text {
  position: relative;
  z-index: 1;
  animation: gradient var(--animation-duration, 8s) linear infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>

