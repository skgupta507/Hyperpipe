<script setup>
import SearchBar from '../components/SearchBar.vue';

defineEmits(['update-search']);
</script>

<template>
  <nav>
    <h1>Hyperpipe</h1>

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
h1 {
  font-size: 2rem;
}
.wrap {
  margin-left: auto;
}
</style>
