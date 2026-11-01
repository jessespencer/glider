import type { PixelFont } from "./pixelFont";
import {
  CRASH_VISIBLE_SECONDS,
  airTop,
  ENEMY_BALLOON,
  ENEMY_COPTER,
  FADE_IN_SECONDS,
  FAN_STREAM_H,
  FAN_STREAM_TOP,
  OBJECT,
  PLANE_H,
  SHRED_FEED_SECONDS,
  PLANE_W,
  ROOM_H,
  ROOM_W,
  TURN_DURATION_SECONDS,
  greaseSpillX,
  isAirOff,
  isCollected,
  isExitDuct,
  isObjectOn,
  isRoomDark,
  isLightningFlash,
  movingHazard,
  shownScoreTens,
} from "./sim";
import type { GameState, Rect, Room, RoomObject } from "./sim";

// Positions on the original sprite sheet. The plane always faces right; the second frame is the
// same plane tilted back, which is how it flies backward.
const PLANE_LEFT: Rect = { x: 2, y: 45, w: 44, h: 16 };
const PLANE_LEFT_TILTED_BACK: Rect = { x: 2, y: 64, w: 43, h: 18 };
/** The plane rotating from facing right, through head-on, to facing left. */
const PLANE_TURN: Rect[] = [
  { x: 219, y: 3, w: 41, h: 15 },
  { x: 219, y: 24, w: 42, h: 15 },
  { x: 223, y: 45, w: 34, h: 15 },
  { x: 220, y: 66, w: 41, h: 14 },
  { x: 223, y: 87, w: 34, h: 15 },
  { x: 219, y: 108, w: 42, h: 15 },
];
export const PLANE_FORWARD: Rect = { x: 2, y: 3, w: 44, h: 16 };
const PLANE_TILTED_BACK: Rect = { x: 1, y: 22, w: 46, h: 18 };
const PLANE_ICON: Rect = { x: 1, y: 319, w: 33, h: 13 };
const ROOM_NUMBER_PAPER: Rect = { x: 37, y: 319, w: 16, h: 21 };
const ROOM_NUMBER_PAPER_BACK: Rect = { x: 55, y: 319, w: 16, h: 21 };
const BAND_FRAMES: Rect[] = [
  { x: 199, y: 163, w: 16, h: 7 },
  { x: 199, y: 171, w: 16, h: 7 },
];
const BAND_OLIVE_RED = 128;
const BAND_PINK = [255, 96, 192, 255];
const BAND_FRAMES_PER_SECOND = 12;
const BAND_ICON: Rect = { x: 38, y: 302, w: 5, h: 13 };
const BATTERY_ICON: Rect = { x: 47, y: 302, w: 7, h: 13 };
const VENT: Rect = { x: 1, y: 84, w: 47, h: 12 };
const VENT_CEILING: Rect = { x: 1, y: 97, w: 46, h: 13 };
const DUCT: Rect = { x: 1, y: 111, w: 47, h: 13 };
const TABLE_BASE: Rect = { x: 50, y: 24, w: 61, h: 20 };
const FLAME_FRAMES: Rect[] = [
  { x: 152, y: 192, w: 7, h: 9 },
  { x: 152, y: 206, w: 7, h: 8 },
];
const SPARK_FRAMES: Rect[] = [
  { x: 168, y: 290, w: 26, h: 24 },
  { x: 171, y: 316, w: 20, h: 24 },
];
const TOAST_FRAMES: Rect[] = [
  { x: 316, y: 87, w: 27, h: 27 },
  { x: 315, y: 117, w: 30, h: 29 },
  { x: 317, y: 149, w: 28, h: 27 },
  { x: 317, y: 183, w: 27, h: 27 },
];
const FISH_FRAMES: Rect[] = [
  { x: 148, y: 109, w: 14, h: 16 },
  { x: 147, y: 127, w: 16, h: 14 },
  { x: 148, y: 143, w: 14, h: 16 },
  { x: 147, y: 161, w: 16, h: 14 },
];
const GREASE_TIPPED: Rect = { x: 117, y: 211, w: 28, h: 17 };
const SHREDDED_PAPER: Rect = { x: 267, y: 173, w: 42, h: 33 };
const DROP: Rect = { x: 203, y: 57, w: 7, h: 12 };
const COPTER_FRAMES: Rect[] = [
  { x: 167, y: 2, w: 30, h: 29 },
  { x: 171, y: 34, w: 22, h: 30 },
  { x: 177, y: 67, w: 11, h: 30 },
  { x: 171, y: 100, w: 22, h: 30 },
];
export const DART: Rect = { x: 49, y: 2, w: 62, h: 19 };
const BALLOON: Rect = { x: 118, y: 230, w: 25, h: 30 };
const PAINTING: Rect = { x: 409, y: 55, w: 101, h: 92 };

export const CLOCK_SPRITE: Rect = { x: 117, y: 1, w: 27, h: 28 };

