<script setup>
import { useI18n } from '@/stores/misc.js';
import { ref, onMounted } from 'vue';

const { t } = useI18n();

const urlParamKeys = ref([]),
  urlParamValues = ref([]),
  restorePrefs = () => {
    for (let i = 0; i < urlParamKeys.value.length; i++) {
      window.localStorage.setItem(
        urlParamKeys.value[i],
        urlParamValues.value[i],
      );
    }
    window.location.href = '/';
  };

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.forEach((val, key) => {
    urlParamKeys.value.push(key);
    urlParamValues.value.push(val);
  });
});
</script>

<template>
  <h2>{{ t('title.restore_prefs') }}</h2>

  <div class="table">
    <span v-for="(key, index) in urlParamKeys">
      <div class="table-row">
        <span>{{ key }}</span>
        <hr />
        <span>{{ urlParamValues[index] }}</span>
      </div>
      <hr />
    </span>
  </div>

  <button @click="restorePrefs" class="input">
    {{ t('title.restore_prefs') }}
  </button>
</template>

<style>
h2 {
  text-align: center;
}

.table {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 2rem 0;
}

.table-row {
  display: flex;
  width: 100%;
  padding: 0.5rem 0;
}

.table-row > span {
  width: 50%;
  padding-left: 0.5rem;
}

button {
  cursor: pointer;
}
</style>
