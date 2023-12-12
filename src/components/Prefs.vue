<script setup>
import { ref, computed, onMounted } from 'vue';

import {
  PIPED_INSTANCE,
  HYPERPIPE_INSTANCE,
  getJson,
  useAuthLogout,
} from '@/scripts/fetch.js';

import { useStore } from '@/scripts/util.js';
import { SUPPORTED_LOCALES, useI18n } from '@/stores/misc.js';

const date = ref('unknown');

import('@/assets/version.json').then(v => {
  date.value = v.date;
});

const { t, setupLocale } = useI18n(),
  store = useStore(),
  instances = ref([]),
  hypInstances = ref([]),
  next = ref(false),
  compact = ref(false),
  prm = ref(false),
  cc = ref(false),
  restoreUrl = ref(''),
  prompt = txt => window.prompt(txt);

getJson('https://piped-instances.kavin.rocks').then(i => (instances.value = i));

getJson('https://raw.codeberg.page/Hyperpipe/pages/api/backend.json').then(
  i => (hypInstances.value = i),
);

const getRestoreUrl = () => {
  const params = new URLSearchParams();
  Object.keys(window.localStorage).forEach(key => {
    params.set(key, window.localStorage.getItem(key));
  });
  params.size == 0 ||
    (restoreUrl.value = window.location.origin + '/restore/?' + params);
};

function getBool(val) {
  return 'bi ' + (val ? 'bi-check2' : 'bi-x-lg');
}

function getStore(key) {
  return store.getItem(key);
}

