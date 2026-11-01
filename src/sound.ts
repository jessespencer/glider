import type { SoundEvent } from "./sim";

const SOUND_COUNT = 31;
const BASS_BEAT_SOUND = 30;
const BASS_BEAT_SECONDS = 3;

// Confirmed by ear: crash, clock, battery, drip, guitar, startup, level, tick, shred, steam,
// powerSwitch, zap, grease, ball, mirror, fan, toastDown, fire, balloonPop, boost, pop, bonus,
// win, burn, thunder, timeBonus, toastUp. The rest are matched by length and character; open
// ?sounds to audition them.
const SOUND_FOR_EVENT: Record<SoundEvent, number> = {
  clock: 5,
  paper: 13,
  bonus: 13,
  timeBonus: 28,
  battery: 9,
  boost: 26,
  bands: 11,
  crash: 1,
  switch: 23,
  powerSwitch: 18,
  fan: 3,
  shred: 20,
  steam: 25,
  grease: 14,
  burn: 8,
  toastUp: 27,
  toastDown: 22,
  ball: 4,
  thunder: 17,
  fire: 11,
  pop: 6,
  balloonPop: 19,
  travel: 12,
  mirror: 16,
  zap: 24,
  drip: 7,
  guitar: 15,
  startup: 2,
  level: 29,
  tick: 21,
  win: 16,
};

function soundUrl(id: number): string {
  return `assets/sounds/${String(id).padStart(2, "0")}.wav`;
}

export interface Sounds {
  /** Browsers only start audio after a key press, so call this from one. */
  unlock(): void;
  play(event: SoundEvent): void;
  /** Flips sound on or off and returns whether it's now on. */
  toggle(): boolean;
  /** Flips the slow bass pulse on or off and returns whether it's now on. */
  toggleBassBeat(): boolean;
}

export function createSounds(): Sounds {
  const context = new AudioContext();
  const buffers = new Map<number, AudioBuffer>();
  let levelSound: AudioBufferSourceNode | null = null;
  let enabled = true;
  let bassBeatWanted = false;
  let bassBeatTimer: number | undefined;

  const pulseBassBeat = (): void => {
    const buffer = buffers.get(BASS_BEAT_SOUND);
    if (!buffer) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
  };

  const updateBassBeat = (): void => {
    window.clearInterval(bassBeatTimer);
    if (!enabled || !bassBeatWanted) return;
    pulseBassBeat();
    bassBeatTimer = window.setInterval(pulseBassBeat, BASS_BEAT_SECONDS * 1000);
  };

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

  for (const id of new Set([...Object.values(SOUND_FOR_EVENT), BASS_BEAT_SOUND])) {
    void fetch(soundUrl(id))
      .then((response) => response.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => buffers.set(id, buffer));
  }

  return {
    unlock() {
      if (context.state === "suspended") void context.resume();
    },
    toggle() {
      enabled = !enabled;
      updateBassBeat();
      return enabled;
    },
    toggleBassBeat() {
      bassBeatWanted = !bassBeatWanted;
      updateBassBeat();
      return bassBeatWanted;
    },
    play(event) {
      if (!enabled) return;
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
