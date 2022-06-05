<script setup>
import { ref, reactive, watch } from 'vue';

import Modal from './Modal.vue';

import { useStore } from '../scripts/util.js';
import { useListPlaylists } from '../scripts/db.js';

defineProps({
  state: String,
  time: Number,
  show: Boolean,
  loop: Boolean,
  lyrics: Boolean,
});

const emit = defineEmits(['vol', 'play', 'toggle', 'save', 'change-time']),
  vol = ref(useStore().vol / 100 || 1),
  showme = reactive({
    menu: false,
    pl: false,
    vol: false,
  }),
  pl = ref(''),
  list = ref([]);

function Save() {
  showme.pl = true;
  useListPlaylists(res => {
    console.log(res);
    list.value = res;
    showme.menu = false;
  });
}
</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <Modal
        n="2"
        :display="showme.pl"
        title="Select Playlist to Add"
        @show="
          e => {
            showme.pl = e;
          }
        ">
        <template #content>
          <template v-for="i in list">
            <div
              class="flex item"
              @click="pl = i.name"
              :data-active="pl == i.name">
              <span>{{ i.name }}</span
              ><span class="ml-auto">{{ i.urls.length || '' }}</span>
            </div>
          </template>
        </template>
        <template #buttons>
          <button aria-label="Cancel" @click="showme.pl = false">Cancel</button>
          <button
            aria-label="Add Song"
            @click="
              if (pl) $emit('save', pl);
              showme.pl = false;
            ">
            Add
          </button>
        </template>
      </Modal>
    </Transition>
  </Teleport>

  <div id="statusbar" class="flex">
    <div class="flex statusbar-left">
      <button
        id="btn-play-pause"
        aria-label="Play or Pause"
        :class="'bi bi-' + state"
        @click="$emit('play')"></button>

      <div id="statusbar-progress" class="range-wrap">
        <input
          aria-label="Change Time"
          :value="time"
          type="range"
          name="statusbar-progress"
          max="100"
          @input="$emit('change-time', $event.target.value)" />
      </div>
    </div>

    <div class="flex statusbar-right">
      <button
        id="vol-btn"
        aria-label="Volume Buttons"
        @click="showme.vol = !showme.vol"
        class="popup-wrap bi bi-volume-up">
        <Transition name="fade">
          <div v-if="showme.vol" id="vol" class="popup">
            <input
              id="vol-input"
              aria-label="Volume Input"
              type="range"
              :value="vol"
              max="1"
              step=".01"
              @input="
                $emit('vol', $event.target.value);
                vol = $event.target.value;
              " />
          </div>
        </Transition>
      </button>
      <button
        class="bi bi-three-dots"
        aria-label="More Controls"
        @click="
          showme.menu = !showme.menu;
          show ? $emit('toggle', 'showplaylist') : '';
          lyrics ? $emit('toggle', 'showlyrics') : '';
        "></button>
      <div id="menu" v-if="showme.menu" class="popup">
        <button
          id="addToPlaylist"
          title="Add Current Song to a Playlist"
          aria-label="Add Current Song to a Playlist"
          class="bi bi-collection"
          @click="Save"></button>
        <button
          id="list-btn"
          title="Current Playlist"
          aria-label="Current Playlist"
          :class="'bi bi-music-note-list ' + show"
          @click="$emit('toggle', 'showplaylist')"></button>
        <button
          id="btn-lyrics"
          :class="'bi bi-file-music ' + lyrics"
          @click="$emit('toggle', 'showlyrics')"></button>
        <button
          id="loop-btn"
          title="Loop"
          aria-label="Loop"
          :class="'bi bi-infinity ' + loop"
          @click="$emit('toggle', 'loop')"></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#statusbar {
  position: fixed;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 0.5rem 0;
  border-top: 0.25rem solid var(--color-foreground);
  background: var(--color-background);
  min-height: 15vh;
}
.statusbar-left {
  margin-left: auto;
}
.statusbar-right {
  margin-left: 0.5rem;
  margin-right: auto;
}
.bi-play,
.bi-pause {
  font-size: 2.5rem !important;
}
.bi-volume-up {
  font-size: 1.5rem !important;
}
.bi-infinity {
  font-size: 1.75rem !important;
}
.ml-auto {
  margin-left: auto;
}
.item {
  background: var(--color-background);
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}
.item:hover {
  background: var(--color-background-mute);
}

.item[data-active='true'] {
  color: var(--color-background);
  background: linear-gradient(135deg, cornflowerblue, #88c0d0);
}
#menu {
  bottom: 1.5rem;
  left: -1.75rem;
  box-shadow: 0.5rem 0.5rem 2rem var(--color-shadow);
}
#vol {
  --h: 6.5rem;
  --w: 1rem;
  display: flex;
  box-shadow: -0.5rem -0.5rem 2rem var(--color-shadow);
  transform: rotateZ(270deg) translateX(calc(calc(var(--h) / 2) - 0.5rem))
    translateY(calc(calc(var(--w) + 2rem) * -1));
}
input[type='range'] {
  width: var(--h);
  height: var(--w);
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border: none;
  border-radius: 5rem;
  background: transparent;
  color: transparent;
  cursor: pointer;
  position: relative;
}
input[type='range']:focus {
  outline: none;
}

/* Webkit */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
input[type='range']:hover::-webkit-slider-thumb,
#vol input[type='range']::-webkit-slider-thumb {
  background-color: var(--color-foreground);
  opacity: 1;
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  margin-top: -0.4rem;
}
input[type='range']::-webkit-slider-runnable-track {
  height: 100%;
  background-color: var(--color-border);
}
#vol input[type='range']::-webkit-slider-runnable-track {
  height: 0.1rem;
}

/* Moz */
input[type='range']::-moz-range-thumb {
  -moz-appearance: none;
  appearance: none;
  opacity: 0;
  border: none;
  outline: none;
  transition: opacity 0.4s ease;
}
input[type='range']:hover::-moz-range-thumb,
#vol input[type='range']::-moz-range-thumb {
  background-color: var(--color-foreground);
  opacity: 1;
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  margin-top: -0.45rem;
}
input[type='range']::-moz-range-track {
  height: 100%;
  background-color: var(--color-border);
}
#vol input[type='range']::-moz-range-track {
  height: 0.1rem;
}

.range-wrap {
  --fw: 0%;
  display: flex;
  align-items: center;
  position: relative;
  height: 0.25rem;
  display: inline-block;
}
.range-wrap:before {
  content: '';
  width: var(--fw);
  position: absolute;
  left: 0;
  bottom: 0;
  height: 0.25rem;
  background-color: var(--color-foreground);
  transition: width 0.4s ease;
}
.range-wrap input[type='range'] {
  --w: 100%;
  --h: 100%;
  position: absolute;
  top: 0;
}
#statusbar-progress {
  --fw: v-bind('time + "%"');
  width: 50vw;
  min-width: 200px;
  max-width: 500px;
}

@media (max-width: 500px) {
  #menu {
    left: initial;
    right: -0.5rem;
  }
}
</style>
