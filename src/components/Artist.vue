<script setup>
import { ref, onUpdated } from 'vue';
import PlayBtn from './PlayBtn.vue';

import { useArtist } from '@/stores/results.js';

const artist = useArtist();

defineEmits(['playall']);

const show = ref(-1);
show.value = location.pathname.indexOf('/channel/UC');

onUpdated(() => {
  show.value = location.pathname.indexOf('/channel/UC');
});
</script>

<template>
  <div v-if="show == 0 && artist.state.title" class="us-wrap">
    <div
      class="bg-imgfill"
      :style="'--art: url(' + artist.state.thumbnails[1].url + ');'"></div>
    <div class="us-main">
      <h2>{{ artist.state.title }}</h2>
      <p @click="$event.target.classList.toggle('more')">
        {{ artist.state.description }}
      </p>
      <div class="us-playwrap">
        <PlayBtn
          @click="
            $emit('playall', '/playlist?list=' + artist.state.playlistId)
          " />
        <span class="us-box subs">{{ artist.state.subscriberCount || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.us-wrap {
  min-height: 5rem;
  margin-bottom: 5rem;
}
.bg-imgfill {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: var(--art);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(5px) opacity(50%);
}
.us-main {
  color: #fff;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-shadow: inset 0 0 10rem #000;
}
h2 {
  padding: 1rem;
  font-size: 2rem;
}
p {
  --line: 3;
  display: -webkit-box;
  -webkit-line-clamp: var(--line);
  -webkit-box-orient: vertical;
  hyphens: auto;
  margin: 1rem;
  font-size: 1rem;
  line-height: 1.25rem;
  overflow: hidden;
}
p.more {
  --line: auto;
}
.us-playwrap {
  padding: 1rem;
}
.us-box {
  border-radius: 0.25rem;
  font-weight: bold;
  margin-left: 2rem;
  padding: 0.5rem;
  border: 0.125rem solid var(--color-foreground);
  background: var(--color-background-mute);
  color: var(--color-foreground);
  box-shadow: 0 0 1rem var(--color-background-mute);
}
.subs:after {
  content: ' Subscribers';
  font-weight: bold;
}
@media (max-width: 400px) {
  .subs:after {
    content: ' Subs';
  }
}
</style>
