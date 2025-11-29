import code from '@content/TextAnimations/CircularText/CircularText.vue?raw';
import { createCodeObject } from '@/types/code';

export const circularText = createCodeObject(code, 'TextAnimations/CircularText', {
  installation: `npm install motion-v`,
  usage: `<template>
  <CircularText
    text="VUE * BITS * IS AWESOME * "
    :spin-duration="20"
    on-hover="speedUp"
    class-name="text-blue-500"
  />
</template>

<script setup lang="ts">
  import CircularText from "./CircularText.vue";
</script>`
});
