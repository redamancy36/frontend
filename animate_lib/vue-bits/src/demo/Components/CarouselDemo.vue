<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container relative h-[500px] overflow-hidden flex items-center justify-center">
        <Carousel
          :key="rerenderKey"
          :base-width="width"
          :autoplay="autoplay"
          :autoplay-delay="autoplayDelay"
          :pause-on-hover="pauseOnHover"
          :loop="loop"
          :round="round"
        />
      </div>

      <Customize>
        <PreviewSlider title="Width" v-model="width" :min="250" :max="330" :step="10" />

        <PreviewSwitch title="Round Variant" v-model="round" />

        <PreviewSwitch title="Loop" v-model="loop" />

        <PreviewSwitch title="Autoplay" v-model="autoplay" />

        <PreviewSlider
          title="Delay"
          v-model="autoplayDelay"
          :min="1000"
          :max="4000"
          :step="1000"
          :disabled="!autoplay"
        />

        <PreviewSwitch title="Pause On Hover" v-model="pauseOnHover" :disabled="!autoplay" />
      </Customize>

      <PropTable :data="propData" />

      <Dependencies :dependency-list="['motion-v']" />
    </template>

    <template #code>
      <CodeExample :code-object="carousel" />
    </template>

    <template #cli>
      <CliInstallation :command="carousel.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import PropTable from '../../components/common/PropTable.vue';
import Dependencies from '../../components/code/Dependencies.vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewSwitch from '../../components/common/PreviewSwitch.vue';
import PreviewSlider from '../../components/common/PreviewSlider.vue';
import Carousel from '../../content/Components/Carousel/Carousel.vue';
import { carousel } from '@/constants/code/Components/carouselCode';
import { useForceRerender } from '@/composables/useForceRerender';

const width = ref(300);
const autoplay = ref(false);
const autoplayDelay = ref(3000);
const pauseOnHover = ref(false);
const loop = ref(false);
const round = ref(false);

const { rerenderKey, forceRerender } = useForceRerender();

const propData = [
  {
    name: 'items',
    type: 'CarouselItem[]',
    default: 'DEFAULT_ITEMS',
    description: 'An array of carousel items. Each item must include title, description, id, and icon.'
  },
  {
    name: 'baseWidth',
    type: 'number',
    default: '300',
    description: 'Total width (in px) of the carousel container. Effective item width is baseWidth minus padding.'
  },
  {
    name: 'autoplay',
    type: 'boolean',
    default: 'false',
    description: 'Enables automatic scrolling to the next item at a fixed interval.'
  },
  {
    name: 'autoplayDelay',
    type: 'number',
    default: '3000',
    description: 'Delay in milliseconds between automatic scrolls when autoplay is enabled.'
  },
  {
    name: 'pauseOnHover',
    type: 'boolean',
    default: 'false',
    description: 'Pauses the autoplay functionality when the carousel is hovered.'
  },
  {
    name: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'When true, the carousel loops seamlessly from the last item back to the first.'
  },
  {
    name: 'round',
    type: 'boolean',
    default: 'false',
    description: 'When true, the carousel is rendered with a 1:1 aspect ratio and circular container/items.'
  }
];

watch(
  () => [pauseOnHover.value, loop.value],
  () => {
    forceRerender();
  }
);
</script>
