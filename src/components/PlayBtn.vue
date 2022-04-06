<script setup>
defineEmits(['click']);
</script>

<template>
  <button class="bi bi-play" @click="$emit('click')"></button>
</template>

<style scoped>
button {
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
button:before {
  padding-left: 0.2rem;
}
button:hover {
  background: transparent;
}
</style>
