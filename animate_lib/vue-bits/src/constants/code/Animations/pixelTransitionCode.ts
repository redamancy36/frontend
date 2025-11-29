import code from '@/content/Animations/PixelTransition/PixelTransition.vue?raw';
import { createCodeObject } from '@/types/code';

export const pixelTransition = createCodeObject(code, 'Animations/PixelTransition', {
  installation: `npm install gsap`,
  usage: `<template>
  <PixelTransition
    :grid-size="8"
    pixel-color="#ffffff"
    :animation-step-duration="0.4"
    class-name="custom-pixel-card"
  >
    <template #firstContent>
      <img src="..." alt="Default" style="width: 100%; height: 100%; object-fit: cover;" />
    </template>
    <template #secondContent>
      <div style="width: 100%; height: 100%; display: grid; place-items: center; background-color: #111;">
        <p style="font-weight: 900; font-size: 3rem; color: #fff;">Meow!</p>
      </div>
    </template>
  </PixelTransition>
</template>

<script setup lang=\"ts\">
  import PixelTransition from './PixelTransition.vue';
</script>`
});
