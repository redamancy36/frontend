import code from '@/content/TextAnimations/TrueFocus/TrueFocus.vue?raw';
import { createCodeObject } from '@/types/code';

export const trueFocus = createCodeObject(code, 'TextAnimations/TrueFocus', {
  installation: `npm install motion-v`,
  usage: `<template>
  <TrueFocus
    sentence="True Focus"
    :manualMode="false"
    :blurAmount="5"
    borderColor="red"
    :animationDuration="2"
    :pauseBetweenAnimations="1"
  />
</template>

<script setup lang="ts">
  import TrueFocus from "./TrueFocus.vue";
</script>`
});
