<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container h-[500px]">
        <TextCursor
          :key="key"
          :text="text"
          :follow-mouse-direction="followMouseDirection"
          :random-float="randomFloat"
        />

        <div
          class="absolute inset-0 flex items-center justify-center pointer-events-none text-[4rem] font-[900] text-[#222] select-none"
        >
          Hover Around!
        </div>
      </div>

      <Customize>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Text</label>

          <input
            v-model="text"
            type="text"
            placeholder="Enter text..."
            maxlength="10"
            class="w-[160px] px-3 py-2 bg-[#0b0b0b] border border-[#333] rounded-md text-white focus:outline-none focus:border-[#666]"
          />
        </div>

        <PreviewSwitch title="Follow Mouse Direction" v-model="followMouseDirection" />

        <PreviewSwitch title="Enable Random Floating" v-model="randomFloat" />
      </Customize>

      <PropTable :data="propData" />

      <Dependencies :dependency-list="['motion-v']" />
    </template>

    <template #code>
      <CodeExample :code-object="textCursor" />
    </template>

    <template #cli>
      <CliInstallation :command="textCursor.cli" />
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
import TextCursor from '../../content/TextAnimations/TextCursor/TextCursor.vue';
import { textCursor } from '@/constants/code/TextAnimations/textCursorCode';
import { useForceRerender } from '@/composables/useForceRerender';

const { rerenderKey: key } = useForceRerender();

const text = ref('💚');
const followMouseDirection = ref(true);
const randomFloat = ref(true);

const propData = [
  {
    name: 'text',
    type: 'string',
    default: '⚛️',
    description: 'The text string to display as the trail.'
  },
  {
    name: 'delay',
    type: 'number',
    default: '0.01',
    description: 'The entry stagger delay in seconds for the fade-out animation.'
  },
  {
    name: 'spacing',
    type: 'number',
    default: '100',
    description: 'The spacing in pixels between each trail point.'
  },
  {
    name: 'followMouseDirection',
    type: 'boolean',
    default: 'true',
    description: 'If true, each text rotates to follow the mouse direction.'
  },
  {
    name: 'randomFloat',
    type: 'boolean',
    default: 'true',
    description: 'If true, enables random floating offsets in position and rotation for a dynamic effect.'
  },
  {
    name: 'exitDuration',
    type: 'number',
    default: '0.5',
    description: 'The duration in seconds for the exit animation of each trail item.'
  },
  {
    name: 'removalInterval',
    type: 'number',
    default: '30',
    description: 'The interval in milliseconds between removing trail items when the mouse stops moving.'
  },
  {
    name: 'maxPoints',
    type: 'number',
    default: '5',
    description: 'The maximum number of trail points to display.'
  }
];
</script>
