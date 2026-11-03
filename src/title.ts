import { CLOCK_SPRITE, DART, drawSprite } from "./render";
import type { Art, View } from "./render";
import { FADE_IN_SECONDS, ROOM_H, ROOM_W } from "./sim";
import type { GameState, Rect } from "./sim";

const CYAN = "#00ffff";
const MAGENTA = "#ff00ff";
const WHITE = "#ffffff";
const STEEL = "#808080";

const DISSOLVE_SECONDS = FADE_IN_SECONDS * 0.7;
const DISSOLVE_CELL = 16;

const TIP_SECONDS = 3.2;
const TIP_X = 306;
const TIP_Y = 34;
const TIP_LINE_HEIGHT = 16;
const PROMPT_Y = 320;
const PROMPT_BLINK_SECONDS = 0.6;

const WORDMARK_SCALE = 5;
const WORDMARK_X = 22;
const WORDMARK_Y = 18;
// The original title art's big paper plane and desk, under our own wordmark and tips.
const SCENE_TOP = 132;

interface Tip {
  sprite: Rect;
  lines: string[];
}

const BATTERY: Rect = { x: 148, y: 56, w: 13, h: 24 };
const BANDS: Rect = { x: 117, y: 53, w: 23, h: 22 };
const VENT: Rect = { x: 1, y: 84, w: 47, h: 12 };

const TIPS: Tip[] = [
  { sprite: DART, lines: ["Darts fly fast.", "Dodge them, or", "band one for 300."] },
  { sprite: VENT, lines: ["Air is your friend.", "Ride the vents up,", "or hit the floor."] },
  { sprite: CLOCK_SPRITE, lines: ["Clocks are points.", "Worth the risk?", "Usually."] },
  { sprite: BATTERY, lines: ["Batteries boost you.", "Hold Enter", "to burn one."] },
  { sprite: BANDS, lines: ["Rubber bands!", "Press Space", "to fire."] },
];

export function showsTitle(s: GameState): boolean {
  if (!s.opensWithFade) return false;
  return s.phase === "ready" || (s.phase === "fadingIn" && s.fadeTime < DISSOLVE_SECONDS);
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

/** Scales the bitmap font up, then dithers it from white into steel, like brushed metal. */
function drawWordmark(ctx: CanvasRenderingContext2D, art: Art): number {
  const text = "Glider";
  const width = art.font.measure(text);
  const [small, smallCtx] = makeCanvas(width, 16);
  art.font.draw(smallCtx, text, 0, 0, WHITE);

  const scaledW = width * WORDMARK_SCALE;
  const scaledH = 16 * WORDMARK_SCALE;
  const [large, largeCtx] = makeCanvas(scaledW, scaledH);
  largeCtx.drawImage(small, 0, 0, scaledW, scaledH);
  largeCtx.globalCompositeOperation = "source-atop";
  for (let y = 0; y < scaledH; y++) {
    for (let x = 0; x < scaledW; x++) {
      const threshold = (x + y) % 2 === 0 ? 0.35 : 0.75;
      largeCtx.fillStyle = y / scaledH > threshold ? STEEL : x % 7 === 0 ? CYAN : WHITE;
      largeCtx.fillRect(x, y, 1, 1);
    }
  }
  ctx.drawImage(large, WORDMARK_X, WORDMARK_Y);
  return WORDMARK_X + scaledW;
}

function buildBackdrop(art: Art): HTMLCanvasElement {
  const [canvas, ctx] = makeCanvas(ROOM_W, ROOM_H);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ROOM_W, ROOM_H);
  const sceneH = ROOM_H - SCENE_TOP;
  ctx.drawImage(art.titleScene, 0, SCENE_TOP, ROOM_W, sceneH, 0, SCENE_TOP, ROOM_W, sceneH);

  const wordmarkRight = drawWordmark(ctx, art);
  ctx.save();
  ctx.translate(wordmarkRight + 16, WORDMARK_Y + 30);
  ctx.rotate(Math.PI / 2);
  art.font.draw(ctx, "2026", 0, 0, CYAN);
  ctx.restore();
  art.font.draw(ctx, "A tribute to Glider 4.0", WORDMARK_X, WORDMARK_Y + 88, CYAN);

  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, ROOM_W - 1, ROOM_H - 1);
  ctx.strokeStyle = MAGENTA;
  ctx.strokeRect(1.5, 1.5, ROOM_W - 3, ROOM_H - 3);
  return canvas;
}

function drawTip(ctx: CanvasRenderingContext2D, art: Art, time: number): void {
  const tip = TIPS[Math.floor(time / TIP_SECONDS) % TIPS.length];
  tip.lines.forEach((line, index) => {
    art.font.draw(ctx, line, TIP_X, TIP_Y + index * TIP_LINE_HEIGHT, index === 0 ? WHITE : CYAN);
  });
  drawSprite(ctx, art, tip.sprite, TIP_X, TIP_Y + TIP_LINE_HEIGHT * 3 + 8);
}

function drawPrompt(ctx: CanvasRenderingContext2D, art: Art, time: number): void {
  if (Math.floor(time / PROMPT_BLINK_SECONDS) % 2 === 1) return;
  const text = "Press any key to fly";
  const x = Math.round(ROOM_W / 2 - art.font.measure(text) / 2);
  ctx.fillStyle = "#000000";
  ctx.fillRect(x - 8, PROMPT_Y - 3, art.font.measure(text) + 16, 20);
  art.font.draw(ctx, text, x, PROMPT_Y, WHITE);
}

/** A fixed random order for the blocks, so the dissolve looks scattered but never flickers. */
function dissolveOrder(columns: number, rows: number): number[] {
  const order = Array.from({ length: columns * rows }, (_, index) => index);
  let seed = 1994;
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export interface Title {
  draw(ctx: CanvasRenderingContext2D, s: GameState, view: View, ratio: number): void;
}

export function createTitle(art: Art): Title {
  const backdrop = buildBackdrop(art);
  const [layer, layerCtx] = makeCanvas(ROOM_W, ROOM_H);
  const columns = Math.ceil(ROOM_W / DISSOLVE_CELL);
  const rows = Math.ceil(ROOM_H / DISSOLVE_CELL);
  const order = dissolveOrder(columns, rows);

  return {
    draw(ctx, s, view, ratio) {
      layerCtx.drawImage(backdrop, 0, 0);
      drawTip(layerCtx, art, s.time);
      if (s.phase === "ready") drawPrompt(layerCtx, art, s.time);

      const scale = view.scale * ratio;
      ctx.setTransform(scale, 0, 0, scale, view.offsetX * ratio, view.offsetY * ratio);
      ctx.imageSmoothingEnabled = false;
      const progress = s.phase === "ready" ? 0 : s.fadeTime / DISSOLVE_SECONDS;
      const firstKept = Math.floor(progress * order.length);
      for (let i = firstKept; i < order.length; i++) {
        const x = (order[i] % columns) * DISSOLVE_CELL;
        const y = Math.floor(order[i] / columns) * DISSOLVE_CELL;
        ctx.drawImage(layer, x, y, DISSOLVE_CELL, DISSOLVE_CELL, x, y, DISSOLVE_CELL, DISSOLVE_CELL);
      }
    },
  };
}