/** Objects drawn as one sprite sitting on the bottom of their room rectangle. */
const OBJECT_SPRITES: Record<number, Rect> = {
  [OBJECT.books]: { x: 49, y: 72, w: 62, h: 53 },
  [OBJECT.candle]: { x: 115, y: 31, w: 29, h: 20 },
  [OBJECT.fanLeft]: { x: 1, y: 207, w: 33, h: 54 },
  [OBJECT.fanRight]: { x: 1, y: 263, w: 33, h: 54 },
  [OBJECT.clock]: CLOCK_SPRITE,
  [OBJECT.paper]: { x: 1, y: 126, w: 46, h: 20 },
  [OBJECT.grease]: { x: 115, y: 140, w: 17, h: 28 },
  [OBJECT.battery]: { x: 148, y: 56, w: 13, h: 24 },
  [OBJECT.bands]: { x: 117, y: 53, w: 23, h: 22 },
  [OBJECT.lightSwitch]: { x: 148, y: 1, w: 15, h: 24 },
  [OBJECT.outlet]: { x: 173, y: 264, w: 16, h: 24 },
  [OBJECT.thermostat]: { x: 148, y: 28, w: 15, h: 24 },
  [OBJECT.shredder]: { x: 49, y: 47, w: 62, h: 22 },
  [OBJECT.powerSwitch]: { x: 147, y: 83, w: 16, h: 24 },
  [OBJECT.guitar]: { x: 49, y: 129, w: 60, h: 168 },
  [OBJECT.toaster]: { x: 1, y: 148, w: 36, h: 26 },
  [OBJECT.fishbowl]: { x: 115, y: 110, w: 30, h: 28 },
  [OBJECT.kettle]: { x: 1, y: 176, w: 39, h: 29 },
  [OBJECT.wastebasket]: { x: 447, y: 270, w: 62, h: 71 },
  [OBJECT.computer]: { x: 266, y: 210, w: 43, h: 57 },
};
const ITEMS: number[] = [OBJECT.clock, OBJECT.paper, OBJECT.battery, OBJECT.bands];

const TILE_W = 64;
const PANEL_W = 64;
const FRAME_W = ROOM_W + PANEL_W * 2;
const FLOOR_SHADOW_Y = 332;
const TABLE_BASE_TOP = 317;

const AIR_W = 16;
const AIR_TILE = 8;
const AIR_STEP_PIXELS = 2;
const AIR_STEPS_PER_SECOND = 12;
const FADE_IN_STEPS = 6;
const STEAM_CLOUD_X = 26;
const STEAM_CLOUD_Y = 26;
const WOOD_ORANGE = "#f08848";
const WOOD_BROWN = "#7a4a22";
const CABINET_TOP_H = 7;
const CABINET_OVERHANG = 2;
const CABINET_SHADOW = 14;
const CABINET_KICK_H = 5;
const CABINET_DOOR_W = 64;
const CABINET_DOOR_INSET = 8;
const CABINET_DOOR_GAP = 11;
const SHELF_SHADOW = 13;
const SHELF_BRACKET_INSET = 18;
const SHELF_BRACKET_W = 8;
const SHELF_BRACKET_H = 26;
const GREASE_DEPTH = 2;
const GREASE_COLOR = "#5a6b1e";
const SHRED_SLOT_DEPTH = 4;
const SHRED_FALL_SPEED = 90;
const WINDOW_FRAME = "#7a4a22";
const WINDOW_FRAME_LIGHT = "#d08040";
const WINDOW_BEVEL = "#909090";
const LIGHTNING_SKY = "#9fb4e8";
const WINDOW_SHADOW = 4;
const WINDOW_INSET = 12;
const WINDOW_RAIL = 10;
const WINDOW_TRIM_H = 7;
const BOOST_SHAKE = [-2, 1, 2, -1, 0, 2, -2];
const BOOST_SHAKE_PER_SECOND = 30;
const MIRROR_FRAME = 4;
const MIRROR_PLANE_X = -24;
const MIRROR_PLANE_Y = -10;
const MIRROR_PLANE_ALPHA = 0.5;

// The plane's floor shadow, measured from the original game in room pixels.
const PLANE_SHADOW_Y = 326;
const PLANE_SHADOW_W = 41;
const PLANE_SHADOW_H = 14;
const PLANE_SHADOW_TIP_ROW = 3;
const PLANE_SHADOW_LEFT_SLOPE = 1;
const PLANE_SHADOW_RIGHT_SLOPE = 2.5;
const PLANE_SHADOW_ALPHA = 0.5;

const DARK_ALPHA = 0.965;
const DARK_LIGHTNING_ALPHA = 0.35;
const CANDLE_LIGHT_RADIUS = 46;
const CANDLE_FLAME_H = 8;

// Scoreboard layout, measured from the original game in room pixels.
const HUD_NAME: Rect = { x: 3, y: 3, w: 159, h: 21 };
const HUD_SCORE: Rect = { x: 220, y: 3, w: 78, h: 21 };
const HUD_LIVES: Rect = { x: 302, y: 3, w: 208, h: 21 };
const HUD_PAPER_BORDER: Rect = { x: 165, y: 2, w: 18, h: 23 };
// Capitals and digits fill rows 3 to 12 of the font, so this centers them in the panels.
const HUD_TEXT_Y = 6;
const HUD_TEXT_INSET = 6;
const HUD_PAPER_SPACING = 19;
const HUD_ENERGY_ICON_X = 332;
const HUD_BANDS_ICON_X = 370;
const HUD_ITEM_GAP = 3;
const HUD_PANEL_CENTER_Y = 13;
const HUD_LIVES_TEXT_RIGHT = 391;
const HUD_LIVES_TEXT_MINIMUM = 3;
const HUD_ICON_X = 397;
const HUD_ICON_Y = 7;
const HUD_ICON_SPACING = 37;
const HUD_MAX_ICONS = 3;
const RED = "#ff0000";
const CYAN = "#00ffff";
const WHITE = "#ffffff";
const BLACK = "#000000";
const YELLOW = "#ffff00";
const GREEN = "#00ff00";

