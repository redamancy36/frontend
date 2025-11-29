<template>
  <div class="cli-installation">
    <h2 class="demo-title">One-Time Installation</h2>

    <VCodeBlock
      v-if="command"
      :code="command"
      :persistent-copy-button="true"
      highlightjs
      lang="bash"
      theme="nord"
      :copy-button="true"
      class="code-block"
    />

    <div class="cli-divider"></div>

    <h2 class="demo-title">Full CLI Setup</h2>

    <p class="jsrepo-info">
      Vue Bits uses
      <a href="https://jsrepo.dev/" target="_blank" rel="noreferrer">jsrepo</a>
      to help you install components via CLI— you can set it up project-wide following the steps below.
    </p>

    <Accordion expandIcon="pi pi-chevron-right" collapseIcon="pi pi-chevron-down">
      <AccordionPanel value="setup">
        <AccordionHeader>Setup Steps</AccordionHeader>

        <AccordionContent
          :pt="{
            transition: {
              enterFromClass: '',
              enterActiveClass: '',
              enterToClass: '',
              leaveFromClass: '',
              leaveActiveClass: '',
              leaveToClass: ''
            }
          }"
        >
          <div class="setup-content">
            <p class="demo-extra-info">1. Initialize a config file for your project</p>

            <div class="setup-option">
              <VCodeBlock
                :persistent-copy-button="true"
                code="npx jsrepo init https://vue-bits.dev/ui"
                highlightjs
                lang="bash"
                theme="nord"
                :copy-button="true"
                class="code-block"
              />
            </div>

            <p class="demo-extra-info">2. Browse &amp; add components from the list</p>

            <VCodeBlock
              :persistent-copy-button="true"
              code="npx jsrepo add"
              highlightjs
              lang="bash"
              theme="nord"
              :copy-button="true"
              class="code-block"
            />

            <p class="demo-extra-info">3. Or just add a specific component</p>

            <VCodeBlock
              :persistent-copy-button="true"
              code="npx jsrepo add Animations/AnimatedContainer"
              highlightjs
              lang="bash"
              theme="nord"
              :copy-button="true"
              class="code-block"
            />
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { VCodeBlock } from '@wdns/vue-code-block';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

const { command } = defineProps<{
  command?: string;
}>();
</script>

<style scoped>
.cli-installation {
  padding-bottom: 1.2rem;
  font-size: 16px;
}

.setup-content {
  padding: 1rem 0;
}

.setup-option {
  margin-bottom: 1.5rem;
}

.jsrepo-info {
  color: #a1a1aa;
  font-size: 14px;
  margin: 1rem 0;
}

.jsrepo-info a {
  color: #27ff64;
  text-decoration: underline;
}

.code-block {
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #333;
}

:deep(.p-accordionpanel) {
  border: none;
}

:deep(.p-accordion-header) {
  background: #0b0b0b !important;
  border: 1px solid #333 !important;
  border-radius: 20px !important;
}

:deep(.p-accordionpanel:not(.p-disabled).p-accordionpanel-active > .p-accordionheader) {
  background: #0b0b0b !important;
  border: 1px solid #333 !important;
  border-radius: 15px 15px 0 0;
  border-bottom: none !important;
}

:deep(.p-accordionpanel:not(.p-disabled) > .p-accordionheader) {
  border: 1px solid #333 !important;
  border-radius: 15px;
  background: #0b0b0b !important;
}

:deep(.p-accordionpanel) {
  border: none;
}

:deep(.p-accordionheader-toggle-icon) {
  color: #fff !important;
  fill: #fff !important;
}

:deep(.p-accordionheader-toggle-icon svg) {
  color: #fff !important;
  fill: #fff !important;
}

:deep(.p-accordionheader-toggle-icon path) {
  fill: #fff !important;
  stroke: #fff !important;
}

:deep(.p-accordion-content) {
  background: #0b0b0b !important;
  border: 1px solid #333 !important;
  border-top: none;
  border-radius: 0 0 15px 15px;
}

:deep(.p-accordioncontent-content) {
  background: #0b0b0b !important;
  border: 1px solid #333 !important;
  border-radius: 0 0 15px 15px;
  border-top: none !important;
}

:deep(.v-code-block) {
  background: #0b0b0b;
  font-weight: 400;
  font-size: 14px;
}

:deep(.v-code-block pre) {
  background: #0b0b0b;
  margin: 0;
  font-size: 14px;
}

:deep(.v-code-block .hljs) {
  background: #0b0b0b;
  color: #fff;
  font-size: 14px;
}

:deep(.v-code-block--tab-highlightjs-github-dark-icon) {
  color: #999 !important;
  fill: #999 !important;
}

:deep(.v-code-block--me-1) {
  margin-right: 0 !important;
}
</style>
