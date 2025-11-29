import code from '@content/Backgrounds/Particles/Particles.vue?raw';
import { createCodeObject } from '../../../types/code';

export const particles = createCodeObject(code, 'Backgrounds/Particles', {
  installation: `npm install ogl`,
  usage: `<template>
  <div class="particles-container">
    <Particles
      :particle-count="200"
      :particle-spread="10"
      :speed="0.1"
      :particle-colors="['#ffffff']"
      :move-particles-on-hover="false"
      :particle-hover-factor="1"
      :alpha-particles="false"
      :particle-base-size="100"
      :size-randomness="1"
      :camera-distance="20"
      :disable-rotation="false"
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
  import Particles from "./Particles.vue";
</script>

<style scoped>
  .particles-container {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
  }
</style>`
});
