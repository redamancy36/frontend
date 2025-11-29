<template>
  <TabbedLayout>
    <template #preview>
      <div class="demo-container overflow-hidden h-[400px]">
        <StarBorder as="button" :color="color" :speed="speedProp" :thickness="thickness">Star Border</StarBorder>
      </div>

      <Customize>
        <PreviewSelect title="Color" v-model="color" :options="colorOptions" />
        <PreviewSlider title="Thickness" v-model="thickness" :min="0.5" :max="8" :step="0.5" value-unit="px" />
        <PreviewSlider title="Speed" v-model="speed" :min="1" :max="10" :step="0.5" value-unit="s" />
      </Customize>

      <PropTable :data="propData" />
    </template>

    <template #code>
      <CodeExample :code-object="starBorder" />
    </template>

    <template #cli>
      <CliInstallation :command="starBorder.cli" />
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
import StarBorder from '../../content/Animations/StarBorder/StarBorder.vue';
import { starBorder } from '@/constants/code/Animations/starBorderCode';

const thickness = ref<number>(3);
const speed = ref<number>(6);
const speedProp = ref<string>('6s');
const color = ref<string>('lightgreen');
const colorOptions = [
  { label: 'Magenta', value: 'magenta' },
  { label: 'Green', value: 'lightgreen' },
  { label: 'white', value: 'white' }
];

watch(speed, () => {
  speedProp.value = speed.value.toString() + 's';
});

const propData = [
  {
    name: 'as',
    type: 'string',
    default: 'button',
    description: 'Allows specifying the type of the parent component to be rendered.'
  },
  {
    name: 'customClass',
    type: 'string',
    default: '',
    description: 'Allows adding custom classes to the component.'
  },
  {
    name: 'color',
    type: 'string',
    default: 'white',
    description: 'Changes the main color of the border (fades to transparent)'
  },
  {
    name: 'speed',
    type: 'string',
    default: '6s',
    description: 'Changes the speed of the animation.'
  },
  {
    name: 'thickness',
    type: 'number',
    default: '3',
    description: 'Controls the thickness of the star border effect.'
  }
];
</script>
