<script setup>
import { ref } from 'vue';

defineProps({
  search: String,
});

defineEmits(['update-search']);

const show = ref(false);
</script>

<template>
  <button
    aria-label="Search Button"
    class="bi bi-search popup-wrap"
    @mouseenter="show = true"
    @mouseleave="show = false">
    <Transition name="fade">
      <div v-show="show" class="popup">
        <input
          type="text"
          aria-label="Search Input"
          placeholder="Search..."
          @change="$emit('update-search', $event.target.value)"
          :value="search" />
      </div>
    </Transition>
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
  width: calc(100vw - 4rem);
  max-width: 600px;
  font-size: 1rem;
  border: none;
  border-radius: inherit;
  background: var(--color-background-mute);
  outline: none;
  text-align: center;
}
</style>
