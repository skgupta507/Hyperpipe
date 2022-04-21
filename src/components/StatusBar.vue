<script setup>
import { ref, watch } from 'vue';
import Modal from './Modal.vue'
import { useListPlaylists } from '../scripts/db.js'

defineProps({
  state: String,
  time: Number,
  show: Boolean,
  loop: Boolean,
});

const emit = defineEmits(['vol', 'play', 'list', 'loop', 'save', 'change-time']),
showVol = ref(false), vol = ref(1), showmenu = ref(false), showpl = ref(false), pl = ref(''), list = ref([]);

function Save() {
  showpl.value = true;
  useListPlaylists((res) => {
    console.log(res);
    list.value = res;
    showmenu.value = false;
  })
}
</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <Modal n="2" :display="showpl" title="Select Playlist to Add" @show="(e) => { showpl = e }">
        <template #content>
          <template v-for="i in list">
            <div class="flex" @click="pl = i.name"><span>{{ i.name }}</span><span class="ml-auto">{{ i.urls.length || '' }}</span></div>
          </template>
        </template>
        <template #buttons>
          <button @click="showpl = false">Cancel</button>
          <button @click="if (pl) $emit('save', pl); showpl = false">Add</button>
        </template>
      </Modal>
    </Transition>
  </Teleport>

  <div id="statusbar" class="flex">
    <div class="flex statusbar-left">
      <button
        id="btn-play-pause"
        :class="'bi bi-' + state"
        @click="$emit('play')"></button>

      <div
        id="statusbar-progress"
        class="range-wrap"
        :style="'--fw:' + time + '%;'">
        <input
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
        @click="showVol = !showVol"
        class="popup-wrap bi bi-volume-up">
        <Transition name="fade">
          <div v-if="showVol" id="vol" class="popup">
            <input
              id="vol-input"
              type="range"
              :value="vol"
              max="1"
              step=".01"
              @input="$emit('vol', $event.target.value); vol = $event.target.value" />
          </div>
        </Transition>
      </button>
      <button class="bi bi-three-dots" @click="showmenu = !showmenu; if (show) $emit('list', 'showplaylist')"></button>
      <div id="menu" v-if="showmenu" class="popup">
        <button id="addToPlaylist" title="Add Current Song to a Playlist" class="bi bi-collection" @click="Save"></button>
        <button
          id="list-btn"
          title="Current Playlist"
          :class="'bi bi-music-note-list ' + show"
          @click="$emit('list', 'showplaylist')"></button>
        <button
          id="loop-btn"
          title="Loop"
          :class="'bi bi-infinity ' + loop"
          @click="$emit('loop', 'loop')"></button>
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
#menu {
  bottom: 1.5rem;
  left: -1.75rem;
  box-shadow: .5rem .5rem 2rem var(--color-shadow);
}
#vol {
  --h: 6.5rem;
  --w: 1rem;
  display: flex;
  box-shadow: -.5rem -.5rem 2rem var(--color-shadow);
  transform: rotateZ(270deg) translateX(calc(calc(var(--h) / 2) - 0.5rem))
    translateY(calc(calc(var(--w) + 2rem) * -1));
}
input[type='range'] {
  width: var(--h);
  height: var(--w);
  appearance: none;
  -webkit-appearence: none;
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
  margin-top: -0.45rem;
}
input[type='range']::-webkit-slider-runnable-track {
  height: 100%;
  background-color: var(--color-border);
}
#vol input[type='range']::-webkit-slider-runnable-track {
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
  width: 50vw;
  min-width: 200px;
  max-width: 500px;
}
</style>
