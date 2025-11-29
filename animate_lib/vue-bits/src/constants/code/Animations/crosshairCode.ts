import code from '@/content/Animations/Crosshair/Crosshair.vue?raw';
import { createCodeObject } from '@/types/code';

export const crosshair = createCodeObject(code, 'Animations/Crosshair', {
  installation: `npm install gsap`,
  usage: `<template>
  <div ref="containerRef" style="height: 300px; overflow: hidden;">
    <Crosshair :container-ref="containerElement" color="#ffffff" />
  </div>
</template>

<script setup lang="ts">
  import { useTemplateRef, computed } from 'vue';
  import Crosshair from "./Crosshair.vue";
  
  const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
  const containerElement = computed(() => containerRef.value);
</script>`
});
