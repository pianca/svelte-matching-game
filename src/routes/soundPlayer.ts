import { Sound } from "svelte-sound";

export class SoundPlayer {
  public id: string;
  public max: number;
  sounds: Sound[];

  constructor(id: string, tracks: string[]) {
    this.id = id;
    this.max = tracks.length;
    this.sounds = new Array<Sound>(tracks.length);
    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
      this.sounds[index] = new Sound(track);
    }
  }

  getRandomInt() {
    return Math.floor(Math.random() * this.max);
  }

  play(index: number | null = null) {
    let soundIndex = index ?? this.getRandomInt();
    this.sounds[soundIndex].play();
  }
}
