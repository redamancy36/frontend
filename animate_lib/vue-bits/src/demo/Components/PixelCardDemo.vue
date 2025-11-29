<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container relative min-h-[500px] max-h-[500px] overflow-hidden flex items-center justify-center">
        <PixelCard :key="rerenderKey" :variant="selectedVariant">
          <div class="absolute mix-blend-screen z-10 inset-0 flex items-center justify-center w-full h-full">
            <h2 class="text-5xl font-black select-none text-[#222]">Hover Me.</h2>
          </div>
        </PixelCard>
      </div>

      <Customize>
        <PreviewSelect title="Animation Variant" :options="variantOptions" v-model="selectedVariant" />
      </Customize>

      <PropTable :data="propData" />
    </template>

    <template #code>
      <CodeExample :code-object="pixelCard" />
    </template>

    <template #cli>
      <CliInstallation :command="pixelCard.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import PropTable from '../../components/common/PropTable.vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewSelect from '../../components/common/PreviewSelect.vue';
import PixelCard from '../../content/Components/PixelCard/PixelCard.vue';
import { pixelCard } from '@/constants/code/Components/pixelCardCode';
import { useForceRerender } from '@/composables/useForceRerender';

const selectedVariant = ref<'default' | 'blue' | 'yellow' | 'pink'>('default');
const { rerenderKey } = useForceRerender();

const variantOptions = [
  { value: 'default', label: 'Default' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'blue', label: 'Blue' },
  { value: 'pink', label: 'Pink' }
];

const propData = [
  {
    name: 'variant',
    type: 'string',
    default: '"default"',
    description: 'Defines the color scheme and animation style.',
    options: 'default | yellow | blue | pink'
  },
  {
    name: 'gap',
    type: 'number',
    default: 'varies by variant',
    description: 'Pixel grid gap size in pixels.'
  },
  {
    name: 'speed',
    type: 'number',
    default: 'varies by variant',
    description: 'Animation speed modifier (lower is slower).'
  },
  {
    name: 'colors',
    type: 'string',
    default: '"#f8fafc,#f1f5f9,#cbd5e1"',
    description: 'Comma-separated list of colors for the pixel effect.'
  },
  {
    name: 'noFocus',
    type: 'boolean',
    default: 'false',
    description: 'If true, prevents animation from triggering on focus.'
  },
  {
    name: 'className',
    type: 'string',
    default: '""',
    description: 'Additional CSS class for the wrapper.'
  }
];
</script>
