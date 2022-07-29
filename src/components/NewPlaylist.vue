<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import AlbumItem from './AlbumItem.vue';
import Modal from './Modal.vue';

import { useRand } from '../scripts/colors.js';

import {
  useListPlaylists,
  useGetPlaylist,
  useCreatePlaylist,
  useUpdatePlaylist,
} from '../scripts/db.js';

const emit = defineEmits(['play-urls']),
  list = ref([]),
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
  });

const Play = key => {
    console.log(key);

    useGetPlaylist(key, res => {
      console.log(res);
      emit('play-urls', res.urls);
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

onMounted(List);
</script>

<template>
  <div class="npl-wrap">
    <Modal
      n="2"
      :display="show.new"
      title="Create a new Playlist..."
      @show="
        e => {
          show.new = e;
        }
      ">
      <template #content>
        <input
          type="text"
          placeholder="Playlist name..."
          class="textbox"
          v-model="text" />
      </template>
      <template #buttons>
        <button @click="show.new = false">Cancel</button>
        <button @click="Create">Create</button>
      </template>
    </Modal>

    <Modal
      :n="sync.type == 'send' ? 2 : 1"
      :display="show.sync"
      title="Sync Playlists..."
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
            Send
          </button>
          <button :data-active="sync.type == 'rec'" @click="sync.type = 'rec'">
            Receive
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
        <button @click="show.sync = false">Cancel</button>
        <button v-if="sync.type == 'send'" @click="Send">
          {{ sync.type == 'send' ? 'Send' : 'Recieve' }}
        </button>
      </template>
    </Modal>

    <div class="grid">
      <div class="npl-box bi bi-plus-lg pop" @click="show.new = true"></div>

      <div
        class="npl-box bi bi-arrow-repeat pop"
        @click="show.sync = true"></div>
    </div>

    <div class="grid-3">
      <template v-for="i in list">
        <AlbumItem
          :name="i.name"
          :author="'Songs • ' + i.urls.length"
          :grad="useRand()"
          @open-album="Play(i.name)" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.npl-wrap {
  padding-bottom: 5rem;
}
.npl-box {
  margin: 0 auto 2rem auto;
  border-radius: 0.5rem;
  background-color: var(--color-background-mute);
  padding: 2rem 3rem;
  font-size: 4rem;
  width: 10rem;
}
.npl-box:hover {
  background-color: var(--color-background-soft);
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
.tabs button[data-active='true'] {
  color: var(--color-background);
  background: linear-gradient(135deg, cornflowerblue, #88c0d0);
}
.tabs button:first-child {
  border-radius: 0.25rem 0 0 0.25rem;
}
.tabs button:last-child {
  border-radius: 0 0.25rem 0.25rem 0;
}
@media (min-width: 1024px) {
  .npl-box:first-child {
    margin: 0 1rem 0 auto;
  }
  .npl-box:last-child {
    margin: 0 auto 0 1rem;
  }
}
</style>