const TIME_RESULT_Y = 107;
const TIME_RESULT_H = 22;
const TIME_RESULT_PADDING = 12;
const TIME_RESULT_BLINK_SECONDS = 0.6;
const TIME_RESULT_BLINKS_PER_SECOND = 8;

const MESSAGE_BOX: Rect = { x: 106, y: 96, w: 300, h: 62 };

export interface Art {
  sprites: HTMLImageElement;
  spritesOpaque: HTMLImageElement;
  titleScene: HTMLImageElement;
  backgrounds: Map<number, HTMLImageElement>;
  stairsUp: HTMLImageElement;
  stairsDown: HTMLImageElement;
  airUp: HTMLImageElement;
  airSide: HTMLImageElement;
  panelLeft: HTMLImageElement;
  panelRight: HTMLImageElement;
  font: PixelFont;
  smallFont: PixelFont;
}

export interface View {
  scale: number;
  /** Room top-left corner in logical pixels. */
  offsetX: number;
  offsetY: number;
}

/**
 * Fills as much of the window as a clean zoom allows. Each room pixel covers a whole number of
 * device pixels, so the dithered art stays crisp: on a Retina screen that gives half steps.
 */
export function computeView(width: number, height: number, ratio: number): View {
  const fit = Math.min(width / FRAME_W, height / ROOM_H);
  const deviceScale = Math.floor(fit * ratio);
  const scale = deviceScale >= 1 ? deviceScale / ratio : fit;
  return {
    scale,
    offsetX: Math.round(((width - ROOM_W * scale) / 2) * ratio) / ratio,
    offsetY: Math.round(((height - ROOM_H * scale) / 2) * ratio) / ratio,
  };
}

export function drawSprite(ctx: CanvasRenderingContext2D, art: Art, r: Rect, x: number, y: number): void {
  ctx.drawImage(art.sprites, r.x, r.y, r.w, r.h, Math.round(x), Math.round(y), r.w, r.h);
}

function drawFrame(ctx: CanvasRenderingContext2D, art: Art): void {
  ctx.drawImage(art.panelLeft, -PANEL_W, 0);
  ctx.drawImage(art.panelRight, ROOM_W, 0);
}

function drawBackground(ctx: CanvasRenderingContext2D, art: Art, room: Room): void {
  const image = art.backgrounds.get(room.backPict);
  if (!image) return;
  room.tiles.forEach((tile, column) => {
    ctx.drawImage(image, tile * TILE_W, 0, TILE_W, ROOM_H, column * TILE_W, 0, TILE_W, ROOM_H);
  });
}

function drawAirColumn(ctx: CanvasRenderingContext2D, art: Art, centerX: number, top: number, bottom: number, time: number, direction: 1 | -1): void {
  const left = centerX - AIR_W / 2;
  const rise = (Math.floor(time * AIR_STEPS_PER_SECOND) * AIR_STEP_PIXELS) % AIR_TILE;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, AIR_W, bottom - top);
  ctx.clip();
  for (let y = top - AIR_TILE + (direction > 0 ? AIR_TILE - rise : rise); y < bottom; y += AIR_TILE) {
    for (let x = left; x < left + AIR_W; x += AIR_TILE) {
      ctx.drawImage(art.airUp, x, y);
    }
  }
  ctx.restore();
}

let cachedDither: CanvasPattern | null = null;

/** Every other pixel black, the way the original shades without any transparency. */
function ditherShadow(ctx: CanvasRenderingContext2D): CanvasPattern {
  if (cachedDither) return cachedDither;
  const tile = document.createElement("canvas");
  tile.width = 2;
  tile.height = 2;
  const tileCtx = tile.getContext("2d")!;
  tileCtx.fillStyle = BLACK;
  tileCtx.fillRect(0, 0, 1, 1);
  tileCtx.fillRect(1, 1, 1, 1);
  cachedDither = ctx.createPattern(tile, "repeat")!;
  return cachedDither;
}

function woodSlab(ctx: CanvasRenderingContext2D, r: Rect): void {
  ctx.fillStyle = BLACK;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = WOOD_ORANGE;
  ctx.fillRect(r.x + 1, r.y + 1, r.w - 2, r.h - 3);
}

function drawCabinet(ctx: CanvasRenderingContext2D, o: RoomObject): void {
  ctx.fillStyle = ditherShadow(ctx);
  ctx.beginPath();
  ctx.moveTo(o.x, o.y + CABINET_TOP_H);
  ctx.lineTo(o.x - CABINET_SHADOW, o.y + CABINET_TOP_H + CABINET_SHADOW);
  ctx.lineTo(o.x - CABINET_SHADOW, o.y + o.h - CABINET_SHADOW);
  ctx.lineTo(o.x, o.y + o.h);
  ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.fillStyle = WOOD_BROWN;
  ctx.fillRect(o.x + 1, o.y + CABINET_TOP_H, o.w - 2, o.h - CABINET_TOP_H - CABINET_KICK_H);
  woodSlab(ctx, { x: o.x - CABINET_OVERHANG, y: o.y, w: o.w + CABINET_OVERHANG * 2, h: CABINET_TOP_H });

  const doors = Math.max(1, Math.round(o.w / CABINET_DOOR_W));
  const pitch = (o.w - CABINET_DOOR_INSET * 2 + CABINET_DOOR_GAP) / doors;
  const doorW = Math.round(pitch - CABINET_DOOR_GAP);
  const doorH = o.h - CABINET_TOP_H - CABINET_KICK_H - CABINET_DOOR_INSET * 2 + 2;
  if (doorW < 6 || doorH < 6) return;
  ctx.strokeStyle = WOOD_ORANGE;
  ctx.lineWidth = 1;
  for (let i = 0; i < doors; i++) {
    const x = Math.round(o.x + CABINET_DOOR_INSET + i * pitch);
    ctx.strokeRect(x + 0.5, o.y + CABINET_TOP_H + CABINET_DOOR_INSET - 1.5, doorW - 1, doorH - 1);
  }
}

