import type { PixelFont } from "./pixelFont";
import {
  CRASH_VISIBLE_SECONDS,
  ENEMY_BALLOON,
  ENEMY_COPTER,
  FADE_IN_SECONDS,
  OBJECT,
  PLANE_H,
  PLANE_W,
  ROOM_H,
  ROOM_W,
  isAirOff,
  isCollected,
  isRoomDark,
  movingHazard,
  shownScoreTens,
} from "./sim";
import type { GameState, Rect, Room, RoomObject } from "./sim";

// Positions on the original sprite sheet. The plane always faces right; the second frame is the
// same plane tilted back, which is how it flies backward.
const PLANE_FORWARD: Rect = { x: 2, y: 3, w: 44, h: 16 };
const PLANE_TILTED_BACK: Rect = { x: 1, y: 22, w: 46, h: 18 };
const PLANE_ICON: Rect = { x: 1, y: 319, w: 33, h: 13 };
const ROOM_NUMBER_PAPER: Rect = { x: 37, y: 319, w: 16, h: 21 };
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
const DROP: Rect = { x: 203, y: 57, w: 7, h: 12 };
const COPTER_FRAMES: Rect[] = [
  { x: 167, y: 2, w: 30, h: 29 },
  { x: 171, y: 34, w: 22, h: 30 },
  { x: 177, y: 67, w: 11, h: 30 },
  { x: 171, y: 100, w: 22, h: 30 },
];
const DART_FRAMES: Rect[] = [
  { x: 265, y: 0, w: 43, h: 11 },
  { x: 265, y: 12, w: 43, h: 11 },
];
const BALLOON: Rect = { x: 118, y: 230, w: 25, h: 30 };
const PAINTING: Rect = { x: 409, y: 55, w: 101, h: 92 };

