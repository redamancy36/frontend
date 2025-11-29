import code from '@content/Backgrounds/DotGrid/DotGrid.vue?raw';
import { createCodeObject } from '../../../types/code';

export const dotGrid = createCodeObject(code, 'Backgrounds/DotGrid', {
  installation: `npm install gsap`,
  usage: `<template>
  <div class="dot-grid-container">
    <DotGrid
      :dot-size="16"
      :gap="32"
      base-color="#27FF64"
      active-color="#27FF64"
      :proximity="150"
      :speed-trigger="100"
      :shock-radius="250"
      :shock-strength="5"
      :max-speed="5000"
      :resistance="750"
      :return-duration="1.5"
      class-name="custom-dot-grid"
    />
  </div>
</template>

<script setup lang="ts">
  import DotGrid from "./DotGrid.vue";
</script>

<style scoped>
  .dot-grid-container {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
  }
</style>`
});
