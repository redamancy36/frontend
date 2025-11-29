<template>
  <TabbedLayout>
    <template #preview>
      <div class="relative h-[600px] overflow-hidden demo-container">
        <Dither
          :key="rerenderKey"
          :wave-speed="waveSpeed"
          :wave-frequency="waveFrequency"
          :wave-amplitude="waveAmplitude"
          :wave-color="waveColor"
          :color-num="colorNum"
          :pixel-size="pixelSize"
          :disable-animation="disableAnimation"
          :enable-mouse-interaction="enableMouseInteraction"
          :mouse-radius="mouseRadius"
        />
        <BackgroundContent pillText="Retro Background" headline="Dithered waves with vintage charm" />
      </div>

      <Customize>
        <PreviewSwitch title="Mouse Interaction" v-model="enableMouseInteraction" />

        <PreviewSwitch title="Disable Animation" v-model="disableAnimation" />

        <PreviewSlider title="Wave Speed" :min="0.01" :max="0.2" :step="0.01" v-model="waveSpeed" />

        <PreviewSlider title="Wave Frequency" :min="1" :max="8" :step="0.5" v-model="waveFrequency" />

        <PreviewSlider title="Wave Amplitude" :min="0.1" :max="0.8" :step="0.1" v-model="waveAmplitude" />

        <PreviewSlider title="Color Count" :min="2" :max="16" :step="1" v-model="colorNum" />

        <PreviewSlider title="Pixel Size" :min="1" :max="8" :step="1" v-model="pixelSize" />

        <PreviewSlider title="Mouse Radius" :min="0.1" :max="2" :step="0.1" v-model="mouseRadius" />

        <PreviewSlider title="Wave Color R" v-model="waveColor[0]" :min="0" :max="1" :step="0.1" />

        <PreviewSlider title="Wave Color G" v-model="waveColor[1]" :min="0" :max="1" :step="0.1" />

        <PreviewSlider title="Wave Color B" v-model="waveColor[2]" :min="0" :max="1" :step="0.1" />
      </Customize>

      <PropTable :data="propData" />
      <Dependencies :dependency-list="['ogl']" />
    </template>

    <template #code>
      <CodeExample :code-object="dither" />
    </template>

    <template #cli>
      <CliInstallation :command="dither.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { useForceRerender } from '@/composables/useForceRerender';
import { ref, watch } from 'vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Dependencies from '../../components/code/Dependencies.vue';
import BackgroundContent from '../../components/common/BackgroundContent.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewSlider from '../../components/common/PreviewSlider.vue';
import PreviewSwitch from '../../components/common/PreviewSwitch.vue';

import PropTable from '../../components/common/PropTable.vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import { dither } from '@/constants/code/Backgrounds/ditherCode';
import Dither from '../../content/Backgrounds/Dither/Dither.vue';

const { rerenderKey, forceRerender } = useForceRerender();

const waveSpeed = ref(0.1);
const waveFrequency = ref(2.5);
const waveAmplitude = ref(0.2);
const waveColor = ref<[number, number, number]>([0.1, 0.7, 0.5]);
const colorNum = ref(4);
const pixelSize = ref(3);
const disableAnimation = ref(false);
const enableMouseInteraction = ref(true);
const mouseRadius = ref(0.5);

watch(
  [
    waveSpeed,
    waveFrequency,
    waveAmplitude,
    waveColor,
    colorNum,
    pixelSize,
    disableAnimation,
    enableMouseInteraction,
    mouseRadius
  ],
  () => {
    forceRerender();
  },
  { deep: true }
);

const propData = [
  {
    name: 'waveSpeed',
    type: 'number',
    default: '0.05',
    description: 'Controls the speed of the wave animation.'
  },
  {
    name: 'waveFrequency',
    type: 'number',
    default: '3',
    description: 'Sets the frequency of the wave pattern.'
  },
  {
    name: 'waveAmplitude',
    type: 'number',
    default: '0.3',
    description: 'Controls the amplitude of the wave pattern.'
  },
  {
    name: 'waveColor',
    type: 'array',
    default: '[0.5, 0.5, 0.5]',
    description: 'RGB color values for the wave pattern (0-1 range).'
  },
  {
    name: 'colorNum',
    type: 'number',
    default: '4',
    description: 'Number of colors in the dithering palette.'
  },
  {
    name: 'pixelSize',
    type: 'number',
    default: '2',
    description: 'Size of the dithering pixels for the retro effect.'
  },
  {
    name: 'disableAnimation',
    type: 'boolean',
    default: 'false',
    description: 'Disables the wave animation when set to true.'
  },
  {
    name: 'enableMouseInteraction',
    type: 'boolean',
    default: 'true',
    description: 'Enables mouse interaction with the wave pattern.'
  },
  {
    name: 'mouseRadius',
    type: 'number',
    default: '1',
    description: 'Radius of the mouse interaction effect.'
  }
];
</script>
