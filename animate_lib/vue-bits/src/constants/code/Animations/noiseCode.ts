import code from '@content/Animations/Noise/Noise.vue?raw';
import { createCodeObject } from '@/types/code';

export const noise = createCodeObject(code, 'Animations/Noise', {
  usage: `<template>
  <Noise 
    :pattern-size="250" 
    :pattern-scale-x="1" 
    :pattern-scale-y="1"
    :pattern-alpha="10"
  />
</template>

<script setup lang="ts">
  import Noise from './Noise.vue'
</script>`
});
