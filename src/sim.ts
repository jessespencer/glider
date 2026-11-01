// Game rules with no drawing or input code. Everything is in the original 512×342 room coordinates.

export const ROOM_W = 512;
export const ROOM_H = 342;
export const PLANE_W = 44;
export const PLANE_H = 16;
export const TURN_DURATION_SECONDS = 0.3;

export const OBJECT = {
  table: 1,
  shelf: 2,
  books: 3,
  cabinet: 4,
  portal: 5,
  ventUp: 8,
  ventDown: 9,
  duct: 10,
  candle: 11,
  fanLeft: 12,
  fanRight: 13,
  clock: 16,
  paper: 17,
  grease: 18,
  hiddenBonus: 19,
  battery: 20,
  bands: 21,
  lightSwitch: 24,
  outlet: 25,
  thermostat: 26,
  shredder: 27,
  powerSwitch: 28,
  guitar: 29,
  drip: 32,
  toaster: 33,
  ball: 34,
  fishbowl: 35,
  kettle: 36,
  window: 37,
  painting: 40,
  mirror: 41,
  wastebasket: 42,
  computer: 43,
  stairsUp: 44,
  stairsDown: 45,
} as const;

export const ENEMY_DART = 0;
export const ENEMY_COPTER = 1;
export const ENEMY_BALLOON = 2;

const FALL_SPEED = 75;
const LIFT_SPEED = 130;
const LIFT_RESPONSE = 7;
const DOWNDRAFT_SPEED = 225;
const DOWNDRAFT_RESPONSE = 11;
const MAX_SPEED = 150;
const TURBO_SPEED = 430;
const TURBO_DRAIN_PER_SECOND = 30;
const BOOST_SOUND_SECONDS = 0.05;
const ACCEL = 2400;
const BRAKE = 3000;
const CEILING_BOUNCE = 105;
const COLUMN_REACH = 17;
const CEILING_AIR_TOP = 44;
const FURNITURE_REACH = 8;
const FAN_SPEED = 340;
const FAN_RESPONSE = 12;
const FAN_CARRY_DECAY = 260;
const FAN_FLOAT_SPEED = 12;
const STEAM_DIRECTION = -1;
const STEAM_LIFT_SPEED = 300;
const STEAM_PUSH_SPEED = 220;
const STEAM_THROW_SECONDS = 0.5;
const STEAM_REACH_X = 56;
const STEAM_REACH_Y = 24;
/** The band of moving air, measured down from the top of the fan. */
export const FAN_STREAM_TOP = 10;
export const FAN_STREAM_H = 16;
const FAN_STREAM_MARGIN = 8;
const SHOT_SPEED = 320;
const DART_POINTS = 300;
const FLOOR_Y = 334;
const CRASH_SECONDS = 0.8;
const START_LIVES = 4;
const START_X = 62;
const START_Y = 36;
const MIN_X = 2;
const MAX_X = ROOM_W - PLANE_W / 2;
const LEFT_EXIT_X = -PLANE_W / 2;
const LINK_COOLDOWN_SECONDS = 1.5;
const STRINGS_TOP_X = 47;
const STRINGS_BOTTOM_X = 30;
const STRINGS_REACH = 8;
const RESPAWN_SEARCH_STEP = 8;
const RESPAWN_RIGHT_X = ROOM_W - START_X - PLANE_W;
const RESPAWN_CLEAR_Y = 130;
const RESPAWN_VENT_TOP = 60;
const STAIR_SIDE_INSET = 40;
const STAIR_UP_Y = 50;
const STAIR_UP_Y_WITHOUT_VENT = 104;
const STAIR_DOWN_Y = 322;
const STAIR_ARRIVAL_BOTTOM = 300;
const STAIR_ARRIVAL_TOP = -PLANE_H;
const STAIR_RISE_TO_Y = 150;
const STAIR_COOLDOWN_SECONDS = 2.2;
const DUCT_REACH_Y = 14;

/** Matches the length of the original's startup sound. */
export const FADE_IN_SECONDS = 0.8;

/** How long the shredder takes to pull the plane through, and to finish dropping the strips. */
export const SHRED_FEED_SECONDS = 1;
export const SHRED_SECONDS = 2;
const SHRED_GRIND_SECONDS = 0.1;

/** How long the wrecked plane stays frozen on screen before it vanishes. */
export const CRASH_VISIBLE_SECONDS = 0.2;

const TARGET_BASE_SECONDS = 12;
const TARGET_SECONDS_PER_ITEM = 3;
const TIME_BONUS_PER_SECOND = 10;
const TIME_BONUS_MINIMUM = 50;
const TIME_RESULT_SECONDS = 1.6;

const BUZZ_SECONDS = 0.17;
const GREASE_SPREAD_SPEED = 120;
const GREASE_SURFACE_RAISE = 2;
const GREASE_LANDING_DEPTH = 14;
const GREASE_ACCEL = 500;
const GREASE_BRAKE = 70;
const HAZARD_OFFSET_SECONDS = 0.7;
const BALL_BOUNCE_SECONDS = 2;
const DRIP_FALL_SECONDS = 0.4;
const DRIP_MIN_PERIOD_SECONDS = 1.2;
const LIGHTNING_PERIOD_SECONDS = 7;
const LIGHTNING_SECONDS = 0.45;

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
  on: boolean;
  /** Index of the room this object leads to, or -1. */
  target: number;
}

export interface Room {
  name: string;
  backPict: number;
  tiles: number[];
  leftOpen: boolean;
  rightOpen: boolean;
  enemyKind: number;
  enemyCount: number;
  startsDark: boolean;
  startsAirOff: boolean;
  objects: RoomObject[];
}

