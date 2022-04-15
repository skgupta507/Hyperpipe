<script setup>
const props = defineProps({
  author: String,
  title: String,
  channel: String,
  play: String,
});

const emit = defineEmits(['get-artist', 'open-song']);

function openSong(el) {
  if (!el.classList.contains('ign')) {
    emit('open-song', props.play);
  }
}

async function Share() {
  if ('share' in navigator) {
    const data = {
      title: `Listen to ${props.title} by ${props.author} on Hyperpipe`,
      url: location.origin + props.play,
    };

    try {
      await navigator.share(data);
      console.log('Done Sharing!');
    } catch (err) {
      console.log(err);
    }
  } else {
    navigator.clipboard.writeText(location.host + props.play).then(
      () => {
        console.log('Copied to Clipboard');
      },
      (err) => {
        console.log(err);
      },
    );
  }
}
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
