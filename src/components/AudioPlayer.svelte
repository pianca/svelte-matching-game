<!-- eslint-disable -->
<script context="module" lang="ts">
  let player: HTMLAudioElement;
  export function stop() {
    player.pause();
  }
  export function play() {
    player.play();
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  // import { writable, get } from 'svelte/store';

  export let src: string;
  //export let id: string;

  let audio: HTMLAudioElement;

  onMount(() => {
    console.log("on mount audio");
    audio = new Audio(src);
    player = audio;
  });
</script>

<div>
  <audio bind:this={audio} />
</div>
