import { SoundPlayer } from "./soundPlayer";

export enum SoundTypes {
  win = "win",
  lose = "lose",
  nice = "nice",
  fart = "fart",
  tick = "tick",
}

export class SoundTracks {
  public name: SoundTypes;
  public tracks: string[];

  constructor(name: SoundTypes, tracks: string[]) {
    this.name = name;
    this.tracks = tracks;
  }
}

export class SoundManager {
  sounds: Map<string, SoundPlayer>;

  constructor(tracks: SoundTracks[]) {
    this.sounds = new Map<string, SoundPlayer>();
    tracks.forEach((element) => {
      const s = new SoundPlayer(element.name, element.tracks);
      this.sounds.set(s.id, s);
    });
  }

  play(name: SoundTypes) {
    if (this.sounds.has(name) == false) {
      console.log("not found any sound with name = " + name);
      return;
    }

    const sound = this.sounds.get(name);
    if (sound === null) {
      console.log("found any sound but is null with name = " + name);
      return;
    }

    sound!.play();
  }
}
