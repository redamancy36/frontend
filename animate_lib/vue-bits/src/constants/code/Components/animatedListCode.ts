import code from '@content/Components/AnimatedList/AnimatedList.vue?raw';
import { createCodeObject } from '../../../types/code';

export const animatedList = createCodeObject(code, 'Components/AnimatedList', {
  installation: `npm install motion-v`,
  usage: `<template>
  <AnimatedList
    :items="items"
    :showGradients="true"
    :enableArrowNavigation="true"
    :displayScrollbar="true"
    @itemSelected="(item, index) => console.log(item, index)"
  />
</template>

<script setup lang="ts">
import AnimatedList from './AnimatedList.vue'

const items = [
  'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5',
  'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10',
  'Item 11', 'Item 12', 'Item 13', 'Item 14', 'Item 15'
]
</script>`
});
