<script setup>
/* Imports */
import { ref, watch, reactive, onBeforeMount, onMounted } from 'vue';

/* Components */
import NavBar from '@/components/NavBar.vue';
import Player from '@/components/Player.vue';
import StatusBar from '@/components/StatusBar.vue';
import NowPlaying from '@/components/NowPlaying.vue';
import Genres from '@/components/Genres.vue';
import Search from '@/components/Search.vue';
import NewPlaylist from '@/components/NewPlaylist.vue';
import Playlists from '@/components/Playlists.vue';
import Lyrics from '@/components/Lyrics.vue';
import Info from '@/components/Info.vue';
import Artist from '@/components/Artist.vue';
import Prefs from '@/components/Prefs.vue';

/* Composables */
import { getJson, getJsonPiped } from '@/scripts/fetch.js';
import { useLazyLoad, useStore, useRoute } from '@/scripts/util.js';
import { useSetupDB, useUpdatePlaylist } from '@/scripts/db.js';

/* Stores */
import { useData, usePlayer } from '@/stores/player.js';
import { useResults, useArtist } from '@/stores/results.js';
import { useNav } from '@/stores/misc.js';

const store = useStore(),
  data = useData(),
  player = usePlayer(),
  results = useResults(),
  artist = useArtist(),
  nav = useNav();

const genreid = ref(''),
  path = ref(location.pathname);

/* Functions */
function parseUrl() {
  const loc = location.pathname.split('/'),
    base = loc[1].replace(location.search, '');

  console.log(loc, base);

  path.value = location.pathname;

  switch (base) {
    case '':
      getExplore();
      break;
    case 'search':
      nav.state.search = loc[2];
      console.log(nav.state.search);
      break;
    case 'watch':
      player.state.status = 'circle';
      getSong(loc[1] + location.search);
      console.log(loc[1]);
      break;
    case 'playlist':
      getAlbum(loc[1] + location.search);
      console.log(loc[1]);
      break;
    case 'channel':
      getArtist(loc[2]);
      console.log(loc[2]);
      break;
    case 'explore':
      genreid.value = loc[2];
      nav.state.page = 'genres';
    default:
      console.log(loc);
  }
}

function addSong(s) {
  data.state.urls.push(s);

  const index = data.state.urls.map(s => s.url).indexOf(data.state.url);

  if (
    (index == data.state.urls.length - 1 && player.state.time > 98) ||
    data.state.urls.length == 1
  ) {
    playNext();
  }

  console.log(s, data.state.urls);
}

function playThis(t) {
  const i = data.state.urls.indexOf(t);
  getSong(data.state.urls[i].url);
}

function playList(a) {
  data.state.urls = a;
  getSong(data.state.urls[0].url);
}

function playNext(u) {
  player.state.src = '';

  const now = data.state.urls.filter(s => s.url === data.state.url)[0],
    i = data.state.urls.indexOf(now),
    next = data.state.urls[i + 1];

  console.log('Index: ' + i);
  console.log(data.state.url, data.state.urls, next);

  if (data.state.urls.length > i && data.state.urls.length != 0 && next) {
    getSong(next.url);
  } else if (player.state.loop) {
    console.log(data.state.url, data.state.urls[0]);
    data.state.url = data.state.urls[0].url;
    getSong(data.state.urls[0].url);
  } else {
    data.state.urls = [];
  }
}

async function getExplore() {
  const json = await getJson('https://hyperpipeapi.onrender.com/explore');

  console.log(json);

  results.items.value = {};

  results.items.value = {
    songs: json.trending,
    albums: json.albums_and_singles,
  };
}

async function getSong(e) {
  console.log(e);

  const hash = new URLSearchParams(e.substring(e.indexOf('?'))).get('v'),
    json = await getJsonPiped('/streams/' + hash);

  console.log(json);

  data.state.art = json.thumbnailUrl;
  data.state.description = json.description;
  data.state.title = json.title;
  data.state.artist = json.uploader.replace(' - Topic', '');
  data.state.artistUrl = json.uploaderUrl;
  player.state.duration = json.duration;
  player.state.hls = json.hls;
  player.state.streams = json.audioStreams;
  data.state.url = e;

  await getNext(hash);
}

async function getAlbum(e) {
  console.log('Album: ', e);

  const hash = new URLSearchParams(e.substring(e.indexOf('?'))).get('list'),
    json = await getJsonPiped('/playlists/' + hash);

  console.log(json, json.relatedStreams);

  results.resetItems();
  results.setItem('songs', {
    items: json.relatedStreams,
    title: json.name,
  });

  useRoute(e);

  artist.reset();
}

async function getArtist(e) {
  console.log(e);

  e = e.replace('/channel/', '');

  const json = await getJson('https://hyperpipeapi.onrender.com/channel/' + e);

  console.log(json);

  for (let i in json.items) {
    results.setItem(i, { items: json.items[i] });
  }

  console.log(results.items);

  json.items = undefined;

  artist.reset();
  artist.set(json);

  useRoute('/channel/' + e);
}

