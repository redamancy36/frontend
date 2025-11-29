<template>
  <FadeContent :blur="true" :duration="600">
    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-left">
          <img :src="vueBitsLogo" alt="Vue Bits" class="footer-logo" />

          <p class="footer-description">
            A library created with
            <i class="pi pi-heart-fill footer-heart"></i>
            by
            <a href="https://davidhaz.com/" target="_blank" class="footer-creator-link">this guy</a>
          </p>

          <p class="footer-copyright">© {{ new Date().getFullYear() }} Vue Bits</p>
        </div>

        <div class="footer-links">
          <a href="https://github.com/DavidHDev/vue-bits" target="_blank" rel="noopener noreferrer" class="footer-link">
            GitHub
          </a>

          <router-link to="/text-animations/split-text" class="footer-link">Docs</router-link>
          <a href="https://www.jsrepo.com/" target="_blank" class="footer-link">CLI</a>
          <a href="https://reactbits.dev/" target="_blank" class="footer-link">React Bits</a>
        </div>
      </div>
    </footer>
  </FadeContent>
</template>

<script setup lang="ts">
import vueBitsLogo from '../../../assets/logos/vue-bits-logo.svg';
import FadeContent from '@/content/Animations/FadeContent/FadeContent.vue';
import './Footer.css';
</script>
