<script setup>
/* Imports */
import Hls from 'hls.js';
import { ref, reactive, onBeforeMount, onMounted } from 'vue';

/* Components */
import NavBar from './components/NavBar.vue';
import StatusBar from './components/StatusBar.vue';
import NowPlaying from './components/NowPlaying.vue';
import Search from './components/Search.vue';
import NewPlaylist from './components/NewPlaylist.vue';
import Playlists from './components/Playlists.vue';
import Lyrics from './components/Lyrics.vue';
import Artist from './components/Artist.vue';
import Prefs from './components/Prefs.vue';

/* Composables */
import { getJson, getJsonPiped } from './scripts/fetch.js';
import { useLazyLoad, useStore } from './scripts/util.js';
import { useSetupDB, useUpdatePlaylist } from './scripts/db.js';

/* Reactivity */
const data = reactive({
  artUrl: '',
  cover: '',
  audioSrc: [],
  url: '',
  urls: [],
  songItems: null,
  items: {},
  title: '',
  artist: '',
  artistUrl: '',
  state: 'play',
  duration: 0,
  time: 0,
  showplaylist: false,
  showlyrics: false,
  loop: false,
  lyrics: '',
});

const artist = reactive({
  playlistId: null,
  title: null,
  description: null,
  subscriberCount: 0,
  thumbnails: [],
});

const search = ref(''),
  page = ref('home');

const audio = ref(null);

/* Functions */
function parseUrl() {
  const loc = location.href.split('/');

  console.log(loc);

  switch (loc[3].replace(location.search, '')) {
    case '':
      search.value = '';
      page.value = 'home';
      break;
    case 'search':
      search.value = loc[4];
      console.log(search.value);
      break;
    case 'watch':
      getSong(loc[3]);
      console.log(loc[3]);
      break;
    case 'playlist':
      getAlbum(loc[3]);
      console.log(loc[3]);
      break;
    case 'channel':
      getArtist(loc[4]);
      console.log(loc[4]);
    default:
      console.log(loc);
  }
}

function Toggle(e) {
  console.log(e, data[e]);
  data[e] = !data[e];
}

function timeUpdate(t) {
  data.time = Math.floor((t / data.duration) * 100);
}

function setTime(t) {
  audio.value.currentTime = (t / 100) * data.duration;
}

function addSong(s) {
  data.urls.push(s);

  const index = data.urls.map(s => s.url).indexOf(data.url);

  if (
    (index == data.urls.length - 1 && data.time > 98) ||
    data.urls.length == 1
  ) {
    console.log(true);
    playNext();
  } else {
    console.log(false);
  }

  console.log(s, data.urls);
}

function playThis(t) {
  const i = data.urls.indexOf(t);
  getSong(data.urls[i].url);
}

function playList(a) {
  data.urls = a;
  getSong(data.urls[0].url);
}

function playNext(u) {
  if (window.hls) {
    window.hls.destroy();
  }

  audio.value.src = '';

  const now = data.urls.filter(s => s.url === data.url)[0],
    i = data.urls.indexOf(now),
    next = data.urls[i + 1];

  console.log('Index: ' + i);
  console.log(data.url, data.urls, next);

  if (data.urls.length > i && data.urls.length != 0 && next) {
    getSong(next.url);
  } else if (data.loop) {
    console.log(data.url, data.urls[0]);
    data.url = data.urls[0].url;
    getSong(data.urls[0].url);
  } else {
    data.urls = [];
  }
}

async function getSong(e) {
  console.log(e);

  const hash = new URLSearchParams(e.substring(e.indexOf('?'))).get('v'),
    json = await getJsonPiped('/streams/' + hash);

  console.log(json);

  data.artUrl = json.thumbnailUrl;
  data.cover = `--art: url(${json.thumbnailUrl});`;
  data.nowtitle = json.title;
  data.nowartist = json.uploader.split(' - ')[0];
  data.artistUrl = json.uploaderUrl;
  data.duration = json.duration;
  data.url = e;

  await getNext(hash);

  Stream({
    hls: json.hls,
    stream: json.audioStreams,
  });
}

async function getAlbum(e) {
  console.log('Album: ', e);

  const hash = new URLSearchParams(e.substring(e.indexOf('?'))).get('list'),
    json = await getJsonPiped('/playlists/' + hash);

  console.log(json, json.relatedStreams);

  data.songItems = {
    items: json.relatedStreams,
    title: json.name,
  };

  history.pushState({}, '', e);

  for (let i in artist) {
    artist[i] = null;
  }
}

async function getArtist(e) {
  console.log(e);

  e = e.replace('/channel/', '');

  const json = await getJson('https://hyperpipeapi.onrender.com/channel/' + e);

  console.log(json);

  data.items = json.items;
  data.items.notes = json.playlistId;
  json.items = null;

  for (let i in json) {
    artist[i] = json[i];
  }

  history.pushState({}, '', '/channel/' + e);
}

async function getNext(hash) {
  if (
    !data.urls ||
    !data.urls.filter(s => s.url == data.url)[0] ||
    data.urls.length == 1
  ) {
    if (useStore().getItem('next') == 'false') {
      data.urls = [
        {
          title: data.nowtitle,
          url: '/watch?v=' + hash,
        },
      ];
      setMetadata();
      return;
    }

    const json = await getJson(
      'https://hyperpipeapi.onrender.com/next/' + hash,
    );

    data.lyrics = json.lyricsId;

    data.url = '/watch?v=' + json.songs[0].id;
    console.log(json);

    data.urls = json.songs.map(i => ({
      ...i,
      ...{
        url: '/watch?v=' + i.id,
        id: undefined,
      },
    }));

    setMetadata();

    console.log(data.urls);
  } else {
    setMetadata();
  }
}

