import code from '@content/Components/FlyingPosters/FlyingPosters.vue?raw';
import { createCodeObject } from '../../../types/code';

export const flyingPosters = createCodeObject(code, 'Components/FlyingPosters', {
  installation: `npm install ogl`,
  usage: `<template>
  <FlyingPosters 
    :items="posterImages"
    :plane-width="320"
    :plane-height="320"
    :distortion="3"
    :scroll-ease="0.01"
    :camera-fov="45"
    :camera-z="20"
    class="h-full w-full"
  />
</template>

<script setup lang="ts">
  import FlyingPosters from "./FlyingPosters.vue";

  const posterImages = [
  'https://picsum.photos/800/800?grayscale&random=1',
  'https://picsum.photos/800/800?grayscale&random=2',
  'https://picsum.photos/800/800?grayscale&random=3',
  'https://picsum.photos/800/800?grayscale&random=4',
  'https://picsum.photos/800/800?grayscale&random=5',
  'https://picsum.photos/800/800?grayscale&random=6',
  'https://picsum.photos/800/800?grayscale&random=7',
  'https://picsum.photos/800/800?grayscale&random=8',
  'https://picsum.photos/800/800?grayscale&random=9',
  'https://picsum.photos/800/800?grayscale&random=10',
  ];
</script>`
});
