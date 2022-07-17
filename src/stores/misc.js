import { reactive } from 'vue';
import { defineStore } from 'pinia';

export const useNav = defineStore('nav', () => {
  const state = reactive({
    search: '',
    page: 'home',
  });

  return { state };
});
