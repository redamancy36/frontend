import code from '@content/Animations/MetallicPaint/MetallicPaint.vue?raw';
import utility from '@content/Animations/MetallicPaint/parseImage.ts?raw';
import { createCodeObject } from '@/types/code';

export const metallicPaint = createCodeObject(code, 'Animations/MetallicPaint', {
  usage: `<template>
  <MetallicPaint
    :image-data="imageData"
    :params="{
      patternScale: 2,
      refraction: 0.015,
      edge: 1,
      patternBlur: 0.005,
      liquid: 0.07,
      speed: 0.3
    }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
  import MetallicPaint from "./MetallicPaint.vue";

  // copy and import the parseImage utility from the correct path
  import { parseImage } from './parseImage';

  const imageData = ref<ImageData | null>(null);

  onMounted(async () => {
    try {
      // Example: Fetch an SVG image and parse it
      // The SVG should have a transparent background and black fill color for the best effect

      const response = await fetch('/path/to/your/logo.svg');
      const blob = await response.blob();
      const file = new File([blob], 'logo.svg', { type: blob.type });
      const { imageData: processedImageData } = await parseImage(file);
      imageData.value = processedImageData;
    } catch (err) {
      console.error('Error loading image:', err);
    }
  });
</script>`,
  utility
});
