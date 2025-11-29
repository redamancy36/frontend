import code from '@content/Backgrounds/Silk/Silk.vue?raw';
import { createCodeObject } from '../../../types/code';

export const silk = createCodeObject(code, 'Backgrounds/Silk', {
  installation: `npm install ogl`,
  usage: `<template>
  <div class="silk-container">
    <Silk
      :speed="5"
      :scale="1"
      :color="'#7B7481'"
      :noise-intensity="1.5"
      :rotation="0"
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
  import Silk from "./Silk.vue";
</script>

<style scoped>
  .silk-container {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
  }
</style>`
});
