<script setup>
defineProps({
  author: String,
  title: String,
  channel: String,
  play: String,
});
defineEmits(['get-artist']);
</script>
<template>
  <div class="song card flex pop" @click="openSong($event.target)">
    <slot name="art"></slot>

    <span class="flex content">
      <h4>{{ title }}</h4>
      <a
        :href="channel"
        @click.prevent="$emit('get-artist', channel.split('/')[2])"
        class="ign">
        <i class="ign">{{ author.replaceAll(' - Topic', '') }}</i>
      </a>
    </span>

    <span class="bi bi-three-dots-vertical popup-wrap ign">
      <div class="popup ign">
        <span
          class="bi bi-plus-lg ign"
          @click="
            $parent.$emit('add-song', { url: play, title: title })
          "></span>

        <span class="bi bi-share ign" @click="Share"></span>
      </div>
    </span>
  </div>
</template>

<script>
export default {
  methods: {
    openSong(el) {
      if (!el.classList.contains('ign')) {
        this.$emit('open-song', this.play);
      }
    },
    async Share() {
      if ('share' in navigator) {
        const data = {
          title: `Listen to ${this.title} by ${this.author} on Hyperpipe`,
          url: location.origin + this.play,
        };

        try {
          await navigator.share(data);
          console.log('Done Sharing!');
        } catch (err) {
          console.log(err);
        }
      } else {
        navigator.clipboard.writeText(location.host + this.play).then(
          () => {
            console.log('Copied to Clipboard');
          },
          (err) => {
            console.log(err);
          },
        );
      }
    },
  },
};
</script>

<style scoped>
.card {
  margin: 1rem 0;
  justify-content: initial;
}
span.content {
  padding: 1rem;
  flex-direction: column;
  align-items: initial;
  flex-basis: calc(calc(100% - 120px) - 4rem);
}
span.bi-three-dots-vertical {
  margin: 2rem;
}
.popup {
  line-height: auto;
  height: auto;
  right: 0;
  bottom: 0;
  box-shadow: var(--shadow);
  border-radius: 0.25rem;
}
.popup span {
  padding: 0.5rem;
}
</style>
