import { PixelFont } from "./pixelFont";
import type { FontMetrics } from "./pixelFont";
import { computeView, render } from "./render";
import type { Art, View } from "./render";
import { createGame, step } from "./sim";
import type { GameState, Input, Room } from "./sim";

// A low tick rate, drawn with no in-between frames, gives the original's slightly chunky motion.
const STEP_SECONDS = 1 / 30;
const MAX_FRAME_SECONDS = 0.1;
const WELCOME_ROOM = 0;

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const ctx = canvas.getContext("2d")!;

const input: Input = { left: false, right: false };
let game: GameState = createGame();
let view: View = computeView(window.innerWidth, window.innerHeight);
let ratio = window.devicePixelRatio;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Couldn't load ${src}. Run npm run import-assets first.`));
    image.src = src;
  });
}

async function loadFont(name: string): Promise<PixelFont> {
  const [atlas, metrics] = await Promise.all([
    loadImage(`assets/${name}.png`),
    fetch(`assets/${name}.json`).then((response) => response.json() as Promise<FontMetrics>),
  ]);
  return new PixelFont(atlas, metrics);
}

function resize(): void {
  ratio = window.devicePixelRatio;
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  view = computeView(window.innerWidth, window.innerHeight);
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen();
}

function handleKey(event: KeyboardEvent, down: boolean): void {
  const steering = event.code === "ArrowLeft" || event.code === "ArrowRight";
  if (event.code === "ArrowLeft") input.left = down;
  if (event.code === "ArrowRight") input.right = down;
  if (!down) return;

  if (steering || event.code === "Space") {
    event.preventDefault();
    if (game.phase === "ready") game.phase = "flying";
  }
  if (event.code === "KeyR") game = createGame();
  if (event.code === "KeyF") toggleFullscreen();
}

async function start(): Promise<void> {
  const [sprites, background, airUp, panelLeft, panelRight, font, smallFont, house] = await Promise.all([
    loadImage("assets/sprites.png"),
    loadImage("assets/back-200.png"),
    loadImage("assets/air-up.png"),
    loadImage("assets/panel-left.png"),
    loadImage("assets/panel-right.png"),
    loadFont("font"),
    loadFont("font-small"),
    fetch("assets/house.json").then((response) => response.json() as Promise<Room[]>),
  ]);
  const art: Art = { sprites, background, airUp, panelLeft, panelRight, font, smallFont };
  const room = house[WELCOME_ROOM];

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => handleKey(event, true));
  window.addEventListener("keyup", (event) => handleKey(event, false));
  window.addEventListener("blur", () => {
    input.left = false;
    input.right = false;
  });

  if (import.meta.env.DEV) {
    Object.assign(window, { glider: { get game() { return game; }, room, input } });
  }

  let last = performance.now();
  let pending = 0;
  const frame = (now: number): void => {
    pending += Math.min(MAX_FRAME_SECONDS, (now - last) / 1000);
    last = now;
    while (pending >= STEP_SECONDS) {
      step(game, room, input, STEP_SECONDS);
      pending -= STEP_SECONDS;
    }
    render(ctx, art, room, WELCOME_ROOM + 1, game, view, ratio);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

void start();
