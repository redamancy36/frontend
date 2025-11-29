import code from '@/content/Animations/GlareHover/GlareHover.vue?raw';
import { createCodeObject } from '@/types/code';

export const glareHover = createCodeObject(code, 'Animations/GlareHover', {
  usage: `<template>
  <GlareHover
    width="400px"
    height="300px"
    background="#0b0b0b"
    border-color="#222222"
    border-radius="20px"
    glare-color="#ffffff"
    :glare-opacity="0.3"
    :glare-size="300"
    :transition-duration="800"
    :play-once="false"
  >
    <div class="text-center text-5xl font-black text-white">
      Hover Me
    </div>
  </GlareHover>
</template>

<script setup lang="ts">
  import GlareHover from "./GlareHover.vue";
</script>`
});
