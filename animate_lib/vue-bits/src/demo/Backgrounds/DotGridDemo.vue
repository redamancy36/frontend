<template>
  <TabbedLayout>
    <template #preview>
      <div class="h-[600px] overflow-hidden demo-container">
        <DotGrid
          :key="rerenderKey"
          :dot-size="dotSize"
          :gap="gap"
          :base-color="baseColor"
          :active-color="activeColor"
          :proximity="proximity"
          :speed-trigger="speedTrigger"
          :shock-radius="shockRadius"
          :shock-strength="shockStrength"
          :max-speed="maxSpeed"
          :resistance="resistance"
          :return-duration="returnDuration"
          class-name="dot-grid-demo-canvas"
        />
        <BackgroundContent pillText="New Background" headline="Organized chaos with every cursor movement!" />
      </div>

      <Customize>
        <div class="flex gap-4 mb-4">
          <PreviewColor title="Base Color" v-model="baseColor" />

          <PreviewColor title="Active Color" v-model="activeColor" />
        </div>

        <PreviewSlider title="Dot Size" v-model="dotSize" :min="2" :max="50" :step="1" />

        <PreviewSlider title="Gap" v-model="gap" :min="5" :max="100" :step="1" />

        <PreviewSlider title="Proximity" v-model="proximity" :min="50" :max="500" :step="10" />

        <PreviewSlider title="Speed Trigger" v-model="speedTrigger" :min="50" :max="500" :step="10" />

        <PreviewSlider title="Shock Radius" v-model="shockRadius" :min="50" :max="500" :step="10" />

        <PreviewSlider title="Shock Strength" v-model="shockStrength" :min="1" :max="20" :step="1" />

        <PreviewSlider title="Max Speed" v-model="maxSpeed" :min="1000" :max="10000" :step="100" />

        <PreviewSlider title="Resistance (Inertia)" v-model="resistance" :min="100" :max="2000" :step="50" />

        <PreviewSlider title="Return Duration (Inertia)" v-model="returnDuration" :min="0.1" :max="5" :step="0.1" />
      </Customize>

      <PropTable :data="propData" />

      <Dependencies :dependency-list="['gsap']" />
    </template>

    <template #code>
      <CodeExample :code-object="dotGrid" />
    </template>

    <template #cli>
      <CliInstallation :command="dotGrid.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { useForceRerender } from '@/composables/useForceRerender';
import { dotGrid } from '@/constants/code/Backgrounds/dotGridCode';
import { ref } from 'vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Dependencies from '../../components/code/Dependencies.vue';
import BackgroundContent from '../../components/common/BackgroundContent.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewColor from '../../components/common/PreviewColor.vue';
import PreviewSlider from '../../components/common/PreviewSlider.vue';
import PropTable from '../../components/common/PropTable.vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import DotGrid from '../../content/Backgrounds/DotGrid/DotGrid.vue';

const dotSize = ref(5);
const gap = ref(15);
const baseColor = ref('#333333');
const activeColor = ref('#27FF64');
const proximity = ref(120);
const speedTrigger = ref(100);
const shockRadius = ref(250);
const shockStrength = ref(5);
const maxSpeed = ref(5000);
const resistance = ref(750);
const returnDuration = ref(1.5);
const { rerenderKey } = useForceRerender();

const propData = [
  { name: 'dotSize', type: 'number', default: '16', description: 'Size of each dot in pixels.' },
  { name: 'gap', type: 'number', default: '32', description: 'Gap between each dot in pixels.' },
  { name: 'baseColor', type: 'string', default: "'#27FF64'", description: 'Base color of the dots.' },
  {
    name: 'activeColor',
    type: 'string',
    default: "'#27FF64'",
    description: 'Color of dots when hovered or activated.'
  },
  {
    name: 'proximity',
    type: 'number',
    default: '150',
    description: 'Radius around the mouse pointer within which dots react.'
  },
  {
    name: 'speedTrigger',
    type: 'number',
    default: '100',
    description: 'Mouse speed threshold to trigger inertia effect.'
  },
  { name: 'shockRadius', type: 'number', default: '250', description: 'Radius of the shockwave effect on click.' },
  { name: 'shockStrength', type: 'number', default: '5', description: 'Strength of the shockwave effect on click.' },
  { name: 'maxSpeed', type: 'number', default: '5000', description: 'Maximum speed for inertia calculation.' },
  { name: 'resistance', type: 'number', default: '750', description: 'Resistance for the inertia effect.' },
  {
    name: 'returnDuration',
    type: 'number',
    default: '1.5',
    description: 'Duration for dots to return to their original position after inertia.'
  },
  { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for the component.' },
  { name: 'style', type: 'object', default: '{}', description: 'Inline styles for the component.' }
];
</script>

<style scoped>
.dot-grid-demo-canvas {
  width: 100%;
  height: 100%;
}
</style>
