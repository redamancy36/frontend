import code from '@content/Backgrounds/LetterGlitch/LetterGlitch.vue?raw';
import { createCodeObject } from '../../../types/code';

export const letterGlitch = createCodeObject(code, 'Backgrounds/LetterGlitch', {
  usage: `<template>
  <div class="letter-glitch-container">
    <LetterGlitch
      :glitch-colors="['#2b4539', '#61dca3', '#61b3dc']"
      :glitch-speed="50"
      :center-vignette="false"
      :outer-vignette="false"
      :smooth="true"
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
  import LetterGlitch from "./LetterGlitch.vue";
</script>

<style scoped>
  .letter-glitch-container {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
  }
</style>`
});
