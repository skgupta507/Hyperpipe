<script setup>
defineProps(['ico']);
defineEmits(['click']);
</script>

<template>
  <button
    :class="'bi bi-' + (ico ? ico : 'play')"
    @click="$emit('click')"></button>
</template>

<style scoped>
.bi {
  height: 4rem;
  width: 4rem;
  font-size: 4rem;
  color: #fff;
  padding: 0;
  line-height: 0;
  background: var(--color-foreground);
  border-radius: 50%;
  vertical-align: -1rem;
  text-align: center;
  transition: background 0.4s ease;
  margin-right: auto;
}
.bi-play:before {
  padding-left: 0.2rem;
}
.bi:hover,
.bi:not(.bi-play) {
  background: transparent;
}
.bi:not(.bi-play) {
  font-size: 3rem;
}
</style>
