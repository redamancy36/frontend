import code from '@content/Components/TiltedCard/TiltedCard.vue?raw';
import { createCodeObject } from '../../../types/code';

export const tiltedCard = createCodeObject(code, 'Components/TiltedCard', {
  installation: `npm install motion-v`,
  usage: `<template>
  <TiltedCard
    image-src="https://example.com/image.jpg"
    alt-text="Sample image"
    caption-text="Hover to see tooltip"
    container-height="400px"
    container-width="400px"
    image-height="300px"
    image-width="300px"
    :rotate-amplitude="14"
    :scale-on-hover="1.1"
    :show-mobile-warning="true"
    :show-tooltip="true"
    :display-overlay-content="false"
  >
    <template #overlay>
      <div class="overlay-content">
        Your overlay content here
      </div>
    </template>
  </TiltedCard>
</template>

<script setup lang="ts">
  import TiltedCard from "./TiltedCard.vue";
</script>`
});