function drawShelf(ctx: CanvasRenderingContext2D, o: RoomObject): void {
  ctx.fillStyle = ditherShadow(ctx);
  ctx.beginPath();
  ctx.moveTo(o.x, o.y + o.h);
  ctx.lineTo(o.x + o.w, o.y + o.h);
  ctx.lineTo(o.x + o.w - SHELF_SHADOW, o.y + o.h + SHELF_SHADOW);
  ctx.lineTo(o.x - SHELF_SHADOW, o.y + o.h + SHELF_SHADOW);
  ctx.fill();

  for (const x of [o.x + SHELF_BRACKET_INSET, o.x + o.w - SHELF_BRACKET_INSET - SHELF_BRACKET_W]) {
    ctx.fillStyle = BLACK;
    ctx.fillRect(x, o.y + o.h, SHELF_BRACKET_W, SHELF_BRACKET_H);
    ctx.fillStyle = "#8a6a4a";
    ctx.fillRect(x + 1, o.y + o.h, SHELF_BRACKET_W - 2, SHELF_BRACKET_H - 2);
  }
  woodSlab(ctx, o);
}

function drawTable(ctx: CanvasRenderingContext2D, art: Art, table: RoomObject): void {
  const centerX = table.x + table.w / 2;
  ctx.fillStyle = "rgba(0, 0, 50, 0.5)";
  ctx.beginPath();
  ctx.ellipse(centerX, FLOOR_SHADOW_Y, table.w / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b8b8b0";
  ctx.fillRect(centerX - 2, table.y + table.h, 4, TABLE_BASE_TOP - table.y - table.h);
  ctx.fillStyle = "#101010";
  ctx.fillRect(centerX - 2, table.y + table.h, 1, TABLE_BASE_TOP - table.y - table.h);
  drawSprite(ctx, art, TABLE_BASE, centerX - TABLE_BASE.w / 2, TABLE_BASE_TOP);

  ctx.fillStyle = "#7a4a22";
  ctx.fillRect(table.x, table.y, table.w, table.h);
  ctx.fillStyle = "#a9713c";
  ctx.fillRect(table.x, table.y, table.w, 2);
  ctx.fillStyle = "#3c220e";
  ctx.fillRect(table.x, table.y + table.h - 2, table.w, 2);
}

function drawLightning(ctx: CanvasRenderingContext2D, pane: Rect): void {
  ctx.fillStyle = LIGHTNING_SKY;
  ctx.fillRect(pane.x, pane.y, pane.w, pane.h);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pane.x + pane.w * 0.62, pane.y);
  ctx.lineTo(pane.x + pane.w * 0.46, pane.y + pane.h * 0.42);
  ctx.lineTo(pane.x + pane.w * 0.58, pane.y + pane.h * 0.5);
  ctx.lineTo(pane.x + pane.w * 0.4, pane.y + pane.h);
  ctx.stroke();
}

function drawPane(ctx: CanvasRenderingContext2D, pane: Rect, time: number): void {
  ctx.fillStyle = WINDOW_FRAME_LIGHT;
  ctx.fillRect(pane.x - 6, pane.y - 6, pane.w + 12, pane.h + 12);
  ctx.fillStyle = WINDOW_FRAME;
  ctx.fillRect(pane.x - 5, pane.y - 5, pane.w + 10, pane.h + 10);
  ctx.fillStyle = WINDOW_BEVEL;
  ctx.fillRect(pane.x - 3, pane.y - 3, pane.w + 6, pane.h + 6);
  ctx.fillStyle = WINDOW_FRAME_LIGHT;
  ctx.fillRect(pane.x - 2, pane.y - 2, pane.w + 4, pane.h + 4);
  ctx.fillStyle = BLACK;
  ctx.fillRect(pane.x, pane.y, pane.w, pane.h);

  if (!isLightningFlash(time)) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(pane.x, pane.y, pane.w, pane.h);
  ctx.clip();
  drawLightning(ctx, pane);
  ctx.restore();
}

/** A double-hung wood window, like the original's, looking out on a stormy night. */
function drawWindow(ctx: CanvasRenderingContext2D, o: RoomObject, time: number): void {
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(o.x - WINDOW_SHADOW, o.y + WINDOW_SHADOW, o.w, o.h);

  ctx.fillStyle = BLACK;
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.fillStyle = WINDOW_FRAME;
  ctx.fillRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);

  const paneW = o.w - WINDOW_INSET * 2;
  const paneH = Math.floor((o.h - WINDOW_INSET * 2 - WINDOW_RAIL) / 2);
  drawPane(ctx, { x: o.x + WINDOW_INSET, y: o.y + WINDOW_INSET, w: paneW, h: paneH }, time);
  drawPane(ctx, { x: o.x + WINDOW_INSET, y: o.y + WINDOW_INSET + paneH + WINDOW_RAIL, w: paneW, h: paneH }, time);
  ctx.fillStyle = BLACK;
  ctx.fillRect(o.x + 1, o.y + WINDOW_INSET + paneH + WINDOW_RAIL / 2, o.w - 2, 1);

  for (const y of [o.y - 3, o.y + o.h - 3]) {
    ctx.fillStyle = BLACK;
    ctx.fillRect(o.x - 5, y, o.w + 10, WINDOW_TRIM_H);
    ctx.fillStyle = WINDOW_FRAME;
    ctx.fillRect(o.x - 4, y + 1, o.w + 8, WINDOW_TRIM_H - 2);
    ctx.fillStyle = WINDOW_FRAME_LIGHT;
    ctx.fillRect(o.x - 4, y + 1, o.w + 8, 1);
  }
}

