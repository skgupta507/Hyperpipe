<script setup>
import { ref } from 'vue';

import NavBar from './components/NavBar.vue';
import StatusBar from './components/StatusBar.vue';
import NowPlaying from './components/NowPlaying.vue';
import Search from './components/Search.vue';
import Playlists from './components/Playlists.vue';
import Artist from './components/Artist.vue';

let search = ref('');
</script>

<template>
  <NavBar
    @update-search="
      (e) => {
        search = e;
      }
    "
    :search="search" />

  <Artist
    @playall="getAlbum"
    :title="artist.title"
    :desc="artist.description"
    :subs="artist.subscriberCount"
    :thumbs="artist.thumbnails"
    :play="artist.playlistId" />

  <header v-if="!artist.title">
    <div v-if="cover" class="art bg-img" :style="cover"></div>

    <div class="wrapper">
      <NowPlaying :title="nowtitle" :artist="nowartist" />
    </div>
  </header>

  <main class="placeholder">
    <Search
      @get-song="setSong"
      @get-album="getAlbum"
      @get-artist="getArtist"
      @lazy="lazyLoad"
      @play-urls="playList"
      @add-song="addSong"
      :items="items"
      :songItems="songItems"
      :search="search" />
  </main>

  <Playlists
    @playthis="playThis"
    :url="url"
    :urls="urls"
    :show="showplaylist" />

  <StatusBar
    @play="playPause"
    @vol="setVolume"
    @list="Toggle"
    @loop="Toggle"
    :state="state"
    :time="time"
    :show="showplaylist"
    :loop="loop" />

  <audio
    id="audio"
    ref="audio"
    :src="audioSrc"
    @canplay="audioCanPlay"
    @timeupdate="timeUpdate($event.target.currentTime)"
    @ended="playNext"
    autoplay></audio>
</template>

