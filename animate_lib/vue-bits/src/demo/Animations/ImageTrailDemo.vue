<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container h-[500px] overflow-hidden">
        <ImageTrail :key="key" :items="items" :variant="variant" />

        <div class="absolute flex flex-col justify-center items-center">
          <p class="mb-0 font-black text-[#333] text-[clamp(2rem,6vw,6rem)]">Hover Me.</p>
          <p class="mt-0 font-black text-[#a6a6a6] text-[18px]">Variant {{ variant }}</p>
        </div>
      </div>

      <Customize>
        <div class="inline-flex gap-2" role="group">
          <button
            class="bg-[#0b0b0b] rounded px-3 border border-[#333] h-8 font-bold text-white text-xs cursor-not-allowed"
            disabled
          >
            Variant
          </button>

          <button
            v-for="num in 8"
            :key="num"
            :class="[
              'text-xs h-8 px-3 border border-[#333] font-bold rounded cursor-pointer hover:bg-[#222] transition-colors',
              variant === num ? 'bg-[#27FF64] text-black' : 'bg-[#0b0b0b]'
            ]"
            @click="
              () => {
                variant = num;
                forceRerender();
              }
            "
          >
            {{ num }}
          </button>
        </div>
      </Customize>

      <PropTable :data="propData" />
      <Dependencies :dependency-list="['gsap']" />
    </template>

    <template #code>
      <CodeExample :code-object="imageTrail" />
    </template>

    <template #cli>
      <CliInstallation :command="imageTrail.cli" />
    </template>
  </TabbedLayout>
</template>

<script setup lang="ts">
import { useForceRerender } from '@/composables/useForceRerender';
import CliInstallation from '../../components/code/CliInstallation.vue';
import CodeExample from '../../components/code/CodeExample.vue';
import Dependencies from '../../components/code/Dependencies.vue';
import PropTable from '../../components/common/PropTable.vue';
import TabbedLayout from '../../components/common/TabbedLayout.vue';
import { imageTrail } from '../../constants/code/Animations/imageTrailCode';
import ImageTrail from '../../content/Animations/ImageTrail/ImageTrail.vue';
import Customize from '../../components/common/Customize.vue';
import { ref } from 'vue';

const { rerenderKey: key, forceRerender } = useForceRerender();

const variant = ref(1);

const items = [
  'https://picsum.photos/id/287/300/300',
  'https://picsum.photos/id/1001/300/300',
  'https://picsum.photos/id/1025/300/300',
  'https://picsum.photos/id/1026/300/300',
  'https://picsum.photos/id/1027/300/300',
  'https://picsum.photos/id/1028/300/300',
  'https://picsum.photos/id/1029/300/300',
  'https://picsum.photos/id/1030/300/300'
];

const propData = [
  {
    name: 'items',
    type: 'string[]',
    default: '[]',
    description: 'An array of image URLs which will be animated in the trail.'
  },
  {
    name: 'variant',
    type: 'number',
    default: '1',
    description: 'A number from 1 to 8 - all different animation styles.'
  }
];
</script>
