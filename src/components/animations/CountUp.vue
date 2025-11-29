<template>
  <span ref="elementRef" :class="className">{{ displayValue }}</span>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  to: {
    type: Number,
    required: true
  },
  from: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 1.5
  },
  className: {
    type: String,
    default: ''
  },
  startWhen: {
    type: Boolean,
    default: true
  }
})

const elementRef = ref(null)
const displayValue = ref(props.from)
const animationId = ref(null)
const hasStarted = ref(false)

let velocity = 0
let startTime = 0

const damping = 20 + 40 * (1 / props.duration)
const stiffness = 100 * (1 / props.duration)

const springAnimation = (timestamp) => {
  if (!startTime) startTime = timestamp

  const target = props.to
  const current = displayValue.value
  const displacement = target - current
  const springForce = displacement * stiffness
  const dampingForce = velocity * damping
  const acceleration = springForce - dampingForce

  velocity += acceleration * 0.016
  displayValue.value += velocity * 0.016

  if (Math.abs(displacement) > 0.01 || Math.abs(velocity) > 0.01) {
    animationId.value = requestAnimationFrame(springAnimation)
  } else {
    displayValue.value = target
    animationId.value = null
  }
}

const startAnimation = () => {
  if (hasStarted.value || !props.startWhen) return
  hasStarted.value = true
  startTime = 0
  velocity = 0
  animationId.value = requestAnimationFrame(springAnimation)
}

watch(() => props.to, () => {
  displayValue.value = props.from
  hasStarted.value = false
  if (props.startWhen) {
    startAnimation()
  }
}, { immediate: true })

watch(() => props.startWhen, (newVal) => {
  if (newVal && !hasStarted.value) {
    startAnimation()
  }
})

onMounted(() => {
  if (props.startWhen) {
    startAnimation()
  }
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

