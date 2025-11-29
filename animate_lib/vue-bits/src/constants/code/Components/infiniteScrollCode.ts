import code from '@content/Components/InfiniteScroll/InfiniteScroll.vue?raw';
import { createCodeObject } from '../../../types/code';

export const infiniteScroll = createCodeObject(code, 'Components/InfiniteScroll', {
  installation: `npm install gsap`,
  usage: `<template>
  <InfiniteScroll
    :items="items"
    width="30rem"
    max-height="100%"
    :item-min-height="150"
    :is-tilted="false"
    tilt-direction="left"
    :autoplay="false"
    :autoplay-speed="0.5"
    autoplay-direction="down"
    :pause-on-hover="false"
    negative-margin="-0.5em"
  />
</template>

<script setup lang="ts">
  import InfiniteScroll from "./InfiniteScroll.vue";

  const items = [
    { content: "Item 1" },
    { content: "Item 2" },
    { content: "Item 3" },
    // Add more items as needed
  ];
</script>`
});
