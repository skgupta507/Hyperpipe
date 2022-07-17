<script setup>
import { reactive } from 'vue';
import SearchBar from '../components/SearchBar.vue';

import { useNav } from '@/stores/misc.js';

const nav = useNav();
</script>

<template>
  <nav>
    <h1 class="bi bi-vinyl" @click="home"></h1>

    <div class="wrap">
      <span
        class="nav-ico bi bi-house"
        :data-active="nav.state.page == 'home'"
        @click="nav.state.page = 'home'"></span>
      <span
        class="nav-ico bi bi-compass"
        :data-active="nav.state.page == 'genres'"
        @click="nav.state.page = 'genres'"></span>
      <span
        class="nav-ico bi bi-collection"
        :data-active="nav.state.page == 'playlist'"
        @click="nav.state.page = 'playlist'"></span>
      <span
        class="nav-ico bi bi-gear"
        :data-active="nav.state.page == 'prefs'"
        @click="nav.state.page = 'prefs'"></span>
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
