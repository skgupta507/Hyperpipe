<script setup>
import { ref, reactive, watch, onUpdated } from 'vue';

import Btn from './Btn.vue';
import SongItem from './SongItem.vue';
import AlbumItem from './AlbumItem.vue';

import { getJsonPiped, getPipedQuery } from '@/scripts/fetch.js';
import { useRoute } from '@/scripts/util.js';
import { useCreatePlaylist } from '@/scripts/db.js';

import { useResults, useArtist } from '@/stores/results.js';
import { useData } from '@/stores/player.js';
import { useNav, useI18n } from '@/stores/misc.js';

const { t } = useI18n(),
  results = useResults(),
  data = useData(),
  nav = useNav(),
  artist = useArtist();

const emit = defineEmits(['play-urls']),
  filters = ['music_songs', 'music_albums', 'music_artists'],
  filter = ref('music_songs'),
  isSearch = ref(/search/.test(location.pathname));

const saveAlbum = () => {
    const urls = results.items?.songs?.items?.map(item => ({
      url: item.url,
      title: item.title,
    }));

    let title = results.items?.songs?.title;

    if (title) {
      if (title == 'Songs')
        title += ' - ' + results.items.songs.items[0].uploaderName;

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
    <Btn
      @click="
        $emit(
          'play-urls',
          results.items?.songs?.items?.map(item => ({
            url: item.url,
            title: item.title,
            thumbnails: [{ url: item.thumbnail }],
          })),
        )
      " />
    <Btn ico="star" @click="saveAlbum" />
    <Btn
      ico="plus-lg"
      @click="
        data.state.urls.push(
          ...results.items.songs.items.map(i => ({
            url: i.url,
            title: i.title,
            thumbnails: [{ url: i.thumbnail }],
          })),
        )
      " />

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
      {{ t('title.' + f.split('_')[1]) }}
    </button>
  </div>

  <div
    v-if="results.items.songs && results.items.songs.items[0]"
    class="search-songs">
    <h2 v-if="!isSearch">{{ t('title.songs') }}</h2>
    <div class="grid">
      <template v-for="song in results.items.songs.items">
        <SongItem
          :author="song.uploaderName || song.subtitle"
          :title="song.title || song.name"
          :channel="song.uploaderUrl || song.subId"
          :play="song.url || '/watch?v=' + song.id"
          :art="
            song.thumbnail || song.thumbnails[1]?.url || song.thumbnails[0]?.url
          "
          @open-song="
            $emit('play-urls', [
              {
                url: song.url || '/watch?v=' + song.id,
                title: song.title || song.name,
                thumbnails: [
                  {
                    url:
                      song.thumbnail ||
                      song.thumbnails[1]?.url ||
                      song.thumbnails[0]?.url,
                  },
                ],
              },
            ])
          " />
      </template>
    </div>
    <a
      v-if="artist.state.playlistId"
      @click.prevent="
        results.getAlbum('/playlist?list=' + artist.state.playlistId)
      "
      class="more"
      :href="'/playlist?list=' + artist.state.playlistId"
      >{{ t('info.see_all') }}</a
    >
  </div>

  <div
    v-if="results.items.albums && results.items.albums.items[0]"
    class="search-albums">
    <h2 v-if="!isSearch">{{ t('title.albums') }}</h2>
    <div class="grid-3">
      <template v-for="album in results.items.albums.items">
        <AlbumItem
          :author="album.uploaderName || album.subtitle"
          :name="album.name || album.title"
          :art="album.thumbnail || album.thumbnails[0].url"
          @open-album="
            results.getAlbum(album.url || '/playlist?list=' + album.id)
          " />
      </template>
    </div>
  </div>

  <div
    v-if="results.items.singles && results.items.singles.items[0]"
    class="search-albums">
    <h2>{{ t('title.singles') }}</h2>
    <div class="grid-3">
      <template v-for="single in results.items.singles.items">
        <AlbumItem
          :author="single.subtitle"
          :name="single.title"
          :art="single.thumbnails[0].url"
          @open-album="results.getAlbum('/playlist?list=' + single.id)" />
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
    <h2 v-if="!isSearch">
      {{
        results.items.artists ? t('title.artists') : t('title.similar_artists')
      }}
    </h2>
    <div class="grid-3 circle">
      <template
        v-for="a in results.items.artists
          ? results.items.artists.items
          : results.items.recommendedArtists.items">
        <AlbumItem
          :author="a.subtitle"
          :name="a.name || a.title"
          :art="a.thumbnail || a.thumbnails[0].url"
          @open-album="
            artist.getArtist(a.id || a.url.replace('/channel/', ''))
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
:deep(.bi) {
  margin-right: 0;
}
:deep(.bi-play) {
  margin-right: 1rem;
}
:deep(.bi-plus-lg) {
  margin-right: auto;
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
