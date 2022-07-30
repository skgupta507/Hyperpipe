import { reactive } from 'vue';
import { defineStore } from 'pinia';

import { useStore } from '../scripts/util.js';

const store = useStore();

export const useData = defineStore('data', () => {
  const state = reactive({
    title: '',
    description: '',
    artist: '',
    art: '',
    url: '',
    artistUrl: '',
    lyrics: '',
    src: [],
    urls: [],
  });

  return { state };
});

export const usePlayer = defineStore('player', () => {
  const state = reactive({
    loop: false,
    play: false,
    status: 'play',
    hls: '',
    streams: [],
    duration: 0,
    time: 0,
    currentTime: 0,
    playlist: false,
    lyrics: false,
    info: false,
    vol: store.vol ? store.vol / 100 : 1,
  });

  function toggle(i) {
    console.log(i, state[i]);
    if (typeof state[i] == 'boolean') {
      state[i] = !state[i];
    }
    console.log(i, state[i]);
  }

  function setTime(t) {
    state.time = Math.floor((t / state.duration) * 100);
  }

  return { state, toggle, setTime };
});
