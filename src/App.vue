<script setup>
import { ref, reactive, onMounted } from 'vue';

import NavBar from './components/NavBar.vue';
import StatusBar from './components/StatusBar.vue';
import NowPlaying from './components/NowPlaying.vue';
import Search from './components/Search.vue';
import Playlists from './components/Playlists.vue';
import Artist from './components/Artist.vue';

import { getJson, getJsonPiped } from './scripts/fetch.js';

const data = reactive({
  artUrl: '',
  cover: '',
  audioSrc: '',
  url: '',
  urls: [],
  songItems: null,
  hls: null,
  items: {},
  title: '',
  artist: '',
  state: 'play',
  duration: 0,
  time: 0,
  showplaylist: false,
  loop: false,
});

const artist = reactive({
  playlistId: null,
  title: null,
  description: null,
  subscriberCount: 0,
  thumbnails: [],
});

const search = ref('');

const audio = ref(null);

function parseUrl() {
  const loc = location.href.split('/');

  console.log(loc);

  switch (loc[3].replace(location.search, '')) {
    case '':
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

  if (data[e]) {
    data[e] = false;
  } else {
    data[e] = true;
  }
}

function Update(e) {
  search.value = e;
  console.log('update');
}

function timeUpdate(t) {
  data.time = Math.floor((t / data.duration) * 100);
}

function setTime(t) {
  audio.value.currentTime = (t / 100) * data.duration;
}

function addSong(s) {
  data.urls.push(s);

  const index = data.urls.map((s) => s.url).indexOf(data.url);

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
  if (data.hls) {
    data.hls.destroy();
  }

  audio.value.src = '';

  const i = data.urls.map((s) => s.url).indexOf(data.url),
    next = data.urls[i + 1];

  console.log('Index: ' + i);
  console.log(data.url, data.urls, next);

  if (data.urls.length > i && data.urls.length != 0 && next) {
    getSong(next.url);
  } else if (data.loop) {
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
  data.duration = json.duration;
  data.url = e;

  await getNext(hash);

  Stream({
    hls: json.hls,
    stream: json.audioStreams[0].url,
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
  if (!data.urls || data.urls.map((s) => s.url).indexOf(data.url) <= 0) {
    const json = await getJson(
      'https://hyperpipeapi.onrender.com/next/' + hash,
    );

    data.url = '/watch?v=' + json.songs[0].id;
    console.log(json);

    data.urls = json.songs.map((i) => {
      i.url = '/watch?v=' + i.id;
      i.id = null;

      return i;
    });

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

  if (!!Hls && Hls.isSupported()) {
    data.hls = new Hls();

    data.hls.attachMedia(audio.value);

    data.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      data.hls.loadSource(res.hls);
    });
  } else {
    data.audioSrc = res.stream;
  }
}

function audioCanPlay() {
  lazyLoad();
  audio.value.play();
  data.state = 'pause';

  if (location.pathname != '/playlist') {
    history.pushState({}, '', data.url);
  }

  document.title = `Playing: ${data.nowtitle} by ${data.nowartist}`;
}

function setMetadata() {
  if ('mediaSession' in navigator) {
    const i = data.urls.map((u) => u.url).indexOf(data.url);

    let artwork = [],
      album = undefined;
    console.log(i);

    if (i >= 0) {
      album = data.urls[i].subtitle;

      if (data.urls[i].thumbnails) {
        artwork = data.urls[i].thumbnails.map((t) => {
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

function lazyLoad() {
  let lazyElems;

  if ('IntersectionObserver' in window) {
    lazyElems = document.querySelectorAll('.bg-img:not(.lazy)');

    let imgObs = new IntersectionObserver((elems, obs) => {
      elems.forEach((elem) => {
        setTimeout(() => {
          if (elem.isIntersecting) {
            let ele = elem.target;

            ele.classList.add('lazy');
            imgObs.unobserve(ele);
          }
        }, 20);
      });
    });

    lazyElems.forEach((img) => {
      imgObs.observe(img);
    });
  } else {
    console.log('Failed');
  }
}

onMounted(() => {
  lazyLoad();

  document.addEventListener('scroll', lazyLoad);
  document.addEventListener('resize', lazyLoad);
  document.addEventListener('orientationChange', lazyLoad);

  window.addEventListener('popstate', parseUrl);
  window.onbeforeunload = () => {
    return 'Are you Sure?';
  };

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', playPause);
    navigator.mediaSession.setActionHandler('pause', playPause);
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (data.urls.length > 2) {
        const i = data.urls.map((s) => s.url).indexOf(data.url);
        getSong(data.urls[i - 1].url);
      }
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (data.urls.length > 2) {
        const i = data.urls.map((s) => s.url).indexOf(data.url);
        getSong(data.urls[i + 1].url);
      }
    });
  }

  parseUrl();

  console.log('Mounted <App>!');
});
</script>

<template>
  <NavBar
    @update-search="
      (e) => {
        search = e;
      }
    "
    :search="search" />

  <template v-if="artist">
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
      <NowPlaying :title="data.nowtitle" :artist="data.nowartist" />
    </div>
  </header>

  <main class="placeholder">
    <Search
      @get-album="getAlbum"
      @get-artist="getArtist"
      @lazy="lazyLoad"
      @play-urls="playList"
      @add-song="addSong"
      :items="data.items"
      :songItems="data.songItems"
      :search="search" />
  </main>

  <Playlists
    @playthis="playThis"
    :url="data.url"
    :urls="data.urls"
    :show="data.showplaylist" />

  <StatusBar
    @play="playPause"
    @vol="setVolume"
    @list="Toggle"
    @loop="Toggle"
    @change-time="setTime"
    :state="data.state"
    :time="data.time"
    :show="data.showplaylist"
    :loop="data.loop" />

  <audio
    id="audio"
    ref="audio"
    :src="data.audioSrc"
    @canplay="audioCanPlay"
    @timeupdate="timeUpdate($event.target.currentTime)"
    @ended="playNext"
    autoplay></audio>
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
  main .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
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
