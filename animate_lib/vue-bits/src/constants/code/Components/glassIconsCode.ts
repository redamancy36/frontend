import code from '@content/Components/GlassIcons/GlassIcons.vue?raw';
import { createCodeObject } from '../../../types/code';

export const glassIcons = createCodeObject(code, 'Components/GlassIcons', {
  usage: `<template>
  <GlassIcons :items="items" class="my-glass-icons" />
</template>

<script setup lang="ts">
  import GlassIcons from "./GlassIcons.vue";

  const items = [
    { icon: 'pi pi-file', color: 'blue', label: 'Files' },
    { icon: 'pi pi-book', color: 'purple', label: 'Books' },
    { icon: 'pi pi-heart', color: 'red', label: 'Health' },
    { icon: 'pi pi-cloud', color: 'indigo', label: 'Weather' },
    { icon: 'pi pi-pencil', color: 'orange', label: 'Notes' },
    { icon: 'pi pi-chart-bar', color: 'green', label: 'Stats' }
  ];
</script>`
});
