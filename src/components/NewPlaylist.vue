<script setup>
import { ref, reactive, watch, onMounted } from 'vue';

import AlbumItem from './AlbumItem.vue';
import Modal from './Modal.vue';

import { useRand } from '@/scripts/colors.js';
import { useStore } from '@/scripts/util.js';

import {
  useListPlaylists,
  useGetPlaylist,
  useCreatePlaylist,
  useUpdatePlaylist,
} from '@/scripts/db.js';

import {
  useAuthCreatePlaylist,
  getAuthPlaylists,
  getJsonAuth,
  getJsonPiped,
} from '@/scripts/fetch.js';

import { useResults } from '@/stores/results.js';
import { useI18n, useNav } from '@/stores/misc.js';

const { t } = useI18n(),
  store = useStore(),
  auth = ref(!!store.auth),
  results = useResults(),
  nav = useNav();

defineEmits(['play-urls', 'open-playlist']);

const list = ref([]),
  show = reactive({
    new: false,
    sync: false,
  }),
  text = ref(''),
  sync = reactive({
    type: 'send',
    id: 'Please Wait...',
    to: '',
    peer: undefined,
  }),
  user = reactive({
    username: undefined,
    password: undefined,
    playlists: [],
    create: false,
  });

const pathname = url => new URL(url).pathname;

const Open = key => {
    console.log(key);

    useGetPlaylist(key, res => {
      console.log(res);
      if (res.urls.length > 0) {
        results.resetItems();
        results.setItem('songs', {
          title: 'Local • ' + key,
          items: res.urls.map(i => ({ ...i, ...{ thumbnail: '/1x1.png' } })),
        });

        nav.state.page = 'home';
      } else alert('No songs to play!');
    });
  },
  List = () => {
    useListPlaylists(res => {
      list.value = res;
    });
  },
  Create = () => {
    if (text.value) {
      useCreatePlaylist(text.value, [], () => {
        List();
        show.new = false;
      });
    }
  },
  Send = () => {
    const conn = sync.peer.connect(sync.to);

    console.log(conn);

    conn.on('open', () => {
      List();
      conn.send(list.value);
    });

    conn.on('close', () => {
      show.sync = false;
    });

    conn.on('error', err => {
      console.log(err);
    });
  };

const Login = async () => {
    if (user.username && user.password) {
      const res = await getJsonAuth('/login', {
        method: 'POST',
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      });

      if (!res.error) {
        store.setItem('auth', res.token);
        auth.value = true;
      } else alert(res.error);
    }
  },
  Logout = async () => {
    const res = await getJsonAuth('/logout', {
      method: 'POST',
      headers: {
        Authorization: store.auth,
      },
    });

    if (!res.error) {
      store.removeItem('auth');
      auth.value = false;
    } else alert(res.error);
  },
  getPlaylists = async () => {
    const res = await getAuthPlaylists();

    user.playlists = res;
    console.log(user.playlists);
  },
  createPlaylist = async () => {
    if (text.value) {
      await useAuthCreatePlaylist(text.value);

      getPlaylists();
      show.new = false;
    }
  };

const getFeeds = async () => {
  const subs = JSON.parse(store.subs ? store.subs : '[]');

  if (subs.length > 0) {
    const json = await getJsonPiped(
      '/feed/unauthenticated?channels=' + subs.join(','),
    );

    results.resetItems();
    results.setItem('songs', {
      title: t('title.feeds'),
      items: json,
    });

    nav.state.page = 'home';
  }
};
watch(
  () => show.sync,
  async () => {
    const { Peer } = await import('peerjs');

    window.Peer = Peer;

    if (show.sync === true) {
      sync.peer = new Peer('hyp-' + Math.random().toString(36).substr(2));

      sync.peer.on('open', id => {
        sync.id = id;
      });

      sync.peer.on('connection', conn => {
        console.log(conn);

        conn.on('data', data => {
          if (sync.type == 'rec') {
            console.log(data);

            List();

            for (let i of data) {
              const pl = list.value.filter(p => p.name == i.name)[0];

              if (pl) {
                for (let u of i.urls) {
                  if (!pl.urls.filter(r => r.url === u.url)[0]) {
                    useUpdatePlaylist(i.name, u, () => {
                      console.log('Added: ' + u.name);
                    });
                  }
                }
              } else {
                useCreatePlaylist(i.name, i.urls);
              }

              List();

              if (data.indexOf(i) == data.length - 1) {
                show.sync = false;
              }
            }
          }
        });
      });
    } else if (sync.peer) {
      sync.peer.destroy();
    }
  },
);

watch(auth, getPlaylists);

onMounted(async () => {
  List();
  await getPlaylists();
});
</script>

