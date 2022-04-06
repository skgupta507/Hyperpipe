<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  artist: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div v-if="title && artist" class="wrap">
    <h1>{{ title }}</h1>
    <h3>{{ artist }}</h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}
.wrap {
  text-align: center;
}
@media (min-width: 1024px) {
  .wrap {
    text-align: left;
  }
}
</style>
