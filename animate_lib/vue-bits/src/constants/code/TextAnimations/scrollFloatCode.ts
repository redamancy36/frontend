import code from '@content/TextAnimations/ScrollFloat/ScrollFloat.vue?raw';
import { createCodeObject } from '@/types/code';

export const scrollFloatCode = createCodeObject(code, 'TextAnimations/ScrollFloat', {
  installation: `npm install gsap`,
  usage: `<template>
  <ScrollFloat
    :children="scrollText"
    :animation-duration="animationDuration"
    :ease="ease"
    :scroll-start="scrollStart"
    :scroll-end="scrollEnd"
    :stagger="stagger"
    :container-class-name="containerClassName"
    :text-class-name="textClassName"
    :scroll-container-ref="{ current: containerRef }"
    :key="rerenderKey"
  />
</template>

<script setup lang="ts">
  import ScrollFloat from "./ScrollFloat.vue";
</script>`
});
