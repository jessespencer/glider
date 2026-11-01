// Game rules with no drawing or input code. Everything is in the original 512×342 room coordinates.

export const ROOM_W = 512;
export const ROOM_H = 342;
export const PLANE_W = 44;
export const PLANE_H = 16;

export const OBJECT_TABLE = 1;
export const OBJECT_VENT = 8;
export const OBJECT_CLOCK = 16;
export const OBJECT_COMPUTER = 43;

const FALL_SPEED = 52;
const LIFT_SPEED = 130;
const LIFT_RESPONSE = 7;
const MAX_SPEED = 150;
const ACCEL = 2400;
const BRAKE = 3000;
const CEILING_BOUNCE = 170;
const COLUMN_REACH = 17;
const FLOOR_Y = 334;
const CRASH_SECONDS = 0.8;
const START_LIVES = 4;
const START_X = 62;
const START_Y = 36;
const MIN_X = 2;
const MAX_X = ROOM_W - PLANE_W / 2;

/** How long the wrecked plane stays frozen on screen before it vanishes. */
export const CRASH_VISIBLE_SECONDS = 0.2;

const SCORE_TICKER_PER_SECOND = 400;
const POPUP_SECONDS = 1;
const POPUP_RISE_PER_SECOND = 10;

// The plane's outline is smaller than its sprite box, so grazing an edge doesn't count as a hit.
const HIT_INSET_X = 6;
const HIT_INSET_Y = 3;

export interface RoomObject {
  type: number;
  x: number;
  y: number;
  w: number;
  h: number;
  amount: number;
  extra: number;
  isOn: number;
}

export interface Room {
  name: string;
  backPict: number;
  tiles: number[];
  leftOpen: boolean;
  rightOpen: boolean;
  objects: RoomObject[];
}

export type Phase = "ready" | "flying" | "crashing" | "cleared" | "gameOver";

export interface Input {
  left: boolean;
  right: boolean;
}

/** The points value that floats up from an item after it's grabbed. */
export interface ScorePopup {
  amount: number;
  x: number;
  y: number;
  age: number;
}

export interface GameState {
  phase: Phase;
  x: number;
  y: number;
  vx: number;
  vy: number;
  score: number;
  /** What the scoreboard shows; it counts up to `score`. */
  shownScore: number;
  popups: ScorePopup[];
  lives: number;
  collected: Set<number>;
  crashTime: number;
  time: number;
}

export function createGame(): GameState {
  return {
    phase: "ready",
    x: START_X,
    y: START_Y,
    vx: 0,
    vy: 0,
    score: 0,
    shownScore: 0,
    popups: [],
    lives: START_LIVES,
    collected: new Set(),
    crashTime: 0,
    time: 0,
  };
}

function overlapsObject(s: GameState, o: RoomObject): boolean {
  return (
    s.x + HIT_INSET_X < o.x + o.w &&
    s.x + PLANE_W - HIT_INSET_X > o.x &&
    s.y + HIT_INSET_Y < o.y + o.h &&
    s.y + PLANE_H - HIT_INSET_Y > o.y
  );
}

/** Returns the height the vent lifts the plane to, or null when it's outside every air column. */
function liftTop(s: GameState, room: Room): number | null {
  const centerX = s.x + PLANE_W / 2;
  for (const o of room.objects) {
    if (o.type === OBJECT_VENT && Math.abs(centerX - (o.x + o.w / 2)) <= COLUMN_REACH) return o.amount;
  }
  return null;
}

function steer(s: GameState, input: Input, dt: number): void {
  const direction = Number(input.right) - Number(input.left);
  if (direction !== 0) {
    s.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, s.vx + direction * ACCEL * dt));
    return;
  }
  const slowed = Math.max(0, Math.abs(s.vx) - BRAKE * dt);
  s.vx = Math.sign(s.vx) * slowed;
}

function startCrash(s: GameState): void {
  s.phase = "crashing";
  s.crashTime = 0;
}

function respawn(s: GameState): void {
  s.lives -= 1;
  if (s.lives === 0) {
    s.phase = "gameOver";
    return;
  }
  // The room reloads from scratch, so its clocks and their points come back too.
  s.phase = "flying";
  s.x = START_X;
  s.y = START_Y;
  s.vx = 0;
  s.vy = 0;
  s.score = 0;
  s.shownScore = 0;
  s.popups = [];
  s.collected.clear();
}

function fly(s: GameState, room: Room, input: Input, dt: number): void {
  steer(s, input, dt);

  const top = liftTop(s, room);
  const targetVy = top !== null && s.y > top ? -LIFT_SPEED : FALL_SPEED;
  s.vy += (targetVy - s.vy) * Math.min(1, LIFT_RESPONSE * dt);

  s.x += s.vx * dt;
  s.y += s.vy * dt;

  // Rising air slams the plane into the ceiling, so it bounces off and gets pushed back up.
  if (top !== null && s.y <= top && s.vy < 0) {
    s.y = top;
    s.vy = CEILING_BOUNCE;
  }

  if (s.x < MIN_X && !room.leftOpen) {
    s.x = MIN_X;
    s.vx = 0;
  }
  if (s.x > MAX_X) {
    if (room.rightOpen) {
      s.phase = "cleared";
      return;
    }
    s.x = MAX_X;
    s.vx = 0;
  }

  if (s.y + PLANE_H >= FLOOR_Y) {
    startCrash(s);
    return;
  }

  room.objects.forEach((o, index) => {
    if (s.phase !== "flying" || !overlapsObject(s, o)) return;
    if (o.type === OBJECT_TABLE || o.type === OBJECT_COMPUTER) {
      startCrash(s);
    } else if (o.type === OBJECT_CLOCK && !s.collected.has(index)) {
      s.collected.add(index);
      s.score += o.amount;
      s.popups.push({ amount: o.amount, x: o.x + o.w / 2, y: o.y, age: 0 });
    }
  });
}

function updateScoreDisplay(s: GameState, dt: number): void {
  s.shownScore = Math.min(s.score, s.shownScore + SCORE_TICKER_PER_SECOND * dt);
  for (const popup of s.popups) {
    popup.age += dt;
    popup.y -= POPUP_RISE_PER_SECOND * dt;
  }
  s.popups = s.popups.filter((popup) => popup.age < POPUP_SECONDS);
}

export function step(s: GameState, room: Room, input: Input, dt: number): void {
  s.time += dt;
  updateScoreDisplay(s, dt);
  if (s.phase === "flying") {
    fly(s, room, input, dt);
  } else if (s.phase === "crashing") {
    s.crashTime += dt;
    if (s.crashTime >= CRASH_SECONDS) respawn(s);
  }
}
