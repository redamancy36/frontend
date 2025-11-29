<template>
  <Button class="refresh-button" @click="$emit('refresh')" outlined rounded size="small">
    <i class="pi pi-refresh"></i>
  </Button>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

defineEmits<{
  refresh: [];
}>();
</script>

<style scoped>
.refresh-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  background-color: #0b0b0b;
  border: 1px solid #333;
  color: white;
  border-radius: 12px;
  padding: 0.5rem;
  transition: background-color 0.3s ease;
}

.refresh-button:hover {
  background-color: #222 !important;
  color: #fff !important;
  border: 1px solid #333 !important;
  outline: 1px solid transparent !important;
}

.refresh-button:active {
  background-color: #0b0b0b;
}
</style>
