import code from '@/content/Animations/MagnetLines/MagnetLines.vue?raw';
import { createCodeObject } from '@/types/code';

export const magnetLines = createCodeObject(code, 'Animations/MagnetLines', {
  usage: `<template>
  <MagnetLines 
    :rows="10" 
    :columns="12" 
    container-size="40vmin" 
    line-color="#efefef"
    line-width="2px" 
    line-height="30px"
    :base-angle="-10"
  />
</template>

<script setup lang="ts">
  import MagnetLines from "./MagnetLines.vue";
</script>`
});
