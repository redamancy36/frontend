import code from '@content/TextAnimations/ScrollReveal/ScrollReveal.vue?raw';
import { createCodeObject } from '@/types/code';

export const scrollRevealCode = createCodeObject(code, 'TextAnimations/ScrollReveal', {
  installation: `npm install gsap`,
  usage: `<template>
    <ScrollReveal
      :children="scrollText"
      :enable-blur="enableBlur"
      :base-opacity="baseOpacity"
      :base-rotation="baseRotation"
      :blur-strength="blurStrength"
      :container-class-name="containerClassName"
      :text-class-name="textClassName"
      :rotation-end="rotationEnd"
      :word-animation-end="wordAnimationEnd"
      :scroll-container-ref="{ current: containerRef }"
      :key="rerenderKey"
    />
</template>

<script setup lang="ts">
  import ScrollReveal from "./ScrollReveal.vue";
</script>`
});
