import code from '@content/Animations/FadeContent/FadeContent.vue?raw';
import { createCodeObject } from '@/types/code';

export const fadeContent = createCodeObject(code, 'Animations/FadeContent', {
  usage: `<template>
  <FadeContent
    :blur="true"
    :duration="1000"
    :delay="200"
    :threshold="0.1"
    :initial-opacity="0"
    easing="ease-out"
    class-name="my-fade-content"
  >
    <div class="content-to-fade">
      <h2>This content will fade in!</h2>
      <p>It appears when scrolled into view.</p>
    </div>
  </FadeContent>
</template>

<script setup lang="ts">
  import FadeContent from "./FadeContent.vue";
</script>`
});