function drawMirror(ctx: CanvasRenderingContext2D, art: Art, s: GameState, o: RoomObject): void {
  ctx.fillStyle = BLACK;
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.fillStyle = "#7a4a22";
  ctx.fillRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
  ctx.fillStyle = BLACK;
  ctx.fillRect(o.x + MIRROR_FRAME - 1, o.y + MIRROR_FRAME - 1, o.w - (MIRROR_FRAME - 1) * 2, o.h - (MIRROR_FRAME - 1) * 2);
  ctx.fillStyle = WHITE;
  ctx.fillRect(o.x + MIRROR_FRAME, o.y + MIRROR_FRAME, o.w - MIRROR_FRAME * 2, o.h - MIRROR_FRAME * 2);

  if (!isPlaneVisible(s)) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(o.x + MIRROR_FRAME, o.y + MIRROR_FRAME, o.w - MIRROR_FRAME * 2, o.h - MIRROR_FRAME * 2);
  ctx.clip();
  ctx.globalAlpha = fadeInAlpha(s) * MIRROR_PLANE_ALPHA;
  drawSprite(ctx, art, planeFrame(s), s.x + MIRROR_PLANE_X, s.y + MIRROR_PLANE_Y);
  ctx.restore();
}

/** Centers a sprite on its room rectangle and sits it on the rectangle's bottom edge. */
function drawOnRect(ctx: CanvasRenderingContext2D, art: Art, sprite: Rect, o: Rect): void {
  drawSprite(ctx, art, sprite, o.x + (o.w - sprite.w) / 2, o.y + o.h - sprite.h);
}

function drawGreaseSpill(ctx: CanvasRenderingContext2D, art: Art, jar: RoomObject, spillX: number): void {
  const bottom = jar.y + jar.h;
  const start = jar.x + jar.w / 2;
  ctx.fillStyle = BLACK;
  ctx.fillRect(Math.min(start, spillX), bottom - GREASE_DEPTH - 1, Math.abs(spillX - start), GREASE_DEPTH + 1);
  ctx.fillStyle = GREASE_COLOR;
  ctx.fillRect(Math.min(start, spillX), bottom - GREASE_DEPTH, Math.abs(spillX - start), GREASE_DEPTH);
  drawOnRect(ctx, art, GREASE_TIPPED, jar);
}

function frameAt(frames: Rect[], time: number, perSecond: number): Rect {
  return frames[Math.floor(time * perSecond) % frames.length];
}

