<script setup>
import { reactive } from 'vue'
import SearchBar from '../components/SearchBar.vue';

const emit = defineEmits(['update-page', 'update-search']);

const page = reactive({
  home: true,
  playlist: false
})

function Toggle(p) {
  for (let pg in page) {
    page[pg] = false
  }
  page[p] = true
  emit('update-page', p);
}
function home() {
  history.pushState('', {}, '/')
}

</script>

<template>
  <nav>
    <h1 class="bi bi-vinyl" @click="home"></h1>

    <div class="wrap">
      <span :class="'nav-ico bi bi-house ' + page.home" @click="Toggle('home')"></span>
      <span :class="'nav-ico bi bi-collection ' + page.playlist" @click="Toggle('playlist')"></span>
    </div>

    <div class="wrap">
      <SearchBar
        @update-search="
          (e) => {
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
  font-size: calc(1rem + 1vw);
}
.wrap {
  text-align: center;
  margin-left: auto;
  margin-right: .5rem;
}
.nav-ico {
  margin: 0 .5rem;
}
</style>
