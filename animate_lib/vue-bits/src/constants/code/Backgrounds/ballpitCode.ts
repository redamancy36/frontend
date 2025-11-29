import code from '@content/Backgrounds/Ballpit/Ballpit.vue?raw';
import { createCodeObject } from '../../../types/code';

export const ballpit = createCodeObject(code, 'Backgrounds/Ballpit', {
  installation: `npm install three @types/three gsap`,
  usage: `//Component inspired by Kevin Levron:
//https://x.com/soju22/status/1858925191671271801

<template>
  <div class="relative w-full h-[500px] overflow-hidden">
    <Ballpit
      :count="200"
      :gravity="0.7"
      :friction="0.8"
      :wallBounce="0.95"
      :followCursor="true"
    />
  </div>
</template>

<script setup lang="ts">
  import Ballpit from "./Ballpit.vue";
</script>`
});
