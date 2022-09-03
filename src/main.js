import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import en from '@/locales/en.json';

import('bootstrap-icons/font/bootstrap-icons.css');

const pinia = createPinia(),
  i18n = createI18n({
    globalInjection: true,
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: en,
    },
  }),
  app = createApp(App);

window.i18n = i18n;

app.use(i18n);
app.use(pinia);
app.mount('#app');