function setVolume(vol) {
  audio.value.volume = vol;
}

function playPause() {
  if (audio.value.paused) {
    audio.value.play();
    data.state = 'pause';
  } else {
    audio.value.pause();
    data.state = 'play';
  }
}

function Stream(res) {
  console.log(res);

  if (Hls.isSupported() && useStore().hls !== 'false') {
    window.hls = new Hls();

    window.hls.attachMedia(audio.value);

    window.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      window.hls.loadSource(res.hls);
    });
  } else {
    data.audioSrc = res.stream;
    audio.value.load();
  }
}

function audioCanPlay() {
  useLazyLoad();

  audio.value.play().catch(err => {
    alert(err);
  });
  data.state = 'pause';

  if (location.pathname != '/playlist') {
    history.pushState({}, '', data.url);
  }

  document.title = `Playing: ${data.nowtitle} by ${data.nowartist}`;
}

function SaveTrack(e) {
  useUpdatePlaylist(
    e,
    {
      url: data.url,
      title: data.nowtitle,
    },
    e => {
      if (e === true) {
        console.log('Added Song To ' + e);
      }
    },
  );
}

function setMetadata() {
  if ('mediaSession' in navigator) {
    const now = data.urls.filter(u => u.url === data.url)[0];

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
        artwork = [{ src: data.artUrl, type: 'image/webp' }];
      }

      console.log(album, artwork);
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.nowtitle,
      artist: data.nowartist,
      album: album,
      artwork: artwork,
    });
  }
}

onBeforeMount(() => {
  if (useStore().theme) {
    document.body.setAttribute('data-theme', useStore().theme);
  }
});

onMounted(() => {
  if (window.hls) {
    window.hls.destroy();
  }

  useLazyLoad();

  /* Event Listeners for Lazy Loading */
  document.addEventListener('scroll', useLazyLoad);
  document.addEventListener('resize', useLazyLoad);
  document.addEventListener('orientationChange', useLazyLoad);

  /* Event Listener for change in url */
  window.addEventListener('popstate', parseUrl);

  /* Alert User on close if url is present */
  window.onbeforeunload = () => {
    if (data.url) {
      return 'Are you Sure?';
    }
  };

  /* Media Session Controls */
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', playPause);
    navigator.mediaSession.setActionHandler('pause', playPause);
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (data.urls.length > 2) {
        const i = data.urls.map(s => s.url).indexOf(data.url);
        getSong(data.urls[i - 1].url);
      }
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (data.urls.length > 2) {
        const i = data.urls.map(s => s.url).indexOf(data.url);
        getSong(data.urls[i + 1].url);
      }
    });
  }

  /* Setup IndexedDB for storing custom playlists */
  useSetupDB();

  parseUrl();

  console.log('Mounted <App>!');
});
</script>

<template>
  <NavBar
    @update-search="
      e => {
        search = e;
      }
    "
    @update-page="
      e => {
        page = e;
      }
    "
    :search="search" />

  <template v-if="artist && page == 'home'">
    <Artist
      @playall="getAlbum"
      :title="artist.title"
      :desc="artist.description"
      :subs="artist.subscriberCount"
      :thumbs="artist.thumbnails"
      :play="artist.playlistId" />
  </template>

  <header v-if="!artist.title">
    <div v-if="data.cover" class="art bg-img" :style="data.cover"></div>

    <div class="wrapper">
      <NowPlaying
        @get-artist="getArtist"
        :title="data.nowtitle"
        :artist="data.nowartist"
        :artistUrl="data.artistUrl" />
    </div>
  </header>

  <main class="placeholder">
    <KeepAlive>
      <template v-if="page == 'home'">
        <Search
          @get-album="getAlbum"
          @get-artist="getArtist"
          @play-urls="playList"
          @add-song="addSong"
          :items="data.items"
          :songItems="data.songItems"
          :search="search" />
      </template>
    </KeepAlive>

    <template v-if="page == 'playlist'">
      <NewPlaylist @play-urls="playList" />
    </template>

    <template v-if="page == 'prefs'">
      <Prefs />
    </template>
  </main>

  <Playlists
    @playthis="playThis"
    :url="data.url"
    :urls="data.urls"
    :show="data.showplaylist" />

  <Lyrics
    v-if="data.showlyrics"
    :id="data.lyrics"
    :curl="data.url"
    :iniurl="data.urls[0]?.url" />

  <StatusBar
    @play="playPause"
    @vol="setVolume"
    @toggle="Toggle"
    @save="SaveTrack"
    @change-time="setTime"
    :state="data.state"
    :time="data.time"
    :show="data.showplaylist"
    :lyrics="data.showlyrics"
    :loop="data.loop" />

  <audio
    id="audio"
    ref="audio"
    :volume="useStore().vol ? useStore().vol / 100 : 1"
    @canplay="audioCanPlay"
    @timeupdate="timeUpdate($event.target.currentTime)"
    @ended="playNext"
    autoplay>
    <source
      v-for="src in data.audioSrc"
      :key="src.url"
      :src="src.url"
      :type="src.mimeType" />
  </audio>
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

img,
.card,
.card-bg {
  border-radius: 0.25rem;
  border-radius: 0.25rem;
}
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
