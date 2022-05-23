<script setup>
import { ref, watch } from 'vue';

import { getJson } from '../scripts/fetch.js';

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
  <div class="ly-modal">
    <pre class="placeholder" :data-loaded="curl ? status : true">{{
      text
    }}</pre>
    <div>{{ source }}</div>
  </div>
</template>

<style scoped>
.ly-modal {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 2rem;
  bottom: 5rem;
  right: 1rem;
  width: 30rem;
  max-width: calc(100% - 2rem);
  background: var(--color-background-mute);
  border-radius: 0.5rem;
  z-index: 99999;
  box-shadow: 0.1rem 0.1rem 1rem var(--color-shadow);
  padding: 1rem;
  overflow-y: auto;
}
pre {
  font-family: inherit;
  font-size: 1.25rem;
  letter-spacing: 0.125rem;
  white-space: pre-wrap;
}
pre:empty::before {
  --ico: '\f3a5';
}
pre[data-loaded='false']:empty::after {
  --text: 'Fetching Lyrics...';
}
pre[data-loaded='true']:empty::after {
  --text: 'No Lyrics...';
}

div {
  padding: 1rem;
  letter-spacing: 0.1rem;
  font-weight: 600;
}
</style>