function setStore(key, value) {
  store.setItem(key, value);
  getRestoreUrl();
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

function setCodec(codec) {
  setStore('codec', codec);
  if (window.audioPlayer)
    window.audioPlayer.configure('preferredAudioCodecs', codec.split(':'));
}

function setPRM(prm) {
  setStore('prm', prm);
  if (prm) document.body.classList.add('prm');
  else document.body.classList.remove('prm');
}

function getStoreBool(key, ele, def) {
  ele.value = getStore(key) || def;
}

async function setAuth(key) {
  if (getStore('authapi')) {
    if (!confirm('This requires a logout. Confirm logout?')) return;

    const res = await useAuthLogout();

    if (!res && res?.error)
      if (!confirm(`Got Error ${res ? ': ' + res.error : ''}. Continue?`))
        return;
  }

  store.removeItem('auth');
  setStore('authapi', key);
}

const verifyApi = computed(() =>
    hypInstances.value
      .map(i => i.api_url.replace('https://', '').replace('http://', ''))
      .includes(getStore('api') || HYPERPIPE_INSTANCE),
  ),
  verifyPipedApi = computed(() =>
    instances.value
      .map(i => i.api_url.replace('https://', ''))
      .includes(getStore('pipedapi') || PIPED_INSTANCE),
  ),
  verifyAuthApi = computed(() =>
    instances.value
      .map(i => i.api_url.replace('https://', ''))
      .includes(getStore('authapi') || PIPED_INSTANCE),
  );

onMounted(() => {
  getRestoreUrl();
  getStoreBool('next', next, true);
  getStoreBool('compact', compact, false);
  getStoreBool('prm', prm, false);
  getStoreBool('cc', cc, false);
});
</script>

<template>
  <h2>{{ t('pref.theme') }}</h2>
  <select
    id="pref-theme"
    class="input"
    :value="getTheme()"
    @change="setTheme($event.target.value)">
    <option value="dark">{{ t('pref.dark') }}</option>
    <option value="light">{{ t('pref.light') }}</option>
    <option value="black">{{ t('pref.black') }}</option>
    <option value="dracula">{{ t('pref.dracula') }}</option>
    <option value="nord">{{ t('pref.nord') }}</option>
    <option value="dark blur">{{ t('pref.blur') }}</option>
    <option value="light blur">{{ t('pref.blur_light') }}</option>
    <option value="black blur">{{ t('pref.blur_black') }}</option>
    <option value="dracula blur">{{ t('pref.blur_dracula') }}</option>
    <option value="nord blur">{{ t('pref.blur_nord') }}</option>
  </select>

  <div class="left">
    <input
      type="checkbox"
      name="pref-chk-compact"
      id="pref-chk-compact"
      class="input"
      @change="setStore('compact', $event.target.checked)"
      v-model="compact" />
    <label for="pref-chk-compact">{{ t('pref.compact') }}</label>
  </div>

  <div class="left">
    <input
      type="checkbox"
      name="pref-chk-prm"
      id="pref-chk-prm"
      class="input"
      @change="setPRM($event.target.checked)"
      v-model="prm" />
    <label for="pref-chk-prm">{{ t('pref.prm') }}</label>
  </div>

  <h2>{{ t('pref.language') }}</h2>

  <select
    id="pref-lang"
    class="input"
    :value="getStore('locale') || 'en'"
    @change="setLang($event.target.value)">
    <option v-for="i in SUPPORTED_LOCALES" :value="i.code" :key="i.code">
      {{ i.name }}
    </option>
  </select>

  <div class="left">
    <input
      type="checkbox"
      name="pref-chk-cc"
      id="pref-chk-cc"
      class="input"
      @change="setStore('to_cc', $event.target.checked)"
      v-model="cc" />
    <label for="pref-chk-cc">{{ t('pref.cc') }}</label>
  </div>

  <h2>{{ t('pref.tab') }}</h2>

  <select
    id="pref-page"
    class="input"
    :value="getStore('page') || 'home'"
    @change="setStore('page', $event.target.value)">
    <option value="home">{{ t('pref.home') }}</option>
    <option value="explore">{{ t('pref.explore') }}</option>
    <option value="charts">{{ t('pref.charts') }}</option>
    <option value="library">{{ t('pref.library') }}</option>
  </select>

  <h2>{{ t('pref.player') }}</h2>

  <div class="left">
    <input
      type="checkbox"
      name="pref-chk-next"
      id="pref-chk-next"
      class="input"
      @change="setStore('next', $event.target.checked)"
      v-model="next" />
    <label for="pref-chk-next">{{ t('pref.auto_queue') }}</label>
  </div>

  <div class="left">
    <label for="pref-codec">{{ t('pref.codec') }}</label>
    <select
      id="pref-codec"
      name="pref-codec"
      class="input"
      :value="getStore('codec') || 'opus:mp4a'"
      @change="setCodec($event.target.value)">
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
      class="input"
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
      class="input"
      max="100"
      min="0"
      :value="getStore('vol') || 100"
      @change="setStore('vol', $event.target.value)" />
  </div>

  <h2>{{ t('instances.hyp') }}</h2>

  <select
    v-if="hypInstances"
    class="input"
    :value="getStore('api') || HYPERPIPE_INSTANCE"
    @change="setStore('api', $event.target.value)">
    <option
      v-for="i in hypInstances"
      :key="i.name"
      :value="i.api_url.replace('https://', '').replace('http://', '')">
      {{ i.name.replace('Official', t('instances.default')) }}
    </option>

    <option v-if="!verifyApi">
      {{ getStore('api') || HYPERPIPE_INSTANCE }}
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
      <tbody v-for="i in hypInstances" :key="i.name">
        <tr>
          <td>
            {{ i.name.replace('Official', t('instances.default')) }}
          </td>
          <td>
            {{ i.locations.replaceAll(',', '') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>
    {{ t('instances.piped') }}
    <a
      href="https://github.com/TeamPiped/Piped"
      target="_blank"
      rel="noreferrer noopener"
      class="bi bi-info-circle"></a>
  </h2>
  <select
    v-if="instances"
    class="input"
    :value="getStore('pipedapi') || PIPED_INSTANCE"
    @change="
      e => {
        const v = e.target.value;
        setStore('pipedapi', v == 'x' ? prompt('instance') : v);
      }
    ">
    <option
      v-for="i in instances"
      :key="i.name"
      :value="i.api_url.replace('https://', '')">
      {{ i.name.replace('Official', t('instances.default')) }}
    </option>

    <option v-if="!verifyPipedApi">
      {{ getStore('pipedapi') || PIPED_INSTANCE }}
    </option>

    <option value="x">Custom</option>
  </select>

  <h3>{{ t('instances.auth') }}</h3>

  <select
    v-if="instances"
    class="input"
    :value="getStore('authapi') || PIPED_INSTANCE"
    @change="setAuth($event.target.value)">
    <option
      v-for="i in instances"
      :key="i.name"
      :value="i.api_url.replace('https://', '')">
      {{ i.name.replace('Official', t('instances.default')) }}
    </option>

    <option v-if="!verifyAuthApi">
      {{ getStore('authapi') || PIPED_INSTANCE }}
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
      <tbody v-for="i in instances" :key="i.name">
        <tr>
          <td>
            {{ i.name.replace('Official', t('instances.default')) }}
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

  <template v-if="restoreUrl">
    <h2>{{ t('title.restore_prefs') }}</h2>
    <a :href="restoreUrl" class="restore">{{ restoreUrl }}</a>
  </template>

  <footer>
    {{ date }}
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
footer,
.restore {
  text-align: center;
  word-break: break-word;
}
.restore {
  padding: 0.5rem;
  margin: 1rem 0;
  background: var(--color-background-mute);
  border-radius: 0.25rem;
  font-weight: bold;
  letter-spacing: 0.05rem;
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
td.bi {
  color: indianred;
  font-size: 1.25rem;
}
td.bi[data-active='true'] {
  color: var(--color-foreground);
}
footer {
  margin: 1rem 0;
}
footer .bi::before {
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
