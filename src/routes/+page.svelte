<script lang="ts">
  import { Sound } from "svelte-sound";
  import { emoji } from "./emoji";

  type State = "start" | "playing" | "paused" | "won" | "lost";

  let win = "/person-clapping-sound-effect.mp3";
  let fart = "/fart-sound-effect.mp3";
  let lose = "/losing-sound-effect.mp3";
  let nice = "/short-winning-brass-sound-effect.mp3";

  let state: State = "start";
  let size = 20;
  let grid = createGrid();
  let maxMatches = grid.length / 2;
  let selected: number[] = [];
  let matches: string[] = [];
  let timerId: number | null = null;
  let time = 300;

  function createGrid() {
    // only want unique cards
    let cards = new Set<string>();
    // half because we duplicate the cards
    let maxSize = size / 2;

    while (cards.size < maxSize) {
      // pick random emoji
      const randomIndex = Math.floor(Math.random() * emoji.length);
      cards.add(emoji[randomIndex]);
    }

    // duplicate and shuffle cards
    return shuffle([...cards, ...cards]);
  }

  function shuffle<Items>(array: Items[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  function startGameTimer() {
    function countdown() {
      state !== "paused" && (time -= 1);
    }
    timerId = setInterval(countdown, 1000);
  }

  function selectCard(cardIndex: number) {
    selected = selected.concat(cardIndex);
  }

  function matchCards() {
    // array destructuring can have any name for the values
    const [first, second] = selected;

    if (grid[first] === grid[second]) {
      matches = matches.concat(grid[first]);
      niceSound.play();
    } else {
      fartSound.play();
    }

    // clear selected
    setTimeout(() => (selected = []), 2500);
  }

  function pauseGame(e: KeyboardEvent) {
    if (e.key === "Escape") {
      switch (state) {
        case "playing":
          state = "paused";
          break;
        case "paused":
          state = "playing";
          break;
      }
    }
  }

  function resetGame() {
    timerId && clearInterval(timerId);
    grid = createGrid();
    maxMatches = grid.length / 2;
    selected = [];
    matches = [];
    timerId = null;
    time = 300;
  }

  function gameWon() {
    winSound.play();
    state = "won";
    resetGame();
  }

  function gameLost() {
    loseSound.play();
    state = "lost";
    resetGame();
  }

  $: if (state === "playing") {
    //	in case you pause the game
    !timerId && startGameTimer();
  }

  $: selected.length === 2 && matchCards();
  $: maxMatches === matches.length && gameWon();
  $: time === 0 && gameLost();

  const winSound = new Sound(win);
  const fartSound = new Sound(fart);
  const loseSound = new Sound(lose);
  const niceSound = new Sound(nice);
</script>

<svelte:window on:keydown={pauseGame} />

{#if state === "start"}
  <h1>Matching game</h1>
  <button on:click={() => (state = "playing")}>Play</button>
{/if}

{#if state === "paused"}
  <h1>Game paused</h1>
{/if}

{#if state === "playing"}
  <h1 class="timer" class:pulse={time <= 10}>
    {time}
  </h1>

  <div class="matches">
    {#each matches as card}
      <div>{card}</div>
    {/each}
  </div>

  <div class="cards">
    {#each grid as card, cardIndex}
      {@const isSelected = selected.includes(cardIndex)}
      {@const isSelectedOrMatch =
        selected.includes(cardIndex) || matches.includes(card)}
      {@const match = matches.includes(card)}
      {@const isSelectedOrMatchOrMaxSelectionReached =
        selected.length == 2 ||
        selected.includes(cardIndex) ||
        matches.includes(card)}

      <button
        class="card"
        class:selected={isSelected}
        class:flip={isSelectedOrMatch}
        disabled={isSelectedOrMatchOrMaxSelectionReached}
        on:click={() => selectCard(cardIndex)}
      >
        <div class="back" class:match>
          {card}
        </div>
      </button>
    {/each}
  </div>
{/if}

{#if state === "lost"}
  <h1>You lost! 💩</h1>
  <button on:click={() => (state = "playing")}>Play again</button>
{/if}

{#if state === "won"}
  <h1>You win! 🎉</h1>
  <button on:click={() => (state = "playing")}>Play again</button>
{/if}

<style>
  .cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.4rem;
  }

  .card {
    height: 140px;
    width: 140px;
    font-size: 4rem;
    background-image: repeating-linear-gradient(
      45deg,
      #d5d5dd 0,
      #d5d5dd 1.8px,
      transparent 0,
      transparent 50%
    );
    background-color: #47c8ff;
    background-size: 8px 8px;
    /* background-color: var(--bg-2); */
    transition: rotate 0.8s ease-out;
    transform-style: preserve-3d;

    &.selected {
      border: 4px solid var(--border);
    }

    &.flip {
      background-image: none;
      background-color: #47c8ff;
      rotate: y 180deg;
      pointer-events: none;
    }

    & .back {
      background-image: none;
      background-color: #334455;

      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      backface-visibility: hidden;
      rotate: y 180deg;
    }

    & .match {
      transition: opacity 0.3s ease-out;
      background-image: none;
      background-color: #33ff33;
      opacity: 0.4;
    }
  }

  .card:hover {
    background-color: #ff9a4776;
  }

  .matches {
    display: flex;
    gap: 1rem;
    margin-block: 2rem;
    font-size: 3rem;
  }

  .timer {
    transition: color 0.3s ease;
  }

  .pulse {
    color: var(--pulse);
    animation: pulse 1s infinite ease;
  }

  @keyframes pulse {
    to {
      scale: 1.4;
    }
  }
</style>
