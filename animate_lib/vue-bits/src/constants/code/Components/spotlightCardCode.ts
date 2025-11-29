import code from '@content/Components/SpotlightCard/SpotlightCard.vue?raw';
import { createCodeObject } from '../../../types/code';

export const spotlightCard = createCodeObject(code, 'Components/SpotlightCard', {
  usage: `<template>
  <SpotlightCard 
    class-name="custom-spotlight-card"
    spotlight-color="rgba(255, 255, 255, 0.25)"
  >
    <-!-- Content inside the card -->
  </SpotlightCard>
</template>

<script setup lang="ts">
  import SpotlightCard from "./SpotlightCard.vue";
</script>`
});
