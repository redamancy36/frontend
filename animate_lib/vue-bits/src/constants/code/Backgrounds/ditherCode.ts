import code from '@content/Backgrounds/Dither/Dither.vue?raw';
import { createCodeObject } from '../../../types/code';

export const dither = createCodeObject(code, 'Backgrounds/Dither', {
  installation: `npm install ogl`,
  usage: `<template>
  <div class="relative w-full h-[500px] overflow-hidden">
    <Dither
      :wave-speed="0.05"
      :wave-frequency="3"
      :wave-amplitude="0.3"
      :wave-color="[0.5, 0.5, 0.5]"
      :color-num="4"
      :pixel-size="2"
      :disable-animation="false"
      :enable-mouse-interaction="true"
      :mouse-radius="1"
    />
  </div>
</template>

<script setup lang="ts">
  import Dither from "./Dither.vue";
</script>`
});