function drawMovingHazard(ctx: CanvasRenderingContext2D, art: Art, o: RoomObject, index: number, time: number): void {
  const hazard = movingHazard(o, index, time);
  if (!hazard) return;
  if (o.type === OBJECT.ball) {
    drawSprite(ctx, art, { x: 115, y: 77, w: 30, h: 30 }, hazard.x + 1, hazard.y + 1);
  } else if (o.type === OBJECT.toaster) {
    drawSprite(ctx, art, frameAt(TOAST_FRAMES, time, 8), hazard.x, hazard.y);
  } else if (o.type === OBJECT.fishbowl) {
    drawSprite(ctx, art, frameAt(FISH_FRAMES, time, 8), hazard.x + 5, hazard.y + 5);
  } else if (o.type === OBJECT.drip) {
    drawSprite(ctx, art, DROP, hazard.x, hazard.y);
  } else if (o.type === OBJECT.outlet) {
    drawOnRect(ctx, art, frameAt(SPARK_FRAMES, time, 12), hazard);
  } else if (o.type === OBJECT.kettle) {
    ctx.fillStyle = "rgba(240, 240, 240, 0.8)";
    ctx.beginPath();
    ctx.ellipse(hazard.x + STEAM_CLOUD_X, hazard.y + STEAM_CLOUD_Y, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObject(ctx: CanvasRenderingContext2D, art: Art, s: GameState, o: RoomObject, index: number): void {
  if (ITEMS.includes(o.type) && isCollected(s, index)) return;

  switch (o.type) {
    case OBJECT.table:
      drawTable(ctx, art, o);
      return;
    case OBJECT.shelf:
      drawShelf(ctx, o);
      return;
    case OBJECT.cabinet:
      drawCabinet(ctx, o);
      return;
    case OBJECT.window:
      drawWindow(ctx, o, s.time);
      return;
    case OBJECT.mirror:
      drawMirror(ctx, art, s, o);
      return;
    case OBJECT.painting:
      ctx.drawImage(art.spritesOpaque, PAINTING.x, PAINTING.y, PAINTING.w, PAINTING.h, o.x, o.y, PAINTING.w, PAINTING.h);
      return;
    case OBJECT.grease: {
      const spillX = greaseSpillX(s, o, index);
      if (spillX === null) break;
      drawGreaseSpill(ctx, art, o, spillX);
      return;
    }
    case OBJECT.stairsUp:
      ctx.drawImage(art.stairsUp, o.x, o.y);
      return;
    case OBJECT.stairsDown:
      ctx.drawImage(art.stairsDown, o.x, o.y);
      return;
    case OBJECT.ventUp:
      drawSprite(ctx, art, VENT, o.x, o.y);
      return;
    case OBJECT.ventDown:
      drawSprite(ctx, art, VENT_CEILING, o.x, o.y);
      return;
    case OBJECT.duct:
      drawSprite(ctx, art, DUCT, o.x, o.y);
      return;
    case OBJECT.candle:
      drawOnRect(ctx, art, OBJECT_SPRITES[o.type], o);
      drawSprite(ctx, art, frameAt(FLAME_FRAMES, s.time, 8), o.x + o.w / 2 - 3, o.y - CANDLE_FLAME_H);
      return;
  }

  const sprite = OBJECT_SPRITES[o.type];
  if (sprite) drawOnRect(ctx, art, sprite, o);
  drawMovingHazard(ctx, art, o, index, s.time);
}

function drawFanStream(ctx: CanvasRenderingContext2D, art: Art, left: number, right: number, top: number, time: number, direction: 1 | -1): void {
  const drift = (Math.floor(time * AIR_STEPS_PER_SECOND) * AIR_STEP_PIXELS * direction) % AIR_TILE;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, right - left, FAN_STREAM_H);
  ctx.clip();
  for (let x = left - AIR_TILE * 2 + drift; x < right + AIR_TILE; x += AIR_TILE) {
    for (let y = top; y < top + FAN_STREAM_H; y += AIR_TILE) {
      ctx.drawImage(art.airSide, x, y);
    }
  }
  ctx.restore();
}

/** Air runs in front of everything in the room, so paintings and furniture never hide it. */
function drawAir(ctx: CanvasRenderingContext2D, art: Art, room: Room, s: GameState): void {
  room.objects.forEach((o, index) => {
    if (o.type !== OBJECT.fanLeft && o.type !== OBJECT.fanRight) return;
    if (!isObjectOn(s, o, index)) return;
    const blowsRight = o.type === OBJECT.fanRight;
    const left = blowsRight ? o.x + o.w : o.amount;
    const right = blowsRight ? o.amount : o.x;
    drawFanStream(ctx, art, left, right, o.y + FAN_STREAM_TOP, s.time, blowsRight ? 1 : -1);
  });
  if (isAirOff(s, room)) return;
  for (const o of room.objects) {
    const centerX = o.x + o.w / 2;
    if (o.type === OBJECT.ventUp) drawAirColumn(ctx, art, centerX, o.amount, o.y, s.time, 1);
    if (o.type === OBJECT.candle) drawAirColumn(ctx, art, centerX, airTop(room, o), o.y - CANDLE_FLAME_H, s.time, 1);
    if (o.type === OBJECT.ventDown || isExitDuct(o)) drawAirColumn(ctx, art, centerX, o.y + o.h / 2, o.amount, s.time, -1);
  }
}

let cachedBandFrames: HTMLCanvasElement[] = [];

/** The sheet's bands are olive, so they're recolored once to the pink of a real rubber band. */
function bandFrames(art: Art): HTMLCanvasElement[] {
  if (cachedBandFrames.length > 0) return cachedBandFrames;
  cachedBandFrames = BAND_FRAMES.map((r) => {
    const frame = document.createElement("canvas");
    frame.width = r.w;
    frame.height = r.h;
    const ctx = frame.getContext("2d")!;
    ctx.drawImage(art.sprites, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    const image = ctx.getImageData(0, 0, r.w, r.h);
    for (let i = 0; i < image.data.length; i += 4) {
      if (image.data[i] === BAND_OLIVE_RED) image.data.set(BAND_PINK, i);
    }
    ctx.putImageData(image, 0, 0);
    return frame;
  });
  return cachedBandFrames;
}

function drawEnemies(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  for (const e of s.enemies) {
    if (!e.alive) continue;
    if (e.kind === ENEMY_BALLOON) drawSprite(ctx, art, BALLOON, e.x, e.y);
    else if (e.kind === ENEMY_COPTER) drawSprite(ctx, art, frameAt(COPTER_FRAMES, s.time, 10), e.x, e.y);
    else drawSprite(ctx, art, DART, e.x, e.y);
  }
  const frames = bandFrames(art);
  for (const shot of s.shots) {
    const frame = frames[Math.floor(s.time * BAND_FRAMES_PER_SECOND) % frames.length];
    ctx.drawImage(frame, Math.round(shot.x), Math.round(shot.y - frame.height / 2));
  }
}

function drawDarkness(ctx: CanvasRenderingContext2D, room: Room, time: number): void {
  const lit = isLightningFlash(time) && room.objects.some((o) => o.type === OBJECT.window);
  ctx.fillStyle = `rgba(0, 0, 0, ${lit ? DARK_LIGHTNING_ALPHA : DARK_ALPHA})`;
  ctx.beginPath();
  ctx.rect(0, 0, ROOM_W, ROOM_H);
  for (const o of room.objects) {
    if (o.type !== OBJECT.candle) continue;
    ctx.moveTo(o.x + o.w / 2 + CANDLE_LIGHT_RADIUS, o.y);
    ctx.arc(o.x + o.w / 2, o.y, CANDLE_LIGHT_RADIUS, 0, Math.PI * 2);
  }
  ctx.fill("evenodd");
}

function planeFrame(s: GameState): Rect {
  if (s.turnTime > 0) {
    const turned = 1 - s.turnTime / TURN_DURATION_SECONDS;
    const step = Math.min(PLANE_TURN.length - 1, Math.floor(turned * PLANE_TURN.length));
    return PLANE_TURN[s.facing < 0 ? step : PLANE_TURN.length - 1 - step];
  }
  if (s.facing < 0) return s.vx > 0 ? PLANE_LEFT_TILTED_BACK : PLANE_LEFT;
  return s.vx < 0 ? PLANE_TILTED_BACK : PLANE_FORWARD;
}

/** The one thing that stays lit in a dark room, so the way out of the dark can be found. */
function drawLightSwitches(ctx: CanvasRenderingContext2D, art: Art, room: Room): void {
  for (const o of room.objects) {
    if (o.type === OBJECT.lightSwitch) drawOnRect(ctx, art, OBJECT_SPRITES[o.type], o);
  }
}

function isPlaneVisible(s: GameState): boolean {
  if (s.phase === "gameOver" || s.phase === "won") return false;
  if (s.phase === "crashing" && s.crashTime >= CRASH_VISIBLE_SECONDS) return false;
  return !(s.phase === "ready" && s.opensWithFade);
}

function fadeInAlpha(s: GameState): number {
  if (s.phase !== "fadingIn") return 1;
  const steps = Math.ceil((s.fadeTime / FADE_IN_SECONDS) * FADE_IN_STEPS);
  return Math.min(1, steps / FADE_IN_STEPS);
}

/** The original's triangle, softened and drawn row by row so its edges stay stepped. */
function drawPlaneShadow(ctx: CanvasRenderingContext2D, s: GameState): void {
  if (!isPlaneVisible(s)) return;
  const x = Math.round(s.x);
  ctx.save();
  ctx.globalAlpha = fadeInAlpha(s) * PLANE_SHADOW_ALPHA;
  ctx.fillStyle = BLACK;
  for (let row = 0; row < PLANE_SHADOW_H; row++) {
    const left = Math.round(row * PLANE_SHADOW_LEFT_SLOPE);
    const right =
      row < PLANE_SHADOW_TIP_ROW
        ? Math.round(((row + 1) / PLANE_SHADOW_TIP_ROW) * PLANE_SHADOW_W)
        : Math.round(PLANE_SHADOW_W - (row - PLANE_SHADOW_TIP_ROW) * PLANE_SHADOW_RIGHT_SLOPE);
    ctx.fillRect(x + left, PLANE_SHADOW_Y + row, right - left, 1);
  }
  ctx.restore();
}

/** A fast, uneven rattle while the battery is burning. */
function boostShake(s: GameState): [number, number] {
  if (!s.boosting) return [0, 0];
  const tick = Math.floor(s.time * BOOST_SHAKE_PER_SECOND);
  return [BOOST_SHAKE[tick % BOOST_SHAKE.length], BOOST_SHAKE[(tick * 3 + 1) % BOOST_SHAKE.length]];
}

function drawPlane(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  if (!isPlaneVisible(s)) return;

  // Snap to whole room pixels, like the original, instead of gliding between them.
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  ctx.save();
  ctx.globalAlpha = fadeInAlpha(s);
  const frame = planeFrame(s);
  const [shakeX, shakeY] = boostShake(s);
  drawSprite(ctx, art, frame, x + shakeX + (PLANE_W - frame.w) / 2, y + shakeY + (PLANE_H - frame.h) / 2);
  ctx.restore();
}

/** The plane sinks into the slot on top while its shredded strips come out the bottom and fall. */
function drawShredding(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  const o = s.shredder;
  if (!o) return;
  const fed = Math.min(1, s.crashTime / SHRED_FEED_SECONDS);

  if (fed < 1) {
    const shake = BOOST_SHAKE[Math.floor(s.time * BOOST_SHAKE_PER_SECOND) % BOOST_SHAKE.length];
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ROOM_W, o.y + SHRED_SLOT_DEPTH);
    ctx.clip();
    drawSprite(ctx, art, PLANE_FORWARD, s.x + shake, o.y - PLANE_H + fed * (PLANE_H + SHRED_SLOT_DEPTH));
    ctx.restore();
  }

  const bottom = o.y + o.h;
  const falling = Math.max(0, s.crashTime - SHRED_FEED_SECONDS);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, bottom, ROOM_W, ROOM_H - bottom);
  ctx.clip();
  ctx.globalAlpha = Math.max(0, 1 - falling);
  const x = o.x + (o.w - SHREDDED_PAPER.w) / 2;
  drawSprite(ctx, art, SHREDDED_PAPER, x, bottom - SHREDDED_PAPER.h + fed * SHREDDED_PAPER.h + falling * SHRED_FALL_SPEED);
  ctx.restore();
}

function drawPopups(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  for (const popup of s.popups) {
    const text = String(popup.amount);
    const x = Math.round(popup.x - art.smallFont.measure(text) / 2);
    art.smallFont.draw(ctx, text, x, Math.round(popup.y), RED);
  }
}

function drawPanel(ctx: CanvasRenderingContext2D, r: Rect): void {
  ctx.fillStyle = BLACK;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = WHITE;
  ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, 1);
  ctx.fillRect(r.x + 2, r.y + r.h - 3, r.w - 4, 1);
  ctx.fillRect(r.x + 2, r.y + 2, 1, r.h - 4);
  ctx.fillRect(r.x + r.w - 3, r.y + 2, 1, r.h - 4);
}

