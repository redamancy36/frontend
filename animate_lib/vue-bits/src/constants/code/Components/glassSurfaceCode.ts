import code from '@content/Components/GlassSurface/GlassSurface.vue?raw';
import { createCodeObject } from '../../../types/code';

export const glassSurface = createCodeObject(code, 'Components/GlassSurface', {
  usage: `<template>
  <GlassSurface 
    :width="300"
    :height="200"
    :border-radius="24"
    style="custom-style"
    />
</template>

<script setup lang="ts">
  import GlassSurface from "./GlassSurface.vue";
</script>`
});
