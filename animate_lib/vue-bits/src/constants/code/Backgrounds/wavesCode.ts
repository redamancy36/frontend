import code from '@content/Backgrounds/Waves/Waves.vue?raw';
import { createCodeObject } from '../../../types/code';

export const waves = createCodeObject(code, 'Backgrounds/Waves', {
  usage: `<template>
  <div class="waves-container">
    <Waves
      line-color="black"
      background-color="transparent"
      :wave-speed-x="0.0125"
      :wave-speed-y="0.005"
      :wave-amp-x="32"
      :wave-amp-y="16"
      :x-gap="10"
      :y-gap="32"
      :friction="0.925"
      :tension="0.005"
      :max-cursor-move="100"
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
  import Waves from "./Waves.vue";
</script>

<style scoped>
  .waves-container {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
  }
</style>`
});
