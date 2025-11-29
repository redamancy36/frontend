<template>
  <TabbedLayout>
    <template #preview>
      <div class="h-[600px] overflow-hidden demo-container relative">
        <DarkVeil
          :hue-shift="hueShift"
          :noise-intensity="noiseIntensity"
          :scanline-intensity="scanlineIntensity"
          :speed="speed"
          :scanline-frequency="scanlineFrequency"
          :warp-amount="warpAmount"
        />

        <BackgroundContent pill-text="New Background" headline="Become emboldened by the flame of ambition" />
      </div>

      <Customize>
        <PreviewSlider title="Speed" :min="0" :max="3" :step="0.1" v-model="speed" />
        <PreviewSlider title="Hue Shift" :min="0" :max="360" :step="1" v-model="hueShift" />
        <PreviewSlider title="Noise Intensity" :min="0" :max="0.2" :step="0.01" v-model="noiseIntensity" />
        <PreviewSlider title="Scanline Frequency" :min="0.5" :max="5" :step="0.1" v-model="scanlineFrequency" />
        <PreviewSlider title="Scanline Intensity" :min="0" :max="1" :step="0.01" v-model="scanlineIntensity" />
        <PreviewSlider title="Warp Amount" :min="0" :max="5" :step="0.1" v-model="warpAmount" />
      </Customize>

      <PropTable :data="propData" />

      <Dependencies :dependency-list="['ogl']" />
    </template>

    <template #code>
      <CodeExample :code-object="darkVeil" />
    </template>

    <template #cli>
      <CliInstallation :command="darkVeil.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BackgroundContent from '../../components/common/BackgroundContent.vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Customize from '../../components/common/Customize.vue';
import Dependencies from '../../components/code/Dependencies.vue';
import PreviewSlider from '../../components/common/PreviewSlider.vue';
import PropTable from '../../components/common/PropTable.vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import DarkVeil from '../../content/Backgrounds/DarkVeil/DarkVeil.vue';
import { darkVeil } from '../../constants/code/Backgrounds/darkVeilCode';

const hueShift = ref(0);
const noiseIntensity = ref(0);
const scanlineIntensity = ref(0);
const speed = ref(0.5);
const scanlineFrequency = ref(0);
const warpAmount = ref(0);

const propData = [
  {
    name: 'hueShift',
    type: 'number',
    default: '0',
    description: 'Shifts the hue of the entire animation.'
  },
  {
    name: 'noiseIntensity',
    type: 'number',
    default: '0',
    description: 'Intensity of the noise/grain effect.'
  },
  {
    name: 'scanlineIntensity',
    type: 'number',
    default: '0',
    description: 'Intensity of the scanline effect.'
  },
  {
    name: 'speed',
    type: 'number',
    default: '0.5',
    description: 'Speed of the animation.'
  },
  {
    name: 'scanlineFrequency',
    type: 'number',
    default: '0',
    description: 'Frequency of the scanlines.'
  },
  {
    name: 'warpAmount',
    type: 'number',
    default: '0',
    description: 'Amount of warp distortion applied to the effect.'
  },
  {
    name: 'resolutionScale',
    type: 'number',
    default: '1',
    description: 'Scale factor for the resolution.'
  }
];
</script>