export type Phase = "ready" | "fadingIn" | "flying" | "crashing" | "won" | "gameOver";

export type SoundEvent =
  | "clock"
  | "paper"
  | "bonus"
  | "timeBonus"
  | "battery"
  | "bands"
  | "crash"
  | "switch"
  | "powerSwitch"
  | "fan"
  | "shred"
  | "steam"
  | "grease"
  | "burn"
  | "toastUp"
  | "toastDown"
  | "ball"
  | "thunder"
  | "fire"
  | "pop"
  | "balloonPop"
  | "boost"
  | "travel"
  | "mirror"
  | "zap"
  | "drip"
  | "guitar"
  | "startup"
  | "level"
  | "tick"
  | "win";

export interface Input {
  left: boolean;
  right: boolean;
  turbo: boolean;
  fire: boolean;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The points value that floats up from an item after it's grabbed. */
export interface ScorePopup {
  amount: number;
  x: number;
  y: number;
  age: number;
}

/** Whether the player beat a room's target time, shown briefly in the next room. */
export interface TimeResult {
  made: boolean;
  points: number;
  age: number;
}

export interface Enemy {
  kind: number;
  x: number;
  y: number;
  alive: boolean;
}

export interface Shot {
  x: number;
  y: number;
}

/** Everything a crash puts back, so the room reloads the way the player entered it. */
interface RoomEntry {
  x: number;
  y: number;
  score: number;
  energy: number;
  bands: number;
  collected: Set<string>;
}

export interface GameState {
  phase: Phase;
  roomIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Speed left over from a fan, added on top of steering. */
  windVx: number;
  /** The plane faces right unless wind has turned it around. */
  facing: 1 | -1;
  /** Time left in the rotation animation. */
  turnTime: number;
  /** Being carried up from the bottom of a room after taking stairs up. */
  risingFromStairs: boolean;
  /** Time left being thrown by a kettle's blast, which carries on after leaving the steam. */
  steamThrow: number;
  score: number;
  /** What the scoreboard shows; it counts up to `score`. */
  shownScore: number;
  popups: ScorePopup[];
  timeResult: TimeResult | null;
  /** Seconds spent flying in this room. Crashes don't reset it, so they cost time. */
  roomClock: number;
  timedRooms: Set<number>;
  lives: number;
  energy: number;
  boosting: boolean;
  /** On spilled grease, where the plane rides the surface and barely stops. */
  sliding: boolean;
  bands: number;
  collected: Set<string>;
  /** When each knocked-over grease jar went down, so its spill can spread from that moment. */
  greaseTipTimes: Map<string, number>;
  flipped: Set<string>;
  lightsOn: Set<number>;
  airOn: Set<number>;
  /** Which side the plane came into this room from. */
  enteredOnRight: boolean;
  /** Whether it has caught a vent on the far side, which moves its restart point over there. */
  reachedFarSide: boolean;
  /** Only the very first game opens with the plane fading in. */
  opensWithFade: boolean;
  enemies: Enemy[];
  shots: Shot[];
  touching: Set<number>;
  firing: boolean;
  linkCooldown: number;
  entry: RoomEntry;
  crashTime: number;
  /** The shredder eating the plane, if that's how this crash happened. */
  shredder: RoomObject | null;
  fadeTime: number;
  time: number;
  sounds: SoundEvent[];
}

function objectKey(roomIndex: number, objectIndex: number): string {
  return `${roomIndex}:${objectIndex}`;
}

function spawnEnemies(room: Room): Enemy[] {
  const enemies: Enemy[] = [];
  for (let i = 0; i < room.enemyCount; i++) {
    if (room.enemyKind === ENEMY_DART) enemies.push({ kind: ENEMY_DART, x: ROOM_W + 40 + i * 170, y: 70 + i * 70, alive: true });
    if (room.enemyKind === ENEMY_COPTER) enemies.push({ kind: ENEMY_COPTER, x: 330 + i * 110, y: -30 - i * 120, alive: true });
    if (room.enemyKind === ENEMY_BALLOON) enemies.push({ kind: ENEMY_BALLOON, x: 160 + i * 170, y: ROOM_H + i * 130, alive: true });
  }
  return enemies;
}

function saveEntry(s: GameState): void {
  s.entry = { x: s.x, y: s.y, score: s.score, energy: s.energy, bands: s.bands, collected: new Set(s.collected) };
}

function enterRoom(s: GameState, house: Room[], roomIndex: number, x: number, y: number): void {
  s.roomIndex = roomIndex;
  s.x = x;
  s.y = y;
  s.shots = [];
  s.popups = [];
  s.touching = new Set();
  s.enemies = spawnEnemies(house[roomIndex]);
  saveEntry(s);
}

const TIMED_ITEMS: number[] = [OBJECT.clock, OBJECT.paper, OBJECT.battery, OBJECT.bands];

function targetSeconds(room: Room): number {
  const items = room.objects.filter((o) => TIMED_ITEMS.includes(o.type)).length;
  return TARGET_BASE_SECONDS + items * TARGET_SECONDS_PER_ITEM;
}

/** Each room is timed once, on the first way out, so going back and forth can't farm points. */
function scoreRoomTime(s: GameState, room: Room): void {
  if (s.timedRooms.has(s.roomIndex)) return;
  s.timedRooms.add(s.roomIndex);
  const secondsLeft = targetSeconds(room) - s.roomClock;
  const made = secondsLeft > 0;
  const earned = Math.round(secondsLeft) * TIME_BONUS_PER_SECOND;
  const points = made ? Math.max(TIME_BONUS_MINIMUM, earned) : 0;
  s.score += points;
  s.timeResult = { made, points, age: 0 };
  if (made) s.sounds.push("timeBonus");
}

function isOnRightHalf(x: number): boolean {
  return x + PLANE_W / 2 >= ROOM_W / 2;
}

/** Moves to a room as play continues, unlike a crash reload, which stays quiet. */
function changeRoom(s: GameState, house: Room[], roomIndex: number, x: number, y: number): void {
  if (roomIndex !== s.roomIndex) {
    scoreRoomTime(s, house[s.roomIndex]);
    s.roomClock = 0;
    s.sounds.push("level");
    s.enteredOnRight = isOnRightHalf(x);
    s.reachedFarSide = false;
  }
  enterRoom(s, house, roomIndex, x, y);
}

export function createGame(house: Room[], roomIndex = 0, opensWithFade = false): GameState {
  const s: GameState = {
    phase: "ready",
    roomIndex,
    x: START_X,
    y: START_Y,
    vx: 0,
    vy: 0,
    windVx: 0,
    facing: 1,
    turnTime: 0,
    risingFromStairs: false,
    steamThrow: 0,
    score: 0,
    shownScore: 0,
    popups: [],
    timeResult: null,
    roomClock: 0,
    timedRooms: new Set(),
    lives: START_LIVES,
    energy: 0,
    boosting: false,
    sliding: false,
    bands: 0,
    collected: new Set(),
    greaseTipTimes: new Map(),
    flipped: new Set(),
    lightsOn: new Set(),
    airOn: new Set(),
    enteredOnRight: false,
    reachedFarSide: false,
    opensWithFade,
    enemies: [],
    shots: [],
    touching: new Set(),
    firing: false,
    linkCooldown: 0,
    entry: { x: START_X, y: START_Y, score: 0, energy: 0, bands: 0, collected: new Set() },
    crashTime: 0,
    shredder: null,
    fadeTime: 0,
    time: 0,
    sounds: [],
  };
  enterRoom(s, house, roomIndex, START_X, START_Y);
  return s;
}

export function beginFlight(s: GameState): void {
  if (s.phase !== "ready") return;
  if (s.opensWithFade) {
    s.phase = "fadingIn";
    s.fadeTime = 0;
    s.sounds.push("startup");
  } else {
    s.phase = "flying";
    s.sounds.push("level");
  }
}

export function isObjectOn(s: GameState, o: RoomObject, objectIndex: number): boolean {
  return o.on !== s.flipped.has(objectKey(s.roomIndex, objectIndex));
}

export function isCollected(s: GameState, objectIndex: number): boolean {
  return s.collected.has(objectKey(s.roomIndex, objectIndex));
}

/** How far a jar's grease has spread, or null if the jar is still standing. */
export function greaseSpillX(s: GameState, jar: RoomObject, objectIndex: number): number | null {
  const tippedAt = s.greaseTipTimes.get(objectKey(s.roomIndex, objectIndex));
  if (tippedAt === undefined || !isCollected(s, objectIndex)) return null;
  const start = jar.x + jar.w;
  const reach = jar.amount - start;
  return start + Math.min(Math.abs(reach), (s.time - tippedAt) * GREASE_SPREAD_SPEED) * Math.sign(reach);
}

export function isRoomDark(s: GameState, room: Room): boolean {
  return room.startsDark && !s.lightsOn.has(s.roomIndex);
}

export function isAirOff(s: GameState, room: Room): boolean {
  return room.startsAirOff && !s.airOn.has(s.roomIndex);
}

/** Returns progress through an active burst (0 to 1), or null between bursts. */
function burst(time: number, period: number, active: number, offset: number): number | null {
  const t = (time + offset) % period;
  return t < active ? t / active : null;
}

/** Progress through a lightning strike (0 to 1), or null between strikes. */
export function lightningProgress(time: number): number | null {
  return burst(time, LIGHTNING_PERIOD_SECONDS, LIGHTNING_SECONDS, 0);
}

/** A strike is two quick flashes. */
export function isLightningFlash(time: number): boolean {
  const progress = lightningProgress(time);
  if (progress === null) return false;
  return progress < 0.2 || (progress > 0.45 && progress < 0.7);
}

const TICKS_PER_SECOND = 30;

/**
 * Where a moving danger is right now, or null when it isn't out. Objects keep their timing per
 * object so two toasters in a room don't fire in step.
 */
export function movingHazard(o: RoomObject, objectIndex: number, time: number): Rect | null {
  const offset = objectIndex * HAZARD_OFFSET_SECONDS;
  if (o.type === OBJECT.ball) {
    const height = o.y - o.amount;
    const bounce = Math.abs(Math.sin(((time + offset) * Math.PI) / BALL_BOUNCE_SECONDS));
    return { x: o.x, y: o.y - height * bounce, w: o.w, h: o.h };
  }
  if (o.type === OBJECT.toaster || o.type === OBJECT.fishbowl) {
    const progress = burst(time, Math.max(2, o.extra / TICKS_PER_SECOND), 1.4, offset);
    if (progress === null) return null;
    const height = o.y - o.amount;
    return { x: o.x + 4, y: o.y - height * Math.sin(progress * Math.PI), w: 26, h: 26 };
  }
  if (o.type === OBJECT.drip) {
    const period = Math.max(DRIP_MIN_PERIOD_SECONDS, o.extra / (TICKS_PER_SECOND * 2));
    const progress = burst(time, period, DRIP_FALL_SECONDS, offset);
    if (progress === null) return null;
    return { x: o.x + 4, y: o.y + (o.amount - o.y) * progress * progress, w: 7, h: 12 };
  }
  if (o.type === OBJECT.outlet) {
    const progress = burst(time, 1 + o.amount / TICKS_PER_SECOND, 0.8, offset);
    return progress === null ? null : { x: o.x, y: o.y, w: o.w, h: o.h };
  }
  if (o.type === OBJECT.kettle) {
    const progress = burst(time, 1 + o.amount / TICKS_PER_SECOND, 1, offset);
    if (progress === null) return null;
    return { x: o.x - STEAM_REACH_X, y: o.y - STEAM_REACH_Y, w: STEAM_REACH_X + o.w, h: STEAM_REACH_Y + o.h };
  }
  return null;
}

function overlaps(s: GameState, r: Rect): boolean {
  return (
    s.x + HIT_INSET_X < r.x + r.w &&
    s.x + PLANE_W - HIT_INSET_X > r.x &&
    s.y + HIT_INSET_Y < r.y + r.h &&
    s.y + PLANE_H - HIT_INSET_Y > r.y
  );
}

function candleFlame(o: RoomObject): Rect {
  return { x: o.x + o.w / 2 - 7, y: o.y - 8, w: 14, h: o.h + 8 };
}

/** An "on" duct is where planes come out, blowing down to its amount. Others pull planes in. */
export function isExitDuct(o: RoomObject): boolean {
  return o.type === OBJECT.duct && o.on;
}

/** Candle heat reaches the ceiling like a vent's air, unless something above it blocks the way. */
export function airTop(room: Room, source: RoomObject): number {
  if (source.type !== OBJECT.candle) return source.amount;
  const centerX = source.x + source.w / 2;
  const blocked = room.objects.some(
    (o) =>
      SOLID_TYPES.includes(o.type) &&
      o.y < source.y &&
      centerX + COLUMN_REACH > o.x &&
      centerX - COLUMN_REACH < o.x + o.w,
  );
  return blocked ? source.amount : CEILING_AIR_TOP;
}

function verticalAir(s: GameState, room: Room): { rising: boolean; limit: number } | null {
  const centerX = s.x + PLANE_W / 2;
  for (const o of room.objects) {
    const isRising = o.type === OBJECT.ventUp || o.type === OBJECT.candle;
    const isSinking = o.type === OBJECT.ventDown || isExitDuct(o);
    if (!isRising && !isSinking) continue;
    if (Math.abs(centerX - (o.x + o.w / 2)) > COLUMN_REACH) continue;
    if (isRising && s.y <= o.y) return { rising: true, limit: airTop(room, o) };
    if (isSinking && s.y + PLANE_H >= o.y && s.y <= o.amount) return { rising: false, limit: o.amount };
  }
  return null;
}

/** Which way a running fan is blowing the plane: -1 left, 1 right, or 0 outside any stream. */
/** Whether furniture sits right above the plane, so rising air slams it in instead of bouncing. */
function isUnderFurniture(s: GameState, room: Room): boolean {
  return room.objects.some((o) => {
    if (!SOLID_TYPES.includes(o.type)) return false;
    const overlapsSideways = s.x + HIT_INSET_X < o.x + o.w && s.x + PLANE_W - HIT_INSET_X > o.x;
    const gap = s.y - (o.y + o.h);
    return overlapsSideways && gap >= -PLANE_H && gap <= FURNITURE_REACH;
  });
}

/** The height of any spilled grease right under the plane, which it can land and slide on. */
function greaseSurfaceBelow(s: GameState, room: Room): number | null {
  const planeBottom = s.y + PLANE_H - HIT_INSET_Y;
  for (const [index, o] of room.objects.entries()) {
    if (o.type !== OBJECT.grease) continue;
    const spillX = greaseSpillX(s, o, index);
    if (spillX === null) continue;
    const surface = o.y + o.h - GREASE_SURFACE_RAISE;
    // Any part of the plane still on the spill holds it up, so it can roll cleanly off an edge.
    const overSpill =
      s.x + PLANE_W - HIT_INSET_X > Math.min(o.x, spillX) && s.x + HIT_INSET_X < Math.max(o.x + o.w, spillX);
    if (overSpill && planeBottom >= surface && planeBottom <= surface + GREASE_LANDING_DEPTH) return surface;
  }
  return null;
}

function isInSteam(s: GameState, room: Room): boolean {
  return room.objects.some((o, index) => {
    if (o.type !== OBJECT.kettle) return false;
    const steam = movingHazard(o, index, s.time);
    return steam !== null && overlaps(s, steam);
  });
}

function fanWind(s: GameState, room: Room): number {
  let wind = 0;
  room.objects.forEach((o, index) => {
    if ((o.type !== OBJECT.fanLeft && o.type !== OBJECT.fanRight) || !isObjectOn(s, o, index)) return;
    const centerY = s.y + PLANE_H / 2;
    const streamY = o.y + FAN_STREAM_TOP;
    if (centerY < streamY - FAN_STREAM_MARGIN || centerY > streamY + FAN_STREAM_H + FAN_STREAM_MARGIN) return;
    const centerX = s.x + PLANE_W / 2;
    if (o.type === OBJECT.fanRight && centerX >= o.x && centerX <= o.amount) wind = 1;
    if (o.type === OBJECT.fanLeft && centerX <= o.x + o.w && centerX >= o.amount) wind = -1;
  });
  return wind;
}

function turnTo(s: GameState, facing: 1 | -1): void {
  if (s.facing === facing) return;
  s.facing = facing;
  s.turnTime = TURN_DURATION_SECONDS;
}

/** Wind shoves the plane and spins it to face downwind; the shove then carries it onward. */
function applyWind(s: GameState, wind: number, speed: number, dt: number): void {
  s.turnTime = Math.max(0, s.turnTime - dt);
  if (wind !== 0) {
    s.windVx += (wind * speed - s.windVx) * Math.min(1, FAN_RESPONSE * dt);
    turnTo(s, wind > 0 ? 1 : -1);
    return;
  }
  s.windVx = Math.sign(s.windVx) * Math.max(0, Math.abs(s.windVx) - FAN_CARRY_DECAY * dt);
  if (s.windVx === 0) turnTo(s, 1);
}

function steer(s: GameState, input: Input, dt: number): void {
  s.boosting = input.turbo && s.energy > 0;
  if (s.boosting) {
    // Enter alone is enough: the plane shoots forward unless it's being held back.
    s.energy = Math.max(0, s.energy - TURBO_DRAIN_PER_SECOND * dt);
    if (Math.floor(s.time / BOOST_SOUND_SECONDS) !== Math.floor((s.time - dt) / BOOST_SOUND_SECONDS)) {
      s.sounds.push("boost");
    }
    const direction = input.left ? -1 : 1;
    s.vx = Math.max(-TURBO_SPEED, Math.min(TURBO_SPEED, s.vx + direction * ACCEL * dt));
    return;
  }
  const direction = Number(input.right) - Number(input.left);
  const brake = s.sliding ? GREASE_BRAKE : BRAKE;
  if (direction !== 0) {
    const limit = Math.max(MAX_SPEED, Math.abs(s.vx) - brake * dt);
    const accel = s.sliding ? GREASE_ACCEL : ACCEL;
    s.vx = Math.max(-limit, Math.min(limit, s.vx + direction * accel * dt));
    return;
  }
  const slowed = Math.max(0, Math.abs(s.vx) - brake * dt);
  s.vx = Math.sign(s.vx) * slowed;
}

function startCrash(s: GameState, sound: SoundEvent = "crash"): void {
  s.phase = "crashing";
  s.boosting = false;
  s.sliding = false;
  s.crashTime = 0;
  s.sounds.push(sound);
}

const SOLID_TYPES: number[] = [
  OBJECT.table,
  OBJECT.shelf,
  OBJECT.books,
  OBJECT.cabinet,
  OBJECT.computer,
  OBJECT.toaster,
  OBJECT.fishbowl,
  OBJECT.wastebasket,
];
const VERTICAL_DANGER_TYPES: number[] = [OBJECT.ball, OBJECT.toaster, OBJECT.fishbowl, OBJECT.drip, OBJECT.shredder];

/** Whether a plane dropped in at the top of the room here is safe and stays in this room. */
function isSafeAtTop(room: Room, x: number): boolean {
  const left = x + HIT_INSET_X;
  const right = x + PLANE_W - HIT_INSET_X;
  const center = x + PLANE_W / 2;
  return room.objects.every((o) => {
    const overColumn = left < o.x + o.w && right > o.x;
    if (!overColumn) return true;
    if (SOLID_TYPES.includes(o.type)) return o.y > RESPAWN_CLEAR_Y;
    if (VERTICAL_DANGER_TYPES.includes(o.type) || o.type === OBJECT.ventDown || o.type === OBJECT.portal) return false;
    if (o.type === OBJECT.duct) return center < o.x || center > o.x + o.w;
    if (o.type === OBJECT.stairsUp) return center <= o.x + STAIR_SIDE_INSET || center >= o.x + o.w - STAIR_SIDE_INSET;
    return true;
  });
}

/**
 * Picks a spot along the ceiling on the half of the room the plane died in: over a full-height
 * vent if there is one, else open air. It only crosses over if that half has no safe spot at all.
 */
function respawnX(room: Room, preferredX: number): number {
  const closest = (spots: number[]): number | undefined =>
    spots.sort((a, b) => Math.abs(a - preferredX) - Math.abs(b - preferredX))[0];
  const ventSpots = room.objects
    .filter((o) => o.type === OBJECT.ventUp && o.amount <= RESPAWN_VENT_TOP)
    .map((o) => o.x + o.w / 2 - PLANE_W / 2)
    .filter((x) => isSafeAtTop(room, x));
  const openSpots: number[] = [];
  for (let x = MIN_X; x < MAX_X; x += RESPAWN_SEARCH_STEP) {
    if (isSafeAtTop(room, x)) openSpots.push(x);
  }
  const onPreferredHalf = (x: number): boolean => x + PLANE_W / 2 >= ROOM_W / 2 === preferredX + PLANE_W / 2 >= ROOM_W / 2;
  return (
    closest(ventSpots.filter(onPreferredHalf)) ??
    closest(openSpots.filter(onPreferredHalf)) ??
    closest(ventSpots) ??
    closest(openSpots) ??
    START_X
  );
}

function startShredding(s: GameState, shredder: RoomObject): void {
  startCrash(s, "shred");
  s.shredder = shredder;
  s.x = shredder.x + shredder.w / 2 - PLANE_W / 2;
  s.y = shredder.y - PLANE_H;
}

function respawn(s: GameState, house: Room[]): void {
  s.shredder = null;
  s.lives -= 1;
  if (s.lives === 0) {
    s.phase = "gameOver";
    return;
  }
  // The room reloads the way the player entered it, so its items and their points come back,
  // but the plane restarts along the ceiling, on the side it last made it to.
  const { score, energy, bands, collected } = s.entry;
  const restartOnRight = s.reachedFarSide ? !s.enteredOnRight : s.enteredOnRight;
  const preferredX = restartOnRight ? RESPAWN_RIGHT_X : START_X;
  s.phase = "flying";
  s.vx = 0;
  s.vy = 0;
  s.windVx = 0;
  s.facing = 1;
  s.turnTime = 0;
  s.steamThrow = 0;
  s.risingFromStairs = false;
  s.score = score;
  s.shownScore = Math.min(s.shownScore, score);
  s.energy = energy;
  s.bands = bands;
  s.collected = new Set(collected);
  s.linkCooldown = LINK_COOLDOWN_SECONDS;
  enterRoom(s, house, s.roomIndex, respawnX(house[s.roomIndex], preferredX), START_Y);
}

function takeItem(s: GameState, o: RoomObject, index: number): void {
  s.collected.add(objectKey(s.roomIndex, index));
  if (o.type === OBJECT.battery) {
    s.energy += o.amount;
    s.sounds.push("battery");
  } else if (o.type === OBJECT.bands) {
    s.bands += o.amount;
    s.sounds.push("bands");
  } else {
    s.score += o.amount;
    s.popups.push({ amount: o.amount, x: o.x + o.w / 2, y: o.y, age: 0 });
    if (o.type === OBJECT.paper) s.lives += 1;
    s.sounds.push(o.type === OBJECT.clock ? "clock" : o.type === OBJECT.paper ? "paper" : "bonus");
  }
}

function pressSwitch(s: GameState, room: Room, o: RoomObject): void {
  if (o.type === OBJECT.lightSwitch) {
    if (s.lightsOn.has(s.roomIndex)) s.lightsOn.delete(s.roomIndex);
    else s.lightsOn.add(s.roomIndex);
  } else if (o.type === OBJECT.thermostat) {
    if (s.airOn.has(s.roomIndex)) {
      s.airOn.delete(s.roomIndex);
    } else {
      s.airOn.add(s.roomIndex);
      s.sounds.push("fan");
      return;
    }
  } else {
    // A power switch's amount is the 1-based position of the object it controls in the room.
    const controlled = room.objects[o.amount - 1];
    if (controlled) {
      const key = objectKey(s.roomIndex, o.amount - 1);
      if (s.flipped.has(key)) s.flipped.delete(key);
      else s.flipped.add(key);
      const isFan = controlled.type === OBJECT.fanLeft || controlled.type === OBJECT.fanRight;
      if (isFan && isObjectOn(s, controlled, o.amount - 1)) {
        s.sounds.push("fan");
        return;
      }
    }
  }
  s.sounds.push(o.type === OBJECT.powerSwitch ? "powerSwitch" : "switch");
}

function travel(s: GameState, house: Room[], roomIndex: number, x: number, y: number, sound: SoundEvent | null = "travel"): void {
  s.linkCooldown = LINK_COOLDOWN_SECONDS;
  s.vx = 0;
  s.vy = 0;
  if (sound) s.sounds.push(sound);
  changeRoom(s, house, roomIndex, x, y);
}

function takeStairs(s: GameState, house: Room[], o: RoomObject): void {
  const arrivalType = o.type === OBJECT.stairsUp ? OBJECT.stairsDown : OBJECT.stairsUp;
  const destination = house[o.target];
  const arrival = destination.objects.find((other) => other.type === arrivalType && other.target === s.roomIndex);
  const x = arrival ? arrival.x + arrival.w / 2 - PLANE_W / 2 : START_X;
  const goingUp = o.type === OBJECT.stairsUp;
  travel(s, house, o.target, x, goingUp ? STAIR_ARRIVAL_BOTTOM : STAIR_ARRIVAL_TOP, null);
  s.linkCooldown = STAIR_COOLDOWN_SECONDS;
  s.risingFromStairs = goingUp;
  s.vy = goingUp ? -LIFT_SPEED : FALL_SPEED;
}

function takeDuct(s: GameState, house: Room[], o: RoomObject): void {
  const exit = house[o.target].objects.find(isExitDuct);
  if (exit) travel(s, house, o.target, exit.x + exit.w / 2 - PLANE_W / 2, exit.y + exit.h);
  else travel(s, house, o.target, START_X, START_Y);
}

/** Where stairs lift the plane away. Without a vent to ride, gliding in can't get as high. */
function stairsUpLine(room: Room, stairs: RoomObject): number {
  const hasVent = room.objects.some(
    (o) => o.type === OBJECT.ventUp && o.x + o.w > stairs.x && o.x < stairs.x + stairs.w,
  );
  return hasVent ? STAIR_UP_Y : STAIR_UP_Y_WITHOUT_VENT;
}

function checkLinks(s: GameState, house: Room[], room: Room): boolean {
  if (s.linkCooldown > 0) return false;
  const centerX = s.x + PLANE_W / 2;
  for (const o of room.objects) {
    const insideStairs = centerX > o.x + STAIR_SIDE_INSET && centerX < o.x + o.w - STAIR_SIDE_INSET;
    if (o.type === OBJECT.stairsUp && insideStairs && s.y < stairsUpLine(room, o)) {
      takeStairs(s, house, o);
      return true;
    }
    if (o.type === OBJECT.stairsDown && insideStairs && s.y + PLANE_H > STAIR_DOWN_Y) {
      takeStairs(s, house, o);
      return true;
    }
    if (o.type === OBJECT.duct && !o.on && house[o.target]) {
      const underDuct = centerX >= o.x && centerX <= o.x + o.w;
      if (underDuct && s.y <= o.y + o.h + DUCT_REACH_Y) {
        takeDuct(s, house, o);
        return true;
      }
    }
    if (o.type === OBJECT.portal && overlaps(s, o)) {
      if (o.target < 0) {
        s.phase = "won";
        s.sounds.push("win");
      } else {
        travel(s, house, o.target, START_X, START_Y, "mirror");
      }
      return true;
    }
  }
  return false;
}

/** The strings run down the neck at a slant, so the strum follows that line, not the outline. */
function isOverStrings(s: GameState, guitar: RoomObject): boolean {
  const along = (s.y + PLANE_H / 2 - guitar.y) / guitar.h;
  const stringsX = guitar.x + STRINGS_TOP_X + (STRINGS_BOTTOM_X - STRINGS_TOP_X) * along;
  return Math.abs(s.x + PLANE_W / 2 - stringsX) <= STRINGS_REACH;
}

function checkObjects(s: GameState, room: Room): void {
  const touchingNow = new Set<number>();
  room.objects.forEach((o, index) => {
    if (s.phase !== "flying") return;
    const moving = movingHazard(o, index, s.time);
    // A kettle's blast only throws the plane around; it's whatever that hits that does the damage.
    if (moving && o.type !== OBJECT.kettle && overlaps(s, moving)) {
      startCrash(s);
      return;
    }
    if (!overlaps(s, o)) return;
    if (SOLID_TYPES.includes(o.type)) {
      startCrash(s);
      return;
    }
    switch (o.type) {
      case OBJECT.shredder:
        // Switched off, it's just a box the plane can pass.
        if (isObjectOn(s, o, index)) startShredding(s, o);
        break;
      case OBJECT.candle:
        if (overlaps(s, candleFlame(o))) startCrash(s, "burn");
        break;
      case OBJECT.clock:
      case OBJECT.paper:
      case OBJECT.hiddenBonus:
      case OBJECT.battery:
      case OBJECT.bands:
        if (!isCollected(s, index)) takeItem(s, o, index);
        break;
      case OBJECT.grease:
        if (!isCollected(s, index)) {
          s.collected.add(objectKey(s.roomIndex, index));
          s.greaseTipTimes.set(objectKey(s.roomIndex, index), s.time);
          s.sounds.push("grease");
        }
        break;
      case OBJECT.guitar:
        if (!isOverStrings(s, o)) break;
        touchingNow.add(index);
        if (!s.touching.has(index)) s.sounds.push("guitar");
        break;
      case OBJECT.lightSwitch:
      case OBJECT.thermostat:
      case OBJECT.powerSwitch:
        touchingNow.add(index);
        if (!s.touching.has(index)) pressSwitch(s, room, o);
        break;
    }
  });
  s.touching = touchingNow;
}

export function enemyRect(e: Enemy): Rect {
  return e.kind === ENEMY_DART ? { x: e.x + 4, y: e.y + 4, w: 54, h: 11 } : { x: e.x, y: e.y, w: 25, h: 29 };
}

function moveEnemies(s: GameState, dt: number): void {
  for (const e of s.enemies) {
    if (e.kind === ENEMY_DART) {
      e.x -= 130 * dt;
      e.y += 12 * dt;
      if (e.x < -80) {
        e.x = ROOM_W + 60;
        e.y = 60 + ((e.y * 7) % 170);
      }
    } else if (e.kind === ENEMY_COPTER) {
      e.x -= 35 * dt;
      e.y += 50 * dt;
      if (e.y > ROOM_H) {
        e.y = -40;
        e.x = 200 + ((e.x * 7) % 280);
      }
    } else {
      e.y -= 40 * dt;
      if (e.y < -40) {
        e.y = ROOM_H + 20;
        e.x = 100 + ((e.x * 7) % 320);
      }
    }
    if (e.alive && overlaps(s, enemyRect(e)) && s.phase === "flying") startCrash(s);
  }
}

function moveShots(s: GameState, dt: number): void {
  for (const shot of s.shots) {
    shot.x += SHOT_SPEED * dt;
    for (const e of s.enemies) {
      const r = enemyRect(e);
      if (e.alive && shot.x > r.x && shot.x < r.x + r.w && shot.y > r.y && shot.y < r.y + r.h) {
        e.alive = false;
        shot.x = ROOM_W * 2;
        s.sounds.push(e.kind === ENEMY_BALLOON ? "balloonPop" : "pop");
        if (e.kind === ENEMY_DART) {
          s.score += DART_POINTS;
          s.popups.push({ amount: DART_POINTS, x: r.x + r.w / 2, y: r.y, age: 0 });
        }
      }
    }
  }
  s.shots = s.shots.filter((shot) => shot.x < ROOM_W);
}

function fireBand(s: GameState, input: Input): void {
  if (input.fire && !s.firing && s.bands > 0) {
    s.bands -= 1;
    s.shots.push({ x: s.x + PLANE_W, y: s.y + PLANE_H / 2 });
    s.sounds.push("fire");
  }
  s.firing = input.fire;
}

function soundBursts(s: GameState, room: Room, dt: number): void {
  room.objects.forEach((o, index) => {
    if (o.type === OBJECT.ball) {
      const offset = index * HAZARD_OFFSET_SECONDS;
      const landed = Math.floor((s.time + offset) / BALL_BOUNCE_SECONDS);
      if (landed !== Math.floor((s.time - dt + offset) / BALL_BOUNCE_SECONDS)) s.sounds.push("ball");
      return;
    }
    if (o.type === OBJECT.outlet) {
      // The buzz clip is short, so it repeats for as long as the sparks last.
      const newBuzz = Math.floor(s.time / BUZZ_SECONDS) !== Math.floor((s.time - dt) / BUZZ_SECONDS);
      if (newBuzz && movingHazard(o, index, s.time)) s.sounds.push("zap");
      return;
    }
    if (o.type === OBJECT.toaster) {
      const out = movingHazard(o, index, s.time) !== null;
      const wasOut = movingHazard(o, index, s.time - dt) !== null;
      if (out && !wasOut) s.sounds.push("toastUp");
      if (wasOut && !out) s.sounds.push("toastDown");
      return;
    }
    if (o.type !== OBJECT.drip && o.type !== OBJECT.kettle && o.type !== OBJECT.fishbowl) return;
    if (!movingHazard(o, index, s.time) || movingHazard(o, index, s.time - dt)) return;
    s.sounds.push(o.type === OBJECT.kettle ? "steam" : "drip");
  });
  const hasWindow = room.objects.some((o) => o.type === OBJECT.window);
  if (hasWindow && lightningProgress(s.time) !== null && lightningProgress(s.time - dt) === null) {
    s.sounds.push("thunder");
  }
}

function changeRoomAtEdges(s: GameState, house: Room[], room: Room): boolean {
  const next = house[s.roomIndex + 1];
  const previous = house[s.roomIndex - 1];
  if (s.x < MIN_X && (!room.leftOpen || !previous)) {
    s.x = MIN_X;
    s.vx = 0;
  }
  if (s.x > MAX_X && (!room.rightOpen || !next)) {
    s.x = MAX_X;
    s.vx = 0;
  }
  if (s.x > MAX_X) {
    changeRoom(s, house, s.roomIndex + 1, LEFT_EXIT_X + 2, s.y);
    return true;
  }
  if (s.x < LEFT_EXIT_X) {
    changeRoom(s, house, s.roomIndex - 1, MAX_X - 2, s.y);
    return true;
  }
  return false;
}

function fly(s: GameState, house: Room[], input: Input, dt: number): void {
  const room = house[s.roomIndex];
  s.roomClock += dt;
  s.linkCooldown = Math.max(0, s.linkCooldown - dt);
  steer(s, input, dt);
  fireBand(s, input);

  const air = isAirOff(s, room) ? null : verticalAir(s, room);
  const blockedAbove = air?.rising === true && isUnderFurniture(s, room);
  // Catching a vent across the room is the checkpoint: falling over there doesn't count.
  if (air?.rising && isOnRightHalf(s.x) !== s.enteredOnRight) s.reachedFarSide = true;
  if (isInSteam(s, room)) s.steamThrow = STEAM_THROW_SECONDS;
  const steamed = s.steamThrow > 0;
  s.steamThrow = Math.max(0, s.steamThrow - dt);
  const wind = steamed ? STEAM_DIRECTION : fanWind(s, room);
  applyWind(s, wind, steamed ? STEAM_PUSH_SPEED : FAN_SPEED, dt);
  let targetVy = wind !== 0 ? FAN_FLOAT_SPEED : FALL_SPEED;
  if (air?.rising && (s.y > air.limit || blockedAbove)) targetVy = -LIFT_SPEED;
  if (air && !air.rising) targetVy = DOWNDRAFT_SPEED;
  if (s.risingFromStairs) {
    targetVy = -LIFT_SPEED;
    if (s.y <= STAIR_RISE_TO_Y) s.risingFromStairs = false;
  }
  if (steamed) targetVy = -STEAM_LIFT_SPEED;
  const response = steamed || (air && !air.rising) ? DOWNDRAFT_RESPONSE : LIFT_RESPONSE;
  s.vy += (targetVy - s.vy) * Math.min(1, response * dt);

  s.x += (s.vx + s.windVx) * dt;
  s.y += s.vy * dt;

  // Rising air slams the plane into the ceiling, so it bounces off and gets pushed back up.
  if (air?.rising && s.y <= air.limit && s.vy < 0 && !blockedAbove) {
    s.y = air.limit;
    s.vy = CEILING_BOUNCE;
  }

  const greaseSurface = s.vy >= 0 ? greaseSurfaceBelow(s, room) : null;
  if (s.sliding && greaseSurface === null) {
    // Skidding off the edge keeps the slide's speed, coasting out over the drop.
    s.windVx += s.vx;
    s.vx = 0;
  }
  s.sliding = greaseSurface !== null;
  if (greaseSurface !== null) {
    s.y = greaseSurface - PLANE_H + HIT_INSET_Y;
    s.vy = 0;
  }

  if (changeRoomAtEdges(s, house, room)) return;

  if (s.y + PLANE_H >= FLOOR_Y) {
    startCrash(s);
    return;
  }
  if (checkLinks(s, house, room)) return;
  checkObjects(s, room);
  soundBursts(s, room, dt);
  moveEnemies(s, dt);
  moveShots(s, dt);
}

/** The scoreboard counts in whole tens, so it reads as a ticker rather than a blur of digits. */
export function shownScoreTens(s: GameState): number {
  return Math.floor(s.shownScore / 10) * 10;
}

function updateScoreDisplay(s: GameState, dt: number): void {
  const shownBefore = shownScoreTens(s);
  s.shownScore = Math.min(s.score, s.shownScore + SCORE_TICKER_PER_SECOND * dt);
  if (shownScoreTens(s) > shownBefore) s.sounds.push("tick");
  for (const popup of s.popups) {
    popup.age += dt;
    popup.y -= POPUP_RISE_PER_SECOND * dt;
  }
  s.popups = s.popups.filter((popup) => popup.age < POPUP_SECONDS);
  if (s.timeResult) {
    s.timeResult.age += dt;
    if (s.timeResult.age >= TIME_RESULT_SECONDS) s.timeResult = null;
  }
}

export function step(s: GameState, house: Room[], input: Input, dt: number): void {
  s.time += dt;
  updateScoreDisplay(s, dt);
  if (s.phase === "fadingIn") {
    s.fadeTime += dt;
    if (s.fadeTime >= FADE_IN_SECONDS) s.phase = "flying";
  } else if (s.phase === "flying") {
    fly(s, house, input, dt);
  } else if (s.phase === "crashing") {
    const before = s.crashTime;
    s.crashTime += dt;
    if (s.shredder && s.crashTime < SHRED_FEED_SECONDS) {
      const grinds = Math.floor(s.crashTime / SHRED_GRIND_SECONDS) !== Math.floor(before / SHRED_GRIND_SECONDS);
      if (grinds) s.sounds.push("shred");
    }
    if (s.crashTime >= (s.shredder ? SHRED_SECONDS : CRASH_SECONDS)) respawn(s, house);
  }
}
