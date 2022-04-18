<script setup>
defineProps({
  name: String,
  author: String,
  art: {
    type: String,
    default: '--art: linear-gradient(45deg, #88c0d0, #5e81ac);',
  },
});

const emit = defineEmits(['open-album']);

function onClick() {
  emit('open-album');
}
</script>

<template>
  <div class="album card pop" @click="onClick">
    <div class="card-bg bg-img pop-2" :style="art"></div>

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
  height: 13rem;
  width: 13rem;
}
.card-text {
  margin-top: 0.5rem;
}
</style>
