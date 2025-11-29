import code from '@content/Backgrounds/Aurora/Aurora.vue?raw';
import { createCodeObject } from '../../../types/code';

export const aurora = createCodeObject(code, 'Backgrounds/Aurora', {
  installation: `npm install ogl`,
  usage: `<template>
  <div class="aurora-container">
    <Aurora
      :color-stops="['#7cff67', '#171D22', '#7cff67']"
      :amplitude="1.0"
      :blend="0.5"
      :speed="1.0"
      :intensity="1.0"
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
  import Aurora from "./Aurora.vue";
</script>

<style scoped>
  .aurora-container {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
  }
</style>`
});
