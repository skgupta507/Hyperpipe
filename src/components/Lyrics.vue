<script setup>
import { ref, watch } from 'vue';

import { getJson } from '@/scripts/fetch.js';
import { useData } from '@/stores/player.js';

import TextModal from './TextModal.vue';

const data = useData(),
  text = ref(''),
  source = ref(''),
  status = ref(false);

function get() {
  status.value = false;

  if (data.state.lyrics && data.state.urls === data.state.urls[0]?.url) {
    getJson(
      'https://hyperpipeapi.onrender.com/browse/' + data.state.lyrics,
    ).then(res => {
      text.value = res.text;
      source.value = res.source;
      status.value = true;
    });
  } else if (data.state.urls[0]?.url) {
    getJson(
      'https://hyperpipeapi.onrender.com/next/' +
        data.state.urls[0]?.url.replace('/watch?v=', ''),
    ).then(next => {
      if (next.lyricsId) {
        getJson(
          'https://hyperpipeapi.onrender.com/browse/' + next.lyricsId,
        ).then(res => {
          text.value = res.text;
          source.value = res.source;
          status.value = true;
        });
      }
    });
  }
}

get();

watch(
  () => data.state.urls[0]?.url,
  () => {
    get();
  },
);
</script>

<template>
  <TextModal>
    <template #content>
      <pre
        class="placeholder"
        :data-loaded="data.state.urls[0]?.url ? status : true"
        >{{ text }}</pre
      >
      <div>{{ source }}</div>
    </template>
  </TextModal>
</template>

<style scoped>
.placeholder:empty::before {
  --ico: '\f3a5';
}
.placeholder[data-loaded='false']:empty::after {
  --text: 'Fetching Lyrics...';
}
.placeholder[data-loaded='true']:empty::after {
  --text: 'No Lyrics...';
}
</style>
