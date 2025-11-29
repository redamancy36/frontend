import code from '@content/TextAnimations/FuzzyText/FuzzyText.vue?raw';
import { createCodeObject } from '@/types/code';

export const fuzzyText = createCodeObject(code, 'TextAnimations/FuzzyText', {
  usage: `<template>
  <FuzzyText
    text="404"
    :font-size="140"
    font-weight="900"
    color="#fff"
    :enable-hover="true"
    :base-intensity="0.18"
    :hover-intensity="0.5"
  />
</template>

<script setup lang="ts">
  import FuzzyText from "./FuzzyText.vue";
</script>`
});
