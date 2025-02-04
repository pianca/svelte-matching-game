<script lang="ts">
  import { SoundTypes, SoundTracks, SoundManager } from "./soundManager";
  import { emoji } from "./emoji";
  type State = "start" | "playing" | "paused" | "won" | "lost";
  type Pos = {
    isEnter: boolean;
    x: number;
    y: number;
  };
  const sm: SoundManager = createSoundManager();

  let state: State = "start";
  let size = 20;
  let grid = createGrid();
  let maxMatches = grid.length / 2;
  let selected: number[] = [];
  let matches: string[] = [];
  let matchesIndexes: number[] = [];
  let timerId: number | null = null;
  let time = 300;

  function createSoundManager() {
    return new SoundManager([
      new SoundTracks(SoundTypes.win, ["person-clapping-sound-effect.mp3"]),
      new SoundTracks(SoundTypes.nice, [
        "short-winning-brass-sound-effect.mp3",
      ]),
      new SoundTracks(SoundTypes.lose, ["losing-sound-effect.mp3"]),
      new SoundTracks(SoundTypes.tick, ["tick1.mp3"]),
      new SoundTracks(SoundTypes.fart, [
        "fart-sound-effect.mp3",
        "girl-laughing.mp3",
        "fart_01.mp3",
        "fart_02.mp3",
        "fart_03.mp3",
        "fart_04.mp3",
        "fart_05.mp3",
        "fart_06.mp3",
        "fart_07.mp3",
        "fart_08.mp3",
        "fart_09.mp3",
      ]),
    ]);
  }

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
    sm.play(SoundTypes.tick);
    selected = selected.concat(cardIndex);
  }

  function matchCards() {
    // array destructuring can have any name for the values
    const [first, second] = selected;

    if (grid[first] === grid[second]) {
      matches = matches.concat(grid[first]);
      matchesIndexes = matchesIndexes.concat(first).concat(second);
      sm.play(SoundTypes.nice);
    } else {
      sm.play(SoundTypes.fart);
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
    matchesIndexes = [];
    timerId = null;
    time = 300;
  }

  function gameWon() {
    sm.play(SoundTypes.win);
    state = "won";
    resetGame();
  }

  function gameLost() {
    sm.play(SoundTypes.lose);
    state = "lost";
    resetGame();
  }

  function getDeltaMovment(key: string): Pos {
    // console.log(key);
    switch (key) {
      case "ArrowDown":
        return { isEnter: false, x: 0, y: +1 };
      case "ArrowUp":
        return { isEnter: false, x: 0, y: -1 };
      case "ArrowLeft":
        return { isEnter: false, x: -1, y: 0 };
      case "ArrowRight":
        return { isEnter: false, x: +1, y: 0 };
      case "Enter":
        return { isEnter: true, x: 0, y: 0 };
      default:
        return { isEnter: false, x: 0, y: 0 };
    }
  }
  function updatePos(pos: Pos, delta: Pos) {
    return { x: pos.x + delta.x, y: pos.y + delta.y, isEnter: delta.isEnter };
  }
  function isValidPos(pos: Pos): boolean {
    return 0 <= pos.x && pos.x < 5 && 0 <= pos.y && pos.y < 4;
  }
  function isSelectedOrMatched(cardIndex: number): boolean {
    return selected.includes(cardIndex) || matchesIndexes.includes(cardIndex);
  }
  function doStuff(pos: Pos): void {
    let idx = computePreSelection(pos);
    // console.log('idx' + idx)
    if (
      pos.isEnter &&
      isSelectedOrMatched(idx) === false &&
      selected.length < 2
    ) {
      selectCard(idx);
    }
  }
  function computePreSelection(pos: Pos): number {
    return pos.y * 5 + pos.x;
  }
  function cardIsPreSelected(cardIndex: number, pos: Pos) {
    let computed = computePreSelection(pos);
    return computed === cardIndex;
  }

  let oldPos = { isEnter: false, x: 0, y: 0 };

  function onKeyDown(e: KeyboardEvent) {
    let delta = getDeltaMovment(e.key);
    let newPos = updatePos(oldPos, delta);

    if (isValidPos(newPos)) {
      doStuff(newPos);

      //if (isDifferentPos(oldPos, newPos)) {
      newPos.isEnter = false;
      oldPos = newPos;
      //}
    } else {
    }
  }

  $: if (state === "playing") {
    //	in case you pause the game
    !timerId && startGameTimer();
  }

  $: selected.length === 2 && matchCards();
  $: maxMatches === matches.length && gameWon();
  $: time === 0 && gameLost();

  function isDifferentPos(
    oldPos: { x: number; y: number },
    newPos: { x: number; y: number }
  ) {
    return oldPos.x !== newPos.x || oldPos.y !== newPos.y;
  }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

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

  <div>
    <h3>{oldPos.x}</h3>
    <h3>{oldPos.y}</h3>
  </div>

  <div class="cards">
    {#each grid as card, cardIndex}
      {@const isPreSelected = cardIsPreSelected(cardIndex, oldPos)}
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
        class:pre={isPreSelected}
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
    &.pre {
      border-color: red;
      border: 8px solid red;
      background-color: #ff9a4776;
    }

    &.selected {
      border-color: red;
      border: 8px dashed red;
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
