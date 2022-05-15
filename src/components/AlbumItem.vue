<script setup>
import { useRand } from '../scripts/colors.js';

const rand = useRand();

const props = defineProps({
  name: String,
  author: {
    type: String,
    default: '',
  },
  grad: String,
  art: String,
});

defineEmits(['open-album']);
</script>

<template>
  <div class="album card pop" @click="$emit('open-album')">
    <div class="card-bg bg-img pop-2"></div>

    <div class="card-text">
      <h4>{{ name }}</h4>
      <i>{{ author }}</i>
    </div>
  </div>
</template>

<style scoped>
.card {
  min-height: 17rem;
  width: 15rem;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: auto;
}
.card:hover {
  background-color: var(--color-background);
}
.card-bg {
  --grad: v-bind('grad || rand');
  --art: v-bind('art || grad || rand');
  height: 13rem;
  width: 13rem;
}
.card-text {
  margin-top: 0.5rem;
}
</style>