/** Each digit gets its own notebook page, with the binding holes meeting in the middle. */
function drawRoomNumber(ctx: CanvasRenderingContext2D, art: Art, roomNumber: number): void {
  [...String(roomNumber)].forEach((digit, index) => {
    const x = HUD_PAPER_BORDER.x + index * HUD_PAPER_SPACING;
    const { y, w, h } = HUD_PAPER_BORDER;
    ctx.fillStyle = BLACK;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = WHITE;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    drawSprite(ctx, art, index === 0 ? ROOM_NUMBER_PAPER : ROOM_NUMBER_PAPER_BACK, x + 1, y + 1);
    art.font.draw(ctx, digit, x + (index === 0 ? 5 : 8), HUD_TEXT_Y, BLACK);
  });
}

/** A count sitting right up against its icon, both centered in the scoreboard panel. */
function drawHudItem(ctx: CanvasRenderingContext2D, art: Art, count: string, color: string, icon: Rect, iconX: number): void {
  const textX = iconX - HUD_ITEM_GAP - art.font.measure(count);
  art.font.draw(ctx, count, textX, HUD_TEXT_Y, color);
  drawSprite(ctx, art, icon, iconX, HUD_PANEL_CENTER_Y - Math.floor(icon.h / 2));
}

function drawHud(ctx: CanvasRenderingContext2D, art: Art, s: GameState, room: Room): void {
  const { font } = art;
  drawPanel(ctx, HUD_NAME);
  font.draw(ctx, room.name, HUD_NAME.x + HUD_TEXT_INSET, HUD_TEXT_Y, RED);

  drawRoomNumber(ctx, art, s.roomIndex + 1);

  drawPanel(ctx, HUD_SCORE);
  font.draw(ctx, String(shownScoreTens(s)), HUD_SCORE.x + HUD_TEXT_INSET, HUD_TEXT_Y, CYAN);

  drawPanel(ctx, HUD_LIVES);
  if (s.lives >= HUD_LIVES_TEXT_MINIMUM) {
    const lives = String(s.lives);
    font.draw(ctx, lives, HUD_LIVES_TEXT_RIGHT - font.measure(lives), HUD_TEXT_Y, RED);
  }
  if (s.energy > 0) drawHudItem(ctx, art, String(Math.ceil(s.energy)), YELLOW, BATTERY_ICON, HUD_ENERGY_ICON_X);
  if (s.bands > 0) drawHudItem(ctx, art, String(s.bands), GREEN, BAND_ICON, HUD_BANDS_ICON_X);
  const icons = Math.min(HUD_MAX_ICONS, s.lives);
  for (let i = 0; i < icons; i++) {
    // Lives are lost from the left, so the remaining icons stay at the panel's right end.
    drawSprite(ctx, art, PLANE_ICON, HUD_ICON_X + (HUD_MAX_ICONS - icons + i) * HUD_ICON_SPACING, HUD_ICON_Y);
  }
}

