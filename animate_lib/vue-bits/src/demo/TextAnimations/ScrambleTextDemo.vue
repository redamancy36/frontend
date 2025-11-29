<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container h-[500px]">
        <ScrambleText
          :className="'m-[6vw] max-w-[680px] font-mono font-medium text-[clamp(14px,4vw,28px)] text-white'"
          :radius="radius"
          :duration="duration"
          :speed="speed"
          :scrambleChars="scrambleChars"
        >
          Once you hover over me, you will see the effect in action! You can customize the radius, duration, and speed
          of the scramble effect.
        </ScrambleText>
      </div>

      <Customize>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Scramble Characters</label>
          <input
            v-model="scrambleChars"
            type="text"
            placeholder="Enter text..."
            maxlength="5"
            class="w-[160px] px-3 py-2 bg-[#0b0b0b] border border-[#333] rounded-md text-white focus:outline-none focus:border-[#666]"
          />
        </div>

        <PreviewSlider title="Radius" v-model="radius" :min="10" :max="300" :step="10" />

        <PreviewSlider title="Duration" v-model="duration" :min="0.1" :max="5" :step="0.1" />

        <PreviewSlider title="Speed" v-model="speed" :min="0.1" :max="2" :step="0.1" />
      </Customize>

      <PropTable :data="propData" />
      <Dependencies :dependency-list="['gsap']" />
    </template>

    <template #code>
      <CodeExample :code-object="scrambleTextCode" />
    </template>

    <template #cli>
      <CliInstallation :command="scrambleTextCode.cli" />
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
import ScrambleText from '../../content/TextAnimations/ScrambleText/ScrambleText.vue';
import { scrambleTextCode } from '@/constants/code/TextAnimations/scrambleTextCode';

const radius = ref(100);
const duration = ref(1.2);
const speed = ref(0.5);
const scrambleChars = ref('.:');

const propData = [
  {
    name: 'radius',
    type: 'number',
    default: '100',
    description: 'The radius around the mouse pointer within which characters will scramble.'
  },
  {
    name: 'duration',
    type: 'number',
    default: '1.2',
    description: 'The duration of the scramble effect on a character.'
  },
  {
    name: 'speed',
    type: 'number',
    default: '0.5',
    description: 'The speed of the scramble animation.'
  },
  {
    name: 'scrambleChars',
    type: 'string',
    default: "'.:'",
    description: 'The characters used for scrambling.'
  },
  {
    name: 'className',
    type: 'string',
    default: '""',
    description: 'Additional CSS classes for the component.'
  },
  {
    name: 'style',
    type: 'Record<string, string | number>',
    default: '{}',
    description: 'Inline styles for the component.'
  }
];
</script>
