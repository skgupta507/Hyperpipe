<script setup>
import { useT } from '@/scripts/i18n.js';
import TextModal from './TextModal.vue';

defineProps(['text']);

const parse = d =>
  new DOMParser().parseFromString(d, 'text/html').body.innerText;
</script>

<template>
  <TextModal>
    <template #content>
      <pre class="placeholder" :data-placeholder="useT('info.no_info')">{{ 
        text ? parse(text.replaceAll('<br>', '\n')) : ''
      }}</pre>
    </template>
  </TextModal>
</template>

<style scoped>
.placeholder:empty::before {
  --ico: '\F3B9';
}
</style>
