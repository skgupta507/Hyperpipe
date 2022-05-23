<script setup>
import { reactive } from 'vue';
import SearchBar from '../components/SearchBar.vue';

defineProps({
  search: String,
});

const emit = defineEmits(['update-page', 'update-search']),
  page = reactive({
    home: true,
    playlist: false,
    prefs: false,
  });

const Toggle = p => {
    for (let pg in page) {
      page[pg] = false;
    }
    page[p] = true;
    emit('update-page', p);

    console.log(page[p], p);
  },
  home = () => {
    history.pushState('', {}, '/');
  };
</script>

<template>
  <nav>
    <h1 class="bi bi-vinyl" @click="home"></h1>

    <div class="wrap">
      <span
        :class="'nav-ico bi bi-house ' + page.home"
        @click="Toggle('home')"></span>
      <span
        :class="'nav-ico bi bi-collection ' + page.playlist"
        @click="Toggle('playlist')"></span>
      <span
        :class="'nav-ico bi bi-gear ' + page.prefs"
        @click="Toggle('prefs')"></span>
    </div>

    <div class="wrap">
      <SearchBar
        :search="search"
        @update-search="
          e => {
            $emit('update-search', e);
          }
        " />
    </div>
  </nav>
</template>

<style scoped>
nav {
  width: 100%;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
}
h1.bi {
  font-size: calc(1.75rem + 1.5vw);
}
.bi {
  font-size: calc(1rem + 1.5vw);
}
.wrap {
  text-align: center;
  margin-left: auto;
}
.nav-ico {
  margin: 0 0.5rem;
}
</style>
