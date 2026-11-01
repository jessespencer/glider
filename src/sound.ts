import type { SoundEvent } from "./sim";

const SOUND_COUNT = 31;

// The original sounds are unnamed, so these are matched by length and character. Open ?sounds to
// audition them all and correct this table by ear.
const SOUND_FOR_EVENT: Record<SoundEvent, number> = {
  clock: 13,
  paper: 16,
  bonus: 13,
  pickup: 8,
  crash: 17,
  switch: 19,
  fire: 4,
  pop: 24,
  travel: 12,
  zap: 5,
  win: 29,
};

function soundUrl(id: number): string {
  return `assets/sounds/${String(id).padStart(2, "0")}.wav`;
}

export interface Sounds {
  /** Browsers only start audio after a key press, so call this from one. */
  unlock(): void;
  play(event: SoundEvent): void;
}

export function createSounds(): Sounds {
  const context = new AudioContext();
  const buffers = new Map<number, AudioBuffer>();

  for (const id of new Set(Object.values(SOUND_FOR_EVENT))) {
    void fetch(soundUrl(id))
      .then((response) => response.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => buffers.set(id, buffer));
  }

  return {
    unlock() {
      if (context.state === "suspended") void context.resume();
    },
    play(event) {
      const buffer = buffers.get(SOUND_FOR_EVENT[event]);
      if (!buffer) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();
    },
  };
}

/** A plain list of buttons for hearing every original sound, reached with ?sounds. */
export function showSoundBoard(): void {
  document.body.style.cssText = "overflow:auto;color:#fff;font:16px system-ui;padding:16px";
  document.querySelector("#game")?.remove();
  for (let id = 1; id <= SOUND_COUNT; id++) {
    const button = document.createElement("button");
    button.textContent = `Sound ${id}`;
    button.style.cssText = "margin:4px;padding:10px 14px;font:inherit";
    button.addEventListener("click", () => void new Audio(soundUrl(id)).play());
    document.body.append(button);
  }
}