<template>
  <div class="npl-wrap">
    <Modal
      n="2"
      :display="show.new"
      :title="t('playlist.create')"
      @show="
        e => {
          show.new = e;
        }
      ">
      <template #content>
        <div v-if="auth" class="tabs">
          <button :data-active="!user.create" @click="user.create = false">
            {{ t('title.local') }}
          </button>
          <button :data-active="user.create" @click="user.create = true">
            {{ t('title.remote') }}
          </button>
        </div>

        <input
          type="text"
          :placeholder="t('playlist.name') + '...'"
          class="textbox"
          v-model="text" />
      </template>
      <template #buttons>
        <button @click="show.new = false">{{ t('action.cancel') }}</button>
        <button @click="user.create ? createPlaylist() : Create()">
          {{ t('action.create') }}
        </button>
      </template>
    </Modal>

    <Modal
      :n="sync.type == 'send' ? 2 : 1"
      :display="show.sync"
      :title="t('playlist.sync')"
      @show="
        e => {
          show.sync = e;
        }
      ">
      <template #content>
        <div class="tabs">
          <button
            :data-active="sync.type == 'send'"
            @click="sync.type = 'send'">
            {{ t('action.send') }}
          </button>
          <button :data-active="sync.type == 'rec'" @click="sync.type = 'rec'">
            {{ t('action.receive') }}
          </button>
        </div>

        <div v-if="sync.type == 'send'">
          <input
            type="text"
            class="textbox"
            placeholder="ID ( hyp-xxxxxxxxx )"
            @input="sync.to = $event.target.value" />
        </div>

        <div v-else-if="sync.type == 'rec'">
          <pre>ID: {{ sync.id }}</pre>
        </div>
      </template>

      <template #buttons>
        <button @click="show.sync = false">{{ t('action.cancel') }}</button>
        <button v-if="sync.type == 'send'" @click="Send">
          {{ sync.type == 'send' ? t('action.send') : t('action.recieve') }}
        </button>
      </template>
    </Modal>

    <div class="grid">
      <div class="npl-box bi bi-plus-lg pop" @click="show.new = true"></div>

      <div
        class="npl-box bi bi-arrow-repeat pop"
        @click="show.sync = true"></div>

      <div class="npl-box bi bi-tag pop" @click="getFeeds"></div>
    </div>

    <h2 v-if="list.length > 0">{{ t('playlist.local') }}</h2>

    <div class="grid-3">
      <AlbumItem
        v-for="i in list"
        :key="i.name"
        :name="i.name"
        :author="t('title.songs') + ' • ' + i.urls.length"
        :grad="useRand()"
        @open-album="Open(i.name)" />
    </div>

    <h2 class="login-h">{{ t('playlist.remote') }}</h2>

    <div v-if="auth" class="grid-3">
      <AlbumItem
        v-for="i in user.playlists"
        :key="i.id"
        :name="i.name.replace('Playlist - ', '')"
        :art="pathname(i.thumbnail) != '/' ? i.thumbnail : undefined"
        @open-album="$emit('open-playlist', '/playlists?list=' + i.id)" />
    </div>
    <form v-else class="login" @submit.prevent>
      <input
        class="textbox"
        type="text"
        placeholder="username"
        autocomplete="username"
        @change="user.username = $event.target.value"
        required />
      <input
        class="textbox"
        type="password"
        placeholder="password"
        autocomplete="password"
        @change="user.password = $event.target.value"
        required />
      <button @click="Login" class="textbox">{{ t('title.login') }}</button>

      <p>
        Don't have an account? register on
        <a
          href="https://piped.kavin.rocks/register"
          target="_blank"
          rel="noreferrer noopener"
          >Piped</a
        >
      </p>
    </form>

    <button v-if="auth" @click="Logout" class="logout textbox">Logout</button>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  width: fit-content;
  gap: 2rem;
  grid-auto-rows: 10rem;
  margin: 0 auto;
}
h2 {
  text-align: center;
  margin: 2rem;
}
.npl-wrap {
  padding-bottom: 5rem;
}
.npl-box {
  --background: var(--color-background-mute);
  border-radius: 0.5rem;
  padding: 2rem 3rem;
  font-size: 4rem;
  width: 10rem;
}
.npl-round {
  float: left;
  display: inline-block;
  height: 5rem;
  width: 5rem;
  border-radius: 50%;
  background: v-bind('bg');
}
.text-box {
  padding: 2rem;
}
pre {
  white-space: pre-wrap;
}
.tabs {
  margin: 0.5rem 0 1.5rem 0;
}
.tabs button {
  width: calc(100% / 2);
  background: var(--color-background);
}
.tabs button[data-active='true'],
.login button,
button.logout {
  font-weight: bold;
  color: var(--color-background);
  background: linear-gradient(135deg, cornflowerblue, #88c0d0);
}
button.logout {
  margin: 1rem auto;
  display: block;
  background: linear-gradient(135deg, indianred, #bf616a);
}
.tabs button:first-child {
  border-radius: 0.25rem 0 0 0.25rem;
}
.tabs button:last-child {
  border-radius: 0 0.25rem 0.25rem 0;
}
.login {
  display: block;
  margin: 1rem auto;
}
.login > * {
  margin: 1rem auto;
  display: block;
  text-align: center;
}
</style>
