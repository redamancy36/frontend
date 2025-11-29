<template>
  <div class="select-none">
    <div
      class="right-6 bottom-0 z-10 absolute opacity-50 hover:opacity-100 transition-opacity duration-300 ease-in-out select-none"
    >
      <PreviewSwitch title="Demo Content" v-model="showContent" />
    </div>

    <template v-if="showContent">
      <div class="top-[2em] left-0 z-1 absolute w-full h-[60px] pointer-events-none">
        <div
          class="flex justify-between items-center bg-[rgba(255,255,255,0.05)] backdrop-filter backdrop-blur-[10px] mx-auto my-0 px-6 py-4 border border-[rgba(255,255,255,0.2)] rounded-[50px] w-[90%] md:w-[60%] h-full"
          :style="{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
          }"
        >
          <img :src="logo" alt="Vue Bits Logo" class="rounded-[50px] h-[24px]" />
          <div class="md:hidden flex items-center text-white">
            <i class="pi pi-bars"></i>
          </div>
          <div class="hidden md:flex items-center gap-6 font-semibold">
            <p class="flex items-center text-[14px] text-white">Home</p>
            <p class="flex items-center text-[14px] text-white">Docs</p>
          </div>
        </div>
      </div>

      <div
        class="top-0 left-0 z-1 absolute flex flex-col justify-center items-center w-full h-full pointer-events-none"
      >
        <div
          class="flex justify-center items-center bg-[rgba(255,244,255,0.05)] backdrop-filter backdrop-blur-[10px] px-4 border border-[rgba(255,255,255,0.2)] rounded-[50px] w-auto h-[34px] font-medium text-[12px] text-white md:text-[14px]"
          :style="{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
          }"
        >
          <span class="flex justify-center items-center" v-html="props.pillIcon"></span>
          <p class="ml-1">{{ props.pillText }}</p>
        </div>

        <p
          class="mt-4 max-w-[18ch] font-bold text-[clamp(2rem,4vw,2.6rem)] text-white text-center leading-[1.2] tracking-[-2px]"
          :style="{
            textShadow: '0 0 16px rgba(0, 0, 0, 0.5)'
          }"
        >
          {{ props.headline }}
        </p>

        <div class="flex items-center gap-4 mt-8">
          <button
            class="bg-white hover:bg-gray-100 px-6 md:px-10 py-2 md:py-3 border-none rounded-[50px] font-medium text-[12px] text-black md:text-[14px] transition-all hover:translate-y-[-1px] duration-200 ease-in-out cursor-pointer"
          >
            {{ props.mainCtaText }}
          </button>
          <button
            class="bg-white/5 hover:bg-white/10 shadow-md backdrop-blur-md px-6 md:px-10 py-2 md:py-3 border border-white/20 rounded-full font-medium text-[12px] text-white/50 md:text-[14px] transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
            :style="{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }"
          >
            {{ props.secondCtaText }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import logo from '../../assets/logos/vue-bits-logo.svg';
import PreviewSwitch from './PreviewSwitch.vue';

interface BackgroundContentProps {
  pillText?: string;
  pillIcon?: string;
  headline?: string;
  mainCtaText?: string;
  secondCtaText?: string;
}

const props = withDefaults(defineProps<BackgroundContentProps>(), {
  pillText: 'New Component',
  pillIcon: '<i class="pi pi-sliders-h" style="font-size: 10px;"></i>',
  headline: 'Explore the depths of creativity',
  mainCtaText: 'Get Started',
  secondCtaText: 'Learn More'
});

const showContent = ref(true);
</script>
