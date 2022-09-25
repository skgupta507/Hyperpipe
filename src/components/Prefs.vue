<script setup>
import { ref, computed, onMounted } from 'vue';

import { getJson } from '@/scripts/fetch.js';
import { SUPPORTED_LOCALES, useI18n } from '@/stores/misc.js';
import { useStore } from '@/scripts/util.js';

const { t, setupLocale } = useI18n(),
  instances = ref([]),
  hypInstances = ref([]),
  next = ref(false);

getJson('https://piped-instances.kavin.rocks').then(i => {
  instances.value = i;
  console.log(i);
});

getJson('https://raw.codeberg.page/Hyperpipe/pages/api/backend.json').then(
  i => {
    hypInstances.value = i;
    console.log(i);
  },
);

function getBool(val) {
  return 'bi ' + (val ? 'bi-check2' : 'bi-x-lg');
}

function getStore(key) {
  return useStore().getItem(key);
}

function setStore(key, value) {
  console.log(key, value);
  useStore().setItem(key, value);
}

function getTheme() {
  return document.body.getAttribute('data-theme') || 'dark';
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  setStore('theme', theme);
}

function setLang(locale) {
  setupLocale(locale);
  setStore('locale', locale);
}

function getStoreBool(key, ele) {
  ele.value = getStore(key) || true;
}

const verifyApi = computed(() =>
    hypInstances.value
      .map(i => i.api_url.replace('https://', '').replace('http://'))
      .includes(getStore('api') || 'hyperpipeapi.onrender.com'),
  ),
  verifyPipedApi = computed(() =>
    instances.value
      .map(i => i.api_url.replace('https://', ''))
      .includes(getStore('pipedapi') || 'pipedapi.kavin.rocks'),
  ),
  verifyAuthApi = computed(() =>
    instances.value
      .map(i => i.api_url.replace('https://', ''))
      .includes(getStore('authapi') || 'pipedapi.kavin.rocks'),
  );

onMounted(() => {
  getStoreBool('next', next);
});
</script>

