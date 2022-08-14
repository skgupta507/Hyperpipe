<script setup>
import { reactive } from 'vue';
import SearchBar from '../components/SearchBar.vue';

import { useNav } from '@/stores/misc.js';

import { useRoute } from '@/scripts/util.js';

const emit = defineEmits(['explore']);

const nav = useNav();

function home() {
  useRoute('/');
  nav.state.page = 'home';
  emit('explore');
}

function set(page) {
  nav.state.page = page;
  if (page == 'home') {
    useRoute('/');
  } else {
    useRoute(`/${page}/`);
  }
}
</script>

<template>
  <nav>
    <h1 class="bi bi-vinyl" @click="home"></h1>

    <div class="wrap">
      <span
        class="nav-ico bi bi-house"
        :data-active="nav.state.page == 'home'"
        @click="set('home')"></span>
      <span
        class="nav-ico bi bi-compass"
        :data-active="nav.state.page == 'explore'"
        @click="set('explore')"></span>
      <span
        class="nav-ico bi bi-collection"
        :data-active="nav.state.page == 'library'"
        @click="set('library')"></span>
      <span
        class="nav-ico bi bi-gear"
        :data-active="nav.state.page == 'prefs'"
        @click="set('prefs')"></span>
    </div>

    <div class="wrap">
      <SearchBar />
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
  padding-bottom: 0;
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
@media (min-width: 1024px) {
  .bi {
    font-size: 1.5rem;
  }
}
</style>
