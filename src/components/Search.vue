<script setup>
import { reactive, watch } from 'vue';
import PlayBtn from './PlayBtn.vue';
import SongItem from './SongItem.vue';
import AlbumItem from './AlbumItem.vue';

import { getJsonPiped, getPipedQuery } from '../scripts/fetch.js';

const props = defineProps(['search', 'songItems', 'items']);

const emit = defineEmits([
  'get-album',
  'get-artist',
  'lazy',
  'play-urls',
  'add-song',
]);

const data = reactive({
  notes: null,
  albums: null,
  albumTitle: null,
  songs: null,
  recommendedArtists: null,
});

function Reset() {
  for (let i in data) {
    data[i] = null;
  }
}

function playAlbum() {
  const urls = data.songs.items.map((item) => {
    return { url: item.url, title: item.title };
  });

  emit('play-urls', urls);
}

function getSearch(q) {
  if (q) {
    const pq = q.split(' ').join('+');

    history.pushState({}, '', `/search/${pq + getPipedQuery()}`);

    document.title = 'Search Results for ' + q;

    getResults(pq);
    emit('lazy');
  } else {
    Reset();

    history.pushState({}, '', '/');
    document.title = 'Hyperpipe';

    console.log('No Search');
  }
}

async function getResults(q) {
  const filters = ['music_songs', 'music_albums'];

  for (let filter of filters) {
    const json = await getJsonPiped(`/search?q=${q}&filter=${filter}`);

    data[filter.split('_')[1]] = json;
    console.log(json, data);
  }
}

watch(
  () => props.search,
  (n) => {
    if (n) {
      n = n.replace(location.search || '', '');

      console.log(n);
      getSearch(n);
    }
  },
);

watch(
  () => props.songItems,
  (i) => {
    console.log(i);

    Reset();

    data.songs = {};
    data.songs.items = i.items;
    data.albumTitle = i.title;
  },
);

watch(
  () => props.items,
  (itms) => {
    Reset();

    for (let i in itms) {
      data[i] = {};
      data[i].items = itms[i];

      console.log(data[i]);
    }
  },
);
</script>

<template>
  <div v-if="data.songs && data.songs.corrected" class="text-full">
    I Fixed your Typo, "<span class="caps">{{ data.songs.suggestion }}</span
    >"!!
  </div>

  <div v-if="data.albumTitle" class="text-full flex">
    <PlayBtn @click="playAlbum" />
    <span>{{ data.albumTitle }}</span>
  </div>

  <div v-if="data.songs && data.songs.items[0]" class="search-songs">
    <h2>Songs</h2>
    <div class="grid">
      <template v-for="song in data.songs.items">
        <SongItem
          :author="song.uploaderName || ''"
          :title="song.title || song.name"
          :channel="song.uploaderUrl || ''"
          :play="song.url || '/watch?v=' + song.id"
          @open-song="
            $emit('play-urls', [
              {
                url: song.url || '/watch?v=' + song.id,
                title: song.title || song.name,
              },
            ])
          "
          @get-artist="
            (e) => {
              $emit('get-artist', e);
            }
          ">
          <template #art>
            <div
              :style="`--art: url(${
                song.thumbnail || song.thumbnails[1].url
              });`"
              class="pop-2 bg-img song-bg"></div>
          </template>
        </SongItem>
      </template>
    </div>
    <a
      v-if="data.notes"
      @click.prevent="$emit('get-album', '/playlist?list=' + data.notes.items)"
      class="more"
      :href="'/playlist?list=' + data.notes.items"
      >See All</a
    >
  </div>

  <div v-if="data.albums && data.albums.items[0]" class="search-albums">
    <h2>Albums</h2>
    <div class="grid-3">
      <template v-for="album in data.albums.items">
        <AlbumItem
          :author="album.uploaderName || album.subtitle"
          :name="album.name || album.title"
          :art="
            '--art: url(' + (album.thumbnail || album.thumbnails[0].url) + ');'
          "
          @open-album="
            $emit('get-album', album.url || '/playlist?list=' + album.id)
          " />
      </template>
    </div>
  </div>

  <div
    v-if="data.recommendedArtists && data.recommendedArtists.items[0]"
    class="search-artists">
    <h2>Similar Artists</h2>
    <div class="grid-3 circle">
      <template v-for="artist in data.recommendedArtists.items">
        <AlbumItem
          :author="artist.subtitle"
          :name="artist.title"
          :art="'--art: url(' + artist.thumbnails[0].url + ');'"
          @open-album="$emit('get-artist', artist.id)" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.search-albums,
.search-songs,
.search-artists {
  place-items: start center;
  margin-bottom: 2rem;
}
.search-songs h2,
.search-artists h2,
.search-albums h2 {
  text-align: center;
}
.search-albums .grid-3,
.search-artists .grid-3 {
  display: grid;
  grid-template-columns: 1fr;
}
.search-artists {
  text-align: center;
}
.text-full {
  padding: 1rem;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}
.text-right {
  text-align: right;
}
.song-bg {
  width: 120px;
  height: 120px;
}
.more {
  margin: 1.5rem 0.5rem;
  font-weight: bold;
  font-size: 1rem;
}
@media (min-width: 530px) {
  .search-albums .grid-3,
  .search-artists .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1024px) {
  .search-albums .grid-3,
  .search-artists .grid-3 {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