/** A small box that blinks at the start, then holds, so it's noticed without covering the room. */
function drawTimeResult(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  const result = s.timeResult;
  if (!result) return;
  const blinking = result.age < TIME_RESULT_BLINK_SECONDS;
  if (blinking && Math.floor(result.age * TIME_RESULT_BLINKS_PER_SECOND) % 2 === 1) return;

  const text = `Time Bonus = ${result.points}`;
  const w = art.font.measure(text) + TIME_RESULT_PADDING * 2;
  const box: Rect = { x: Math.round((ROOM_W - w) / 2), y: TIME_RESULT_Y, w, h: TIME_RESULT_H };
  drawPanel(ctx, box);
  art.font.draw(ctx, text, box.x + TIME_RESULT_PADDING, box.y + 3, YELLOW);
}

function drawMessage(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  const messages: Partial<Record<GameState["phase"], [string, string]>> = {
    ready: ["Press an arrow key to fly", "F: fullscreen   R: restart"],
    won: [`You made it out!  Score: ${s.score}`, "Press R to fly it again"],
    gameOver: [`Game over.  Score: ${s.score}`, "Press R to try again"],
  };
  const message = messages[s.phase];
  if (!message) return;

  drawPanel(ctx, MESSAGE_BOX);
  const centerX = MESSAGE_BOX.x + MESSAGE_BOX.w / 2;
  message.forEach((line, index) => {
    const x = Math.round(centerX - art.font.measure(line) / 2);
    art.font.draw(ctx, line, x, MESSAGE_BOX.y + 12 + index * 20, index === 0 ? CYAN : WHITE);
  });
}

export function render(
  ctx: CanvasRenderingContext2D,
  art: Art,
  house: Room[],
  s: GameState,
  view: View,
  ratio: number,
): void {
  const { width, height } = ctx.canvas;
  const room = house[s.roomIndex];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, width, height);

  const scale = view.scale * ratio;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(scale, 0, 0, scale, view.offsetX * ratio, view.offsetY * ratio);
  drawFrame(ctx, art);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, ROOM_W, ROOM_H);
  ctx.clip();
  drawBackground(ctx, art, room);
  room.objects.forEach((o, index) => drawObject(ctx, art, s, o, index));
  drawAir(ctx, art, room, s);
  drawEnemies(ctx, art, s);
  drawPlaneShadow(ctx, s);
  if (isRoomDark(s, room)) {
    drawDarkness(ctx, room, s.time);
    drawLightSwitches(ctx, art, room);
  }
  drawPlane(ctx, art, s);
  drawShredding(ctx, art, s);
  drawPopups(ctx, art, s);
  drawHud(ctx, art, s, room);
  drawTimeResult(ctx, art, s);
  drawMessage(ctx, art, s);
  ctx.restore();
}
