import code from '@content/Components/DecayCard/DecayCard.vue?raw';
import { createCodeObject } from '../../../types/code';

export const decayCard = createCodeObject(code, 'Components/DecayCard', {
  installation: `npm install gsap`,
  usage: `<template>
  <DecayCard
    :width="300"
    :height="400"
    image="https://picsum.photos/300/400?grayscale"
  >
    <div style="mix-blend-mode: overlay;">
      Decay<br />Card
    </div>
  </DecayCard>
</template>

<script setup lang="ts">
  import DecayCard from "./DecayCard.vue";
</script>`
});
