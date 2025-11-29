<template>
  <TabbedLayout>
    <template #preview>
      <div
        class="demo-container"
        style="height: 500px; overflow: hidden; display: flex; justify-content: center; align-items: center"
      >
        <InfiniteScroll
          :items="items"
          :is-tilted="isTilted"
          :tilt-direction="tiltDirection"
          :autoplay="autoplay"
          :autoplay-speed="1"
          :autoplay-direction="autoplayDirection"
          :pause-on-hover="pauseOnHover"
        />
      </div>

      <Customize>
        <PreviewSwitch title="Tilt" v-model="isTilted" />

        <PreviewSelect v-if="isTilted" title="Tilt Direction" :options="tiltOptions" v-model="tiltDirection" />

        <hr style="margin: 1rem 0; border-color: #222" />

        <PreviewSwitch title="Autoplay" v-model="autoplay" />

        <template v-if="autoplay">
          <PreviewSelect title="Autoplay Direction" :options="autoplayOptions" v-model="autoplayDirection" />

          <PreviewSwitch title="Pause on Hover" v-model="pauseOnHover" />
        </template>
      </Customize>

      <PropTable :data="propData" />

      <Dependencies :dependency-list="['gsap']" />
    </template>

    <template #code>
      <CodeExample :code-object="infiniteScroll" />
    </template>

    <template #cli>
      <CliInstallation :command="infiniteScroll.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import PropTable from '../../components/common/PropTable.vue';
import Dependencies from '../../components/code/Dependencies.vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewSwitch from '../../components/common/PreviewSwitch.vue';
import PreviewSelect from '../../components/common/PreviewSelect.vue';
import InfiniteScroll from '../../content/Components/InfiniteScroll/InfiniteScroll.vue';
import { infiniteScroll } from '@/constants/code/Components/infiniteScrollCode';

const isTilted = ref(true);
const tiltDirection = ref<'left' | 'right'>('left');
const autoplay = ref(true);
const autoplayDirection = ref<'up' | 'down'>('up');
const pauseOnHover = ref(true);

const items = [
  { content: 'Paragraph Item 2' },
  { content: 'Text Item 3' },
  { content: 'Paragraph Item 4' },
  { content: 'Text Item 5' },
  { content: 'Paragraph Item 6' },
  { content: 'Text Item 7' },
  { content: 'Paragraph Item 8' },
  { content: 'Text Item 9' },
  { content: 'Paragraph Item 10' },
  { content: 'Text Item 11' },
  { content: 'Paragraph Item 12' },
  { content: 'Text Item 13' },
  { content: 'Paragraph Item 14' }
];

const autoplayOptions = [
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' }
];

const tiltOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
];

const propData = [
  {
    name: 'width',
    type: 'string',
    default: '"30rem"',
    description: 'Width of the outer wrapper.'
  },
  {
    name: 'maxHeight',
    type: 'string',
    default: '"100%"',
    description: 'Maximum height of the outer wrapper.'
  },
  {
    name: 'items',
    type: 'array',
    default: '[]',
    description:
      'Array of items with custom content. Each item should have a "content" property containing a string or Vue component.'
  },
  {
    name: 'itemMinHeight',
    type: 'number',
    default: '150',
    description: 'Fixed height for each item in pixels.'
  },
  {
    name: 'isTilted',
    type: 'boolean',
    default: 'false',
    description: 'Whether the container has a skewed perspective.'
  },
  {
    name: 'tiltDirection',
    type: '"left" | "right"',
    default: '"left"',
    description: 'Direction of the tilt if "isTilted" is true.'
  },
  {
    name: 'autoplay',
    type: 'boolean',
    default: 'false',
    description: 'Whether the scroll should autoplay.'
  },
  {
    name: 'autoplaySpeed',
    type: 'number',
    default: '0.5',
    description: 'Speed of autoplay in pixels/frame.'
  },
  {
    name: 'autoplayDirection',
    type: '"up" | "down"',
    default: '"down"',
    description: 'Direction of autoplay scrolling.'
  },
  {
    name: 'pauseOnHover',
    type: 'boolean',
    default: 'false',
    description: 'Pause autoplay when hovering over the component.'
  },
  {
    name: 'negativeMargin',
    type: 'string',
    default: '"-0.5em"',
    description: 'Negative margin to reduce spacing between items.'
  }
];
</script>
