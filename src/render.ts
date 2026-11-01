import type { PixelFont } from "./pixelFont";
import {
  CRASH_VISIBLE_SECONDS,
  OBJECT_CLOCK,
  OBJECT_COMPUTER,
  OBJECT_TABLE,
  OBJECT_VENT,
  PLANE_H,
  PLANE_W,
  ROOM_H,
  ROOM_W,
} from "./sim";
import type { GameState, Room, RoomObject } from "./sim";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Positions on the original sprite sheet. The plane always faces right; the second frame is the
// same plane tilted back, which is how it flies backward.
const PLANE_FORWARD: Rect = { x: 2, y: 3, w: 44, h: 16 };
const PLANE_TILTED_BACK: Rect = { x: 1, y: 22, w: 46, h: 18 };
const PLANE_ICON: Rect = { x: 1, y: 319, w: 33, h: 13 };
const ROOM_NUMBER_PAPER: Rect = { x: 37, y: 319, w: 16, h: 21 };
const VENT: Rect = { x: 1, y: 84, w: 47, h: 12 };
const CLOCK: Rect = { x: 117, y: 1, w: 27, h: 28 };
const COMPUTER: Rect = { x: 266, y: 210, w: 43, h: 57 };
const TABLE_BASE: Rect = { x: 50, y: 24, w: 61, h: 20 };

const TILE_W = 64;
const PANEL_W = 64;
const FRAME_W = ROOM_W + PANEL_W * 2;
const FLOOR_SHADOW_Y = 332;
const TABLE_BASE_TOP = 317;

const AIR_W = 16;
const AIR_TILE = 8;
const AIR_STEP_PIXELS = 2;
const AIR_STEPS_PER_SECOND = 12;

// Scoreboard layout, measured from the original game in room pixels.
const HUD_NAME: Rect = { x: 3, y: 3, w: 159, h: 21 };
const HUD_SCORE: Rect = { x: 220, y: 3, w: 78, h: 21 };
const HUD_LIVES: Rect = { x: 302, y: 3, w: 208, h: 21 };
const HUD_PAPER_BORDER: Rect = { x: 165, y: 2, w: 18, h: 23 };
const HUD_TEXT_Y = 7;
const HUD_TEXT_INSET = 6;
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
  background: HTMLImageElement;
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
  ctx.drawImage(art.sprites, r.x, r.y, r.w, r.h, x, y, r.w, r.h);
}

function drawFrame(ctx: CanvasRenderingContext2D, art: Art): void {
  ctx.drawImage(art.panelLeft, -PANEL_W, 0);
  ctx.drawImage(art.panelRight, ROOM_W, 0);
}

function drawBackground(ctx: CanvasRenderingContext2D, art: Art, room: Room): void {
  room.tiles.forEach((tile, column) => {
    ctx.drawImage(art.background, tile * TILE_W, 0, TILE_W, ROOM_H, column * TILE_W, 0, TILE_W, ROOM_H);
  });
}

function drawAirColumn(ctx: CanvasRenderingContext2D, art: Art, vent: RoomObject, time: number): void {
  const left = vent.x + (vent.w - AIR_W) / 2;
  const height = vent.y - vent.amount;
  const rise = (Math.floor(time * AIR_STEPS_PER_SECOND) * AIR_STEP_PIXELS) % AIR_TILE;

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, vent.amount, AIR_W, height);
  ctx.clip();
  for (let y = vent.amount - rise; y < vent.y; y += AIR_TILE) {
    for (let x = left; x < left + AIR_W; x += AIR_TILE) {
      ctx.drawImage(art.airUp, x, y);
    }
  }
  ctx.restore();
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

/** Centers a sprite on its room rectangle and sits it on the rectangle's bottom edge. */
function drawOnRect(ctx: CanvasRenderingContext2D, art: Art, sprite: Rect, o: RoomObject): void {
  drawSprite(ctx, art, sprite, o.x + (o.w - sprite.w) / 2, o.y + o.h - sprite.h);
}

