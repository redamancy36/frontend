<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container h-[500px]">
        <CircularGallery
          :key="rerenderKey"
          :bend="bend"
          :border-radius="borderRadius"
          :scroll-speed="scrollSpeed"
          :scroll-ease="scrollEase"
          :text-color="textColor"
          :font="font"
        />
      </div>

      <Customize>
        <PreviewSlider title="Bend Level" v-model="bend" :min="-10" :max="10" :step="1" />

        <PreviewSlider title="Border Radius" v-model="borderRadius" :min="0" :max="0.5" :step="0.01" />

        <PreviewSlider title="Scroll Speed" v-model="scrollSpeed" :min="0.5" :max="5" :step="0.1" />

        <PreviewSlider title="Scroll Ease" v-model="scrollEase" :min="0.01" :max="0.15" :step="0.01" />

        <PreviewColor title="Text Color" v-model="textColor" />

        <PreviewSelect title="Font" v-model="font" :options="fontOptions" />
      </Customize>

      <PropTable :data="propData" />

      <Dependencies :dependency-list="['ogl']" />
    </template>

    <template #code>
      <CodeExample :code-object="circularGallery" />
    </template>

    <template #cli>
      <CliInstallation :command="circularGallery.cli" />
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
import PreviewSlider from '../../components/common/PreviewSlider.vue';
import PreviewColor from '../../components/common/PreviewColor.vue';
import PreviewSelect from '../../components/common/PreviewSelect.vue';
import CircularGallery from '../../content/Components/CircularGallery/CircularGallery.vue';
import { circularGallery } from '@/constants/code/Components/circularGalleryCode';
import { useForceRerender } from '@/composables/useForceRerender';

const bend = ref(1);
const borderRadius = ref(0.05);
const scrollSpeed = ref(2);
const scrollEase = ref(0.05);
const textColor = ref('#ffffff');
const font = ref('bold 30px Figtree');

const { rerenderKey } = useForceRerender();

const fontOptions = [
  { label: 'Figtree Bold', value: 'bold 30px Figtree' },
  { label: 'Arial Bold', value: 'bold 30px Arial' },
  { label: 'Helvetica Bold', value: 'bold 30px Helvetica' },
  { label: 'Times Bold', value: 'bold 30px Times' },
  { label: 'Courier Bold', value: 'bold 30px Courier' },
  { label: 'Georgia Bold', value: 'bold 30px Georgia' }
];

const propData = [
  {
    name: 'items',
    type: 'Array<{ image: string; text: string }>',
    default: 'undefined',
    description: 'List of items to display in the gallery. Each item should have an image URL and a text label.'
  },
  {
    name: 'bend',
    type: 'number',
    default: '3',
    description:
      'Determines the curvature of the gallery layout. A negative value bends in one direction, a positive value in the opposite.'
  },
  {
    name: 'textColor',
    type: 'string',
    default: '"#ffffff"',
    description: 'Specifies the color of the text labels.'
  },
  {
    name: 'borderRadius',
    type: 'number',
    default: '0.05',
    description: 'Sets the border radius for the media items to achieve rounded corners.'
  },
  {
    name: 'font',
    type: 'string',
    default: '"bold 30px Figtree"',
    description: 'Font style for the text labels.'
  },
  {
    name: 'scrollSpeed',
    type: 'number',
    default: '2',
    description:
      'Controls how much the gallery moves per scroll event. Lower values result in slower scrolling, higher values in faster scrolling.'
  },
  {
    name: 'scrollEase',
    type: 'number',
    default: '0.05',
    description:
      'Controls the smoothness of scroll transitions. Lower values create smoother, more fluid motion, while higher values make it more responsive.'
  }
];
</script>
