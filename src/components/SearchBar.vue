<script setup>
defineProps(['search']);
defineEmits(['update-search']);
</script>

<template>
  <button class="bi bi-search popup-wrap">
    <div class="popup">
      <input
        type="text"
        placeholder="Search..."
        @change="$emit('update-search', $event.target.value)"
        :value="search" />
    </div>
  </button>
</template>

<style scoped>
.popup {
  right: 0;
  top: -0.5rem;
  bottom: -0.5rem;
  padding: 0;
}
.popup input {
  color: var(--color-text);
  --width: calc(100vw - 4rem);
  width: 1.5rem;
  max-width: 600px;
  font-size: 1rem;
  border: none;
  border-radius: inherit;
  background: var(--color-background-mute);
  outline: none;
  text-align: center;
  animation: fill 0.4s ease;
  transform: width 0.4s ease;
}
.popup input:hover {
  width: var(--width);
}
</style>
