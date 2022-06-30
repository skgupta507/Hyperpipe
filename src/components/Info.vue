<script setup>
import TextModal from './TextModal.vue';

defineProps(['text']);

const parse = d =>
  new DOMParser().parseFromString(d, 'text/html').body.innerText;
</script>

<template>
  <TextModal>
    <template #content>
      <pre>{{ parse(text.replaceAll('<br>', '\n')) }}</pre>
    </template>
  </TextModal>
</template>
