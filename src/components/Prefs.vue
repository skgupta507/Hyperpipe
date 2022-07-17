<script setup>
import { ref, onMounted } from 'vue';

import { getJson } from '../scripts/fetch.js';
import { useStore } from '../scripts/util.js';

const instances = ref([]),
  hypInstances = ref([]),
  hls = ref(false),
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

function getStoreBool(key, ele) {
  ele.value = getStore(key) || true;
}

onMounted(() => {
  getStoreBool('hls', hls);
  getStoreBool('next', next);
});
</script>

<template>
  <h2>Theme</h2>
  <select
    id="pref-theme"
    :value="getTheme()"
    @change="setTheme($event.target.value)">
    <option value="dark">Dark (Default)</option>
    <option value="light">Light</option>
    <option value="dracula">Dracula</option>
    <option value="nord">Nord</option>
  </select>

  <h2>Audio Player</h2>

  <div class="left">
    <input
      type="checkbox"
      name="pref-chk-hls"
      id="pref-chk-hls"
      @change="setStore('hls', $event.target.checked)"
      v-model="hls" />
    <label for="pref-chk-hls">Live Streaming</label>
  </div>

  <div class="left">
    <input
      type="checkbox"
      name="pref-chk-next"
      id="pref-chk-next"
      @change="setStore('next', $event.target.checked)"
      v-model="next" />
    <label for="pref-chk-next">Automatically Queue Songs</label>
  </div>

  <div class="left">
    <input
      type="number"
      name="pref-volume"
      id="pref-volume"
      max="100"
      min="0"
      :value="getStore('vol') || 100"
      @change="setStore('vol', $event.target.value)" />
    <label for="pref-volume">Default Volume</label>
  </div>

  <h2>Hyperpipe Instance</h2>

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
  </select>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Locations</th>
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

  <h2>Piped Instance</h2>
  <select
    v-if="instances"
    :value="getStore('pipedapi') || 'pipedapi.kavin.rocks'"
    @change="setStore('pipedapi', $event.target.value)">
    <option
      v-for="i in instances"
      :key="i.name"
      :value="i.api_url.replace('https://', '').replace('http://', '')">
      {{ i.name.replace('Official', 'Default') }}
    </option>
  </select>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Locations</th>
          <th>CDN</th>
          <th>Up to Date</th>
          <th>Version</th>
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
      href="https://codeberg.org/Hyperpipe/Hyperpipe"></a>
  </footer>
</template>

<style scoped>
h2 {
  margin-top: 1rem;
}
h2,
label,
footer {
  text-align: center;
}
select,
input {
  font-size: 1rem;
  margin: 1rem auto;
  padding: 0.5rem 0.75rem;
  outline: none;
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
}
</style>