/** Objects drawn as one sprite sitting on the bottom of their room rectangle. */
const OBJECT_SPRITES: Record<number, Rect> = {
  [OBJECT.books]: { x: 49, y: 72, w: 62, h: 53 },
  [OBJECT.candle]: { x: 115, y: 31, w: 29, h: 20 },
  [OBJECT.fanLeft]: { x: 1, y: 207, w: 33, h: 54 },
  [OBJECT.fanRight]: { x: 1, y: 263, w: 33, h: 54 },
  [OBJECT.clock]: { x: 117, y: 1, w: 27, h: 28 },
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
const ITEMS: number[] = [OBJECT.clock, OBJECT.paper, OBJECT.grease, OBJECT.battery, OBJECT.bands];

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
const DARK_ALPHA = 0.93;
const CANDLE_LIGHT_RADIUS = 46;

// Scoreboard layout, measured from the original game in room pixels.
const HUD_NAME: Rect = { x: 3, y: 3, w: 159, h: 21 };
const HUD_SCORE: Rect = { x: 220, y: 3, w: 78, h: 21 };
const HUD_LIVES: Rect = { x: 302, y: 3, w: 208, h: 21 };
const HUD_PAPER_BORDER: Rect = { x: 165, y: 2, w: 18, h: 23 };
const HUD_TEXT_Y = 7;
const HUD_TEXT_INSET = 6;
const HUD_ITEMS_X = 311;
const HUD_LIVES_TEXT_RIGHT = 391;
const HUD_ICON_X = 397;
const HUD_ICON_Y = 7;
const HUD_ICON_SPACING = 37;
const HUD_MAX_ICONS = 3;
const RED = "#ff0000";
const CYAN = "#00ffff";
const WHITE = "#ffffff";
const BLACK = "#000000";

const MESSAGE_BOX: Rect = { x: 106, y: 96, w: 300, h: 62 };

export interface Art {
  sprites: HTMLImageElement;
  spritesOpaque: HTMLImageElement;
  backgrounds: Map<number, HTMLImageElement>;
  stairsUp: HTMLImageElement;
  stairsDown: HTMLImageElement;
  airUp: HTMLImageElement;
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

/** Uses the largest whole-number zoom that fits, which keeps the retro window small and crisp. */
export function computeView(width: number, height: number): View {
  const fit = Math.min(width / FRAME_W, height / ROOM_H);
  const scale = fit >= 1 ? Math.floor(fit) : fit;
  return {
    scale,
    offsetX: Math.round((width - ROOM_W * scale) / 2),
    offsetY: Math.round((height - ROOM_H * scale) / 2),
  };
}

function drawSprite(ctx: CanvasRenderingContext2D, art: Art, r: Rect, x: number, y: number): void {
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

function woodBlock(ctx: CanvasRenderingContext2D, o: Rect): void {
  ctx.fillStyle = BLACK;
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.fillStyle = "#7a4a22";
  ctx.fillRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
  ctx.fillStyle = "#a9713c";
  ctx.fillRect(o.x + 1, o.y + 1, o.w - 2, 2);
}

function drawCabinet(ctx: CanvasRenderingContext2D, o: RoomObject): void {
  woodBlock(ctx, o);
  const doors = Math.max(1, Math.round(o.w / 64));
  const doorW = (o.w - 8) / doors;
  ctx.fillStyle = "#3c220e";
  for (let i = 0; i < doors; i++) {
    const x = Math.round(o.x + 4 + i * doorW);
    ctx.strokeStyle = "#3c220e";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2.5, o.y + 7.5, Math.round(doorW) - 5, o.h - 13);
  }
}

function drawShelf(ctx: CanvasRenderingContext2D, o: RoomObject): void {
  woodBlock(ctx, o);
  ctx.fillStyle = "#3c220e";
  ctx.fillRect(o.x + 10, o.y + o.h, 3, 7);
  ctx.fillRect(o.x + o.w - 13, o.y + o.h, 3, 7);
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

function drawWindow(ctx: CanvasRenderingContext2D, o: RoomObject): void {
  ctx.fillStyle = "#101010";
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.fillStyle = "#88c8ff";
  ctx.fillRect(o.x + 6, o.y + 6, o.w - 12, o.h - 12);
  ctx.fillStyle = "#e8e8e0";
  ctx.fillRect(o.x + o.w / 2 - 2, o.y + 6, 4, o.h - 12);
  ctx.fillRect(o.x + 6, o.y + o.h / 2 - 2, o.w - 12, 4);
}

function drawMirror(ctx: CanvasRenderingContext2D, o: RoomObject): void {
  ctx.fillStyle = "#3c220e";
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.fillStyle = "#b8d8d8";
  ctx.fillRect(o.x + 5, o.y + 5, o.w - 10, o.h - 10);
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillRect(o.x + 16, o.y + 5, 12, o.h - 10);
}

/** Centers a sprite on its room rectangle and sits it on the rectangle's bottom edge. */
function drawOnRect(ctx: CanvasRenderingContext2D, art: Art, sprite: Rect, o: Rect): void {
  drawSprite(ctx, art, sprite, o.x + (o.w - sprite.w) / 2, o.y + o.h - sprite.h);
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
    ctx.ellipse(hazard.x + 22, hazard.y + 13, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObject(ctx: CanvasRenderingContext2D, art: Art, room: Room, s: GameState, o: RoomObject, index: number): void {
  const airOff = isAirOff(s, room);
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
      drawWindow(ctx, o);
      return;
    case OBJECT.mirror:
      drawMirror(ctx, o);
      return;
    case OBJECT.painting:
      ctx.drawImage(art.spritesOpaque, PAINTING.x, PAINTING.y, PAINTING.w, PAINTING.h, o.x, o.y, PAINTING.w, PAINTING.h);
      return;
    case OBJECT.stairsUp:
      ctx.drawImage(art.stairsUp, o.x, o.y);
      return;
    case OBJECT.stairsDown:
      ctx.drawImage(art.stairsDown, o.x, o.y);
      return;
    case OBJECT.ventUp:
      drawSprite(ctx, art, VENT, o.x, o.y);
      if (!airOff) drawAirColumn(ctx, art, o.x + o.w / 2, o.amount, o.y, s.time, 1);
      return;
    case OBJECT.ventDown:
      drawSprite(ctx, art, VENT_CEILING, o.x, o.y);
      if (!airOff) drawAirColumn(ctx, art, o.x + o.w / 2, o.y + o.h, o.amount, s.time, -1);
      return;
    case OBJECT.duct:
      drawSprite(ctx, art, DUCT, o.x, o.y);
      if (o.on && !airOff) drawAirColumn(ctx, art, o.x + o.w / 2, o.y + o.h, o.amount, s.time, -1);
      return;
    case OBJECT.candle:
      drawOnRect(ctx, art, OBJECT_SPRITES[o.type], o);
      drawSprite(ctx, art, frameAt(FLAME_FRAMES, s.time, 8), o.x + o.w / 2 - 3, o.y - 8);
      return;
  }

  const sprite = OBJECT_SPRITES[o.type];
  if (sprite) drawOnRect(ctx, art, sprite, o);
  drawMovingHazard(ctx, art, o, index, s.time);
}

function drawEnemies(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  for (const e of s.enemies) {
    if (!e.alive) continue;
    if (e.kind === ENEMY_BALLOON) drawSprite(ctx, art, BALLOON, e.x, e.y);
    else if (e.kind === ENEMY_COPTER) drawSprite(ctx, art, frameAt(COPTER_FRAMES, s.time, 10), e.x, e.y);
    else drawSprite(ctx, art, frameAt(DART_FRAMES, s.time, 8), e.x, e.y);
  }
  ctx.fillStyle = WHITE;
  for (const shot of s.shots) ctx.fillRect(Math.round(shot.x), Math.round(shot.y), 8, 2);
}

function drawDarkness(ctx: CanvasRenderingContext2D, room: Room): void {
  ctx.fillStyle = `rgba(0, 0, 0, ${DARK_ALPHA})`;
  ctx.beginPath();
  ctx.rect(0, 0, ROOM_W, ROOM_H);
  for (const o of room.objects) {
    if (o.type !== OBJECT.candle) continue;
    ctx.moveTo(o.x + o.w / 2 + CANDLE_LIGHT_RADIUS, o.y);
    ctx.arc(o.x + o.w / 2, o.y, CANDLE_LIGHT_RADIUS, 0, Math.PI * 2);
  }
  ctx.fill("evenodd");
}

function drawPlane(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  if (s.phase === "gameOver" || s.phase === "won") return;
  if (s.phase === "crashing" && s.crashTime >= CRASH_VISIBLE_SECONDS) return;
  if (s.phase === "ready" && s.opensWithFade) return;

  // Snap to whole room pixels, like the original, instead of gliding between them.
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  ctx.save();
  if (s.phase === "fadingIn") {
    const steps = Math.ceil((s.fadeTime / FADE_IN_SECONDS) * FADE_IN_STEPS);
    ctx.globalAlpha = Math.min(1, steps / FADE_IN_STEPS);
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x + PLANE_W / 2, FLOOR_SHADOW_Y, PLANE_W / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const frame = s.vx < 0 ? PLANE_TILTED_BACK : PLANE_FORWARD;
  drawSprite(ctx, art, frame, x + (PLANE_W - frame.w) / 2, y + (PLANE_H - frame.h) / 2);
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

function drawHud(ctx: CanvasRenderingContext2D, art: Art, s: GameState, room: Room): void {
  const roomNumber = s.roomIndex + 1;
  const { font } = art;
  drawPanel(ctx, HUD_NAME);
  font.draw(ctx, room.name, HUD_NAME.x + HUD_TEXT_INSET, HUD_TEXT_Y, RED);

  const paper = HUD_PAPER_BORDER;
  ctx.fillStyle = BLACK;
  ctx.fillRect(paper.x, paper.y, paper.w, paper.h);
  ctx.fillStyle = WHITE;
  ctx.fillRect(paper.x + 1, paper.y + 1, paper.w - 2, paper.h - 2);
  drawSprite(ctx, art, ROOM_NUMBER_PAPER, paper.x + 1, paper.y + 1);
  const number = String(roomNumber);
  font.draw(ctx, number, paper.x + Math.round((paper.w - 4 - font.measure(number)) / 2), HUD_TEXT_Y, BLACK);

  drawPanel(ctx, HUD_SCORE);
  font.draw(ctx, String(shownScoreTens(s)), HUD_SCORE.x + HUD_TEXT_INSET, HUD_TEXT_Y, CYAN);

  drawPanel(ctx, HUD_LIVES);
  const lives = String(s.lives);
  font.draw(ctx, lives, HUD_LIVES_TEXT_RIGHT - font.measure(lives), HUD_TEXT_Y, RED);
  let itemX = HUD_ITEMS_X;
  if (s.bands > 0) {
    drawSprite(ctx, art, BAND_ICON, itemX, HUD_ICON_Y - 1);
    font.draw(ctx, String(s.bands), itemX + 8, HUD_TEXT_Y, WHITE);
    itemX += 28;
  }
  if (s.energy > 0) {
    drawSprite(ctx, art, BATTERY_ICON, itemX, HUD_ICON_Y - 1);
    font.draw(ctx, String(Math.ceil(s.energy)), itemX + 10, HUD_TEXT_Y, WHITE);
  }
  const icons = Math.min(HUD_MAX_ICONS, Math.max(0, s.lives - 1));
  for (let i = 0; i < icons; i++) {
    drawSprite(ctx, art, PLANE_ICON, HUD_ICON_X + i * HUD_ICON_SPACING, HUD_ICON_Y);
  }
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
  room.objects.forEach((o, index) => drawObject(ctx, art, room, s, o, index));
  drawEnemies(ctx, art, s);
  if (isRoomDark(s, room)) drawDarkness(ctx, room);
  drawPlane(ctx, art, s);
  drawPopups(ctx, art, s);
  drawHud(ctx, art, s, room);
  drawMessage(ctx, art, s);
  ctx.restore();
}
