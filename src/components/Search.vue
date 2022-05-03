<script setup>
import { ref, reactive, watch } from 'vue';
import PlayBtn from './PlayBtn.vue';
import SongItem from './SongItem.vue';
import AlbumItem from './AlbumItem.vue';

import { getJsonPiped, getPipedQuery } from '../scripts/fetch.js';
import { useLazyLoad } from '../scripts/util.js';

const props = defineProps(['search', 'songItems', 'items']),

emit = defineEmits(['get-album', 'get-artist', 'play-urls', 'add-song']),

filters = ['music_songs', 'music_albums', 'music_artists'],

filter = ref('music_songs'),

isSearch = ref(/search/.test(location.pathname)),

data = reactive({
  notes: null,
  albums: null,
  albumTitle: null,
  songs: null,
  artists: null,
  recommendedArtists: null,
}),

Reset = () => {
  isSearch.value = /search/.test(location.pathname);

  for (let i in data) {
    data[i] = null;
  }
},

playAlbum = () => {
  const urls = data.songs.items.map((item) => {
    return { url: item.url, title: item.title };
  });

  emit('play-urls', urls);
},

getSearch = (q) => {
  if (q) {
    const pq = q.split(' ').join('+');

    history.pushState({}, '', `/search/${pq + getPipedQuery()}`);

    document.title = 'Search Results for ' + q;
    isSearch.value = /search/.test(location.pathname);

    getResults(pq);
    useLazyLoad();
  } else {
    Reset();

    history.pushState({}, '', '/');
    document.title = 'Hyperpipe';

    console.log('No Search');
  }
},

getResults = async (q) => {

  const f = filter.value || 'music_songs',
  
  json = await getJsonPiped(`/search?q=${q}&filter=${f}`);

  data[f.split('_')[1]] = json;
  console.log(json, data);
};

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

      console.log(i, data[i]);
    }
  },
);
</script>

<template>
  <div v-if="data.songs && data.songs.corrected" class="text-full">
    Did you mean, "<span class="caps">{{ data.songs.suggestion }}</span
    >"!!
  </div>

  <div v-if="data.albumTitle" class="text-full flex">
    <PlayBtn @click="playAlbum" />
    <span>{{ data.albumTitle }}</span>
  </div>

  <div v-if="isSearch" class="filters">
    <button v-for="f in filters" class="filter caps" @click="filter = f; Reset(); getSearch(search)" :data-active="f == filter">
      {{ f.split('_')[1] }}
    </button>
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
          :art="'url(' + (song.thumbnail || song.thumbnails[1].url) + ')'"
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
          " />
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
          :art="'url(' + (album.thumbnail || album.thumbnails[0].url) + ')'"
          @open-album="
            $emit('get-album', album.url || '/playlist?list=' + album.id)
          " />
      </template>
    </div>
  </div>

  <div v-if="data.singles && data.singles.items[0]" class="search-albums">
    <h2>Singles</h2>
    <div class="grid-3">
      <template v-for="single in data.singles.items">
        <AlbumItem
          :author="single.subtitle"
          :name="single.title"
          :art="'url(' + single.thumbnails[0].url + ')'"
          @open-album="$emit('get-album', '/playlist?list=' + single.id)" />
      </template>
    </div>
  </div>

  <div
    v-if="( data.recommendedArtists && data.recommendedArtists.items[0] ) || ( data.artists && data.artists.items[0] )"
    class="search-artists">
    <h2>{{ data.artists ? 'Artists' : 'Similar Artists' }}</h2>
    <div class="grid-3 circle">
      <template v-for="artist in ( data.artists ? data.artists.items : data.recommendedArtists.items)">
        <AlbumItem
          :author="artist.subtitle"
          :name="artist.name || artist.title"
          :art="'url(' + (artist.thumbnail || artist.thumbnails[0].url) + ')'"
          @open-album="$emit('get-artist', (artist.id || artist.url.replace('/channel/', '') ) )" />
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
.search-artists {
  text-align: center;
}
.filters {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 5rem;
}
.filter {
  width: calc(80% / v-bind('filters.length'));
  max-width: 200px;
  margin: 1rem;
  padding: .5rem;
  font-size: 1.25rem;
  border-radius: .25rem;
}
.filter:hover {
  background: var(--color-background-mute);
}
.filter[data-active=true] {
  border-bottom: .125rem var(--color-text) solid;
  border-radius: .25rem .25rem 0 0;
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
.more {
  margin: 1.5rem 0.5rem;
  font-weight: bold;
  font-size: 1rem;
}
</style>
