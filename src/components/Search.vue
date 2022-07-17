<script setup>
import { ref, reactive, watch, onUpdated } from 'vue';

import PlayBtn from './PlayBtn.vue';
import SongItem from './SongItem.vue';
import AlbumItem from './AlbumItem.vue';

import { getJsonPiped, getPipedQuery } from '../scripts/fetch.js';
import { useLazyLoad, useRoute } from '../scripts/util.js';
import { useCreatePlaylist } from '../scripts/db.js';

import { useResults, useArtist } from '@/stores/results.js';
import { useNav } from '@/stores/misc.js';

const results = useResults(),
  nav = useNav(),
  artist = useArtist();

const emit = defineEmits(['get-album', 'get-artist', 'play-urls', 'add-song']),
  filters = ['music_songs', 'music_albums', 'music_artists'],
  filter = ref('music_songs'),
  isSearch = ref(/search/.test(location.pathname));

const playAlbum = () => {
    const urls = results.items?.songs?.items?.map(item => {
      return { url: item.url, title: item.title };
    });

    emit('play-urls', urls);
  },
  saveAlbum = () => {
    const urls = results.items?.songs?.items?.map(item => {
        return { url: item.url, title: item.title };
      }),
      title = results.items?.songs?.title;

    if (title) {
      useCreatePlaylist(title, urls, () => {
        alert('Saved!');
      });
    }
  },
  getSearch = q => {
    if (q) {
      const pq = q.split(' ').join('+');

      history.pushState({}, '', `/search/${pq + getPipedQuery()}`);

      document.title = 'Search Results for ' + q;
      isSearch.value = /search/.test(location.pathname);

      getResults(pq);
      useLazyLoad();
    } else {
      results.resetItems();

      useRoute('/');
      document.title = 'Hyperpipe';

      console.log('No Search');
    }
  },
  getResults = async q => {
    results.resetItems();

    const f = filter.value || 'music_songs',
      json = await getJsonPiped(`/search?q=${q}&filter=${f}`),
      key = f.split('_')[1];

    results.setItem(key, json);

    console.log(json, key);
  };

watch(
  () => nav.state.search,
  n => {
    if (n) {
      n = n.replace(location.search || '', '');

      console.log(n);

      artist.reset();
      getSearch(n);
    }
  },
);

onUpdated(() => {
  isSearch.value = /search/.test(location.pathname);
});
</script>

<template>
  <div
    v-if="results.items.songs && results.items.songs.corrected"
    class="text-full">
    Did you mean, "<span class="caps">{{
      results.items?.songs?.suggestion
    }}</span
    >"!!
  </div>

  <div v-if="results.items?.songs?.title" class="text-full flex">
    <PlayBtn @click="playAlbum" />
    <PlayBtn ico="plus" @click="saveAlbum" />

    <span>{{ results.items?.songs?.title }}</span>
  </div>

  <div v-if="isSearch" class="filters">
    <button
      v-for="f in filters"
      class="filter caps"
      @click="
        filter = f;
        getSearch(nav.state.search);
      "
      :data-active="f == filter">
      {{ f.split('_')[1] }}
    </button>
  </div>

  <div
    v-if="results.items.songs && results.items.songs.items[0]"
    class="search-songs">
    <h2>Songs</h2>
    <div class="grid">
      <template v-for="song in results.items.songs.items">
        <SongItem
          :author="song.uploaderName || song.subtitle"
          :title="song.title || song.name"
          :channel="song.uploaderUrl || song.subId"
          :play="song.url || '/watch?v=' + song.id"
          :art="
            'url(' +
            (song.thumbnail ||
              song.thumbnails[1]?.url ||
              song.thumbnails[0]?.url) +
            ')'
          "
          @open-song="
            $emit('play-urls', [
              {
                url: song.url || '/watch?v=' + song.id,
                title: song.title || song.name,
              },
            ])
          "
          @get-artist="
            e => {
              $emit('get-artist', e);
            }
          " />
      </template>
    </div>
    <a
      v-if="results.items.notes"
      @click.prevent="
        $emit('get-album', '/playlist?list=' + results.items.notes.items)
      "
      class="more"
      :href="'/playlist?list=' + results.items.notes.items"
      >See All</a
    >
  </div>

  <div
    v-if="results.items.albums && results.items.albums.items[0]"
    class="search-albums">
    <h2>Albums</h2>
    <div class="grid-3">
      <template v-for="album in results.items.albums.items">
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

  <div
    v-if="results.items.singles && results.items.singles.items[0]"
    class="search-albums">
    <h2>Singles</h2>
    <div class="grid-3">
      <template v-for="single in results.items.singles.items">
        <AlbumItem
          :author="single.subtitle"
          :name="single.title"
          :art="'url(' + single.thumbnails[0].url + ')'"
          @open-album="$emit('get-album', '/playlist?list=' + single.id)" />
      </template>
    </div>
  </div>

  <div
    v-if="
      (results.items.recommendedArtists &&
        results.items.recommendedArtists.items[0]) ||
      (results.items.artists && results.items.artists.items[0])
    "
    class="search-artists">
    <h2>{{ results.items.artists ? 'Artists' : 'Similar Artists' }}</h2>
    <div class="grid-3 circle">
      <template
        v-for="artist in results.items.artists
          ? results.items.artists.items
          : results.items.recommendedArtists.items">
        <AlbumItem
          :author="artist.subtitle"
          :name="artist.name || artist.title"
          :art="'url(' + (artist.thumbnail || artist.thumbnails[0].url) + ')'"
          @open-album="
            $emit(
              'get-artist',
              artist.id || artist.url.replace('/channel/', ''),
            )
          " />
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
:deep(.bi-play) {
  margin-right: 0.75rem;
}
.filters {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 2rem;
}
.filter {
  width: calc(80% / v-bind('filters.length'));
  max-width: 200px;
  margin: 1rem;
  padding: 0.5rem;
  font-size: 1.25rem;
  border-radius: 0.25rem;
}
.filter:hover {
  background: var(--color-background-mute);
}
.filter[data-active='true'] {
  border-bottom: 0.125rem var(--color-text) solid;
  border-radius: 0.25rem 0.25rem 0 0;
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
