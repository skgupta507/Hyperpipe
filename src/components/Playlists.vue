<script setup>
defineProps({
  url: String,
  urls: Array,
  show: Boolean,
});
defineEmits(['playthis']);
</script>

<template>
  <div v-if="show" class="modal placeholder">
    <template v-for="plurl in urls">
      <div class="pl-item" @click="$emit('playthis', plurl)">
        <span v-if="url == plurl.url" class="bars-wrap">
          <div class="bars"></div>
          <div class="bars"></div>
          <div class="bars"></div>
        </span>
        <span class="pl-main caps">{{ plurl.title }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.modal {
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
  transition: width 0.4s ease;
  animation: fade 0.4s ease;
  overflow-y: auto;
}
.placeholder:empty:before {
  --url: url('/bg_playlist.svg');
}
.placeholder:empty:after {
  --text: 'Add Songs to Your Playlist...';
  padding-top: 2rem;
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
  padding-left: 3rem;
}
</style>