<template>
  <h2>{{ t('pref.theme') }}</h2>
  <select
    id="pref-theme"
    :value="getTheme()"
    @change="setTheme($event.target.value)">
    <option value="dark">Dark (Default)</option>
    <option value="light">Light</option>
    <option value="blur">Blur</option>
    <option value="dracula">Dracula</option>
    <option value="nord">Nord</option>
  </select>

  <h2>Language</h2>

  <select
    id="pref-lang"
    :value="getStore('locale') || 'en'"
    @change="setLang($event.target.value)">
    <option v-for="i in SUPPORTED_LOCALES" :value="i.code">{{ i.name }}</option>
  </select>

  <h2>{{ t('pref.player') }}</h2>

  <div class="left">
    <input
      type="checkbox"
      name="pref-chk-next"
      id="pref-chk-next"
      @change="setStore('next', $event.target.checked)"
      v-model="next" />
    <label for="pref-chk-next">{{ t('pref.auto_queue') }}</label>
  </div>

  <div class="left">
    <label for="pref-codec">{{ t('pref.codec') }}</label>
    <select
      id="pref-codec"
      name="pref-codec"
      :value="getStore('codec') || 'opus:mp4a'"
      @change="setStore('codec', $event.target.value)">
      <option value="opus:mp4a">opus, mp4a</option>
      <option value="mp4a:opus">mp4a, opus</option>
      <option value="opus">opus</option>
      <option value="mp4a">mp4a</option>
    </select>
  </div>

  <div class="left">
    <label for="pref-quality">{{ t('pref.quality') }}</label>
    <select
      id="pref-quality"
      name="pref-quality"
      :value="getStore('quality') || 'auto'"
      @change="setStore('quality', $event.target.value)">
      <option value="auto">{{ t('pref.auto') }}</option>
      <option value="best">{{ t('pref.best') }}</option>
      <option value="worst">{{ t('pref.worst') }}</option>
    </select>
  </div>

  <div class="left">
    <label for="pref-volume">{{ t('pref.volume') }}</label>
    <input
      type="number"
      name="pref-volume"
      id="pref-volume"
      max="100"
      min="0"
      :value="getStore('vol') || 100"
      @change="setStore('vol', $event.target.value)" />
  </div>

  <h2>{{ t('instances.hyp') }}</h2>

  <select
    v-if="hypInstances"
    :value="getStore('api') || 'hyperpipeapi.onrender.com'"
    @change="setStore('api', $event.target.value)">
    <option
      v-for="i in hypInstances"
      :key="i.name"
      :value="i.api_url.replace('https://', '').replace('http://', '')">
      {{ i.name }}
    </option>

    <option v-if="!verifyApi">
      {{ getStore('api') || 'hyperpipeapi.onrender.com' }}
    </option>
  </select>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>{{ t('instances.name') }}</th>
          <th>{{ t('instances.loc') }}</th>
        </tr>
      </thead>
      <tbody v-for="i in hypInstances">
        <tr>
          <td>
            {{ i.name }}
          </td>
          <td>
            {{ i.locations.replaceAll(',', '') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>{{ t('instances.piped') }}</h2>
  <select
    v-if="instances"
    :value="getStore('pipedapi') || 'pipedapi.kavin.rocks'"
    @change="setStore('pipedapi', $event.target.value)">
    <option
      v-for="i in instances"
      :key="i.name"
      :value="i.api_url.replace('https://', '')">
      {{ i.name.replace('Official', 'Default') }}
    </option>

    <option v-if="!verifyPipedApi">
      {{ getStore('pipedapi') || 'pipedapi.kavin.rocks' }}
    </option>
  </select>

  <h3>{{ t('instances.auth') }}</h3>

  <select
    v-if="instances"
    :value="getStore('authapi') || 'pipedapi.kavin.rocks'"
    @change="setStore('authapi', $event.target.value)">
    <option
      v-for="i in instances"
      :key="i.name"
      :value="i.api_url.replace('https://', '')">
      {{ i.name.replace('Official', 'Default') }}
    </option>

    <option v-if="!verifyAuthApi">
      {{ getStore('authapi') || 'pipedapi.kavin.rocks' }}
    </option>
  </select>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>{{ t('instances.name') }}</th>
          <th>{{ t('instances.loc') }}</th>
          <th>{{ t('instances.cdn') }}</th>
          <th>{{ t('instances.up_to_date') }}</th>
          <th>{{ t('instances.version') }}</th>
        </tr>
      </thead>
      <tbody v-for="i in instances">
        <tr>
          <td>
            {{ i.name.replace('Official', 'Default') }}
          </td>
          <td>
            {{ i.locations.replaceAll(',', '') }}
          </td>
          <td :class="getBool(i.cdn)" :data-active="i.cdn"></td>
          <td :class="getBool(i.up_to_date)" :data-active="i.up_to_date"></td>
          <td>
            {{ i.version }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <footer>
    <a
      class="bi bi-code-slash"
      target="_blank"
      rel="noreferrer noopener"
      href="https://codeberg.org/Hyperpipe/Hyperpipe" />
    <a
      class="bi bi-eye"
      target="_blank"
      rel="noreferrer noopener"
      href="https://codeberg.org/Hyperpipe/Hyperpipe/wiki/Privacy" />
  </footer>
</template>

<style scoped>
h2 {
  margin-top: 1rem;
}
h2,
h3,
label,
footer {
  text-align: center;
}
select,
input {
  font-size: 1rem;
  margin: 1rem auto;
  padding: 0.5rem 0.75rem;
  border: none;
  color: var(--color-text);
  max-width: 20rem;
  border-radius: 0.125rem;
  background-color: var(--color-background-mute);
}
input[type='number'] {
  width: 4.5rem;
}
input[type='checkbox'] {
  appearance: none;
  border: 0.25rem solid var(--color-background-mute);
  margin: 0;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
}
input[type='checkbox']:checked {
  background: var(--color-foreground);
}
label {
  margin: 0 0.5rem;
  display: inline-block;
  line-height: 1rem;
  font-size: 1rem;
}
label[for*='pref-chk'],
label[for^='pref-chk'] {
  vertical-align: 0.35rem;
}
.left {
  float: left;
  margin: 0 auto;
  padding: 1rem;
}
.left + .left {
  padding: 0;
}
.table-wrap {
  overflow-x: auto;
  margin-bottom: 2rem;
}
.table-wrap,
table {
  width: 100%;
}
th,
td {
  margin: 0.25rem 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.125rem;
  background-color: var(--color-background-mute);
}
th {
  font-weight: bolder;
}
td {
  text-align: center;
  max-width: 40vw;
  overflow-wrap: break-word;
}
td.bi {
  color: indianred;
  font-size: 1.25rem;
}
td.bi[data-active='true'] {
  color: var(--color-foreground);
}
footer {
  margin-bottom: 2rem;
}
footer .bi:before {
  font-size: 1.75rem;
  vertical-align: -0.45rem;
}
footer .bi {
  padding: 0.5rem;
  margin: 0 0.25rem;
  border-radius: 0.25rem;
}
@media (max-width: 500px) {
  select,
  input {
    max-width: 100% !important;
  }
}
</style>