async function getNext(hash) {
  if (
    store.getItem('next') !== 'false' &&
    (!data.state.urls ||
      !data.state.urls.filter(s => s.url == data.state.url)[0] ||
      data.state.urls.length == 1)
  ) {
    const json = await getJson(
      'https://hyperpipeapi.onrender.com/next/' + hash,
    );

    data.state.lyrics = json.lyricsId;

    data.state.url = json.songs[0]
      ? '/watch?v=' + json.songs[0].id
      : '/watch?v=' + hash;

    console.log(json);

    data.state.urls =
      json.songs.length > 0
        ? json.songs.map(i => ({
            ...i,
            ...{
              url: '/watch?v=' + i.id,
              id: undefined,
            },
          }))
        : data.state.urls;

    setMetadata();

    console.log(data.state.urls);
  } else {
    if (data.state.urls.length == 0) {
      data.state.urls = [
        {
          title: data.state.title,
          url: data.state.url,
        },
      ];
    }

    setMetadata();
  }
}

function setMetadata() {
  if ('mediaSession' in navigator) {
    const now = data.state.urls.filter(u => u.url === data.state.url)[0];

    let artwork = [],
      album = undefined;

    if (now) {
      album = now.subtitle;

      if (now.thumbnails) {
        artwork = now.thumbnails.map(t => {
          return {
            sizes: t.width + 'x' + t.height,
            src: t.url,
            type: 'image/webp',
          };
        });
      } else {
        artwork = [{ src: data.state.art, type: 'image/webp' }];
      }

      console.log(album, artwork);
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.state.title,
      artist: data.state.artist,
      album: album,
      artwork: artwork,
    });
  }
}

function SaveTrack(e) {
  useUpdatePlaylist(
    e,
    {
      url: data.state.url,
      title: data.state.title,
    },
    e => {
      if (e === true) {
        console.log('Added Song To ' + e);
      }
    },
  );
}

onBeforeMount(() => {
  if (store.theme) {
    document.body.setAttribute('data-theme', store.theme);
  }
});

onMounted(() => {
  useLazyLoad();

  /* Event Listeners for Lazy Loading */
  document.addEventListener('scroll', useLazyLoad);
  document.addEventListener('resize', useLazyLoad);
  document.addEventListener('orientationChange', useLazyLoad);

  /* Event Listener for change in url */
  window.addEventListener('popstate', parseUrl);

  /* Alert User on close if url is present */
  window.onbeforeunload = () => {
    if (data.state.url) {
      return 'Are you Sure?';
    }
  };

  /* Setup IndexedDB for storing custom playlists */
  useSetupDB();

  parseUrl();

  console.log('Mounted <App>!');
});
</script>

<template>
  <NavBar />

  <template v-if="artist.state.title && nav.state.page == 'home'">
    <Artist @playall="getAlbum" />
  </template>

  <header v-if="!artist.state.title">
    <div v-show="data.state.art" class="art bg-img"></div>

    <div class="wrapper">
      <NowPlaying @get-artist="getArtist" />
    </div>
  </header>

  <main class="placeholder">
    <KeepAlive>
      <Search
        v-if="nav.state.page == 'home'"
        @get-album="getAlbum"
        @get-artist="getArtist"
        @play-urls="playList"
        @add-song="addSong" />
    </KeepAlive>

    <KeepAlive>
      <Genres
        v-if="nav.state.page == 'genres'"
        :id="genreid"
        @get-album="
          e => {
            getAlbum(e);
            nav.state.page = 'home';
          }
        " />
    </KeepAlive>

    <NewPlaylist v-if="nav.state.page == 'playlist'" @play-urls="playList" />

    <Prefs v-if="nav.state.page == 'prefs'" />
  </main>

  <Playlists v-if="player.state.playlist" @playthis="playThis" />

  <Lyrics v-if="player.state.lyrics" />

  <Info v-if="player.state.info" :text="data.state.description" />

  <StatusBar @save="SaveTrack" />

  <Player @ended="playNext" />
</template>

<style>
@import './assets/base.css';

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 1rem;
  font-weight: normal;
  margin-bottom: 10rem;
}
main {
  display: flex;
  flex-direction: column;
}
main:empty::before {
  font-size: 3.5rem !important;
}
header {
  line-height: 1.5;
  padding-bottom: 2.5rem;
}
.art {
  display: block;
  margin: 0 auto 2rem;
  height: 175px;
  width: 175px;
}
.bg-img {
  --art: v-bind('"url(" + data.state.art + ")"');
}
img,
.card,
.card-bg {
  border-radius: 0.25rem;
  border-radius: 0.25rem;
}
h1 {
  text-align: center;
  padding-bottom: 1.5rem;
}
h1,
h4 {
  font-weight: bold;
}
a,
.green {
  text-decoration: none;
  color: var(--color-foreground);
  transition: 0.4s;
}
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.center {
  margin-left: auto;
  margin-right: auto;
}
.flex .bi {
  line-height: 0;
}

@media (hover: hover) {
  a:hover {
    background-color: var(--color-border);
  }
}

@media (min-width: 1024px) {
  header {
    margin: auto;
    display: flex;
    place-items: center;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
  .art {
    margin: 0 2rem 0 0;
  }
}
</style>
