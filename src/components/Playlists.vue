<script setup>
import { useData, usePlayer } from '@/stores/player.js';

const player = usePlayer(),
  data = useData();

defineEmits(['playthis']);
</script>

<template>
  <Transition name="fade">
    <div class="pl-modal placeholder">
      <template v-for="plurl in data.state.urls">
        <div class="pl-item" @click="$emit('playthis', plurl)">
          <span v-if="data.state.url == plurl.url" class="bars-wrap">
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
        </div>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.pl-modal {
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
.placeholder:empty:before {
  --ico: '\f64d';
}
.placeholder:empty:after {
  --text: 'Add Songs to Playlist...';
}
.pl-item {
  padding: 1rem;
  margin: 0.125rem;
  border-radius: 0.25rem;
  background: var(--color-background);
}
.pl-item:hover {
  background: var(--color-background-soft);
}
.pl-main {
  padding-left: 2.75rem;
}
.pl-img {
  top: 0.45rem;
  left: 0.45rem;
  position: absolute;
  background-image: var(--src);
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 0.125rem;
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
</style>
