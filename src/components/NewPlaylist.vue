<script setup>
import { ref, onMounted } from 'vue';
import AlbumItem from './AlbumItem.vue';
import Modal from './Modal.vue';

import { useRand } from '../scripts/colors.js';

import {
  useListPlaylists,
  useGetPlaylist,
  useCreatePlaylist,
} from '../scripts/db.js';

const emit = defineEmits(['play-urls']),

list = ref([]),
  show = ref(false),
  text = ref(''),

Play = (key) => {
  console.log(key);

  useGetPlaylist(key, (res) => {
    console.log(res);
    emit('play-urls', res.urls);
  });
},

List = () => {
  useListPlaylists((res) => {
    list.value = res;
  });
},

Create = () => {
  if (text.value) {
    useCreatePlaylist(text.value, [], () => {
      List();
      show.value = false;
    });
  }
};

onMounted(() => {
  List();
});
</script>

<template>
  <div class="npl-wrap">
    <Modal
      n="2"
      :display="show"
      title="Create a new Playlist..."
      @show="
        (e) => {
          show = e;
        }
      ">
      <template #content>
        <input
          type="text"
          placeholder="Playlist name..."
          class="textbox"
          v-model="text" />
      </template>
      <template #buttons>
        <button @click="show = false">Cancel</button>
        <button @click="Create">Create</button>
      </template>
    </Modal>

    <div class="npl-box bi bi-plus-lg pop" @click="show = true"></div>
    <div class="grid-3">
      <template v-for="i in list">
        <AlbumItem
          :name="i.name"
          :grad="useRand()"
          @open-album="Play(i.name)" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.npl-wrap {
  padding-bottom: 5rem;
}
.npl-box {
  margin: 0 auto 5rem auto;
  border-radius: 0.5rem;
  background-color: var(--color-background-mute);
  padding: 2rem 3rem;
  font-size: 4rem;
  width: 10rem;
}
.npl-box:hover {
  background-color: var(--color-background-soft);
}
.npl-round {
  float: left;
  display: inline-block;
  height: 5rem;
  width: 5rem;
  border-radius: 50%;
  background: v-bind('bg');
}
.text-box {
  padding: 2rem;
}
</style>
