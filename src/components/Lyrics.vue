<script setup>
import { ref, watch } from 'vue';

import { getJsonHyp } from '@/scripts/fetch.js';
import { useData } from '@/stores/player.js';

import TextModal from './TextModal.vue';

const data = useData(),
  text = ref(''),
  source = ref(''),
  status = ref(false);

function get() {
  status.value = false;

  const set = id => {
    getJsonHyp('/browse/' + id).then(res => {
      text.value = res.text;
      source.value = res.source;
      status.value = true;
    });
  };

  if (data.state.lyrics && data.state.urls === data.state.url) {
    set(data.state.lyrics);
  } else if (data.state.url) {
    getJsonHyp('/next/' + data.state.url.replace('/watch?v=', '')).then(
      next => {
        if (next.lyricsId) set(next.lyricsId);
      },
    );
  }
}

get();

watch(
  () => data.state.url,
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
