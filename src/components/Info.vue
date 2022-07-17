<script setup>
import TextModal from './TextModal.vue';

defineProps(['text']);

const parse = d =>
  new DOMParser().parseFromString(d, 'text/html').body.innerText;
</script>

<template>
  <TextModal>
    <template #content>
      <pre class="placeholder">{{ 
        text ? parse(text.replaceAll('<br>', '\n')) : ''
      }}</pre>
    </template>
  </TextModal>
</template>

<style scoped>
.placeholder:empty::before {
  --ico: '\F3B9';
}
.placeholder:empty::after {
  --text: 'No Information Available...';
}
</style>
