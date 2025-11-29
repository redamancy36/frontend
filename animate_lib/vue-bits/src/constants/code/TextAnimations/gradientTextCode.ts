import code from '@content/TextAnimations/GradientText/GradientText.vue?raw';
import { createCodeObject } from '@/types/code';

export const gradientText = createCodeObject(code, 'TextAnimations/GradientText', {
  usage: `<template>
  <GradientText
    text="Add a splash of color!"
    :colors="['#ffaa40', '#9c40ff', '#ffaa40']"
    :animation-speed="8"
    :show-border="false"
    class-name="your-custom-class"
  />
</template>

<script setup lang="ts">
  import GradientText from "./GradientText.vue";
</script>`
});
