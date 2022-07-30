<script setup>
import { ref, onMounted } from 'vue';

import { useRand } from '../scripts/colors.js';

import { useArtist } from '@/stores/results.js';

const rand = useRand();

const props = defineProps({
    author: String,
    title: String,
    channel: String,
    play: String,
    art: String,
  }),
  emit = defineEmits(['get-artist', 'open-song']),
  show = ref(false);

const openSong = el => {
    if (!el.classList.contains('ign')) {
      emit('open-song', props.play);
    }
  },
  Share = async () => {
    if ('share' in navigator) {
      const data = {
        title: `Listen to ${props.title} by ${props.author} on Hyperpipe`,
        url: location.origin + props.play,
      };

      try {
        await navigator.share(data);
        console.log('Done Sharing!');
      } catch (err) {
        console.log(err);
      }
    } else {
      navigator.clipboard.writeText(location.host + props.play).then(
        () => {
          console.log('Copied to Clipboard');
        },
        err => {
          console.log(err);
        },
      );
    }
  };

onMounted(() => {
  console.log(props.channel, useArtist().state.playlistId);
});
</script>
<template>
  <div class="song card flex pop" @click="openSong($event.target)">
    <div class="pop-2 bg-img song-bg"></div>

    <span class="flex content">
      <h4>{{ title }}</h4>
      <a
        :href="
          channel != '[]' ? channel : '/channel/' + useArtist().state.playlistId
        "
        @click.prevent="
          $emit(
            'get-artist',
            channel != '[]'
              ? channel.replace('/channel/', '')
              : useArtist().state.playlistId,
          )
        "
        class="ign">
        <i class="ign">{{ author.replaceAll(' - Topic', '') }}</i>
      </a>
    </span>

    <span
      class="bi bi-three-dots-vertical popup-wrap ign"
      @mouseenter="show = true"
      @mouseleave="show = false">
      <Transition name="fade">
        <div v-if="show" class="popup ign">
          <span
            class="bi bi-plus-lg ign"
            @click="
              $parent.$emit('add-song', { url: play, title: title })
            "></span>

          <span class="bi bi-share ign" @click="Share"></span>
        </div>
      </Transition>
    </span>
  </div>
</template>

<style scoped>
.card {
  margin: 1rem 0;
  justify-content: initial;
}
span.content {
  padding: 1rem;
  flex-direction: column;
  align-items: initial;
  flex-basis: calc(calc(100% - 120px) - 4rem);
}
span.bi-three-dots-vertical {
  margin: 2rem;
}
.popup {
  line-height: auto;
  height: auto;
  right: 0;
  bottom: 0;
  box-shadow: var(--shadow);
  border-radius: 0.25rem;
}
.popup span {
  padding: 0.5rem;
}
.song-bg {
  --grad: v-bind('rand');
  --art: v-bind('art || rand');
  width: 120px;
  height: 120px;
}
</style>