<script>
export default {
  data() {
    return {
      artUrl: '',
      cover: '',
      nowtitle: '',
      nowartist: '',
      state: 'play',
      audioSrc: '',
      duration: 0,
      time: 0,
      url: '',
      urls: [],
      songItems: null,
      showplaylist: false,
      loop: false,
      hls: null,
      artist: {
        playlistId: null,
        title: null,
        description: null,
        subscriberCount: 0,
        thumbnails: [],
      },
      items: {},
    };
  },
  mounted() {
    this.lazyLoad();

    document.addEventListener('scroll', this.lazyLoad);
    document.addEventListener('resize', this.lazyLoad);
    document.addEventListener('orientationChange', this.lazyLoad);

    window.addEventListener('popstate', this.parseUrl);
    window.onbeforeunload = () => {
      return 'Are you Sure?';
    };

    this.parseUrl();

    console.log('Mounted <App>!');
  },
  methods: {
    parseUrl() {
      const loc = location.href.split('/');

      console.log(loc);

      switch (loc[3].replace(location.search, '')) {
        case '':
        case 'search':
          this.search = loc[4];
          console.log(loc[4], this.search);
          break;
        case 'watch':
          this.getSong(loc[3]);
          console.log(loc[3]);
          break;
        case 'playlist':
          this.getAlbum(loc[3]);
          console.log(loc[3]);
          break;
        case 'channel':
          this.getArtist(loc[4]);
          console.log(loc[4]);
        default:
          console.log(loc);
      }
    },
    Toggle(e) {
      console.log(this[e]);

      if (this[e]) {
        this[e] = false;
      } else {
        this[e] = true;
      }
    },
    Update(e) {
      this.search = e;
      console.log('update');
    },
    timeUpdate(t) {
      this.time = Math.floor((t / this.duration) * 100);
    },
    async getJson(url) {
      const res = await fetch(url).then((res) => res.json());

      if (!res.error) {
        return res;
      } else {
        alert(
          res.message
            .replaceAll('Video', 'Audio')
            .replaceAll('video', 'audio')
            .replaceAll('watched', 'heard'),
        );
        console.error(res.message);
      }
    },
    setSong(s) {
      this.urls = [s];

      this.playNext();
    },
    addSong(s) {
      this.urls.push(s);

      const index = this.urls.map((s) => s.url).indexOf(this.url);

      if (
        (index == this.urls.length - 1 && this.time > 98) ||
        this.urls.length == 1
      ) {
        console.log(true);
        this.playNext();
      } else {
        console.log(false);
      }

      console.log(s, this.urls);
    },
    playThis(t) {
      const i = this.urls.indexOf(t);
      this.getSong(this.urls[i].url);
    },
    playList(a) {
      this.urls = a;

      this.getSong(this.urls[0].url);
    },
    playNext(u) {
      if (this.hls) {
        this.hls.destroy();
      }

      const i = this.urls.map((s) => s.url).indexOf(this.url),
        next = this.urls[i + 1];

      console.log('Index: ' + i);
      console.log(this.url, this.urls, next);

      if (this.urls.length > i && this.urls.length != 0 && next) {
        this.getSong(next.url);
      } else if (this.loop) {
        this.url = this.urls[0].url;
        this.getSong(this.urls[0].url);
      } else {
        this.urls = [];
      }
    },
    async getSong(e) {
      console.log(e);

      const hash = e.split('?v=').pop(),
        json = await this.getJson(
          'https://pipedapi.kavin.rocks/streams/' + hash,
        );

      console.log(json);

      this.Stream({
        art: json.thumbnailUrl,
        artist: json.uploader,
        time: json.duration,
        hls: json.hls,
        stream: json.audioStreams[0].url,
        title: json.title,
        url: e,
      });
    },
    async getAlbum(e) {
      console.log('Album: ', e);

      const hash = e.split('?list=').pop(),
        json = await this.getJson(
          'https://pipedapi.kavin.rocks/playlists/' + hash,
        );

      console.log(json, json.relatedStreams);

      this.songItems = {
        items: json.relatedStreams,
        title: json.name,
      };

      history.pushState({}, '', e);

      this.artist = null;
    },
    async getArtist(e) {
      console.log(e);

      const json = await this.getJson(
        'https://hyperpipeapi.onrender.com/channel/' + e,
      );

      console.log(json);

      this.items = json.items;
      this.items.notes = json.playlistId;
      json.items = null;
      this.artist = json;

      history.pushState({}, '', '/channel/' + e);
    },
    setVolume(vol) {
      this.$refs.audio.volume = vol;
    },
    playPause() {
      if (this.$refs.audio.paused) {
        this.$refs.audio.play();
        this.state = 'pause';
      } else {
        this.$refs.audio.pause();
        this.state = 'play';
      }
    },
    Stream(res) {
      console.log(res);

      this.art = res.art;
      this.cover = `--art: url(${res.art});`;
      this.nowtitle = res.title;
      this.nowartist = res.artist.split(' - ')[0];
      this.duration = res.time;
      this.url = res.url;

      if (!!Hls && Hls.isSupported()) {
        this.hls = new Hls();

        console.log(this.hls.levels);
        this.hls.loadSource(res.hls);
        this.hls.attachMedia(this.$refs.audio);
      } else {
        this.audioSrc = res.stream;
      }
    },
    audioCanPlay() {
      this.lazyLoad();
      this.$refs.audio.play();
      this.state = 'pause';

      if (location.pathname != '/playlist') {
        history.pushState({}, '', this.url);
      }

      document.title = `Playing: ${this.nowtitle} by ${this.nowartist}`;

      this.setMetadata(this.art);
    },
    setMetadata(art) {
      if (navigator.mediaSession) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.nowtitle,
          artist: this.nowartist,
          artwork: [
            {
              src: art,
              type: 'image/png',
            },
          ],
        });
      }
    },
    lazyLoad() {
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
    },
  },
};
</script>

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
.bg-img {
  background-image: linear-gradient(45deg, #88c0d0, #5e81ac);
  background-position: center;
  background-size: cover;
  border-radius: 0.25rem;
}
.bg-img.lazy {
  background-image: var(--art);
}
.search-artists {
  text-align: center;
}
.search-artists .bg-img {
  border-radius: 50%;
  margin-bottom: 0.5rem;
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
button {
  border: none;
  background: transparent;
  color: var(--color-text);
  appearence: none;
}
.bi {
  color: var(--color-text);
  font-size: 1.25rem;
  transition: color 0.3s ease;
}
.bi:hover,
.bi.true {
  color: var(--color-foreground);
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
.caps {
  text-transform: capitalize;
}
.pop {
  --shadow: none;
  --translate: 0;
}
.pop,
.pop-2 {
  transition: box-shadow 0.4s ease, transform 0.4s ease;
}
.pop:hover {
  --shadow: 0.5rem 0.5rem 1rem var(--color-shadow);
  --translate: -1.25rem;
  box-shadow: var(--shadow);
  transform: translateX(calc(var(--translate) / 2))
    translateY(calc(var(--translate) / 2));
}
.pop-2 {
  transform: translateX(var(--translate)) translateY(var(--translate));
  box-shadow: var(--shadow);
}
.popup-wrap {
  --display: none;
  position: relative;
}
.popup-wrap:hover,
.popup-wrap:focus,
.popup:focus,
.popup:active {
  --display: flex;
}
.popup {
  position: absolute;
  display: var(--display);
  background-color: var(--color-background);
  padding: 0.5rem;
  border-radius: 0.125rem;
  z-index: 999;
  bottom: 1.25rem;
  box-shadow: 0 0 0.5rem var(--color-border);
  animation: fade 0.4s ease;
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

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fill {
  from {
    width: 0;
  }
  to {
    width: var(--width);
  }
}
</style>
