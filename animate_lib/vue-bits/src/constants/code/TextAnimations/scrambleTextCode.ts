import code from '@content/TextAnimations/ScrambleText/ScrambleText.vue?raw';
import { createCodeObject } from '@/types/code';

export const scrambleTextCode = createCodeObject(code, 'TextAnimations/ScrambleText', {
  installation: `npm install gsap`,
  usage: `// Component inspired by Tom Miller from the GSAP community
// https://codepen.io/creativeocean/pen/NPWLwJM

<template>
  <ScrambleText
    :className="'m-[7vw] max-w-[800px] font-mono font-medium text-[clamp(14px,4vw,32px)] text-white'"
    :radius="100"
    :duration="1.2"
    :speed="0.5"
    scrambleChars=".:"
  >
    Lorem ipsum dolor sit amet consectetur adipisicing elit. 
    Similique pariatur dignissimos porro eius quam doloremque 
    et enim velit nobis maxime.
  </ScrambleText>
</template>

<script setup lang="ts">
  import ScrambleText from "./ScrambleText.vue";
</script>`
});
