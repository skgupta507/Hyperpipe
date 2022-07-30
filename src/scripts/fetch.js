import { useStore, useSanitize } from './util.js';

export function getPipedQuery() {
  const papi = new URLSearchParams(location.search).get('pipedapi');

  if (!papi) {
    return '';
  }

  return '?pipedapi=' + useSanitize(papi);
}

export async function getJson(url) {
  const res = await fetch(url)
    .then(res => res.json())
    .catch(err => {
      console.error(err);
      alert(err);
    });

  if (res && res.error) {
    alert(
      res.message
        .replaceAll('Video', 'Audio')
        .replaceAll('video', 'audio')
        .replaceAll('watched', 'heard'),
    );
    console.error(res.message);
  } else if (res) {
    return JSON.parse(useSanitize(JSON.stringify(res)));
  }
}

export async function getJsonPiped(path) {
  const root =
    new URLSearchParams(location.search).get('pipedapi') ||
    useStore().getItem('pipedapi') ||
    'pipedapi.kavin.rocks';

  return await getJson('https://' + root + path);
}
