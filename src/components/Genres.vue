<script setup>
import { reactive, ref, onMounted } from 'vue';

import { getJson } from '../scripts/fetch.js';
import { useRandColor } from '../scripts/colors.js';
import { useRoute } from '../scripts/util.js';

import AlbumItem from './AlbumItem.vue';

const props = defineProps(['id']);
defineEmits(['get-album']);

const data = reactive({
    title: '',
    spotlight: [],
    featured: [],
    community: [],
  }),
  btns = reactive({
    moods: [],
    genres: [],
  });

function get(id) {
  if (props.id || id) {
    getJson(
      'https://hyperpipeapi.onrender.com/genres/' + (props.id || id),
    ).then(res => {
      console.log(res);

      for (let i of ['title', 'community', 'spotlight', 'featured']) {
        data[i] = res[i];
      }

      useRoute('/explore/' + (props.id || id));
    });
  } else {
    getJson('https://hyperpipeapi.onrender.com/genres').then(res => {
      console.log(res);

      for (let i of ['moods', 'genres']) {
        btns[i] = res[i];
      }

      useRoute('/explore/');
    });
  }
}

onMounted(get);
</script>

<template>
  <template v-if="data.title">
    <h2 class="head">{{ data.title }}</h2>

    <template v-for="type in ['featured', 'spotlight', 'community']">
      <h3 class="head">{{ type }}</h3>
      <div class="grid-3">
        <template v-for="i in data[type]">
          <AlbumItem
            :name="i.title"
            :author="i.subtitle"
            :art="'url(' + i.thumbnails[0].url + ')'"
            @open-album="$emit('get-album', '/playlist?list=' + i.id)" />
        </template>
      </div>
    </template>
  </template>

  <template v-else>
    <h2 v-if="btns.moods.length > 0">Moods</h2>

    <div class="btn-grid">
      <button
        v-for="i in btns.moods"
        class="btn"
        :style="`--btn-color: ${i.subtitle};`"
        @click="get(i.id)">
        {{ i.title }}
      </button>
    </div>

    <h2 v-if="btns.genres.length > 0">Genres</h2>

    <div class="btn-grid">
      <button
        v-for="i in btns.genres"
        class="btn"
        :style="`--btn-color: ${i.subtitle};`"
        @click="get(i.id)">
        {{ i.title }}
      </button>
    </div>
  </template>
</template>

<style scoped>
.btn-grid {
  display: grid;
  grid-template-columns: calc(100% / 3) calc(100% / 3) calc(100% / 3);
  grid-auto-rows: 1fr;
  grid-gap: 0.125rem;
  padding: 1rem 0;
}
.btn {
  aspect-ratio: 1;
  padding: 0.75rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 0.125rem;
  background-color: var(--color-background-mute);
  color: var(--btn-color);
}
.btn:hover {
  background-color: var(--color-background-soft);
}
.head {
  margin-top: 1.75rem;
  text-align: center;
  text-transform: capitalize;
}

@media (min-width: 760px) {
  .btn-grid {
    grid-template-columns: calc(100% / 4) calc(100% / 4) calc(100% / 4) calc(
        100% / 4
      );
  }
}

@media (min-width: 1024px) {
  .btn-grid {
    grid-template-columns:
      calc(100% / 5) calc(100% / 5) calc(100% / 5) calc(100% / 5)
      calc(100% / 5);
  }
}
</style>
