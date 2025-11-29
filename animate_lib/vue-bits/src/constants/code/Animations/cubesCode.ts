import code from '@content/Animations/Cubes/Cubes.vue?raw';
import { createCodeObject } from '@/types/code';

export const cubes = createCodeObject(code, 'Animations/Cubes', {
  installation: `npm install gsap`,
  usage: `// CREDIT
// Component inspired from Can Tastemel's original work for the lambda.ai landing page
// https://cantastemel.com

<template>
  <Cubes 
    :grid-size="10"
    :max-angle="45"
    :radius="3"
    easing="power3.out"
    :duration="{ enter: 0.3, leave: 0.6 }"
    border-style="1px solid #fff"
    face-color="#0b0b0b"
    :shadow="false"
    :auto-animate="true"
    :ripple-on-click="true"
    ripple-color="#fff"
    :ripple-speed="2"
  />
</template>

<script setup lang="ts">
  import Cubes from "./Cubes.vue";
</script>`
});
