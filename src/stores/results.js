import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

export const useResults = defineStore('results', () => {
  const items = ref({}),
    search = ref('');

  function setItem(key, val) {
    items.value[key] = val;
    console.log(items.value);
  }

  function resetItems() {
    for (let i in items.value) {
      items.value[i] = undefined;
    }
  }

  return { items, search, setItem, resetItems };
});

export const useArtist = defineStore('artist', () => {
  const state = reactive({
    playlistId: null,
    title: null,
    description: null,
    subscriberCount: 0,
    thumbnails: [],
  });

  function reset() {
    for (let i in state) {
      state[i] = undefined;
    }
  }

  function set(obj) {
    for (let i in obj) {
      state[i] = obj[i];
    }
  }

  return { state, set, reset };
});
