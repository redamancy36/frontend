import code from '@/content/TextAnimations/TextTrail/TextTrail.vue?raw';
import { createCodeObject } from '@/types/code';

export const textTrail = createCodeObject(code, 'TextAnimations/TextTrail', {
  installation: `npm install three @types/three`,
  usage: `<template>
  <TextTrail
    text="Vibe"
    :noise-factor="1"
    :noise-scale="0.0005"
    font-weight="900"
    :alpha-persist-factor="0.95"
    :animate-color="false"
    text-color="#ffffff"
  />
</template>

<script setup lang="ts">
  import TextTrail from "./TextTrail.vue";
</script>`
});
