import code from '@content/Components/PixelCard/PixelCard.vue?raw';
import { createCodeObject } from '../../../types/code';

export const pixelCard = createCodeObject(code, 'Components/PixelCard', {
  usage: `<template>
  <PixelCard 
    variant="default" 
    :gap="5"
    :speed="35"
    colors="#f8fafc,#f1f5f9,#cbd5e1"
    :no-focus="false"
    class-name="custom-class"
  ></PixelCard>
</template>

<script setup lang="ts">
  import PixelCard from "./PixelCard.vue";
</script>`
});