function drawObjects(ctx: CanvasRenderingContext2D, art: Art, room: Room, s: GameState): void {
  room.objects.forEach((o, index) => {
    if (o.type === OBJECT_VENT) {
      drawSprite(ctx, art, VENT, o.x, o.y);
      drawAirColumn(ctx, art, o, s.time);
    } else if (o.type === OBJECT_TABLE) {
      drawTable(ctx, art, o);
    } else if (o.type === OBJECT_COMPUTER) {
      drawOnRect(ctx, art, COMPUTER, o);
    } else if (o.type === OBJECT_CLOCK && !s.collected.has(index)) {
      drawOnRect(ctx, art, CLOCK, o);
    }
  });
}

function drawPlane(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  if (s.phase === "gameOver" || s.phase === "cleared") return;
  if (s.phase === "crashing" && s.crashTime >= CRASH_VISIBLE_SECONDS) return;

  // Snap to whole room pixels, like the original, instead of gliding between them.
  const x = Math.round(s.x);
  const y = Math.round(s.y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x + PLANE_W / 2, FLOOR_SHADOW_Y, PLANE_W / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const frame = s.vx < 0 ? PLANE_TILTED_BACK : PLANE_FORWARD;
  drawSprite(ctx, art, frame, x + (PLANE_W - frame.w) / 2, y + (PLANE_H - frame.h) / 2);
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

function drawHud(ctx: CanvasRenderingContext2D, art: Art, s: GameState, room: Room, roomNumber: number): void {
  const { font } = art;
  drawPanel(ctx, HUD_NAME);
  font.draw(ctx, room.name, HUD_NAME.x + HUD_TEXT_INSET, HUD_TEXT_Y, RED);

  const paper = HUD_PAPER_BORDER;
  ctx.fillStyle = BLACK;
  ctx.fillRect(paper.x, paper.y, paper.w, paper.h);
  ctx.fillStyle = WHITE;
  ctx.fillRect(paper.x + 1, paper.y + 1, paper.w - 2, paper.h - 2);
  drawSprite(ctx, art, ROOM_NUMBER_PAPER, paper.x + 1, paper.y + 1);
  font.draw(ctx, String(roomNumber), paper.x + 5, HUD_TEXT_Y, BLACK);

  drawPanel(ctx, HUD_SCORE);
  // Whole tens keep the count looking like a ticker rather than a blur of digits.
  const shownScore = Math.floor(s.shownScore / 10) * 10;
  font.draw(ctx, String(shownScore), HUD_SCORE.x + HUD_TEXT_INSET, HUD_TEXT_Y, CYAN);

  drawPanel(ctx, HUD_LIVES);
  const lives = String(s.lives);
  font.draw(ctx, lives, HUD_LIVES_TEXT_RIGHT - font.measure(lives), HUD_TEXT_Y, RED);
  const icons = Math.min(HUD_MAX_ICONS, Math.max(0, s.lives - 1));
  for (let i = 0; i < icons; i++) {
    drawSprite(ctx, art, PLANE_ICON, HUD_ICON_X + i * HUD_ICON_SPACING, HUD_ICON_Y);
  }
}

function drawMessage(ctx: CanvasRenderingContext2D, art: Art, s: GameState): void {
  const messages: Partial<Record<GameState["phase"], [string, string]>> = {
    ready: ["Press an arrow key to fly", "F: fullscreen   R: restart"],
    cleared: [`Room clear!  Score: ${s.score}`, "Press R to fly it again"],
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
  room: Room,
  roomNumber: number,
  s: GameState,
  view: View,
  ratio: number,
): void {
  const { width, height } = ctx.canvas;
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
  drawObjects(ctx, art, room, s);
  drawPlane(ctx, art, s);
  drawPopups(ctx, art, s);
  drawHud(ctx, art, s, room, roomNumber);
  drawMessage(ctx, art, s);
  ctx.restore();
}
