import code from '@content/TextAnimations/ShinyText/ShinyText.vue?raw';
import { createCodeObject } from '@/types/code';

export const shinyText = createCodeObject(code, 'TextAnimations/ShinyText', {
  usage: `<template>
  <ShinyText 
    text="Just some shiny text!" 
    :disabled="false" 
    :speed="3" 
    class-name="your-custom-class"
  />
</template>

<script setup lang="ts">
  import ShinyText from "./ShinyText.vue";
</script>`
});
