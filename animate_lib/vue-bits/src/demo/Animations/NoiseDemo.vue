<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container overflow-hidden h-[400px]">
        <div class="text-[#27FF64] text-[6rem] font-extrabold text-center opacity-50">Ooh, edgy!</div>
        <Noise :pattern-alpha="patternAlpha" :mix-blend-mode="mixBlendMode" />
      </div>

      <Customize>
        <PreviewSlider title="Noise Alpha" v-model="patternAlpha" :min="0" :max="100" :step="5" />
        <PreviewSelect title="Mix Blend Mode" v-model="mixBlendMode" :options="blendModeOptions" />
      </Customize>

      <PropTable :data="propData" />
    </template>

    <template #code>
      <CodeExample :code-object="noise" />
    </template>

    <template #cli>
      <CliInstallation :command="noise.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import PropTable from '../../components/common/PropTable.vue';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Customize from '../../components/common/Customize.vue';
import PreviewSlider from '../../components/common/PreviewSlider.vue';
import PreviewSelect from '../../components/common/PreviewSelect.vue';
import Noise from '../../content/Animations/Noise/Noise.vue';
import { noise } from '@/constants/code/Animations/noiseCode';

const patternAlpha = ref(15);
const mixBlendMode = ref('normal');

const blendModeOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Overlay', value: 'overlay' }
];

watch(mixBlendMode, newValue => {
  if (newValue === 'overlay') {
    patternAlpha.value = 50;
  }
});

const propData = [
  {
    name: 'patternRefreshInterval',
    type: 'number',
    default: '2',
    description: 'Number of frames before the grain pattern refreshes.'
  },
  {
    name: 'patternAlpha',
    type: 'number',
    default: '10',
    description: 'Opacity of the grain pattern (0-255).'
  },
  {
    name: 'mixBlendMode',
    type: 'string',
    default: 'normal',
    description: 'CSS mix-blend-mode value for how the noise blends with content behind it.'
  }
];
</script>
