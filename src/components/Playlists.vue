<script setup>
import { ref, onMounted } from 'vue';
import Sortable from 'sortablejs/modular/sortable.core.esm.js';

import { useData, usePlayer } from '@/stores/player.js';
import { useI18n } from '@/stores/misc.js';

const emit = defineEmits(['playthis']);

const { t } = useI18n(),
  player = usePlayer(),
  data = useData();

const pl = ref(null);

function handleClick(plurl, e) {
  if (!e.target.classList.contains('pl-handle')) emit('playthis', plurl);
}

onMounted(() => {
  new Sortable(pl.value, {
    handle: '.pl-handle',
    animation: 150,
    onEnd: e => {
      data.state.urls.splice(
        e.newIndex,
        0,
        data.state.urls.splice(e.oldIndex, 1)[0],
      );
    },
  });
});
</script>

<template>
  <Transition name="fade">
    <div
      id="pl"
      ref="pl"
      class="pl-modal placeholder"
      :data-placeholder="t('playlist.add')">
      <div
        v-for="plurl in data.state.urls"
        class="pl-item"
        :key="plurl.url"
        @click="handleClick(plurl, $event)">
        <span
          v-if="data.state.url == plurl.url"
          class="bars-wrap"
          :class="player.state.status">
          <div class="bars"></div>
          <div class="bars"></div>
          <div class="bars"></div>
        </span>
        <div v-else-if="plurl.thumbnails" class="pl-img">
          <img
            :src="plurl.thumbnails[0].url"
            :height="plurl.thumbnails[0].height"
            :width="plurl.thumbnails[0].width"
            loading="lazy" />
        </div>
        <span class="pl-main caps">{{ plurl.title }}</span>
        <span class="bi bi-grip-horizontal pl-handle clickable"></span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pl-modal {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 2rem;
  bottom: calc(5rem + 5vh);
  left: 1rem;
  width: 30rem;
  max-width: calc(100% - 2rem);
  background: var(--color-background-mute);
  border-radius: 0.5rem;
  z-index: 9999;
  box-shadow: 0.1rem 0.1rem 1rem var(--color-shadow);
  padding: 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.placeholder:empty::before {
  --ico: '\f64d';
}
.pl-item {
  display: flex;
  align-items: center;
  min-height: 3.55rem;
  column-gap: 0.4rem;
  padding: 0.4rem;
  margin: 0.125rem;
  border-radius: 0.25rem;
  background: var(--color-background);
  transition: background-color 0.1s ease;
}
.pl-item:hover {
  background: var(--color-background-soft);
}
.pl-item:active {
  background: var(--color-border);
}
.pl-main {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.pl-img {
  flex-shrink: 0;
  background-image: var(--src);
  height: 2.75rem;
  width: 2.75rem;
  background-size: contain;
  background-repeat: no-repeat;
}
.pl-img img {
  height: 100%;
  width: 100%;
  border-radius: 0.125rem;
}
.pl-img[data-active='false'] {
  display: none;
}
.pl-handle {
  cursor: grab;
  margin-left: auto;
  margin-right: 0.75rem;
}
</style>
