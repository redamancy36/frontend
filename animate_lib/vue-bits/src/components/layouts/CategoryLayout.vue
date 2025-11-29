<template>
  <main class="app-container">
    <Header />

    <section class="category-wrapper">
      <Sidebar />

      <div class="category-page">
        <router-view />
      </div>
    </section>

    <Toast
      position="bottom-right"
      :closeButtonProps="customToastStyles.customToastCloseButton"
      :pt="customToastStyles"
    />
  </main>
</template>

<script setup lang="ts">
import { customToastStyles } from '@/utils/utils';
import Header from '../navs/Header.vue';
import Sidebar from '../navs/Sidebar.vue';
</script>
