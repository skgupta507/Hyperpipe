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
  if (page == 'home') {
    useRoute('/');
  } else {
    useRoute(`/${page}/`);
  }

  if (page == 'home' && nav.state.page == 'home') {
    emit('explore');
  }
  nav.state.page = page;
}
</script>

<template>
  <nav>
    <h1 class="bi" @click="home">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path
          d="M5.097 13.097a2.904 2.904 0 0 1 5.806 0A2.905 2.905 0 0 1 8 16a2.905 2.905 0 0 1-2.903-2.903Z" />
        <path
          d="M2.194 11.618a1.614 1.614 0 1 0 2.258 1.479c0-.661-.399-1.23-.968-1.479v-4.87l3.097 2.065v-4.31l1.432-2.18 1.406 2.09v4.4l3.097-2.065v4.87a1.614 1.614 0 1 0 2.258 1.479c0-.661-.398-1.23-.968-1.479v-7.27L10.71 6.413v-2.4L7.987 0 5.29 4.116v2.297L2.194 4.348v7.27Z" />
      </svg>
    </h1>

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
  display: flex;
  font-size: calc(1.75rem + 1.5vw);
  padding-bottom: 0;
}
h1.bi svg {
  width: calc(1.75rem + 1.5vw);
  height: calc(1.75rem + 1.5vw);
  fill: currentColor;
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
