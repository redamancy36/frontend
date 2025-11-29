import code from '@content/Components/CircularGallery/CircularGallery.vue?raw';
import { createCodeObject } from '../../../types/code';

export const circularGallery = createCodeObject(code, 'Components/CircularGallery', {
  installation: `npm install ogl`,
  usage: `<template>
  <CircularGallery
    :items="[
      { image: 'https://picsum.photos/800/600?random=1', text: 'Beautiful Nature' },
      { image: 'https://picsum.photos/800/600?random=2', text: 'City Life' },
      { image: 'https://picsum.photos/800/600?random=3', text: 'Ocean Views' }
    ]"
    :bend="3"
    text-color="#ffffff"
    :border-radius="0.05"
    font="bold 30px Arial"
    :scroll-speed="2"
    :scroll-ease="0.05"
  />
</template>

<script setup lang="ts">
  import CircularGallery from "./CircularGallery.vue";
</script>`
});
