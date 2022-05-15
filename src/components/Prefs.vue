<script setup>
import { ref } from 'vue';

import { getJson } from '../scripts/fetch.js';

const instances = ref([]);

getJson('https://piped-instances.kavin.rocks').then(i => {
  instances.value = i;

  console.log(i);
});

function bi(val) {
  return 'bi ' + (val ? 'bi-check2' : 'bi-x-lg');
}

function get(key) {
  return localStorage.getItem(key);
}

function set(key, value) {
  console.log(key, value);
  localStorage.setItem(key, value);
}
</script>

<template>
  <h2>Piped Instance</h2>
  <select
    v-if="instances"
    :value="get('pipedapi') || 'pipedapi.kavin.rocks'"
    @change="set('pipedapi', $event.target.value)">
    <option
      v-for="i in instances"
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
          <th>CDN</th>
          <th>Up to Date</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody v-for="i in instances">
        <tr>
          <td>
            {{ i.name.replaceAll('Official', 'Default') }}
          </td>
          <td>
            {{ i.locations.replaceAll(',', '') }}
          </td>
          <td :class="bi(i.cdn)" :data-active="i.cdn"></td>
          <td :class="bi(i.up_to_date)" :data-active="i.up_to_date"></td>
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
h2,
footer {
  text-align: center;
}
select {
  font-size: 1rem;
  margin: 1rem auto;
  padding: 0.5rem 0.75rem;
  outline: none;
  border: none;
  max-width: 20rem;
  border-radius: 0.125rem;
  background-color: var(--color-background-mute);
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
