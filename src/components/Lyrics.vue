<script setup>
import { ref, watch } from 'vue';

import { getJson } from '../scripts/fetch.js';

import TextModal from './TextModal.vue';

const props = defineProps({
    id: String,
    curl: String,
    iniurl: String,
  }),
  text = ref(''),
  source = ref(''),
  status = ref(false);

console.log(props);

function get() {
  status.value = false;

  if (props.id && props.curl === props.iniurl) {
    console.log(props.id);

    getJson('https://hyperpipeapi.onrender.com/browse/' + props.id).then(
      res => {
        text.value = res.text;
        source.value = res.source;
        status.value = true;
      },
    );
  } else if (props.curl) {
    getJson(
      'https://hyperpipeapi.onrender.com/next/' +
        props.curl.replace('/watch?v=', ''),
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
  () => props.curl,
  () => {
    get();
  },
);
</script>

<template>
  <TextModal>
    <template #content>
      <pre class="placeholder" :data-loaded="curl ? status : true">{{
        text
      }}</pre>
      <div>{{ source }}</div>
    </template>
  </TextModal>
</template>

<style scoped>
pre:empty::before {
  --ico: '\f3a5';
}
pre[data-loaded='false']:empty::after {
  --text: 'Fetching Lyrics...';
}
pre[data-loaded='true']:empty::after {
  --text: 'No Lyrics...';
}
</style>
