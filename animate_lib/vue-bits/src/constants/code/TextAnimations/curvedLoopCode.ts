import code from '@content/TextAnimations/CurvedLoop/CurvedLoop.vue?raw';
import { createCodeObject } from '@/types/code';

export const curvedLoop = createCodeObject(code, 'TextAnimations/CurvedLoop', {
  usage: `<template>
  <CurvedLoop
    marquee-text="Be ✦ Creative ✦ With ✦ Vue ✦ Bits ✦"
    :speed="2"
    :curve-amount="400"
    direction="left"
    :interactive="true"
  />
</template>

<script setup lang="ts">
  import CurvedLoop from "./CurvedLoop.vue";
</script>`
});
