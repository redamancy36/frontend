<template>
  <TabbedLayout>
    <template #preview>
      <div class="relative p-0 h-[600px] overflow-hidden demo-container">
        <RefreshButton @click="forceRerender" />
        <Ballpit
          className="relative"
          :key="key"
          :count="count"
          :gravity="gravity"
          :friction="friction"
          :wallBounce="wallBounce"
          :followCursor="followCursor"
          :colors="colors"
        />
        <BackgroundContent pillText="New Background" headline="Balls! What's not to like about them?" />
      </div>

      <Customize>
        <PreviewSwitch title="Display Cursor" v-model="followCursor" />

        <PreviewSlider title="Ball Count" :min="50" :max="500" :step="10" v-model="count" />

        <PreviewSlider title="Gravity" :min="0.1" :max="1" :step="0.1" v-model="gravity" />

        <PreviewSlider title="Friction" :min="0.9" :max="1" :step="0.001" v-model="friction" />

        <PreviewSlider title="Wall Bounce" :min="0.1" :max="1" :step="0.05" v-model="wallBounce" />
      </Customize>

      <PropTable :data="propData" />
      <Dependencies :dependency-list="['three']" />
    </template>

    <template #code>
      <CodeExample :code-object="ballpit" />
    </template>

    <template #cli>
      <CliInstallation :command="ballpit.cli" />
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
import RefreshButton from '../../components/common/RefreshButton.vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import { ballpit } from '../../constants/code/Backgrounds/ballpitCode';
import Ballpit from '../../content/Backgrounds/Ballpit/Ballpit.vue';

const { rerenderKey: key, forceRerender } = useForceRerender();

const count = ref(100);
const gravity = ref(0.01);
const friction = ref(0.9975);
const wallBounce = ref(0.95);
const followCursor = ref(false);

const colors = [0xffffff, 0x000000, 0x27ff64];

watch(
  [count, gravity, friction, wallBounce, followCursor],
  () => {
    forceRerender();
  },
  { immediate: true }
);

const propData = [
  {
    name: 'count',
    type: 'number',
    default: '200',
    description: 'Sets the number of balls in the ballpit.'
  },
  {
    name: 'gravity',
    type: 'number',
    default: '0.5',
    description: 'Controls the gravity affecting the balls.'
  },
  {
    name: 'friction',
    type: 'number',
    default: '0.9975',
    description: 'Sets the friction applied to the ball movement.'
  },
  {
    name: 'wallBounce',
    type: 'number',
    default: '0.95',
    description: 'Determines how much balls bounce off walls.'
  },
  {
    name: 'followCursor',
    type: 'boolean',
    default: 'true',
    description: 'Enables or disables the sphere following the cursor.'
  },
  {
    name: 'colors',
    type: 'array',
    default: '[0, 0, 0]',
    description: 'Defines the colors of the balls.'
  },
  {
    name: 'ambientColor',
    type: 'number',
    default: '16777215',
    description: 'Sets the ambient light color.'
  },
  {
    name: 'ambientIntensity',
    type: 'number',
    default: '1',
    description: 'Controls the intensity of ambient light.'
  },
  {
    name: 'lightIntensity',
    type: 'number',
    default: '200',
    description: 'Sets the intensity of the main light source.'
  },
  {
    name: 'minSize',
    type: 'number',
    default: '0.5',
    description: 'Specifies the minimum size of the balls.'
  },
  {
    name: 'maxSize',
    type: 'number',
    default: '1',
    description: 'Specifies the maximum size of the balls.'
  },
  {
    name: 'size0',
    type: 'number',
    default: '1',
    description: 'Initial size value for the cursor ball.'
  },
  {
    name: 'maxVelocity',
    type: 'number',
    default: '0.15',
    description: 'Limits the maximum velocity of the balls.'
  },
  {
    name: 'maxX',
    type: 'number',
    default: '5',
    description: 'Defines the maximum X-coordinate boundary.'
  },
  {
    name: 'maxY',
    type: 'number',
    default: '5',
    description: 'Defines the maximum Y-coordinate boundary.'
  },
  {
    name: 'maxZ',
    type: 'number',
    default: '2',
    description: 'Defines the maximum Z-coordinate boundary.'
  }
];
</script>
