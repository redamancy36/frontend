<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container" style="height: 900px; overflow: hidden">
        <RefreshButton @refresh="forceRerender" />

        <Masonry
          :key="rerenderKey"
          :items="sampleItems"
          :ease="ease"
          :duration="duration"
          :stagger="stagger"
          :animate-from="animateFrom"
          :scale-on-hover="scaleOnHover"
          :hover-scale="hoverScale"
          :blur-to-focus="blurToFocus"
          :color-shift-on-hover="colorShiftOnHover"
          class="masonry-demo-container"
        />
      </div>

      <Customize>
        <PreviewSwitch title="Scale on Hover" v-model="scaleOnHover" />

        <PreviewSwitch title="Blur to Focus" v-model="blurToFocus" />

        <PreviewSwitch title="Color Shift on Hover" v-model="colorShiftOnHover" />

        <PreviewSelect
          title="Animation Direction"
          v-model="animateFrom"
          :options="[
            { label: 'Bottom', value: 'bottom' },
            { label: 'Top', value: 'top' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
            { label: 'Center', value: 'center' },
            { label: 'Random', value: 'random' }
          ]"
        />

        <PreviewSlider title="Duration (s)" v-model="duration" :min="0.1" :max="2" :step="0.1" />

        <PreviewSlider title="Stagger Delay (s)" v-model="stagger" :min="0.01" :max="0.2" :step="0.01" />

        <PreviewSlider title="Hover Scale" v-model="hoverScale" :min="0.8" :max="1.2" :step="0.05" />
      </Customize>

      <PropTable :data="propData" />

      <Dependencies :dependency-list="['gsap']" />
    </template>

    <template #code>
      <CodeExample :code-object="masonry" />
    </template>

    <template #cli>
      <CliInstallation :command="masonry.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import RefreshButton from '../../components/common/RefreshButton.vue';
import PropTable from '../../components/common/PropTable.vue';
import Dependencies from '../../components/code/Dependencies.vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewSwitch from '../../components/common/PreviewSwitch.vue';
import PreviewSlider from '../../components/common/PreviewSlider.vue';
import PreviewSelect from '../../components/common/PreviewSelect.vue';
import Masonry from '../../content/Components/Masonry/Masonry.vue';
import { masonry } from '@/constants/code/Components/masonryCode';
import { useForceRerender } from '@/composables/useForceRerender';

const ease = ref('power3.out');
const duration = ref(0.6);
const stagger = ref(0.05);
const animateFrom = ref<'bottom' | 'top' | 'left' | 'right' | 'center' | 'random'>('bottom');
const scaleOnHover = ref(true);
const hoverScale = ref(0.95);
const blurToFocus = ref(true);
const colorShiftOnHover = ref(false);
const { rerenderKey, forceRerender } = useForceRerender();

const sampleItems = ref([
  { id: '1', img: 'https://picsum.photos/300/400?random=1&grayscale', url: 'https://picsum.photos', height: 400 },
  { id: '2', img: 'https://picsum.photos/300/600?random=2&grayscale', url: 'https://picsum.photos', height: 600 },
  { id: '3', img: 'https://picsum.photos/300/350?random=3&grayscale', url: 'https://picsum.photos', height: 350 },
  { id: '4', img: 'https://picsum.photos/300/500?random=4&grayscale', url: 'https://picsum.photos', height: 500 },
  { id: '5', img: 'https://picsum.photos/300/450?random=5&grayscale', url: 'https://picsum.photos', height: 450 },
  { id: '6', img: 'https://picsum.photos/300/380?random=6&grayscale', url: 'https://picsum.photos', height: 380 },
  { id: '7', img: 'https://picsum.photos/300/520?random=7&grayscale', url: 'https://picsum.photos', height: 520 },
  { id: '8', img: 'https://picsum.photos/300/420?random=8&grayscale', url: 'https://picsum.photos', height: 420 },
  { id: '9', img: 'https://picsum.photos/300/480?random=9&grayscale', url: 'https://picsum.photos', height: 480 },
  { id: '10', img: 'https://picsum.photos/300/360?random=10&grayscale', url: 'https://picsum.photos', height: 360 },
  { id: '11', img: 'https://picsum.photos/300/550?random=11&grayscale', url: 'https://picsum.photos', height: 550 },
  { id: '12', img: 'https://picsum.photos/300/400?random=12&grayscale', url: 'https://picsum.photos', height: 400 },
  { id: '13', img: 'https://picsum.photos/300/470?random=13&grayscale', url: 'https://picsum.photos', height: 470 },
  { id: '14', img: 'https://picsum.photos/300/390?random=14&grayscale', url: 'https://picsum.photos', height: 390 },
  { id: '15', img: 'https://picsum.photos/300/510?random=15&grayscale', url: 'https://picsum.photos', height: 510 }
]);

const propData = [
  {
    name: 'items',
    type: 'Item[]',
    default: '[]',
    description:
      'Array of items to display in the masonry grid. Each item must have id, img, url, and height properties.'
  },
  { name: 'ease', type: 'string', default: '"power3.out"', description: 'GSAP easing function for animations.' },
  { name: 'duration', type: 'number', default: '0.6', description: 'Duration of the animation in seconds.' },
  {
    name: 'stagger',
    type: 'number',
    default: '0.05',
    description: 'Stagger delay between item animations in seconds.'
  },
  {
    name: 'animateFrom',
    type: 'string',
    default: '"bottom"',
    description: 'Direction items animate from: "bottom", "top", "left", "right", "center", or "random".'
  },
  { name: 'scaleOnHover', type: 'boolean', default: 'true', description: 'Whether items scale on hover.' },
  { name: 'hoverScale', type: 'number', default: '0.95', description: 'Scale factor when hovering over items.' },
  {
    name: 'blurToFocus',
    type: 'boolean',
    default: 'true',
    description: 'Whether items start blurred and focus on entrance.'
  },
  {
    name: 'colorShiftOnHover',
    type: 'boolean',
    default: 'false',
    description: 'Whether to show color overlay on hover.'
  }
];

watch(
  () => [scaleOnHover.value, blurToFocus.value, colorShiftOnHover.value],
  () => {
    forceRerender();
  }
);
</script>
