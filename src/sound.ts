import type { SoundEvent } from "./sim";

const SOUND_COUNT = 31;

// Confirmed by ear: crash, clock, battery, drip, guitar, startup, level, tick, shred, steam,
// powerSwitch. The rest are matched by length and character; open ?sounds to audition them.
const SOUND_FOR_EVENT: Record<SoundEvent, number> = {
  clock: 5,
  paper: 16,
  bonus: 13,
  battery: 9,
  bands: 8,
  crash: 1,
  switch: 19,
  powerSwitch: 18,
  shred: 20,
  steam: 25,
  thunder: 17,
  fire: 4,
  pop: 24,
  travel: 12,
  zap: 14,
  drip: 7,
  guitar: 15,
  startup: 2,
  level: 29,
  tick: 21,
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
  let levelSound: AudioBufferSourceNode | null = null;

  const start = (event: SoundEvent): AudioBufferSourceNode | null => {
    const buffer = buffers.get(SOUND_FOR_EVENT[event]);
    if (!buffer) return null;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
    return source;
  };

  const playLevel = (): void => {
    // Rooms can go by faster than this jingle, so a new room cuts off the last one.
    levelSound?.stop();
    levelSound = start("level");
  };

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
      if (event === "level") {
        playLevel();
        return;
      }
      const source = start(event);
      // The first load opens with the startup sound, then the room's jingle.
      if (event === "startup" && source) source.onended = playLevel;
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
