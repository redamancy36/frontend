import code from '@content/TextAnimations/ScrollVelocity/ScrollVelocity.vue?raw';
import { createCodeObject } from '@/types/code';

export const scrollVelocity = createCodeObject(code, 'TextAnimations/ScrollVelocity', {
  installation: `npm install gsap`,
  usage: `<template>
  <ScrollVelocity
    :texts="['Vue Bits', 'Scroll Down']"
    :velocity="100"
    :damping="50"
    :stiffness="400"
    :velocity-mapping="{ input: [0, 1000], output: [0, 5] }"
    class-name="custom-scroll-text"
    parallax-class-name="custom-parallax"
    scroller-class-name="custom-scroller"
  />
</template>

<script setup lang="ts">
  import ScrollVelocity from "./ScrollVelocity.vue";
</script>`
});
