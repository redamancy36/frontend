import code from '@content/Backgrounds/Squares/Squares.vue?raw';
import { createCodeObject } from '../../../types/code';

export const squares = createCodeObject(code, 'Backgrounds/Squares', {
  usage: `<template>
  <div class="w-full h-[400px]">
    <Squares 
      direction="diagonal"
      :speed="1"
      :squareSize="40"
      borderColor="#999"
      hoverFillColor="#222"
    />
  </div>
</template>

<script setup lang="ts">
  import Squares from "./Squares.vue";
</script>`
});
