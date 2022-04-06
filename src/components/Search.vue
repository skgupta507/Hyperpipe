<script setup>
defineProps(['search', 'songItems', 'items']);
defineEmits([
  'get-song',
  'get-album',
  'get-artist',
  'lazy',
  'play-urls',
  'add-song',
]);
</script>

<template>
  <div v-if="songs && songs.corrected" class="text-full">
    I Fixed your Typo, "<span class="caps">{{ songs.suggestion }}</span
    >"!!
  </div>

  <div v-if="albumTitle" class="text-full flex">
    <PlayBtn @click="playAlbum" />
    <span>{{ albumTitle }}</span>
  </div>

  <div v-if="songs && songs.items[0]" class="search-songs">
    <h2>Top Songs</h2>
    <div class="grid">
      <template v-for="song in songs.items">
        <SongItem
          :author="song.uploaderName || ''"
          :title="song.title || song.name"
          :channel="song.uploaderUrl || ''"
          :play="song.url || song.watchId"
          @open-song="
            $emit('get-song', {
              url: song.url || song.watchId,
              title: song.title,
            })
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
      v-if="this.notes"
      @click.prevent="$emit('get-album', '/playlist?list=' + this.notes.items)"
      class="more"
      >See All</a
    >
  </div>

  <div v-if="albums && albums.items[0]" class="search-albums">
    <h2>Albums</h2>
    <div class="grid-3">
      <template v-for="album in albums.items">
        <AlbumItem
          :author="album.uploaderName || album.subtitle"
          :name="album.name || album.title"
          :art="
            '--art: url(' + (album.thumbnail || album.thumbnails[0].url) + ');'
          "
          @open-album="
            $emit(
              'get-album',
              album.url || '/playlist?list=' + album.playlistId,
            )
          " />
      </template>
    </div>
  </div>

  <div
    v-if="recommendedArtists && recommendedArtists.items[0]"
    class="search-artists">
    <h2>Similar Artists</h2>
    <div class="grid-3">
      <template v-for="artist in recommendedArtists.items">
        <AlbumItem
          :author="artist.subtitle"
          :name="artist.title"
          :art="'--art: url(' + artist.thumbnails[0].url + ');'"
          @open-album="$emit('get-artist', artist.artistId)" />
      </template>
    </div>
  </div>
</template>

<script>
import PlayBtn from './PlayBtn.vue';
import SongItem from './SongItem.vue';
import AlbumItem from './AlbumItem.vue';

export default {
  components: {
    PlayBtn,
    SongItem,
    AlbumItem,
  },
  data() {
    return {
      songs: null,
      albums: null,
      recommendedArtists: null,
      albumTitle: null,
      notes: null,
    };
  },
  watch: {
    search(NewSearch) {
      console.log(NewSearch);
      this.getSearch(NewSearch);
    },
    songItems(i) {
      console.log(i);

      this.Reset();

      this.songs = {};
      this.songs.items = i.items;
      this.albumTitle = i.title;
    },
    items(itms) {
      this.Reset();

      for (let i in itms) {
        this[i] = {};
        this[i].items = itms[i];

        console.log(this[i]);
      }
    },
  },
  methods: {
    Reset() {
      this.notes = null;
      this.albums = null;
      this.albumTitle = null;
      this.songs = null;
      this.recommendedArtists = null;
    },
    playAlbum() {
      const urls = this.songs.items.map((item) => {
        return { url: item.url, title: item.title };
      });

      this.$emit('play-urls', urls);
    },
    getSearch(q) {
      if (q) {
        history.pushState({}, '', `/search/${q}`);

        document.title = 'Search Results for ' + q;

        this.getResults(q.split(' ').join('+'));
        this.$emit('lazy');
      } else {
        this.Reset();
        history.pushState({}, '', '/');
        document.title = 'Hyperpipe';

        console.log('No Search');
      }
    },
    getResults(q) {
      const filters = ['music_songs', 'music_albums'];

      for (let filter of filters) {
        fetch(
          `https://pipedapi.kavin.rocks/search?q=${q}&filter=${filter}`,
        ).then((res) => {
          res.json().then((json) => {
            this[filter.split('_')[1]] = json;
            console.log(json);
          });
        });
      }
    },
  },
};
</script>
<style scoped>
.search-albums,
.search-songs,
.search-artists {
  place-items: start center;
  margin-bottom: 2rem;
}
.search-albums .grid-3,
.search-artists .grid-3 {
  display: grid;
  grid-template-columns: 1fr;
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
